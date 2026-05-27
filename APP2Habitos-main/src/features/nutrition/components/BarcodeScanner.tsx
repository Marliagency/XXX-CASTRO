import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { QuickAddRow } from './MealCard';
import type { Meal, Macros } from '../types';
import { useNutritionStore } from '../store/nutritionStore';

interface OFFProduct {
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
  };
  serving_size?: string;
}

async function fetchByBarcode(barcode: string): Promise<{ name: string; brand: string; macros: Macros; serving: string } | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p: OFFProduct = data.product;
  const n = p.nutriments ?? {};
  return {
    name:   p.product_name ?? 'Producto',
    brand:  p.brands ?? '',
    serving: p.serving_size ?? '100g',
    macros: {
      calories: Math.round(n['energy-kcal_100g'] ?? 0),
      protein:  Math.round((n.proteins_100g ?? 0) * 10) / 10,
      carbs:    Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
      fat:      Math.round((n.fat_100g ?? 0) * 10) / 10,
      fiber:    n.fiber_100g != null ? Math.round(n.fiber_100g * 10) / 10 : undefined,
      sugar:    n.sugars_100g != null ? Math.round(n.sugars_100g * 10) / 10 : undefined,
    },
  };
}

interface BarcodeScannerProps {
  mealType: Meal['type'];
  onDone: () => void;
}

export function BarcodeScanner({ mealType, onDone }: BarcodeScannerProps) {
  const [stage, setStage] = useState<'scanning' | 'fetching' | 'review' | 'notfound' | 'error'>('scanning');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<{ name: string; brand: string; macros: Macros; serving: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef    = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const { quickAdd } = useNutritionStore();

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    reader.decodeFromVideoDevice(undefined, videoRef.current!, async (result) => {
      if (!result || stopped) return;
      stopped = true;
      controlsRef.current?.stop();
      const barcode = result.getText();
      setStage('fetching');
      try {
        const p = await fetchByBarcode(barcode);
        if (!p) { setStage('notfound'); return; }
        setProduct(p);
        setStage('review');
      } catch {
        setErrorMsg('Error al consultar OpenFoodFacts');
        setStage('error');
      }
    }).then(controls => { controlsRef.current = controls; });

    return () => { stopped = true; controlsRef.current?.stop(); };
  }, []);

  const handleConfirm = async () => {
    if (!product) return;
    await quickAdd({
      name: product.brand ? `${product.name} (${product.brand})` : product.name,
      macros: product.macros,
      quantity, serving: product.serving, source: 'barcode', mealType,
    });
    onDone();
  };

  const restart = () => {
    setStage('scanning');
    setProduct(null);
  };

  return (
    <div className="space-y-3">
      {(stage === 'scanning' || stage === 'fetching') && (
        <div className="relative rounded-[var(--r-xl)] overflow-hidden bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-32 border-2 border-white rounded-lg opacity-70" />
          </div>
          {stage === 'fetching' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Buscando producto...</span>
              </div>
            </div>
          )}
        </div>
      )}
      {stage === 'scanning' && (
        <p className="text-xs text-[var(--text-tertiary)] text-center">Apunta la cámara al código de barras</p>
      )}
      {stage === 'notfound' && (
        <div className="py-6 text-center space-y-3">
          <X size={28} className="mx-auto text-[var(--warning)]" />
          <p className="text-sm text-[var(--text-secondary)]">Producto no encontrado.</p>
          <Button variant="secondary" size="sm" onClick={restart}>Escanear de nuevo</Button>
        </div>
      )}
      {stage === 'error' && (
        <div className="py-6 text-center space-y-3">
          <X size={28} className="mx-auto text-[var(--danger)]" />
          <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
          <Button variant="secondary" size="sm" onClick={restart}>Reintentar</Button>
        </div>
      )}
      {stage === 'review' && product && (
        <div className="space-y-3">
          <QuickAddRow
            name={product.brand ? `${product.name} · ${product.brand}` : product.name}
            macros={product.macros}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onRemove={restart}
          />
          <p className="text-[10px] text-[var(--text-tertiary)] text-center">Macros por {product.serving}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={restart}>Escanear otro</Button>
            <Button variant="primary" size="sm" className="flex-1" icon={<Check size={14} />} onClick={handleConfirm}>Añadir</Button>
          </div>
        </div>
      )}
    </div>
  );
}
