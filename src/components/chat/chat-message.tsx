"use client";

import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "../ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useChatContext } from "./chat-context";
import { useState } from "react";

interface ChatMessageProps {
    messageId: string;
    role: "user" | "assistant" | "system";
    content: string;
    friendName?: string;
    friendAvatar?: string;
}

export function ChatMessage({
    messageId,
    role,
    content,
    friendName,
    friendAvatar,
}: ChatMessageProps) {
    const { handleDeleteMessage, isLoading, friend: { messages } } = useChatContext();
    const [isDeleting, setIsDeleting] = useState(false);
    // Don't render system messages
    if (role === "system") {
        return null;
    }

    const isUser = role === "user";
    const userHasPosted = messages.some(m => m.role == "user")
    const isLastItem = messageId == messages[messages.length - 1]!.id
    const isDeletable = userHasPosted && !isUser && isLastItem


    return (
        <div
            className={cn(
                "group mb-4 flex items-end gap-2",
                isUser ? "justify-end" : "justify-start",
            )}
        >
            {/* Avatar for assistant messages (on left) */}
            {!isUser && (
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={friendAvatar} alt={friendName} />
                    <AvatarFallback>
                        {friendName?.charAt(0).toUpperCase() ?? "A"}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Message bubble with tail */}
            <div
                className={cn(
                    "relative max-w-[70%] px-4 py-2",
                    // Base rounded style with adjusted corner for tail
                    isUser ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md",
                    // Colors
                    isUser ? "bg-black text-white" : "bg-muted text-foreground",
                    // Tail for assistant messages (left side, pointing to avatar)
                    !isUser && [
                        "before:content-['']",
                        "before:absolute",
                        "before:left-[-4px]",
                        "before:bottom-[3px]",
                        "before:w-0",
                        "before:h-0",
                        "before:border-r-[6px]",
                        "before:border-r-muted",
                        "before:border-t-[6px]",
                        "before:border-t-transparent",
                        "before:border-b-[6px]",
                        "before:border-b-transparent",
                    ],
                    // Tail for user messages (right side)
                    isUser && [
                        "after:content-['']",
                        "after:absolute",
                        "after:right-[-4px]",
                        "after:bottom-[3px]",
                        "after:w-0",
                        "after:h-0",
                        "after:border-l-[6px]",
                        "after:border-l-black",
                        "after:border-t-[6px]",
                        "after:border-t-transparent",
                        "after:border-b-[6px]",
                        "after:border-b-transparent",
                    ],
                )}
            >
                <p className="text-sm break-words whitespace-pre-wrap">{content}</p>
            </div>

            {/* Delete button for assistant messages */}
            {(isDeletable) && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-60 transition-opacity  hover:opacity-100"
                            disabled={isLoading || isDeleting}
                        >
                            <Trash2 className="text-muted-foreground hover:text-destructive h-3 w-3" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Messages?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete the AI response and your previous message. This
                                action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    setIsDeleting(true);
                                    try {
                                        await handleDeleteMessage(messageId);
                                    } catch (error) {
                                        console.error("Delete failed:", error);
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
