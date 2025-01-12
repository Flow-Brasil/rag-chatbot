import { NextResponse } from "next/server";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  try {
    const chats = await getChatsByUserId();
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Error fetching history" },
      { status: 500 }
    );
  }
}
