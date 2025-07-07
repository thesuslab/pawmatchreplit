import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  bio: text("bio"),
  isPublic: boolean("is_public").default(true),
  profileImage: text("profile_image"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  location: text("location"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  recordType: text("record_type").notNull(), // vaccination, checkup, medication, etc.
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  nextDue: timestamp("next_due"),
  isCompleted: boolean("is_completed").default(false),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followedPetId: integer("followed_pet_id").notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  timestamp: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
