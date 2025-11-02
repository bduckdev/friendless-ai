import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SwipeGallery } from "~/components/friends/swipe-gallery";
import type { Friend } from "~/types";
import { TEST_FRIENDS } from "~/lib/test-data";

export default async function Home() {
    const session = await auth();

    let friends: Friend[] = []
    if (session?.user) {
        friends = await api.friend.getAll();
    } else {
        friends = TEST_FRIENDS
    }


    return (
        <main className="h-full container mx-auto px-4 py-8 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-5xl font-bold pb-5">Welcome to friendless</h1>
                <SwipeGallery friends={friends} />
                <p className="text-muted-foreground mt-8 text-lg">
                    Create AI companions with unique personalities and chat with them.
                    Swipe right on the friend you want to chat with, left to look at the next.
                </p>
            </div>
        </main>
    );
}
