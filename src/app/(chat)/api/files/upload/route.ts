import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const schema = z.object({
  filename: z.string(),
  contentType: z.string(),
  content: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const body = schema.parse(json);

    const blob = await put(body.filename, Buffer.from(body.content), {
      contentType: body.contentType,
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
