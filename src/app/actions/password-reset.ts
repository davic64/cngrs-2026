"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function sendPasswordResetRequest(phone: string, message: string) {
  try {
    if (!phone || !message) {
      return {
        success: false,
        error: "El teléfono y el mensaje son requeridos",
      };
    }

    if (phone.length < 5) {
      return {
        success: false,
        error: "Por favor ingresa un número de teléfono válido",
      };
    }

    if (message.length < 20) {
      return {
        success: false,
        error: "El mensaje debe tener al menos 20 caracteres",
      };
    }

    // Get Telegram config
    const config = await db.query.settings.findFirst();

    if (!config?.telegramToken || !config?.telegramChatId) {
      return {
        success: false,
        error:
          "El sistema de notificaciones no está configurado. Por favor contacta al equipo de soporte.",
      };
    }

    // Format and send Telegram notification
    const notification = `🔐 *SOLICITUD DE CAMBIO DE CONTRASEÑA*\n\n📱 *Teléfono:* ${phone}\n\n💬 *Mensaje:*\n${message}\n\n---\n⏰ *Fecha:* ${new Date().toLocaleString("es-MX")}`;

    const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage?chat_id=${config.telegramChatId}&text=${encodeURIComponent(notification)}&parse_mode=Markdown`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Telegram API error:", await response.text());
      return {
        success: false,
        error: "Error al enviar la solicitud. Por favor intenta más tarde.",
      };
    }

    return {
      success: true,
      message:
        "Tu solicitud ha sido enviada al equipo de soporte. Te contactaremos en breve.",
    };
  } catch (error) {
    console.error("Error sending password reset request:", error);
    return {
      success: false,
      error: "Error al procesar tu solicitud. Por favor intenta más tarde.",
    };
  }
}
