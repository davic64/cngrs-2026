"use server";

import { desc, eq, gt, and } from "drizzle-orm";
import { db } from "@/db";
import { settings, supportChats, supportMessages } from "@/db/schema";

export async function createSupportChat(
  visitorName: string,
  visitorPhone?: string,
) {
  const [chat] = await db
    .insert(supportChats)
    .values({
      visitorName,
      visitorPhone: visitorPhone || null,
    })
    .returning();

  // Welcome message
  await db.insert(supportMessages).values({
    chatId: chat.id,
    sender: "admin",
    message:
      "¡Hola! Bienvenido al soporte de CNGRS26. Un miembro de nuestro equipo te atenderá pronto.",
  });

  return chat;
}

export async function updateTelegramConfig(token: string, chatId: string) {
  const existing = await db.query.settings.findFirst();
  if (existing) {
    await db.update(settings).set({
      telegramToken: token,
      telegramChatId: chatId,
      updatedAt: new Date(),
    });
  }
  return { success: true };
}

export async function sendSupportMessage(
  chatId: string,
  message: string,
  sender: "visitor" | "admin",
) {
  const [msg] = await db
    .insert(supportMessages)
    .values({ chatId, sender, message })
    .returning();

  await db
    .update(supportChats)
    .set({ updatedAt: new Date() })
    .where(eq(supportChats.id, chatId));

  // Telegram Notification ONLY for the first visitor message
  if (sender === "visitor") {
    try {
      // Check if this is the first message from the visitor
      const visitorMessages = await db
        .select()
        .from(supportMessages)
        .where(
          and(
            eq(supportMessages.chatId, chatId),
            eq(supportMessages.sender, "visitor"),
          ),
        );

      if (visitorMessages.length === 1) {
        const chat = await getChatById(chatId);
        const config = await db.query.settings.findFirst();

        if (config?.telegramToken && config?.telegramChatId && chat) {
          const notification = `🔔 *Soporte CNGRS26*\n\n👤 *${chat.visitorName}* dice:\n"${message}"\n\n[Responder en el Panel](${process.env.NEXT_PUBLIC_APP_URL || "https://cngrs.mx"}/admin/soporte)`;
          const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage?chat_id=${config.telegramChatId}&text=${encodeURIComponent(notification)}&parse_mode=Markdown`;

          await fetch(url);
        }
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  }

  return msg;
}

export async function getSupportMessages(chatId: string, afterId?: number) {
  if (afterId) {
    return await db
      .select()
      .from(supportMessages)
      .where(
        and(
          eq(supportMessages.chatId, chatId),
          gt(supportMessages.id, afterId),
        ),
      )
      .orderBy(supportMessages.id);
  }

  return await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.chatId, chatId))
    .orderBy(supportMessages.id);
}

export async function getActiveSupportChats() {
  return await db.query.supportChats.findMany({
    where: eq(supportChats.status, "active"),
    with: { messages: true },
    orderBy: [desc(supportChats.updatedAt)],
  });
}

export async function getAllSupportChats() {
  return await db.query.supportChats.findMany({
    with: { messages: true },
    orderBy: [desc(supportChats.updatedAt)],
  });
}

export async function closeSupportChat(chatId: string) {
  await db
    .update(supportChats)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(supportChats.id, chatId));
  return { success: true };
}

export async function getChatById(chatId: string) {
  return await db.query.supportChats.findFirst({
    where: eq(supportChats.id, chatId),
    with: { messages: true },
  });
}
