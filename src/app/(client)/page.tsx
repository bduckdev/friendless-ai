import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SwipeGallery } from "~/components/friends/swipe-gallery";
import type { Friend } from "~/types";
import { TEST_FRIENDS } from "~/lib/test-data";

export default async function Home() {
    const session = await auth();

    let friends: Friend[] = [];
    if (session?.user) {
        friends = await api.friend.getAll();
    } else {
        friends = TEST_FRIENDS;
    }

    return (
        <main className="container mx-auto h-full px-4 py-8 md:py-16">
            <div className="mx-auto flex max-w-2xl flex-col gap-16 text-center">
                <h1 className="pb-5 text-5xl font-bold">Welcome to friendless</h1>
                <SwipeGallery friends={friends} />
                <p className="text-muted-foreground mt-8 text-lg">
                    Create AI companions with unique personalities and chat with them.
                    Swipe right on the friend you want to chat with, left to look at the
                    next.
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-3xl">
                <h2 className="mb-8 text-center text-2xl font-semibold">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-2 font-medium">Can I cancel anytime?</h3>
                        <p className="text-muted-foreground">
                            Yes! You can cancel your subscription at any time from your
                            profile page. Your premium features will remain active until the
                            end of your billing period.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">
                            What happens when I reach the free tier limit?
                        </h3>
                        <p className="text-muted-foreground">
                            {`Your message quota resets every 24 hours. If you reach your daily
                            limit, you'll need to wait until the next day or upgrade to
                            Premium for unlimited messages.`}
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">
                            Do my friends carry over if I upgrade?
                        </h3>
                        <p className="text-muted-foreground">
                            Absolutely! All your friends and conversation history remain
                            intact when you upgrade or downgrade. Nothing is lost in the
                            transition.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-2 font-medium">
                            How does the message count work?
                        </h3>
                        <p className="text-muted-foreground">
                            {`Each message you send to any of your AI friends counts toward your
              daily limit. AI responses don't count against your quota -
              only the messages you send.`}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
