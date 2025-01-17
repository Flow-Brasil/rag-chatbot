"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Regra {
  campo: string;
  operador: "contem" | "igual" | "diferente";
  valor: string;
}

interface FiltroDoc {
  id: string;
  nome: string;
  descricao?: string;
  regras: Regra[];
  cliente: string;
}

export default function GerirFiltrosEtapa4Page() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Carregar dados do filtro
  useEffect(() => {
    const savedData = sessionStorage.getItem('filtroDocConfirm');
    if (!savedData) {
      router.push("/gerir_filtros_doc/1");
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setFiltro(data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      router.push("/gerir_filtros_doc/1");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtro) return;

    try {
      setLoading(true);

      // Verificar se já existe um filtro com o mesmo nome
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(filtro.cliente)}`);
      if (!response.ok) throw new Error("Erro ao verificar documentos existentes");
      const data = await response.json();

      // Verificar duplicação por nome
      const existingByName = data.documents.find((doc: any) => 
        doc.name === `${filtro.nome}.json` && 
        doc.metadata?.tipo === 'filtro'
      );

      if (existingByName) {
        alert("Já existe um filtro com este nome. Por favor, escolha outro nome.");
        setLoading(false);
        return;
      }

      // Verificar duplicação por regras
      const existingByRules = data.documents.find((doc: any) => {
        if (doc.metadata?.tipo !== 'filtro') return false;
        
        try {
          const docContent = JSON.parse(doc.content);
          const sameRules = JSON.stringify(docContent.regras) === JSON.stringify(filtro.regras);
          return sameRules && doc.metadata?.cliente === filtro.cliente;
        } catch {
          return false;
        }
      });

      if (existingByRules) {
        const confirmar = window.confirm(
          "Já existe um filtro com regras idênticas. Deseja criar mesmo assim?"
        );
        if (!confirmar) {
          setLoading(false);
          return;
        }
      }

      // Se passou pelas verificações, continua com o upload
      const uploadResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: JSON.stringify(filtro, null, 2),
          fileName: `${filtro.nome}.json`,
          metadata: {
            cliente: filtro.cliente,
            tipo: 'filtro',
            nome: filtro.nome,
            descricao: filtro.descricao
          }
        })
      });

      if (!uploadResponse.ok) throw new Error("Erro ao salvar filtro");

      // Limpar storage e redirecionar
      sessionStorage.removeItem('filtroDocEdit');
      sessionStorage.removeItem('filtroDocConfirm');
      router.push("/gerenciador");
    } catch (err) {
      console.error("Erro ao salvar filtro:", err);
      alert("Erro ao salvar o filtro");
    } finally {
      setLoading(false);
    }
  };

  if (!filtro) {
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
        <Link href="/gerir_filtros_doc/3" className="w-24">
          <Button variant="outline" className="w-full">Etapa 3</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 4</Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Confirmar Filtro</h1>
        <p className="text-gray-600 mt-2">
          Revise as informações do filtro antes de salvar.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Informações do Filtro */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informações do Filtro</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="mt-1">{filtro.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                <dd className="mt-1">{filtro.cliente}</dd>
              </div>
              {filtro.descricao && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                  <dd className="mt-1">{filtro.descricao}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Regras do Filtro */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Regras</h2>
            <div className="space-y-2">
              {filtro.regras.map((regra, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg flex items-center gap-4"
                >
                  <div className="flex-1">
                    <span className="font-medium">{regra.campo}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">{regra.operador}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>{regra.valor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status e Botões */}
          <div className="space-y-4">
            {status.message && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  status.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status.success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <p>{status.message}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Link href="/gerir_filtros_doc/3">
                <Button variant="outline">Voltar</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading ? "Salvando..." : "Confirmar e Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 