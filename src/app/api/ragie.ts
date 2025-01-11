import { NextResponse } from 'next/server';

const RAGIE_API_KEY = process.env.RAGIE_API_KEY;
const RAGIE_API_URL = 'https://api.ragie.ai';

export async function searchDocuments(query: string, documentId?: string) {
  const response = await fetch(`${RAGIE_API_URL}/retrievals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAGIE_API_KEY}`
    },
    body: JSON.stringify({
      query,
      rerank: true,
      filter: documentId ? { document_id: documentId } : undefined
    })
  });

  if (!response.ok) {
    throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getDocumentContent(documentId: string) {
  const response = await fetch(`${RAGIE_API_URL}/retrievals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAGIE_API_KEY}`
    },
    body: JSON.stringify({
      query: ' ',
      filter: { document_id: documentId },
      rerank: false,
      limit: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Outras funções para interagir com a API Ragie... 