import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { messageRouter } from "./message";
import {
  createMockContext,
  createTestFriend,
  createTestUser,
  createTestMessage,
} from "../test-utils";

// Mock the OpenAI module
jest.mock("~/server/lib/openai", () => ({
  getCompletion: (jest.fn() as any).mockResolvedValue("AI response"),
}));

import { getCompletion } from "~/server/lib/openai";

describe("Message Router", () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    jest.clearAllMocks();
  });

  describe("send", () => {
    it("should save user message and AI response to database", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";
      const content = "Hello!";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
        messages: [],
      };
      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
        messagesUsedToday: 10,
      });

      const now = new Date();
      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );

      const createMock = jest.fn() as any;
      createMock.mockResolvedValueOnce({
        id: "msg-1",
        role: "user",
        content,
        userId: "test-user-id",
        friendId,
        createdAt: now,
      });
      createMock.mockResolvedValueOnce({
        id: "msg-2",
        role: "assistant",
        content: "AI response",
        userId: "test-user-id",
        friendId,
        createdAt: now,
      });
      mockCtx.db.message.create = createMock;

      mockCtx.db.user.update = (jest.fn() as any).mockResolvedValue(mockUser);
      mockCtx.db.friend.update = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.send({ friendId, content });

      expect(result.userMessage.role).toBe("user");
      expect(result.userMessage.content).toBe(content);
      expect(result.assistantMessage.role).toBe("assistant");
      expect(result.assistantMessage.content).toBe("AI response");
      expect(getCompletion).toHaveBeenCalled();
    });

    it("should throw FORBIDDEN when free user exceeds daily limit", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = createTestFriend("test-user-id", { id: friendId });
      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
        messagesUsedToday: 50, // At limit
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue({
        ...mockFriend,
        userId: "test-user-id",
        messages: [],
      });
      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );

      await expect(caller.send({ friendId, content: "Test" })).rejects.toThrow(
        TRPCError,
      );

      await expect(
        caller.send({ friendId, content: "Test" }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("should allow premium users unlimited messages", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
        messages: [],
      };
      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "premium",
        messagesUsedToday: 100, // Would exceed free limit
      });

      const now = new Date();
      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );

      const createMock2 = jest.fn() as any;
      createMock2.mockResolvedValueOnce({
        id: "msg-1",
        role: "user",
        content: "Hi",
        userId: "test-user-id",
        friendId,
        createdAt: now,
      });
      createMock2.mockResolvedValueOnce({
        id: "msg-2",
        role: "assistant",
        content: "AI response",
        userId: "test-user-id",
        friendId,
        createdAt: now,
      });
      mockCtx.db.message.create = createMock2;

      mockCtx.db.user.update = (jest.fn() as any).mockResolvedValue(mockUser);
      mockCtx.db.friend.update = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      const result = await caller.send({ friendId, content: "Hi" });

      expect(result.userMessage).toBeDefined();
      expect(result.assistantMessage).toBeDefined();
    });

    it("should throw UNAUTHORIZED when friend belongs to different user", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = createTestFriend("different-user-id", {
        id: friendId,
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue({
        ...mockFriend,
        messages: [],
      });

      await expect(caller.send({ friendId, content: "Test" })).rejects.toThrow(
        TRPCError,
      );

      await expect(
        caller.send({ friendId, content: "Test" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw NOT_FOUND when friend doesn't exist", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "clnonexistent1234567890";

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.send({ friendId, content: "Test" })).rejects.toThrow(
        TRPCError,
      );

      await expect(
        caller.send({ friendId, content: "Test" }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("should throw INTERNAL_SERVER_ERROR when OpenAI fails", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
        messages: [],
      };
      const mockUser = createTestUser({
        id: "test-user-id",
        subscriptionTier: "free",
        messagesUsedToday: 10,
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.user.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUser,
      );
      mockCtx.db.message.create = (jest.fn() as any).mockResolvedValue({
        id: "msg-1",
        role: "user",
        content: "Hi",
        userId: "test-user-id",
        friendId,
        createdAt: new Date(),
      });

      // Mock OpenAI failure
      const mockGetCompletion = getCompletion as jest.MockedFunction<
        typeof getCompletion
      >;
      mockGetCompletion.mockRejectedValueOnce(new Error("OpenAI error"));

      await expect(caller.send({ friendId, content: "Test" })).rejects.toThrow(
        TRPCError,
      );

      // Reset mock for second call
      mockGetCompletion.mockRejectedValueOnce(new Error("OpenAI error"));

      await expect(
        caller.send({ friendId, content: "Test" }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
    });
  });

  describe("getByFriend", () => {
    it("should return messages for a friend with pagination", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
      };
      const mockMessages = Array.from({ length: 20 }, (_, i) =>
        createTestMessage("test-user-id", friendId, { id: `msg-${i}` }),
      );

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.message.findMany = (jest.fn() as any).mockResolvedValue(
        mockMessages,
      );

      const result = await caller.getByFriend({ friendId, limit: 20 });

      expect(result.messages).toHaveLength(20);
      expect(result.nextCursor).toBeUndefined();
    });

    it("should provide nextCursor when more messages exist", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = {
        ...createTestFriend("test-user-id", { id: friendId }),
        userId: "test-user-id",
      };
      const mockMessages = Array.from({ length: 21 }, (_, i) =>
        createTestMessage("test-user-id", friendId, { id: `msg-${i}` }),
      );

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );
      mockCtx.db.message.findMany = (jest.fn() as any).mockResolvedValue(
        mockMessages,
      );

      const result = await caller.getByFriend({ friendId, limit: 20 });

      expect(result.messages).toHaveLength(20);
      expect(result.nextCursor).toBeDefined();
    });

    it("should throw UNAUTHORIZED when friend belongs to different user", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockFriend = createTestFriend("different-user-id", {
        id: friendId,
      });

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(
        mockFriend,
      );

      await expect(caller.getByFriend({ friendId, limit: 20 })).rejects.toThrow(
        TRPCError,
      );

      await expect(
        caller.getByFriend({ friendId, limit: 20 }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw NOT_FOUND when friend doesn't exist", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "clnonexistent1234567890";

      mockCtx.db.friend.findUnique = (jest.fn() as any).mockResolvedValue(null);

      await expect(caller.getByFriend({ friendId, limit: 20 })).rejects.toThrow(
        TRPCError,
      );

      await expect(
        caller.getByFriend({ friendId, limit: 20 }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("deleteRollback", () => {
    it("should delete assistant message and preceding user message", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockAssistantMessage = {
        id: "classist12345678901234567",
        role: "assistant",
        content: "AI response",
        userId: "test-user-id",
        friendId,
        createdAt: new Date("2024-10-01T12:01:00"),
        friend: {
          ...createTestFriend("test-user-id", { id: friendId }),
          userId: "test-user-id",
        },
      };

      const mockUserMessage = {
        id: "cluser123456789012345678",
        role: "user",
        content: "User question",
        userId: "test-user-id",
        friendId,
        createdAt: new Date("2024-10-01T12:00:00"),
      };

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        mockAssistantMessage,
      );
      mockCtx.db.message.findFirst = (jest.fn() as any).mockResolvedValue(
        mockUserMessage,
      );

      const deleteMock = (jest.fn() as any).mockResolvedValue({});
      mockCtx.db.$transaction = (jest.fn() as any).mockImplementation(
        async (callback: any) => {
          return callback({
            message: { delete: deleteMock },
          });
        },
      );

      const result = await caller.deleteRollback({
        assistantMessageId: "classist12345678901234567",
      });

      expect(result.success).toBe(true);
      expect(result.deletedIds).toHaveLength(2);
      expect(result.deletedIds).toContain("classist12345678901234567");
      expect(result.deletedIds).toContain("cluser123456789012345678");
      expect(deleteMock).toHaveBeenCalledTimes(2);
    });

    it("should delete only assistant message if no user message before it", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockAssistantMessage = {
        id: "clintro12345678901234567",
        role: "assistant",
        content: "Welcome message",
        userId: "test-user-id",
        friendId,
        createdAt: new Date(),
        friend: {
          ...createTestFriend("test-user-id", { id: friendId }),
          userId: "test-user-id",
        },
      };

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        mockAssistantMessage,
      );
      mockCtx.db.message.findFirst = (jest.fn() as any).mockResolvedValue(null);

      const deleteMock = (jest.fn() as any).mockResolvedValue({});
      mockCtx.db.$transaction = (jest.fn() as any).mockImplementation(
        async (callback: any) => {
          return callback({
            message: { delete: deleteMock },
          });
        },
      );

      const result = await caller.deleteRollback({
        assistantMessageId: "clintro12345678901234567",
      });

      expect(result.success).toBe(true);
      expect(result.deletedIds).toHaveLength(1);
      expect(result.deletedIds).toContain("clintro12345678901234567");
      expect(deleteMock).toHaveBeenCalledTimes(1);
    });

    it("should throw UNAUTHORIZED when message belongs to different user", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockAssistantMessage = {
        id: "classist12345678901234567",
        role: "assistant",
        content: "AI response",
        userId: "test-user-id",
        friendId,
        createdAt: new Date(),
        friend: {
          ...createTestFriend("different-user-id", { id: friendId }),
          userId: "different-user-id",
        },
      };

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        mockAssistantMessage,
      );

      await expect(
        caller.deleteRollback({ assistantMessageId: "classist12345678901234567" }),
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.deleteRollback({ assistantMessageId: "classist12345678901234567" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should throw NOT_FOUND when message doesn't exist", async () => {
      const caller = messageRouter.createCaller(mockCtx);

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        null,
      );

      await expect(
        caller.deleteRollback({
          assistantMessageId: "clnonexistent1234567890",
        }),
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.deleteRollback({
          assistantMessageId: "clnonexistent1234567890",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("should throw BAD_REQUEST when trying to delete user message", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockUserMessage = {
        id: "cluser123456789012345678",
        role: "user",
        content: "User message",
        userId: "test-user-id",
        friendId,
        createdAt: new Date(),
        friend: {
          ...createTestFriend("test-user-id", { id: friendId }),
          userId: "test-user-id",
        },
      };

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        mockUserMessage,
      );

      await expect(
        caller.deleteRollback({ assistantMessageId: "cluser123456789012345678" }),
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.deleteRollback({ assistantMessageId: "cluser123456789012345678" }),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("should use transaction to ensure atomic deletion", async () => {
      const caller = messageRouter.createCaller(mockCtx);
      const friendId = "cltest1234567890123456";

      const mockAssistantMessage = {
        id: "classist12345678901234567",
        role: "assistant",
        content: "AI response",
        userId: "test-user-id",
        friendId,
        createdAt: new Date("2024-10-01T12:01:00"),
        friend: {
          ...createTestFriend("test-user-id", { id: friendId }),
          userId: "test-user-id",
        },
      };

      const mockUserMessage = {
        id: "cluser123456789012345678",
        role: "user",
        content: "User question",
        userId: "test-user-id",
        friendId,
        createdAt: new Date("2024-10-01T12:00:00"),
      };

      mockCtx.db.message.findUnique = (jest.fn() as any).mockResolvedValue(
        mockAssistantMessage,
      );
      mockCtx.db.message.findFirst = (jest.fn() as any).mockResolvedValue(
        mockUserMessage,
      );

      const transactionMock = (jest.fn() as any).mockImplementation(
        async (callback: any) => {
          return callback({
            message: { delete: (jest.fn() as any).mockResolvedValue({}) },
          });
        },
      );
      mockCtx.db.$transaction = transactionMock;

      await caller.deleteRollback({ assistantMessageId: "classist12345678901234567" });

      // Verify transaction was used
      expect(transactionMock).toHaveBeenCalledTimes(1);
    });
  });
});
