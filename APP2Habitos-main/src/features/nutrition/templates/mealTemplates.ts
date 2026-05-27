import { z as zod } from 'zod';

// Inline macros for template entries (no foodItemId needed, ephemeral)
export const TemplateFoodSchema = zod.object({
  name:     zod.string(),
  quantity: zod.number(),
  serving:  zod.string(),
  calories: zod.number(),
  protein:  zod.number(),
  carbs:    zod.number(),
  fat:      zod.number(),
});
export type TemplateFood = zod.infer<typeof TemplateFoodSchema>;

export const MealTemplateSchema = zod.object({
  id:          zod.string(),
  name:        zod.string(),
  description: zod.string().optional(),
  mealType:    zod.enum(['breakfast', 'lunch', 'dinner', 'snack', 'any']),
  goal:        zod.enum(['muscle', 'fat_loss', 'balanced', 'performance', 'vegetarian']),
  totalCalories: zod.number(),
  totalProtein:  zod.number(),
  totalCarbs:    zod.number(),
  totalFat:      zod.number(),
  foods:       zod.array(TemplateFoodSchema),
  tags:        zod.array(zod.string()),
});
export type MealTemplate = zod.infer<typeof MealTemplateSchema>;

function totals(foods: TemplateFood[]): Pick<MealTemplate, 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'> {
  return {
    totalCalories: Math.round(foods.reduce((s, f) => s + f.calories, 0)),
    totalProtein:  Math.round(foods.reduce((s, f) => s + f.protein, 0)),
    totalCarbs:    Math.round(foods.reduce((s, f) => s + f.carbs, 0)),
    totalFat:      Math.round(foods.reduce((s, f) => s + f.fat, 0)),
  };
}

const t = (foods: TemplateFood[]) => totals(foods);

const BREAKFAST_MUSCLE: TemplateFood[] = [
  { name: 'Avena',                  quantity: 80,  serving: 'g', calories: 305, protein: 10, carbs: 55, fat: 6  },
  { name: 'Proteína en polvo',      quantity: 30,  serving: 'g', calories: 120, protein: 24, carbs: 3,  fat: 2  },
  { name: 'Plátano',                quantity: 1,   serving: 'unidad', calories: 89, protein: 1, carbs: 23, fat: 0 },
  { name: 'Mantequilla de cacahuete',quantity:15,  serving: 'g', calories: 90, protein: 3, carbs: 3, fat: 8   },
];

const BREAKFAST_FAT_LOSS: TemplateFood[] = [
  { name: 'Claras de huevo',        quantity: 200, serving: 'g',  calories: 104, protein: 22, carbs: 2,  fat: 0  },
  { name: 'Huevo entero',           quantity: 1,   serving: 'unidad', calories: 72, protein: 6, carbs: 0, fat: 5 },
  { name: 'Espinacas',              quantity: 100, serving: 'g',  calories: 23,  protein: 3,  carbs: 4,  fat: 0  },
  { name: 'Tomate cherry',          quantity: 100, serving: 'g',  calories: 18,  protein: 1,  carbs: 4,  fat: 0  },
];

const BREAKFAST_BALANCED: TemplateFood[] = [
  { name: 'Yogur griego 0%',        quantity: 200, serving: 'g',  calories: 118, protein: 20, carbs: 9,  fat: 0  },
  { name: 'Muesli',                 quantity: 50,  serving: 'g',  calories: 189, protein: 5,  carbs: 33, fat: 4  },
  { name: 'Frutos del bosque',      quantity: 100, serving: 'g',  calories: 57,  protein: 1,  carbs: 14, fat: 0  },
  { name: 'Almendras',              quantity: 20,  serving: 'g',  calories: 116, protein: 4,  carbs: 4,  fat: 10 },
];

const LUNCH_MUSCLE: TemplateFood[] = [
  { name: 'Arroz blanco',           quantity: 150, serving: 'g cocido', calories: 195, protein: 4, carbs: 43, fat: 0 },
  { name: 'Pechuga de pollo',       quantity: 200, serving: 'g', calories: 220, protein: 46, carbs: 0, fat: 4  },
  { name: 'Brócoli',                quantity: 200, serving: 'g', calories: 68,  protein: 6,  carbs: 14, fat: 0  },
  { name: 'Aceite de oliva',        quantity: 10,  serving: 'ml', calories: 88,  protein: 0,  carbs: 0,  fat: 10 },
];

const LUNCH_FAT_LOSS: TemplateFood[] = [
  { name: 'Pechuga de pavo',        quantity: 180, serving: 'g', calories: 198, protein: 43, carbs: 0,  fat: 2  },
  { name: 'Ensalada mixta',         quantity: 200, serving: 'g', calories: 30,  protein: 2,  carbs: 6,  fat: 0  },
  { name: 'Quinoa',                 quantity: 80,  serving: 'g seco', calories: 294, protein: 11, carbs: 53, fat: 5 },
  { name: 'Vinagreta',              quantity: 15,  serving: 'ml', calories: 45,  protein: 0,  carbs: 1,  fat: 5  },
];

const LUNCH_PERFORMANCE: TemplateFood[] = [
  { name: 'Pasta integral',         quantity: 120, serving: 'g seco', calories: 428, protein: 17, carbs: 82, fat: 2 },
  { name: 'Carne picada magra',     quantity: 150, serving: 'g', calories: 247, protein: 34, carbs: 0,  fat: 13 },
  { name: 'Tomate triturado',       quantity: 200, serving: 'g', calories: 40,  protein: 2,  carbs: 10, fat: 0  },
  { name: 'Queso rallado',          quantity: 20,  serving: 'g', calories: 79,  protein: 6,  carbs: 0,  fat: 6  },
];

const LUNCH_VEGETARIAN: TemplateFood[] = [
  { name: 'Lentejas cocidas',       quantity: 200, serving: 'g', calories: 230, protein: 18, carbs: 40, fat: 1  },
  { name: 'Arroz integral',         quantity: 100, serving: 'g cocido', calories: 123, protein: 3, carbs: 26, fat: 1 },
  { name: 'Verduras salteadas',     quantity: 200, serving: 'g', calories: 80,  protein: 3,  carbs: 16, fat: 2  },
  { name: 'Huevo duro',             quantity: 2,   serving: 'unidades', calories: 144, protein: 12, carbs: 0, fat: 10 },
];

const DINNER_MUSCLE: TemplateFood[] = [
  { name: 'Salmón',                 quantity: 200, serving: 'g', calories: 412, protein: 40, carbs: 0,  fat: 27 },
  { name: 'Batata asada',           quantity: 200, serving: 'g', calories: 172, protein: 3,  carbs: 40, fat: 0  },
  { name: 'Espárragos',             quantity: 150, serving: 'g', calories: 34,  protein: 4,  carbs: 6,  fat: 0  },
];

const DINNER_FAT_LOSS: TemplateFood[] = [
  { name: 'Merluza al vapor',       quantity: 200, serving: 'g', calories: 166, protein: 38, carbs: 0,  fat: 1  },
  { name: 'Verduras al vapor',      quantity: 300, serving: 'g', calories: 90,  protein: 5,  carbs: 18, fat: 0  },
  { name: 'Aceite de oliva virgen', quantity: 10,  serving: 'ml', calories: 88,  protein: 0,  carbs: 0,  fat: 10 },
];

const DINNER_BALANCED: TemplateFood[] = [
  { name: 'Pechuga de pollo',       quantity: 180, serving: 'g', calories: 198, protein: 42, carbs: 0,  fat: 4  },
  { name: 'Puré de patata',         quantity: 200, serving: 'g', calories: 154, protein: 4,  carbs: 30, fat: 3  },
  { name: 'Judías verdes',          quantity: 200, serving: 'g', calories: 62,  protein: 4,  carbs: 14, fat: 0  },
];

const SNACK_MUSCLE: TemplateFood[] = [
  { name: 'Requesón',               quantity: 200, serving: 'g', calories: 144, protein: 24, carbs: 6,  fat: 4  },
  { name: 'Proteína en polvo',      quantity: 30,  serving: 'g', calories: 120, protein: 24, carbs: 3,  fat: 2  },
];

const SNACK_FAT_LOSS: TemplateFood[] = [
  { name: 'Manzana',                quantity: 1,   serving: 'unidad', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Mantequilla de almendra',quantity: 15,  serving: 'g', calories: 96,  protein: 3,  carbs: 4,  fat: 9  },
];

const SNACK_PERFORMANCE: TemplateFood[] = [
  { name: 'Plátano',                quantity: 1,   serving: 'unidad', calories: 89, protein: 1, carbs: 23, fat: 0 },
  { name: 'Dátiles',                quantity: 40,  serving: 'g', calories: 112, protein: 1, carbs: 30, fat: 0  },
  { name: 'Café negro',             quantity: 1,   serving: 'taza', calories: 5, protein: 0, carbs: 1,  fat: 0  },
];

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: 'breakfast-muscle-1',
    name: 'Desayuno Volumen',
    description: 'Avena, proteína y plátano para maximizar el anabolismo matutino.',
    mealType: 'breakfast', goal: 'muscle',
    ...t(BREAKFAST_MUSCLE), foods: BREAKFAST_MUSCLE,
    tags: ['alto-proteína', 'carbohidratos', 'energía'],
  },
  {
    id: 'breakfast-fat-loss-1',
    name: 'Desayuno Déficit',
    description: 'Claras de huevo y verduras. Proteína alta, calorías bajas.',
    mealType: 'breakfast', goal: 'fat_loss',
    ...t(BREAKFAST_FAT_LOSS), foods: BREAKFAST_FAT_LOSS,
    tags: ['bajo-carbs', 'alto-proteína', 'saciante'],
  },
  {
    id: 'breakfast-balanced-1',
    name: 'Desayuno Equilibrado',
    description: 'Yogur griego con muesli y frutos rojos. Completo y nutritivo.',
    mealType: 'breakfast', goal: 'balanced',
    ...t(BREAKFAST_BALANCED), foods: BREAKFAST_BALANCED,
    tags: ['probióticos', 'antioxidantes', 'fibra'],
  },
  {
    id: 'lunch-muscle-1',
    name: 'Almuerzo Volumen',
    description: 'Pollo con arroz y brócoli. El clásico de ganancia de masa.',
    mealType: 'lunch', goal: 'muscle',
    ...t(LUNCH_MUSCLE), foods: LUNCH_MUSCLE,
    tags: ['alto-proteína', 'carbohidratos', 'clásico'],
  },
  {
    id: 'lunch-fat-loss-1',
    name: 'Almuerzo Déficit',
    description: 'Pavo con quinoa y ensalada. Nutrición completa en déficit.',
    mealType: 'lunch', goal: 'fat_loss',
    ...t(LUNCH_FAT_LOSS), foods: LUNCH_FAT_LOSS,
    tags: ['bajo-calorías', 'saciante', 'completo'],
  },
  {
    id: 'lunch-performance-1',
    name: 'Almuerzo Rendimiento',
    description: 'Pasta con carne. Carga de carbohidratos para el entreno.',
    mealType: 'lunch', goal: 'performance',
    ...t(LUNCH_PERFORMANCE), foods: LUNCH_PERFORMANCE,
    tags: ['carbohidratos', 'pre-entreno', 'energía'],
  },
  {
    id: 'lunch-vegetarian-1',
    name: 'Almuerzo Vegetariano',
    description: 'Lentejas con arroz y verduras. Proteína vegetal completa.',
    mealType: 'lunch', goal: 'vegetarian',
    ...t(LUNCH_VEGETARIAN), foods: LUNCH_VEGETARIAN,
    tags: ['vegetariano', 'legumbres', 'hierro'],
  },
  {
    id: 'dinner-muscle-1',
    name: 'Cena Volumen',
    description: 'Salmón con batata. Omega-3 y carbohidratos de recuperación.',
    mealType: 'dinner', goal: 'muscle',
    ...t(DINNER_MUSCLE), foods: DINNER_MUSCLE,
    tags: ['omega-3', 'recuperación', 'anti-inflamatorio'],
  },
  {
    id: 'dinner-fat-loss-1',
    name: 'Cena Déficit',
    description: 'Merluza al vapor y verduras. Cena ligera y completa.',
    mealType: 'dinner', goal: 'fat_loss',
    ...t(DINNER_FAT_LOSS), foods: DINNER_FAT_LOSS,
    tags: ['bajo-calorías', 'digestivo', 'ligero'],
  },
  {
    id: 'dinner-balanced-1',
    name: 'Cena Equilibrada',
    description: 'Pollo con puré y judías verdes. Cena familiar y nutritiva.',
    mealType: 'dinner', goal: 'balanced',
    ...t(DINNER_BALANCED), foods: DINNER_BALANCED,
    tags: ['equilibrado', 'familiar', 'fácil'],
  },
  {
    id: 'snack-muscle-1',
    name: 'Snack Volumen',
    description: 'Requesón y proteína. Caseína para la noche.',
    mealType: 'snack', goal: 'muscle',
    ...t(SNACK_MUSCLE), foods: SNACK_MUSCLE,
    tags: ['caseína', 'noche', 'anti-catabólico'],
  },
  {
    id: 'snack-fat-loss-1',
    name: 'Snack Déficit',
    description: 'Manzana con mantequilla de almendra. Saciante y nutritivo.',
    mealType: 'snack', goal: 'fat_loss',
    ...t(SNACK_FAT_LOSS), foods: SNACK_FAT_LOSS,
    tags: ['bajo-calorías', 'saciante', 'grasas-buenas'],
  },
  {
    id: 'snack-performance-1',
    name: 'Pre-Entreno Natural',
    description: 'Plátano, dátiles y café. Energía rápida sin suplementos.',
    mealType: 'snack', goal: 'performance',
    ...t(SNACK_PERFORMANCE), foods: SNACK_PERFORMANCE,
    tags: ['pre-entreno', 'energía-rápida', 'natural'],
  },
];

export const GOAL_TEMPLATE_LABELS: Record<MealTemplate['goal'], string> = {
  muscle:      'Volumen',
  fat_loss:    'Déficit',
  balanced:    'Equilibrado',
  performance: 'Rendimiento',
  vegetarian:  'Vegetariano',
};

export const MEAL_TYPE_LABELS: Record<MealTemplate['mealType'], string> = {
  breakfast: 'Desayuno',
  lunch:     'Almuerzo',
  dinner:    'Cena',
  snack:     'Snack',
  any:       'Cualquiera',
};
