import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alertas = await db.alerta.findMany({
      include: {
        estudiante: {
          select: { nombreCompleto: true, grado: true, especialidad: true, programa: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
    return NextResponse.json(alertas);
  } catch (error) {
    console.error('Alertas API error:', error);
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, leida, resuelta } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
    }

    const alerta = await db.alerta.update({
      where: { id },
      data: { ...(leida !== undefined && { leida }), ...(resuelta !== undefined && { resuelta }) },
    });

    return NextResponse.json(alerta);
  } catch (error) {
    console.error('Update alerta error:', error);
    return NextResponse.json({ error: 'Error al actualizar alerta' }, { status: 500 });
  }
}
