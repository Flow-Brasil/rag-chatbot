"use client";

import { useState, useRef, useEffect } from "react";
import { useModelChat } from "@/hooks/useModelChat";
import { useRagieCommands } from "@/hooks/useRagieCommands";
import { createRagieClient } from "@/lib/ragie-client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Textarea,
  Spinner,
  Tooltip,
  Divider,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab
} from "@nextui-org/react";
import { Send, Trash2, Upload, Search, FileText, X, Info, ExternalLink } from "lucide-react";

interface ModelChatProps {
  modelType?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
  'text/markdown',
  'text/x-markdown',
  'application/x-markdown'
];

export function ModelChat({ modelType = 'gemini' }: ModelChatProps) {
  const [input, setInput] = useState("");
  const [scope, setScope] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isLoading, sendMessage, clearMessages } = useModelChat(modelType);
  const { processCommand, isProcessing } = useRagieCommands();
  const [showUpload, setShowUpload] = useState(false);

  // Log de montagem do componente
  useEffect(() => {
    console.log('🔨 Componente ModelChat montado');
    return () => {
      console.log('🧹 Componente ModelChat desmontado');
    };
  }, []);

  // Carrega a lista de documentos ao montar o componente
  useEffect(() => {
    console.log('⚡ Effect de carregamento de documentos iniciado');
    console.log('📌 Dependências atuais:', { processCommand: !!processCommand, sendMessage: !!sendMessage });

    const loadDocuments = async () => {
      console.log('🔄 Inicializando chat - carregando documentos...');
      try {
        console.log('🎯 Chamando /docs...');
        const response = await processCommand("/docs");
        console.log('📝 Resposta do comando /docs:', response);
        if (response) {
          console.log('📨 Enviando resposta para o chat...');
          await sendMessage(response, { role: 'assistant' });
          console.log('✅ Lista de documentos carregada e exibida');
        } else {
          console.log('⚠️ Comando /docs não retornou resposta');
        }
      } catch (error) {
        console.error("❌ Erro ao carregar documentos:", error);
        toast.error("Erro ao carregar lista de documentos");
      }
    };

    loadDocuments();

    return () => {
      console.log('🔚 Effect de carregamento de documentos finalizado');
    };
  }, [processCommand, sendMessage]);

  // Função para extrair documentos das mensagens
  const extractDocuments = (content: string) => {
    const lines = content.split('\n');
    return lines
      .filter(line => line.includes('(') && line.includes(')'))
      .map(line => {
        const match = line.match(/- (.*?) \((.*?)\)/);
        if (match) {
          return {
            name: match[1],
            id: match[2]
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleDocumentClick = async (docId: string) => {
    try {
      console.log('🔍 Verificando documento:', docId);
      const client = createRagieClient(process.env.NEXT_PUBLIC_RAGIE_API_KEY || '');
      const doc = await client.getDocument(docId);
      setSelectedDocument(doc);
      setIsDocumentModalOpen(true);
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do documento:', error);
      await sendMessage(`Erro ao carregar detalhes do documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { role: 'assistant' });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      await sendMessage("Nenhum arquivo selecionado", { role: 'assistant' });
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      await sendMessage(`Tipo de arquivo não suportado: ${file.type}. Tipos permitidos: ${ALLOWED_TYPES.join(", ")}`, { role: 'assistant' });
      return;
    }

    if (file.size === 0) {
      await sendMessage("O arquivo está vazio", { role: 'assistant' });
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      await sendMessage("O arquivo excede o limite de 10MB", { role: 'assistant' });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simular progresso do upload
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('📤 Iniciando upload do arquivo:', {
        name: file.name,
        type: file.type,
        size: file.size,
        scope
      });

      const client = createRagieClient(process.env.NEXT_PUBLIC_RAGIE_API_KEY || '');
      const response = await client.uploadDocument(file, { scope });
      
      clearInterval(interval);
      setUploadProgress(100);

      console.log('✅ Upload concluído:', response);
      await sendMessage(`Upload concluído com sucesso! ID do documento: ${response.id}`, { role: 'assistant' });
      
      // Recarregar lista de documentos
      const docsResponse = await processCommand("/docs");
      if (docsResponse) {
        await sendMessage(docsResponse, { role: 'assistant' });
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      await sendMessage(`Erro ao fazer upload do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { role: 'assistant' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isProcessing) return;

    const message = input.trim();
    setInput('');

    try {
      console.log('📨 Enviando mensagem:', message);
      if (message.startsWith('/')) {
        console.log('🔍 Processando comando:', message);
        const response = await processCommand(message);
        if (response) {
          await sendMessage(response, { role: 'assistant' });
        }
      } else {
        await sendMessage(message);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      await sendMessage(`Erro ao processar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { role: 'assistant' });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      console.log('🗑️ Iniciando exclusão do documento:', docId);
      const client = createRagieClient(process.env.NEXT_PUBLIC_RAGIE_API_KEY || '');
      await client.deleteDocument(docId);
      console.log('✅ Documento excluído com sucesso');
      
      await sendMessage(`Documento ${docId} excluído com sucesso!`, { role: 'assistant' });
      setIsDocumentModalOpen(false);
      
      // Recarregar lista de documentos
      const response = await processCommand("/docs");
      if (response) {
        await sendMessage(response, { role: 'assistant' });
      }
    } catch (error) {
      console.error('❌ Erro ao excluir documento:', error);
      await sendMessage(`Erro ao excluir documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { role: 'assistant' });
    }
  };

  const handleUpdateMetadata = async (docId: string, metadata: string) => {
    try {
      console.log('📝 Atualizando metadados:', { docId, metadata });
      const metadataObj = JSON.parse(metadata);
      
      const client = createRagieClient(process.env.NEXT_PUBLIC_RAGIE_API_KEY || '');
      await client.updateMetadata(docId, metadataObj);
      
      console.log('✅ Metadados atualizados com sucesso');
      await sendMessage(`Metadados do documento ${docId} atualizados com sucesso!`, { role: 'assistant' });
      
      // Recarregar detalhes do documento
      const updatedDoc = await client.getDocument(docId);
      setSelectedDocument(updatedDoc);
    } catch (error) {
      console.error('❌ Erro ao atualizar metadados:', error);
      if (error instanceof SyntaxError) {
        await sendMessage("Erro: O formato do JSON é inválido", { role: 'assistant' });
      } else {
        await sendMessage(`Erro ao atualizar metadados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { role: 'assistant' });
      }
    }
  };

  return (
    <>
      <Card className="w-full max-w-[800px] h-[600px] mx-auto">
        <CardHeader className="flex justify-between items-center px-4 py-2 bg-default-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Chat com Documentos</h3>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Limpar conversa">
              <Button
                isIconOnly
                variant="light"
                onPress={clearMessages}
                className="min-w-unit-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Buscar nos documentos">
              <Button
                isIconOnly
                variant="light"
                onPress={() => setInput("/search ")}
                className="min-w-unit-8"
              >
                <Search className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Upload de documento">
              <Button
                isIconOnly
                variant="light"
                onPress={() => setShowUpload(!showUpload)}
                className="min-w-unit-8"
              >
                {showUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </Button>
            </Tooltip>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="p-4 overflow-y-auto">
          {messages.map((msg, index) => {
            const documents = msg.role === 'assistant' ? extractDocuments(msg.content) : null;
            
            return (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "bg-default-100"
                }`}
              >
                {documents 
                  ? msg.content.split('\n').map((line, i) => {
                      const docMatch = line.match(/- (.*?) \((.*?)\)/);
                      if (docMatch) {
                        return (
                          <div key={i} className="flex items-center gap-2 my-1">
                            <span>{line}</span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="min-w-unit-6 h-unit-6"
                              onPress={() => handleDocumentClick(docMatch[2])}
                            >
                              <Info className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      }
                      return <div key={i} className="whitespace-pre-wrap">{line}</div>;
                    })
                  : <div className="whitespace-pre-wrap">{msg.content}</div>
                }
              </div>
            );
          })}
          {(isLoading || isProcessing) && (
            <div className="flex justify-center">
              <Spinner size="sm" />
            </div>
          )}
        </CardBody>

        {showUpload && (
          <div className="p-4 bg-default-50">
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                label="Upload de Documento"
                description="Arquivos suportados: PDF, DOCX, TXT, JSON, MD"
                accept={ALLOWED_TYPES.join(',')}
                isDisabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(e);
                }}
              />
              <Input
                label="Escopo"
                placeholder="Digite o escopo do documento"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                size="sm"
                isDisabled={isUploading}
              />
              {isUploading && (
                <Progress
                  size="sm"
                  value={uploadProgress}
                  color="primary"
                  className="max-w-md"
                  showValueLabel={true}
                />
              )}
            </div>
          </div>
        )}

        <CardFooter className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma mensagem ou use / para comandos..."
              minRows={1}
              maxRows={4}
              className="flex-grow"
              disabled={isLoading || isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && !isProcessing && input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <Button
              isIconOnly
              type="submit"
              color="primary"
              isLoading={isLoading || isProcessing}
              className="min-w-unit-12"
            >
              {!isLoading && !isProcessing && <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Modal 
        isOpen={isDocumentModalOpen} 
        onClose={() => setIsDocumentModalOpen(false)}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {selectedDocument?.name || 'Detalhes do Documento'}
                  </h3>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => {
                      if (confirm('Tem certeza que deseja excluir este documento?')) {
                        handleDeleteDocument(selectedDocument.id);
                      }
                    }}
                  >
                    Excluir Documento
                  </Button>
                </div>
                <p className="text-sm text-default-500">
                  ID: {selectedDocument?.id}
                </p>
              </ModalHeader>
              <ModalBody>
                <Tabs aria-label="Detalhes do documento">
                  <Tab key="info" title="Informações">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Status</h4>
                        <p className="text-default-500">{selectedDocument?.status}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Escopo</h4>
                        <p className="text-default-500">{selectedDocument?.metadata?.scope || 'Nenhum'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Criado em</h4>
                        <p className="text-default-500">
                          {selectedDocument?.createdAt && new Date(selectedDocument.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Atualizado em</h4>
                        <p className="text-default-500">
                          {selectedDocument?.updatedAt && new Date(selectedDocument.updatedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </Tab>
                  <Tab key="metadata" title="Metadados">
                    <div className="space-y-4">
                      <Textarea
                        label="Metadados do Documento"
                        placeholder="Digite os metadados em formato JSON"
                        value={JSON.stringify(selectedDocument?.metadata, null, 2)}
                        minRows={5}
                        onChange={(e) => {
                          try {
                            const newMetadata = JSON.parse(e.target.value);
                            handleUpdateMetadata(selectedDocument.id, newMetadata);
                          } catch (error) {
                            toast.error("JSON inválido");
                          }
                        }}
                      />
                      <div className="text-sm text-default-500">
                        Dica: Os metadados devem estar em formato JSON válido
                      </div>
                    </div>
                  </Tab>
                  <Tab key="actions" title="Ações">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <Button
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            setInput(`/search ${selectedDocument?.metadata?.scope || ''} `);
                            onClose();
                          }}
                          startContent={<Search className="w-4 h-4" />}
                        >
                          Buscar neste documento
                        </Button>
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={() => {
                            if (confirm('Tem certeza que deseja excluir este documento?')) {
                              handleDeleteDocument(selectedDocument.id);
                            }
                          }}
                          startContent={<Trash2 className="w-4 h-4" />}
                        >
                          Excluir documento
                        </Button>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
} 