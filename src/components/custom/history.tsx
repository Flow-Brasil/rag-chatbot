"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LayoutGrid, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatPreview {
  id: string;
  preview: string;
}

export function History() {
  const pathname = usePathname();
  const [chats, setChats] = useState<ChatPreview[]>([]);

  useEffect(() => {
    // Carregar histórico do localStorage
    const loadHistory = () => {
      const history = localStorage.getItem("chatHistory");
      if (history) {
        const parsedHistory = JSON.parse(history);
        const previews = Object.entries(parsedHistory).map(([id, messages]: [string, any]) => {
          // Pegar as primeiras 3 palavras da primeira mensagem do usuário
          const userMessage = Array.isArray(messages) ? 
            messages.find((m: any) => m.role === "user")?.content : "";
          const preview = userMessage ? 
            userMessage.split(" ").slice(0, 3).join(" ") + "..." : 
            "Nova conversa...";
          return { id, preview };
        });
        setChats(previews);
      }
    };

    loadHistory();
    window.addEventListener("storage", loadHistory);
    return () => window.removeEventListener("storage", loadHistory);
  }, []);

  const deleteChat = async (id: string) => {
    try {
      // Deletar do backend
      await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      // Atualizar localStorage
      const history = localStorage.getItem("chatHistory");
      if (history) {
        const parsedHistory = JSON.parse(history);
        delete parsedHistory[id];
        localStorage.setItem("chatHistory", JSON.stringify(parsedHistory));
      }

      // Atualizar estado
      setChats(chats.filter(chat => chat.id !== id));
    } catch (error) {
      console.error("Erro ao deletar chat:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <LayoutGrid className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-2">
          <Link
            href="/"
            className={`block p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              pathname === "/" ? "bg-gray-100" : ""
            }`}
          >
            Nova conversa
          </Link>
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center gap-2 group">
              <Link
                href={`/chat/${chat.id}`}
                className={`flex-1 p-2 rounded-lg hover:bg-gray-100 transition-colors truncate ${
                  pathname === `/chat/${chat.id}` ? "bg-gray-100" : ""
                }`}
              >
                {chat.preview}
              </Link>
              <button
                onClick={() => deleteChat(chat.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir conversa"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
