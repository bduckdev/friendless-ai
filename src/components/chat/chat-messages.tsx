"use client";

import React, { useEffect, useRef } from "react";
import { useChatContext } from "./chat-context";
import { ChatMessageHandler } from "./chat-message-wrapper";

export function ChatMessages() {
    const { friend } = useChatContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [friend.messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {friend.messages.map((message) => (
                <ChatMessageHandler
                    key={message.id}
                    content={message.content}
                    messageId={message.id}
                    role={message.role}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
