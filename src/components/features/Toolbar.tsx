"use client";

import { useState } from "react";
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Settings, Trash2, Bot, FileText, Upload, Search, Database } from "lucide-react";
import { SettingsDialog } from "./SettingsDialog";
import { ModelType } from "@/lib/types/llm";

interface ToolbarProps {
  onClearChat: () => void;
  currentModel: ModelType;
  onChangeModel: (model: ModelType) => void;
  onSendCommand: (command: string) => void;
  hasRagieKey?: boolean;
}

export function Toolbar({ 
  onClearChat, 
  currentModel, 
  onChangeModel,
  onSendCommand,
  hasRagieKey = false
}: ToolbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {hasRagieKey && (
        <>
          <Tooltip content="Listar Documentos">
            <Button
              isIconOnly
              variant="light"
              aria-label="Listar Documentos"
              onPress={() => onSendCommand("/docs")}
            >
              <Database className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Upload de Documento">
            <Button
              isIconOnly
              variant="light"
              aria-label="Upload de Documento"
              onPress={() => onSendCommand("/upload")}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Buscar em Documentos">
            <Button
              isIconOnly
              variant="light"
              aria-label="Buscar em Documentos"
              onPress={() => onSendCommand("/search")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </Tooltip>
        </>
      )}

      <Tooltip content="Selecionar Modelo">
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              aria-label="Selecionar Modelo"
            >
              <Bot className="h-4 w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Selecionar Modelo"
            selectedKeys={new Set([currentModel])}
            onAction={(key) => onChangeModel(key as ModelType)}
          >
            <DropdownItem key="gemini">Gemini</DropdownItem>
            <DropdownItem key="groq">Groq</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Tooltip>

      <Tooltip content="Limpar histórico">
        <Button
          isIconOnly
          variant="light"
          aria-label="Limpar histórico"
          onPress={onClearChat}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Configurações">
        <Button
          isIconOnly
          variant="light"
          aria-label="Configurações"
          onPress={handleOpenSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </Tooltip>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </div>
  );
} 