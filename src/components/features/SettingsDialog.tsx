"use client";

import { useState, KeyboardEvent } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveApiKey();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      role="dialog"
      id="api-key-modal"
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
              id="api-key-input"
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  id="toggle-visibility-button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            id="cancel-button"
          >
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={handleSaveApiKey}
            isDisabled={isSaving}
            id="save-button"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 