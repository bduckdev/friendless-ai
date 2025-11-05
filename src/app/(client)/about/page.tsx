import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function About() {

    return (
        <main className="relative w-full">
            {/* Page intro / hero */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-4 items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight pb-4">
                        Human connection, <span className="italic">post-human</span>.
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-3xl">
                        {`Friendless is an end-to-end, Loneliness-as-a-Service™ platform designed to disrupt, disintermediate, and ultimately
                        delete the human social layer as we know it. We blend generative empathy pipelines, synthetic sentiment
                        clustering, and cloud‑native emotional infrastructure to redefine what it means to “be there” for someone.`}
                    </p>
                </div>
            </section>

            <Separator className="mx-auto max-w-5xl" />


            {/* CTA */}
            <section className="px-4 sm:px-6 lg:px-8 py-10 bg-secondary">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-8 ">
                    <h2 className="font-semibold tracking-tight text-2xl md:text-3xl">Join the Revolution</h2>
                    <p>{`Be part of the movement toward a more connected, disconnected world. Sign up today, opt into tomorrow, and
                            experience friendship that’s redefined, reimagined, and relentlessly optimized for engagement.`}</p>
                    <Link href="/signin">
                        <Button size="lg" className="text-base font-semibold">Get started</Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
