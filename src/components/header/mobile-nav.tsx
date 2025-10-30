"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import type { Session } from "next-auth";

interface MobileNavProps {
  session: Session | null;
}

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger: Hamburger Button (reuse existing Button component) */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      {/* Sheet Content */}
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-4 mt-6">
          {session?.user && (
            <>
              <Link
                href="/friends"
                className="text-lg font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                My Friends
              </Link>
              <Separator />
            </>
          )}

          <Link
            href="/pricing"
            className="text-lg font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>

          <Link
            href="/faq"
            className="text-lg font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            FAQ
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
