"use client";

import { Message as MessageType } from '@/lib/types/llm';
import { Card } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const renderMedia = (content: string) => {
    const mediaRegex = /\[(IMAGE|AUDIO|VIDEO)\]data:[^;]+;base64,[^\n]+/g;
    const mediaMatches = content.match(mediaRegex) || [];
    
    return mediaMatches.map((match, index) => {
      const type = match.match(/\[(IMAGE|AUDIO|VIDEO)\]/)![1].toLowerCase();
      const base64Data = match.replace(/\[(IMAGE|AUDIO|VIDEO)\]/, '');
      
      switch (type) {
        case 'image':
          return (
            <img
              key={index}
              src={base64Data}
              alt="Imagem enviada"
              className="max-w-[300px] max-h-[300px] object-contain rounded-lg my-2"
            />
          );
        case 'audio':
          return (
            <audio
              key={index}
              controls
              className="max-w-[300px] my-2"
            >
              <source src={base64Data} />
            </audio>
          );
        case 'video':
          return (
            <video
              key={index}
              controls
              className="max-w-[300px] max-h-[300px] object-contain rounded-lg my-2"
            >
              <source src={base64Data} />
            </video>
          );
        default:
          return null;
      }
    });
  };

  const renderContent = () => {
    const mediaRegex = /\[(IMAGE|AUDIO|VIDEO)\]data:[^;]+;base64,[^\n]+/g;
    const textContent = message.content.replace(mediaRegex, '').trim();
    const mediaElements = renderMedia(message.content);

    return (
      <>
        {textContent && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            {textContent}
          </ReactMarkdown>
        )}
        {mediaElements.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {mediaElements}
          </div>
        )}
      </>
    );
  };

  return (
    <Card
      className={`p-4 ${
        message.role === 'user' ? 'bg-primary-50' : 'bg-default-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </Card>
  );
} 