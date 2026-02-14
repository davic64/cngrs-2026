import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enums
export const statusEnum = pgEnum("registration_status", [
  "pendiente",
  "parcial",
  "completado",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "tarjeta",
  "transferencia",
  "efectivo",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pendiente",
  "revision",
  "completado",
  "rechazado",
]);
export const genderEnum = pgEnum("gender", ["M", "F", "Otro"]);
export const roleEnum = pgEnum("role", ["admin", "user"]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  shirtSize: text("shirt_size").notNull(),
  profilePhotoUrl: text("profile_photo_url"),
  documentUrl: text("document_url"),
  country: text("country").notNull(),
  state: text("state").notNull(),
  locality: text("locality").notNull(),
  registrationStatus: statusEnum("registration_status")
    .default("pendiente")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  emergencyContact: one(emergencyContacts, {
    fields: [users.id],
    references: [emergencyContacts.userId],
  }),
  healthInfo: one(healthInfo, {
    fields: [users.id],
    references: [healthInfo.userId],
  }),
  payments: many(payments),
}));

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
});

export const healthInfo = pgTable("health_info", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  allergies: text("allergies").default("Ninguna"),
  conditions: text("conditions").default("Ninguna"),
  medications: text("medications").default("Ninguno"),
  dosageFrequency: text("dosage_frequency").default("N/A"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  method: paymentMethodEnum("method").notNull(),
  proofUrl: text("proof_url"),
  status: paymentStatusEnum("payment_status").default("pendiente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  dayId: text("day_id").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  fullContent: text("full_content").notNull(),
  type: text("type").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  mapsUrl: text("maps_url").notNull(),
  websiteUrl: text("website_url"),
  services: text("services"), // Store as JSON string
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  fullPaymentPrice: integer("full_payment_price").default(1500).notNull(),
  registrationFeePrice: integer("registration_fee_price")
    .default(500)
    .notNull(),
  stripePercentage: text("stripe_percentage").default("3.6").notNull(),
  stripeFixedFee: integer("stripe_fixed_fee").default(3).notNull(),
  termsAndConditions: text("terms_and_conditions"),
  priceDeadline: timestamp("price_deadline"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const localities = pgTable("localities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
});
