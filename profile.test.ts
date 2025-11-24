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

describe("profile router", () => {
  it("should get user profile with stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.getProfile();

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.stats).toBeDefined();
    expect(result.stats.comments).toBeGreaterThanOrEqual(0);
    expect(result.stats.likes).toBeGreaterThanOrEqual(0);
    expect(result.stats.views).toBeGreaterThanOrEqual(0);
  });

  it("should get user activity history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.getActivityHistory({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should add a favorite", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.addFavorite({ articleId: 1 });

    expect(result).toBeDefined();
    expect(result?.articleId).toBe(1);
    expect(result?.userId).toBe(1);
  });

  it("should get user favorites", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a favorite first
    await caller.profile.addFavorite({ articleId: 1 });

    // Get favorites
    const result = await caller.profile.getFavorites();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should check if article is favorite", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a favorite
    await caller.profile.addFavorite({ articleId: 1 });

    // Check if it's favorite
    const result = await caller.profile.isFavorite({ articleId: 1 });

    expect(typeof result).toBe("boolean");
  });

  it("should record activity", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.recordActivity({
      articleId: 1,
      activityType: "view",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should remove a favorite", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a favorite
    await caller.profile.addFavorite({ articleId: 1 });

    // Remove it
    const result = await caller.profile.removeFavorite({ articleId: 1 });

    expect(result).toBe(true);
  });
});
