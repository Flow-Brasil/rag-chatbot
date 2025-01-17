'use client';

import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface MetadataSelectorProps {
  items: string[];
  selectedItem: string | null;
  onSelect: (value: string) => void;
  onInputChange?: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  createNewMessage?: string;
}

export function MetadataSelector({
  items,
  selectedItem,
  onSelect,
  onInputChange,
  isLoading = false,
  disabled = false,
  placeholder = "Digite para buscar ou adicionar",
  emptyMessage = "Nenhum item encontrado",
  createNewMessage = "Novo item"
}: MetadataSelectorProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onInputChange?.(value);
  };

  const showNewItemBadge = inputValue && !items.includes(inputValue);

  return (
    <Autocomplete
      allowsCustomValue
      placeholder={placeholder}
      defaultItems={items.map(item => ({ value: item }))}
      value={selectedItem || ""}
      onInputChange={handleInputChange}
      onSelectionChange={(value) => {
        if (typeof value === 'string') {
          onSelect(value);
        }
      }}
      className="w-full"
      isLoading={isLoading}
      isDisabled={disabled}
      endContent={
        showNewItemBadge ? (
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            {createNewMessage}
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