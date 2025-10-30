import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <main className="container mx-auto py-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="mt-4 text-muted-foreground">
                Your profile, stats, and billing information.
            </p>
        </main>
    );
}
