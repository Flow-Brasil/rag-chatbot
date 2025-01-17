"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, Star, Grid2X2, List, SortAsc, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchResult {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, string>;
  usage?: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

interface SearchResultsDisplayProps {
  results: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  onFavoriteToggle: (result: SearchResult) => void;
  isLoading?: boolean;
}

type ViewMode = "grid" | "list";
type SortField = "name" | "type" | "usage" | "lastUsed";
type SortOrder = "asc" | "desc";

export function SearchResultsDisplay({
  results,
  onResultSelect,
  onFavoriteToggle,
  isLoading = false
}: SearchResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Ordenar resultados
  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "usage":
        comparison = (a.usage || 0) - (b.usage || 0);
        break;
      case "lastUsed":
        comparison = new Date(a.lastUsed || 0).getTime() - new Date(b.lastUsed || 0).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={sortField}
            onValueChange={(value: SortField) => setSortField(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
              <SelectItem value="usage">Uso</SelectItem>
              <SelectItem value="lastUsed">Último Uso</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="text-center py-8">Carregando resultados...</div>
      ) : sortedResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum resultado encontrado
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
          {sortedResults.map(result => (
            <Card
              key={result.id}
              className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === "list" ? "flex items-center justify-between" : ""
              }`}
              onClick={() => onResultSelect(result)}
            >
              <div className={viewMode === "list" ? "flex items-center gap-4 flex-1" : "space-y-2"}>
                <div className={`flex items-center gap-2 ${viewMode === "grid" ? "mb-2" : ""}`}>
                  <FileIcon className="w-5 h-5 text-blue-500" />
                  <div className="font-medium truncate">{result.name}</div>
                </div>

                {viewMode === "grid" && (
                  <>
                    <div className="text-sm text-gray-500">
                      Tipo: {result.type}
                    </div>
                    {result.usage !== undefined && (
                      <div className="text-sm text-gray-500">
                        Uso: {result.usage}x
                      </div>
                    )}
                    {result.lastUsed && (
                      <div className="text-sm text-gray-500">
                        Último uso: {formatDate(result.lastUsed)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {Object.entries(result.metadata)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" • ")}
                    </div>
                  </>
                )}

                {viewMode === "list" && (
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{result.type}</span>
                    {result.usage !== undefined && (
                      <span>{result.usage}x</span>
                    )}
                    {result.lastUsed && (
                      <span>{formatDate(result.lastUsed)}</span>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === "grid" ? "absolute top-2 right-2" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(result);
                }}
              >
                <Star
                  className={`w-4 h-4 ${
                    result.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }`}
                />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 