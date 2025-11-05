import { db } from "~/server/db";
import { DEFAULT_FRIENDS_TEMPLATE } from "~/lib/default-friends-template";
import type { Gender } from "@prisma/client";

/**
 * Seed default friends for a new user
 * Creates 6 pre-configured AI friends with intro messages
 *
 * @param userId - The ID of the user to seed friends for
 * @returns Array of created friend IDs
 */
export async function seedDefaultFriends(userId: string): Promise<string[]> {
    try {
        // Check if user already has friends seeded
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { defaultFriendsSeeded: true },
        });

        if (user?.defaultFriendsSeeded) {
            console.log(`[Seed] User ${userId} already has default friends seeded`);
            return [];
        }

        console.log(`[Seed] Starting to seed default friends for user ${userId}`);

        // Use transaction to ensure all-or-nothing creation
        const friendIds = await db.$transaction(async (tx) => {
            const createdFriendIds: string[] = [];

            for (const template of DEFAULT_FRIENDS_TEMPLATE) {
                // Create the friend
                const friend = await tx.friend.create({
                    data: {
                        name: template.name,
                        age: template.age,
                        gender: template.gender as Gender,
                        personality: template.personality,
                        traits: template.traits,
                        voice: template.voice,
                        background: template.background,
                        interests: template.interests,
                        avatar: template.avatar,
                        userId,
                    },
                });

                createdFriendIds.push(friend.id);

                // Create the intro message
                await tx.message.create({
                    data: {
                        content: template.introMessage,
                        role: "assistant",
                        userId,
                        friendId: friend.id,
                    },
                });

                console.log(`[Seed] Created friend: ${template.name} (${friend.id})`);
            }

            // Mark user as having default friends seeded
            await tx.user.update({
                where: { id: userId },
                data: { defaultFriendsSeeded: true },
            });

            return createdFriendIds;
        });

        console.log(
            `[Seed] Successfully seeded ${friendIds.length} default friends for user ${userId}`,
        );

        return friendIds;
    } catch (error) {
        console.error(
            `[Seed] Failed to seed default friends for user ${userId}:`,
            error,
        );
        // Re-throw to let caller handle the error
        throw new Error(
            `Failed to seed default friends: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

/**
 * Check if a user has default friends seeded
 *
 * @param userId - The ID of the user to check
 * @returns True if user has default friends seeded
 */
export async function hasDefaultFriendsSeeded(
    userId: string,
): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { defaultFriendsSeeded: true },
    });

    return user?.defaultFriendsSeeded ?? false;
}
