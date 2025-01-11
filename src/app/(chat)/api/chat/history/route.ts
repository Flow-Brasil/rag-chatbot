import { getChats } from "@/db/queries";

export async function GET() {
  try {
    const chats = await getChats();
    return new Response(JSON.stringify(chats));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return new Response("Error fetching chats", { status: 500 });
  }
} 