import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import { db } from "~/server/db";
import { seedDefaultFriends } from "~/server/lib/seed-friends";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}
const providers: Provider[] = [DiscordProvider, GitHub];

export const providersMap = providers.map((provider) => {
    if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    } else {
        return { id: provider.id, name: provider.name };
    }
});

export const authConfig = {
    providers,
    pages: {
        signIn: "/signin",
        error: "/error",
    },
    adapter: PrismaAdapter(db),
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
    events: {
        createUser: async ({ user }) => {
            // Seed default friends for new user
            if (!user.id) {
                console.error("Cannot seed default friends: user.id is undefined");
                return;
            }

            try {
                await seedDefaultFriends(user.id);
            } catch (error) {
                console.error(
                    `Failed to seed default friends for user ${user.id}:`,
                    error,
                );
                // Don't throw - allow user creation to succeed even if seeding fails
            }
        },
    },
} satisfies NextAuthConfig;
