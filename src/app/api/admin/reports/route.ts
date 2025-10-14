import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Case from '../../../../models/Case';
import Claim from '../../../../models/Claim';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { OfficerReportData, InstitutionalUserData, ReportResponse } from '../../../../types/reports';

/**
 * GET /api/admin/reports
 * 
 * Fetches comprehensive reports for officers or institutional users with advanced filtering
 * Query Parameters:
 * - type: 'officer' | 'institutional' (required)
 * - userIds: comma-separated user IDs
 * - departments: comma-separated departments (officers only)
 * - institutions: comma-separated institutions (institutional only)
 * - province, district, municipality, ward: location filters
 * - isActive: 'true' | 'false'
 * - dateFrom, dateTo: case date range filters
 * - createdAfter, createdBefore: user account creation filters
 * - lastLoginAfter, lastLoginBefore: last login filters
 * - minResolutionRate, maxResolutionRate: performance filters (officers only)
 * - minCasesResolved, maxCasesResolved: performance filters (officers only)
 * - minActiveCases, maxActiveCases: workload filters (officers only)
 * - page, limit: pagination
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    const token = getJWTFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin user is still active
    const adminUser = await User.findById(payload.userId).select('-password');
    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Admin account is inactive' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'officer' or 'institutional'
    
    if (!type || (type !== 'officer' && type !== 'institutional')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing report type. Must be "officer" or "institutional"' },
        { status: 400 }
      );
    }
    
    // Parse filters
    const filters: any = {};
    filters.role = type;
    
    // User IDs filter
    const userIdsParam = searchParams.get('userIds');
    if (userIdsParam) {
      filters._id = { $in: userIdsParam.split(',') };
    }
    
    // Department/Institution filters
    if (type === 'officer') {
      const departmentsParam = searchParams.get('departments');
      if (departmentsParam) {
        filters.department = { $in: departmentsParam.split(',') };
      }
    } else {
      const institutionsParam = searchParams.get('institutions');
      if (institutionsParam) {
        filters.institutionName = { $in: institutionsParam.split(',') };
      }
    }
    
    // Location filters (hierarchical)
    const province = searchParams.get('province');
    const district = searchParams.get('district');
    const municipality = searchParams.get('municipality');
    const ward = searchParams.get('ward');
    
    if (province) filters['address.province'] = province;
    if (district) filters['address.district'] = district;
    if (municipality) filters['address.municipality'] = municipality;
    if (ward) filters['address.ward'] = ward;
    
    // Status filter
    const isActiveParam = searchParams.get('isActive');
    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === 'true';
    }
    
    // User creation date filters
    const createdAfter = searchParams.get('createdAfter');
    const createdBefore = searchParams.get('createdBefore');
    if (createdAfter || createdBefore) {
      filters.createdAt = {};
      if (createdAfter) filters.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) filters.createdAt.$lte = new Date(createdBefore);
    }
    
    // Last login filters
    const lastLoginAfter = searchParams.get('lastLoginAfter');
    const lastLoginBefore = searchParams.get('lastLoginBefore');
    if (lastLoginAfter || lastLoginBefore) {
      filters.lastLogin = {};
      if (lastLoginAfter) filters.lastLogin.$gte = new Date(lastLoginAfter);
      if (lastLoginBefore) filters.lastLogin.$lte = new Date(lastLoginBefore);
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Fetch users matching filters
    const users = await User.find(filters)
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalUsers = await User.countDocuments(filters);
    
    // Generate report data based on type
    let reportData: OfficerReportData[] | InstitutionalUserData[];
    
    if (type === 'officer') {
      reportData = await generateOfficerReports(users, searchParams);
    } else {
      reportData = await generateInstitutionalReports(users);
    }
    
    // Apply performance filters for officers (post-aggregation)
    if (type === 'officer') {
      const minResolutionRate = searchParams.get('minResolutionRate');
      const maxResolutionRate = searchParams.get('maxResolutionRate');
      const minCasesResolved = searchParams.get('minCasesResolved');
      const maxCasesResolved = searchParams.get('maxCasesResolved');
      const minActiveCases = searchParams.get('minActiveCases');
      const maxActiveCases = searchParams.get('maxActiveCases');
      
      reportData = (reportData as OfficerReportData[]).filter((officer) => {
        if (minResolutionRate && officer.resolutionRate < parseFloat(minResolutionRate)) return false;
        if (maxResolutionRate && officer.resolutionRate > parseFloat(maxResolutionRate)) return false;
        if (minCasesResolved && officer.resolvedCases < parseInt(minCasesResolved)) return false;
        if (maxCasesResolved && officer.resolvedCases > parseInt(maxCasesResolved)) return false;
        if (minActiveCases && officer.activeCases < parseInt(minActiveCases)) return false;
        if (maxActiveCases && officer.activeCases > parseInt(maxActiveCases)) return false;
        return true;
      });
    }
    
    // Build response
    const response: ReportResponse<typeof reportData[0]> = {
      success: true,
      data: reportData,
      summary: {
        totalRecords: totalUsers,
        filteredRecords: reportData.length,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Admin Reports] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}

/**
 * Generate comprehensive officer reports with case and claim statistics
 */
async function generateOfficerReports(
  officers: any[],
  searchParams: URLSearchParams
): Promise<OfficerReportData[]> {
  // Date range filters for case statistics
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  
  const caseFilter: any = {};
  if (dateFrom || dateTo) {
    caseFilter.createdAt = {};
    if (dateFrom) caseFilter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) caseFilter.createdAt.$lte = new Date(dateTo);
  }
  
  const reports: OfficerReportData[] = [];
  
  // Calculate week and month boundaries
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  for (const officer of officers) {
    const officerId = officer._id.toString();
    
    // Fetch all cases assigned to this officer
    const casesQuery = { ...caseFilter, assignedOfficer: officer._id };
    const cases = await Case.find(casesQuery).lean();
    
    // Calculate case statistics
    const totalCasesAssigned = cases.length;
    const activeCases = cases.filter((c: any) => c.status === 'active').length;
    const resolvedCases = cases.filter((c: any) => c.status === 'resolved').length;
    const pendingCases = cases.filter((c: any) => c.status === 'pending').length;
    
    // Case type breakdown
    const lostCases = cases.filter((c: any) => c.type === 'lost').length;
    const foundCases = cases.filter((c: any) => c.type === 'found').length;
    const verificationCases = cases.filter((c: any) => c.type === 'verification').length;
    
    // Performance metrics
    const resolutionRate = totalCasesAssigned > 0 
      ? (resolvedCases / totalCasesAssigned) * 100 
      : 0;
    
    // Calculate average resolution time
    const resolvedCasesWithTime = cases.filter(
      (c: any) => c.status === 'resolved' && c.resolution?.resolvedAt
    );
    let averageResolutionTime: number | undefined;
    
    if (resolvedCasesWithTime.length > 0) {
      const totalResolutionTime = resolvedCasesWithTime.reduce((sum: number, c: any) => {
        const createdAt = new Date(c.createdAt).getTime();
        const resolvedAt = new Date(c.resolution.resolvedAt).getTime();
        const days = (resolvedAt - createdAt) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageResolutionTime = totalResolutionTime / resolvedCasesWithTime.length;
    }
    
    // Cases resolved this week and month
    const casesResolvedThisWeek = cases.filter(
      (c: any) => c.status === 'resolved' && 
                  c.resolution?.resolvedAt && 
                  new Date(c.resolution.resolvedAt) >= weekStart
    ).length;
    
    const casesResolvedThisMonth = cases.filter(
      (c: any) => c.status === 'resolved' && 
                  c.resolution?.resolvedAt && 
                  new Date(c.resolution.resolvedAt) >= monthStart
    ).length;
    
    // Fetch claim statistics
    const claims = await Claim.find({ reviewedBy: officer._id }).lean();
    const claimsReviewed = claims.length;
    const claimsApproved = claims.filter((cl: any) => cl.status === 'approved').length;
    const claimsRejected = claims.filter((cl: any) => cl.status === 'rejected').length;
    const claimsPending = claims.filter((cl: any) => cl.status === 'pending').length;
    
    reports.push({
      userId: officerId,
      firstName: officer.firstName,
      lastName: officer.lastName,
      email: officer.email,
      department: officer.department,
      isActive: officer.isActive,
      address: officer.address,
      createdAt: officer.createdAt,
      lastLogin: officer.lastLogin,
      
      totalCasesAssigned,
      activeCases,
      resolvedCases,
      pendingCases,
      
      lostCases,
      foundCases,
      verificationCases,
      
      resolutionRate,
      averageResolutionTime,
      casesResolvedThisWeek,
      casesResolvedThisMonth,
      
      claimsReviewed,
      claimsApproved,
      claimsRejected,
      claimsPending,
    });
  }
  
  return reports;
}

/**
 * Generate institutional user reports with case and claim statistics
 */
async function generateInstitutionalReports(
  users: any[]
): Promise<InstitutionalUserData[]> {
  const reports: InstitutionalUserData[] = [];
  
  for (const user of users) {
    const userId = user._id.toString();
    
    // Fetch all cases reported by this institutional user (via Clerk ID)
    // Note: Institutional users create cases as regular users, not as assigned officers
    // We need to find cases where reportedBy.clerkId matches this user's clerkId or email
    // Since institutional users don't have a clerkId stored, we'll use email matching
    const cases = await Case.find({ 
      $or: [
        { 'reportedBy.email': user.email },
        { 'reportedBy.clerkId': userId } // In case some users have clerkId
      ]
    }).lean();
    
    // Calculate case statistics
    const totalCasesReported = cases.length;
    const lostCases = cases.filter((c: any) => c.type === 'lost').length;
    const foundCases = cases.filter((c: any) => c.type === 'found').length;
    const verificationCases = cases.filter((c: any) => c.type === 'verification').length;
    const activeCases = cases.filter((c: any) => c.status === 'active').length;
    const pendingCases = cases.filter((c: any) => c.status === 'pending').length;
    const resolvedCases = cases.filter((c: any) => c.status === 'resolved').length;
    
    // Fetch claims filed by this institutional user
    // Claims are linked via claimantInfo.email or clerkUserId
    const claims = await Claim.find({
      $or: [
        { 'claimantInfo.email': user.email },
        { clerkUserId: userId }
      ]
    }).lean();
    
    const totalClaimsFiled = claims.length;
    const claimsApproved = claims.filter((cl: any) => cl.status === 'approved').length;
    const claimsRejected = claims.filter((cl: any) => cl.status === 'rejected').length;
    const claimsPending = claims.filter((cl: any) => cl.status === 'pending').length;
    
    reports.push({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      institutionName: user.institutionName,
      isActive: user.isActive,
      address: user.address,
      createdAt: user.createdAt,
      
      totalCasesReported,
      lostCases,
      foundCases,
      verificationCases,
      activeCases,
      pendingCases,
      resolvedCases,
      
      totalClaimsFiled,
      claimsApproved,
      claimsRejected,
      claimsPending,
    });
  }
  
  return reports;
}
