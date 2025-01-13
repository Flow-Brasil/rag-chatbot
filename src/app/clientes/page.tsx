"use client";

import { DocumentList } from "@/components/DocumentList";

export default function ClientesPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Clientes</h1>
      <DocumentList />
    </main>
  );
} 