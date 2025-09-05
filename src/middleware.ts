import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/search(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Allow access to public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req) && !userId) {
    // Redirect to sign-in with the current URL as redirect target
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