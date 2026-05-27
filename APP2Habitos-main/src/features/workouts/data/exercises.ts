import type { Exercise } from '../types';

type ExerciseSeed = Omit<Exercise, 'isCustom' | 'videoUrl'>;

const seed: ExerciseSeed[] = [
  // ── PECHO ──────────────────────────────────────────────────────────────────
  { id: 'bench-press',       name: 'Press de banca',            category: 'compound',  muscleGroups: ['chest','triceps','shoulders'], equipment: 'barbell' },
  { id: 'incline-bench',     name: 'Press inclinado con barra', category: 'compound',  muscleGroups: ['chest','triceps','shoulders'], equipment: 'barbell' },
  { id: 'decline-bench',     name: 'Press declinado con barra', category: 'compound',  muscleGroups: ['chest','triceps'],            equipment: 'barbell' },
  { id: 'db-bench',          name: 'Press con mancuernas',      category: 'compound',  muscleGroups: ['chest','triceps','shoulders'], equipment: 'dumbbell' },
  { id: 'db-incline',        name: 'Press inclinado mancuernas',category: 'compound',  muscleGroups: ['chest','shoulders'],           equipment: 'dumbbell' },
  { id: 'db-fly',            name: 'Aperturas mancuernas',      category: 'isolation', muscleGroups: ['chest'],                       equipment: 'dumbbell' },
  { id: 'cable-fly',         name: 'Cruces en polea',           category: 'isolation', muscleGroups: ['chest'],                       equipment: 'cable' },
  { id: 'pushup',            name: 'Flexiones',                 category: 'compound',  muscleGroups: ['chest','triceps','core'],       equipment: 'bodyweight' },
  { id: 'dip',               name: 'Fondos en paralelas',       category: 'compound',  muscleGroups: ['chest','triceps'],             equipment: 'bodyweight' },
  { id: 'chest-press-mach',  name: 'Press de pecho máquina',    category: 'compound',  muscleGroups: ['chest','triceps'],             equipment: 'machine' },
  { id: 'pec-deck',          name: 'Pec deck / Mariposa',       category: 'isolation', muscleGroups: ['chest'],                       equipment: 'machine' },

  // ── ESPALDA ────────────────────────────────────────────────────────────────
  { id: 'deadlift',          name: 'Peso muerto',               category: 'compound',  muscleGroups: ['back','hamstrings','glutes'],  equipment: 'barbell' },
  { id: 'bent-row',          name: 'Remo con barra',            category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'barbell' },
  { id: 'pullup',            name: 'Dominadas',                 category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'bodyweight' },
  { id: 'chinup',            name: 'Dominadas supinas',         category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'bodyweight' },
  { id: 'lat-pulldown',      name: 'Jalón al pecho',            category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'cable' },
  { id: 'seated-row',        name: 'Remo en polea baja',        category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'cable' },
  { id: 'db-row',            name: 'Remo con mancuerna',        category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'dumbbell' },
  { id: 'tbar-row',          name: 'Remo en T',                 category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'barbell' },
  { id: 'face-pull',         name: 'Face pull',                 category: 'isolation', muscleGroups: ['shoulders','back'],            equipment: 'cable' },
  { id: 'straight-arm-pd',   name: 'Pullover en polea',         category: 'isolation', muscleGroups: ['back'],                        equipment: 'cable' },
  { id: 'hyperextension',    name: 'Hiperextensiones',          category: 'compound',  muscleGroups: ['back','glutes','hamstrings'],  equipment: 'machine' },
  { id: 'good-morning',      name: 'Buenos días',               category: 'compound',  muscleGroups: ['back','hamstrings'],           equipment: 'barbell' },

  // ── HOMBROS ────────────────────────────────────────────────────────────────
  { id: 'ohp',               name: 'Press militar',             category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'barbell' },
  { id: 'db-shoulder-press', name: 'Press hombros mancuernas',  category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'dumbbell' },
  { id: 'lateral-raise',     name: 'Elevaciones laterales',     category: 'isolation', muscleGroups: ['shoulders'],                   equipment: 'dumbbell' },
  { id: 'front-raise',       name: 'Elevaciones frontales',     category: 'isolation', muscleGroups: ['shoulders'],                   equipment: 'dumbbell' },
  { id: 'cable-lateral',     name: 'Elevaciones laterales cable',category:'isolation', muscleGroups: ['shoulders'],                   equipment: 'cable' },
  { id: 'rear-delt-fly',     name: 'Aperturas posteriores',     category: 'isolation', muscleGroups: ['shoulders','back'],            equipment: 'dumbbell' },
  { id: 'arnold-press',      name: 'Press Arnold',              category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'dumbbell' },
  { id: 'upright-row',       name: 'Remo al cuello',            category: 'compound',  muscleGroups: ['shoulders','back'],            equipment: 'barbell' },
  { id: 'shrug',             name: 'Encogimientos',             category: 'isolation', muscleGroups: ['back','shoulders'],            equipment: 'barbell' },

  // ── BÍCEPS ─────────────────────────────────────────────────────────────────
  { id: 'barbell-curl',      name: 'Curl con barra',            category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'barbell' },
  { id: 'db-curl',           name: 'Curl con mancuernas',       category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'dumbbell' },
  { id: 'hammer-curl',       name: 'Curl martillo',             category: 'isolation', muscleGroups: ['biceps','forearms'],           equipment: 'dumbbell' },
  { id: 'incline-curl',      name: 'Curl inclinado',            category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'dumbbell' },
  { id: 'concentration-curl',name: 'Curl concentrado',          category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'dumbbell' },
  { id: 'cable-curl',        name: 'Curl en polea',             category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'cable' },
  { id: 'preacher-curl',     name: 'Curl en banco Scott',       category: 'isolation', muscleGroups: ['biceps'],                      equipment: 'machine' },
  { id: 'ez-curl',           name: 'Curl con barra EZ',         category: 'isolation', muscleGroups: ['biceps','forearms'],           equipment: 'barbell' },

  // ── TRÍCEPS ────────────────────────────────────────────────────────────────
  { id: 'tricep-pushdown',   name: 'Extensión tríceps en polea',category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'cable' },
  { id: 'overhead-ext',      name: 'Extensión overhead tríceps',category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'dumbbell' },
  { id: 'skull-crusher',     name: 'Rompecráneos',              category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'barbell' },
  { id: 'close-grip-bench',  name: 'Press agarre cerrado',      category: 'compound',  muscleGroups: ['triceps','chest'],             equipment: 'barbell' },
  { id: 'tricep-dip',        name: 'Fondos en banco',           category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'bodyweight' },
  { id: 'kickback',          name: 'Patada de tríceps',         category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'dumbbell' },
  { id: 'rope-pushdown',     name: 'Pushdown con cuerda',       category: 'isolation', muscleGroups: ['triceps'],                     equipment: 'cable' },

  // ── PIERNAS — CUÁDRICEPS ───────────────────────────────────────────────────
  { id: 'squat',             name: 'Sentadilla',                category: 'compound',  muscleGroups: ['quads','glutes','hamstrings'], equipment: 'barbell' },
  { id: 'front-squat',       name: 'Sentadilla frontal',        category: 'compound',  muscleGroups: ['quads','core'],                equipment: 'barbell' },
  { id: 'goblet-squat',      name: 'Sentadilla goblet',         category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'kettlebell' },
  { id: 'hack-squat',        name: 'Hack squat máquina',        category: 'compound',  muscleGroups: ['quads'],                       equipment: 'machine' },
  { id: 'leg-press',         name: 'Prensa de piernas',         category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'machine' },
  { id: 'leg-extension',     name: 'Extensión de cuádriceps',   category: 'isolation', muscleGroups: ['quads'],                       equipment: 'machine' },
  { id: 'lunge',             name: 'Zancadas',                  category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'bodyweight' },
  { id: 'db-lunge',          name: 'Zancadas con mancuernas',   category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'dumbbell' },
  { id: 'bulgarian-squat',   name: 'Sentadilla búlgara',        category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'dumbbell' },
  { id: 'sissy-squat',       name: 'Sissy squat',               category: 'isolation', muscleGroups: ['quads'],                       equipment: 'bodyweight' },

  // ── PIERNAS — ISQUIOTIBIALES / GLÚTEOS ────────────────────────────────────
  { id: 'rdl',               name: 'Peso muerto rumano',        category: 'compound',  muscleGroups: ['hamstrings','glutes'],         equipment: 'barbell' },
  { id: 'db-rdl',            name: 'RDL con mancuernas',        category: 'compound',  muscleGroups: ['hamstrings','glutes'],         equipment: 'dumbbell' },
  { id: 'leg-curl',          name: 'Curl femoral tumbado',      category: 'isolation', muscleGroups: ['hamstrings'],                  equipment: 'machine' },
  { id: 'seated-leg-curl',   name: 'Curl femoral sentado',      category: 'isolation', muscleGroups: ['hamstrings'],                  equipment: 'machine' },
  { id: 'hip-thrust',        name: 'Hip thrust',                category: 'compound',  muscleGroups: ['glutes','hamstrings'],         equipment: 'barbell' },
  { id: 'glute-bridge',      name: 'Puente de glúteos',         category: 'compound',  muscleGroups: ['glutes'],                      equipment: 'bodyweight' },
  { id: 'cable-kickback',    name: 'Kickback en polea',         category: 'isolation', muscleGroups: ['glutes'],                      equipment: 'cable' },
  { id: 'nordic-curl',       name: 'Nordic curl',               category: 'isolation', muscleGroups: ['hamstrings'],                  equipment: 'bodyweight' },
  { id: 'sumo-deadlift',     name: 'Peso muerto sumo',          category: 'compound',  muscleGroups: ['hamstrings','glutes','back'],  equipment: 'barbell' },
  { id: 'stiff-deadlift',    name: 'Peso muerto piernas rígidas',category:'compound',  muscleGroups: ['hamstrings','glutes'],         equipment: 'barbell' },

  // ── PANTORRILLAS ───────────────────────────────────────────────────────────
  { id: 'standing-calf',     name: 'Elevación de talones de pie',category:'isolation', muscleGroups: ['calves'],                      equipment: 'machine' },
  { id: 'seated-calf',       name: 'Elevación de talones sentado',category:'isolation',muscleGroups: ['calves'],                      equipment: 'machine' },
  { id: 'calf-raise-db',     name: 'Elevación talones mancuernas',category:'isolation',muscleGroups: ['calves'],                      equipment: 'dumbbell' },
  { id: 'donkey-calf',       name: 'Donkey calf raise',         category: 'isolation', muscleGroups: ['calves'],                      equipment: 'machine' },

  // ── CORE ───────────────────────────────────────────────────────────────────
  { id: 'crunch',            name: 'Crunch abdominal',          category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'plank',             name: 'Plancha',                   category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'side-plank',        name: 'Plancha lateral',           category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'hanging-leg-raise', name: 'Elevación de piernas colgado',category:'core',     muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'cable-crunch',      name: 'Crunch en polea',           category: 'core',      muscleGroups: ['core'],                        equipment: 'cable' },
  { id: 'russian-twist',     name: 'Giro ruso',                 category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'ab-wheel',          name: 'Rueda abdominal',           category: 'core',      muscleGroups: ['core'],                        equipment: 'other' },
  { id: 'dead-bug',          name: 'Dead bug',                  category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'wood-chop',         name: 'Leñador en polea',          category: 'core',      muscleGroups: ['core'],                        equipment: 'cable' },
  { id: 'pallof-press',      name: 'Pallof press',              category: 'core',      muscleGroups: ['core'],                        equipment: 'cable' },
  { id: 'dragon-flag',       name: 'Dragon flag',               category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'bicycle-crunch',    name: 'Crunch bicicleta',          category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'v-up',              name: 'V-up',                      category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },
  { id: 'toe-touch',         name: 'Toque de pies tumbado',     category: 'core',      muscleGroups: ['core'],                        equipment: 'bodyweight' },

  // ── CARDIO ─────────────────────────────────────────────────────────────────
  { id: 'treadmill',         name: 'Cinta de correr',           category: 'cardio',    muscleGroups: ['cardio'],                      equipment: 'machine' },
  { id: 'bike',              name: 'Bicicleta estática',        category: 'cardio',    muscleGroups: ['cardio'],                      equipment: 'machine' },
  { id: 'rowing-machine',    name: 'Remo ergómetro',            category: 'cardio',    muscleGroups: ['cardio','back'],               equipment: 'machine' },
  { id: 'elliptical',        name: 'Elíptica',                  category: 'cardio',    muscleGroups: ['cardio'],                      equipment: 'machine' },
  { id: 'jump-rope',         name: 'Saltar a la comba',         category: 'cardio',    muscleGroups: ['cardio','calves'],             equipment: 'other' },
  { id: 'burpee',            name: 'Burpee',                    category: 'cardio',    muscleGroups: ['full_body'],                   equipment: 'bodyweight' },
  { id: 'run-outdoor',       name: 'Correr (exterior)',         category: 'cardio',    muscleGroups: ['cardio'],                      equipment: 'other' },
  { id: 'cycling-outdoor',   name: 'Ciclismo (exterior)',       category: 'cardio',    muscleGroups: ['cardio'],                      equipment: 'other' },
  { id: 'hiit',              name: 'HIIT',                      category: 'cardio',    muscleGroups: ['full_body'],                   equipment: 'bodyweight' },
  { id: 'stairmaster',       name: 'Escaladora',                category: 'cardio',    muscleGroups: ['cardio','glutes'],             equipment: 'machine' },

  // ── MOVILIDAD ──────────────────────────────────────────────────────────────
  { id: 'hip-flexor-stretch',name: 'Estiramiento flexor cadera',category:'mobility',   muscleGroups: ['full_body'],                   equipment: 'bodyweight' },
  { id: 'pigeon-pose',       name: 'Postura del palomo',        category: 'mobility',  muscleGroups: ['glutes'],                      equipment: 'bodyweight' },
  { id: 'cat-cow',           name: 'Gato-vaca',                 category: 'mobility',  muscleGroups: ['back'],                        equipment: 'bodyweight' },
  { id: 'thoracic-rotation', name: 'Rotación torácica',         category: 'mobility',  muscleGroups: ['back'],                        equipment: 'bodyweight' },
  { id: 'couch-stretch',     name: 'Couch stretch',             category: 'mobility',  muscleGroups: ['quads'],                       equipment: 'bodyweight' },
  { id: 'world-greatest',    name: 'World\'s Greatest Stretch', category: 'mobility',  muscleGroups: ['full_body'],                   equipment: 'bodyweight' },
  { id: 'ankle-mobility',    name: 'Movilidad de tobillo',      category: 'mobility',  muscleGroups: ['calves'],                      equipment: 'bodyweight' },

  // ── POTENCIA / OLÍMPICO ────────────────────────────────────────────────────
  { id: 'clean',             name: 'Clean (arrancada parcial)', category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'barbell' },
  { id: 'power-clean',       name: 'Power clean',              category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'barbell' },
  { id: 'snatch',            name: 'Snatch (dos tiempos)',      category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'barbell' },
  { id: 'kb-swing',          name: 'Kettlebell swing',          category: 'compound',  muscleGroups: ['glutes','hamstrings','back'],  equipment: 'kettlebell' },
  { id: 'kb-clean',          name: 'Kettlebell clean',          category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'kettlebell' },
  { id: 'thruster',          name: 'Thruster',                  category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'barbell' },
  { id: 'push-press',        name: 'Push press',                category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'barbell' },
  { id: 'box-jump',          name: 'Salto al cajón',            category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'other' },
  { id: 'broad-jump',        name: 'Salto horizontal',          category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'bodyweight' },

  // ── BODYWEIGHT COMPUESTOS ──────────────────────────────────────────────────
  { id: 'pullup-wide',       name: 'Dominadas agarre ancho',    category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'bodyweight' },
  { id: 'pushup-wide',       name: 'Flexiones agarre ancho',    category: 'compound',  muscleGroups: ['chest','triceps'],             equipment: 'bodyweight' },
  { id: 'diamond-pushup',    name: 'Flexiones diamante',        category: 'compound',  muscleGroups: ['triceps','chest'],             equipment: 'bodyweight' },
  { id: 'pike-pushup',       name: 'Flexiones en pica',         category: 'compound',  muscleGroups: ['shoulders'],                   equipment: 'bodyweight' },
  { id: 'inverted-row',      name: 'Remo invertido',            category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'bodyweight' },
  { id: 'muscle-up',         name: 'Muscle-up',                 category: 'compound',  muscleGroups: ['back','chest','triceps'],      equipment: 'bodyweight' },
  { id: 'pistol-squat',      name: 'Sentadilla pistola',        category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'bodyweight' },
  { id: 'nordic-hamstring',  name: 'Nordic hamstring',          category: 'compound',  muscleGroups: ['hamstrings'],                  equipment: 'bodyweight' },
  { id: 'step-up',           name: 'Step-up al cajón',          category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'bodyweight' },

  // ── ANTEBRAZOS / GRIP ──────────────────────────────────────────────────────
  { id: 'wrist-curl',        name: 'Curl de muñeca',            category: 'isolation', muscleGroups: ['forearms'],                    equipment: 'barbell' },
  { id: 'reverse-curl',      name: 'Curl inverso',              category: 'isolation', muscleGroups: ['forearms','biceps'],           equipment: 'barbell' },
  { id: 'farmer-walk',       name: 'Caminata del granjero',     category: 'compound',  muscleGroups: ['forearms','full_body'],        equipment: 'dumbbell' },
  { id: 'plate-pinch',       name: 'Pinch grip disco',          category: 'isolation', muscleGroups: ['forearms'],                    equipment: 'other' },

  // ── MÁQUINAS ───────────────────────────────────────────────────────────────
  { id: 'smith-squat',       name: 'Sentadilla en Smith',       category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'machine' },
  { id: 'smith-bench',       name: 'Press en Smith',            category: 'compound',  muscleGroups: ['chest','triceps'],             equipment: 'machine' },
  { id: 'smith-row',         name: 'Remo en Smith',             category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'machine' },
  { id: 'assisted-pullup',   name: 'Dominadas asistidas',       category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'machine' },
  { id: 'adductor-mach',     name: 'Aductor máquina',           category: 'isolation', muscleGroups: ['quads'],                       equipment: 'machine' },
  { id: 'abductor-mach',     name: 'Abductor máquina',          category: 'isolation', muscleGroups: ['glutes'],                      equipment: 'machine' },
  { id: 'chest-supported-row',name:'Remo pecho apoyado',        category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'machine' },
  { id: 'reverse-fly-mach',  name: 'Aperturas posteriores máquina',category:'isolation',muscleGroups:['shoulders','back'],            equipment: 'machine' },
  { id: 'shoulder-press-mach',name:'Press hombros máquina',     category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'machine' },
  { id: 'low-row-mach',      name: 'Remo bajo máquina',         category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'machine' },

  // ── KETTLEBELL ESPECÍFICOS ─────────────────────────────────────────────────
  { id: 'kb-goblet-squat',   name: 'Sentadilla goblet KB',      category: 'compound',  muscleGroups: ['quads','glutes'],              equipment: 'kettlebell' },
  { id: 'kb-press',          name: 'Press KB una mano',         category: 'compound',  muscleGroups: ['shoulders','triceps'],         equipment: 'kettlebell' },
  { id: 'kb-row',            name: 'Remo KB una mano',          category: 'compound',  muscleGroups: ['back','biceps'],               equipment: 'kettlebell' },
  { id: 'kb-snatch',         name: 'Snatch KB',                 category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'kettlebell' },
  { id: 'kb-turkish-getup',  name: 'Turkish get-up KB',         category: 'compound',  muscleGroups: ['full_body'],                   equipment: 'kettlebell' },
  { id: 'kb-windmill',       name: 'Windmill KB',               category: 'compound',  muscleGroups: ['core','shoulders'],            equipment: 'kettlebell' },
  { id: 'kb-halo',           name: 'Halo KB',                   category: 'mobility',  muscleGroups: ['shoulders','core'],            equipment: 'kettlebell' },
];

export const EXERCISES: Exercise[] = seed.map(e => ({
  ...e,
  isCustom: false,
  videoUrl: null,
}));

export const EXERCISE_MAP = new Map<string, Exercise>(EXERCISES.map(e => [e.id, e]));
