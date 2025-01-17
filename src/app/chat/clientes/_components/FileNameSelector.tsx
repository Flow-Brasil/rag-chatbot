'use client';

import { useState } from "react";
import { FileNameSelector as BaseFileNameSelector } from "@/components/selectors/FileNameSelector";
import type { FileNameSelectorProps as BaseFileNameSelectorProps } from "@/components/selectors/types";

type FileNameSelectorProps = Pick<BaseFileNameSelectorProps, 'suggestedName' | 'onConfirm'> & {
  onNameSelect: (name: string) => void;
};

export function FileNameSelector({
  suggestedName,
  onNameSelect,
  onConfirm
}: FileNameSelectorProps) {
  const [fileName, setFileName] = useState(suggestedName);

  const handleNameChange = (value: string) => {
    setFileName(value);
    onNameSelect(value);
  };

  return (
    <BaseFileNameSelector
      suggestedName={suggestedName}
      value={fileName}
      onChange={handleNameChange}
      onConfirm={onConfirm}
    />
  );
} 