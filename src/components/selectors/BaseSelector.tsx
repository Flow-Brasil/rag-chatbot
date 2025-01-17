'use client';

import * as React from "react";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BaseItem, BaseSelectorProps } from "./types";
import type { Key } from "react";

export function BaseSelector<T extends BaseItem>({
  items,
  selectedItem,
  inputValue,
  onSelect,
  onInputChange,
  onCreate,
  isLoading = false,
  placeholder = "Selecione um item...",
  emptyMessage = "Nenhum item encontrado",
  renderItem
}: BaseSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue && onCreate && !items.find(item => item.name.toLowerCase() === inputValue.toLowerCase())) {
      e.preventDefault();
      onCreate(inputValue);
    }
  };

  const handleSelectionChange = (value: string) => {
    const selected = items.find(item => item.id === value);
    if (selected) {
      onSelect(selected);
      setOpen(false);
    }
  };

  const handleInputChange = (value: string) => {
    onInputChange(value);
    if (selectedItem && selectedItem.name.toLowerCase() !== value.toLowerCase()) {
      onSelect(null);
    }
  };

  const canCreate = onCreate && inputValue && !items.find(item => item.name.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              {selectedItem ? selectedItem.name : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={inputValue}
                onValueChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="h-9"
              />
              <CommandEmpty className="py-6 text-center text-sm">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={handleSelectionChange}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderItem ? renderItem(item) : item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {canCreate && (
          <Button
            onClick={() => onCreate(inputValue)}
            className="shrink-0"
            aria-label={`Criar novo item: ${inputValue}`}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Criar
          </Button>
        )}
      </div>
    </div>
  );
} 