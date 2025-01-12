"use client";

import { BaseLayout } from "@/components/layout/BaseLayout";
import { ModelChat } from "@/components/features/ModelChat";

export default function HomePage() {
  return (
    <BaseLayout>
      <div className="container mx-auto">
        <ModelChat defaultModel="gemini" />
      </div>
    </BaseLayout>
  );
} 