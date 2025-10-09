import { eq } from "drizzle-orm";
import { NewUser, User, users } from "../entities";
import { db } from "../utils/database";
import logger from "../utils/logger";

export class UserRepository {
  async create(userData: NewUser): Promise<User | undefined> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      if (user) {
        return user;
      }
      logger.error("User not created.");
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user ?? null;
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user ?? null;
    } catch (error) {
      logger.error("Error finding user by id:", error);
      throw error;
    }
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user ?? null;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }
}
