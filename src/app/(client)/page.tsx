import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SwipeGallery } from "~/components/friends/swipe-gallery";
import { FriendCarousel } from "~/components/friend-carousel"
import { Separator } from "~/components/ui/separator";
import type { Friend } from "~/types";
import { TEST_FRIENDS } from "~/lib/test-data";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function Home() {
    const session = await auth();

    let friends: Friend[] = [];
    if (session?.user) {
        friends = await api.friend.getAll();
    } else {
        friends = TEST_FRIENDS;
    }

    return (
        <main className="mx-auto py-4 md:py-8">
            <section className="container mx-auto flex max-w-2xl flex-col gap-2 md:gap-4 text-center pb-8">
                <h1 className=" text-4xl font-bold">Welcome to friendless</h1>
                <p className="md:pb-4 text-muted-foreground mt-0 pb-2 px-2 text-lg">
                    Swipe right on the friend you want to chat with.
                </p>
                <SwipeGallery friends={friends} />
                <p className="text-muted-foreground mt-8 text-lg">
                    Create AI companions with unique personalities and chat with them.
                </p>
                <div className="flex gap-2 py-4 justify-center">
                    <Link href="/friends/create">
                        <Button size="lg" className="text-base tracking-tight font-semibold">Create New Friend</Button>
                    </Link>
                    <Link href="#about">
                        <Button variant="outline" size="lg" className="text-base font-semibold tracking-tight">Learn More</Button>
                    </Link>
                </div>
            </section>
            <Separator className="mx-auto max-w-5xl" />
            <section id="about" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="flex flex-col gap-4 items-center text-center justify-between">
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                        Human connection, <span className="italic">post-human</span>.
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-3xl pb-6">
                        {`Friendless is an end-to-end, Loneliness-as-a-Service™ platform designed to disrupt, disintermediate, and ultimately
                        delete the human social layer as we know it. We blend generative empathy pipelines, synthetic sentiment
                        clustering, and cloud‑native emotional infrastructure to redefine what it means to “be there” for someone.`}
                    </p>
                    <FriendCarousel />
                </div>
            </section>
            <Separator className="mx-auto max-w-5xl" />
            <section className="w-full px-4 sm:px-6 lg:px-8 py-10 bg-secondary">
                <div className=" max-w-5xl mx-auto flex flex-col items-center text-center gap-8 ">
                    <h2 className="text-3xl font-semibold tracking-tight">Be part of the movement toward a <span className="italic">more</span> connected, <span className="italic">less</span> connected world.</h2>
                    <Link href={session?.user.name ? "/friends" : "/signin"}>
                        <Button size="lg" className="text-base font-semibold">Get started</Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
