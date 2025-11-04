"use client";

import React, { useEffect, useRef } from "react";
import { useChatContext } from "./chat-context";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { ChatMessageHandler } from "./chat-message-handler";

export function ChatMessages() {
    const { friend, tempMessage, isThinking } = useChatContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const autoScroll = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        autoScroll()
    }, [friend.messages, tempMessage]);
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
            {tempMessage && (
                <ChatMessageHandler
                    content={tempMessage}
                    messageId={"tempMessage"}
                    role={"assistant"}
                />
            )}
            {isThinking && (
                <div className="flex items-center gap-2">
                    <Avatar className="size-8 shrink-0 select-none">
                        <AvatarImage src={friend.avatar!} alt={friend.name} />
                        <AvatarFallback>
                            {friend.name?.charAt(0).toUpperCase() ?? "A"}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground italic text-sm shadow-xs">{`${friend.name} is thinking...`}</p>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
