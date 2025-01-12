import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const content = await ragieClient.getDocumentContent(id);
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error getting document content:", error);
    return NextResponse.json(
      { error: "Failed to get document content" },
      { status: 500 }
    );
  }
} 