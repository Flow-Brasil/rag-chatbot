"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { useServerInsertedHTML } from 'next/navigation';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useServerInsertedHTML(() => {
    return (
      <>
        <meta name="next-size-adjust" />
      </>
    );
  });

  return (
    <NextUIProvider disableAnimation>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        forcedTheme="light"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </NextUIProvider>
  );
} 