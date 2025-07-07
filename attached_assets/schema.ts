import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  decimal,
  boolean,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 })
    .notNull()
    .$type<"admin" | "veterinarian" | "compounder" | "staff" | "client">(),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  department: varchar("department", { length: 100 }),
  specialization: varchar("specialization", { length: 100 }),
  isActive: boolean("is_active").default(true),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pets table
export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }),
  age: integer("age"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  color: varchar("color", { length: 100 }),
  gender: varchar("gender", { length: 10 }).$type<"male" | "female">(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  avatar: text("avatar"),
  microchipId: varchar("microchip_id", { length: 50 }),
  nextVaccination: timestamp("next_vaccination"),
  lastCheckup: timestamp("last_checkup"),
  lastVisit: timestamp("last_visit"),
  healthTips: text("health_tips").array(),
  dietRecommendations: text("diet_recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  veterinarianId: uuid("veterinarian_id")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  duration: integer("duration").default(30),
  type: varchar("type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 })
    .notNull()
    .$type<
      "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
    >(),
  priority: varchar("priority", { length: 20 })
    .notNull()
    .$type<"low" | "normal" | "high" | "emergency">(),
  notes: text("notes"),
  symptoms: text("symptoms"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical records table
export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  veterinarianId: uuid("veterinarian_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  attachments: text("attachments").array(),
  prescriptions: jsonb("prescriptions"),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 })
    .notNull()
    .$type<"pending" | "paid" | "overdue" | "cancelled">(),
  dueDate: date("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  currentStock: integer("current_stock").notNull(),
  minStock: integer("min_stock").notNull(),
  maxStock: integer("max_stock").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  expiryDate: date("expiry_date"),
  status: varchar("status", { length: 50 })
    .notNull()
    .$type<"active" | "discontinued" | "out_of_stock">(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id").references(() => pets.id),
  taskDescription: text("task_description").notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 20 })
    .notNull()
    .$type<"low" | "normal" | "high">(),
  completed: boolean("completed").default(false),
  recurring: boolean("recurring").default(false),
  reminders: jsonb("reminders"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vital signs table
export const vitalSigns = pgTable("vital_signs", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pets.id),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  temperature: decimal("temperature", { precision: 4, scale: 1 }),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  bloodPressure: varchar("blood_pressure", { length: 20 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  recordedBy: uuid("recorded_by")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
});

// Training modules table
export const trainingModules = pgTable("training_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  duration: integer("duration").notNull(),
  difficulty: varchar("difficulty", { length: 20 })
    .notNull()
    .$type<"beginner" | "intermediate" | "advanced">(),
  image: text("image"),
  description: text("description"),
  prerequisites: text("prerequisites").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 10 }),
  category: varchar("category", { length: 100 }),
  unlocked: boolean("unlocked").default(false),
  date: timestamp("date"),
  requirements: jsonb("requirements"),
  points: integer("points").default(0),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}),
  isRead: boolean("is_read").default(false),
  read: boolean("read").default(false), // Keep for backward compatibility
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Push notification subscriptions for mobile apps
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  deviceToken: text("device_token").notNull(),
  platform: varchar("platform", { length: 20 })
    .notNull()
    .$type<"ios" | "android" | "web">(),
  deviceInfo: jsonb("device_info").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial reports cache
export const financialReports = pgTable("financial_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  parameters: jsonb("parameters").default({}),
  data: jsonb("data").notNull(),
  generatedBy: uuid("generated_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Inventory alerts
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => inventoryItems.id),
  alertType: varchar("alert_type", { length: 50 })
    .notNull()
    .$type<"low_stock" | "expiry_soon" | "expired" | "discontinued">(),
  message: text("message").notNull(),
  threshold: integer("threshold"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  invoices: many(invoices),
  achievements: many(achievements),
  notifications: many(notifications),
  vitalSigns: many(vitalSigns),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id],
  }),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  tasks: many(tasks),
  vitalSigns: many(vitalSigns),
}));

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    pet: one(pets, {
      fields: [appointments.petId],
      references: [pets.id],
    }),
    owner: one(users, {
      fields: [appointments.ownerId],
      references: [users.id],
    }),
    veterinarian: one(users, {
      fields: [appointments.veterinarianId],
      references: [users.id],
    }),
    medicalRecords: many(medicalRecords),
    invoices: many(invoices),
  }),
);

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [medicalRecords.petId],
    references: [pets.id],
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
  veterinarian: one(users, {
    fields: [medicalRecords.veterinarianId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  appointment: one(appointments, {
    fields: [invoices.appointmentId],
    references: [appointments.id],
  }),
  client: one(users, {
    fields: [invoices.clientId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  pet: one(pets, {
    fields: [tasks.petId],
    references: [pets.id],
  }),
}));

export const vitalSignsRelations = relations(vitalSigns, ({ one }) => ({
  pet: one(pets, {
    fields: [vitalSigns.petId],
    references: [pets.id],
  }),
  recorder: one(users, {
    fields: [vitalSigns.recordedBy],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const financialReportsRelations = relations(
  financialReports,
  ({ one }) => ({
    generatedBy: one(users, {
      fields: [financialReports.generatedBy],
      references: [users.id],
    }),
  }),
);

export const inventoryAlertsRelations = relations(
  inventoryAlerts,
  ({ one }) => ({
    item: one(inventoryItems, {
      fields: [inventoryAlerts.itemId],
      references: [inventoryItems.id],
    }),
  }),
);

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  refreshToken: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(
  medicalRecords,
).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(
  inventoryItems,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertVitalSignsSchema = createInsertSchema(vitalSigns).omit({
  id: true,
  lastUpdated: true,
});

export const insertTrainingModuleSchema = createInsertSchema(
  trainingModules,
).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(
  pushSubscriptions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialReportSchema = createInsertSchema(
  financialReports,
).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryAlertSchema = createInsertSchema(
  inventoryAlerts,
).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type VitalSigns = typeof vitalSigns.$inferSelect;
export type InsertVitalSigns = z.infer<typeof insertVitalSignsSchema>;
export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<
  typeof insertPushSubscriptionSchema
>;
export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;

// Login schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
