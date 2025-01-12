import { NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function GET() {
  try {
    const documents = await ragieClient.listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
} 