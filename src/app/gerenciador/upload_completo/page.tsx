"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadCompletoPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/gerenciador/upload_completo/1");
  }, [router]);

  return null;
} 