"use client";

import { AppProvider } from "@/providers/app-provider";
import { Toaster } from "sonner";

interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
      <Toaster 
        position="top-right"
        closeButton
        theme="system"
        richColors
      />
    </AppProvider>
  );
} 