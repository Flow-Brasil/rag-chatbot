'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetadataSelector } from "./MetadataSelector";

// Campos que não podem ser editados
const READONLY_FIELDS = new Set([
  'document_id',
  'document_name',
  'document_uploaded_at',
  'cliente'
]);

// Campos com valores predefinidos
const PREDEFINED_VALUES: Record<string, string[]> = {
  document_type: ["PDF", "MD", "DOCX", "TXT", "JSON"],
  document_source: ["api", "upload", "import"]
};

interface MetadataEditorProps {
  metadata: { [key: string]: string };
  onChange: (metadata: { [key: string]: string }) => void;
}

export function MetadataEditor({
  metadata = {},
  onChange
}: MetadataEditorProps) {
  const [metadataOptions, setMetadataOptions] = useState<Array<{
    key: string;
    values: string[];
  }>>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Buscar metadados existentes
  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoadingMetadata(true);
        const response = await fetch("/api/metadata");
        if (!response.ok) throw new Error("Erro ao carregar metadados");
        const data = await response.json();
        
        // Converter para o formato esperado
        const options = Object.entries(data.metadata || {}).map(([key, values]) => ({
          key,
          values: values as string[]
        }));

        setMetadataOptions(options);
      } catch (error) {
        console.error("Erro ao carregar metadados:", error);
        setMetadataOptions([]);
      } finally {
        setLoadingMetadata(false);
      }
    }
    
    fetchMetadata();
  }, []);

  const handleRemoveMetadata = (keyToRemove: string) => {
    if (READONLY_FIELDS.has(keyToRemove)) return;
    const newMetadata = { ...metadata };
    delete newMetadata[keyToRemove];
    onChange(newMetadata);
  };

  const isPredefinedField = (key: string) => key in PREDEFINED_VALUES;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Seletor de Chave */}
        <div>
          <MetadataSelector
            items={metadataOptions.map(opt => opt.key)}
            selectedItem={selectedKey}
            onSelect={(key) => {
              setSelectedKey(key);
              setSelectedValue(null);
            }}
            isLoading={loadingMetadata}
            placeholder="Selecione ou digite uma chave"
            emptyMessage="Nenhuma chave encontrada"
            createNewMessage="Nova chave"
          />
        </div>

        {/* Seletor de Valor */}
        <div>
          <MetadataSelector
            items={selectedKey ? 
              (PREDEFINED_VALUES[selectedKey] || 
               metadataOptions.find(opt => opt.key === selectedKey)?.values || 
               []) : []
            }
            selectedItem={selectedValue}
            onSelect={(value) => {
              setSelectedValue(value);
              if (selectedKey) {
                onChange({
                  ...metadata,
                  [selectedKey]: value
                });
                setSelectedKey(null);
                setSelectedValue(null);
              }
            }}
            isLoading={loadingMetadata}
            disabled={!selectedKey}
            placeholder="Selecione ou digite um valor"
            emptyMessage="Nenhum valor encontrado"
            createNewMessage="Novo valor"
          />
        </div>
      </div>

      {/* Lista de Metadados */}
      {Object.keys(metadata).length > 0 && (
        <div className="space-y-2">
          {Object.entries(metadata).map(([key, value]) => (
            !READONLY_FIELDS.has(key) && (
              <Card key={key} className="p-2 flex justify-between items-center">
                <span className="text-sm">
                  <span className={cn(
                    "font-medium",
                    isPredefinedField(key) && "text-blue-600"
                  )}>
                    {key}:
                  </span>
                  {" "}
                  {value}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMetadata(key)}
                  className="h-8 w-8"
                  disabled={READONLY_FIELDS.has(key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
} 