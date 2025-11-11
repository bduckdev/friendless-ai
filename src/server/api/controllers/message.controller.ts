import { TRPCError } from "@trpc/server";
import {
    MESSAGE_LIMITS,
    type DeleteRollbackType,
    type GetByFriendType,
    type SendMessageType,
} from "../schemas/message.schema";
import type { Context } from "../trpc";
import { getUserIdFromContext } from "../utils";
import type { FriendWithMessages, User } from "~/types";
import {
    buildMessages,
    getCompletion,
    getCompletionStream,
} from "~/server/lib/openai";

export async function buildMessagesFromContext(
    ctx: Context,
    input: SendMessageType,
) {
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

    return await buildMessages(friend as FriendWithMessages, input.content, user as User);
}

export async function* sendStreamingHandler(
    ctx: Context,
    input: SendMessageType,
) {
    const userId = getUserIdFromContext(ctx);
    const builtMessages = await buildMessagesFromContext(ctx, input);

    const res = await getCompletionStream(builtMessages);
    if (!res.body)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No response body",
        });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let newMessage = "";
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            newMessage += text;

            yield { type: "delta" as const, text };
        }
        newMessage += decoder.decode();
    } finally {
        reader.releaseLock();
    }

    // Save user message
    await ctx.db.message.create({
        data: {
            role: "user",
            content: input.content,
            userId,
            friendId: input.friendId,
        },
    });

    const assistantMessage = await ctx.db.message.create({
        data: {
            role: "assistant",
            content: newMessage.trim(),
            userId,
            friendId: input.friendId,
        },
    });

    yield { type: "final", assistantMessage };
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
}

export async function sendMessageHandler(ctx: Context, input: SendMessageType) {
    const userId = getUserIdFromContext(ctx);
    const builtMessages = await buildMessagesFromContext(ctx, input);

    const completion = await getCompletion(builtMessages);
    if (!completion)
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
        });

    // Save AI response
    const assistantMessage = await ctx.db.message.create({
        data: {
            content: completion,
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
        assistantMessage,
    };
}

export async function getMessagesByFriendHandler(
    ctx: Context,
    input: GetByFriendType,
) {
    const userId = getUserIdFromContext(ctx);

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
        orderBy: { createdAt: "asc" },
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
}
export async function deleteRollbackHandler(
    ctx: Context,
    input: DeleteRollbackType,
) {
    const userId = getUserIdFromContext(ctx);

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
}
