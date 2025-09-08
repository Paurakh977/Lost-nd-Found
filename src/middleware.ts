import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getJWTFromRequest, verifyJWT } from './lib/jwt'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/search(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

// Define routes that require admin access
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

// Define routes that require officer access
const isOfficerRoute = createRouteMatcher([
  '/officer(.*)',
])

// Define routes that require institutional access
const isInstitutionalRoute = createRouteMatcher([
  '/institutional(.*)',
])

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/admin/init',
])

// Custom auth check function
async function checkCustomAuth(req: NextRequest) {
  const token = getJWTFromRequest(req);
  if (!token) return null;
  
  const payload = await verifyJWT(token);
  if (!payload) return null;
  
  // Note: We can't check isActive in middleware without DB access
  // This is handled in the sign-in API and individual route handlers
  return payload;
}

// Role-based access control
function hasRoleAccess(userRole: string, pathname: string): boolean {
  // Admin can access everything except officer/institutional specific routes
  if (userRole === 'admin') {
    return !isOfficerRoute({ nextUrl: { pathname } } as NextRequest) && 
           !isInstitutionalRoute({ nextUrl: { pathname } } as NextRequest);
  }
  
  // Officer can only access officer routes and general protected routes
  if (userRole === 'officer') {
    return isOfficerRoute({ nextUrl: { pathname } } as NextRequest) || 
           isProtectedRoute({ nextUrl: { pathname } } as NextRequest);
  }
  
  // Institutional can only access institutional routes and general protected routes
  if (userRole === 'institutional') {
    return isInstitutionalRoute({ nextUrl: { pathname } } as NextRequest) || 
           isProtectedRoute({ nextUrl: { pathname } } as NextRequest);
  }
  
  return false;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Allow access to public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Check if it's a role-specific route first
  if (isAdminRoute(req) || isOfficerRoute(req) || isInstitutionalRoute(req)) {
    // For role-specific routes, only check custom auth
    const customUser = await checkCustomAuth(req);
    
    if (!customUser) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // Check role-based access
    if (!hasRoleAccess(customUser.role, pathname)) {
      // Redirect to appropriate dashboard based on role
      let dashboardUrl = '/';
      switch (customUser.role) {
        case 'admin':
          dashboardUrl = '/admin/dashboard';
          break;
        case 'officer':
          dashboardUrl = '/officer/dashboard';
          break;
        case 'institutional':
          dashboardUrl = '/institutional/dashboard';
          break;
      }
      return NextResponse.redirect(new URL(dashboardUrl, req.url))
    }
    
    return NextResponse.next()
  }

  // For general protected routes, check both Clerk and custom auth
  if (isProtectedRoute(req)) {
    // Check Clerk auth first
    if (userId) {
      return NextResponse.next()
    }
    
    // Check custom auth as fallback
    const customUser = await checkCustomAuth(req);
    if (customUser) {
      return NextResponse.next()
    }
    
    // Neither auth method succeeded
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // For all other routes, use default Clerk behavior
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}