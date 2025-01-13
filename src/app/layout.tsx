import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/custom/Navigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG Chatbot",
  description: "Um chatbot com RAG usando LangChain e Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Navigation />
          <main className="pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
