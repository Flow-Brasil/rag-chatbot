'use client';

import { MessageCircleIcon } from "lucide-react";
import type { Cliente, ChatClientSelectorProps } from "./types";
import { BaseSelector } from "./BaseSelector";
import { Button } from "@/components/ui/button";

export function ChatClienteSelector({
  items,
  selectedItem,
  inputValue,
  onSelect,
  onInputChange,
  showRecentChats = true,
  showDocumentCount = true,
  onStartNewChat,
  isLoading = false,
}: ChatClientSelectorProps) {
  const renderCliente = (cliente: Cliente) => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>{cliente.name}</span>
        {showDocumentCount && (
          <span className="text-xs text-gray-500">
            ({cliente.documentCount} doc{cliente.documentCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
      {showRecentChats && onStartNewChat && (
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStartNewChat(cliente);
          }}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <MessageCircleIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  return (
    <BaseSelector<Cliente>
      items={items}
      selectedItem={selectedItem}
      inputValue={inputValue}
      onSelect={onSelect}
      onInputChange={onInputChange}
      isLoading={isLoading}
      placeholder="Selecione um cliente para conversar..."
      renderItem={renderCliente}
    />
  );
} 