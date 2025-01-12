"use client";

import { type Message as MessageType } from "@/lib/types/message";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle } from "lucide-react";

type ModelType = 'gemini';

interface MessageProps extends Omit<MessageType, 'model'> {
  model?: ModelType;
  id: string;
}

export function Message({ role, content, model, id, error }: MessageProps) {
  const isDocsCommand = role === "assistant" && content.includes("📚 **Documentos");
  const isError = error || (role === "assistant" && content.toLowerCase().includes("erro"));
  const isRagieError = isError && content.toLowerCase().includes("ragie");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 whitespace-pre-wrap",
        role === "user" ? "bg-gray-100" : "bg-white",
        isDocsCommand && "bg-blue-50 font-mono text-sm",
        isError && "bg-red-50 border-l-4 border-red-400"
      )}
      key={id}
    >
      {isError && role === "assistant" && (
        <div className="flex items-center gap-2 text-red-600 mb-2">
          {isRagieError ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">
            {isRagieError ? "Erro na API Ragie" : "Ocorreu um erro"}
          </span>
        </div>
      )}
      <ReactMarkdown
        components={{
          pre: ({ node, ...props }) => (
            <div className="overflow-auto w-full my-2 bg-black/80 p-4 rounded-lg">
              <pre {...props} />
            </div>
          ),
          code: ({ node, ...props }) => (
            <code className="bg-black/80 p-1 rounded" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {role === "assistant" && model && (
        <div className="text-xs text-gray-500 mt-2">
          Modelo: {model}
        </div>
      )}
    </div>
  );
}
