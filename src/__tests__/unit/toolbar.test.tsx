import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Toolbar } from "../../components/features/Toolbar";
import { toast } from "sonner";

// Mock do módulo sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do módulo NextUI
jest.mock("@nextui-org/react", () => {
  const React = require("react");
  return {
    NextUIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: ({ 
      children,
      onClick,
      onPress,
      isDisabled,
      "aria-label": ariaLabel,
      color,
      variant,
      isIconOnly
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      onPress?: () => void;
      isDisabled?: boolean;
      "aria-label"?: string;
      color?: string;
      variant?: string;
      isIconOnly?: boolean;
    }) => {
      const handleClick = (e: React.MouseEvent) => {
        if (onClick) onClick();
        if (onPress) onPress();
      };

      return (
        <button 
          onClick={handleClick}
          disabled={isDisabled} 
          aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
          data-color={color}
          data-variant={variant}
          data-icon-only={isIconOnly}
        >
          {children}
        </button>
      );
    },
    Tooltip: ({ children, content }: { children: React.ReactNode; content?: string }) => (
      <div title={content}>
        {children}
      </div>
    ),
    Input: ({ 
      value,
      onChange,
      type,
      label,
      onKeyDown,
      endContent,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      type?: string;
      label?: string;
      endContent?: React.ReactNode;
    }) => (
      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          type={type}
          aria-label={label}
        />
        {endContent}
      </div>
    ),
    Modal: ({ children, isOpen, onClose }: { 
      children: React.ReactNode; 
      isOpen?: boolean;
      onClose?: () => void;
    }) => (
      isOpen ? (
        <div role="dialog" aria-modal="true">
          {children}
        </div>
      ) : null
    ),
    ModalContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useDisclosure: () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return {
        isOpen,
        onOpen: () => setIsOpen(true),
        onClose: () => setIsOpen(false),
      };
    },
  };
});

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Toolbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar corretamente com os botões padrão", () => {
    render(<Toolbar />);
    
    expect(screen.getByLabelText("Configurar API Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Limpar Histórico")).toBeInTheDocument();
    expect(screen.getByLabelText("Documentação")).toBeInTheDocument();
  });

  it("deve validar e salvar uma nova API key corretamente", async () => {
    render(<Toolbar />);
    
    // Abre o modal
    fireEvent.click(screen.getByLabelText("Configurar API Key"));
    
    // Tenta salvar uma API key inválida
    const input = screen.getByLabelText("API Key");
    fireEvent.change(input, { target: { value: "invalid_key" } });
    
    const saveButton = screen.getByText("Salvar");
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    expect(toast.error).toHaveBeenCalledWith("API key inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
    
    // Salva uma API key válida
    fireEvent.change(input, { target: { value: "tnt_valid_key_123456789" } });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith("ragie_api_key", "tnt_valid_key_123456789");
    expect(toast.success).toHaveBeenCalledWith("API key salva com sucesso!");
  });

  it("deve limpar o histórico ao confirmar", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    render(<Toolbar />);
    
    fireEvent.click(screen.getByLabelText("Limpar Histórico"));
    
    expect(confirmSpy).toHaveBeenCalledWith("Tem certeza que deseja limpar todo o histórico?");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("chat_messages");
    expect(toast.success).toHaveBeenCalledWith("Histórico limpo com sucesso!");
    
    confirmSpy.mockRestore();
  });

  it("deve abrir a documentação em nova aba", () => {
    const windowSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<Toolbar />);
    
    fireEvent.click(screen.getByLabelText("Documentação"));
    
    expect(windowSpy).toHaveBeenCalledWith("/docs", "_blank");
    windowSpy.mockRestore();
  });

  it("deve mostrar estado de loading ao salvar", async () => {
    render(<Toolbar />);
    
    // Abre o modal
    fireEvent.click(screen.getByLabelText("Configurar API Key"));
    
    // Insere uma API key válida
    const input = screen.getByLabelText("API Key");
    fireEvent.change(input, { target: { value: "tnt_valid_key_123456789" } });
    
    // Clica no botão salvar e verifica o estado de loading
    const saveButton = screen.getByRole("button", { name: "Salvar" });
    
    // Inicia o processo de salvar
    await act(async () => {
      fireEvent.click(saveButton);
      // Aguarda um tick para o estado ser atualizado
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verifica se o botão está desabilitado e mostra o texto de loading
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("deve salvar ao pressionar Enter", async () => {
    render(<Toolbar />);
    
    // Abre o modal
    fireEvent.click(screen.getByLabelText("Configurar API Key"));
    
    // Insere uma API key válida e pressiona Enter
    const input = screen.getByLabelText("API Key");
    fireEvent.change(input, { target: { value: "tnt_valid_key_123456789" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith("ragie_api_key", "tnt_valid_key_123456789");
    expect(toast.success).toHaveBeenCalledWith("API key salva com sucesso!");
  });

  it("deve alternar visibilidade da senha", () => {
    render(<Toolbar />);
    
    // Abre o modal
    fireEvent.click(screen.getByLabelText("Configurar API Key"));
    
    const input = screen.getByLabelText("API Key");
    expect(input).toHaveAttribute("type", "password");
    
    // Clica no botão de mostrar senha
    fireEvent.click(screen.getByLabelText("Toggle password visibility"));
    expect(input).toHaveAttribute("type", "text");
    
    // Clica novamente para esconder
    fireEvent.click(screen.getByLabelText("Toggle password visibility"));
    expect(input).toHaveAttribute("type", "password");
  });
}); 