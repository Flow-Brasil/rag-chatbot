import { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

interface AutocompleteProps {
  options: string[];
  selectedKey: string | null;
  onSelect: (value: string | null) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export function Autocomplete({
  options,
  selectedKey,
  onSelect,
  allowCustom = false,
  placeholder = 'Selecione uma opção...'
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedKey || '');
  const [items, setItems] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(selectedKey || '');
  }, [selectedKey]);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    onSelect(currentValue);
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    setValue(inputValue);
    if (allowCustom) {
      const filtered = options.filter(item =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setItems(filtered);
      
      if (inputValue.trim()) {
        onSelect(inputValue);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onValueChange={handleInputChange}
          />
          <CommandEmpty>
            {allowCustom ? 'Digite um valor personalizado' : 'Nenhuma opção encontrada'}
          </CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item}
                value={item}
                onSelect={() => handleSelect(item)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item ? "opacity-100" : "opacity-0"
                  )}
                />
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 