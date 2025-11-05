import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ChatHeader } from "~/components/chat/chat-header";
import { ChatMessages } from "~/components/chat/chat-messages";
import { ChatInput } from "~/components/chat/chat-input";
import { ChatProvider } from "~/components/chat/chat-context";
import { api } from "~/trpc/server";
import type { FriendWithMessages } from "~/types";

export default async function ChatPage({
    params,
}: {
    params: Promise<{ friendId: string }>;
}) {
    const session = await auth();
    const { friendId } = await params;

    if (!session?.user) {
        redirect("/");
    }

    const friend = await api.friend.getById({ friendId });

    // Handle friend not found
    if (!friend) {
        redirect("/friends");
    }

    return (
        <ChatProvider initialFriend={friend as FriendWithMessages}>
            <div className="mx-auto flex h-screen w-full flex-col xl:w-2/3 xl:shadow-xl">
                <ChatHeader />
                <ChatMessages />
                <ChatInput />
            </div>
        </ChatProvider>
    );
}
