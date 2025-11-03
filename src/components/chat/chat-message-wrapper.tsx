import { ChatMessage } from "./chat-message";

type ChatMessageHandlerProps = {
    role: "user" | "system" | "assistant";
    content: string;
    messageId: string;
}

export function ChatMessageHandler({ role, content, messageId }: ChatMessageHandlerProps) {
    switch (role) {
        case "system": return null;
        case "user": return <ChatMessage key={messageId} role={role} content={content} messageId={messageId} />;
        case "assistant": {
            const assistantMessages = content.split("\n\n")
            return assistantMessages.map((m, i) => <ChatMessage
                key={messageId + i}
                role={role}
                content={m}
                messageId={messageId}
                showDeleteButton={assistantMessages.length - 1 === i} />);
        }
    }
}
