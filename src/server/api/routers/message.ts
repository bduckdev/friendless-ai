import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCompletion, getCompletionStreaming } from "~/server/lib/openai";
import type { FriendWithMessages } from "~/types";
import { _ } from "node_modules/@faker-js/faker/dist/airline-DF6RqYmq";

// Validation schemas
const SendMessageSchema = z.object({
    friendId: z.string().cuid(),
    content: z.string().min(1).max(2000),
});

const GetByFriendSchema = z.object({
    friendId: z.string().cuid(),
    limit: z.number().int().min(1).max(100).default(50),
    cursor: z.string().optional(),
});

// Rate limits by tier
const MESSAGE_LIMITS = {
    free: 50,
    premium: -1, // unlimited
};

export const messageRouter = createTRPCRouter({
    sendStreaming: protectedProcedure
        .input(SendMessageSchema)
        .mutation(async function*({ ctx, input }) {
            const userId = ctx.session.user.id;
            const friend = await ctx.db.friend.findUnique({
                where: { id: input.friendId },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                        take: 50, // Last 50 messages for context
                    },
                },
            });

            if (!friend) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Friend not found",
                });
            }

            if (friend.userId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You don't have access to this friend",
                });
            }

            // Check rate limits
            const user = await ctx.db.user.findUnique({
                where: { id: userId },
                select: {
                    subscriptionTier: true,
                    messagesUsedToday: true,
                    dailyQuotaResetAt: true,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Reset daily quota if needed
            const now = new Date();
            const resetAt = new Date(user.dailyQuotaResetAt);
            if (now > resetAt) {
                await ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        messagesUsedToday: 0,
                        dailyQuotaResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                    },
                });
            }

            const limit =
                MESSAGE_LIMITS[user.subscriptionTier as keyof typeof MESSAGE_LIMITS] ??
                MESSAGE_LIMITS.free;

            if (limit !== -1 && user.messagesUsedToday >= limit) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `Daily message limit reached (${limit} messages). ${user.subscriptionTier === "free" ? "Upgrade to premium for unlimited messages." : ""}`,
                });
            }

            const friendData = friend as unknown as Record<string, unknown>;
            const friendForAI: FriendWithMessages = {
                id: friend.id,
                name: friend.name,
                avatar: friend.avatar,
                personality: friend.personality,
                age: friend.age,
                gender: (friendData.gender ??
                    undefined) as FriendWithMessages["gender"],
                traits: friend.traits ?? undefined,
                voice: friend.voice,
                background: friend.background,
                interests: friend.interests,
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt,
                messages: friend.messages.map((m) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant" | "system",
                    content: m.content,
                    createdAt: m.createdAt,
                })),
            };

            const res = await getCompletionStreaming(friendForAI, input.content);
            if (!res.body) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No response body' });

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let newMessage = "";

            try {
                while (true) {
                    const { value, done } = await reader.read()
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    newMessage += text;

                    yield { type: "delta" as const, text }
                }
                newMessage += decoder.decode()
            } finally {
                reader.releaseLock()
            }


            // Save user message
            await ctx.db.message.create({
                data: {
                    content: input.content,
                    role: "user",
                    userId,
                    friendId: input.friendId,
                },
            });

            const assistantMessage = await ctx.db.message.create({
                data: {
                    content: newMessage,
                    role: "assistant",
                    userId,
                    friendId: input.friendId,
                },
            });

            yield { type: "final", assistantMessage }
            // Increment message counter and update friend's updatedAt
            await Promise.all([
                ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        messagesUsedToday: { increment: 1 },
                    },
                }),
                ctx.db.friend.update({
                    where: { id: input.friendId },
                    data: {
                        updatedAt: new Date(),
                    },
                }),
            ]);
            return;
        }),
    send: protectedProcedure
        .input(SendMessageSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Get friend and verify ownership
            const friend = await ctx.db.friend.findUnique({
                where: { id: input.friendId },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                        take: 50, // Last 50 messages for context
                    },
                },
            });

            if (!friend) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Friend not found",
                });
            }

            if (friend.userId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You don't have access to this friend",
                });
            }

            // Check rate limits
            const user = await ctx.db.user.findUnique({
                where: { id: userId },
                select: {
                    subscriptionTier: true,
                    messagesUsedToday: true,
                    dailyQuotaResetAt: true,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Reset daily quota if needed
            const now = new Date();
            const resetAt = new Date(user.dailyQuotaResetAt);
            if (now > resetAt) {
                await ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        messagesUsedToday: 0,
                        dailyQuotaResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                    },
                });
            }

            const limit =
                MESSAGE_LIMITS[user.subscriptionTier as keyof typeof MESSAGE_LIMITS] ??
                MESSAGE_LIMITS.free;

            if (limit !== -1 && user.messagesUsedToday >= limit) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `Daily message limit reached (${limit} messages). ${user.subscriptionTier === "free" ? "Upgrade to premium for unlimited messages." : ""}`,
                });
            }

            // Save user message
            const userMessage = await ctx.db.message.create({
                data: {
                    content: input.content,
                    role: "user",
                    userId,
                    friendId: input.friendId,
                },
            });

            // Get AI response
            let aiResponseContent: string;
            try {
                // Convert Prisma friend to our Friend type
                const friendData = friend as unknown as Record<string, unknown>;
                const friendForAI: FriendWithMessages = {
                    id: friend.id,
                    name: friend.name,
                    avatar: friend.avatar,
                    personality: friend.personality,
                    age: friend.age,
                    gender: (friendData.gender ??
                        undefined) as FriendWithMessages["gender"],
                    traits: friend.traits ?? undefined,
                    voice: friend.voice,
                    background: friend.background,
                    interests: friend.interests,
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt,
                    messages: friend.messages.map((m) => ({
                        id: m.id,
                        role: m.role as "user" | "assistant" | "system",
                        content: m.content,
                        createdAt: m.createdAt,
                    })),
                };

                aiResponseContent = await getCompletion(friendForAI, input.content);
            } catch (error) {
                console.error("Failed to get AI response:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate AI response",
                });
            }

            // Save AI response
            const assistantMessage = await ctx.db.message.create({
                data: {
                    content: aiResponseContent,
                    role: "assistant",
                    userId,
                    friendId: input.friendId,
                },
            });

            // Increment message counter and update friend's updatedAt
            await Promise.all([
                ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        messagesUsedToday: { increment: 1 },
                    },
                }),
                ctx.db.friend.update({
                    where: { id: input.friendId },
                    data: {
                        updatedAt: new Date(),
                    },
                }),
            ]);

            return {
                userMessage,
                assistantMessage,
            };
        }),

    // Get messages for a specific friend with pagination
    getByFriend: protectedProcedure
        .input(GetByFriendSchema)
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Verify friend ownership
            const friend = await ctx.db.friend.findUnique({
                where: { id: input.friendId },
            });

            if (!friend) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Friend not found",
                });
            }

            if (friend.userId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You don't have access to this friend",
                });
            }

            // Get messages with cursor pagination
            const messages = await ctx.db.message.findMany({
                where: {
                    friendId: input.friendId,
                    ...(input.cursor ? { id: { lt: input.cursor } } : {}),
                },
                orderBy: { createdAt: "desc" },
                take: input.limit + 1, // Take one extra to determine if there are more
            });

            let nextCursor: string | undefined = undefined;
            if (messages.length > input.limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            return {
                messages,
                nextCursor,
            };
        }),

    // Delete an assistant message and its preceding user message (rollback conversation)
    // This allows users to "undo" the last exchange in the conversation
    deleteRollback: protectedProcedure
        .input(
            z.object({
                assistantMessageId: z.string().cuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Get the assistant message and verify ownership
            const assistantMessage = await ctx.db.message.findUnique({
                where: { id: input.assistantMessageId },
                include: {
                    friend: true,
                },
            });

            if (!assistantMessage) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Message not found",
                });
            }

            // Verify the message belongs to user's friend
            if (assistantMessage.friend.userId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You don't have access to this message",
                });
            }

            // Verify it's an assistant message
            if (assistantMessage.role !== "assistant") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Can only rollback assistant messages",
                });
            }

            // Find the user message immediately before this assistant message
            const userMessage = await ctx.db.message.findFirst({
                where: {
                    friendId: assistantMessage.friendId,
                    role: "user",
                    createdAt: {
                        lt: assistantMessage.createdAt,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            // Delete both messages in a transaction
            const deletedIds = await ctx.db.$transaction(async (tx) => {
                const deleted: string[] = [];

                // Delete the assistant message
                await tx.message.delete({
                    where: { id: input.assistantMessageId },
                });
                deleted.push(input.assistantMessageId);

                // Delete the user message if found
                if (userMessage) {
                    await tx.message.delete({
                        where: { id: userMessage.id },
                    });
                    deleted.push(userMessage.id);
                }

                return deleted;
            });

            return {
                success: true,
                deletedIds,
            };
        }),
});
