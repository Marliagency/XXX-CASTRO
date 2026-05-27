import { create } from 'zustand';
import { format } from 'date-fns';
import type { FoodItem, Meal, MealEntry, NutritionTargets, BodyWeightEntry, Macros } from '../types';
import { scaleMacros, sumMacros } from '../types';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';

const uid = () => crypto.randomUUID();
const todayStr = () => format(new Date(), 'yyyy-MM-dd');

interface NutritionState {
  foods:   FoodItem[];
  meals:   Meal[];
  targets: NutritionTargets | null;
  bodyWeight: BodyWeightEntry[];
  loaded:  boolean;

  loadFromStorage: () => Promise<void>;

  // Food library
  addFood:    (food: Omit<FoodItem, 'id' | 'createdAt'>) => Promise<FoodItem>;
  updateFood: (id: string, patch: Partial<FoodItem>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;

  // Meals
  addMeal:    (date: string, type: Meal['type']) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  addEntryToMeal: (mealId: string, entry: Omit<MealEntry, 'id' | 'addedAt'>) => Promise<void>;
  updateEntry: (mealId: string, entryId: string, patch: Partial<MealEntry>) => Promise<void>;
  removeEntry: (mealId: string, entryId: string) => Promise<void>;

  // Quick-add from AI/barcode — creates food + entry atomically
  quickAdd: (opts: {
    name: string;
    macros: Macros;
    quantity?: number;
    serving?: string;
    source: MealEntry['source'];
    mealType?: Meal['type'];
    date?: string;
    photoUri?: string;
  }) => Promise<void>;

  // History re-log
  logMealFromHistory: (meal: Meal) => Promise<void>;

  // Targets
  setTargets: (t: NutritionTargets) => Promise<void>;

  // Body weight
  logBodyWeight: (weight: number, note?: string, date?: string) => Promise<void>;
  deleteBodyWeight: (date: string) => Promise<void>;

  // Selectors
  getMealsForDate:   (date: string) => Meal[];
  getTotalsForDate:  (date: string) => Macros;
  getBodyWeightTrend: (days: number) => BodyWeightEntry[];
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  foods:      [],
  meals:      [],
  targets:    null,
  bodyWeight: [],
  loaded:     false,

  loadFromStorage: async () => {
    const [foods, meals, targets, bodyWeight] = await Promise.all([
      storage.getItem<FoodItem[]>(STORAGE_KEYS.foods),
      storage.getItem<Meal[]>(STORAGE_KEYS.meals),
      storage.getItem<NutritionTargets>(STORAGE_KEYS.nutritionTargets),
      storage.getItem<BodyWeightEntry[]>(STORAGE_KEYS.bodyWeight),
    ]);
    set({ foods: foods ?? [], meals: meals ?? [], targets: targets ?? null, bodyWeight: bodyWeight ?? [], loaded: true });
  },

  addFood: async (data) => {
    const food: FoodItem = { ...data, id: uid(), createdAt: new Date().toISOString() };
    const foods = [...get().foods, food];
    set({ foods });
    await storage.setItem(STORAGE_KEYS.foods, foods);
    return food;
  },

  updateFood: async (id, patch) => {
    const foods = get().foods.map(f => f.id === id ? { ...f, ...patch } : f);
    set({ foods });
    await storage.setItem(STORAGE_KEYS.foods, foods);
  },

  deleteFood: async (id) => {
    const foods = get().foods.filter(f => f.id !== id);
    set({ foods });
    await storage.setItem(STORAGE_KEYS.foods, foods);
  },

  addMeal: async (date, type) => {
    const meal: Meal = { id: uid(), date, type, entries: [] };
    const meals = [...get().meals, meal];
    set({ meals });
    await storage.setItem(STORAGE_KEYS.meals, meals);
    return meal;
  },

  deleteMeal: async (id) => {
    const meals = get().meals.filter(m => m.id !== id);
    set({ meals });
    await storage.setItem(STORAGE_KEYS.meals, meals);
  },

  addEntryToMeal: async (mealId, entryData) => {
    const entry: MealEntry = { ...entryData, id: uid(), addedAt: new Date().toISOString() };
    const meals = get().meals.map(m =>
      m.id === mealId ? { ...m, entries: [...m.entries, entry] } : m
    );
    set({ meals });
    await storage.setItem(STORAGE_KEYS.meals, meals);
  },

  updateEntry: async (mealId, entryId, patch) => {
    const meals = get().meals.map(m =>
      m.id === mealId
        ? { ...m, entries: m.entries.map(e => e.id === entryId ? { ...e, ...patch } : e) }
        : m
    );
    set({ meals });
    await storage.setItem(STORAGE_KEYS.meals, meals);
  },

  removeEntry: async (mealId, entryId) => {
    const meals = get().meals.map(m =>
      m.id === mealId
        ? { ...m, entries: m.entries.filter(e => e.id !== entryId) }
        : m
    );
    set({ meals });
    await storage.setItem(STORAGE_KEYS.meals, meals);
  },

  quickAdd: async ({ name, macros, quantity = 1, serving = '1 porción', source, mealType = 'snack', date, photoUri }) => {
    const d = date ?? todayStr();
    // find or create meal for that type+date
    let meal = get().meals.find(m => m.date === d && m.type === mealType);
    if (!meal) {
      meal = await get().addMeal(d, mealType);
    }
    const food: FoodItem = {
      id: uid(), name, brand: undefined, barcode: undefined,
      serving, macros, isCustom: true, source, createdAt: new Date().toISOString(),
    };
    const foods = [...get().foods, food];
    const entry: MealEntry = {
      id: uid(), foodItemId: food.id, name, quantity,
      serving, macros: scaleMacros(macros, quantity),
      addedAt: new Date().toISOString(), source,
      photoUri,
    };
    const meals = get().meals.map(m =>
      m.id === meal!.id ? { ...m, entries: [...m.entries, entry] } : m
    );
    set({ foods, meals });
    await Promise.all([
      storage.setItem(STORAGE_KEYS.foods, foods),
      storage.setItem(STORAGE_KEYS.meals, meals),
    ]);
  },

  setTargets: async (t) => {
    set({ targets: t });
    await storage.setItem(STORAGE_KEYS.nutritionTargets, t);
  },

  logBodyWeight: async (weight, note, date) => {
    const d = date ?? todayStr();
    const existing = get().bodyWeight.filter(b => b.date !== d);
    const bodyWeight = [...existing, { date: d, weight, note }].sort((a, b) => a.date.localeCompare(b.date));
    set({ bodyWeight });
    await storage.setItem(STORAGE_KEYS.bodyWeight, bodyWeight);
  },

  deleteBodyWeight: async (date) => {
    const bodyWeight = get().bodyWeight.filter(b => b.date !== date);
    set({ bodyWeight });
    await storage.setItem(STORAGE_KEYS.bodyWeight, bodyWeight);
  },

  logMealFromHistory: async (originalMeal) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newMeal: Meal = {
      ...originalMeal,
      id:      uid(),
      date:    today,
      entries: originalMeal.entries.map(e => ({ ...e, id: uid(), addedAt: new Date().toISOString() })),
    };
    const updated = [...get().meals, newMeal];
    await storage.setItem(STORAGE_KEYS.meals, updated);
    set({ meals: updated });
  },

  getMealsForDate: (date) => get().meals.filter(m => m.date === date),

  getTotalsForDate: (date) => {
    const entries = get().meals.filter(m => m.date === date).flatMap(m => m.entries);
    return sumMacros(entries);
  },

  getBodyWeightTrend: (days) => {
    return get().bodyWeight.slice(-days);
  },
}));
