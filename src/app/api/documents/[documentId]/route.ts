import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const document = await ragieClient.getDocument(documentId);
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error getting document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    await ragieClient.deleteDocument(documentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const updates = await request.json();
    const document = await ragieClient.updateDocument(documentId, updates);
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
} 