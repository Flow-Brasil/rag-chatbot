'use client';

import { useState, useEffect } from "react";
import { MetadataEditor as BaseMetadataEditor } from "@/components/selectors/MetadataEditor";
import type { MetadataEditorProps as BaseMetadataEditorProps } from "@/components/selectors/types";

type MetadataEditorProps = Pick<BaseMetadataEditorProps, 'selectedMetadata' | 'onMetadataSelect' | 'onMetadataRemove'>;

export function MetadataEditor({
  selectedMetadata,
  onMetadataSelect,
  onMetadataRemove
}: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar metadados existentes da API
    async function fetchMetadata() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/metadata");
        if (!response.ok) throw new Error("Erro ao carregar metadados");
        const data = await response.json();
        setMetadata(data.values || {});
      } catch (error) {
        console.error("Erro ao carregar metadados:", error);
        setMetadata({});
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  return (
    <BaseMetadataEditor
      metadata={metadata}
      selectedMetadata={selectedMetadata}
      onMetadataSelect={onMetadataSelect}
      onMetadataRemove={onMetadataRemove}
      isLoading={isLoading}
    />
  );
} 