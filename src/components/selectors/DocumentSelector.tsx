'use client';

import { FileIcon } from "lucide-react";
import type { Document, DocumentSelectorProps } from "./types";
import { BaseSelector } from "./BaseSelector";

export function DocumentSelector({
  items,
  selectedItem,
  inputValue,
  onSelect,
  onInputChange,
  showMetadata = true,
  clienteFilter,
  isLoading = false,
}: DocumentSelectorProps) {
  // Filtra os documentos pelo cliente se necessário
  const filteredItems = clienteFilter
    ? items.filter(doc => doc.metadata?.cliente === clienteFilter)
    : items;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderDocument = (doc: Document) => (
    <div className="flex items-center gap-2">
      <FileIcon className="w-4 h-4 text-blue-500" />
      <div className="flex-1">
        <div className="font-medium">{doc.name}</div>
        {showMetadata && (
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Criado em: {formatDate(doc.created_at)}</div>
            {doc.metadata?.cliente && (
              <div>Cliente: {doc.metadata.cliente}</div>
            )}
            {doc.metadata?.['tipo'] && (
              <div>Tipo: {doc.metadata['tipo']}</div>
            )}
            {doc.metadata?.['scope'] && (
              <div>Escopo: {doc.metadata['scope']}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BaseSelector<Document>
      items={filteredItems}
      selectedItem={selectedItem}
      inputValue={inputValue}
      onSelect={onSelect}
      onInputChange={onInputChange}
      isLoading={isLoading}
      placeholder="Selecione um documento..."
      renderItem={renderDocument}
    />
  );
} 