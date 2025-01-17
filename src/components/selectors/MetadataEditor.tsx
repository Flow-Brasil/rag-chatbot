'use client';

import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Key } from "react";

interface MetadataEditorProps {
  onChange: (metadata: { [key: string]: string }) => void;
  metadata?: { [key: string]: string };
  existingMetadata?: { [key: string]: Set<string> };
}

interface MetadataItem {
  value: string;
  label: string;
}

export function MetadataEditor({ onChange, metadata = {}, existingMetadata = {} }: MetadataEditorProps) {
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedValues, setSelectedValues] = useState<{[key: string]: Set<string>}>(() => {
    // Inicializar selectedValues durante a criação do estado
    const initialSelectedValues: {[key: string]: Set<string>} = {};
    Object.entries(metadata).forEach(([key, value]) => {
      const [fieldKey] = key.split('_');
      if (fieldKey) {
        if (!initialSelectedValues[fieldKey]) {
          initialSelectedValues[fieldKey] = new Set();
        }
        initialSelectedValues[fieldKey].add(value);
      }
    });
    return initialSelectedValues;
  });
  const [loading, setLoading] = useState(false);

  // Converter metadados existentes para o formato de chaves
  const metadataKeys = Object.keys(existingMetadata).map(key => ({
    value: key,
    label: key
  }));

  // Obter valores disponíveis para a chave selecionada
  const getAvailableValues = () => {
    if (!selectedKey || !existingMetadata[selectedKey]) return [];
    
    const values = existingMetadata[selectedKey];
    return Array.from(values).map(value => ({
      value,
      label: value
    }));
  };

  const handleKeyChange = (key: Key | null) => {
    const keyStr = key?.toString() || "";
    setSelectedKey(keyStr);
    
    // Inicializar conjunto de valores se não existir
    if (keyStr && !selectedValues[keyStr]) {
      const newSelectedValues = { ...selectedValues };
      newSelectedValues[keyStr] = new Set();
      setSelectedValues(newSelectedValues);
    }
  };

  const handleValueChange = (key: Key | null) => {
    if (!selectedKey) return;
    
    const value = key?.toString();
    if (!value) return;

    const currentValues = selectedValues[selectedKey] || new Set<string>();
    const newValues = new Set(currentValues);
    
    if (newValues.has(value)) {
      newValues.delete(value);
    } else {
      newValues.add(value);
    }
    
    const newSelectedValues = { ...selectedValues };
    if (newValues.size > 0) {
      newSelectedValues[selectedKey] = newValues;
    } else {
      delete newSelectedValues[selectedKey];
    }
    
    // Atualizar metadata mantendo todos os valores selecionados
    const newMetadata: {[key: string]: string} = {};
    Object.entries(newSelectedValues).forEach(([fieldKey, values]) => {
      values.forEach(val => {
        newMetadata[`${fieldKey}_${val}`] = val;
      });
    });
    
    setSelectedValues(newSelectedValues);
    onChange(newMetadata);
  };

  // Ordenar itens para mostrar selecionados primeiro
  const getSortedItems = () => {
    const items = getAvailableValues();
    const selected = selectedValues[selectedKey] || new Set<string>();
    
    return items.sort((a, b) => {
      const aSelected = selected.has(a.value);
      const bSelected = selected.has(b.value);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.label.localeCompare(b.label);
    });
  };

  return (
    <div className="space-y-4">
      {/* Área de Tags Selecionadas */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
        {Object.entries(selectedValues).map(([key, values]) => (
          Array.from(values).map(value => (
            <div 
              key={`${key}-${value}`}
              className="bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-sm flex items-center gap-2 group hover:bg-primary/20 transition-colors"
            >
              <span className="text-gray-500 text-xs font-medium">{key}:</span>
              <span>{value}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedKey(key);
                  handleValueChange(value as Key);
                }}
                className="hover:bg-primary/30 rounded-full w-4 h-4 flex items-center justify-center text-xs group-hover:text-primary-dark"
              >
                ×
              </button>
            </div>
          ))
        ))}
      </div>

      {/* Campo de Filtro Único */}
      <div className="space-y-3 bg-white rounded-lg p-4 border">
        <div className="flex gap-3">
          <div className="w-1/3">
            <Autocomplete<MetadataItem>
              label="Campo"
              placeholder="Selecione um campo"
              selectedKey={selectedKey}
              defaultItems={metadataKeys}
              onSelectionChange={handleKeyChange}
              classNames={{
                base: "w-full"
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {selectedKey && (
            <div className="flex-1">
              <Autocomplete<MetadataItem>
                label="Valor"
                placeholder="Selecione ou busque valores"
                defaultItems={getSortedItems()}
                onSelectionChange={handleValueChange}
                isLoading={loading}
                classNames={{
                  base: "w-full",
                  listbox: "max-h-[300px]"
                }}
              >
                {(item) => (
                  <AutocompleteItem 
                    key={item.value}
                    className={`${
                      selectedValues[selectedKey]?.has(item.value) 
                        ? "bg-primary/10 text-primary data-[hover=true]:bg-primary/20" 
                        : ""
                    } rounded-md transition-colors`}
                  >
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 