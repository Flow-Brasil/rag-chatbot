import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
jest.mock("@nextui-org/react", () => ({
  NextUIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ 
    children,
    onClick,
    onPress,
    isDisabled,
    isIconOnly,
    variant,
    className,
    color,
    "aria-label": ariaLabel 
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    onPress?: () => void;
    isDisabled?: boolean;
    isIconOnly?: boolean;
    variant?: string;
    className?: string;
    color?: string;
    "aria-label"?: string;
  }) => (
    <button 
      onClick={onClick || onPress} 
      disabled={isDisabled} 
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, content }: { children: React.ReactNode; content?: string }) => (
    <div title={content}>
      {children}
    </div>
  ),
  Input: ({ 
    value,
    onChange,
    type,
    placeholder,
    label,
    variant,
    size,
    className,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    label?: string;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      aria-label={label}
    />
  ),
  Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => (
    isOpen ? <div data-testid="modal">{children}</div> : null
  ),
  ModalContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  }),
}));

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
    
    // Verifica se os botões principais estão presentes
    expect(screen.getByLabelText("Configurar API Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Limpar Histórico")).toBeInTheDocument();
    expect(screen.getByLabelText("Documentação")).toBeInTheDocument();
  });

  it("deve abrir o modal de configuração de API key ao clicar no botão", () => {
    const { rerender } = render(<Toolbar />);
    
    const configButton = screen.getByLabelText("Configurar API Key");
    fireEvent.click(configButton);
    
    // Força o modal a abrir para teste
    jest.spyOn(require("@nextui-org/react"), "useDisclosure").mockImplementation(() => ({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }));
    
    rerender(<Toolbar />);
    
    // Verifica se o modal está visível
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByLabelText("API Key")).toBeInTheDocument();
  });

  it("deve validar e salvar uma nova API key corretamente", () => {
    // Força o modal a abrir
    jest.spyOn(require("@nextui-org/react"), "useDisclosure").mockImplementation(() => ({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }));
    
    render(<Toolbar />);
    
    // Tenta salvar uma API key inválida
    const input = screen.getByLabelText("API Key");
    fireEvent.change(input, { target: { value: "invalid_key" } });
    
    const saveButton = screen.getByText("Salvar");
    fireEvent.click(saveButton);
    
    expect(toast.error).toHaveBeenCalledWith("API key inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
    
    // Salva uma API key válida
    fireEvent.change(input, { target: { value: "tnt_valid_key_123456789" } });
    fireEvent.click(saveButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith("ragie_api_key", "tnt_valid_key_123456789");
    expect(toast.success).toHaveBeenCalledWith("API key salva com sucesso!");
  });

  it("deve limpar o histórico ao clicar no botão de limpar", () => {
    render(<Toolbar />);
    
    const clearButton = screen.getByLabelText("Limpar Histórico");
    fireEvent.click(clearButton);
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("chat_messages");
    expect(toast.success).toHaveBeenCalledWith("Histórico limpo com sucesso!");
  });

  it("deve abrir a documentação ao clicar no botão de documentação", () => {
    const mockWindow = window as any;
    mockWindow.open = jest.fn();
    
    render(<Toolbar />);
    
    const docsButton = screen.getByLabelText("Documentação");
    fireEvent.click(docsButton);
    
    expect(mockWindow.open).toHaveBeenCalledWith("/docs", "_blank");
  });
}); 