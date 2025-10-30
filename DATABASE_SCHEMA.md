# Database Schema Implementation

## Overview

This document summarizes the database schema implemented for the friendless application, which includes support for AI companions (Friends), chat messages, and a subscription/billing system.

## Schema Summary

### Models Created

1. **User** (Extended from NextAuth)
   - Basic auth fields: id, name, email, emailVerified, image
   - Subscription fields: tier, status, Stripe IDs, dates
   - Usage tracking: messagesUsedToday, dailyQuotaResetAt
   - Timestamps: createdAt, updatedAt

2. **Friend** (AI Companions)
   - Basic info: name, avatar
   - Personality: personality, traits, voice, background, interests
   - Relationships: userId (owner)
   - Timestamps: createdAt, updatedAt

3. **Message** (Chat History)
   - Content: content, role (user/assistant)
   - Relationships: userId, friendId
   - Timestamp: createdAt

4. **Account, Session, VerificationToken** (NextAuth required)

## Subscription Tiers

### Free Tier
- 100 messages per day
- Unlimited AI friends
- Basic personality customization
- Message history

### Premium Tier ($15/month)
- Unlimited messages
- Unlimited AI friends
- Advanced personality customization
- Priority support
- Early access to new features

## Rate Limiting Implementation

The schema includes built-in rate limiting for free tier users:

- `messagesUsedToday`: Tracks daily message count
- `dailyQuotaResetAt`: Timestamp for when quota resets (24 hours)
- Premium users (`subscriptionTier = "premium"`) bypass rate limits

## Indexing Strategy

Optimized indexes for common queries:

### User
- `email` - Login lookups
- `stripeCustomerId` - Webhook processing
- `subscriptionTier` - Permission checks

### Friend
- `userId` - Get user's friends
- `createdAt` - Sort by creation

### Message
- `userId` - All user messages
- `friendId` - Conversation history
- `createdAt` - Time-based sorting
- `[userId, createdAt]` - Composite for user timeline
- `[friendId, createdAt]` - Composite for conversation retrieval

## Migration Notes

### Changes Applied
- ✅ Removed Post model (starter code)
- ✅ Added subscription fields to User
- ✅ Created Friend model
- ✅ Created Message model
- ✅ Added all necessary indexes
- ✅ Updated Prisma client

### Files Modified
- `prisma/schema.prisma` - Complete schema update
- `src/server/api/root.ts` - Removed post router
- `src/server/api/routers/post.ts` - Deleted (no longer needed)
- `src/app/_components/post.tsx` - Deleted (no longer needed)

### Files Created
- `src/server/api/routers/health.ts` - Simple health check endpoint
- `prisma/schema.prisma.backup` - Backup of original schema

## Next Steps

To complete the subscription implementation:

1. **Create tRPC Routers**
   - `subscription.ts` - Rate limit checks, subscription status
   - `friend.ts` - CRUD operations for friends
   - `message.ts` - Send/receive messages with quota enforcement

2. **Stripe Integration**
   - Set up Stripe webhook handler
   - Implement checkout session creation
   - Handle subscription lifecycle events

3. **UI Components**
   - Usage indicator component (show remaining messages)
   - Upgrade prompts when quota exceeded
   - Subscription management in profile page

4. **Business Logic**
   - Enforce rate limits in message sending
   - Reset daily quotas automatically
   - Handle subscription upgrades/downgrades

## Database Access Examples

```typescript
// Check if user can send message
const user = await db.user.findUnique({
  where: { id: userId },
  select: {
    subscriptionTier: true,
    messagesUsedToday: true,
    dailyQuotaResetAt: true,
  },
});

const canSend = user.subscriptionTier === 'premium' || 
                user.messagesUsedToday < 100;

// Get user's friends
const friends = await db.friend.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
});

// Get conversation history
const messages = await db.message.findMany({
  where: { friendId, userId },
  orderBy: { createdAt: 'asc' },
  take: 50,
});
```

## Verification

✅ Schema validated and pushed to database
✅ Prisma Client regenerated
✅ TypeScript compilation successful
✅ Production build successful
✅ All routes accessible

## Backup

Original schema backed up to: `prisma/schema.prisma.backup`
