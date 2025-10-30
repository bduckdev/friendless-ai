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
import { User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

interface UserDropdownProps {
  session: Session;
}

export function UserDropdown({ session }: UserDropdownProps) {
  return (
    <DropdownMenu>
      {/* Trigger: Avatar + Name (reuse existing Avatar component) */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline">
            {session.user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
