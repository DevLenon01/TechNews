import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, comments, likes, analytics, favorites, activityHistory, Comment, Like, Analytic, Favorite, ActivityHistory, User } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Comments queries
export async function addComment(articleId: number, userId: number, content: string): Promise<Comment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(comments).values({
      articleId,
      userId,
      content,
    });
    const result = await db.select().from(comments).where(eq(comments.userId, userId)).orderBy(desc(comments.createdAt)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add comment:", error);
    return null;
  }
}

export async function getCommentsByArticle(articleId: number): Promise<Comment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get comments:", error);
    return [];
  }
}

export async function deleteComment(commentId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(comments).where(eq(comments.id, commentId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete comment:", error);
    return false;
  }
}

// Likes queries
export async function addLike(articleId: number, userId: number): Promise<Like | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(likes).values({
      articleId,
      userId,
    });
    const result = await db.select().from(likes).where(eq(likes.userId, userId)).orderBy(desc(likes.createdAt)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add like:", error);
    return null;
  }
}

export async function removeLike(articleId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(likes).where(eq(likes.articleId, articleId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to remove like:", error);
    return false;
  }
}

export async function getLikesByArticle(articleId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.select().from(likes).where(eq(likes.articleId, articleId));
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to get likes:", error);
    return 0;
  }
}

export async function hasUserLiked(articleId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.select().from(likes).where(eq(likes.articleId, articleId));
    return result.some(like => like.userId === userId);
  } catch (error) {
    console.error("[Database] Failed to check like:", error);
    return false;
  }
}

// Analytics queries
export async function recordArticleView(articleId: number, userId?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const existing = await db.select().from(analytics).where(eq(analytics.articleId, articleId));
    if (existing.length > 0) {
      await db.update(analytics).set({ viewCount: existing[0].viewCount + 1 }).where(eq(analytics.articleId, articleId));
    } else {
      await db.insert(analytics).values({ articleId, userId, viewCount: 1, commentCount: 0, likeCount: 0 });
    }
  } catch (error) {
    console.error("[Database] Failed to record view:", error);
  }
}

export async function getTopArticles(limit: number = 10): Promise<Analytic[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(analytics).orderBy(desc(analytics.viewCount)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get top articles:", error);
    return [];
  }
}


// Favorites queries
export async function addFavorite(userId: number, articleId: number): Promise<Favorite | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(favorites).values({ userId, articleId });
    const result = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add favorite:", error);
    return null;
  }
}

export async function removeFavorite(userId: number, articleId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(favorites).where(eq(favorites.articleId, articleId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to remove favorite:", error);
    return false;
  }
}

export async function getUserFavorites(userId: number): Promise<Favorite[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get favorites:", error);
    return [];
  }
}

export async function isFavorite(userId: number, articleId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.select().from(favorites).where(eq(favorites.userId, userId));
    return result.some(fav => fav.articleId === articleId);
  } catch (error) {
    console.error("[Database] Failed to check favorite:", error);
    return false;
  }
}

// Activity history queries
export async function recordActivity(userId: number, articleId: number, activityType: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(activityHistory).values({ userId, articleId, activityType });
  } catch (error) {
    console.error("[Database] Failed to record activity:", error);
  }
}

export async function getUserActivityHistory(userId: number, limit: number = 20): Promise<ActivityHistory[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(activityHistory).where(eq(activityHistory.userId, userId)).orderBy(desc(activityHistory.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get activity history:", error);
    return [];
  }
}

export async function getUserStats(userId: number): Promise<{ comments: number; likes: number; views: number }> {
  const db = await getDb();
  if (!db) return { comments: 0, likes: 0, views: 0 };

  try {
    const userComments = await db.select().from(comments).where(eq(comments.userId, userId));
    const userLikes = await db.select().from(likes).where(eq(likes.userId, userId));
    const userViews = await db.select().from(activityHistory).where(eq(activityHistory.userId, userId));

    return {
      comments: userComments.length,
      likes: userLikes.length,
      views: userViews.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get user stats:", error);
    return { comments: 0, likes: 0, views: 0 };
  }
}


// User profile update
export async function updateUserProfile(userId: number, name?: string, image?: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) return null;

    await db.update(users).set(updateData).where(eq(users.id, userId));
    
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    return null;
  }
}
