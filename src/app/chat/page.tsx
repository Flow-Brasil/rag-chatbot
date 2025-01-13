"use client";

import { DocumentList } from "@/components/DocumentList";

export default function DocumentosPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Documentos</h1>
      <DocumentList />
    </main>
  );
} 