import { ragieClient } from "./ragie";
import type { UploadMetadata } from "@/app/upload_simples/types";

export async function uploadDocument(file: File, metadata: UploadMetadata) {
  return await ragieClient.uploadDocument(file, metadata);
} 