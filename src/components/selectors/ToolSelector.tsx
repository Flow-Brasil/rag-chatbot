'use client';

import { Button } from "@/components/ui/button";
import { MetadataSelector } from "@/components/selectors/MetadataSelector";

interface ToolSelectorProps {
  tools: { name: string }[];
  newToolName: string;
  onToolNameChange: (value: string) => void;
  onAddTool: (name: string) => void;
}

export function ToolSelector({
  tools,
  newToolName,
  onToolNameChange,
  onAddTool
}: ToolSelectorProps) {
  return (
    <form 
      className="flex items-center gap-4 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (newToolName.trim()) {
          onAddTool(newToolName);
        }
      }}
    >
      <div className="flex-1">
        <MetadataSelector
          items={tools.map(t => t.name)}
          selectedItem={newToolName}
          onSelect={(value) => {
            onToolNameChange(value);
            if (value && !tools.some(t => t.name === value)) {
              onAddTool(value);
            }
          }}
          onInputChange={onToolNameChange}
          createNewMessage="Nova Ferramenta"
          placeholder="Selecione ou adicione uma ferramenta"
        />
      </div>
      <Button
        type="submit"
        variant="default"
        disabled={!newToolName.trim() || tools.some(t => t.name === newToolName)}
      >
        Adicionar
      </Button>
    </form>
  );
} 