"use client";

import { useParams } from "next/navigation";
import { Message } from "ai";
import { Chat } from "./chat";

interface ChatPageClientProps {
  initialMessages?: Array<Message>;
}

export function ChatPageClient({ initialMessages = [] }: ChatPageClientProps) {
  const params = useParams();
  const id = params?.id as string;

  return <Chat id={id} initialMessages={initialMessages} />;
} 