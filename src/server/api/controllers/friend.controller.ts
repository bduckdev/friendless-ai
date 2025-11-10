import { TRPCError } from "@trpc/server";
import { type Context } from "~/server/api/trpc";
import {
    FRIEND_LIMITS,
    type CreateFriendType,
    type FriendIdType,
} from "../schemas/friend.schema";
import { getUserIdFromContext } from "../utils";

export async function createFriendHandler(
    ctx: Context,
    input: CreateFriendType,
) {
    const userId = getUserIdFromContext(ctx);
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
    // Get friend limit, check if the user is at their limit
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
}

export async function getAllFriendsHandler(ctx: Context) {
    const userId = getUserIdFromContext(ctx);
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
}

export async function getFriendByIdHandler(ctx: Context, input: FriendIdType) {
    const userId = getUserIdFromContext(ctx);

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
}
export async function deleteFriendByIdHandler(
    ctx: Context,
    input: FriendIdType,
) {
    const userId = getUserIdFromContext(ctx);

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
}
