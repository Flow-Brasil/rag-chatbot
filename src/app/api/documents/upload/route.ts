import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const metadataStr = formData.get("metadata") as string;
    const metadata = JSON.parse(metadataStr);

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const document = await ragieClient.uploadDocument(file, metadata);
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
} 