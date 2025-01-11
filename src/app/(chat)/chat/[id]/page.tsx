import { notFound } from "next/navigation";
import { getChatById } from "@/db/queries";
import { Chat } from "@/components/custom/chat";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  // Verificar se params e params.id existem antes de prosseguir
  if (!params || !params.id) {
    return notFound();
  }

  const chatId = params.id;

  // Validar o ID
  if (typeof chatId !== 'string' || chatId.length < 1) {
    return notFound();
  }

  let initialMessages = [];

  try {
    // Buscar chat do banco de dados usando o chatId
    const chat = await getChatById({ id: chatId });

    if (chat?.messages) {
      try {
        const parsedMessages = JSON.parse(chat.messages);
        if (Array.isArray(parsedMessages)) {
          initialMessages = parsedMessages;
        }
      } catch (error) {
        console.error("Erro ao processar mensagens:", error);
      }
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
