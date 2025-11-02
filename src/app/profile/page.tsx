import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function ProfilePage() {
    const session = await auth();
    const userData = await api.user.getProfile()
    const stats = await api.user.getStats()

    if (!session?.user) {
        redirect("/");
    }

    return (
        <main className="container mx-auto py-4 md:py-8 px-4">
            <section className="py-2 md:py-4">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="mt-4 text-muted-foreground">
                    Your account, stats, and billing information.
                </p>
            </section>
            <Separator />
            <section className="grid grid-cols-1 gap-4 py-4">
                <h2 className="text-xl font-semibold pb-2">Profile</h2>
                <div className="flex items-center">
                    <Avatar className="size-36">
                        <AvatarImage src={userData.image!} />
                        <AvatarFallback>{userData.name!.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <p className="text-3xl font-bold">
                            {userData.name}
                        </p>
                        <p className="text-sm font-light text-muted-foreground">
                            {userData.email}
                        </p>
                    </div>
                </div>
                <div className="">
                    <h2 className="text-xl font-semibold pb-4">Stats</h2>
                    <div className="gap-2 grid grid-cols-3">
                        <Card className="">
                            <CardHeader>
                                <CardDescription>Friends Made</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats.totalFriends}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>Messages Sent</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats.totalMessages}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>Time Wasted</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {stats.accountAge} days
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
                {/*
                <Separator />
                <div className="">
                    <h2 className="text-xl font-semibold">Billing Information</h2>
                </div>
                */}
            </section>
        </main >
    );
}
