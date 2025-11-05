import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function CreateFriendPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <main className="container mx-auto py-8">
            <h1 className="text-3xl font-bold">Create a New Friend</h1>
            <p className="mt-4 text-muted-foreground">
                Design your AI companion with a unique personality.
            </p>
        </main>
    );
}
