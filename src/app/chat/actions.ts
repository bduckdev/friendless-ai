"use server";

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
    const res = await api.message.send({
      friendId: friend.id,
      content: newMessage,
    });

    return res.assistantMessage as Message;
  } catch (error) {
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
