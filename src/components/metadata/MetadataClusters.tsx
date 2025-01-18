'use client';

import type { Document } from "../../types/documents";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { metadataService, type MetadataCluster } from "../../lib/services/metadata";

interface MetadataClustersProps {
  documents: Document[];
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;
}

export function MetadataClusters({ 
  documents,
  onFilterChange,
  activeFilters = {}
}: MetadataClustersProps) {
  const metadata = metadataService.extractMetadataValues(documents);
  const clusters = metadataService.getOrderedClusters();

  return (
    <div className="space-y-4">
      {clusters.map((cluster: MetadataCluster) => {
        const values = metadata[cluster.key] || [];
        if (values.length === 0) return null;

        return (
          <Card key={cluster.key} className="p-4">
            <h3 className="font-medium mb-2">{cluster.label}</h3>
            {cluster.description && (
              <p className="text-sm text-gray-500 mb-2">{cluster.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {values.map((value: string) => (
                <Badge 
                  key={value} 
                  variant={activeFilters[cluster.key] === value ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (onFilterChange) {
                      if (activeFilters[cluster.key] === value) {
                        onFilterChange(cluster.key, "");
                      } else {
                        onFilterChange(cluster.key, value);
                      }
                    }
                  }}
                >
                  {value}
                </Badge>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
} 