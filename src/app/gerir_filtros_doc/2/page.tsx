"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Filter, Plus, ArrowUpDown, Trash2, Edit } from "lucide-react";

interface FiltroDoc {
  id: string;
  nome: string;
  descricao?: string;
  regras: any;
  usoTotal: number;
  ultimoUso?: string;
}

export default function GerirFiltrosEtapa2Page() {
  const router = useRouter();
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [filtros, setFiltros] = useState<FiltroDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<'nome' | 'uso'>('uso');
  const [orderDesc, setOrderDesc] = useState(true);

  // Carregar cliente selecionado
  useEffect(() => {
    const cliente = sessionStorage.getItem('filtrosDocCliente');
    if (!cliente) {
      router.push("/gerir_filtros_doc/1");
      return;
    }
    setSelectedCliente(cliente);
  }, [router]);

  // Buscar filtros do cliente
  useEffect(() => {
    async function fetchFiltros() {
      if (!selectedCliente) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/documents?cliente=${encodeURIComponent(selectedCliente)}`);
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();

        // Processar filtros dos documentos
        const filtrosMap = new Map<string, FiltroDoc>();
        
        data.documents.forEach((doc: any) => {
          // Verificar se é um documento do tipo filtro
          if (doc.metadata?.tipo === 'filtro' && doc.metadata?.cliente === selectedCliente) {
            try {
              // Extrair informações do filtro
              filtrosMap.set(doc.name, {
                id: doc.id,
                nome: doc.name,
                descricao: doc.metadata?.descricao,
                regras: doc.metadata?.regras || [],
                usoTotal: 0,
                ultimoUso: doc.metadata?.ultima_modificacao
              });
            } catch (e) {
              console.error("Erro ao processar filtro:", e);
            }
          }
        });

        // Converter para array e ordenar
        const filtrosArray = Array.from(filtrosMap.values());
        setFiltros(filtrosArray);
      } catch (error) {
        console.error("Erro ao carregar filtros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltros();
  }, [selectedCliente]);

  // Ordenar filtros
  const filtrosOrdenados = [...filtros].sort((a, b) => {
    if (orderBy === 'nome') {
      return orderDesc ? 
        b.nome.localeCompare(a.nome) : 
        a.nome.localeCompare(b.nome);
    } else {
      return orderDesc ? 
        b.usoTotal - a.usoTotal : 
        a.usoTotal - b.usoTotal;
    }
  });

  const handleNovoFiltro = () => {
    // Armazenar dados para a próxima etapa
    sessionStorage.setItem('filtroDocEdit', JSON.stringify({
      isNew: true,
      cliente: selectedCliente
    }));
    
    // Redirecionar para etapa 3
    router.push("/gerir_filtros_doc/3" as any);
  };

  const handleEditarFiltro = (filtro: FiltroDoc) => {
    // Armazenar dados para a próxima etapa
    sessionStorage.setItem('filtroDocEdit', JSON.stringify({
      isNew: false,
      cliente: selectedCliente,
      filtro
    }));
    
    // Redirecionar para etapa 3
    router.push("/gerir_filtros_doc/3" as any);
  };

  if (!selectedCliente) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href="/gerir_filtros_doc/1" className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 2</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 3
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Filtros - Etapa 2</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie os filtros de documentos para {selectedCliente}.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Cabeçalho com ações */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (orderBy === 'nome') {
                    setOrderDesc(!orderDesc);
                  } else {
                    setOrderBy('nome');
                    setOrderDesc(true);
                  }
                }}
                className="gap-2"
              >
                Nome
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (orderBy === 'uso') {
                    setOrderDesc(!orderDesc);
                  } else {
                    setOrderBy('uso');
                    setOrderDesc(true);
                  }
                }}
                className="gap-2"
              >
                Uso
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleNovoFiltro} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Filtro
            </Button>
          </div>

          {/* Lista de Filtros */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando filtros...
            </div>
          ) : filtrosOrdenados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum filtro encontrado para este cliente.</p>
              <p className="text-sm mt-2">Clique em "Novo Filtro" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtrosOrdenados.map((filtro) => (
                <div
                  key={filtro.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{filtro.nome}</h3>
                    {filtro.descricao && (
                      <p className="text-sm text-gray-600 mt-1">{filtro.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Uso: {filtro.usoTotal}</span>
                      {filtro.ultimoUso && (
                        <span>
                          Último uso: {new Date(filtro.ultimoUso).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarFiltro(filtro)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 