import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MultimodalInput } from "../../../components/custom/multimodal-input";
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
    isDisabled,
    isIconOnly,
    variant,
    className,
    "aria-label": ariaLabel 
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
    isIconOnly?: boolean;
    variant?: string;
    className?: string;
    "aria-label"?: string;
  }) => (
    <button onClick={onClick} disabled={isDisabled} aria-label={ariaLabel}>
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
    placeholder 
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
    />
  ),
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const defaultProps = {
  input: "",
  setInput: jest.fn(),
  handleSubmit: jest.fn(),
  isLoading: false,
};

describe("MultimodalInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve iniciar com o botão de restaurar desabilitado quando não há mensagens, API key personalizada ou modelo diferente", () => {
    render(<MultimodalInput {...defaultProps} />);
    
    const restoreButton = screen.getByLabelText("Restaurar configurações");
    expect(restoreButton).toBeDisabled();
  });

  it("deve habilitar o botão de restaurar quando há mensagens", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([{ role: "user", content: "test" }]));
    
    render(<MultimodalInput {...defaultProps} />);
    
    const restoreButton = screen.getByLabelText("Restaurar configurações");
    expect(restoreButton).not.toBeDisabled();
  });

  it("deve habilitar o botão de restaurar quando há uma API key personalizada", () => {
    localStorageMock.getItem.mockReturnValue("tnt_custom_key_123");
    
    render(<MultimodalInput {...defaultProps} />);
    
    const restoreButton = screen.getByLabelText("Restaurar configurações");
    expect(restoreButton).not.toBeDisabled();
  });

  it("deve restaurar todas as configurações ao clicar no botão", () => {
    render(<MultimodalInput {...defaultProps} />);
    
    const restoreButton = screen.getByLabelText("Restaurar configurações");
    fireEvent.click(restoreButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("chat_messages");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ragie_api_key",
      "tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA"
    );
    expect(toast.success).toHaveBeenCalledWith("Configurações restauradas para os valores padrão");
  });

  it("deve alternar a visibilidade do input da API key ao clicar no botão de configuração", () => {
    render(<MultimodalInput {...defaultProps} />);
    
    const configButton = screen.getByLabelText("Configurar API key personalizada");
    fireEvent.click(configButton);
    
    const input = screen.getByPlaceholderText("Cole sua API key aqui para sobrescrever a padrão");
    expect(input).toBeInTheDocument();
    
    fireEvent.click(configButton);
    expect(screen.queryByPlaceholderText("Cole sua API key aqui para sobrescrever a padrão")).not.toBeInTheDocument();
  });

  it("deve validar e salvar uma nova API key corretamente", () => {
    render(<MultimodalInput {...defaultProps} />);
    
    // Abre o input da API key
    const configButton = screen.getByLabelText("Configurar API key personalizada");
    fireEvent.click(configButton);
    
    // Tenta salvar uma API key inválida
    const input = screen.getByPlaceholderText("Cole sua API key aqui para sobrescrever a padrão");
    fireEvent.change(input, { target: { value: "invalid_key" } });
    fireEvent.blur(input);
    
    expect(toast.error).toHaveBeenCalledWith("API key inválida. Deve começar com 'tnt_' e ter pelo menos 20 caracteres.");
    
    // Salva uma API key válida
    fireEvent.change(input, { target: { value: "tnt_valid_key_123456789" } });
    fireEvent.blur(input);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith("ragie_api_key", "tnt_valid_key_123456789");
    expect(toast.success).toHaveBeenCalledWith("API key salva com sucesso!");
  });
}); 