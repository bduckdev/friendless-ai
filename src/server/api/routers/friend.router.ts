import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createFriendHandler, deleteFriendByIdHandler, getAllFriendsHandler, getFriendByIdHandler } from "../controllers/friend.controller";
import { CreateFriendSchema, FriendIdSchema } from "../schemas/friend.schema";

export const friendRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateFriendSchema)
        .mutation(async ({ ctx, input }) => {
            return createFriendHandler(ctx, input)
        }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return getAllFriendsHandler(ctx)
    }),
    getById: protectedProcedure
        .input(FriendIdSchema)
        .query(async ({ ctx, input }) => {
            return getFriendByIdHandler(ctx, input)
        }),
    delete: protectedProcedure
        .input(FriendIdSchema)
        .mutation(async ({ ctx, input }) => {
            return deleteFriendByIdHandler(ctx, input)
        }),
});
