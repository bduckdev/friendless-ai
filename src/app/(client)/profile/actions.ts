"use server"

import { toast } from "sonner"
import { api } from "~/trpc/server"

export async function handleProfileEdit({ name, email }: { name: string, email: string }) {
    try {
        const updatedUserData = await api.user.updateUser({ name, email })

        return updatedUserData
    } catch (e) {
        console.error("Error in handleProfileEdit action: ", e);
        throw new Error("Failed to update profile");
    }
}
