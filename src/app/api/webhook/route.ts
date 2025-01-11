import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('📨 Webhook recebido:', data);

    // Aqui você pode adicionar lógica para atualizar o estado da sua aplicação
    // Por exemplo, emitir um evento via WebSocket para atualizar a UI

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
} 