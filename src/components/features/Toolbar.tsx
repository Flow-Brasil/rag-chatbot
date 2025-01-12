'use client';

import React, { useState } from 'react';
import { Button, Tooltip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { Eye, EyeOff, Key, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function Toolbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.startsWith('tnt_') || apiKey.length < 20) {
      toast.error('API key inválida. Deve começar com \'tnt_\' e ter pelo menos 20 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('ragie_api_key', apiKey);
      toast.success('API key salva com sucesso!');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      localStorage.removeItem('chat_messages');
      toast.success('Histórico limpo com sucesso!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveApiKey();
    }
  };

  return (
    <div className="flex gap-2">
      <Tooltip content="Configurar API Key">
        <Button
          aria-label="Configurar API Key"
          isIconOnly
          onClick={onOpen}
          variant="light"
        >
          <Key className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Limpar Histórico">
        <Button
          aria-label="Limpar Histórico"
          isIconOnly
          onClick={handleClearHistory}
          variant="light"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Documentação">
        <Button
          aria-label="Documentação"
          isIconOnly
          onClick={() => window.open('/docs', '_blank')}
          variant="light"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Configurar API Key</ModalHeader>
          <ModalBody>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              label="API Key"
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleSaveApiKey}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 