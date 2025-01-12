"use client";

import { useState } from "react";
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Settings, Trash2, Bot } from "lucide-react";
import { SettingsDialog } from "./SettingsDialog";
import { ModelType } from "@/lib/types/llm";

interface ToolbarProps {
  onClearChat: () => void;
  currentModel: ModelType;
  onChangeModel: (model: ModelType) => void;
}

export function Toolbar({ onClearChat, currentModel, onChangeModel }: ToolbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
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
          onClick={onClearChat}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Configurações">
        <Button
          isIconOnly
          variant="light"
          aria-label="Configurações"
          onClick={handleOpenSettings}
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