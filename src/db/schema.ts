import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestedBy: text("requestedBy").notNull(),
  submittedByUserId: uuid("submittedByUserId"),
  farmLocation: text("farmLocation").notNull(),
  category: text("category").notNull(),
  itemDetails: text("itemDetails").notNull(),
  urgency: text("urgency").default("Low").notNull(),
  quantity: text("quantity").default("1"),
  supplier: text("supplier"),
  fileUrls: jsonb("fileUrls").$type<string[]>(),
  managerComment: text("managerComment"),
  directorComment: text("directorComment"),
  status: text("status").default("PENDING").notNull(),
  managerApprovalDate: timestamp("managerApprovalDate"),
  directorApprovalDate: timestamp("directorApprovalDate"),
  orderPlacedDate: timestamp("orderPlacedDate"),
  orderReceivedDate: timestamp("orderReceivedDate"),
  orderPickedUpDate: timestamp("orderPickedUpDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  email: text("email").notNull().unique(),
  cell: text("cell"),
  password: text("password").notNull(),
  role: text("role").default("USER").notNull(),
  managerId: uuid("managerId"),
  locationId: uuid("locationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
