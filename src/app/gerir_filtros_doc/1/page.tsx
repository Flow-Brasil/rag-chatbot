"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { BarChart3, Filter, FileText } from "lucide-react";

interface Cliente {
  name: string;
  documentCount: number;
  filterCount?: number;
}

interface ClienteStats {
  totalDocuments: number;
  totalFilters: number;
  recentActivity: boolean;
}

export default function GerirFiltrosEtapa1Page() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [clienteStats, setClienteStats] = useState<ClienteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalFilters: 0
  });

  // Buscar lista de clientes e suas estatísticas
  useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        
        // Agrupar documentos por cliente e contar
        const clientesMap = new Map<string, Cliente>();
        data.documents.forEach((doc: any) => {
          const clienteName = doc.metadata?.cliente;
          if (clienteName) {
            if (!clientesMap.has(clienteName)) {
              clientesMap.set(clienteName, {
                name: clienteName,
                documentCount: 0,
                filterCount: 0
              });
            }
            const cliente = clientesMap.get(clienteName)!;
            cliente.documentCount++;
          }
        });
        
        // Converter para array
        const clientesArray = Array.from(clientesMap.values());
        setClientes(clientesArray);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    
    fetchClientes();
  }, []);

  // Buscar estatísticas detalhadas quando um cliente é selecionado
  useEffect(() => {
    async function fetchClienteStats() {
      if (!selectedCliente) {
        setClienteStats(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/documents?cliente=${encodeURIComponent(selectedCliente)}`);
        if (!response.ok) throw new Error("Erro ao carregar estatísticas");
        const data = await response.json();

        // Processar estatísticas
        const stats: ClienteStats = {
          totalDocuments: 0,
          totalFilters: 0,
          recentActivity: false
        };

        // Contar documentos e filtros
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        data.documents.forEach((doc: any) => {
          if (doc.metadata?.cliente === selectedCliente) {
            stats.totalDocuments++;
            
            // Verificar se é um filtro pelo tipo
            if (doc.metadata?.tipo === 'filtro') {
              stats.totalFilters++;
            }

            // Verificar atividade recente
            if (doc.metadata?.lastModified) {
              const modifiedDate = new Date(doc.metadata.lastModified);
              if (modifiedDate > oneWeekAgo) {
                stats.recentActivity = true;
              }
            }
          }
        });

        setClienteStats(stats);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClienteStats();
  }, [selectedCliente]);

  const fetchStats = async (cliente: string) => {
    try {
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(cliente)}`);
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      const data = await response.json();

      let totalDocuments = 0;
      let totalFilters = 0;

      data.documents.forEach((doc: any) => {
        if (doc.metadata?.tipo === 'filtro') {
          totalFilters++;
        } else {
          totalDocuments++;
        }
      });

      setStats({
        totalDocuments,
        totalFilters
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;

    try {
      // Armazenar cliente selecionado
      sessionStorage.setItem('filtrosDocCliente', selectedCliente);
      
      // Redirecionar para etapa 2
      router.push("/gerir_filtros_doc/2" as any);
    } catch (err) {
      console.error("Erro ao processar seleção:", err);
      alert("Erro ao processar a seleção");
    }
  };

  useEffect(() => {
    if (selectedCliente) {
      fetchStats(selectedCliente);
    }
  }, [selectedCliente]);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Button variant="default" className="w-24">
          Etapa 1
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 2
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 3
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Filtros - Etapa 1</h1>
        <p className="text-gray-600 mt-2">
          Selecione um cliente para gerenciar seus filtros de documentos.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Cliente */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <IntelligentSelector
              clientes={clientes}
              selectedCliente={selectedCliente}
              onClientSelect={(value) => setSelectedCliente(value || "")}
              onInputChange={(value) => setSelectedCliente(value)}
            />
          </div>

          {/* Estatísticas */}
          {selectedCliente && clienteStats && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="flex items-center gap-4">
                  <div className="text-blue-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Documentos</h3>
                    <p className="text-3xl font-bold">{stats.totalDocuments}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-purple-600">
                    <Filter className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Filtros</h3>
                    <p className="text-3xl font-bold">{stats.totalFilters}</p>
                  </div>
                </div>
              </div>
              {clienteStats.recentActivity && (
                <p className="text-sm text-blue-600 mt-4">
                  ⚡ Este cliente tem atividade recente nos últimos 7 dias
                </p>
              )}
            </div>
          )}

          {/* Botão de Continuar */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!selectedCliente || loading}
            >
              Continuar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 