import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import type { Session } from "next-auth";
import type { Friend, Message } from "~/types";
import type { PrismaClient } from "@prisma/client";

// Helper to generate CU ID-like strings
const generateCuid = () => {
  return `cl${faker.string.alphanumeric(24)}`;
};

/**
 * Create a mock tRPC context for testing
 */
export const createMockContext = (overrides?: {
  session?: Session | null;
  db?: Partial<PrismaClient>;
}) => {
  const defaultSession: Session = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  return {
    db: (overrides?.db ?? createMockDb()) as PrismaClient,
    session: overrides?.session ?? defaultSession,
    headers: new Headers(),
  };
};

/**
 * Create a mock Prisma client for testing
 */
export const createMockDb = () => {
  return {
    friend: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
};

/**
 * Factory to create a test Friend
 */
export const createTestFriend = (
  userId: string,
  overrides?: Partial<Friend>,
): Friend => {
  return {
    id: generateCuid(),
    name: faker.person.firstName(),
    personality: faker.lorem.sentence(),
    age: faker.number.int({ min: 18, max: 80 }),
    gender: faker.helpers.arrayElement(["male", "female", "non_binary"]),
    traits: [faker.lorem.word(), faker.lorem.word()],
    voice: "casual",
    background: faker.lorem.paragraph(),
    interests: [faker.lorem.word(), faker.lorem.word()],
    avatar: faker.image.avatar(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Friend;
};

/**
 * Factory to create a test Message
 */
export const createTestMessage = (
  userId: string,
  friendId: string,
  overrides?: Partial<Message>,
): Message => {
  return {
    id: generateCuid(),
    role: faker.helpers.arrayElement(["user", "assistant"]),
    content: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  } as Message;
};

/**
 * Factory to create a test User
 */
export const createTestUser = (overrides?: {
  id?: string;
  name?: string;
  email?: string;
  subscriptionTier?: string;
  messagesUsedToday?: number;
  createdAt?: Date;
}) => {
  return {
    id: overrides?.id ?? generateCuid(),
    name: overrides?.name ?? faker.person.fullName(),
    email: overrides?.email ?? faker.internet.email(),
    emailVerified: new Date(),
    image: faker.image.avatar(),
    gender: null,
    subscriptionTier: overrides?.subscriptionTier ?? "free",
    subscriptionStatus: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    subscriptionStartedAt: null,
    subscriptionEndsAt: null,
    subscriptionCanceledAt: null,
    messagesUsedToday: overrides?.messagesUsedToday ?? 0,
    dailyQuotaResetAt: new Date(),
    createdAt: overrides?.createdAt ?? new Date(),
    updatedAt: new Date(),
  };
};
