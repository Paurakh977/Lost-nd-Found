import mongoose from 'mongoose';
import Notification from '../models/Notification';
import type { NotificationType } from '../models/Notification';

export interface CreateNotificationParams {
  officerId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  caseId?: string | mongoose.Types.ObjectId;
  claimId?: string | mongoose.Types.ObjectId;
  metadata?: {
    caseTitle?: string;
    caseType?: string;
    claimantName?: string;
    claimantEmail?: string;
    [key: string]: any;
  };
}

/**
 * Create a notification for an officer
 * 
 * This is a fire-and-forget function that logs errors but doesn't throw them
 * to avoid breaking the main business logic if notification creation fails
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const notification = new Notification({
      officerId: typeof params.officerId === 'string' 
        ? new mongoose.Types.ObjectId(params.officerId) 
        : params.officerId,
      type: params.type,
      message: params.message,
      caseId: params.caseId 
        ? (typeof params.caseId === 'string' 
          ? new mongoose.Types.ObjectId(params.caseId) 
          : params.caseId)
        : undefined,
      claimId: params.claimId 
        ? (typeof params.claimId === 'string' 
          ? new mongoose.Types.ObjectId(params.claimId) 
          : params.claimId)
        : undefined,
      read: false,
      metadata: params.metadata || {}
    });

    await notification.save();
    
    console.log(`[Notification] Created ${params.type} notification for officer ${params.officerId}`);
  } catch (error) {
    // Log error but don't throw - notifications should not break main business logic
    console.error('[Notification] Failed to create notification:', error);
  }
}

/**
 * Helper function to generate notification messages based on type
 */
export function generateNotificationMessage(
  type: NotificationType,
  metadata: CreateNotificationParams['metadata'] = {}
): string {
  switch (type) {
    case 'case_assigned':
      return `New case assigned: ${metadata.caseTitle || 'Untitled case'}`;
    
    case 'verification_required':
      return `Verification required for case: ${metadata.caseTitle || 'Untitled case'}`;
    
    case 'new_claim':
      return `New claim submitted for case: ${metadata.caseTitle || 'Untitled case'}${metadata.claimantName ? ` by ${metadata.claimantName}` : ''}`;
    
    case 'case_resolved':
      return `Case resolved: ${metadata.caseTitle || 'Untitled case'}`;
    
    default:
      return 'New notification';
  }
}

/**
 * Create a notification with auto-generated message
 */
export async function createNotificationWithAutoMessage(
  params: Omit<CreateNotificationParams, 'message'>
): Promise<void> {
  const message = generateNotificationMessage(params.type, params.metadata);
  await createNotification({ ...params, message });
}
