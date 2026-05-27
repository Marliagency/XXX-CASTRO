import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Settings, Trash2, AlertCircle, User, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Spinner } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { useGoalsStore } from '../../goals/store/goalsStore';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { useJournalStore } from '../../journal/store/journalStore';
import { INTENT_LABELS } from '../../goals/types';
import { AI_TOOLS, type ToolCall, type ToolResult } from '../tools';
import { executeToolCall } from '../toolExecutor';
import { fmt } from '../../../shared/utils/fmt';

const AI_CLAUDE_KEY = 'ai_claude_key';
const AI_OPENAI_KEY = 'ai_openai_key';

type Model = 'claude' | 'openai';
type MsgRole = 'user' | 'assistant';

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface TextBlock { type: 'text'; text: string; }

interface Message {
  id: string;
  role: MsgRole;
  content: string;
  timestamp: string;
  model?: Model;
  error?: boolean;
  toolCalls?: ToolCall[];
  toolResults?: { name: string; success: boolean; summary: string }[];
}

function buildSystemPrompt(ctx: {
  goalLabel?: string;
  goalSummary?: string;
  calorieTarget?: number;
  proteinTarget?: number;
  habitNames: string[];
  avgCalories7d: number | null;
  workoutsThisWeek: number;
  avgMood7d: number | null;
  todayCalories: number | null;
}): string {
  const lines = [
    'Eres un asistente personal de productividad y bienestar integrado en APP2Habitos.',
    'Puedes gestionar hábitos directamente usando las herramientas disponibles.',
    'Responde SIEMPRE en español. Sé conciso y orientado a la acción.',
    `Fecha y hora: ${new Date().toLocaleString('es-ES')}`,
    '',
    '## Contexto del usuario',
  ];
  if (ctx.goalLabel) lines.push(`Objetivo activo: ${ctx.goalLabel}${ctx.goalSummary ? ' — ' + ctx.goalSummary : ''}`);
  if (ctx.calorieTarget) lines.push(`Target calorías: ${fmt(ctx.calorieTarget, { integer: true })} kcal/día`);
  if (ctx.proteinTarget) lines.push(`Target proteína: ${fmt(ctx.proteinTarget, { decimals: 0 })}g/día`);
  if (ctx.habitNames.length) lines.push(`Hábitos activos (${ctx.habitNames.length}): ${ctx.habitNames.slice(0, 8).join(', ')}`);
  if (ctx.avgCalories7d !== null) lines.push(`Calorías media 7d: ${fmt(ctx.avgCalories7d, { integer: true })} kcal`);
  if (ctx.todayCalories !== null) lines.push(`Calorías hoy: ${fmt(ctx.todayCalories, { integer: true })} kcal`);
  lines.push(`Entrenos esta semana: ${ctx.workoutsThisWeek}`);
  if (ctx.avgMood7d !== null) lines.push(`Ánimo medio 7d: ${fmt(ctx.avgMood7d, { decimals: 1 })}/5`);
  lines.push('', '## Instrucciones críticas');
  lines.push('- Para create_habit o bulk_create_habits: úsalas directamente sin pedir más confirmación salvo que haya ambigüedad.');
  lines.push('- Para delete_habit: pide confirmación explícita antes de ejecutar.');
  lines.push('- Usa get_habit_stats para obtener los IDs antes de update/archive/delete.');
  lines.push('- Todos los porcentajes con máximo 2 decimales.');
  return lines.join('\n');
}

const QUICK_PROMPTS = [
  { icon: '✨', label: 'Añadir hábitos', prompt: 'Analiza mis hábitos y crea 3 hábitos de alto impacto que me falten según mis objetivos.' },
  { icon: '🌅', label: 'Rutina matutina', prompt: 'Crea una rutina matutina de 5 hábitos entre 6am y 9am para mejorar mi productividad. Créalos directamente.' },
  { icon: '📊', label: 'Analizar semana', prompt: 'Analiza mi rendimiento de esta semana en hábitos, entreno y nutrición. Dime qué ha ido bien y qué mejorar.' },
  { icon: '🌙', label: 'Rutina nocturna', prompt: 'Crea una rutina nocturna de 3-4 hábitos entre 21:00 y 23:00 para mejorar mi descanso.' },
  { icon: '💪', label: 'Consejo de entreno', prompt: 'Basándote en mi historial de entrenos, dame un consejo específico para mejorar.' },
  { icon: '🥗', label: 'Nutrición', prompt: 'Analiza mi nutrición de esta semana y dame 3 recomendaciones concretas para mejorar.' },
];

const uid = () => crypto.randomUUID();

async function callClaudeWithTools(
  messages: { role: string; content: unknown }[],
  apiKey: string,
  systemPrompt: string,
): Promise<{ text: string; toolCalls: ToolCall[]; stopReason: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      tools: AI_TOOLS,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Error ${res.status}`);
  }

  const data = await res.json() as {
    content: (TextBlock | ToolUseBlock)[];
    stop_reason: string;
  };

  const text = data.content
    .filter((b): b is TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  const toolCalls: ToolCall[] = data.content
    .filter((b): b is ToolUseBlock => b.type === 'tool_use')
    .map(b => ({ id: b.id, name: b.name as ToolCall['name'], input: b.input }));

  return { text, toolCalls, stopReason: data.stop_reason };
}

async function callClaudeWithResults(
  messages: { role: string; content: unknown }[],
  toolResults: ToolResult[],
  apiKey: string,
  systemPrompt: string,
): Promise<string> {
  const messagesWithResults = [
    ...messages,
    {
      role: 'user',
      content: toolResults.map(r => ({
        type: 'tool_result',
        tool_use_id: r.tool_use_id,
        content: r.content,
      })),
    },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: AI_TOOLS,
      messages: messagesWithResults,
    }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json() as { content: (TextBlock | ToolUseBlock)[] };
  return data.content
    .filter((b): b is TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  systemPrompt: string,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'system', content: systemPrompt }, ...messages.filter(m => m.role !== 'system')],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? '';
}

function ToolCallBadge({ calls, results }: { calls: ToolCall[]; results?: Message['toolResults'] }) {
  const [open, setOpen] = useState(false);
  if (!calls.length) return null;
  return (
    <div className="mt-2 rounded-xl border border-[var(--border-subtle)] overflow-hidden text-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {results?.every(r => r.success)
            ? <CheckCircle size={11} className="text-[var(--success)]" />
            : <AlertCircle size={11} className="text-[var(--warning)]" />
          }
          {calls.length} acción{calls.length > 1 ? 'es' : ''} ejecutada{calls.length > 1 ? 's' : ''}
        </span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div className="px-3 py-2 space-y-1 bg-[var(--bg-surface)]">
          {calls.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              {results?.[i]?.success
                ? <CheckCircle size={10} className="text-[var(--success)] shrink-0" />
                : <AlertCircle size={10} className="text-[var(--warning)] shrink-0" />
              }
              <code className="text-[var(--accent)]">{c.name}</code>
              <span className="text-[var(--text-tertiary)] truncate">{results?.[i]?.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-[var(--accent)]' : msg.error ? 'bg-[var(--danger-subtle)]' : 'bg-[var(--bg-hover)]'
      }`}>
        {isUser
          ? <User size={13} className="text-white" />
          : msg.error
            ? <AlertCircle size={13} className="text-[var(--danger)]" />
            : <Bot size={13} className="text-[var(--text-secondary)]" />
        }
      </div>
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--accent)] text-white rounded-tr-sm'
            : msg.error
              ? 'bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger)]/20 rounded-tl-sm'
              : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
        }`}>
          {msg.content || (msg.toolCalls?.length ? '…' : '')}
        </div>
        {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
          <ToolCallBadge calls={msg.toolCalls} results={msg.toolResults} />
        )}
        <span className="text-[9px] text-[var(--text-tertiary)] px-1">
          {format(new Date(msg.timestamp), 'HH:mm')}
          {msg.model && !isUser && ` · ${msg.model === 'claude' ? 'Claude Haiku' : 'GPT-4o mini'}`}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--bg-hover)] shrink-0">
        <Bot size={13} className="text-[var(--text-secondary)]" />
      </div>
      <div className="px-3.5 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm flex gap-1 items-center shadow-sm">
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
        ))}
      </div>
    </motion.div>
  );
}

export default function AssistantView() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const claudeKey = localStorage.getItem(AI_CLAUDE_KEY) ?? '';
  const openaiKey = localStorage.getItem(AI_OPENAI_KEY) ?? '';
  const hasKey    = !!(claudeKey || openaiKey);

  const { goal }                  = useGoalsStore();
  const habitsStore               = useHabitsStore();
  const nutritionStore            = useNutritionStore();
  const { workouts }              = useWorkoutsStore();
  const { getAverageMood }        = useJournalStore();

  const preferredModel: Model = claudeKey ? 'claude' : 'openai';
  const [model,    setModel]    = useState<Model>(preferredModel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const buildContext = useCallback(() => {
    const today  = format(new Date(), 'yyyy-MM-dd');
    const cutoff = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const last7  = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const calReadings = last7.map(d => nutritionStore.getTotalsForDate(d).calories).filter(c => c > 0);
    const todayKcal   = nutritionStore.getTotalsForDate(today).calories;
    const workoutsThisWeek = workouts.filter(w => w.date >= cutoff && w.date <= today).length;
    return buildSystemPrompt({
      goalLabel:        goal ? INTENT_LABELS[goal.intent] : undefined,
      goalSummary:      goal?.derived.weeklyGoalSummary,
      calorieTarget:    goal?.derived.calorieTarget ?? nutritionStore.targets?.calories,
      proteinTarget:    goal?.derived.proteinG ?? nutritionStore.targets?.protein,
      habitNames:       habitsStore.getActiveHabits().map(h => h.name),
      avgCalories7d:    calReadings.length ? Math.round(calReadings.reduce((a, b) => a + b, 0) / calReadings.length) : null,
      workoutsThisWeek,
      avgMood7d:        getAverageMood(7),
      todayCalories:    todayKcal > 0 ? Math.round(todayKcal) : null,
    });
  }, [goal, habitsStore, nutritionStore, workouts, getAverageMood]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !hasKey) return;

    const activeKey = model === 'claude' ? claudeKey : openaiKey;
    if (!activeKey) {
      toast(`Sin clave API para ${model === 'claude' ? 'Claude' : 'OpenAI'}`, 'error');
      return;
    }

    const systemPrompt = buildContext();

    const userMsg: Message = { id: uid(), role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role as string, content: m.content }));

      if (model === 'claude') {
        // First call — may return tool_use
        const { text: replyText, toolCalls, stopReason } = await callClaudeWithTools(
          history as { role: string; content: unknown }[],
          activeKey,
          systemPrompt,
        );

        if (stopReason === 'tool_use' && toolCalls.length > 0) {
          // Show pending message
          const pendingMsg: Message = {
            id: uid(), role: 'assistant', content: replyText,
            timestamp: new Date().toISOString(), model, toolCalls,
          };
          setMessages(prev => [...prev, pendingMsg]);

          // Execute tools
          const results: ToolResult[] = [];
          const summaries: Message['toolResults'] = [];

          for (const call of toolCalls) {
            const result = await executeToolCall(call, habitsStore, { workouts }, nutritionStore);
            results.push(result);
            const parsed = JSON.parse(result.content) as Record<string, unknown>;
            summaries.push({
              name: call.name,
              success: parsed.success !== false,
              summary: String(parsed.message ?? parsed.plan_summary ?? parsed.created_count ?? ''),
            });
          }

          // Update pending message with results
          setMessages(prev => prev.map(m => m.id === pendingMsg.id ? { ...m, toolResults: summaries } : m));

          // Send tool results back for final response
          const historyWithAssistant: { role: string; content: unknown }[] = [
            ...history,
            { role: 'assistant', content: [
              ...(replyText ? [{ type: 'text', text: replyText }] : []),
              ...toolCalls.map(c => ({ type: 'tool_use', id: c.id, name: c.name, input: c.input })),
            ]},
          ];
          const finalReply = await callClaudeWithResults(historyWithAssistant, results, activeKey, systemPrompt);

          if (finalReply.trim()) {
            setMessages(prev => [...prev, {
              id: uid(), role: 'assistant', content: finalReply,
              timestamp: new Date().toISOString(), model,
            }]);
          }
        } else {
          setMessages(prev => [...prev, {
            id: uid(), role: 'assistant', content: replyText,
            timestamp: new Date().toISOString(), model,
          }]);
        }
      } else {
        const reply = await callOpenAI(history as { role: string; content: string }[], activeKey, systemPrompt);
        setMessages(prev => [...prev, {
          id: uid(), role: 'assistant', content: reply,
          timestamp: new Date().toISOString(), model,
        }]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant', content: errMsg,
        timestamp: new Date().toISOString(), error: true,
      }]);
      toast('Error al enviar mensaje', 'error');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [messages, model, claudeKey, openaiKey, hasKey, loading, toast, buildContext, habitsStore, workouts, nutritionStore]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  if (!hasKey) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-[var(--accent-subtle)] rounded-full flex items-center justify-center">
          <Bot size={28} className="text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Asistente IA</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">
            Configura tu clave API de Claude o OpenAI en Ajustes para activar el asistente. Con Claude puedes crear hábitos directamente desde el chat.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 h-11 px-6 bg-[var(--accent)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity"
        >
          <Settings size={15} /> Ir a Ajustes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-xl flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">Asistente</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
              {model === 'claude' ? 'Claude Haiku · Tool Use' : 'GPT-4o mini'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="segmented-control" style={{ padding: '2px' }}>
            {(claudeKey ? ['claude' as Model] : []).concat(openaiKey ? ['openai' as Model] : []).map(m => (
              <button key={m} onClick={() => setModel(m)} className={model === m ? 'active' : ''}>
                {m === 'claude' ? 'Claude' : 'GPT-4o'}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors">
              <Trash2 size={13} className="text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-4 space-y-5">
            <div className="text-center pt-4">
              <div className="w-14 h-14 bg-[var(--accent-subtle)] rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot size={22} className="text-[var(--accent)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">¿En qué te ayudo?</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {model === 'claude' ? 'Puedo crear y gestionar hábitos directamente.' : 'Pregúntame sobre hábitos, entrenos o nutrición.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.prompt)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-left text-xs text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-all shadow-sm">
                  <span className="shrink-0 text-base">{p.icon}</span>
                  <span className="font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe algo… (Enter para enviar)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-focus)] disabled:opacity-50 max-h-28 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
          >
            {loading ? <Spinner size="sm" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
