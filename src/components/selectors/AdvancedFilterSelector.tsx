"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

interface FilterGroup {
  id: string;
  rules: FilterRule[];
  operator: "AND" | "OR";
}

interface AdvancedFilterSelectorProps {
  fields: Array<{
    name: string;
    type: "text" | "number" | "date" | "select";
    options?: string[];
  }>;
  onFilterChange: (filters: FilterGroup[]) => void;
  defaultFilters?: FilterGroup[];
  isLoading?: boolean;
}

const OPERATORS = {
  text: [
    { value: "contains", label: "Contém" },
    { value: "not_contains", label: "Não Contém" },
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Diferente de" },
    { value: "starts_with", label: "Começa com" },
    { value: "ends_with", label: "Termina com" }
  ],
  number: [
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Diferente de" },
    { value: "greater_than", label: "Maior que" },
    { value: "less_than", label: "Menor que" },
    { value: "between", label: "Entre" }
  ],
  date: [
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Diferente de" },
    { value: "after", label: "Após" },
    { value: "before", label: "Antes" },
    { value: "between", label: "Entre" }
  ],
  select: [
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Diferente de" }
  ]
};

export function AdvancedFilterSelector({
  fields,
  onFilterChange,
  defaultFilters = [],
  isLoading = false
}: AdvancedFilterSelectorProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFilterChange(filterGroups);
  }, [filterGroups, onFilterChange]);

  const addFilterGroup = () => {
    setFilterGroups(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        rules: [{ field: "", operator: "", value: "" }],
        operator: "AND"
      }
    ]);
  };

  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const addRule = (groupId: string) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: [...group.rules, { field: "", operator: "", value: "" }]
        };
      }
      return group;
    }));
  };

  const removeRule = (groupId: string, ruleIndex: number) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newRules = [...group.rules];
        newRules.splice(ruleIndex, 1);
        return {
          ...group,
          rules: newRules
        };
      }
      return group;
    }));
  };

  const updateRule = (groupId: string, ruleIndex: number, updates: Partial<FilterRule>) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newRules = [...group.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], ...updates };
        return {
          ...group,
          rules: newRules
        };
      }
      return group;
    }));
  };

  const updateGroupOperator = (groupId: string, operator: "AND" | "OR") => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          operator
        };
      }
      return group;
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        {filterGroups.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterGroups([])}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            {filterGroups.map((group, groupIndex) => (
              <div key={group.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Label>Combinar com:</Label>
                    <Select
                      value={group.operator}
                      onValueChange={(value: "AND" | "OR") => updateGroupOperator(group.id, value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">E (AND)</SelectItem>
                        <SelectItem value="OR">OU (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilterGroup(group.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {group.rules.map((rule, ruleIndex) => {
                  const field = fields.find(f => f.name === rule.field);
                  const operators = field ? OPERATORS[field.type] : [];

                  return (
                    <div key={ruleIndex} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Select
                          value={rule.field}
                          onValueChange={(value) => updateRule(group.id, ruleIndex, { field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map(field => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={rule.operator}
                          onValueChange={(value) => updateRule(group.id, ruleIndex, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operador" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {field?.type === "select" ? (
                          <Select
                            value={rule.value}
                            onValueChange={(value) => updateRule(group.id, ruleIndex, { value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Valor" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field?.type || "text"}
                            value={rule.value}
                            onChange={(e) => updateRule(group.id, ruleIndex, { value: e.target.value })}
                            placeholder="Valor"
                          />
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(group.id, ruleIndex)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRule(group.id)}
                  className="mt-2"
                >
                  Adicionar Regra
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addFilterGroup}
              className="w-full"
            >
              Adicionar Grupo de Filtros
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 