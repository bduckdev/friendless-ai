// ============================================================================
// CORE TYPES (matching database schema)
// ============================================================================

export type Gender = "male" | "female" | "non_binary";

export type SubscriptionTier = "free" | "premium";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  gender: Gender | null;

  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  subscriptionCanceledAt: Date | null;

  // Usage tracking
  messagesUsedToday: number;
  dailyQuotaResetAt: Date;

  // Onboarding
  defaultFriendsSeeded: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MESSAGE
// ============================================================================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

// ============================================================================
// FRIEND
// ============================================================================

export interface Friend {
  id: string;
  name: string;
  avatar: string | null;
  personality: string;
  age: number | null;
  gender: Gender | null;
  traits?: string[];
  voice: string | null;
  background: string | null;
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendWithMessages extends Friend {
  messages: Message[];
}

// ============================================================================
// tRPC RESPONSE TYPES
// ============================================================================

/**
 * Friend with message count (from friend.getAll)
 */
export interface FriendWithCount extends Omit<Friend, "messages"> {
  messageCount: number;
}

/**
 * Paginated messages response (from message.getByFriend)
 */
export interface PaginatedMessages {
  messages: Message[];
  nextCursor?: string;
}

/**
 * Send message response (from message.send)
 */
export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

/**
 * User statistics (from user.getStats)
 */
export interface UserStats {
  totalFriends: number;
  totalMessages: number;
  accountAge: number;
  mostActiveFriend: {
    id: string;
    name: string;
    messageCount: number;
  } | null;
}

/**
 * User profile (from user.getProfile)
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  gender: Gender | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus | null;
  messagesUsedToday: number;
  dailyQuotaResetAt: Date;
  createdAt: Date;
}

/**
 * Friend deletion response (from friend.delete)
 */
export interface DeleteFriendResponse {
  success: boolean;
  deletedId: string;
}

/**
 * Message rollback deletion response (from message.deleteRollback)
 */
export interface DeleteRollbackResponse {
  success: boolean;
  deletedIds: string[]; // [assistantMessageId, userMessageId?]
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Rate limit configuration by tier
 */
export interface RateLimits {
  messageLimit: number; // -1 for unlimited
  friendLimit: number;
}

/**
 * Usage information (for displaying to user)
 */
export interface UsageInfo {
  messagesUsedToday: number;
  dailyLimit: number;
  resetAt: Date;
  tier: SubscriptionTier;
}
