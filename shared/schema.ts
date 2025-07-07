import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // "user" | "admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const procedures = pgTable("procedures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  processingTime: text("processing_time").notNull(),
  description: text("description"),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  qrCode: text("qr_code"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicationCode: text("application_code").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  procedureId: integer("procedure_id").references(() => procedures.id).notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  citizenId: text("citizen_id").notNull(),
  notes: text("notes"),
  documents: jsonb("documents").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"), // "pending" | "processing" | "completed" | "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  rating: integer("rating").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
}));

export const proceduresRelations = relations(procedures, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  procedure: one(procedures, {
    fields: [applications.procedureId],
    references: [procedures.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertProcedureSchema = createInsertSchema(procedures).omit({
  id: true,
  qrCode: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  applicationCode: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Procedure = typeof procedures.$inferSelect;
export type InsertProcedure = z.infer<typeof insertProcedureSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
