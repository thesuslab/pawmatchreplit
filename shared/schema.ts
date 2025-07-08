import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("client"), // admin, veterinarian, staff, client
  phone: text("phone"),
  department: text("department"),
  specialization: text("specialization"),
  avatar: text("avatar"),
  bio: text("bio"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // Compatible with seed data
  userId: integer("user_id"), // Keep for backwards compatibility
  name: text("name").notNull(),
  species: text("species"), // Dog, Cat, etc from seed data
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  weight: text("weight"), // From seed data
  color: text("color"), // From seed data
  gender: text("gender").notNull(),
  bio: text("bio"),
  isPublic: boolean("is_public").default(true),
  profileImage: text("profile_image"),
  avatar: text("avatar"), // Compatible with seed data
  photos: text("photos").array().default([]),
  microchipId: text("microchip_id"), // From seed data
  nextVaccination: timestamp("next_vaccination"), // From seed data
  lastCheckup: timestamp("last_checkup"), // From seed data
  lastVisit: timestamp("last_visit"), // From seed data
  healthTips: text("health_tips").array().default([]), // From seed data
  dietRecommendations: text("diet_recommendations"), // From seed data
  aiRecommendations: text("ai_recommendations"),
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
  appointmentId: integer("appointment_id"), // From seed data
  veterinarianId: integer("veterinarian_id"), // From seed data
  title: text("title").notNull(),
  description: text("description"),
  diagnosis: text("diagnosis"), // From seed data
  treatment: text("treatment"), // From seed data
  notes: text("notes"), // From seed data
  cost: text("cost"), // From seed data
  attachments: text("attachments").array().default([]), // From seed data
  prescriptions: text("prescriptions"), // JSON string from seed data
  date: timestamp("date").notNull(),
  recordType: text("record_type").notNull(), // vaccination, checkup, surgery, medication
  type: text("type"), // wellness, surgery from seed data
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

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  petId1: integer("pet_id_1").notNull(),
  petId2: integer("pet_id_2").notNull(),
  isMatch: boolean("is_match").default(false),
  swipeDirection: text("swipe_direction").notNull(), // "left" or "right"
  timestamp: timestamp("timestamp").defaultNow(),
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
}).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

export const insertMatchSchema = createInsertSchema(matches).omit({
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
export type Match = typeof matches.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
