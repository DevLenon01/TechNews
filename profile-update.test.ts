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

describe("profile.updateProfile", () => {
  it("should update user name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.updateProfile({
      name: "Updated Name",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.name).toBe("Updated Name");
  });

  it("should update user image", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.profile.updateProfile({
      image: imageUrl,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.image).toBe(imageUrl);
  });

  it("should update both name and image", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.profile.updateProfile({
      name: "New Name",
      image: imageUrl,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.name).toBe("New Name");
    expect(result.user?.image).toBe(imageUrl);
  });

  it("should handle empty updates gracefully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.updateProfile({});

    expect(result).toBeDefined();
  });

  it("should return updated user object", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.updateProfile({
      name: "Updated Name",
    });

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe(ctx.user.id);
    expect(result.user?.name).toBe("Updated Name");
    expect(result.user?.openId).toBeDefined();
  });
});
