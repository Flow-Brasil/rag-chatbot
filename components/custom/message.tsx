"use client";

import { Message as AIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type ModelType = 'groq' | 'gemini';

interface MessageProps extends Omit<AIMessage, 'model'> {
  model?: ModelType;
  id: string;
}

export function Message({ role, content, model, id }: MessageProps) {
  const isDocsCommand = role === "assistant" && content.includes("📚 **Documentos");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 whitespace-pre-wrap",
        role === "user" ? "bg-gray-100" : "bg-white",
        isDocsCommand && "bg-blue-50 font-mono text-sm"
      )}
      key={id}
    >
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
