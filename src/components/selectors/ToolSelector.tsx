'use client';

import { Button } from "@/components/ui/button";
import { MetadataSelector } from "@/components/selectors/MetadataSelector";

interface Tool {
  name: string;
  metadata: Record<string, string[]>;
}

interface ToolSelectorProps {
  tools: Tool[];
  newToolName: string;
  onToolNameChange: (value: string) => void;
  onAddTool: (name: string, metadata: Record<string, string[]>) => void;
  availableMetadata?: Record<string, string[]>;
}

export function ToolSelector({
  tools,
  newToolName,
  onToolNameChange,
  onAddTool,
  availableMetadata = {}
}: ToolSelectorProps) {
  return (
    <form 
      className="flex items-center gap-4 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (newToolName.trim()) {
          const selectedTool = tools.find(t => t.metadata['Ferramenta']?.includes(newToolName));
          onAddTool(newToolName, selectedTool?.metadata || availableMetadata);
        }
      }}
    >
      <div className="flex-1">
        <MetadataSelector
          items={tools.map(t => t.metadata?.['Ferramenta']?.[0] || t.name || "").filter(Boolean)}
          selectedItem={newToolName}
          onSelect={(value) => {
            onToolNameChange(value);
            if (value) {
              const selectedTool = tools.find(t => 
                (t.metadata?.['Ferramenta']?.[0] || t.name) === value
              );
              onAddTool(value, selectedTool?.metadata || availableMetadata);
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