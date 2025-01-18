'use client';

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Plus, X, Trash2 } from "lucide-react";

interface Tool {
  name: string;
  files: string[];
  isExpanded: boolean;
  searchTerm?: string;
}

interface ToolListProps {
  tools: Tool[];
  availableFiles: string[];
  onToggleExpand: (index: number) => void;
  onAddFile: (fileName: string, toolIndex: number) => void;
  onRemoveFile: (fileName: string, toolIndex: number) => void;
  onSelectAll: (toolIndex: number) => void;
  onRemoveAll: (toolIndex: number) => void;
  onUpdateSearch: (toolIndex: number, term: string) => void;
  onRemoveFileCompletely: (fileName: string) => void;
}

export function ToolList({
  tools,
  availableFiles,
  onToggleExpand,
  onAddFile,
  onRemoveFile,
  onSelectAll,
  onRemoveAll,
  onUpdateSearch,
  onRemoveFileCompletely
}: ToolListProps) {
  return (
    <div className="space-y-4">
      {tools
        .filter(tool => tool.name && tool.name.trim() !== "")
        .map((tool, toolIndex) => (
          <div key={toolIndex} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpand(toolIndex)}
                >
                  {tool.isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                <h3 className="text-lg font-semibold">{tool.name}</h3>
                <span className="text-sm text-gray-500">
                  ({tool.files.length} arquivos)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAll(toolIndex)}
                  className="text-green-600 hover:text-green-700"
                  disabled={availableFiles.length === 0}
                >
                  Marcar Todos
                </Button>
                {tool.files.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveAll(toolIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover Todos
                  </Button>
                )}
              </div>
            </div>

            {tool.isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Barra de busca para arquivos */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar arquivos..."
                    value={tool.searchTerm || ''}
                    onChange={(e) => onUpdateSearch(toolIndex, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Arquivos Associados */}
                {tool.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Arquivos associados
                    </h4>
                    <div className="space-y-2">
                      {tool.files.map((fileName) => (
                        <div
                          key={fileName}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded group"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{fileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveFile(fileName, toolIndex)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                              title="Desassociar desta ferramenta"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja remover este arquivo completamente do upload?')) {
                                  onRemoveFileCompletely(fileName);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Remover completamente do upload"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arquivos Disponíveis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Arquivos disponíveis
                  </h4>
                  <div className="space-y-2">
                    {availableFiles
                      .filter(
                        (fileName) =>
                          !tool.searchTerm ||
                          fileName.toLowerCase().includes(tool.searchTerm.toLowerCase())
                      )
                      .map((fileName) => (
                        <div
                          key={fileName}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => onAddFile(fileName, toolIndex)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{fileName}</span>
                          </div>
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
} 