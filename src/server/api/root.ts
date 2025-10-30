import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { healthRouter } from "~/server/api/routers/health";
import { friendRouter } from "~/server/api/routers/friend";
import { messageRouter } from "~/server/api/routers/message";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  friend: friendRouter,
  message: messageRouter,
  user: userRouter,
  // Add additional routers here as they are created
  // subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.friend.getAll();
 */
export const createCaller = createCallerFactory(appRouter);
