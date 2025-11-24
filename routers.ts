import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { addComment, getCommentsByArticle, deleteComment, addLike, removeLike, getLikesByArticle, hasUserLiked, recordArticleView, getTopArticles, addFavorite, removeFavorite, getUserFavorites, isFavorite, recordActivity, getUserActivityHistory, getUserStats, updateUserProfile } from "./db";
import { generateChatbotResponse } from "./chatbot";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  comments: router({
    add: protectedProcedure
      .input(z.object({ articleId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await addComment(input.articleId, ctx.user.id, input.content);
      }),
    getByArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return await getCommentsByArticle(input.articleId);
      }),
    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteComment(input.commentId, 0);
      }),
  }),

  likes: router({
    add: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await addLike(input.articleId, ctx.user.id);
      }),
    remove: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await removeLike(input.articleId, ctx.user.id);
      }),
    count: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return await getLikesByArticle(input.articleId);
      }),
    hasUserLiked: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await hasUserLiked(input.articleId, ctx.user.id);
      }),
  }),

  analytics: router({
    recordView: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input }) => {
        await recordArticleView(input.articleId);
        return { success: true };
      }),
    getTopArticles: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getTopArticles(input.limit || 10);
      }),
  }),

  chatbot: router({
    ask: publicProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ input }) => {
        const response = await generateChatbotResponse(input.message);
        return { response };
      }),
  }),

  profile: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const stats = await getUserStats(ctx.user.id);
        return { user: ctx.user, stats };
      }),
    getActivityHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserActivityHistory(ctx.user.id, input.limit || 20);
      }),
    getFavorites: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserFavorites(ctx.user.id);
      }),
    addFavorite: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await addFavorite(ctx.user.id, input.articleId);
      }),
    removeFavorite: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await removeFavorite(ctx.user.id, input.articleId);
      }),
    isFavorite: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await isFavorite(ctx.user.id, input.articleId);
      }),
    recordActivity: protectedProcedure
      .input(z.object({ articleId: z.number(), activityType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await recordActivity(ctx.user.id, input.articleId, input.activityType);
        return { success: true };
      }),
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const updated = await updateUserProfile(ctx.user.id, input.name, input.image);
        return updated ? { success: true, user: updated } : { success: false };
      }),
  }),
});

export type AppRouter = typeof appRouter;
