'use client';

import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import type { MetadataEditorProps } from "./types";

export function MetadataEditor({
  metadata,
  selectedMetadata,
  onMetadataSelect,
  isLoading = false,
  title = "Adicionar Metadados",
  keyLabel = "Tipo",
  valueLabel = "Valor",
  keyPlaceholder = "Selecione o tipo",
  valuePlaceholder = "Selecione o valor"
}: MetadataEditorProps) {
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleKeySelect = (key: string) => {
    setSelectedKey(key);
    setSelectedValue("");
  };

  const handleValueSelect = (value: string) => {
    setSelectedValue(value);
    if (selectedKey) {
      onMetadataSelect(selectedKey, value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Seletor de Chave */}
        <Autocomplete
          label={keyLabel}
          placeholder={keyPlaceholder}
          defaultItems={Object.keys(metadata).map(key => ({ value: key }))}
          selectedKey={selectedKey}
          onSelectionChange={(key) => handleKeySelect(key as string)}
          isDisabled={isLoading}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>
              {item.value}
            </AutocompleteItem>
          )}
        </Autocomplete>

        {/* Seletor de Valor */}
        <Autocomplete
          label={valueLabel}
          placeholder={valuePlaceholder}
          defaultItems={selectedKey ? metadata[selectedKey]?.map(value => ({ value })) || [] : []}
          selectedKey={selectedValue}
          onSelectionChange={(value) => handleValueSelect(value as string)}
          isDisabled={!selectedKey || isLoading}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>
              {item.value}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      {/* Lista de Metadados Selecionados */}
      {Object.entries(selectedMetadata).length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Metadados Selecionados:</h4>
          <div className="space-y-2">
            {Object.entries(selectedMetadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">
                  <span className="font-medium">{key}:</span> {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 