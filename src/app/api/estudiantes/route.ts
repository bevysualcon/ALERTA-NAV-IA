import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const estudiantes = await db.estudiante.findMany({
      include: {
        riesgos: { orderBy: { puntuacion: 'desc' }, take: 3 },
        alertas: { where: { leida: false }, orderBy: { fechaCreacion: 'desc' }, take: 2 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error('Estudiantes API error:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grado, nombreCompleto, especialidad, programa, cohorte, correo } = body;

    if (!nombreCompleto || !correo) {
      return NextResponse.json({ error: 'Nombre completo y correo son obligatorios' }, { status: 400 });
    }

    const exists = await db.estudiante.findUnique({ where: { correo } });
    if (exists) {
      return NextResponse.json({ error: 'Ya existe un estudiante con ese correo' }, { status: 409 });
    }

    const estudiante = await db.estudiante.create({
      data: {
        grado: grado || 'Alférez',
        nombreCompleto,
        especialidad: especialidad || 'General',
        programa: programa || 'No asignado',
        cohorte: cohorte || '2026-I',
        correo,
        estado: 'Activo',
        notaPromedio: 0,
        asistenciaPct: 100,
        interaccionesLMS: 0,
      },
    });

    return NextResponse.json(estudiante, { status: 201 });
  } catch (error) {
    console.error('Create estudiante error:', error);
    return NextResponse.json({ error: 'Error al crear estudiante' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
    }

    const estudiante = await db.estudiante.update({
      where: { id },
      data,
    });

    return NextResponse.json(estudiante);
  } catch (error) {
    console.error('Update estudiante error:', error);
    return NextResponse.json({ error: 'Error al actualizar estudiante' }, { status: 500 });
  }
}
