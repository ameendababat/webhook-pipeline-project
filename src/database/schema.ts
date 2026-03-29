import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================
export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "success",
  "failed",
]);

// ============================================
// TABLES
// ============================================

// pipelines - Main configuration table
// Relationships:
//   - Has many subscribers (one pipeline → many subscribers)
//   - Has many jobs (one pipeline → many jobs)
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// subscribers - Webhook endpoints for each pipeline
// Relationships:
//   - Belongs to one pipeline (many subscribers → one pipeline)
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id")
    .references(() => pipelines.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// jobs - Processing tasks for pipelines
// Relationships:
//   - Belongs to one pipeline (many jobs → one pipeline)
//   - Has many deliveries (one job → many deliveries)
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id")
    .references(() => pipelines.id, { onDelete: "cascade" })
    .notNull(),
  status: jobStatusEnum("status").default("pending").notNull(),
  payload: jsonb("payload").notNull(),
  processedPayload: jsonb("processed_payload"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// deliveries - Delivery attempts to subscribers
// Relationships:
//   - Belongs to one job (many deliveries → one job)
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  subscriberUrl: text("subscriber_url").notNull(),
  status: deliveryStatusEnum("status").default("pending").notNull(),
  attempt: integer("attempt").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
});

// ============================================
// RELATIONSHIPS
// ============================================
export const pipelinesRelations = relations(pipelines, ({ many }) => ({
  subscribers: many(subscribers), // A pipeline can have many subscribers
  jobs: many(jobs), // A pipeline can have many jobs
}));

// Subscriber → Pipeline (many-to-one)
export const subscribersRelations = relations(subscribers, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [subscribers.pipelineId],
    references: [pipelines.id],
  }),
}));

// Job → Pipeline & Deliveries
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  pipeline: one(pipelines, {
    // A job belongs to one pipeline
    fields: [jobs.pipelineId],
    references: [pipelines.id],
  }),
  deliveries: many(deliveries), // A job can have many delivery attempts
}));

// Delivery → Job (many-to-one)
export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  job: one(jobs, {
    fields: [deliveries.jobId],
    references: [jobs.id],
  }),
}));
