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
export const chatStatusEnum = pgEnum("chat_status", ["active", "closed"]);
export const messageSenderEnum = pgEnum("message_sender", ["visitor", "admin"]);

// Enum for temporary file status
export const tempFileStatusEnum = pgEnum("temp_file_status", [
  "pending",
  "confirmed",
  "abandoned",
]);

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
  passwordResetRequired: boolean("password_reset_required").default(false),
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
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const agendaDays = pgTable("agenda_days", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  date: text("date").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

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
  bankName: text("bank_name").default("BBVA"),
  bankCLABE: text("bank_clabe").default("0123 4567 8901 2345 67"),
  bankHolder: text("bank_holder").default("JIDI Internacional A.C."),
  oxxoCardNumber: text("oxxo_card_number"),
  telegramToken: text("telegram_token"),
  telegramChatId: text("telegram_chat_id"),
  supportPhone: text("support_phone").default("+52 (555) 123-4567"),
  supportEmail: text("support_email").default("soporte@cngrs.mx"),
  supportHours: text("support_hours").default(
    "Lunes a Viernes, 9:00 AM - 6:00 PM",
  ),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const localities = pgTable("localities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
});

// Support Chat
export const supportChats = pgTable("support_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorName: text("visitor_name").notNull(),
  visitorPhone: text("visitor_phone"),
  status: chatStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  chatId: uuid("chat_id")
    .references(() => supportChats.id, { onDelete: "cascade" })
    .notNull(),
  sender: messageSenderEnum("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportChatsRelations = relations(supportChats, ({ many }) => ({
  messages: many(supportMessages),
}));

export const supportMessagesRelations = relations(
  supportMessages,
  ({ one }) => ({
    chat: one(supportChats, {
      fields: [supportMessages.chatId],
      references: [supportChats.id],
    }),
  }),
);

// Temporary files during registration (to track and clean up orphaned files)
export const temporaryFiles = pgTable("temporary_files", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // Unique session ID for each registration attempt
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // "fotoPerfil", "documento", "comprobantePago"
  status: tempFileStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  expiresAt: timestamp("expires_at").notNull(), // Auto-delete after 24 hours if not confirmed
});

export const temporaryFilesRelations = relations(
  temporaryFiles,
  ({ many }) => ({
    // No direct relation needed - files are tracked by sessionId
  }),
);

// Nota: La plantilla de Carta Responsiva se guarda directamente en R2
// en la ruta fija: templates/carta-responsiva.pdf
// No necesita tabla en la base de datos.
