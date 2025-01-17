"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Plus, Minus, Search, X } from "lucide-react";
import { MetadataSelector } from "@/components/selectors/MetadataSelector";

interface EditData {
  isNew: boolean;
  cliente: string;
  filtro?: {
    id: string;
    nome: string;
    descricao?: string;
    regras: Regra[];
  };
}

interface Cliente {
  name: string;
  documentCount: number;
}

interface Campo {
  name: string;
  documentCount: number;
}

interface Regra {
  campo: string;
  operador: string;
  valor: string;
}

interface ResultadoTeste {
  total: number;
  filtrados: number;
  amostra: any[];
}

const OPERADORES = [
  { value: "contem", label: "Contém", icon: "🔍" },
  { value: "igual", label: "Igual a", icon: "=" },
  { value: "diferente", label: "Diferente de", icon: "≠" },
  { value: "comeca_com", label: "Começa com", icon: "▶" },
  { value: "termina_com", label: "Termina com", icon: "◀" },
  { value: "vazio", label: "Está vazio", icon: "∅" },
  { value: "nao_vazio", label: "Não está vazio", icon: "✓" }
];

const regraInicial: Regra = {
  campo: "",
  operador: "contem",
  valor: ""
};

export default function GerirFiltrosEtapa3Page() {
  const router = useRouter();
  const [editData, setEditData] = useState<EditData | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [regras, setRegras] = useState<Regra[]>([regraInicial]);
  const [loading, setLoading] = useState(false);
  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<ResultadoTeste | null>(null);
  const [camposDisponiveis, setCamposDisponiveis] = useState<string[]>([]);
  const [valoresDisponiveis, setValoresDisponiveis] = useState<Map<string, Set<string>>>(new Map());
  const [valoresCount, setValoresCount] = useState<Map<string, Map<string, number>>>(new Map());

  // Carregar dados para edição
  useEffect(() => {
    const savedData = sessionStorage.getItem('filtroDocEdit');
    if (!savedData) {
      router.push("/gerir_filtros_doc/1");
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setEditData(data);
      if (!data.isNew && data.filtro) {
        setNome(data.filtro.nome);
        setDescricao(data.filtro.descricao || "");
        setRegras(data.filtro.regras);
      }

      // Buscar campos disponíveis
      fetchCamposDisponiveis(data.cliente);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      router.push("/gerir_filtros_doc/1");
    }
  }, [router]);

  // Buscar campos disponíveis nos documentos do cliente
  const fetchCamposDisponiveis = async (cliente: string) => {
    try {
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(cliente)}`);
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();

      // Extrair campos únicos dos metadados e contar documentos
      const camposMap = new Map<string, number>();
      data.documents.forEach((doc: any) => {
        if (doc.metadata) {
          Object.keys(doc.metadata).forEach(key => {
            const count = camposMap.get(key) || 0;
            camposMap.set(key, count + 1);
          });
        }
      });

      // Converter para o formato esperado
      setCamposDisponiveis(Array.from(camposMap.keys()));
    } catch (error) {
      console.error("Erro ao carregar campos:", error);
    }
  };

  // Buscar valores disponíveis para um campo
  const fetchValoresDisponiveis = async (cliente: string) => {
    try {
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(cliente)}`);
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();

      // Extrair valores únicos e contar documentos para cada campo
      const valoresMap = new Map<string, Map<string, number>>();
      data.documents.forEach((doc: any) => {
        if (doc.metadata) {
          Object.entries(doc.metadata).forEach(([key, value]) => {
            if (!valoresMap.has(key)) {
              valoresMap.set(key, new Map<string, number>());
            }
            if (typeof value === 'string') {
              const valoresCount = valoresMap.get(key)!;
              valoresCount.set(value, (valoresCount.get(value) || 0) + 1);
            }
          });
        }
      });

      // Converter para o formato esperado
      const valoresDisponiveis = new Map<string, Set<string>>();
      valoresMap.forEach((valoresCount, campo) => {
        valoresDisponiveis.set(campo, new Set(valoresCount.keys()));
      });

      setValoresDisponiveis(valoresDisponiveis);
      setValoresCount(valoresMap);
    } catch (error) {
      console.error("Erro ao carregar valores:", error);
    }
  };

  // Atualizar valores disponíveis quando o cliente mudar
  useEffect(() => {
    if (editData?.cliente) {
      fetchValoresDisponiveis(editData.cliente);
    }
  }, [editData?.cliente]);

  const adicionarRegra = () => {
    const novaRegra: Regra = {
      campo: "",
      operador: "contem",
      valor: ""
    };
    setRegras([...regras, novaRegra]);
  };

  const removerRegra = (index: number) => {
    setRegras(regras.filter((_, i) => i !== index));
  };

  const atualizarRegra = (index: number, campo: keyof Regra, valor: string) => {
    const novasRegras = [...regras];
    const regraAtual = novasRegras[index] || regraInicial;
    novasRegras[index] = {
      campo: campo === 'campo' ? valor : regraAtual.campo,
      operador: campo === 'operador' ? valor : regraAtual.operador,
      valor: campo === 'valor' ? valor : regraAtual.valor
    };
    setRegras(novasRegras);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    try {
      setLoading(true);

      // Preparar dados para a próxima etapa
      const filtroData = {
        nome,
        descricao,
        cliente: editData.cliente,
        regras,
        id: editData.filtro?.id
      };

      // Armazenar para confirmação
      sessionStorage.setItem('filtroDocConfirm', JSON.stringify(filtroData));
      
      // Redirecionar para etapa 4
      router.push("/gerir_filtros_doc/4" as any);
    } catch (err) {
      console.error("Erro ao processar filtro:", err);
      alert("Erro ao processar o filtro");
    } finally {
      setLoading(false);
    }
  };

  const testarFiltro = async () => {
    if (!editData || !nome || regras.length === 0) return;

    try {
      setTestando(true);
      setResultadoTeste(null);

      // Buscar documentos do cliente para testar
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(editData.cliente)}`);
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();

      // Filtrar apenas documentos do cliente selecionado
      const documentosDoCliente = data.documents.filter(
        (doc: any) => doc.metadata?.cliente === editData.cliente
      );

      // Aplicar filtro nos documentos
      const documentosFiltrados = documentosDoCliente.filter((doc: any) => {
        return regras.every(regra => {
          const valor = doc.metadata?.[regra.campo];
          if (!valor) return false;

          switch (regra.operador) {
            case "contem":
              return valor.toLowerCase().includes(regra.valor.toLowerCase());
            case "igual":
              return valor.toLowerCase() === regra.valor.toLowerCase();
            case "diferente":
              return valor.toLowerCase() !== regra.valor.toLowerCase();
            case "comeca_com":
              return valor.toLowerCase().startsWith(regra.valor.toLowerCase());
            case "termina_com":
              return valor.toLowerCase().endsWith(regra.valor.toLowerCase());
            case "vazio":
              return !valor || valor.trim() === "";
            case "nao_vazio":
              return valor && valor.trim() !== "";
            default:
              return false;
          }
        });
      });

      setResultadoTeste({
        total: documentosDoCliente.length,
        filtrados: documentosFiltrados.length,
        amostra: documentosFiltrados.slice(0, 3)
      });
    } catch (err) {
      console.error("Erro ao testar filtro:", err);
      alert("Erro ao testar o filtro");
    } finally {
      setTestando(false);
    }
  };

  if (!editData) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href="/gerir_filtros_doc/1" className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Link href="/gerir_filtros_doc/2" className="w-24">
          <Button variant="outline" className="w-full">Etapa 2</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 3</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {editData.isNew ? "Novo Filtro" : "Editar Filtro"}
        </h1>
        <p className="text-gray-600 mt-2">
          {editData.isNew
            ? "Crie um novo filtro para documentos"
            : "Modifique as configurações do filtro existente"}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Filtro</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Documentos Importantes"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o propósito deste filtro..."
                rows={3}
              />
            </div>
          </div>

          {/* Regras do filtro */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Regras</h2>
              <Button
                type="button"
                variant="outline"
                onClick={adicionarRegra}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Regra
              </Button>
            </div>

            <div className="space-y-4">
              {regras.map((regra, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <MetadataSelector
                      items={camposDisponiveis}
                      selectedItem={regra.campo || ""}
                      onSelect={(value) => atualizarRegra(index, "campo", value)}
                      placeholder="Selecione o campo"
                      createNewMessage="Novo Campo"
                    />
                  </div>
                  <div className="w-48">
                    <select
                      value={regra.operador || ""}
                      onChange={(e) => atualizarRegra(index, "operador", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Selecione o operador</option>
                      <option value="contains">Contém</option>
                      <option value="equals">Igual a</option>
                      <option value="not_equals">Diferente de</option>
                      <option value="starts_with">Começa com</option>
                      <option value="ends_with">Termina com</option>
                      <option value="is_empty">Está vazio</option>
                      <option value="is_not_empty">Não está vazio</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <MetadataSelector
                      items={Array.from(valoresDisponiveis.get(regra.campo || "") || [])}
                      selectedItem={regra.valor || ""}
                      onSelect={(value) => atualizarRegra(index, "valor", value)}
                      placeholder="Selecione ou digite o valor"
                      createNewMessage="Novo Valor"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerRegra(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Área de teste */}
          {resultadoTeste && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Resultado do Teste</h3>
              <p>
                {resultadoTeste.filtrados} de {resultadoTeste.total} documentos correspondem ao filtro
              </p>
              {resultadoTeste.amostra.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Primeiros documentos encontrados:</p>
                  <ul className="text-sm space-y-1">
                    {resultadoTeste.amostra.map((doc: any, i: number) => (
                      <li key={i} className="text-gray-600">
                        {doc.metadata?.nome || doc.metadata?.title || doc.name || doc.id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={testarFiltro}
              disabled={testando}
              variant="outline"
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              {testando ? "Testando..." : "Testar Filtro"}
            </Button>

            <div className="flex gap-4">
              <Link href="/gerir_filtros_doc/2">
                <Button variant="ghost">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                Salvar e Continuar
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
} 