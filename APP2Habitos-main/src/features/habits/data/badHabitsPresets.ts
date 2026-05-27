import type { BadHabitCategory } from '../types/badHabits';

export interface BadHabitPreset {
  id:                  string;
  name:                string;
  emoji:               string;
  category:            BadHabitCategory;
  description:         string;
  hasSavings:          boolean;
  defaultCostPerUnit?: number;
  defaultUnitsPerDay?: number;
  facts:               string[];
  triggers:            string[];
}

export const BAD_HABIT_PRESETS: BadHabitPreset[] = [
  {
    id:       'smoking',
    name:     'Fumar',
    emoji:    '🚬',
    category: 'substance',
    description: 'Dejar el tabaco mejora la capacidad pulmonar en días y el riesgo cardiovascular en semanas.',
    hasSavings: true,
    defaultCostPerUnit: 0.35,
    defaultUnitsPerDay: 20,
    facts: [
      'A las 20 min: la presión arterial vuelve a niveles normales',
      'A las 48h: el sentido del olfato y el gusto mejoran',
      'Al mes: la función pulmonar mejora hasta un 30%',
      'Al año: el riesgo de infarto se reduce a la mitad',
    ],
    triggers: ['Estrés', 'Alcohol', 'Café', 'Después de comer', 'Social', 'Aburrimiento'],
  },
  {
    id:       'alcohol',
    name:     'Alcohol',
    emoji:    '🍺',
    category: 'substance',
    description: 'Reducir el alcohol mejora el sueño, la energía y la claridad mental en pocos días.',
    hasSavings: true,
    defaultCostPerUnit: 3.50,
    defaultUnitsPerDay: 2,
    facts: [
      'A los 3 días: mejor calidad del sueño REM',
      'A la semana: más energía y mejor hidratación',
      'Al mes: reducción del riesgo de enfermedad hepática',
      'A los 3 meses: mejora significativa en salud cardiovascular',
    ],
    triggers: ['Social', 'Estrés', 'Ansiedad', 'Hábito nocturno', 'Celebraciones'],
  },
  {
    id:       'social_media',
    name:     'Redes sociales',
    emoji:    '📱',
    category: 'digital',
    description: 'Limitar las redes sociales recupera horas de foco y reduce la ansiedad.',
    hasSavings: false,
    facts: [
      'El 40% de la ansiedad social está relacionada con el uso de redes',
      'Eliminar 30 min de scrolling = 182h al año recuperadas',
      'El FOMO disminuye en los primeros 7 días sin redes',
    ],
    triggers: ['Aburrimiento', 'Soledad', 'Ansiedad', 'Procrastinación', 'Antes de dormir'],
  },
  {
    id:       'sugar',
    name:     'Azúcar y ultraprocesados',
    emoji:    '🍬',
    category: 'food',
    description: 'Eliminar el azúcar añadida estabiliza la energía y reduce los antojos en 2 semanas.',
    hasSavings: false,
    facts: [
      'Los picos de glucosa causan el 80% de los bajones de energía de la tarde',
      'A las 2 semanas: los antojos se reducen hasta un 60%',
      'Al mes: mejora de la piel, energía y concentración',
    ],
    triggers: ['Estrés', 'Aburrimiento', 'Emociones negativas', 'Hábito social'],
  },
  {
    id:       'procrastination',
    name:     'Procrastinación',
    emoji:    '⏳',
    category: 'behavior',
    description: 'Combatir la procrastinación con rutinas claras y la técnica de los 2 minutos.',
    hasSavings: false,
    facts: [
      'El 20% de los adultos se consideran procrastinadores crónicos',
      'Empezar es el 90% del trabajo — el cerebro genera momentum al iniciar',
    ],
    triggers: ['Tareas difíciles', 'Perfeccionismo', 'Fatiga de decisión', 'Distracciones digitales'],
  },
  {
    id:       'junk_food',
    name:     'Comida basura',
    emoji:    '🍔',
    category: 'food',
    description: 'Eliminar el fast food y snacks procesados mejora la energía y la composición corporal.',
    hasSavings: true,
    defaultCostPerUnit: 8,
    defaultUnitsPerDay: 1,
    facts: [
      'Los alimentos ultraprocesados están diseñados para anular la señal de saciedad',
      'Al mes sin fast food: reducción media de 2–3 kg de grasa',
    ],
    triggers: ['Pereza para cocinar', 'Salir con amigos', 'Estrés', 'Hambre urgente'],
  },
  {
    id:       'late_night',
    name:     'Trasnochar',
    emoji:    '🌙',
    category: 'sleep',
    description: 'Acostarse tarde es uno de los hábitos que más impacta en la salud cognitiva y metabólica.',
    hasSavings: false,
    facts: [
      'Cada hora de sueño antes de las 00:00 vale el doble en calidad',
      'Dormir a horas irregulares afecta al metabolismo como el jet lag',
    ],
    triggers: ['Pantallas', 'FOMO nocturno', 'Hábito de años', 'Ansiedad'],
  },
  {
    id:       'gambling',
    name:     'Apuestas',
    emoji:    '🎰',
    category: 'behavior',
    description: 'Las apuestas activan los mismos circuitos que otras adicciones. Cada día sin jugar es una victoria.',
    hasSavings: true,
    defaultCostPerUnit: 10,
    defaultUnitsPerDay: 1,
    facts: [
      'El cerebro puede reconfigurar los circuitos de recompensa en 90 días',
      'El primer mes es el más difícil — los antojos alcanzan su pico y luego caen',
    ],
    triggers: ['Aburrimiento', 'Estrés', 'Soledad', 'Anuncios', 'Eventos deportivos'],
  },
];
