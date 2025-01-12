import { notFound } from "next/navigation";
import { getChatById } from "@/db/queries";
import { Chat } from "@/components/custom/chat";

type Role = "function" | "data" | "system" | "user" | "assistant" | "tool";

interface Message {
  id: string;
  content: string;
  role: Role;
  createdAt: Date;
  chatId: string;
}

interface DatabaseMessage {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  chatId: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Verificar se params e params.id existem antes de prosseguir
  if (!resolvedParams || !resolvedParams.id) {
    return notFound();
  }

  const chatId = resolvedParams.id;

  // Validar o ID
  if (typeof chatId !== 'string' || chatId.length < 1) {
    return notFound();
  }

  let initialMessages: Message[] = [];

  try {
    // Buscar chat do banco de dados usando o chatId
    const chat = await getChatById(chatId);

    if (chat?.messages) {
      initialMessages = chat.messages.map((msg: DatabaseMessage) => ({
        ...msg,
        role: msg.role as Role
      }));
    }
  } catch (error) {
    console.error("Erro ao buscar chat:", error);
    return notFound();
  }

  // Renderizar o componente Chat passando o chatId como prop
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        <Chat id={chatId} initialMessages={initialMessages} />
      </main>
    </div>
  );
}
