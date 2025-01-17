'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";
import type { FileNameSelectorProps } from "./types";

export function FileNameSelector({
  suggestedName,
  value,
  onChange,
  onConfirm,
  isLoading = false,
  placeholder = "Digite o nome do arquivo",
  label = "Nome do arquivo"
}: FileNameSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const validateFileName = (name: string) => {
    if (!name.trim()) {
      setError("O nome do arquivo não pode ficar vazio");
      return false;
    }

    if (name.length > 100) {
      setError("Nome do arquivo muito longo");
      return false;
    }

    // Garantir que o arquivo termine com .json
    if (!name.toLowerCase().endsWith('.json')) {
      name = name + '.json';
    }

    setError(null);
    return true;
  };

  const handleNameChange = (value: string) => {
    if (validateFileName(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Nome do Arquivo</h3>
      
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="fileName">{label}</Label>
          <Input
            id="fileName"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleNameChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "fileName-error" : undefined}
            disabled={isLoading}
            className={error ? "border-destructive" : undefined}
          />
          {error && (
            <p id="fileName-error" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Nome sugerido: {suggestedName}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onConfirm}
          disabled={!!error || !value.trim() || isLoading}
          aria-label="Confirmar nome do arquivo"
        >
          <CheckIcon className="w-4 h-4 mr-2" />
          Confirmar
        </Button>
      </div>
    </div>
  );
} 