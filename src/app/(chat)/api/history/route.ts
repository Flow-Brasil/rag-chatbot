import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  try {
    const session = await auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await getChatsByUserId(session);
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Error fetching history" },
      { status: 500 }
    );
  }
}
