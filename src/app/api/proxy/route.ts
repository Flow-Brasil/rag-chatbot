import { NextResponse } from 'next/server';

const RAGIE_API_KEY = 'tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA';

export async function GET(req: Request) {
  try {
    const response = await fetch('https://api.ragie.ai/documents', {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy da API:', error);
    return NextResponse.json(
      { error: 'Erro ao contactar a API externa' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const response = await fetch('https://api.ragie.ai/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy da API:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar documento' }, 
      { status: 500 }
    );
  }
} 