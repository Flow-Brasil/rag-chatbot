"use client";

import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, History, Star, X } from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, string>;
  usage?: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

interface AdvancedSearchSelectorProps {
  items: SearchItem[];
  selectedItem: SearchItem | null;
  onSelect: (item: SearchItem | null) => void;
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string[]>) => void;
  isLoading?: boolean;
  placeholder?: string;
  showHistory?: boolean;
  showFavorites?: boolean;
}

export function AdvancedSearchSelector({
  items,
  selectedItem,
  onSelect,
  onSearch,
  onFilter,
  isLoading = false,
  placeholder = "Buscar...",
  showHistory = true,
  showFavorites = true
}: AdvancedSearchSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<SearchItem[]>([]);

  // Carregar buscas recentes do sessionStorage
  useEffect(() => {
    const savedSearches = sessionStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("searchFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Salvar busca recente
  const saveRecentSearch = (query: string) => {
    const updatedSearches = [
      query,
      ...recentSearches.filter(s => s !== query).slice(0, 4)
    ];
    setRecentSearches(updatedSearches);
    sessionStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Alternar favorito
  const toggleFavorite = (item: SearchItem) => {
    const isFavorite = favorites.some(f => f.id === item.id);
    const updatedFavorites = isFavorite
      ? favorites.filter(f => f.id !== item.id)
      : [...favorites, item];
    
    setFavorites(updatedFavorites);
    localStorage.setItem("searchFavorites", JSON.stringify(updatedFavorites));
  };

  // Extrair metadados únicos para filtros
  const getUniqueMetadata = () => {
    const metadata: Record<string, Set<string>> = {};
    items.forEach(item => {
      Object.entries(item.metadata).forEach(([key, value]) => {
        if (!metadata[key]) metadata[key] = new Set();
        metadata[key].add(value);
      });
    });
    return metadata;
  };

  const handleSearch = (value: string) => {
    setInputValue(value);
    onSearch(value);
    if (value) saveRecentSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const updatedFilters = { ...filters };
    if (!updatedFilters[key]) updatedFilters[key] = [];
    
    const index = updatedFilters[key].indexOf(value);
    if (index === -1) {
      updatedFilters[key].push(value);
    } else {
      updatedFilters[key].splice(index, 1);
      if (updatedFilters[key].length === 0) delete updatedFilters[key];
    }
    
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Autocomplete
            allowsCustomValue
            placeholder={placeholder}
            defaultItems={items}
            value={inputValue}
            onInputChange={handleSearch}
            className="w-full"
            isLoading={isLoading}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            listboxProps={{
              className: "max-h-[300px]"
            }}
          >
            {(item) => (
              <AutocompleteItem key={item.id} textValue={item.name}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {Object.entries(item.metadata)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" • ")}
                    </div>
                  </div>
                  {showFavorites && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.some(f => f.id === item.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  )}
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Área de Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Filtros</h3>
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    onFilter({});
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(getUniqueMetadata()).map(([key, values]) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">{key}</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map(value => (
                      <Button
                        key={value}
                        variant={filters[key]?.includes(value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange(key, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Buscas Recentes */}
      {showHistory && recentSearches.length > 0 && !inputValue && (
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <History className="w-4 h-4" />
            <span>Buscas Recentes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleSearch(search)}
              >
                {search}
                <X
                  className="w-3 h-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter((_, i) => i !== index);
                    setRecentSearches(updated);
                    sessionStorage.setItem("recentSearches", JSON.stringify(updated));
                  }}
                />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Favoritos */}
      {showFavorites && favorites.length > 0 && !inputValue && (
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>Favoritos</span>
          </div>
          <div className="space-y-2">
            {favorites.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {Object.entries(item.metadata)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(" • ")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 