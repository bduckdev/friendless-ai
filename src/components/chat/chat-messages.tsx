"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { useChatContext } from "./chat-context";

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
        <ChatMessage
          key={message.id}
          messageId={message.id}
          role={message.role}
          content={message.content}
          friendName={friend.name}
          friendAvatar={friend.avatar ?? undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
