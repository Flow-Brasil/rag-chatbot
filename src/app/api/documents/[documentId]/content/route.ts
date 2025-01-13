import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const content = await ragieClient.getDocumentContent(documentId);
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error getting document content:", error);
    return NextResponse.json(
      { error: "Failed to get document content" },
      { status: 500 }
    );
  }
} 