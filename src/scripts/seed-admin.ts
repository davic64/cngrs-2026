import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../db/schema";

dotenv.config({ path: ".env" });

async function seedAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL no encontrada en .env");
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const adminPhone = "3318319769";
  const adminPassword = "cngrs26..";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log("🚀 Iniciando creación de cuenta admin...");

  try {
    // Verificar si ya existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.phone, adminPhone))
      .limit(1);

    if (existingUser) {
      console.log("⚠️ El usuario ya existe. Actualizando contraseña...");
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.phone, adminPhone));
      console.log("✅ Contraseña actualizada correctamente.");
    } else {
      console.log("🆕 Creando nuevo usuario administrador...");
      await db.insert(users).values({
        firstName: "Admin",
        lastName: "CNGRS",
        phone: adminPhone,
        password: hashedPassword,
        age: 26,
        gender: "M",
        shirtSize: "L",
        country: "México",
        state: "Jalisco",
        locality: "Guadalajara",
        registrationStatus: "completado",
      });
      console.log("✅ Cuenta Admin creada con éxito.");
    }
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
  }
}

seedAdmin();
