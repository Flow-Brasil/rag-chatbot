"use client";

import { SendHorizontal } from "lucide-react";
import { Button } from "@nextui-org/react";

interface Props {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export function MultimodalInput({ input, setInput, handleSubmit, isLoading }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const formEvent = new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
      handleSubmit(formEvent);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background">
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-background rounded-lg px-4 py-2 border focus:outline-none focus:ring-2"
            disabled={isLoading}
          />

          <Button
            type="submit"
            isIconOnly
            color="primary"
            isLoading={isLoading}
            isDisabled={!input.trim()}
          >
            <SendHorizontal />
          </Button>
        </form>
      </div>
    </div>
  );
} 