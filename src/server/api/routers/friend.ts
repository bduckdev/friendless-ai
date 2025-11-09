import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Validation schemas
export const GenderEnum = z.enum(["male", "female", "non_binary"]);

const CreateFriendSchema = z.object({
    name: z.string().min(1).max(100),
    personality: z.string().min(10).max(1000),
    age: z.number().int().min(18).max(1000),
    gender: GenderEnum,
    traits: z.array(z.string()).max(10),
    voice: z.string().max(50),
    background: z.string().max(2000),
    interests: z.array(z.string()).max(20),
    avatar: z.string(),
});

const FriendIdSchema = z.object({
    friendId: z.cuid(),
});

const FRIEND_LIMITS = {
    free: 10,
    premium: 50,
};

export const friendRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateFriendSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Check friend limit based on subscription tier
            const user = await ctx.db.user.findUnique({
                where: { id: userId },
                select: { subscriptionTier: true },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const friendCount = await ctx.db.friend.count({
                where: { userId },
            });

            const limit =
                FRIEND_LIMITS[user.subscriptionTier as keyof typeof FRIEND_LIMITS] ??
                FRIEND_LIMITS.free;

            if (friendCount >= limit) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `Friend limit reached. ${user.subscriptionTier === "free" ? "Upgrade to premium for more friends." : ""}`,
                });
            }

            // Create the friend
            const friend = await ctx.db.friend.create({
                data: {
                    ...input,
                    userId,
                },
            });

            return friend;
        }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const friends = await ctx.db.friend.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
        });
        return friends.map((friend) => ({
            ...friend,
            messageCount: friend._count.messages,
        }));
    }),
    getById: protectedProcedure
        .input(FriendIdSchema)
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const friend = await ctx.db.friend.findUnique({
                where: { id: input.friendId },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                        take: 50,
                    },
                },
            });

            if (!friend) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Friend not found",
                });
            }

            // Verify ownership
            if (friend.userId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You don't have access to this friend",
                });
            }

            return friend;
        }),
    delete: protectedProcedure
        .input(FriendIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Check if friend exists and belongs to user
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

            // Delete the friend (cascade will delete messages)
            await ctx.db.friend.delete({
                where: { id: input.friendId },
            });

            return {
                success: true,
                deletedId: input.friendId,
            };
        }),
});
