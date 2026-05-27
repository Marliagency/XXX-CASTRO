import { useState } from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { Button } from '../../../shared/components/ui';
import type { Meal } from '../types';

interface ManualFoodFormProps {
  mealType: Meal['type'];
  date: string;
  onDone: () => void;
}

function NumField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-tertiary)]"
      />
    </div>
  );
}

export function ManualFoodForm({ mealType, date, onDone }: ManualFoodFormProps) {
  const { addMeal, getMealsForDate, quickAdd } = useNutritionStore();

  const [name,     setName]     = useState('');
  const [calories, setCalories] = useState('');
  const [protein,  setProtein]  = useState('');
  const [carbs,    setCarbs]    = useState('');
  const [fat,      setFat]      = useState('');
  const [serving,  setServing]  = useState('1 porción');
  const [saving,   setSaving]   = useState(false);

  const kcal = parseFloat(calories) || 0;
  const prot = parseFloat(protein)  || 0;
  const carb = parseFloat(carbs)    || 0;
  const f    = parseFloat(fat)      || 0;

  const autoCalories = kcal === 0 && (prot + carb + f) > 0
    ? Math.round(prot * 4 + carb * 4 + f * 9)
    : kcal;

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    let meal = getMealsForDate(date).find(m => m.type === mealType);
    if (!meal) meal = await addMeal(date, mealType);

    await quickAdd({
      name:     name.trim(),
      macros:   { calories: autoCalories, protein: prot, carbs: carb, fat: f },
      quantity: 1,
      serving:  serving.trim() || '1 porción',
      source:   'manual',
      mealType,
      date,
    });

    setSaving(false);
    onDone();
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Nombre del alimento</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej. Pechuga de pollo, arroz integral…"
          autoFocus
          className="h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      {/* Serving */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Descripción de porción</label>
        <input
          type="text"
          value={serving}
          onChange={e => setServing(e.target.value)}
          placeholder="1 porción, 100g, 1 taza…"
          className="h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Calorías (kcal)" value={calories} onChange={setCalories} placeholder="250" />
        <NumField label="Proteínas (g)"   value={protein}  onChange={setProtein}  placeholder="25" />
        <NumField label="Carbohidratos (g)" value={carbs}  onChange={setCarbs}    placeholder="30" />
        <NumField label="Grasas (g)"      value={fat}      onChange={setFat}      placeholder="8" />
      </div>

      {/* Auto-calc hint */}
      {kcal === 0 && autoCalories > 0 && (
        <p className="text-[10px] text-[var(--text-tertiary)] text-center">
          Calorías calculadas automáticamente: <strong>{autoCalories} kcal</strong>
        </p>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={handleSave}
        disabled={!canSave || saving}
      >
        {saving ? 'Guardando…' : 'Añadir alimento'}
      </Button>
    </div>
  );
}
