"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useChatContext } from "./chat-context";

export function ChatHeader() {
    const { friend } = useChatContext();

    return (
        <div className="bg-background border-b">
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Back Button */}
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/friends">
                        <ChevronLeft className="size-5" />
                    </Link>
                </Button>

                {/* Friend Info */}
                <div className="flex flex-1 flex-col items-center">
                    <Avatar className="size-10">
                        <AvatarImage src={friend.avatar ?? undefined} alt={friend.name} />
                        <AvatarFallback>
                            {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="mt-1 text-sm font-semibold">{friend.name}</span>
                </div>

                {/* Spacer for centering */}
                <div className="size-9" />
            </div>
        </div>
    );
}
