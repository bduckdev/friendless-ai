import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { userRouter } from "./user";
import { createMockContext, createTestUser, createTestFriend } from "../test-utils";

describe("User Router", () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
  });

  describe("getProfile", () => {
    it("should return user profile from session", async () => {
      const caller = userRouter.createCaller(mockCtx);

      const mockUser = {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
        gender: null,
        subscriptionTier: "free",
        subscriptionStatus: null,
        messagesUsedToday: 10,
        dailyQuotaResetAt: new Date(),
        createdAt: new Date(),
      };

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(mockUser);

      const result = await caller.getProfile();

      expect(result.id).toBe("test-user-id");
      expect(result.name).toBe("Test User");
      expect(result.email).toBe("test@example.com");
      expect(result.subscriptionTier).toBe("free");
      expect(result.messagesUsedToday).toBe(10);
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const unauthCtx = createMockContext({ session: null });
      const caller = userRouter.createCaller(unauthCtx);

      await expect(caller.getProfile()).rejects.toThrow(TRPCError);
    });

    it("should throw NOT_FOUND when user doesn't exist", async () => {
      const caller = userRouter.createCaller(mockCtx);

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.getProfile()).rejects.toThrow(TRPCError);
      await expect(caller.getProfile()).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("getStats", () => {
    it("should return user statistics", async () => {
      const caller = userRouter.createCaller(mockCtx);

      const mockUser = createTestUser({ 
        id: "test-user-id",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      });

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(mockUser);
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(3);
      mockCtx.db.message.count = (jest.fn() as any).mockResolvedValue(150);
      mockCtx.db.friend.findMany = (jest.fn() as any).mockResolvedValue([
        { ...createTestFriend("test-user-id", { id: "1", name: "Luna" }), _count: { messages: 80 } },
      ]);

      const result = await caller.getStats();

      expect(result.totalFriends).toBe(3);
      expect(result.totalMessages).toBe(150);
      expect(result.accountAge).toBeGreaterThanOrEqual(29); // Account at least 29 days old
      expect(result.mostActiveFriend).toEqual({
        id: "1",
        name: "Luna",
        messageCount: 80,
      });
    });

    it("should handle user with no friends", async () => {
      const caller = userRouter.createCaller(mockCtx);

      const mockUser = createTestUser({ id: "test-user-id" });

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(mockUser);
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(0);
      mockCtx.db.message.count = (jest.fn() as any).mockResolvedValue(0);
      mockCtx.db.friend.findMany = (jest.fn() as any).mockResolvedValue([]);

      const result = await caller.getStats();

      expect(result.totalFriends).toBe(0);
      expect(result.totalMessages).toBe(0);
      expect(result.mostActiveFriend).toBeNull();
    });

    it("should calculate most active friend by message count", async () => {
      const caller = userRouter.createCaller(mockCtx);

      const mockUser = createTestUser({ id: "test-user-id" });

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(mockUser);
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(3);
      mockCtx.db.message.count = (jest.fn() as any).mockResolvedValue(150);
      mockCtx.db.friend.findMany = (jest.fn() as any).mockResolvedValue([
        { ...createTestFriend("test-user-id", { id: "1", name: "Luna" }), _count: { messages: 80 } },
      ]);

      const result = await caller.getStats();

      expect(result.mostActiveFriend?.name).toBe("Luna");
      expect(result.mostActiveFriend?.messageCount).toBe(80);
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const unauthCtx = createMockContext({ session: null });
      const caller = userRouter.createCaller(unauthCtx);

      await expect(caller.getStats()).rejects.toThrow(TRPCError);
    });

    it("should throw NOT_FOUND when user doesn't exist", async () => {
      const caller = userRouter.createCaller(mockCtx);

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.getStats()).rejects.toThrow(TRPCError);
      await expect(caller.getStats()).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });
});
