import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Check } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { QuickAddRow } from './MealCard';
import type { AIFoodAnalysis, Meal } from '../types';
import { useNutritionStore } from '../store/nutritionStore';

// Web Speech API types not in TS lib
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const VOICE_PROMPT = (transcript: string) =>
  `Parse this food intake description and return ONLY valid JSON:
{"items":[{"name":"food name","quantity":"serving description","calories":0,"protein":0,"carbs":0,"fat":0,"confidence":0.9}],"totalCalories":0}
Description: "${transcript}"
No markdown, just JSON.`;

async function parseVoiceWithAI(transcript: string, apiKey: string, provider: 'claude' | 'openai'): Promise<AIFoodAnalysis> {
  const prompt = VOICE_PROMPT(transcript);
  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    return JSON.parse(data.content?.[0]?.text ?? '{}') as AIFoodAnalysis;
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 512, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content ?? '{}') as AIFoodAnalysis;
  }
}

interface VoiceInputProps {
  mealType: Meal['type'];
  onDone: () => void;
}

export function VoiceInput({ mealType, onDone }: VoiceInputProps) {
  const [stage, setStage] = useState<'idle' | 'listening' | 'parsing' | 'review' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AIFoodAnalysis | null>(null);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [error, setError] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const { quickAdd } = useNutritionStore();

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { setError('Tu navegador no soporta reconocimiento de voz.'); setStage('error'); return; }
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };
    rec.onerror = () => { setError('Error al escuchar. Inténtalo de nuevo.'); setStage('error'); };
    rec.onend = async () => {
      setStage('parsing');
      try {
        const claudeKey = localStorage.getItem('ai_claude_key');
        const openaiKey = localStorage.getItem('ai_openai_key');
        if (!claudeKey && !openaiKey) {
          // Fallback: create manual entry from transcript
          setAnalysis({ items: [{ name: transcript, quantity: '1 porción', calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }], totalCalories: 0 });
          setQuantities([1]);
          setStage('review');
          return;
        }
        const result = claudeKey
          ? await parseVoiceWithAI(transcript, claudeKey, 'claude')
          : await parseVoiceWithAI(transcript, openaiKey!, 'openai');
        setAnalysis(result);
        setQuantities(result.items.map(() => 1));
        setStage('review');
      } catch {
        setError('No se pudo parsear la respuesta. Inténtalo de nuevo.');
        setStage('error');
      }
    };
    recognitionRef.current = rec;
    rec.start();
    setStage('listening');
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
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
        quantity: qty, serving: item.quantity, source: 'voice', mealType,
      });
    }
    onDone();
  };

  if (!supported) {
    return (
      <div className="py-6 text-center space-y-2">
        <MicOff size={28} className="mx-auto text-[var(--text-tertiary)]" />
        <p className="text-sm text-[var(--text-tertiary)]">Reconocimiento de voz no disponible en este navegador.</p>
      </div>
    );
  }

  if (stage === 'idle' || stage === 'error') {
    return (
      <div className="space-y-4 py-2">
        <p className="text-sm text-[var(--text-secondary)] text-center">
          Di en voz alta lo que has comido, por ejemplo: "Dos huevos revueltos con tostada y café con leche".
        </p>
        {stage === 'error' && <p className="text-xs text-[var(--danger)] text-center">{error}</p>}
        <button
          onClick={startListening}
          className="w-24 h-24 mx-auto flex flex-col items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-lg block"
        >
          <Mic size={32} />
          <span className="text-xs font-medium">Hablar</span>
        </button>
      </div>
    );
  }

  if (stage === 'listening') {
    return (
      <div className="space-y-4 py-2 text-center">
        <p className="text-xs text-[var(--text-tertiary)]">Escuchando... habla ahora</p>
        <button
          onClick={stopListening}
          className="w-24 h-24 mx-auto flex flex-col items-center justify-center gap-2 rounded-full bg-[var(--danger)] text-white animate-pulse block"
        >
          <MicOff size={32} />
          <span className="text-xs font-medium">Detener</span>
        </button>
        {transcript && (
          <p className="text-sm text-[var(--text-primary)] px-4 italic">"{transcript}"</p>
        )}
      </div>
    );
  }

  if (stage === 'parsing') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-secondary)]">Interpretando con IA...</p>
        <p className="text-xs text-[var(--text-tertiary)] italic">"{transcript}"</p>
      </div>
    );
  }

  // Review stage
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-tertiary)] italic text-center">"{transcript}"</p>
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
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setStage('idle'); setTranscript(''); }}>
          Reintentar
        </Button>
        <Button variant="primary" size="sm" className="flex-1" icon={<Check size={14} />} onClick={handleConfirm}>
          Confirmar
        </Button>
      </div>
    </div>
  );
}
