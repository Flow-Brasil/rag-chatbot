"use client";

import { useEffect, useRef, useState } from 'react';
import { StreamingMarkdownRenderer } from '@/lib/markdown/StreamingMarkdownRenderer';

interface Props {
  content: string;
  speed?: number;
}

export function StreamingMarkdown({ content, speed = 50 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<StreamingMarkdownRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      const containerId = 'markdown-container-' + Math.random().toString(36).substring(7);
      containerRef.current.id = containerId;
      rendererRef.current = new StreamingMarkdownRenderer(containerId);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (isReady && rendererRef.current && content) {
      rendererRef.current.streamMarkdown(content, speed);
    }
  }, [content, speed, isReady]);

  return (
    <div 
      ref={containerRef} 
      className="prose prose-invert max-w-none w-full"
    />
  );
} 