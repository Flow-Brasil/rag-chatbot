'use client';

import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface Cliente {
  name: string;
  documentCount: number;
}

interface IntelligentSelectorProps {
  clientes: Cliente[];
  selectedCliente: string | null;
  onClientSelect: (clientName: string | null) => void;
  onInputChange: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function IntelligentSelector({
  clientes,
  selectedCliente,
  onClientSelect,
  onInputChange,
  isLoading = false,
  placeholder = "Digite para buscar ou adicionar um cliente"
}: IntelligentSelectorProps) {
  const [inputValue, setInputValue] = useState(selectedCliente || "");

  // Verificar se o cliente é novo
  const isNewClient = inputValue && !clientes.some(c => c.name === inputValue);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onInputChange(value);
    onClientSelect(value);
  };

  return (
    <Autocomplete
      allowsCustomValue
      placeholder={placeholder}
      defaultItems={clientes}
      value={inputValue}
      onInputChange={handleInputChange}
      onSelectionChange={(value) => {
        if (typeof value === 'string') {
          setInputValue(value);
          onClientSelect(value);
        }
      }}
      isLoading={isLoading}
      className="w-full"
      endContent={
        isNewClient ? (
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            Novo Cliente
          </div>
        ) : null
      }
    >
      {(cliente) => (
        <AutocompleteItem key={cliente.name} textValue={cliente.name}>
          <div className="flex justify-between items-center">
            <span>{cliente.name}</span>
            <span className="text-sm text-gray-500">
              {cliente.documentCount} doc{cliente.documentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
} 