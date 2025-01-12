"use client";

import { BaseLayout } from '@/components/layout/BaseLayout';
import ModelChat from '@/components/ModelChat';

export default function Home() {
  return (
    <BaseLayout>
      <div className="container mx-auto">
        <ModelChat modelType="gemini" />
      </div>
    </BaseLayout>
  );
} 