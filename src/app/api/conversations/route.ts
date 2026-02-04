import { NextResponse } from 'next/server';

type Message = {
  author: string;
  text: string;
  timestamp: string; // ISO string
};

export async function GET() {
  const messages: Message[] = [
    { author: 'Alejandro', text: 'Hola, ¿cómo va el dashboard?', timestamp: '2026-02-04T01:00:00Z' },
    { author: 'Bot', text: 'Todo listo para agregar la sección.', timestamp: '2026-02-04T01:05:00Z' },
    { author: 'Alejandro', text: 'Excelente, gracias!', timestamp: '2026-02-04T01:10:00Z' },
  ];
  return NextResponse.json(messages);
}
