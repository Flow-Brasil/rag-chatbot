import type { Document } from "../../types/documents";

export interface MetadataCluster {
  key: string;
  label: string;
  description?: string;
  priority: number;
  validate?: (value: string) => boolean;
  format?: (value: string) => string;
}

const metadataClusters = new Map<string, MetadataCluster>([
  [
    "cliente",
    {
      key: "cliente",
      label: "Cliente",
      description: "Cliente associado ao documento",
      priority: 1,
    },
  ],
  [
    "tipo",
    {
      key: "tipo",
      label: "Tipo",
      description: "Tipo do documento",
      priority: 2,
    },
  ],
  [
    "Ferramenta",
    {
      key: "Ferramenta",
      label: "Ferramenta",
      description: "Ferramenta associada ao documento",
      priority: 3,
    },
  ],
  [
    "scope",
    {
      key: "scope",
      label: "Escopo",
      description: "Escopo do documento",
      priority: 4,
    },
  ],
]);

export class MetadataService {
  private clusters: Map<string, MetadataCluster>;

  constructor() {
    this.clusters = metadataClusters;
  }

  extractMetadataValues(documents: Document[]): Record<string, string[]> {
    const metadataMap: Record<string, string[]> = {};

    // Inicializa os arrays para cada chave de cluster
    this.clusters.forEach((_, key) => {
      metadataMap[key] = [];
    });

    // Extrai valores únicos de metadados
    documents.forEach((doc) => {
      Object.entries(doc.metadata).forEach(([key, values]) => {
        if (this.clusters.has(key)) {
          const existingValues = metadataMap[key] || [];
          const newValues = values.filter(
            (value) => !existingValues.includes(value)
          );
          if (newValues.length > 0) {
            metadataMap[key] = [...existingValues, ...newValues].sort();
          }
        }
      });
    });

    return metadataMap;
  }

  validateDocumentMetadata(metadata: Record<string, string[]>): boolean {
    return Array.from(this.clusters.entries()).every(([key, cluster]) => {
      const values = metadata[key];
      if (!values || values.length === 0) return false;
      if (cluster.validate) {
        return values.every((value) => cluster.validate!(value));
      }
      return true;
    });
  }

  filterDocuments(
    documents: Document[],
    filters: Record<string, string>
  ): Document[] {
    return documents.filter((doc) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const docValues = doc.metadata[key];
        if (!docValues) return false;
        return docValues.some((v) =>
          v.toLowerCase().includes(value.toLowerCase())
        );
      })
    );
  }

  getOrderedClusters(): MetadataCluster[] {
    return Array.from(this.clusters.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }
}

export const metadataService = new MetadataService(); 