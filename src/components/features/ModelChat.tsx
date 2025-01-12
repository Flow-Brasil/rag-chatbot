"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Card, Spinner, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination } from "@nextui-org/react";
import { useModelChat } from "@/hooks/useModelChat";
import { ModelType } from "@/lib/types/llm";
import { MultimodalInput } from './MultimodalInput';
import { Toolbar } from "./Toolbar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatTableData, exportTableData } from "@/lib/utils/table";
import { Download, ArrowUpDown } from "lucide-react";

interface ModelChatProps {
  defaultModel?: ModelType;
}

export function ModelChat({ 
  defaultModel = "gemini"
}: ModelChatProps) {
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState<ModelType>(defaultModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    column?: string;
    direction: 'asc' | 'desc';
  }>({ direction: 'desc' });

  // Usar a chave do modelo atual
  const apiKey = currentModel === 'gemini' 
    ? process.env.NEXT_PUBLIC_GEMINI_API_KEY 
    : process.env.NEXT_PUBLIC_GROQ_API_KEY;

  // Verificar se a chave API está disponível
  useEffect(() => {
    if (!apiKey) {
      console.error(`Chave API não encontrada para o modelo ${currentModel}`);
    }
  }, [apiKey, currentModel]);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useModelChat({
    modelType: currentModel,
    apiKey: apiKey || '', // Garantir que nunca seja undefined
    onError: (error) => console.error("Chat Error:", error)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Scroll quando mensagens ou estado de loading mudar

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput("");
  };

  const handleChangeModel = (model: ModelType) => {
    setCurrentModel(model);
    clearMessages(); // Limpa o histórico ao trocar de modelo
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleExport = (content: string) => {
    const csv = exportTableData(content, 'csv');
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const formatContent = (content: string) => {
    return formatTableData(content, {
      page: currentPage,
      pageSize: 10,
      sortColumn: sortConfig.column,
      sortDirection: sortConfig.direction
    });
  };

  // Calcula o número total de páginas
  const getTotalPages = (content: string): number => {
    const lines = content.split('\n').filter(line => line.trim());
    // Remove o cabeçalho e a linha de separação
    const dataRows = lines.filter(line => !line.includes('Classificação') && !line.includes('---'));
    return Math.ceil(dataRows.length / 10);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 border-b bg-white z-50 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <Toolbar 
            onClearChat={clearMessages}
            currentModel={currentModel}
            onChangeModel={handleChangeModel}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <Card className="mx-auto max-w-3xl rounded-b-none shadow-lg bg-white">
          <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg ${
                    m.role === "user" 
                      ? "bg-blue-50 ml-auto text-gray-800" 
                      : "bg-white"
                  } max-w-[85%] shadow-sm animate-in fade-in-0 slide-in-from-bottom-5`}
                >
                  {m.role === "assistant" && m.content.includes("|") && (
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex justify-end gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button 
                              size="sm" 
                              variant="light"
                              startContent={<ArrowUpDown className="h-4 w-4" />}
                            >
                              Ordenar
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Ordenar tabela">
                            <DropdownItem key="points" onClick={() => handleSort('points')}>
                              Por Pontos
                            </DropdownItem>
                            <DropdownItem key="team" onClick={() => handleSort('team')}>
                              Por Time
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        <Button
                          size="sm"
                          variant="light"
                          startContent={<Download className="h-4 w-4" />}
                          onClick={() => handleExport(m.content)}
                        >
                          Exportar
                        </Button>
                      </div>
                      {getTotalPages(m.content) > 1 && (
                        <div className="flex justify-center">
                          <Pagination
                            total={getTotalPages(m.content)}
                            page={currentPage}
                            onChange={setCurrentPage}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose dark:prose-invert max-w-none"
                  >
                    {formatContent(m.content)}
                  </ReactMarkdown>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center p-2 animate-in fade-in-0">
                  <Spinner size="sm" />
                </div>
              )}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-in fade-in-0 slide-in-from-top-5">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t bg-white p-4">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </Card>
      </div>
    </>
  );
} 