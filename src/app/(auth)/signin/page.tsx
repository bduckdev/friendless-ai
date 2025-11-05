import { SiGithub, SiDiscord } from "@icons-pack/react-simple-icons"
import { AuthError } from "next-auth";
import Image from "next/image"; import Link from "next/link"; import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardFooter,
    CardDescription,
    CardHeader,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { signIn } from "~/server/auth";
import { providersMap } from "~/server/auth/config";

const SIGNIN_ERROR_URL = "/error";

export default async function SignInPage(props: {
    searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
    const { callbackUrl } = await props.searchParams
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader className="flex flex-col items-center">
                    <Image src="/logo-black.png" width={100} height={100} alt="friendless logo" />
                    <Link className="text-center text-3xl font-semibold" href="/">
                        friendless
                    </Link>
                </CardHeader>
                <CardDescription>
                    <p className="text-center">Sign in to your account</p>
                </CardDescription>
                <Separator />
                <CardFooter className="flex-col gap-2">
                    {Object.values(providersMap).map((provider) => (
                        <form
                            key={provider.id}
                            action={async () => {
                                "use server";
                                try {
                                    await signIn(provider.id, {
                                        redirectTo: callbackUrl ?? "",
                                    });
                                } catch (error) {
                                    if (error instanceof AuthError) {
                                        return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
                                    }
                                    throw error;
                                }
                            }}
                        >
                            <Button className="cursor-pointer" type="submit" variant="outline">
                                <AuthIcon providerName={provider.name} />
                                <span className="">Sign in with {provider.name}</span>
                            </Button>
                        </form>
                    ))}
                </CardFooter>
            </Card>
        </main >
    );
}


function AuthIcon({ providerName }: { providerName: string }) {
    const iconProps = {
        size: 48,
        color: "default",
    }

    switch (providerName) {
        case "GitHub": return <SiGithub  {...iconProps} />
        case "Discord": return <SiDiscord {...iconProps} />
        default: return null;
    }
}
