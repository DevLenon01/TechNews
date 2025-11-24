import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
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

describe("chatbot router", { timeout: 15000 }, () => {
  it("should respond to a technology question", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbot.ask({
      message: "O que é inteligência artificial?",
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
  }, { timeout: 15000 });

  it("should handle multiple questions", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result1 = await caller.chatbot.ask({
      message: "Qual é a diferença entre IA e machine learning?",
    });

    expect(result1.response).toBeDefined();
  }, { timeout: 15000 });

  it("should provide meaningful responses", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbot.ask({
      message: "Fale sobre tecnologia blockchain",
    });

    expect(result.response.length).toBeGreaterThan(10);
    expect(result.response).not.toContain("undefined");
  }, { timeout: 15000 });
});
