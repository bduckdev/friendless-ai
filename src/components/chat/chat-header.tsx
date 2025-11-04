"use client";

import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useChatContext } from "./chat-context";
import { useRouter } from "next/navigation";

export function ChatHeader() {
    const { friend } = useChatContext();
    const router = useRouter()

    return (
        <div className="bg-background border-b">
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Back Button */}
                <Button className="rounded-full" onClick={() => router.back()} variant="ghost" size="icon" asChild>
                    <ChevronLeft className="size-5" />
                </Button>

                {/* Friend Info */}
                <div className="flex flex-1 flex-col items-center select-none">
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
