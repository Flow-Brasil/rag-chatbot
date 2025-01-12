"use client";

import { useState } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Settings, Trash2, Book } from "lucide-react";
import { toast } from "sonner";

export function Toolbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiKey, setApiKey] = useState("");

  const handleSaveApiKey = () => {
    // Validação básica da API key
    if (!apiKey.startsWith("tnt_") || apiKey.length < 20) {
      toast.error("API key inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
      return;
    }

    // Salva a API key no localStorage
    localStorage.setItem("ragie_api_key", apiKey);
    toast.success("API key salva com sucesso!");
    onClose();
  };

  const handleClearHistory = () => {
    localStorage.removeItem("chat_messages");
    toast.success("Histórico limpo com sucesso!");
  };

  const handleOpenDocs = () => {
    window.open("/docs", "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        isIconOnly
        variant="light"
        aria-label="Configurar API Key"
        onClick={onOpen}
      >
        <Settings size={20} />
      </Button>

      <Button
        isIconOnly
        variant="light"
        aria-label="Limpar Histórico"
        onClick={handleClearHistory}
      >
        <Trash2 size={20} />
      </Button>

      <Button
        isIconOnly
        variant="light"
        aria-label="Documentação"
        onClick={handleOpenDocs}
      >
        <Book size={20} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Configurar API Key</ModalHeader>
          <ModalBody>
            <Input
              type="password"
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              variant="bordered"
              size="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSaveApiKey}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 