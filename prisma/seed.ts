import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  // Clean existing data
  await db.alerta.deleteMany();
  await db.riesgo.deleteMany();
  await db.eficacia.deleteMany();
  await db.estudiante.deleteMany();

  const estudiantes = [
    { grado: "Capitán de Fragata", nombreCompleto: "Carlos Mendoza Vargas", especialidad: "Ingeniería de Sistemas", programa: "Maestría en Ciberseguridad Naval", cohorte: "2026-I", correo: "cmendoza@armada.bo", estado: "Activo", notaPromedio: 89.5, asistenciaPct: 96, interaccionesLMS: 145 },
    { grado: "Capitán de Corbeta", nombreCompleto: "María Fernanda Rojas", especialidad: "Logística Militar", programa: "Diplomado en Gestión Estratégica", cohorte: "2026-I", correo: "mrojas@armada.bo", estado: "En Riesgo", notaPromedio: 62.3, asistenciaPct: 71, interaccionesLMS: 38 },
    { grado: "Teniente de Navío", nombreCompleto: "Roberto Apaza Mamani", especialidad: "Comunicaciones", programa: "Maestría en Ciberseguridad Naval", cohorte: "2026-I", correo: "rapaza@armada.bo", estado: "Crítico", notaPromedio: 48.7, asistenciaPct: 55, interaccionesLMS: 12 },
    { grado: "Teniente de Fragata", nombreCompleto: "Ana Lucía Paredes", especialidad: "Inteligencia Artificial", programa: "Especialización en IA Aplicada", cohorte: "2026-I", correo: "aparedes@armada.bo", estado: "Activo", notaPromedio: 92.1, asistenciaPct: 98, interaccionesLMS: 178 },
    { grado: "Alférez de Fragata", nombreCompleto: "Jorge Quispe Huayta", especialidad: "Ingeniería Eléctrica", programa: "Diplomado en Tecnologías Digitales", cohorte: "2026-I", correo: "jquispe@armada.bo", estado: "En Riesgo", notaPromedio: 58.4, asistenciaPct: 65, interaccionesLMS: 25 },
    { grado: "Capitán de Fragata", nombreCompleto: "Patricia Salazar López", especialidad: "Administración Naval", programa: "Maestría en Gestión Pública", cohorte: "2026-I", correo: "psalazar@armada.bo", estado: "Activo", notaPromedio: 85.2, asistenciaPct: 94, interaccionesLMS: 132 },
    { grado: "Teniente de Navío", nombreCompleto: "Luis Fernando Torrico", especialidad: "Mecánica Naval", programa: "Especialización en Mantenimiento Industrial", cohorte: "2026-I", correo: "ltorrico@armada.bo", estado: "En Riesgo", notaPromedio: 60.1, asistenciaPct: 68, interaccionesLMS: 30 },
    { grado: "Capitán de Corbeta", nombreCompleto: "Gabriela Cruz Medina", especialidad: "Derecho Militar", programa: "Maestría en Derecho Internacional", cohorte: "2026-I", correo: "gcruz@armada.bo", estado: "Activo", notaPromedio: 91.8, asistenciaPct: 97, interaccionesLMS: 156 },
    { grado: "Alférez de Navío", nombreCompleto: "Diego Arce Pinto", especialidad: "Navegación", programa: "Diplomado en Tecnología y Defensa", cohorte: "2026-I", correo: "darce@armada.bo", estado: "Crítico", notaPromedio: 42.5, asistenciaPct: 48, interaccionesLMS: 8 },
    { grado: "Teniente de Fragata", nombreCompleto: "Sandra Villarroel Orellana", especialidad: "Ingeniería de Sistemas", programa: "Maestría en Ciberseguridad Naval", cohorte: "2026-I", correo: "svillarroel@armada.bo", estado: "Activo", notaPromedio: 87.6, asistenciaPct: 95, interaccionesLMS: 140 },
    { grado: "Capitán de Fragata", nombreCompleto: "Miguel Ángel Saavedra", especialidad: "Estrategia Militar", programa: "Maestría en Gestión Pública", cohorte: "2026-I", correo: "msaavedra@armada.bo", estado: "Activo", notaPromedio: 88.3, asistenciaPct: 93, interaccionesLMS: 128 },
    { grado: "Teniente de Navío", nombreCompleto: "Claudia Espinoza Ríos", especialidad: "Medicina Naval", programa: "Especialización en IA Aplicada", cohorte: "2026-I", correo: "cespinoza@armada.bo", estado: "En Riesgo", notaPromedio: 63.8, asistenciaPct: 72, interaccionesLMS: 42 },
    { grado: "Alférez de Fragata", nombreCompleto: "Fernando Choque Limachi", especialidad: "Comunicaciones", programa: "Diplomado en Tecnologías Digitales", cohorte: "2026-I", correo: "fchoque@armada.bo", estado: "Activo", notaPromedio: 79.4, asistenciaPct: 88, interaccionesLMS: 95 },
    { grado: "Capitán de Corbeta", nombreCompleto: "Verónica Miranda Gutiérrez", especialidad: "Logística Militar", programa: "Diplomado en Gestión Estratégica", cohorte: "2026-I", correo: "vmiranda@armada.bo", estado: "En Riesgo", notaPromedio: 59.7, asistenciaPct: 63, interaccionesLMS: 22 },
    { grado: "Teniente de Fragata", nombreCompleto: "Pablo Calcina Salinas", especialidad: "Ingeniería de Sistemas", programa: "Especialización en IA Aplicada", cohorte: "2026-I", correo: "pcalcina@armada.bo", estado: "Activo", notaPromedio: 93.2, asistenciaPct: 99, interaccionesLMS: 190 },
  ];

  const riesgos = [
    { estudianteCorreo: "mrojas@armada.bo", tipoRiesgo: "Académico", nivelRiesgo: "Alto", puntuacion: 78, descripcion: "Descenso sostenido en calificaciones durante las últimas 3 semanas", estado: "Activo" },
    { estudianteCorreo: "mrojas@armada.bo", tipoRiesgo: "Asistencia", nivelRiesgo: "Medio", puntuacion: 65, descripcion: "Inasistencias reiteradas en sesiones sincrónicas", estado: "Activo" },
    { estudianteCorreo: "rapaza@armada.bo", tipoRiesgo: "Académico", nivelRiesgo: "Crítico", puntuacion: 92, descripcion: "Riesgo inminente de deserción. Promedio por debajo del mínimo aprobatorio", estado: "Activo" },
    { estudianteCorreo: "rapaza@armada.bo", tipoRiesgo: "Interacción", nivelRiesgo: "Crítico", puntuacion: 95, descripcion: "Prácticamente nula interacción en el LMS durante 2 semanas", estado: "Activo" },
    { estudianteCorreo: "rapaza@armada.bo", tipoRiesgo: "Tecnológico", nivelRiesgo: "Alto", puntuacion: 70, descripcion: "Limitaciones de conectividad reportadas desde unidad remota", estado: "Activo" },
    { estudianteCorreo: "jquispe@armada.bo", tipoRiesgo: "Académico", nivelRiesgo: "Alto", puntuacion: 75, descripcion: "Dificultades persistentes en módulo de fundamentos digitales", estado: "Activo" },
    { estudianteCorreo: "jquispe@armada.bo", tipoRiesgo: "Interacción", nivelRiesgo: "Alto", puntuacion: 80, descripcion: "Participación mínima en foros y actividades colaborativas", estado: "Activo" },
    { estudianteCorreo: "ltorrico@armada.bo", tipoRiesgo: "Asistencia", nivelRiesgo: "Alto", puntuacion: 72, descripcion: "Patrón de inasistencias los días lunes", estado: "Activo" },
    { estudianteCorreo: "darce@armada.bo", tipoRiesgo: "Académico", nivelRiesgo: "Crítico", puntuacion: 96, descripcion: "Múltiples módulos reprobados. Necesita intervención inmediata", estado: "Activo" },
    { estudianteCorreo: "darce@armada.bo", tipoRiesgo: "Interacción", nivelRiesgo: "Crítico", puntuacion: 98, descripcion: "Sin acceso al LMS en los últimos 15 días", estado: "Escalado" },
    { estudianteCorreo: "cespinoza@armada.bo", tipoRiesgo: "Tecnológico", nivelRiesgo: "Medio", puntuacion: 55, descripcion: "Dificultades con herramientas de simulación", estado: "Activo" },
    { estudianteCorreo: "vmiranda@armada.bo", tipoRiesgo: "Académico", nivelRiesgo: "Alto", puntuacion: 73, descripcion: "Bajo rendimiento en evaluaciones de caso práctico", estado: "Activo" },
  ];

  const alertas = [
    { estudianteCorreo: "rapaza@armada.bo", tipoAlerta: "Rendimiento", prioridad: "Urgente", mensaje: "El oficial Apaza tiene un promedio de 48.7, muy por debajo del mínimo aprobatorio (60). Se recomienda intervención inmediata.", recomendacion: "Programar sesión de tutoría personalizada y revisar plan de recuperación académica. Evaluar posible reorientación de carga lectiva." },
    { estudianteCorreo: "darce@armada.bo", tipoAlerta: "Inactividad", prioridad: "Urgente", mensaje: "Detectada inactividad total en LMS por 15 días consecutivos. Riesgo extremo de deserción.", recomendacion: "Contactar de inmediato vía cadena de mando. Verificar situación personal y conectividad. Considerar extensión de plazos." },
    { estudianteCorreo: "mrojas@armada.bo", tipoAlerta: "Rendimiento", prioridad: "Alta", mensaje: "Descenso del 15% en calificaciones en las últimas 3 evaluaciones parciales.", recomendacion: "Revisar estrategias de estudio. Asignar compañero de estudio de alto rendimiento. Programar reunión con tutor." },
    { estudianteCorreo: "jquispe@armada.bo", tipoAlerta: "Asistencia", prioridad: "Alta", mensaje: "El oficial Quispe ha acumulado 4 inasistencias injustificadas este mes.", recomendacion: "Comunicar al superior directo. Evaluar si las inasistencias están relacionadas con servicio militar activo." },
    { estudianteCorreo: "ltorrico@armada.bo", tipoAlerta: "Asistencia", prioridad: "Media", mensaje: "Patrón recurrente de inasistencia los lunes. Posible conflicto con horario de servicio.", recomendacion: "Investigar compatibilidad de horarios. Considerar opción de grabación de sesiones sincrónicas." },
    { estudianteCorreo: "cespinoza@armada.bo", tipoAlerta: "Oportunidad", prioridad: "Media", mensaje: "La oficial Espinoza muestra buen desempeño pero tiene dificultades con simuladores técnicos.", recomendacion: "Ofrecer capacitación complementaria en herramientas de simulación. Asignar práctica adicional guiada." },
    { estudianteCorreo: "vmiranda@armada.bo", tipoAlerta: "Rendimiento", prioridad: "Alta", mensaje: "Resultados deficientes en casos prácticos de logística avanzada (2 evaluaciones consecutivas < 55).", recomendacion: "Asignar mentor en área de logística. Proporcionar material complementario de refuerzo." },
    { estudianteCorreo: "aparedes@armada.bo", tipoAlerta: "Oportunidad", prioridad: "Baja", mensaje: "Excelente desempeño detectado. Candidata ideal para programa de tutoría entre pares.", recomendacion: "Invitar al programa de mentores estudiantiles. Considerar para asistente de cátedra en próximos módulos." },
    { estudianteCorreo: "pcalcina@armada.bo", tipoAlerta: "Oportunidad", prioridad: "Baja", mensaje: "Mayor número de interacciones en el LMS del cohorte. Excelente compromiso.", recomendacion: "Reconocimiento público en sesión virtual. Considerar como líder de grupo de estudio." },
  ];

  const eficaciaData = [
    { periodo: "Sem. 1", metrica: "Tasa Deserción", valor: 8.5, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 2", metrica: "Tasa Deserción", valor: 7.2, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 3", metrica: "Tasa Deserción", valor: 6.1, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 4", metrica: "Tasa Deserción", valor: 5.4, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 5", metrica: "Tasa Deserción", valor: 4.8, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 6", metrica: "Tasa Deserción", valor: 4.2, meta: 5.0, unidad: "%" },
    { periodo: "Sem. 1", metrica: "Promedio General", valor: 72.3, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 2", metrica: "Promedio General", valor: 74.8, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 3", metrica: "Promedio General", valor: 77.1, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 4", metrica: "Promedio General", valor: 79.5, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 5", metrica: "Promedio General", valor: 81.2, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 6", metrica: "Promedio General", valor: 82.8, meta: 80.0, unidad: "pts" },
    { periodo: "Sem. 1", metrica: "Alertas Resueltas", valor: 45, meta: 80, unidad: "%" },
    { periodo: "Sem. 2", metrica: "Alertas Resueltas", valor: 62, meta: 80, unidad: "%" },
    { periodo: "Sem. 3", metrica: "Alertas Resueltas", valor: 75, meta: 80, unidad: "%" },
    { periodo: "Sem. 4", metrica: "Alertas Resueltas", valor: 82, meta: 80, unidad: "%" },
    { periodo: "Sem. 5", metrica: "Alertas Resueltas", valor: 88, meta: 80, unidad: "%" },
    { periodo: "Sem. 6", metrica: "Alertas Resueltas", valor: 92, meta: 80, unidad: "%" },
    { periodo: "Sem. 1", metrica: "Asistencia Promedio", valor: 82, meta: 90, unidad: "%" },
    { periodo: "Sem. 2", metrica: "Asistencia Promedio", valor: 85, meta: 90, unidad: "%" },
    { periodo: "Sem. 3", metrica: "Asistencia Promedio", valor: 87, meta: 90, unidad: "%" },
    { periodo: "Sem. 4", metrica: "Asistencia Promedio", valor: 89, meta: 90, unidad: "%" },
    { periodo: "Sem. 5", metrica: "Asistencia Promedio", valor: 91, meta: 90, unidad: "%" },
    { periodo: "Sem. 6", metrica: "Asistencia Promedio", valor: 93, meta: 90, unidad: "%" },
  ];

  // Insert estudiantes
  for (const est of estudiantes) {
    await db.estudiante.create({ data: est });
  }

  // Insert riesgos
  for (const r of riesgos) {
    const estudiante = await db.estudiante.findUnique({ where: { correo: r.estudianteCorreo } });
    if (estudiante) {
      const { estudianteCorreo, ...data } = r as any;
      await db.riesgo.create({ data: { ...data, estudianteId: estudiante.id } });
    }
  }

  // Insert alertas
  for (const a of alertas) {
    const estudiante = await db.estudiante.findUnique({ where: { correo: a.estudianteCorreo } });
    if (estudiante) {
      const { estudianteCorreo, ...data } = a as any;
      await db.alerta.create({ data: { ...data, estudianteId: estudiante.id } });
    }
  }

  // Insert eficacia
  for (const e of eficaciaData) {
    await db.eficacia.create({ data: e });
  }

  console.log("Seed data inserted successfully!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
