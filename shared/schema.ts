import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("member"), // 'admin', 'member'
  avatar: text("avatar").default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Family table to group users
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const insertFamilySchema = createInsertSchema(families).pick({
  name: true,
  createdBy: true,
});

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

// Family members association
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").notNull().references(() => families.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).pick({
  familyId: true,
  userId: true,
});

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'running', 'weight_training', etc.
  icon: text("icon").notNull().default("directions_run"),
  duration: integer("duration").notNull(), // in minutes
  steps: integer("steps"), // optional, for step-based activities
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  name: true,
  type: true,
  icon: true,
  duration: true,
  steps: true,
  date: true,
  userId: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'daily', 'weekly', etc.
  targetValue: integer("target_value").notNull(), // steps, minutes, etc.
  currentValue: integer("current_value").notNull().default(0),
  unit: text("unit").notNull(), // 'steps', 'minutes', etc.
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  type: true,
  targetValue: true,
  currentValue: true,
  unit: true,
  completed: true,
  userId: true,
  dueDate: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Schedule events
export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: text("type").notNull().default("task"), // 'exercise', 'task', 'meal', etc.
  color: text("color").notNull().default("primary"), // color code for UI
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).pick({
  title: true,
  startTime: true,
  endTime: true,
  type: true,
  color: true,
  createdBy: true,
});

export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;

// Event assignees (who is assigned to the event)
export const eventAssignees = pgTable("event_assignees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => scheduleEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertEventAssigneeSchema = createInsertSchema(eventAssignees).pick({
  eventId: true,
  userId: true,
});

export type InsertEventAssignee = z.infer<typeof insertEventAssigneeSchema>;
export type EventAssignee = typeof eventAssignees.$inferSelect;

// Health Tips
export const healthTips = pgTable("health_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("general"), // 'nutrition', 'fitness', 'general'
  icon: text("icon").notNull().default("lightbulb"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHealthTipSchema = createInsertSchema(healthTips).pick({
  title: true,
  content: true,
  type: true,
  icon: true,
});

export type InsertHealthTip = z.infer<typeof insertHealthTipSchema>;
export type HealthTip = typeof healthTips.$inferSelect;

// Progress/Stats tracking
export const activityStats = pgTable("activity_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  activityType: text("activity_type").notNull(), // 'steps', 'exercise_minutes', etc.
  value: real("value").notNull(),
});

export const insertActivityStatSchema = createInsertSchema(activityStats).pick({
  userId: true,
  date: true,
  activityType: true,
  value: true,
});

export type InsertActivityStat = z.infer<typeof insertActivityStatSchema>;
export type ActivityStat = typeof activityStats.$inferSelect;
