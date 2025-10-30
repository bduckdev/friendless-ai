import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { seedDefaultFriends, hasDefaultFriendsSeeded } from "./seed-friends";
import { db } from "~/server/db";
import { DEFAULT_FRIENDS_TEMPLATE } from "~/lib/default-friends-template";

// Mock the database
jest.mock("~/server/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    friend: {
      create: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("seedDefaultFriends", () => {
  const testUserId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should create 6 friends for a new user", async () => {
      // Mock user without seeded friends
      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      // Mock transaction to execute the callback
      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback({
          friend: {
            create: jest.fn().mockResolvedValue({ id: "friend-id" }),
          },
          message: {
            create: jest.fn().mockResolvedValue({ id: "msg-id" }),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await seedDefaultFriends(testUserId);

      expect(result).toHaveLength(6);
      expect(db.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should create intro message for each friend", async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: "friend-id" });
      const mockMessageCreate = jest.fn().mockResolvedValue({ id: "msg-id" });

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        const result = await callback({
          friend: { create: mockCreate },
          message: { create: mockMessageCreate },
          user: { update: jest.fn() },
        });
        return result;
      });

      await seedDefaultFriends(testUserId);

      // Should create 6 messages (one per friend)
      expect(mockMessageCreate).toHaveBeenCalledTimes(6);

      // Check first message
      expect(mockMessageCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "assistant",
            userId: testUserId,
          }),
        }),
      );
    });

    it("should use correct friend templates", async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: "friend-id" });

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback({
          friend: { create: mockCreate },
          message: { create: jest.fn().mockResolvedValue({ id: "msg-id" }) },
          user: { update: jest.fn() },
        });
      });

      await seedDefaultFriends(testUserId);

      // Verify 6 friends were created
      expect(mockCreate).toHaveBeenCalledTimes(6);

      // Verify correct names were used (check first call has Luna)
      const firstCall = mockCreate.mock.calls[0] as any;
      expect(firstCall[0].data.name).toBe("Luna");

      // Verify last call has Sage
      const lastCall = mockCreate.mock.calls[5] as any;
      expect(lastCall[0].data.name).toBe("Sage");
      expect(lastCall[0].data.gender).toBe("non_binary");
    });

    it("should set avatars to correct paths", async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: "friend-id" });

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback({
          friend: { create: mockCreate },
          message: { create: jest.fn().mockResolvedValue({ id: "msg-id" }) },
          user: { update: jest.fn() },
        });
      });

      await seedDefaultFriends(testUserId);

      // Check Luna's avatar
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Luna",
            avatar: "/avatars/Luna.jpeg",
          }),
        }),
      );
    });

    it("should mark user as having default friends seeded", async () => {
      const mockUserUpdate = jest.fn().mockResolvedValue({});

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback({
          friend: {
            create: jest.fn().mockResolvedValue({ id: "friend-id" }),
          },
          message: {
            create: jest.fn().mockResolvedValue({ id: "msg-id" }),
          },
          user: {
            update: mockUserUpdate,
          },
        });
      });

      await seedDefaultFriends(testUserId);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: { defaultFriendsSeeded: true },
      });
    });
  });

  describe("Idempotency", () => {
    it("should not create duplicates if already seeded", async () => {
      // Mock user with already seeded friends
      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: true,
      });

      const result = await seedDefaultFriends(testUserId);

      expect(result).toEqual([]);
      expect(db.$transaction).not.toHaveBeenCalled();
    });

    it("should log message when already seeded", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: true,
      });

      await seedDefaultFriends(testUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already has default friends seeded"),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(seedDefaultFriends(testUserId)).rejects.toThrow(
        "Failed to seed default friends",
      );
    });

    it("should log error when seeding fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      (db.user.findUnique as any).mockResolvedValue({
        defaultFriendsSeeded: false,
      });

      (db.$transaction as any).mockRejectedValue(new Error("DB Error"));

      await expect(seedDefaultFriends(testUserId)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to seed default friends"),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe("hasDefaultFriendsSeeded", () => {
  const testUserId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if user has friends seeded", async () => {
    (db.user.findUnique as any).mockResolvedValue({
      defaultFriendsSeeded: true,
    });

    const result = await hasDefaultFriendsSeeded(testUserId);

    expect(result).toBe(true);
  });

  it("should return false if user does not have friends seeded", async () => {
    (db.user.findUnique as any).mockResolvedValue({
      defaultFriendsSeeded: false,
    });

    const result = await hasDefaultFriendsSeeded(testUserId);

    expect(result).toBe(false);
  });

  it("should return false if user not found", async () => {
    (db.user.findUnique as any).mockResolvedValue(null);

    const result = await hasDefaultFriendsSeeded(testUserId);

    expect(result).toBe(false);
  });
});
