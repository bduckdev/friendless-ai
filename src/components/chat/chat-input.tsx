"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useChatContext } from "./chat-context";
import { parse } from "path";
import { Spinner } from "../ui/spinner";

export function ChatInput() {
    const [message, setMessage] = useState("");
    const { handleSendMessage, isLoading } = useChatContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const messageToSend = message;
        setMessage(""); // Clear input immediately for better UX

        try {
            await handleSendMessage(messageToSend);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Restore message on error
            setMessage(messageToSend);
        }
    };

    return (
        <div className="bg-background border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message..."
                    disabled={isLoading}
                    className="bg-muted focus:border-primary flex-1 rounded-full border px-4 py-2 text-sm outline-none disabled:opacity-50"
                />
                {!isLoading ? (
                    <Button
                        type="submit"
                        size="icon"
                        className="shrink-0 rounded-full"
                        disabled={!message.trim() || isLoading}
                    >
                        <Send className="size-4" />
                    </Button>
                ) : (
                    <Spinner className="size-8" />
                )}
            </form>
        </div>
    );
}
