import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function Home() {
    const session = await auth();

    if (session?.user) {
        redirect("/friends");
    }

    return (
        <main className="container mx-auto py-8">
            <h1 className="text-4xl font-bold">Welcome to friendless</h1>
            <p className="text-muted-foreground mt-4">
                Create AI companions with unique personalities and chat with them.
            </p>
        </main>
    );
}
