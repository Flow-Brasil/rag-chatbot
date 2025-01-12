"use client";

import { XCircle } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  details?: string;
}

export function ErrorMessage({ error, details }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{error}</p>
        {details && (
          <p className="mt-1 text-sm text-red-600">{details}</p>
        )}
      </div>
    </div>
  );
} 