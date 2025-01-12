import { type Message } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Definindo interfaces atualizadas para o Next.js 15
interface ToolInvocation {
  state: "call" | "result";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: string;
}

interface ExtendedMessage extends Message {
  toolInvocations?: ToolInvocation[];
}

// Definindo nossa própria interface CoreMessage sem estender CreateMessage
interface CoreMessage {
  id?: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string | Array<{
    type: string;
    text?: string;
    toolCallId?: string;
    toolName?: string;
    args?: Record<string, unknown>;
  }>;
}

// Implementação própria do generateId
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data.",
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreMessage;
  messages: Array<ExtendedMessage>;
}): Array<ExtendedMessage> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = Array.isArray(toolMessage.content) && 
            toolMessage.content.find(
              (tool) => tool.toolCallId === toolInvocation.toolCallId
            );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: typeof toolResult === 'string' ? toolResult : toolResult.text,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>,
): Array<ExtendedMessage> {
  return messages.reduce((chatMessages: Array<ExtendedMessage>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text" && content.text) {
          textContent += content.text;
        } else if (content.type === "tool-call" && content.toolCallId && content.toolName) {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args || {},
          });
        }
      }
    }

    chatMessages.push({
      id: generateId(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

// Atualizando a interface Chat para typescript
interface Chat {
  messages: Array<CoreMessage>;
}

export function getTitleFromChat(chat: Chat) {
  const messages = convertToUIMessages(chat.messages);
  const firstMessage = messages[0];

  if (!firstMessage) {
    return "Untitled";
  }

  return firstMessage.content;
}

// Exportando tipos
export type { 
  ToolInvocation,
  ExtendedMessage,
  CoreMessage,
  Chat,
  ApplicationError
}; 

// Exportando funções de LLM
export * from './llm'; 