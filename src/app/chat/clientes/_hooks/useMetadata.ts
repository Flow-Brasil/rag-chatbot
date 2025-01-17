'use client';

import { useState } from 'react';

interface UseMetadataReturn {
  selectedMetadata: Record<string, string>;
  handleMetadataSelect: (key: string, value: string) => void;
  handleContinueUpload: () => void;
  handleSkipMetadata: () => void;
  resetMetadata: () => void;
}

export function useMetadata(
  onMetadataComplete: (metadata: Record<string, string>) => void
): UseMetadataReturn {
  const [selectedMetadata, setSelectedMetadata] = useState<Record<string, string>>({});

  const handleMetadataSelect = (key: string, value: string) => {
    setSelectedMetadata(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContinueUpload = () => {
    onMetadataComplete(selectedMetadata);
  };

  const handleSkipMetadata = () => {
    onMetadataComplete({});
  };

  const resetMetadata = () => {
    setSelectedMetadata({});
  };

  return {
    selectedMetadata,
    handleMetadataSelect,
    handleContinueUpload,
    handleSkipMetadata,
    resetMetadata
  };
} 