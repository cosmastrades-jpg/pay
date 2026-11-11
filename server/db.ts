import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { darajaRequests, type InsertDarajaRequest, users, type InsertUser } from "../drizzle/schema";
import type { TrackedRequest } from "./_core/index";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = values[field]; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function saveDarajaRequest(record: TrackedRequest) {
  const db = await getDb();
  if (!db) return false;
  const values: InsertDarajaRequest = {
    requestId: record.id,
    requestType: record.type,
    referenceId: record.reference,
    endpoint: record.endpoint,
    status: record.status,
    resultCode: record.resultCode,
    resultDescription: record.resultDescription,
    responseTimeMs: record.responseMs,
    requestMeta: record.requestMeta,
    responseData: record.responseData,
    requestedAt: new Date(record.requestedAt),
    completedAt: new Date(record.completedAt),
  };
  await db.insert(darajaRequests).values(values).onDuplicateKeyUpdate({ set: values });
  return true;
}

export async function listDarajaRequests(): Promise<TrackedRequest[] | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(darajaRequests).orderBy(desc(darajaRequests.requestedAt)).limit(250);
  return rows.map((row) => ({
    id: row.requestId, type: row.requestType, reference: row.referenceId || "—", endpoint: row.endpoint,
    status: row.status, resultCode: row.resultCode || "—", resultDescription: row.resultDescription || "No result description supplied.",
    responseMs: row.responseTimeMs || 0, requestedAt: row.requestedAt.toISOString(), completedAt: (row.completedAt || row.requestedAt).toISOString(),
    requestMeta: row.requestMeta || "{}", responseData: row.responseData || "{}",
  }));
}
