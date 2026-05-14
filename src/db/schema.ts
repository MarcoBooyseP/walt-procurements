import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestedBy: text("requestedBy").notNull(),
  farmLocation: text("farmLocation").notNull(),
  category: text("category").notNull(),
  itemDetails: text("itemDetails").notNull(),
  urgency: text("urgency").default("Low").notNull(),
  fileUrls: jsonb("fileUrls").$type<string[]>(),
  managerComment: text("managerComment"),
  status: text("status").default("PENDING").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
