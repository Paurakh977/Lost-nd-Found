import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import Claim from '../../../../models/Claim';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { isOfficer } from '../../../../lib/query-utils';
import { OfficerReportResponse, OfficerCaseReportData, OfficerClaimReportData } from '../../../../types/reports';

/**
 * GET /api/officer/reports
 * 
 * Fetches comprehensive reports for the authenticated officer's assigned cases and related claims
 * Query Parameters:
 * - caseType: 'all' | 'lost' | 'found' | 'verification'
 * - caseStatus: 'all' | 'pending' | 'active' | 'resolved'
 * - claimStatus: 'all' | 'pending' | 'approved' | 'rejected'
 * - caseCreatedFrom, caseCreatedTo: case creation date filters (ISO strings)
 * - reportedTimeFrom, reportedTimeTo: reported time filters (ISO strings)
 * - page, limit: pagination
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify officer role
    const token = getJWTFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const payload = await verifyJWT(token);
    if (!payload || !isOfficer(payload.role)) {
      return NextResponse.json(
        { success: false, error: 'Officer access required' },
        { status: 403 }
      );
    }
    
    // Verify officer user is still active
    const officerUser = await User.findById(payload.userId).select('-password');
    if (!officerUser || !officerUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Officer account is inactive' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Build case filters
    const caseFilters: any = { assignedOfficer: payload.userId };
    
    // Case type filter
    const caseType = searchParams.get('caseType');
    if (caseType && caseType !== 'all') {
      caseFilters.type = caseType;
    }
    
    // Case status filter
    const caseStatus = searchParams.get('caseStatus');
    if (caseStatus && caseStatus !== 'all') {
      caseFilters.status = caseStatus;
    }
    
    // Case creation date filters
    const caseCreatedFrom = searchParams.get('caseCreatedFrom');
    const caseCreatedTo = searchParams.get('caseCreatedTo');
    if (caseCreatedFrom || caseCreatedTo) {
      caseFilters.createdAt = {};
      if (caseCreatedFrom) caseFilters.createdAt.$gte = new Date(caseCreatedFrom);
      if (caseCreatedTo) caseFilters.createdAt.$lte = new Date(caseCreatedTo);
    }
    
    // Reported time filters
    const reportedTimeFrom = searchParams.get('reportedTimeFrom');
    const reportedTimeTo = searchParams.get('reportedTimeTo');
    if (reportedTimeFrom || reportedTimeTo) {
      caseFilters.reportedTime = {};
      if (reportedTimeFrom) caseFilters.reportedTime.$gte = new Date(reportedTimeFrom);
      if (reportedTimeTo) caseFilters.reportedTime.$lte = new Date(reportedTimeTo);
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Fetch cases assigned to this officer
    const [cases, totalCases] = await Promise.all([
      Case.find(caseFilters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedOfficer', 'firstName lastName email')
        .lean(),
      Case.countDocuments(caseFilters),
    ]);
    
    // Get case IDs for fetching related claims
    const caseIds = cases.map((c: any) => c._id);
    
    // Build claim filters
    const claimFilters: any = { caseId: { $in: caseIds } };
    
    // Claim status filter
    const claimStatus = searchParams.get('claimStatus');
    if (claimStatus && claimStatus !== 'all') {
      claimFilters.status = claimStatus;
    }
    
    // Fetch all claims related to these cases
    const claims = await Claim.find(claimFilters)
      .sort({ createdAt: -1 })
      .lean();
    
    // Populate reviewedBy for claims
    const claimsWithReviewers: OfficerClaimReportData[] = [];
    for (const claim of claims) {
      const claimData: any = { ...claim };
      
      // Find the case title
      const relatedCase = cases.find((c: any) => c._id.toString() === claim.caseId.toString());
      if (relatedCase) {
        claimData.caseTitle = (relatedCase as any).title;
        claimData.caseType = (relatedCase as any).type;
      }
      
      // Populate reviewedBy
      if (claim.reviewedBy) {
        try {
          const reviewer = await User.findById(claim.reviewedBy)
            .select('firstName lastName email')
            .lean();
          if (reviewer) {
            claimData.reviewedBy = reviewer;
          }
        } catch (err) {
          console.error('[Officer Reports] Error populating reviewedBy:', err);
        }
      }
      
      claimsWithReviewers.push(claimData as OfficerClaimReportData);
    }
    
    // Populate resolvedBy for cases
    const casesWithResolvers: OfficerCaseReportData[] = [];
    for (const caseDoc of cases) {
      const caseData: any = { ...caseDoc };
      
      // Count related claims
      const caseClaimsCount = claimsWithReviewers.filter(
        (cl) => cl.caseId.toString() === caseData._id.toString()
      ).length;
      caseData.claimsCount = caseClaimsCount;
      
      // Populate resolvedBy
      if (caseData.resolution && caseData.resolution.resolvedBy) {
        try {
          const resolver = await User.findById(caseData.resolution.resolvedBy)
            .select('firstName lastName email')
            .lean();
          if (resolver) {
            caseData.resolution.resolvedBy = resolver;
          }
        } catch (err) {
          console.error('[Officer Reports] Error populating resolvedBy:', err);
        }
      }
      
      casesWithResolvers.push(caseData as OfficerCaseReportData);
    }
    
    // Build response
    const response: OfficerReportResponse = {
      success: true,
      data: {
        cases: casesWithResolvers,
        claims: claimsWithReviewers,
      },
      summary: {
        totalCases,
        totalClaims: claimsWithReviewers.length,
        filteredCases: casesWithResolvers.length,
        filteredClaims: claimsWithReviewers.length,
        page,
        limit,
        totalPages: Math.ceil(totalCases / limit),
      },
      officer: {
        id: officerUser._id.toString(),
        firstName: officerUser.firstName,
        lastName: officerUser.lastName,
        email: officerUser.email,
        department: officerUser.department,
      },
    };
    
    console.log(`[Officer Reports] Generated report for ${officerUser.email}: ${totalCases} cases, ${claimsWithReviewers.length} claims`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Officer Reports] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
