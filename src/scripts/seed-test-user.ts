import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { users, emergencyContacts, healthInfo } from "../db/schema";

dotenv.config({ path: ".env" });

async function seedTestUser() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL no encontrada en .env");
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const testPhone = "3300000000";
  const testPassword = "test1234";
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  console.log("🚀 Iniciando creación de usuario de prueba...");

  try {
    // Verificar si ya existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.phone, testPhone))
      .limit(1);

    if (existingUser) {
      console.log("⚠️ El usuario de prueba ya existe. Actualizando contraseña...");
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.phone, testPhone));
      console.log("✅ Datos actualizados.");
    } else {
      console.log("🆕 Creando nuevo usuario de prueba...");
      const [newUser] = await db.insert(users).values({
        firstName: "Usuario",
        lastName: "Prueba",
        phone: testPhone,
        password: hashedPassword,
        role: "user",
        age: 22,
        gender: "M",
        shirtSize: "M",
        country: "México",
        state: "Jalisco",
        locality: "Guadalajara",
        registrationStatus: "parcial",
      }).returning();

      // Agregar info adicional necesaria
      await db.insert(emergencyContacts).values({
        userId: newUser.id,
        name: "Contacto de Emergencia",
        phone: "3311223344",
      });

      await db.insert(healthInfo).values({
        userId: newUser.id,
        allergies: "Ninguna",
        conditions: "Ninguna",
        medications: "Ninguno",
        dosageFrequency: "N/A",
      });

      console.log("✅ Usuario de prueba creado con éxito.");
    }
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
  }
}

seedTestUser();
