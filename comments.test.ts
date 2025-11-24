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

describe("comments router", () => {
  it("should add a comment successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.add({
      articleId: 1,
      content: "Great article!",
    });

    expect(result).toBeDefined();
    expect(result?.content).toBe("Great article!");
    expect(result?.articleId).toBe(1);
    expect(result?.userId).toBe(1);
  });

  it("should get comments by article", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a comment first
    await caller.comments.add({
      articleId: 1,
      content: "Test comment",
    });

    // Get comments
    const comments = await caller.comments.getByArticle({ articleId: 1 });

    expect(Array.isArray(comments)).toBe(true);
  });

  it("should delete a comment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add a comment
    const comment = await caller.comments.add({
      articleId: 1,
      content: "To be deleted",
    });

    // Delete the comment
    const result = await caller.comments.delete({ commentId: comment?.id || 1 });

    expect(result).toBe(true);
  });
});
