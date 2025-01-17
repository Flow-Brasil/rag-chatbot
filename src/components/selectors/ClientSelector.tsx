'use client';

import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface Cliente {
  name: string;
  documentCount: number;
}

interface ClientSelectorProps {
  clientes: Cliente[];
  selectedCliente: string | null;
  inputValue: string;
  onClientSelect: (clientName: string) => void;
  onInputChange: (value: string) => void;
  onCreateNewClient?: (clientName: string) => void;
  isLoading?: boolean;
}

export function ClientSelector({
  clientes,
  selectedCliente,
  inputValue,
  onClientSelect,
  onInputChange,
  onCreateNewClient,
  isLoading = false
}: ClientSelectorProps) {
  return (
    <Autocomplete
      allowsCustomValue
      placeholder="Digite para buscar ou adicionar um cliente"
      defaultItems={clientes}
      value={selectedCliente || ""}
      onInputChange={onInputChange}
      onSelectionChange={(value) => {
        if (typeof value === 'string') {
          onClientSelect(value);
        }
      }}
      className="w-full"
      isLoading={isLoading}
      endContent={
        inputValue && !clientes.some(c => c.name === inputValue) ? (
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