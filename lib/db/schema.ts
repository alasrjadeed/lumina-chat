import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const account = pgTable(
  "Account",
  {
    id: uuid("id").notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    provider: varchar("provider", { length: 64 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 64 }).notNull(),
    refreshToken: text("refreshToken"),
    accessToken: text("accessToken"),
    expiresAt: timestamp("expiresAt"),
    tokenType: varchar("tokenType", { length: 64 }),
    scope: text("scope"),
    idToken: text("idToken"),
    sessionState: text("sessionState"),
  },
  (table) => ({
    providerAccountId: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  })
);

export type Account = InferSelectModel<typeof account>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const lead = pgTable("Lead", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId").references(() => business.id, {
    onDelete: "set null",
  }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  company: text("company"),
  source: varchar("source", {
    enum: ["website", "whatsapp", "call", "email", "social", "manual"],
  })
    .notNull()
    .default("website"),
  status: varchar("status", {
    enum: ["new", "contacted", "qualified", "proposal", "won", "lost"],
  })
    .notNull()
    .default("new"),
  serviceInterest: text("serviceInterest"),
  budget: text("budget"),
  message: text("message"),
  assignedAgent: text("assignedAgent"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Lead = InferSelectModel<typeof lead>;

export const appointment = pgTable("Appointment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId").references(() => business.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  clientName: text("clientName"),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 64 }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  status: varchar("status", {
    enum: ["requested", "scheduled", "confirmed", "cancelled", "completed"],
  })
    .notNull()
    .default("requested"),
  channel: varchar("channel", {
    enum: ["website", "whatsapp", "call", "email", "social", "manual"],
  })
    .notNull()
    .default("website"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Appointment = InferSelectModel<typeof appointment>;

export const emailThread = pgTable("EmailThread", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId").references(() => business.id, {
    onDelete: "set null",
  }),
  from: varchar("from", { length: 320 }),
  subject: text("subject").notNull(),
  lastMessageAt: timestamp("lastMessageAt").notNull().defaultNow(),
  unread: boolean("unread").notNull().default(true),
  leadId: uuid("leadId").references(() => lead.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type EmailThread = InferSelectModel<typeof emailThread>;

export const emailMessage = pgTable("EmailMessage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  threadId: uuid("threadId")
    .notNull()
    .references(() => emailThread.id, { onDelete: "cascade" }),
  from: varchar("from", { length: 320 }),
  to: varchar("to", { length: 320 }),
  subject: text("subject"),
  body: text("body"),
  direction: varchar("direction", { enum: ["inbound", "outbound"] })
    .notNull()
    .default("inbound"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type EmailMessage = InferSelectModel<typeof emailMessage>;

// ============================================================
// Multi-Business Tables
// ============================================================

export const business = pgTable("Business", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  website: text("website"),
  logoUrl: text("logoUrl"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  whatsapp: varchar("whatsapp", { length: 64 }),
  address: text("address"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  hoursOpen: varchar("hoursOpen", { length: 16 }),
  hoursClose: varchar("hoursClose", { length: 16 }),
  hoursDays: text("hoursDays"),
  paymentTerms: text("paymentTerms"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Business = InferSelectModel<typeof business>;

export const businessService = pgTable("BusinessService", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: varchar("category", { length: 64 })
    .notNull()
    .default("custom"),
  description: text("description"),
  price: integer("price").notNull().default(0),
  unit: varchar("unit", { length: 32 }).notNull().default("one-time"),
  durationMonths: integer("durationMonths").notNull().default(1),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type BusinessService = InferSelectModel<typeof businessService>;

export const channel = pgTable("Channel", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(),
  isEnabled: boolean("isEnabled").notNull().default(false),
  config: json("config").notNull().default({}),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Channel = InferSelectModel<typeof channel>;

export const task = pgTable("Task", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  businessId: uuid("businessId")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  leadId: uuid("leadId").references(() => lead.id, {
    onDelete: "set null",
  }),
  chatId: uuid("chatId").references(() => chat.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", {
    enum: ["pending", "in_progress", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  priority: varchar("priority", {
    enum: ["low", "medium", "high", "urgent"],
  })
    .notNull()
    .default("medium"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: varchar("createdBy", { length: 32 }).notNull().default("ai"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Task = InferSelectModel<typeof task>;
