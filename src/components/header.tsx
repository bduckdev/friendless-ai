import Link from "next/link";
import { auth } from "~/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex-shrink-0 text-xl font-semibold">
          <Link href="/">friendless</Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-1 justify-center gap-6">
          {session?.user && (
            <Link
              href="/friends"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              My Friends
            </Link>
          )}
          <Link
            href="/pricing"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/faq"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex flex-shrink-0 items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user.name ?? "User"}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{session.user.name}</span>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
