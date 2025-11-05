"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { User, LogOut, ChevronDownIcon, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";
import { Button } from "../ui/button";

interface UserDropdownProps {
    session: Session;
    status: string;
}

export function UserDropdown({ session, status }: UserDropdownProps) {
    if (status === "loading") {
        return null
    }

    if (!session?.user) {
        return (
            <Button variant="default" size="sm" asChild>
                <Link href="/api/auth/signin">Sign In</Link>
            </Button>
        )
    }
    return (
        <DropdownMenu>
            {/* Trigger: Avatar + Name (reuse existing Avatar component) */}
            <DropdownMenuTrigger asChild>
                <button className="hover:cursor-pointer flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity outline-none">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image ?? undefined} />
                        <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:inline">
                        {session.user.name}
                    </span>
                    <ChevronDownIcon className="md:inline size-4" />
                </button>
            </DropdownMenuTrigger>

            {/* Dropdown Content */}
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href="/friends" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        My Friends
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
