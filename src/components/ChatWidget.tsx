"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import * as React from "react";
import {
  createSupportChat,
  getChatById,
  getSupportMessages,
  sendSupportMessage,
} from "@/app/actions/support";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  userName?: string;
}

type Message = {
  id: number;
  sender: "visitor" | "admin";
  message: string;
  createdAt: Date;
};

export function ChatWidget({ userName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [chatId, setChatId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [name, setName] = React.useState(userName || "");
  const [isSending, setIsSending] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [chatClosed, setChatClosed] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const lastMessageIdRef = React.useRef(0);

  // Restore chatId from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("support_chat_id");
    if (stored) {
      setChatId(stored);
      // Load existing chat
      getChatById(stored).then((chat) => {
        if (chat) {
          if (chat.status === "closed") {
            setChatClosed(true);
          }
          setMessages(
            chat.messages.map((m) => ({
              id: m.id,
              sender: m.sender,
              message: m.message,
              createdAt: m.createdAt,
            })),
          );
          if (chat.messages.length > 0) {
            lastMessageIdRef.current =
              chat.messages[chat.messages.length - 1].id;
          }
        } else {
          // Chat no longer exists, clean up
          localStorage.removeItem("support_chat_id");
          setChatId(null);
        }
      });
    }
  }, []);

  // Update name when prop changes
  React.useEffect(() => {
    if (userName && !chatId) setName(userName);
  }, [userName, chatId]);

  // Polling for new messages
  React.useEffect(() => {
    if (!chatId || chatClosed) return;

    const interval = setInterval(async () => {
      const newMsgs = await getSupportMessages(
        chatId,
        lastMessageIdRef.current,
      );
      if (newMsgs.length > 0) {
        setMessages((prev) => [
          ...prev,
          ...newMsgs.map((m) => ({
            id: m.id,
            sender: m.sender,
            message: m.message,
            createdAt: m.createdAt,
          })),
        ]);
        lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id;

        // Count admin messages as unread if widget is closed
        if (!isOpen) {
          const adminMsgs = newMsgs.filter((m) => m.sender === "admin");
          setUnreadCount((prev) => prev + adminMsgs.length);
        }
      }

      // Check if chat was closed
      const chat = await getChatById(chatId);
      if (chat?.status === "closed") {
        setChatClosed(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [chatId, isOpen, chatClosed]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleStartChat = async () => {
    if (!name.trim()) return;
    setIsSending(true);
    const chat = await createSupportChat(name.trim());
    setChatId(chat.id);
    localStorage.setItem("support_chat_id", chat.id);
    // Load welcome message
    const msgs = await getSupportMessages(chat.id);
    setMessages(
      msgs.map((m) => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        createdAt: m.createdAt,
      })),
    );
    if (msgs.length > 0) {
      lastMessageIdRef.current = msgs[msgs.length - 1].id;
    }
    setIsSending(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId || isSending) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const msg = await sendSupportMessage(chatId, text, "visitor");
      // Update the last message ID BEFORE adding to state to prevent polling duplication
      lastMessageIdRef.current = msg.id;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.sender,
          message: msg.message,
          createdAt: msg.createdAt,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    localStorage.removeItem("support_chat_id");
    setChatId(null);
    setMessages([]);
    setChatClosed(false);
    lastMessageIdRef.current = 0;
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            type="button"
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] h-[480px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                  Soporte CNGRS26
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!chatId ? (
              // Name form
              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle size={28} className="text-primary" />
                </div>
                <p className="text-sm font-bold text-secondary text-center">
                  ¿Necesitas ayuda con tu registro?
                </p>
                <p className="text-xs text-gray-400 text-center">
                  Escribe tu nombre para iniciar una conversación con nuestro
                  equipo.
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full h-10 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStartChat();
                  }}
                />
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={!name.trim() || isSending}
                  className="w-full h-10 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {isSending ? "Conectando..." : "Iniciar Chat"}
                </button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "visitor"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed",
                          msg.sender === "visitor"
                            ? "bg-primary text-white rounded-2xl rounded-br-md"
                            : "bg-gray-100 text-secondary rounded-2xl rounded-bl-md",
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  {chatClosed && (
                    <div className="text-center py-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Chat finalizado
                      </p>
                      <button
                        type="button"
                        onClick={handleNewChat}
                        className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer"
                      >
                        Iniciar nuevo chat
                      </button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {!chatClosed && (
                  <div className="shrink-0 border-t border-gray-100 p-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!input.trim() || isSending}
                      className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
