import { getActiveSupportChats } from "@/app/actions/support";
import { AdminSoporteClient } from "@/components/admin/AdminSoporteClient";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export default async function AdminSoportePage() {
  const [chats, settings] = await Promise.all([
    getActiveSupportChats(),
    db.query.settings.findFirst(),
  ]);

  return (
    <AdminSoporteClient
      initialChats={chats}
      initialTelegramToken={settings?.telegramToken || ""}
      initialTelegramChatId={settings?.telegramChatId || ""}
    />
  );
}
