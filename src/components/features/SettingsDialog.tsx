"use client";

import { useState, KeyboardEvent } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [ragieKey, setRagieKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    gemini: false,
    groq: false,
    ragie: false
  });

  const handleSaveApiKeys = async () => {
    if (isSaving) return;
    
    // Validação das chaves
    if (geminiKey && !geminiKey.startsWith("AIzaSy")) {
      toast.error("API key do Gemini inválida. Deve começar com 'AIzaSy'");
      return;
    }

    if (groqKey && !groqKey.startsWith("gsk_")) {
      toast.error("API key do Groq inválida. Deve começar com 'gsk_'");
      return;
    }

    if (ragieKey && (!ragieKey.startsWith("tnt_") || ragieKey.length < 20)) {
      toast.error("API key do Ragie inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
      return;
    }

    try {
      setIsSaving(true);
      
      // Salva as API keys no localStorage
      if (geminiKey) localStorage.setItem("gemini_api_key", geminiKey);
      if (groqKey) localStorage.setItem("groq_api_key", groqKey);
      if (ragieKey) localStorage.setItem("ragie_api_key", ragieKey);
      
      toast.success("API keys salvas com sucesso!");
      setGeminiKey("");
      setGroqKey("");
      setRagieKey("");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (key: 'gemini' | 'groq' | 'ragie') => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveApiKeys();
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
        <ModalHeader>Configurar API Keys</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Gemini API Key */}
            <div className="relative">
              <Input
                type={showPasswords.gemini ? "text" : "password"}
                label="Gemini API Key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="bordered"
                size="sm"
                placeholder="Começa com AIzaSy..."
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    aria-label="Toggle Gemini password visibility"
                    onClick={() => togglePasswordVisibility('gemini')}
                  >
                    {showPasswords.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                }
              />
            </div>

            {/* Groq API Key */}
            <div className="relative">
              <Input
                type={showPasswords.groq ? "text" : "password"}
                label="Groq API Key"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="bordered"
                size="sm"
                placeholder="Começa com gsk_..."
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    aria-label="Toggle Groq password visibility"
                    onClick={() => togglePasswordVisibility('groq')}
                  >
                    {showPasswords.groq ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                }
              />
            </div>

            {/* Ragie API Key */}
            <div className="relative">
              <Input
                type={showPasswords.ragie ? "text" : "password"}
                label="Ragie API Key"
                value={ragieKey}
                onChange={(e) => setRagieKey(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="bordered"
                size="sm"
                placeholder="Começa com tnt_..."
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    aria-label="Toggle Ragie password visibility"
                    onClick={() => togglePasswordVisibility('ragie')}
                  >
                    {showPasswords.ragie ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                }
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={handleSaveApiKeys}
            isDisabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 