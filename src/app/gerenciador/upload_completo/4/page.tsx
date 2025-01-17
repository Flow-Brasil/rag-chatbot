"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface ProcessingStatus {
  status: "processing" | "completed" | "error";
  progress: number;
  message: string;
}

export default function UploadEtapa4Page() {
  const router = useRouter();
  const [status, setStatus] = useState<ProcessingStatus>({
    status: "processing",
    progress: 0,
    message: "Iniciando processamento..."
  });

  // Simular progresso do processamento
  useEffect(() => {
    const steps = [
      { progress: 25, message: "Analisando documentos..." },
      { progress: 50, message: "Extraindo conteúdo..." },
      { progress: 75, message: "Processando com Ragie..." },
      { progress: 100, message: "Concluído!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus({
          status: currentStep === steps.length - 1 ? "completed" : "processing",
          progress: steps[currentStep].progress,
          message: steps[currentStep].message
        });
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upload de Documentos - Processamento</h1>
      </div>

      {/* Navegação entre etapas */}
      <div className="flex gap-4 mb-8">
        <span className="text-primary">1. Selecionar Arquivos</span>
        <span className="text-primary">2. Adicionar Metadados</span>
        <span className="text-primary">3. Revisar e Confirmar</span>
        <span className="font-bold text-primary">4. Processamento</span>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          {/* Status do Processamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {status.status === "processing" ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              <h2 className="text-lg font-semibold">{status.message}</h2>
            </div>
            
            <Progress value={status.progress} className="w-full" />
            
            <p className="text-sm text-gray-500">
              {status.progress}% concluído
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4">
            {status.status === "completed" && (
              <Button
                onClick={() => router.push("/gerenciador" as any)}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ir para o Gerenciador
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 