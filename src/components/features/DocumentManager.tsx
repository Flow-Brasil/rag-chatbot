"use client";

import { useState, useRef, useEffect } from 'react';
import { useRagieDocuments } from '@/hooks/useRagieDocuments';
import { RagieDocument } from '@/lib/types/ragie';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner
} from '@nextui-org/react';
import { Upload, Trash2, Edit2, RefreshCw } from 'lucide-react';

interface DocumentManagerProps {
  apiKey: string;
  onSelectDocument?: (document: RagieDocument) => void;
  initialMode?: "list" | "upload" | "search";
}

export function DocumentManager({ apiKey, onSelectDocument, initialMode = "list" }: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawContent, setRawContent] = useState('');
  const [scope, setScope] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "upload" | "search">(initialMode);

  const {
    documents,
    isLoading,
    error,
    uploadDocument,
    uploadRawContent,
    deleteDocument,
    updateMetadata,
    checkStatus
  } = useRagieDocuments(apiKey);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadDocument(file, { scope });
      event.target.value = '';
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
    }
  };

  const handleRawUpload = async () => {
    if (!rawContent.trim()) return;

    try {
      await uploadRawContent(rawContent, { scope });
      setRawContent('');
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  const handleUpdateScope = async (id: string, newScope: string) => {
    try {
      await updateMetadata(id, { scope: newScope });
      setEditingId(null);
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  };

  const handleRefreshStatus = async (id: string) => {
    try {
      await checkStatus(id);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Escopo (opcional)"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="flex-1"
          />
          <Button
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            isIconOnly
          >
            <Upload className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Conteúdo raw"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="flex-1"
          />
          <Button
            color="primary"
            onClick={handleRawUpload}
            isDisabled={!rawContent.trim()}
          >
            Enviar
          </Button>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-4">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => onSelectDocument?.(doc)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{doc.id}</div>
                <div className="text-sm text-gray-500">Status: {doc.status}</div>
                {editingId === doc.id ? (
                  <Input
                    type="text"
                    defaultValue={doc.metadata.scope as string}
                    onBlur={(e) => handleUpdateScope(doc.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateScope(doc.id, e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    Escopo: {doc.metadata.scope || 'Nenhum'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(editingId === doc.id ? null : doc.id);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshStatus(doc.id);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </CardBody>
    </Card>
  );
} 