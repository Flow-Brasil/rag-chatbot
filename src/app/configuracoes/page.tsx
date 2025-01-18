'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, PlusIcon, SaveIcon, TrashIcon, GripVertical, BarChart3, History, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { metadataService, type MetadataCluster } from "@/lib/services/metadata";
import type { Document } from "@/types/documents";

interface ClusterFormData extends Omit<MetadataCluster, 'validate' | 'format'> {
  isEditing?: boolean;
}

interface ClusterStats {
  totalDocuments: number;
  uniqueValues: number;
  mostCommonValues: { value: string; count: number }[];
}

const defaultCluster: ClusterFormData = {
  key: '',
  label: '',
  description: '',
  priority: 1
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [clusters, setClusters] = useState<ClusterFormData[]>(
    metadataService.getOrderedClusters().map(cluster => ({
      ...cluster,
      isEditing: false
    }))
  );
  const [newCluster, setNewCluster] = useState<ClusterFormData>({
    ...defaultCluster,
    priority: clusters.length + 1
  });
  const [showNewClusterForm, setShowNewClusterForm] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clusterStats, setClusterStats] = useState<Record<string, ClusterStats>>({});
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  // Carregar documentos e calcular estatísticas
  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        setDocuments(data.documents);

        // Calcular estatísticas para cada cluster
        const stats: Record<string, ClusterStats> = {};
        clusters.forEach(cluster => {
          const values = new Set<string>();
          const valueCounts: Record<string, number> = {};

          data.documents.forEach((doc: Document) => {
            const metadataValue = doc.metadata[cluster.key];
            const docValues: string[] = Array.isArray(metadataValue) 
              ? metadataValue 
              : typeof metadataValue === 'string' ? [metadataValue] : [];
            docValues.forEach(value => {
              values.add(value);
              valueCounts[value] = (valueCounts[value] || 0) + 1;
            });
          });

          const sortedValues = Object.entries(valueCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }));

          stats[cluster.key] = {
            totalDocuments: data.documents.filter((doc: Document) => 
              Boolean(doc.metadata[cluster.key]?.length)
            ).length,
            uniqueValues: values.size,
            mostCommonValues: sortedValues
          };
        });

        setClusterStats(stats);
      } catch (error) {
        console.error("Erro ao carregar documentos:", error);
      }
    }

    loadDocuments();
  }, [clusters]);

  const handleSaveCluster = (index: number) => {
    const updatedClusters = [...clusters];
    const currentCluster = updatedClusters[index];
    if (currentCluster) {
      updatedClusters[index] = {
        key: currentCluster.key,
        label: currentCluster.label,
        description: currentCluster.description || '',
        priority: currentCluster.priority,
        isEditing: false
      };
      setClusters(updatedClusters);
      // TODO: Implementar salvamento no backend
    }
  };

  const handleEditCluster = (index: number) => {
    const updatedClusters = [...clusters];
    const currentCluster = updatedClusters[index];
    if (currentCluster) {
      updatedClusters[index] = {
        key: currentCluster.key,
        label: currentCluster.label,
        description: currentCluster.description || '',
        priority: currentCluster.priority,
        isEditing: true
      };
      setClusters(updatedClusters);
    }
  };

  const handleDeleteCluster = (index: number) => {
    if (confirm('Tem certeza que deseja excluir este cluster?')) {
      const updatedClusters = clusters.filter((_, i) => i !== index);
      setClusters(updatedClusters);
      // TODO: Implementar deleção no backend
    }
  };

  const handleAddNewCluster = () => {
    if (newCluster.key && newCluster.label) {
      setClusters([...clusters, { ...newCluster, isEditing: false }]);
      setNewCluster({
        ...defaultCluster,
        priority: clusters.length + 2
      });
      setShowNewClusterForm(false);
      // TODO: Implementar adição no backend
    }
  };

  const handleMoveCluster = (fromIndex: number, toIndex: number) => {
    const updatedClusters = [...clusters];
    const [movedCluster] = updatedClusters.splice(fromIndex, 1);
    if (movedCluster) {
      updatedClusters.splice(toIndex, 0, movedCluster);
      
      // Atualizar prioridades
      updatedClusters.forEach((cluster, index) => {
        cluster.priority = index + 1;
      });
      
      setClusters(updatedClusters);
      // TODO: Implementar atualização de ordem no backend
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="p-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Configurações de Metadados</h1>
        </div>
        <Button
          variant="default"
          onClick={() => setShowNewClusterForm(true)}
          disabled={showNewClusterForm}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Novo Cluster
        </Button>
      </div>

      {/* Lista de Clusters */}
      <div className="space-y-4">
        {/* Formulário de Novo Cluster */}
        {showNewClusterForm && (
          <Card className="p-6 border-2 border-dashed">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chave</label>
                  <Input
                    value={newCluster.key}
                    onChange={(e) => setNewCluster({ ...newCluster, key: e.target.value })}
                    placeholder="Ex: cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <Input
                    value={newCluster.label}
                    onChange={(e) => setNewCluster({ ...newCluster, label: e.target.value })}
                    placeholder="Ex: Cliente"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Input
                  value={newCluster.description}
                  onChange={(e) => setNewCluster({ ...newCluster, description: e.target.value })}
                  placeholder="Ex: Cliente associado ao documento"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewClusterForm(false);
                    setNewCluster({
                      ...defaultCluster,
                      priority: clusters.length + 1
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  onClick={handleAddNewCluster}
                  disabled={!newCluster.key || !newCluster.label}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Clusters Existentes */}
        {clusters.map((cluster, index) => (
          <Card key={cluster.key} className="p-6">
            <div className="flex items-start gap-4">
              <button 
                className="mt-1 cursor-move"
                onMouseDown={(e) => {
                  // Implementar drag and drop
                }}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex-1">
                <Tabs defaultValue="info" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="info">Informações</TabsTrigger>
                      <TabsTrigger value="stats">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Estatísticas
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" />
                        Histórico
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                      {cluster.isEditing ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSaveCluster(index)}
                        >
                          <SaveIcon className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCluster(index)}
                        >
                          <SaveIcon className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCluster(index)}
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="info" className="space-y-4">
                    {cluster.isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Chave</label>
                            <Input
                              value={cluster.key}
                              onChange={(e) => {
                                const updatedClusters = [...clusters];
                                const currentCluster = updatedClusters[index];
                                if (currentCluster) {
                                  updatedClusters[index] = {
                                    ...currentCluster,
                                    key: e.target.value
                                  };
                                  setClusters(updatedClusters);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Label</label>
                            <Input
                              value={cluster.label}
                              onChange={(e) => {
                                const updatedClusters = [...clusters];
                                const currentCluster = updatedClusters[index];
                                if (currentCluster) {
                                  updatedClusters[index] = {
                                    ...currentCluster,
                                    label: e.target.value
                                  };
                                  setClusters(updatedClusters);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Descrição</label>
                          <Input
                            value={cluster.description}
                            onChange={(e) => {
                              const updatedClusters = [...clusters];
                              const currentCluster = updatedClusters[index];
                              if (currentCluster) {
                                updatedClusters[index] = {
                                  ...currentCluster,
                                  description: e.target.value
                                };
                                setClusters(updatedClusters);
                              }
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">{cluster.label}</h3>
                            <p className="text-sm text-gray-500">{cluster.description}</p>
                          </div>
                          <Badge variant="secondary">
                            {cluster.key}
                          </Badge>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="stats">
                    {clusterStats[cluster.key] && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-4">
                            <h4 className="text-sm font-medium text-gray-500">Total de Documentos</h4>
                            <p className="text-2xl font-bold">{clusterStats[cluster.key]?.totalDocuments || 0}</p>
                          </Card>
                          <Card className="p-4">
                            <h4 className="text-sm font-medium text-gray-500">Valores Únicos</h4>
                            <p className="text-2xl font-bold">{clusterStats[cluster.key]?.uniqueValues || 0}</p>
                          </Card>
                          <Card className="p-4">
                            <h4 className="text-sm font-medium text-gray-500">Taxa de Preenchimento</h4>
                            <p className="text-2xl font-bold">
                              {Math.round(((clusterStats[cluster.key]?.totalDocuments || 0) / (documents.length || 1)) * 100)}%
                            </p>
                          </Card>
                        </div>

                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-4">Valores Mais Comuns</h4>
                          <div className="space-y-2">
                            {clusterStats[cluster.key]?.mostCommonValues.map(({ value, count }) => (
                              <div key={value} className="flex items-center justify-between">
                                <span className="text-sm">{value}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="preview">
                    <Card className="p-4">
                      <div className="space-y-2">
                        {documents.slice(0, 5).map(doc => {
                          const metadataValue = doc.metadata[cluster.key];
                          const metadataValues: string[] = Array.isArray(metadataValue)
                            ? metadataValue
                            : typeof metadataValue === 'string' ? [metadataValue] : [];
                          return (
                            <div key={doc.id} className="flex items-center justify-between">
                              <span className="text-sm truncate flex-1">{doc.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                {metadataValues.length > 0 ? metadataValues.join(", ") : "N/A"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history">
                    <Card className="p-4">
                      <p className="text-sm text-gray-500">
                        Histórico de alterações em breve...
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 