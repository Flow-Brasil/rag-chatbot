"use client";

import { useState, FormEvent } from "react";
import { Card, Select, SelectItem, Chip, Tooltip, Button, Spinner } from "@nextui-org/react";
import { Pencil, X, RefreshCw } from "lucide-react";
import { useModelChat } from "@/hooks/useModelChat";
import { ModelType } from "@/lib/types/llm";
import { MultimodalInput } from "../../../components/custom/multimodal-input";

interface ModelChatProps {
  defaultModel?: ModelType;
}

export function ModelChat({ 
  defaultModel = "gemini"
}: ModelChatProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>(defaultModel);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Usar a chave do .env por padrão
  const defaultGroqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const defaultGeminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  const apiKey = selectedModel === "groq" ? defaultGroqKey : defaultGeminiKey;
  const hasGroqKey = !!defaultGroqKey;
  const hasGeminiKey = !!defaultGeminiKey;

  // Verificar se precisamos mostrar avisos (apenas para Groq sem chave)
  const shouldShowWarning = selectedModel === "groq" && !defaultGroqKey && !customApiKey;

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isModelReady
  } = useModelChat({
    modelType: selectedModel,
    apiKey: customApiKey || apiKey || "",
    onError: (error) => console.error("Chat Error:", error)
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || shouldShowWarning) return;
    
    await sendMessage(input);
    setInput("");
  };

  const handleClearCustomKey = () => {
    setCustomApiKey("");
    setShowApiKeyInput(false);
  };

  const handleRestore = () => {
    clearMessages();
    setCustomApiKey("");
    setShowApiKeyInput(false);
    setSelectedModel("gemini");
  };

  return (
    <Card className="p-4 w-full max-w-3xl mx-auto shadow-lg">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Select
              label="Modelo de IA"
              selectedKeys={[selectedModel]}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              className="max-w-[200px]"
              size="sm"
              variant="bordered"
              defaultSelectedKeys={["gemini"]}
            >
              <SelectItem 
                key="gemini" 
                value="gemini"
                startContent={
                  <Chip 
                    size="sm" 
                    color={hasGeminiKey ? "success" : "danger"}
                    variant="flat"
                    className="mr-2"
                  >
                    {hasGeminiKey ? "Pronto" : "Sem API"}
                  </Chip>
                }
              >
                Google Gemini
              </SelectItem>
              <SelectItem 
                key="groq" 
                value="groq"
                startContent={
                  <Chip 
                    size="sm" 
                    color={hasGroqKey ? "success" : "danger"}
                    variant="flat"
                    className="mr-2"
                  >
                    {hasGroqKey ? "Pronto" : "Sem API"}
                  </Chip>
                }
              >
                Groq (Avançado)
              </SelectItem>
            </Select>
            <Tooltip content="Configurar API Key personalizada">
              <Button
                isIconOnly
                variant="light"
                onPress={() => setShowApiKeyInput(!showApiKeyInput)}
                className="min-w-unit-8"
                size="sm"
              >
                <Pencil size={16} />
              </Button>
            </Tooltip>
          </div>
          <Tooltip content="Restaurar configurações padrão">
            <Button 
              color="default" 
              variant="light" 
              onPress={handleRestore}
              isDisabled={messages.length === 0 && !customApiKey && selectedModel === "gemini"}
              startContent={<RefreshCw size={16} />}
              size="sm"
            >
              Restaurar
            </Button>
          </Tooltip>
        </div>

        {/* Campo para API key customizada */}
        {showApiKeyInput && (
          <div className="flex gap-2 items-end animate-in fade-in-0 slide-in-from-top-5">
            <input
              type="password"
              placeholder="Cole sua API key aqui para sobrescrever a padrão"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="flex-1 p-2 rounded-lg border"
            />
            {customApiKey && (
              <Button
                isIconOnly
                variant="light"
                onPress={handleClearCustomKey}
                size="sm"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        )}
        
        {shouldShowWarning && (
          <div className="p-2 text-sm text-center bg-warning-50 text-warning-600 rounded-lg animate-in fade-in-0 slide-in-from-top-5">
            ⚠️ Configure uma API Key para usar o modelo avançado GROQ
          </div>
        )}
      </div>

      <div className="space-y-3 mb-16 max-h-[500px] overflow-y-auto p-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === "user" 
                ? "bg-primary-100 ml-auto text-primary-900" 
                : "bg-default-100"
            } max-w-[85%] shadow-sm animate-in fade-in-0 slide-in-from-bottom-5`}
          >
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center p-2 animate-in fade-in-0">
            <Spinner size="sm" />
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm animate-in fade-in-0 slide-in-from-top-5">
            {error}
          </div>
        )}
      </div>

      <div className="relative">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
} 