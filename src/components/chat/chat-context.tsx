"use client";

import { createContext, useContext, useState, useTransition } from "react";
import type { FriendWithMessages, Message } from "~/types";
import { sendMessage, deleteMessageRollback } from "~/app/chat/actions";

interface ChatContextValue {
    friend: FriendWithMessages;
    isLoading: boolean;
    handleSendMessage: (content: string) => Promise<void>;
    handleDeleteMessage: (assistantMessageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within ChatProvider");
    }
    return context;
}

interface ChatProviderProps {
    initialFriend: FriendWithMessages;
    children: React.ReactNode;
}

export function ChatProvider({ initialFriend, children }: ChatProviderProps) {
    const [friend, setFriend] = useState<FriendWithMessages>(initialFriend);
    const [isPending, startTransition] = useTransition();

    const handleSendMessage = async (content: string) => {
        // Optimistically add user message to UI
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content,
            createdAt: new Date(),
        };

        setFriend((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage],
        }));

        try {
            startTransition(async () => {
                const aiResponse = await sendMessage(friend, content);
                setFriend((prev) => ({
                    ...prev,
                    messages: [...prev.messages, aiResponse],
                }));
            });
        } catch (error) {
            console.error("Failed to send message: ", error);
            // Remove optimistic user message on error
            setFriend((prev) => ({
                ...prev,
                messages: prev.messages.filter((m) => m.id !== userMessage.id),
            }));
            throw error;
        }
    };

    const handleDeleteMessage = async (assistantMessageId: string) => {
        // Find the assistant message index
        const assistantIndex = friend.messages.findIndex(
            (m) => m.id === assistantMessageId,
        );

        if (assistantIndex === -1) {
            console.error("Message not found in state");
            return;
        }

        // Find the user message immediately before the assistant message
        const userMessageIndex = assistantIndex - 1;
        const messagesToDelete = [assistantMessageId];

        if (
            userMessageIndex >= 0 &&
            friend.messages[userMessageIndex]?.role === "user"
        ) {
            messagesToDelete.push(friend.messages[userMessageIndex].id);
        }

        // Backup current messages for rollback on error
        const previousMessages = [...friend.messages];

        // Optimistically remove messages from UI
        setFriend((prev) => ({
            ...prev,
            messages: prev.messages.filter((m) => !messagesToDelete.includes(m.id)),
        }));

        try {
            // Call server action to delete messages
            await deleteMessageRollback(assistantMessageId);
        } catch (error) {
            console.error("Failed to delete message:", error);
            // Restore messages on error
            setFriend((prev) => ({
                ...prev,
                messages: previousMessages,
            }));
            throw error;
        }
    };

    return (
        <ChatContext.Provider
            value={{
                friend,
                isLoading: isPending,
                handleSendMessage,
                handleDeleteMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}
