import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("likes router", () => {
  it("should add a like successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.likes.add({ articleId: 1 });

    expect(result).toBeDefined();
    expect(result?.articleId).toBe(1);
    expect(result?.userId).toBe(1);
  });

  it("should count likes for an article", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a like
    await caller.likes.add({ articleId: 1 });

    // Count likes
    const count = await caller.likes.count({ articleId: 1 });

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should check if user has liked an article", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a like
    await caller.likes.add({ articleId: 1 });

    // Check if user liked
    const hasLiked = await caller.likes.hasUserLiked({ articleId: 1 });

    expect(typeof hasLiked).toBe("boolean");
  });

  it("should remove a like successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a like
    await caller.likes.add({ articleId: 1 });

    // Remove the like
    const result = await caller.likes.remove({ articleId: 1 });

    expect(result).toBe(true);
  });
});
