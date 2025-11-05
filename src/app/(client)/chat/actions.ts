"use server";

import { toast } from "sonner";
import { api } from "~/trpc/server";
import type {
    FriendWithMessages,
    Message,
    DeleteRollbackResponse,
} from "~/types";

export async function sendMessage(
    friend: FriendWithMessages,
    newMessage: string,
) {
    try {
        const res = await api.message.sendStreaming({
            friendId: friend.id,
            content: newMessage,
        });

        return res
    } catch (error) {
        toast("Uh oh, something went wrong. Try your message again soon.")
        console.error("Error in sendMessage action:", error);
        throw new Error("Failed to get AI response");
    }
}

export async function deleteMessageRollback(
    assistantMessageId: string,
): Promise<DeleteRollbackResponse> {
    try {
        const result = await api.message.deleteRollback({ assistantMessageId });
        return result;
    } catch (error) {
        console.error("Error in deleteMessageRollback action:", error);
        throw new Error("Failed to delete message");
    }
}
