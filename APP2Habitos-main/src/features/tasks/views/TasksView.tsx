import { useEffect, useState, useMemo } from 'react';
import { ListTodo, Plus, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasksStore } from '../store/tasksStore';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { Modal, EmptyState, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import type { Task } from '../types';

type TabKey = 'active' | 'done' | 'all';

export default function TasksView() {
  const {
    tasks, loaded,
    loadFromStorage, addTask, updateTask, deleteTask, completeTask,
    getOverdue, getDueToday,
  } = useTasksStore();
  const { toast } = useToast();

  const [tab,         setTab]         = useState<TabKey>('active');
  const [search,      setSearch]      = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!loaded) loadFromStorage();
  }, [loaded, loadFromStorage]);

  const overdue  = useMemo(() => getOverdue(), [tasks]);
  const dueToday = useMemo(() => getDueToday(), [tasks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list: Task[];
    if (tab === 'active') list = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
    else if (tab === 'done') list = tasks.filter(t => t.status === 'done');
    else list = tasks.filter(t => t.status !== 'archived');

    // Sort: urgent first, then by due date, then by createdAt
    list = [...list].sort((a, b) => {
      const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (a.status !== 'done' && b.status !== 'done') {
        const diff = pOrder[a.priority] - pOrder[b.priority];
        if (diff !== 0) return diff;
      }
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    if (!q) return list;
    return list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q))
    );
  }, [tasks, tab, search]);

  const openNew = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        toast('Tarea actualizada', 'success');
      } else {
        await addTask(data);
        toast('Tarea creada', 'success');
      }
      setModalOpen(false);
      setEditingTask(null);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    await completeTask(id);
    toast('¡Tarea completada!', 'success');
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    toast('Tarea eliminada', 'info');
  };

  const activeCount = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
  const doneCount   = tasks.filter(t => t.status === 'done').length;

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Tareas</h1>
          {tasks.length > 0 && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {activeCount} pendientes · {doneCount} completadas
            </p>
          )}
        </div>
        <button
          onClick={openNew}
          aria-label="Nueva tarea"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--r-lg)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Nueva
        </button>
      </div>

      {/* Alert banners */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-[var(--r-lg)] bg-[var(--danger)]/10 border border-[var(--danger)]/20">
          <AlertTriangle size={14} className="text-[var(--danger)] shrink-0" />
          <p className="text-xs text-[var(--danger)]">
            {overdue.length} tarea{overdue.length > 1 ? 's' : ''} vencida{overdue.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
      {dueToday.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-[var(--r-lg)] bg-[var(--warning)]/10 border border-[var(--warning)]/20">
          <CheckCircle2 size={14} className="text-[var(--warning)] shrink-0" />
          <p className="text-xs text-[var(--warning)]">
            {dueToday.length} tarea{dueToday.length > 1 ? 's' : ''} para hoy
          </p>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={24} />}
          title="Inbox vacío"
          description="Captura todo lo que necesitas hacer. Asigna prioridades, fechas límite y subtareas para mantener el control."
          action={{ label: 'Añadir primera tarea', onClick: openNew }}
        />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar tareas…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>

          {/* Tabs */}
          <Tabs value={tab} onChange={v => setTab(v as TabKey)}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Activas{activeCount > 0 ? ` (${activeCount})` : ''}</TabsTrigger>
              <TabsTrigger value="done">Completadas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>

            {(['active', 'done', 'all'] as TabKey[]).map(tabKey => (
              <TabsContent key={tabKey} value={tabKey}>
                {filtered.length === 0 ? (
                  <div className="text-center py-10">
                    {search ? (
                      <>
                        <Search size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                        <p className="text-sm text-[var(--text-tertiary)]">Sin resultados para "{search}"</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={24} className="mx-auto text-[var(--success)] mb-2" />
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {tabKey === 'active' ? '¡Todo al día!' : 'Sin tareas completadas aún'}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    <div className="space-y-2">
                      {filtered.map(task => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                        >
                          <TaskCard
                            task={task}
                            onComplete={handleComplete}
                            onSelect={openEdit}
                            onDelete={handleDelete}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {/* Task modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <TaskForm
            initial={editingTask}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditingTask(null); }}
            saving={saving}
          />
        </div>
      </Modal>
    </div>
  );
}
