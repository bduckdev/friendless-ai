import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { FriendCard } from "~/components/friends/friend-card";
import { api } from "~/trpc/server";

export default async function FriendsPage() {
    const session = await auth();
    const friends = await api.friend.getAll()

    if (!session?.user) {
        redirect("/");
    }

    return (
        <main className="shadow-xl container mx-auto px-4 py-8">
            {/* Header with Create Button */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Friends</h1>
                    <p className="text-muted-foreground mt-1">Your AI companions</p>
                </div>
                <Button asChild>
                    <Link href="/friends/create">
                        <Plus className="size-4" />
                        Create Friend
                    </Link>
                </Button>
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                    <Link
                        key={friend.id}
                        href={`/chat/${friend.id}`}
                        className="transition-all hover:scale-[1.02] hover:shadow-lg"
                    >
                        <FriendCard
                            friend={friend}
                        />
                    </Link>
                ))}
            </div>

            {/* Empty State (hidden when there are friends) */}
            {friends.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-muted-foreground mb-4">
                        You haven&apos;t created any AI friends yet.
                    </p>
                    <Button asChild>
                        <Link href="/friends/create">
                            <Plus className="size-4" />
                            Create Your First Friend
                        </Link>
                    </Button>
                </div>
            )}
        </main>
    );
}
