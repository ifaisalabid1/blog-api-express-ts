import { and, eq, sql, desc } from "drizzle-orm";
import { NewPost, Post, posts, users } from "../entities";
import { db } from "../utils/database";
import logger from "../utils/logger";

export class PostRepository {
  async create(postData: NewPost): Promise<Post | undefined> {
    try {
      const [post] = await db.insert(posts).values(postData).returning();
      if (post) {
        return post;
      }
      logger.error("Post not created.");
    } catch (error) {
      logger.error("Error creating post:", error);
      throw error;
    }
  }

  async findById(
    id: number
  ): Promise<
    (Post & { author: { name: string; email: string } | null }) | null
  > {
    try {
      const [post] = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          excerpt: posts.excerpt,
          slug: posts.slug,
          isPublished: posts.isPublished,
          authorId: posts.authorId,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          publishedAt: posts.publishedAt,
          author: {
            name: users.name,
            email: users.email,
          },
        })
        .from(posts)
        .where(eq(posts.id, id))
        .leftJoin(users, eq(posts.authorId, users.id));

      return post ?? null;
    } catch (error) {
      logger.error("Error finding post by id:", error);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    publishedOnly: boolean = true
  ): Promise<{
    posts: (Post & { author: { name: string } | null })[];
    total: number;
  }> {
    try {
      const whereConditions = publishedOnly
        ? and(eq(posts.isPublished, true))
        : undefined;

      const postsData = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          excerpt: posts.excerpt,
          slug: posts.slug,
          isPublished: posts.isPublished,
          authorId: posts.authorId,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          publishedAt: posts.publishedAt,
          author: {
            name: users.name,
          },
        })
        .from(posts)
        .where(whereConditions)
        .leftJoin(users, eq(posts.authorId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ count }]: any = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(whereConditions);

      return {
        posts: postsData,
        total: Number(count),
      };
    } catch (error) {
      logger.error("Error finding posts:", error);
      throw error;
    }
  }

  async update(id: number, postData: Partial<Post>): Promise<Post | null> {
    try {
      const [post] = await db
        .update(posts)
        .set({ ...postData, updatedAt: new Date() })
        .where(eq(posts.id, id))
        .returning();
      return post ?? null;
    } catch (error) {
      logger.error("Error updating post:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await db.delete(posts).where(eq(posts.id, id));
      return true;
    } catch (error) {
      logger.error("Error deleting post:", error);
      throw error;
    }
  }

  async findByAuthor(authorId: number, page: number = 1, limit: number = 10) {
    try {
      const postsData = await db
        .select()
        .from(posts)
        .where(eq(posts.authorId, authorId))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ count }]: any = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.authorId, authorId));

      return {
        posts: postsData,
        total: Number(count),
      };
    } catch (error) {
      logger.error("Error finding posts by author:", error);
      throw error;
    }
  }
}
