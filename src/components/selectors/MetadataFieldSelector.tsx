'use client';

import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";

interface MetadataField {
  key: string;
  description: string;
}

interface MetadataItem {
  key: string;
  description: string;
}

interface MetadataValues {
  [key: string]: string[];
}

// Metadados padrão do sistema
const commonFields: MetadataField[] = [
  { key: "document_type", description: "Tipo do documento (PDF, MD, DOCX, TXT, JSON)" },
  { key: "document_source", description: "Origem do documento (api, upload, import)" },
  { key: "tipo", description: "Categoria ou tipo específico do documento" },
  { key: "scope", description: "Escopo ou contexto do documento" },
  { key: "autor", description: "Autor do documento" },
  { key: "versao", description: "Versão do documento" },
  { key: "categorias", description: "Categorias para classificação" },
  { key: "tags", description: "Tags para identificação" }
];

interface MetadataFieldSelectorProps {
  type: "key" | "value";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selectedKey?: string;
  existingValues?: string[];
  isLoading?: boolean;
}

export function MetadataFieldSelector({
  type,
  value,
  onChange,
  placeholder = "Selecione ou digite um valor",
  selectedKey,
  existingValues = [],
  isLoading = false
}: MetadataFieldSelectorProps) {
  const [inputValue, setInputValue] = useState(value);
  const isNewValue = value && !existingValues.includes(value);

  return (
    <Autocomplete
      allowsCustomValue
      placeholder={placeholder}
      defaultItems={existingValues.map(val => ({ value: val }))}
      value={value}
      onInputChange={(newValue) => {
        setInputValue(newValue);
        onChange(newValue);
      }}
      className="flex-1"
      isLoading={isLoading}
      endContent={
        isNewValue && !isLoading ? (
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
            <PlusCircle className="w-3 h-3" />
            Novo
          </div>
        ) : null
      }
    >
      {(item) => (
        <AutocompleteItem key={item.value} textValue={item.value}>
          {item.value}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
} 