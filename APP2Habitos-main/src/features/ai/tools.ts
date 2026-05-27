/** Claude tool_use definitions for habit management and data access */

export const AI_TOOLS = [
  // ══ HÁBITOS ══════════════════════════════════════════════
  {
    name: 'create_habit',
    description: 'Crea un nuevo hábito en el tracker del usuario. Úsalo cuando pida añadir, crear o agregar un hábito. Elige emoji y color apropiados. Para hábitos matutinos sugiere horario 06:00-09:00, nocturnos 21:00-23:00.',
    input_schema: {
      type: 'object',
      properties: {
        name:              { type: 'string', description: 'Nombre del hábito (máx 40 caracteres)' },
        emoji:             { type: 'string', description: 'Emoji representativo del hábito' },
        description:       { type: 'string', description: 'Breve descripción del beneficio (máx 80 chars)' },
        color:             { type: 'string', enum: ['#007aff','#34c759','#ff9500','#ff3b30','#af52de','#5ac8fa','#5856d6'], description: 'Color del hábito' },
        category:          { type: 'string', enum: ['mind','body','focus','knowledge','nutrition','social','other'] },
        frequency_type:    { type: 'string', enum: ['daily','weekly','times_per_week'] },
        frequency_days:    { type: 'array', items: { type: 'number' }, description: 'Días semana: 0=Dom,1=Lun...6=Sáb. Solo para weekly.' },
        frequency_times:   { type: 'number', description: 'Veces/semana. Solo para times_per_week.' },
        type:              { type: 'string', enum: ['boolean','count'], description: 'boolean=sí/no, count=número (ej: vasos de agua)' },
        target_count:      { type: 'number', description: 'Objetivo numérico. Solo para type=count.' },
        unit:              { type: 'string', description: 'Unidad del conteo (ej: vasos, páginas, minutos)' },
        schedule_time:     { type: 'string', description: 'Hora en formato HH:MM (24h)' },
        schedule_duration: { type: 'number', description: 'Duración estimada en minutos' },
        difficulty:        { type: 'string', enum: ['easy','medium','hard'] },
        identity:          { type: 'string', description: 'Afirmación de identidad (ej: "Soy una persona activa")' },
      },
      required: ['name', 'emoji', 'color', 'category', 'frequency_type', 'type'],
    },
  },
  {
    name: 'bulk_create_habits',
    description: 'Crea múltiples hábitos de una vez. Úsalo para rutinas completas o planes (ej: "rutina matutina", "plan de fitness"). Más eficiente que create_habit múltiple.',
    input_schema: {
      type: 'object',
      properties: {
        habits: {
          type: 'array',
          description: 'Lista de hábitos a crear',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }, emoji: { type: 'string' },
              description: { type: 'string' }, color: { type: 'string' },
              category: { type: 'string' }, frequency_type: { type: 'string' },
              type: { type: 'string' }, target_count: { type: 'number' },
              unit: { type: 'string' }, schedule_time: { type: 'string' },
              schedule_duration: { type: 'number' }, difficulty: { type: 'string' },
              identity: { type: 'string' },
            },
            required: ['name', 'emoji', 'color', 'category', 'frequency_type', 'type'],
          },
        },
        plan_summary: { type: 'string', description: 'Resumen del plan creado para mostrar al usuario' },
      },
      required: ['habits', 'plan_summary'],
    },
  },
  {
    name: 'update_habit',
    description: 'Modifica un hábito existente. Usa solo los campos que el usuario quiere cambiar.',
    input_schema: {
      type: 'object',
      properties: {
        habit_id:          { type: 'string', description: 'ID del hábito (de get_habit_stats)' },
        name:              { type: 'string' },
        emoji:             { type: 'string' },
        description:       { type: 'string' },
        color:             { type: 'string' },
        schedule_time:     { type: 'string' },
        schedule_duration: { type: 'number' },
        target_count:      { type: 'number' },
        frequency_type:    { type: 'string', enum: ['daily','weekly','times_per_week'] },
        frequency_times:   { type: 'number' },
        difficulty:        { type: 'string', enum: ['easy','medium','hard'] },
        identity:          { type: 'string' },
      },
      required: ['habit_id'],
    },
  },
  {
    name: 'archive_habit',
    description: 'Archiva un hábito sin eliminar su historial. Preferir sobre delete para pausas temporales.',
    input_schema: {
      type: 'object',
      properties: {
        habit_id: { type: 'string' },
        reason:   { type: 'string', description: 'Razón de la pausa' },
      },
      required: ['habit_id', 'reason'],
    },
  },
  {
    name: 'delete_habit',
    description: 'Elimina un hábito y todo su historial permanentemente. Solo usar cuando el usuario lo pida explícitamente.',
    input_schema: {
      type: 'object',
      properties: {
        habit_id: { type: 'string' },
        reason:   { type: 'string' },
      },
      required: ['habit_id', 'reason'],
    },
  },
  {
    name: 'mark_habit_complete',
    description: 'Marca un hábito como completado para hoy u otra fecha.',
    input_schema: {
      type: 'object',
      properties: {
        habit_id: { type: 'string' },
        date:     { type: 'string', description: 'YYYY-MM-DD. Omitir para hoy.' },
        count:    { type: 'number', description: 'Para hábitos de conteo.' },
        note:     { type: 'string' },
      },
      required: ['habit_id'],
    },
  },
  // ══ DATOS Y ANÁLISIS ═════════════════════════════════════
  {
    name: 'get_habit_stats',
    description: 'Obtiene estadísticas detalladas de hábitos para análisis o para saber los IDs.',
    input_schema: {
      type: 'object',
      properties: {
        period:   { type: 'string', enum: ['today','week','month','all'], description: 'Periodo de análisis' },
        habit_id: { type: 'string', description: 'Si se omite, devuelve todos los hábitos con sus stats' },
      },
    },
  },
  {
    name: 'get_workout_stats',
    description: 'Obtiene estadísticas de entrenamientos, volumen y PRs.',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week','month','3months','year'] },
      },
    },
  },
  {
    name: 'get_nutrition_stats',
    description: 'Obtiene datos de nutrición y composición corporal.',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today','week','month'] },
      },
    },
  },
] as const;

export type ToolName = (typeof AI_TOOLS)[number]['name'];

export interface ToolCall {
  id: string;
  name: ToolName;
  input: Record<string, unknown>;
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
}
