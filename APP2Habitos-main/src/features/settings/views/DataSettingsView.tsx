import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../../shared/components/layout/PageHeader';
import { Button } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import { useAuthStore } from '../../auth/store/authStore';

async function exportAllData(): Promise<Record<string, unknown>> {
  const entries: Record<string, unknown> = {};
  for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
    const val = await storage.getItem(storageKey);
    if (val !== null) entries[key] = val;
  }
  return entries;
}

export default function DataSettingsView() {
  const { toast }           = useToast();
  const logout              = useAuthStore(s => s.logout);
  const [exporting, setExp] = useState(false);
  const [importing, setImp] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  const handleExport = async () => {
    setExp(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `qyro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Datos exportados correctamente', 'success');
    } catch {
      toast('Error al exportar datos', 'error');
    } finally {
      setExp(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setImp(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Record<string, unknown>;
        const storageMap = STORAGE_KEYS as Record<string, string>;
        let count = 0;
        for (const [key, val] of Object.entries(data)) {
          const storageKey = storageMap[key];
          if (storageKey) {
            await storage.setItem(storageKey, val);
            count++;
          }
        }
        toast(`${count} secciones importadas. Recarga la app para ver los cambios.`, 'success');
      } catch {
        toast('Archivo inválido o corrupto', 'error');
      } finally {
        setImp(false);
      }
    };
    input.click();
  };

  const handleDeleteAll = async () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }
    // Step 2 — confirmed
    try {
      await storage.clear();
      await logout();
      toast('Todos los datos eliminados', 'info');
    } catch {
      toast('Error al eliminar datos', 'error');
    }
  };

  return (
    <div className="page-content pb-24">
      <PageHeader title="Datos" backButton />

      <div className="space-y-6 mt-2">
        {/* Export */}
        <div className="section-group">
          <p className="section-header">Exportar datos</p>
          <p className="section-footer" style={{ paddingBottom: 8 }}>
            Descarga una copia de seguridad con todos tus datos en formato JSON.
          </p>
          <div className="section-body px-4 py-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              loading={exporting}
              onClick={handleExport}
            >
              <Download size={18} />
              Exportar copia de seguridad
            </Button>
          </div>
        </div>

        {/* Import */}
        <div className="section-group">
          <p className="section-header">Importar datos</p>
          <p className="section-footer" style={{ paddingBottom: 8 }}>
            Restaura desde un archivo de copia de seguridad de QYRO. Esto sobrescribirá los datos existentes.
          </p>
          <div className="section-body px-4 py-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              loading={importing}
              onClick={handleImport}
            >
              <Upload size={18} />
              Importar desde archivo
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="section-group" style={{ borderColor: 'var(--color-danger, #ef4444)' }}>
          <p className="section-header" style={{ color: 'var(--color-danger, #ef4444)' }}>
            Zona de peligro
          </p>
          <div className="section-body px-4 py-4 space-y-4">
            {deleteStep === 0 && (
              <button
                onClick={handleDeleteAll}
                className="w-full flex items-center gap-3 p-3 rounded-[var(--r-xl)] border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
              >
                <Trash2 size={18} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Eliminar todos los datos</p>
                  <p className="text-xs text-red-500">Esta acción no se puede deshacer</p>
                </div>
              </button>
            )}

            {deleteStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-[var(--r-xl)] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Se eliminarán <strong>todos</strong> tus hábitos, entrenamientos, entradas de diario, tareas y configuración. Tu cuenta también se cerrará.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDeleteStep(0)}>
                    Cancelar
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={handleDeleteAll}>
                    Confirmar eliminación
                  </Button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-[var(--r-xl)] bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800">
                  <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                    Última confirmación: ¿estás seguro? Esto es irreversible.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDeleteStep(0)}>
                    No, cancelar
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={handleDeleteAll}>
                    Sí, eliminar todo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
