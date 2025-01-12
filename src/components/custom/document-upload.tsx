"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { FileIcon } from "./icons";

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
  'text/markdown',
  'text/x-markdown',
  'application/x-markdown'
];

interface Props {
  onStatusUpdate?: (message: string) => void;
}

const convertToMarkdown = (file: File): File => {
  if (file.name.endsWith('.md') && !ALLOWED_TYPES.includes(file.type)) {
    console.log('🔄 Convertendo tipo do arquivo Markdown:', {
      tipoOriginal: file.type,
      novotipo: 'text/markdown'
    });
    return new File([file], file.name, { type: 'text/markdown' });
  }
  return file;
};

export function DocumentUpload({ onStatusUpdate }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleFileSelect = (file: File) => {
    const convertedFile = convertToMarkdown(file);
    console.log('📄 Arquivo selecionado:', {
      nome: convertedFile.name,
      tipo: convertedFile.type,
      tamanho: `${(convertedFile.size / 1024).toFixed(2)} KB`
    });
    setSelectedFile(convertedFile);
    const nameWithoutExtension = convertedFile.name.replace(/\.[^/.]+$/, "");
    setFileName(nameWithoutExtension);
  };

  const checkDocumentStatus = async (documentId: string) => {
    setIsChecking(true);
    try {
      const response = await fetch(`https://api.ragie.ai/documents/${documentId}`, {
        headers: {
          "Authorization": `Bearer tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const doc = await response.json();
      console.log('📋 Status do documento:', doc);
      
      const statusMessage = `ℹ️ **Status atualizado do documento**\n- Nome: ${doc.name}\n- ID: ${doc.id}\n- Status: ${doc.status}${doc.chunk_count ? `\n- Chunks: ${doc.chunk_count}` : ''}`;
      onStatusUpdate?.(statusMessage);
      
      // Se ainda estiver processando, verifica novamente em 2 segundos
      if (doc.status === "partitioning") {
        setTimeout(() => checkDocumentStatus(documentId), 2000);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      onStatusUpdate?.(`❌ Erro ao verificar status do documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const isMarkdown = selectedFile.name.endsWith('.md') || ALLOWED_TYPES.includes(selectedFile.type);
    if (!isMarkdown && !ALLOWED_TYPES.includes(selectedFile.type)) {
      console.error('❌ Tipo de arquivo não suportado:', selectedFile.type);
      toast.error("Tipo de arquivo não suportado. Use PDF, DOCX, TXT, JSON ou MD.");
      return;
    }

    console.log('🚀 Iniciando upload:', {
      arquivo: selectedFile.name,
      escopo: fileName,
      tipo: selectedFile.type || 'text/markdown'
    });

    setIsUploading(true);
    onStatusUpdate?.(`📤 **Upload iniciado**\n- Arquivo: ${selectedFile.name}\n- Tamanho: ${(selectedFile.size / 1024).toFixed(2)} KB\n- Tipo: ${selectedFile.type || 'text/markdown'}`);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("metadata", JSON.stringify({ scope: fileName }));
      formData.append("mode", "fast");

      console.log('📡 Enviando requisição para API:', {
        url: 'https://api.ragie.ai/documents',
        metadata: { scope: fileName },
        mode: 'fast'
      });

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
      console.log('✅ Upload concluído:', data);
      
      const successMessage = `✅ **Upload concluído com sucesso!**\n- Arquivo: ${selectedFile.name}\n- ID: ${data.id}\n- Status: ${data.status}\n\nO documento está sendo processado e em breve estará disponível para consulta.`;
      
      toast.success("Documento enviado com sucesso!");
      onStatusUpdate?.(successMessage);

      // Aguarda 2 segundos e verifica o status real
      setTimeout(() => checkDocumentStatus(data.id), 2000);

      setFileName("");
      setSelectedFile(null);
      return data;
    } catch (error) {
      console.error('❌ Erro no upload:', {
        arquivo: selectedFile.name,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        detalhes: error
      });
      
      const errorMessage = `❌ **Erro no upload**\n- Arquivo: ${selectedFile.name}\n- Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      onStatusUpdate?.(errorMessage);
      toast.error("Erro ao enviar documento. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Enviar documento"
        >
          <FileIcon />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>
        <div id="dialog-description" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do arquivo</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nome do arquivo"
            />
          </div>
          <div className="border-2 border-dashed rounded-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium mb-2">Tipos de Arquivo Suportados</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">JSON</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">PDF</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">DOCX</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">TXT</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">MD</span>
              </div>
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.json,.md"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center text-blue-500 hover:text-blue-600"
            >
              {isUploading ? (
                "Enviando..."
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
                      <div className="p-4 bg-blue-50 rounded-full mb-2">
                        <FileIcon size={24} />
                      </div>
                      <p>Clique para selecionar ou arraste um arquivo</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Arquivos JSON terão prioridade na indexação
                      </p>
                    </>
                  )}
                </>
              )}
            </label>
          </div>
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !fileName.trim()}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Enviando..." : "Enviar"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 