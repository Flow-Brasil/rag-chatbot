"use client";

import { BaseLayout } from "@/components/layout/BaseLayout";
import { ModelChat } from "@/components/features/ModelChat";

export default function HomePage() {
  return (
    <BaseLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Chat com Modelos de IA
        </h1>
        
        <ModelChat defaultModel="gemini" />
      </div>
    </BaseLayout>
  );
} 