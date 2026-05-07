import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const total = await db.estudiante.count();
    const activos = await db.estudiante.count({ where: { estado: 'Activo' } });
    const enRiesgo = await db.estudiante.count({ where: { estado: 'En Riesgo' } });
    const criticos = await db.estudiante.count({ where: { estado: 'Crítico' } });
    const alertasActivas = await db.alerta.count({ where: { leida: false } });
    const alertasUrgentes = await db.alerta.count({ where: { prioridad: 'Urgente', leida: false } });

    const promedioGeneral = await db.estudiante.aggregate({
      _avg: { notaPromedio: true },
    });

    const asistenciaPromedio = await db.estudiante.aggregate({
      _avg: { asistenciaPct: true },
    });

    const distribucionEstado = await db.estudiante.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const distribucionPrograma = await db.estudiante.groupBy({
      by: ['programa'],
      _count: { id: true },
      _avg: { notaPromedio: true, asistenciaPct: true },
    });

    const distribucionEspecialidad = await db.estudiante.groupBy({
      by: ['especialidad'],
      _count: { id: true },
    });

    const alertasPorTipo = await db.alerta.groupBy({
      by: ['tipoAlerta'],
      _count: { id: true },
    });

    const riesgosPorTipo = await db.riesgo.groupBy({
      by: ['tipoRiesgo'],
      _count: { id: true },
      _avg: { puntuacion: true },
    });

    const tendenciaSemanal = await db.eficacia.findMany({
      where: { metrica: 'Tasa Deserción' },
      orderBy: { periodo: 'asc' },
    });

    const tendenciaPromedio = await db.eficacia.findMany({
      where: { metrica: 'Promedio General' },
      orderBy: { periodo: 'asc' },
    });

    const rendimientoTop5 = await db.estudiante.findMany({
      orderBy: { notaPromedio: 'desc' },
      take: 5,
      select: { nombreCompleto: true, grado: true, notaPromedio: true, asistenciaPct: true, especialidad: true },
    });

    const rendimientoBajo5 = await db.estudiante.findMany({
      where: { estado: { in: ['En Riesgo', 'Crítico'] } },
      orderBy: { notaPromedio: 'asc' },
      take: 5,
      select: { nombreCompleto: true, grado: true, notaPromedio: true, asistenciaPct: true, especialidad: true },
    });

    return NextResponse.json({
      kpis: {
        total,
        activos,
        enRiesgo,
        criticos,
        alertasActivas,
        alertasUrgentes,
        promedioGeneral: promedioGeneral._avg.notaPromedio || 0,
        asistenciaPromedio: asistenciaPromedio._avg.asistenciaPct || 0,
      },
      distribucionEstado,
      distribucionPrograma,
      distribucionEspecialidad,
      alertasPorTipo,
      riesgosPorTipo,
      tendenciaSemanal,
      tendenciaPromedio,
      rendimientoTop5,
      rendimientoBajo5,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 });
  }
}
