'use client';

import { useState } from 'react';

interface Tool {
  name: string;
  files: string[];
  isExpanded: boolean;
  searchTerm?: string;
}

export function useTools(initialTools: Tool[] = []) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  const addTool = (name: string) => {
    if (!name.trim() || tools.some(t => t.name === name.trim())) return;
    
    setTools(prev => [
      ...prev,
      {
        name: name.trim(),
        files: [],
        isExpanded: true
      }
    ]);
  };

  const toggleToolExpansion = (toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => 
      i === toolIndex ? { ...tool, isExpanded: !tool.isExpanded } : tool
    ));
  };

  const addFileToTool = (fileName: string, toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => {
      if (i === toolIndex) {
        return { ...tool, files: [...tool.files, fileName] };
      }
      return tool;
    }));
    setAvailableFiles(prev => prev.filter(f => f !== fileName));
  };

  const removeFileFromTool = (fileName: string, toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => {
      if (i === toolIndex) {
        return { ...tool, files: tool.files.filter(f => f !== fileName) };
      }
      return tool;
    }));
    setAvailableFiles(prev => [...prev, fileName]);
  };

  const selectAllAvailableFiles = (toolIndex: number) => {
    const tool = tools[toolIndex];
    if (!tool) return;

    const filesToAdd = availableFiles.filter(fileName => 
      !tool.searchTerm || fileName.toLowerCase().includes(tool.searchTerm.toLowerCase())
    );

    if (filesToAdd.length === 0) return;

    setTools(prev => prev.map((t, i) => {
      if (i === toolIndex) {
        return { ...t, files: [...t.files, ...filesToAdd] };
      }
      return t;
    }));
    setAvailableFiles(prev => prev.filter(f => !filesToAdd.includes(f)));
  };

  const removeAllFiles = (toolIndex: number) => {
    const tool = tools[toolIndex];
    if (!tool || tool.files.length === 0) return;

    setTools(prev => prev.map((t, i) => {
      if (i === toolIndex) {
        return { ...t, files: [] };
      }
      return t;
    }));
    setAvailableFiles(prev => [...prev, ...tool.files].sort());
  };

  const updateToolSearchTerm = (toolIndex: number, term: string) => {
    setTools(prev => prev.map((tool, i) => 
      i === toolIndex ? { ...tool, searchTerm: term } : tool
    ));
  };

  const setInitialFiles = (files: string[]) => {
    setAvailableFiles(files);
  };

  return {
    tools,
    availableFiles,
    addTool,
    toggleToolExpansion,
    addFileToTool,
    removeFileFromTool,
    selectAllAvailableFiles,
    removeAllFiles,
    updateToolSearchTerm,
    setInitialFiles,
    setTools
  };
} 