import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { friendRouter } from "./friend";
import {
  createMockContext,
  createTestFriend,
  createTestUser,
} from "../test-utils";

describe("Friend Router", () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
  });

  describe("create", () => {
    it("should create a friend with all fields", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const input = {
        name: "Luna",
        personality: "A wise and mystical guide",
        age: 29,
        gender: "female" as const,
        traits: ["wise", "mystical"],
        voice: "thoughtful",
        background: "Luna spent years studying philosophy",
        interests: ["philosophy", "astronomy"],
        avatar: "https://example.com/luna.jpg",
      };

      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
      });
      const mockFriend = {
        ...input,
        id: "friend-1",
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(0);
      mockCtx.db.friend.create = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.create(input);

      expect(result.name).toBe("Luna");
      expect(result.personality).toBe("A wise and mystical guide");
      expect(mockCtx.db.friend.create).toHaveBeenCalledWith({
        data: {
          ...input,
          userId: "test-user-id",
        },
      });
    });

    it("should create a friend with minimal required fields", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const input = {
        name: "Max",
        personality: "Your energetic workout buddy",
      };

      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
      });
      const mockFriend = {
        ...input,
        id: "friend-2",
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(0);
      mockCtx.db.friend.create = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.create(input);

      expect(result.name).toBe("Max");
      expect(result.personality).toBe("Your energetic workout buddy");
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const unauthCtx = createMockContext({ session: null });
      const caller = friendRouter.createCaller(unauthCtx);

      await expect(
        caller.create({ name: "Test", personality: "Test personality" }),
      ).rejects.toThrow(TRPCError);
    });

    it("should throw FORBIDDEN when free user exceeds friend limit", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const input = {
        name: "Friend 6",
        personality: "Should fail",
      };

      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
      });

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(5); // Already at limit

      await expect(caller.create(input)).rejects.toThrow(TRPCError);
      await expect(caller.create(input)).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("should allow premium users to create more friends", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const input = {
        name: "Friend 6",
        personality: "Should succeed for premium",
      };

      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "premium",
      });
      const mockFriend = {
        ...input,
        id: "friend-6",
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );
      mockCtx.db.friend.count = (jest.fn() as any).mockResolvedValue(10); // More than free limit
      mockCtx.db.friend.create = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.create(input);

      expect(result.name).toBe("Friend 6");
    });
  });

  describe("getAll", () => {
    it("should return all friends for authenticated user", async () => {
      const caller = friendRouter.createCaller(mockCtx);

      const mockFriends = [
        {
          ...createTestFriend("test-user-id", { name: "Luna" }),
          _count: { messages: 10 },
        },
        {
          ...createTestFriend("test-user-id", { name: "Max" }),
          _count: { messages: 5 },
        },
      ];

      mockCtx.db.friend.findMany = (jest.fn() as any).mockResolvedValue(
        mockFriends,
      );

      const result = await caller.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]?.messageCount).toBe(10);
      expect(result[1]?.messageCount).toBe(5);
    });

    it("should return empty array when user has no friends", async () => {
      const caller = friendRouter.createCaller(mockCtx);

      mockCtx.db.friend.findMany = (jest.fn() as any).mockResolvedValue([]);

      const result = await caller.getAll();

      expect(result).toEqual([]);
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const unauthCtx = createMockContext({ session: null });
      const caller = friendRouter.createCaller(unauthCtx);

      await expect(caller.getAll()).rejects.toThrow(TRPCError);
    });
  });

  describe("getById", () => {
    it("should return friend with messages by ID", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "cltest123456789012345678";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Hello",
            createdAt: new Date(),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Hi there!",
            createdAt: new Date(),
          },
        ],
      };

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.getById({ friendId });

      expect(result.id).toBe(friendId);
      expect(result.messages).toHaveLength(2);
    });

    it("should throw UNAUTHORIZED when friend belongs to different user", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "cltest123456789012345678";

      const mockFriend = createTestFriend("different-user-id", {
        id: friendId,
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      await expect(caller.getById({ friendId })).rejects.toThrow(TRPCError);
      await expect(caller.getById({ friendId })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw NOT_FOUND when friend doesn't exist", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "clnonexistent123456789";

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.getById({ friendId })).rejects.toThrow(TRPCError);
      await expect(caller.getById({ friendId })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("delete", () => {
    it("should delete friend and return success", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "cltest123456789012345678";

      const mockFriend = createTestFriend("test-user-id", { id: friendId });
      (mockFriend as any).userId = "test-user-id";

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.friend.delete = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.delete({ friendId });

      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(friendId);
      expect(mockCtx.db.friend.delete).toHaveBeenCalledWith({
        where: { id: friendId },
      });
    });

    it("should throw UNAUTHORIZED when friend belongs to different user", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "cltest123456789012345678";

      const mockFriend = createTestFriend("different-user-id", {
        id: friendId,
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      await expect(caller.delete({ friendId })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ friendId })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw NOT_FOUND when friend doesn't exist", async () => {
      const caller = friendRouter.createCaller(mockCtx);
      const friendId = "clnonexistent123456789";

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.delete({ friendId })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ friendId })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });
});
