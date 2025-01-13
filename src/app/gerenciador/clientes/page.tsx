"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircleIcon, ArrowLeftIcon, FileIcon } from "lucide-react";

interface Cliente {
  name: string;           // Nome do cliente (usado como ID)
  documentCount: number;  // Quantidade de documentos
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Buscar clientes
  useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        
        // Agrupar documentos por cliente e contar
        const clientesMap = new Map<string, number>();
        data.documents.forEach((doc: any) => {
          const clienteName = doc.metadata?.cliente;
          if (clienteName) {
            clientesMap.set(clienteName, (clientesMap.get(clienteName) || 0) + 1);
          }
        });
        
        // Converter para array de clientes
        const clientesArray = Array.from(clientesMap.entries()).map(([name, count]) => ({
          name,
          documentCount: count
        }));
        
        setClientes(clientesArray);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    
    fetchClientes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.name}>
                <TableCell className="font-medium">{cliente.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileIcon className="w-4 h-4 mr-2 text-gray-500" />
                    {cliente.documentCount} documento{cliente.documentCount !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/chat/cliente/${encodeURIComponent(cliente.name)}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <MessageCircleIcon className="w-4 h-4 mr-2" />
                    Conversar sobre cliente
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 