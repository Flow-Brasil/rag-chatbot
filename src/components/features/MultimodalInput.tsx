"use client";

import { useState, useRef, useCallback, FormEvent } from 'react';
import { Button, Textarea, Card } from '@nextui-org/react';
import { Image as ImageIcon, Mic, Video, X, Send, Loader2 } from 'lucide-react';
import { MediaFile, MediaType, ACCEPTED_MEDIA_TYPES, MAX_FILE_SIZES } from '@/lib/types/media';

interface MultimodalInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export function MultimodalInput({ input, setInput, handleSubmit, isLoading }: MultimodalInputProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = useCallback(async (type: MediaType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = ACCEPTED_MEDIA_TYPES[type].join(',');
      fileInputRef.current.click();
    }
  }, []);

  const validateFile = (file: File, type: MediaType): string | null => {
    if (!ACCEPTED_MEDIA_TYPES[type].includes(file.type)) {
      return `Tipo de arquivo não suportado. Aceitos: ${ACCEPTED_MEDIA_TYPES[type].join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZES[type]) {
      return `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZES[type] / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    const fileType = file.type.split('/')[0] as MediaType;
    const validationError = validateFile(file, fileType);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      let thumbnail: string | undefined;

      if (fileType === 'video') {
        const video = document.createElement('video');
        video.src = url;
        await new Promise((resolve) => {
          video.addEventListener('loadeddata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            thumbnail = canvas.toDataURL('image/jpeg');
            resolve(null);
          });
        });
      }

      const newFile: MediaFile = {
        id: Date.now().toString(),
        type: fileType,
        file,
        url,
        thumbnail
      };

      setMediaFiles(prev => [...prev, newFile]);
      setError(null);
    } catch (err) {
      setError('Erro ao processar arquivo');
      console.error(err);
    }
  };

  const removeFile = (id: string) => {
    setMediaFiles(prev => {
      const files = prev.filter(f => f.id !== id);
      files.forEach(f => URL.revokeObjectURL(f.url));
      return files;
    });
  };

  const renderPreview = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return (
          <img 
            src={file.url} 
            alt="Preview" 
            className="max-w-[200px] max-h-[200px] object-contain rounded-lg"
          />
        );
      case 'audio':
        return (
          <audio controls className="max-w-[200px]">
            <source src={file.url} type={file.file.type} />
          </audio>
        );
      case 'video':
        return (
          <video 
            controls 
            className="max-w-[200px] max-h-[200px] object-contain rounded-lg"
            poster={file.thumbnail}
          >
            <source src={file.url} type={file.file.type} />
          </video>
        );
      default:
        return null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || mediaFiles.length > 0)) {
        const fakeEvent = { preventDefault: () => {} } as FormEvent;
        handleSubmit(fakeEvent);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {mediaFiles.map(file => (
            <Card key={file.id} className="relative">
              {renderPreview(file)}
              <Button
                isIconOnly
                size="sm"
                color="danger"
                className="absolute top-1 right-1"
                onClick={() => removeFile(file.id)}
              >
                <X size={16} />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para quebrar linha)"
          minRows={1}
          maxRows={5}
          className="flex-1"
        />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="light"
              onClick={() => handleFileSelect('image')}
            >
              <ImageIcon size={20} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              onClick={() => handleFileSelect('audio')}
            >
              <Mic size={20} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              onClick={() => handleFileSelect('video')}
            >
              <Video size={20} />
            </Button>
          </div>

          <Button
            color="primary"
            type="submit"
            isDisabled={isLoading || (!input.trim() && mediaFiles.length === 0)}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={20} />
                <span>Enviar</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 