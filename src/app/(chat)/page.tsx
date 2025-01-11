import { nanoid } from "ai";
import { ChatPageClient } from "@/components/custom/chat-page-client";
import { Message } from "ai";

export const runtime = "edge";

export default function IndexPage() {
  const id = nanoid();
  const initialMessages: Message[] = [];

  return <ChatPageClient initialMessages={initialMessages} />;
}
