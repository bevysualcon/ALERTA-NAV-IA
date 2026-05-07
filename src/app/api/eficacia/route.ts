import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const eficacia = await db.eficacia.findMany({
      orderBy: [{ metrica: 'asc' }, { periodo: 'asc' }],
    });
    return NextResponse.json(eficacia);
  } catch (error) {
    console.error('Eficacia API error:', error);
    return NextResponse.json({ error: 'Error al obtener datos de eficacia' }, { status: 500 });
  }
}
