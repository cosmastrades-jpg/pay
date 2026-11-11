import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const darajaRequests = mysqlTable("daraja_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 64 }).notNull().unique(),
  requestType: varchar("requestType", { length: 64 }).notNull(),
  referenceId: varchar("referenceId", { length: 128 }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["success", "pending", "failed", "timeout"]).notNull(),
  resultCode: varchar("resultCode", { length: 64 }),
  resultDescription: text("resultDescription"),
  responseTimeMs: int("responseTimeMs"),
  requestMeta: text("requestMeta"),
  responseData: text("responseData"),
  requestedAt: timestamp("requestedAt").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DarajaRequest = typeof darajaRequests.$inferSelect;
export type InsertDarajaRequest = typeof darajaRequests.$inferInsert;
