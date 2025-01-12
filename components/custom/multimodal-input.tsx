"use client";

import React, { useState, useEffect } from "react";
import { Bot, Database, Upload, ChevronDown, Pencil, Repeat, RefreshCw, X } from "lucide-react";
import { Button, Tooltip } from "@nextui-org/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";

interface Props {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  messages?: any[];
  setMessages?: (messages: any[]) => void;
  onRestore?: () => void;
}

const AI_MODELS = [
  { key: "gemini", name: "Google Gemini", description: "Modelo mais recente do Google" },
  { key: "groq", name: "Groq", description: "Modelo otimizado para alta performance" }
];

export function MultimodalInput({ 
  input, 
  setInput, 
  handleSubmit,
  isLoading
}: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [apiKey, setApiKey] = useState("");
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);

  // Carrega a API key salva ao montar o componente
  useEffect(() => {
    const savedApiKey = localStorage.getItem("ragie_api_key");
    if (savedApiKey && savedApiKey !== "tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA") {
      setCustomApiKey(savedApiKey);
      setApiKey(savedApiKey);
    }
  }, []);

  // Carrega as mensagens salvas ao montar o componente
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        setMessages([]);
      }
    }
  }, []);

  // Salva as mensagens quando elas mudam
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        toast.error("Por favor, selecione apenas arquivos JSON");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("metadata", JSON.stringify({ scope: selectedFile.name.replace(/\.json$/, '') }));

      const response = await fetch("https://api.ragie.ai/documents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      toast.success("Documento enviado com sucesso!");
      setShowUploadModal(false);
      setSelectedFile(null);
      
      // Lista os documentos após o upload sem mostrar o comando
      const currentInput = input;
      setInput("/docs");
      handleSubmit(new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent);
      setInput(currentInput);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar documento");
    } finally {
      setIsUploading(false);
    }
  };

  const handleListDocuments = async () => {
    setIsProcessing(true);
    try {
      const currentInput = input;
      setInput("/docs");
      await handleSubmit(new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent);
      setInput(currentInput);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      if (!apiKey.startsWith("tnt_") || apiKey.length < 20) {
        toast.error("Por favor, insira uma API key válida da Ragie");
        return;
      }
      localStorage.setItem("ragie_api_key", apiKey.trim());
      toast.success("API key atualizada com sucesso!");
      setShowApiKeyInput(false);
    } else {
      toast.error("Por favor, insira uma API key válida");
    }
  };

  const handleModelSwitch = () => {
    const currentIndex = AI_MODELS.findIndex(model => model.key === selectedModel.key);
    const nextIndex = (currentIndex + 1) % AI_MODELS.length;
    setSelectedModel(AI_MODELS[nextIndex]);
    toast.success(`Modelo alterado para ${AI_MODELS[nextIndex].name}`);
  };

  const handleRestore = () => {
    setSelectedModel(AI_MODELS[0]);
    localStorage.setItem("ragie_api_key", "tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA");
    setApiKey("tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA");
    setCustomApiKey(null);
    setInput("");
    setSelectedFile(null);
    setShowUploadModal(false);
    setShowApiKeyInput(false);
    setMessages([]);
    localStorage.removeItem("chat_messages");
    toast.success("Configurações restauradas para os valores padrão");
  };

  const handleClearApiKey = () => {
    setApiKey("");
    setShowApiKeyInput(false);
  };

  return (
    <>
      <div className="flex flex-col w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-4"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full resize-none bg-transparent px-4 py-[1.3rem] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base border rounded-xl transition-all"
                style={{
                  maxHeight: "200px",
                  height: "60px",
                  overflowY: "auto",
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-[60px] px-4 transition-colors duration-200"
                aria-label="Enviar mensagem"
              >
                <Bot className="h-5 w-5" />
              </Button>
              <Tooltip content={showToolbar ? "Ocultar ferramentas" : "Mostrar ferramentas"}>
                <Button
                  isIconOnly
                  variant="light"
                  onClick={() => setShowToolbar(!showToolbar)}
                  className="text-default-600 hover:bg-blue-50 transition-all duration-200 h-[30px]"
                  aria-label={showToolbar ? "Ocultar barra de ferramentas" : "Mostrar barra de ferramentas"}
                >
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      showToolbar ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </Tooltip>
            </div>
          </div>

          {showToolbar && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 px-4 py-2 border-t border-gray-100">
                <Tooltip content="Listar documentos" placement="bottom">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleListDocuments}
                    className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                    isLoading={isProcessing}
                    aria-label="Listar documentos disponíveis"
                  >
                    <Database className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Tooltip content="Fazer upload de documento" placement="bottom">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setShowUploadModal(true)}
                    className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                    aria-label="Fazer upload de documento JSON"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Tooltip content="Configurar API Key personalizada" placement="bottom">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                    aria-label="Configurar API key personalizada"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Tooltip content={`Alterar modelo (atual: ${selectedModel.name})`} placement="bottom">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleModelSwitch}
                    className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                    aria-label="Alterar modelo de IA"
                  >
                    <Repeat className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Tooltip content="Restaurar configurações padrão" placement="bottom">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleRestore}
                    className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                    aria-label="Restaurar configurações"
                    isDisabled={messages.length === 0 && !customApiKey && selectedModel.key === "gemini"}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </div>

              {showApiKeyInput && (
                <div className="flex gap-2 items-end px-4 animate-in fade-in-0 slide-in-from-top-5">
                  <input
                    type="password"
                    placeholder="Cole sua API key aqui para sobrescrever a padrão"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 p-2 rounded-lg border"
                  />
                  {apiKey && (
                    <Button
                      isIconOnly
                      variant="light"
                      onClick={handleClearApiKey}
                      className="text-default-600 hover:bg-blue-50 transition-all duration-200"
                      aria-label="Limpar API key"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload de Documento JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-blue-400">
              <div className="text-center mb-4">
                <h3 className="text-sm font-medium mb-2">Selecione um arquivo JSON</h3>
                <p className="text-xs text-gray-500">Apenas arquivos .json são aceitos</p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="json-upload"
              />
              <label
                htmlFor="json-upload"
                className="cursor-pointer flex flex-col items-center text-blue-500 hover:text-blue-600 transition-colors"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin">
                      <Bot className="h-5 w-5" />
                    </span>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>
                    {selectedFile ? (
                      <div className="text-center">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-50 rounded-full mb-2 transition-transform hover:scale-105">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p>Clique para selecionar um arquivo JSON</p>
                      </>
                    )}
                  </>
                )}
              </label>
            </div>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <span className="animate-spin">
                      <Bot className="h-5 w-5" />
                    </span>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Enviar"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
