import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Check, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { QuickAddRow } from './MealCard';
import type { AIFoodAnalysis, Meal } from '../types';
import { useNutritionStore } from '../store/nutritionStore';

// Compress image to < 1MB base64
async function compressImage(file: File, maxSizePx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSizePx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const VISION_PROMPT = `Analyze this food image and return ONLY a valid JSON object with this exact structure:
{
  "items": [
    {"name": "food name", "quantity": "description e.g. 1 cup", "calories": 250, "protein": 10, "carbs": 30, "fat": 8, "confidence": 0.85}
  ],
  "totalCalories": 250,
  "notes": "optional comment"
}
Be precise with macros. Confidence 0-1. If uncertain, lower confidence. No markdown, just JSON.`;

async function analyzeWithClaude(base64: string, apiKey: string): Promise<AIFoodAnalysis> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64.split(',')[1] } },
          { type: 'text', text: VISION_PROMPT },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '{}';
  return JSON.parse(text) as AIFoodAnalysis;
}

async function analyzeWithOpenAI(base64: string, apiKey: string): Promise<AIFoodAnalysis> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: base64, detail: 'low' } },
          { type: 'text', text: VISION_PROMPT },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(text) as AIFoodAnalysis;
}

interface PhotoAnalyzerProps {
  mealType: Meal['type'];
  onDone: () => void;
}

export function PhotoAnalyzer({ mealType, onDone }: PhotoAnalyzerProps) {
  const [stage, setStage] = useState<'pick' | 'analyzing' | 'review' | 'error'>('pick');
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIFoodAnalysis | null>(null);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { quickAdd } = useNutritionStore();

  const getApiKey = (): { key: string; provider: 'claude' | 'openai' } | null => {
    const claudeKey = localStorage.getItem('ai_claude_key');
    if (claudeKey) return { key: claudeKey, provider: 'claude' };
    const openaiKey = localStorage.getItem('ai_openai_key');
    if (openaiKey) return { key: openaiKey, provider: 'openai' };
    return null;
  };

  const processFile = async (file: File) => {
    try {
      setStage('analyzing');
      const base64 = await compressImage(file);
      setPreview(base64);

      const apiConfig = getApiKey();
      if (!apiConfig) {
        // Offline fallback — prompt user to enter macros manually
        setAnalysis({
          items: [{ name: 'Alimento detectado', quantity: '1 porción', calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }],
          totalCalories: 0,
          notes: 'Sin API key configurada. Ajusta los macros manualmente.',
        });
        setQuantities([1]);
        setStage('review');
        return;
      }

      const result = apiConfig.provider === 'claude'
        ? await analyzeWithClaude(base64, apiConfig.key)
        : await analyzeWithOpenAI(base64, apiConfig.key);

      setAnalysis(result);
      setQuantities(result.items.map(() => 1));
      setStage('review');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al analizar la imagen');
      setStage('error');
    }
  };

  const handleConfirm = async () => {
    if (!analysis) return;
    for (let i = 0; i < analysis.items.length; i++) {
      const item = analysis.items[i];
      const qty  = quantities[i] ?? 1;
      if (qty === 0) continue;
      await quickAdd({
        name: item.name,
        macros: { calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat },
        quantity: qty,
        serving: item.quantity,
        source: 'ai',
        mealType,
        photoUri: preview ?? undefined,
      });
    }
    onDone();
  };

  if (stage === 'pick') {
    return (
      <div className="space-y-4 py-2">
        <p className="text-sm text-[var(--text-secondary)] text-center">
          Fotografía tu plato y la IA detectará los macros automáticamente.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[var(--border-default)] rounded-[var(--r-xl)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <Camera size={28} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Cámara</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[var(--border-default)] rounded-[var(--r-xl)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <Upload size={28} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Galería</span>
          </button>
        </div>
        <input
          ref={cameraRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
        <input
          ref={fileRef} type="file" accept="image/*"
          className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
      </div>
    );
  }

  if (stage === 'analyzing') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        {preview && <img src={preview} alt="preview" className="w-40 h-40 object-cover rounded-[var(--r-xl)]" />}
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Analizando con IA...</span>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="space-y-4 py-4 text-center">
        <X size={32} className="mx-auto text-[var(--danger)]" />
        <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
        <Button variant="secondary" size="sm" onClick={() => setStage('pick')}>Reintentar</Button>
      </div>
    );
  }

  // Review stage
  return (
    <div className="space-y-3">
      {preview && (
        <img src={preview} alt="food" className="w-full h-36 object-cover rounded-[var(--r-xl)]" />
      )}
      {analysis?.notes && (
        <p className="text-xs text-[var(--text-tertiary)] text-center">{analysis.notes}</p>
      )}
      <div className="space-y-2">
        {analysis?.items.map((item, i) => (
          <QuickAddRow
            key={i}
            name={item.name}
            macros={{ calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }}
            confidence={item.confidence}
            quantity={quantities[i] ?? 1}
            onQuantityChange={q => setQuantities(qs => qs.map((v, j) => j === i ? q : v))}
            onRemove={() => setQuantities(qs => qs.map((v, j) => j === i ? 0 : v))}
          />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setStage('pick')}>
          Nueva foto
        </Button>
        <Button variant="primary" size="sm" className="flex-1" icon={<Check size={14} />} onClick={handleConfirm}>
          Confirmar
        </Button>
      </div>
    </div>
  );
}
