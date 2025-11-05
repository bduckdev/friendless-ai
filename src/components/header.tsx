"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserDropdown } from "./header/user-dropdown";
import { MobileNav } from "./header/mobile-nav";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { User, Users } from "lucide-react";

export function Header() {
    const links = [{
        href: "/friends",
        label: "My Friends",
        isProtected: true,
        icon: <Users color="black" size={18} />
    }]
    const { data: session, status } = useSession();
    if (status === "loading") {
        return
    }

    return (
        <header className="bg-background top-0 z-50 border-b">
            <section className="">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center">
                            <Image alt="friendless logo" src="/logo-black.png" width={40} height={40} />
                            <span className="text-xl font-semibold">friendless</span>
                        </Link>
                    </div>
                    {session?.user.name && (
                        <nav className="hidden md:block">
                            <div className="container mx-auto flex h-8 items-center justify-center gap-2 px-4">

                                {links.map((link) => (
                                    <Link className="flex items-center gap-2" href={link.href} key={link.label}>
                                        {link.icon}<span className="">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    )}
                    <div className="flex flex-shrink-0 items-center gap-4">
                        <UserDropdown session={session!} status={status} />
                    </div>
                </div>
            </section>
        </header>
    );
}
