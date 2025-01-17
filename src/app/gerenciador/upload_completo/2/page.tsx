"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadEtapa2Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/gerenciador/upload_completo/2/1" as any);
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      Redirecionando...
    </div>
  );
} 