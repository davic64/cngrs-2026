"use client";

import {
  ChevronLeft,
  MessageCircle,
  Save,
  Send,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import {
  closeSupportChat,
  getActiveSupportChats,
  getSupportMessages,
  sendSupportMessage,
  updateTelegramConfig,
} from "@/app/actions/support";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  chatId: string;
  sender: "visitor" | "admin";
  message: string;
  createdAt: Date;
};

type Chat = {
  id: string;
  visitorName: string;
  visitorPhone: string | null;
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
};

interface AdminSoporteClientProps {
  initialChats: Chat[];
  initialTelegramToken: string;
  initialTelegramChatId: string;
}

export function AdminSoporteClient({
  initialChats,
  initialTelegramToken,
  initialTelegramChatId,
}: AdminSoporteClientProps) {
  const [chats, setChats] = React.useState<Chat[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    null,
  );
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  // Telegram Config States
  const [telegramToken, setTelegramToken] =
    React.useState(initialTelegramToken);
  const [telegramChatId, setTelegramChatId] = React.useState(
    initialTelegramChatId,
  );
  const [isEditingTelegram, setIsEditingTelegram] = React.useState(
    !initialTelegramToken || !initialTelegramChatId,
  );
  const [telegramSaved, setTelegramSaved] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const lastMessageIdRef = React.useRef(0);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  // Load messages when selecting a chat
  React.useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const chat = chats.find((c) => c.id === selectedChatId);
    if (chat) {
      setMessages(chat.messages);
      if (chat.messages.length > 0) {
        lastMessageIdRef.current = chat.messages[chat.messages.length - 1].id;
      }
    }
  }, [selectedChatId, chats]);

  // Polling: refresh chats list + selected chat messages
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const freshChats = await getActiveSupportChats();
      setChats(freshChats as Chat[]);

      if (selectedChatId) {
        const newMsgs = await getSupportMessages(
          selectedChatId,
          lastMessageIdRef.current,
        );
        if (newMsgs.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...newMsgs.map((m) => ({
              id: m.id,
              chatId: m.chatId,
              sender: m.sender,
              message: m.message,
              createdAt: m.createdAt,
            })),
          ]);
          lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id;
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedChatId]);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedChatId || isSending) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);

    const msg = await sendSupportMessage(selectedChatId, text, "admin");
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id,
        chatId: msg.chatId,
        sender: msg.sender,
        message: msg.message,
        createdAt: msg.createdAt,
      },
    ]);
    lastMessageIdRef.current = msg.id;
    setIsSending(false);
  };

  const handleSaveTelegram = async () => {
    await updateTelegramConfig(telegramToken, telegramChatId);
    setTelegramSaved(true);
    setIsEditingTelegram(false);
    setTimeout(() => setTelegramSaved(false), 2000);
  };

  const handleClose = async () => {
    if (!selectedChatId) return;
    await closeSupportChat(selectedChatId);
    setChats((prev) => prev.filter((c) => c.id !== selectedChatId));
    setSelectedChatId(null);
    setMessages([]);
  };

  const getLastVisitorMessage = (chat: Chat) => {
    const visitorMsgs = chat.messages.filter((m) => m.sender === "visitor");
    return visitorMsgs.length > 0
      ? visitorMsgs[visitorMsgs.length - 1].message
      : "Sin mensajes";
  };

  const hasUnrepliedMessages = (chat: Chat) => {
    if (chat.messages.length === 0) return false;
    return chat.messages[chat.messages.length - 1].sender === "visitor";
  };

  const timeAgo = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "Ahora";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return `Hace ${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
      <header className={cn(selectedChatId && "hidden md:block")}>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          Centro de Atención
        </p>
        <h1 className="text-2xl font-black text-secondary uppercase tracking-tighter">
          Soporte en Vivo
        </h1>
      </header>

      {/* Telegram Config Section */}
      <div
        className={cn(
          "bg-white rounded-[2rem] shadow-xl border border-gray-100 p-5 md:p-6",
          selectedChatId && "hidden md:block",
        )}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                Notificaciones Telegram
              </span>
            </div>
            {isEditingTelegram ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Bot Token"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="flex-1 h-9 text-xs"
                />
                <Input
                  placeholder="Chat ID"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="flex-1 h-9 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTelegram}
                  className="gap-2 shrink-0 h-9"
                >
                  <Save size={14} />
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between h-10 px-4 bg-gray-50 rounded-xl border border-gray-100 w-full">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Bot Conectado
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingTelegram(true)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  Cambiar Configuración
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row flex-1 min-h-0 md:h-[calc(100vh-320px)] md:min-h-[600px]">
        {/* Chat list */}
        <div
          className={cn(
            "w-full md:w-96 border-b md:border-b-0 md:border-r border-gray-100 shrink-0 flex flex-col transition-all",
            selectedChatId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
              Chats Activos ({chats.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {chats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle
                  size={40}
                  className="text-gray-200 mx-auto mb-3"
                />
                <p className="text-xs text-gray-400 font-medium">
                  No hay chats activos
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full text-left p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer",
                    selectedChatId === chat.id && "bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {hasUnrepliedMessages(chat) && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className="text-base font-bold text-secondary">
                        {chat.visitorName}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      {timeAgo(chat.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {getLastVisitorMessage(chat)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active chat */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all",
            !selectedChatId ? "hidden md:flex" : "flex",
          )}
        >
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white md:bg-transparent">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="md:hidden h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-secondary"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-secondary">
                      {selectedChat.visitorName}
                    </p>
                    {selectedChat.visitorPhone && (
                      <p className="text-[10px] text-gray-400">
                        {selectedChat.visitorPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 h-9"
                  >
                    <XCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Finalizar conversación
                    </span>
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-gray-50/30 md:bg-transparent">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender === "admin" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-sm leading-relaxed",
                        msg.sender === "admin"
                          ? "bg-primary text-white rounded-2xl rounded-br-md shadow-md shadow-primary/10"
                          : "bg-white md:bg-gray-100 text-secondary rounded-2xl rounded-bl-md shadow-sm",
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-gray-100 p-3 md:p-4 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 h-11 md:h-12 rounded-2xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-all shrink-0 shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
              <div className="h-20 w-20 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-gray-200" />
              </div>
              <p className="text-base font-black text-secondary/40 uppercase tracking-widest">
                Soporte en Tiempo Real
              </p>
              <p className="text-xs text-gray-400 mt-2 max-w-[200px] leading-relaxed">
                Selecciona una conversación de la lista para comenzar a
                responder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
