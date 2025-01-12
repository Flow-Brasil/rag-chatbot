"use client";

import React, { useState, KeyboardEvent } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip } from "@nextui-org/react";
import { Settings, Trash2, Book, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function Toolbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveApiKey = async () => {
    if (isSaving) return;
    
    // Validação básica da API key
    if (!apiKey.startsWith("tnt_") || apiKey.length < 20) {
      toast.error("API key inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
      return;
    }

    try {
      setIsSaving(true);
      // Salva a API key no localStorage
      localStorage.setItem("ragie_api_key", apiKey);
      toast.success("API key salva com sucesso!");
      setApiKey(""); // Limpa o input após salvar
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico?")) {
      localStorage.removeItem("chat_messages");
      toast.success("Histórico limpo com sucesso!");
    }
  };

  const handleOpenDocs = () => {
    window.open("/docs", "_blank");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveApiKey();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip content="Configurar API Key">
        <Button
          isIconOnly
          variant="light"
          aria-label="Configurar API Key"
          onClick={onOpen}
        >
          <Settings size={20} />
        </Button>
      </Tooltip>

      <Tooltip content="Limpar Histórico">
        <Button
          isIconOnly
          variant="light"
          aria-label="Limpar Histórico"
          onClick={handleClearHistory}
        >
          <Trash2 size={20} />
        </Button>
      </Tooltip>

      <Tooltip content="Documentação">
        <Button
          isIconOnly
          variant="light"
          aria-label="Documentação"
          onClick={handleOpenDocs}
        >
          <Book size={20} />
        </Button>
      </Tooltip>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        role="dialog"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <ModalContent>
          <ModalHeader>Configurar API Key</ModalHeader>
          <ModalBody>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="bordered"
                size="sm"
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveApiKey}
              isDisabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 