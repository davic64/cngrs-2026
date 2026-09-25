import { db } from "@/db";

// Envía un mensaje al chat de Telegram del admin configurado en settings.
// Nunca lanza: devuelve el resultado para que el llamador decida qué mostrar.
export async function notifyAdmin(
  text: string,
): Promise<"ok" | "unconfigured" | "error"> {
  try {
    const config = await db.query.settings.findFirst();
    if (!config?.telegramToken || !config?.telegramChatId) {
      return "unconfigured";
    }

    const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage?chat_id=${config.telegramChatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Telegram API error:", await response.text());
      return "error";
    }
    return "ok";
  } catch (error) {
    console.error("Error enviando notificación de Telegram:", error);
    return "error";
  }
}
