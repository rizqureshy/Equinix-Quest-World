import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type GraphicsMode = 'auto' | '3d' | '2d';
export type Quality = 'standard' | 'low';
export type MotionPref = 'system' | 'reduce' | 'full';

export interface Settings {
  graphics: GraphicsMode;
  quality: Quality;
  motion: MotionPref;
}

const KEY = 'signal-run/settings';
const DEFAULTS: Settings = { graphics: 'auto', quality: 'standard', motion: 'system' };

function read(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<Settings>;
    return {
      graphics: p.graphics === '3d' || p.graphics === '2d' ? p.graphics : 'auto',
      quality: p.quality === 'low' ? 'low' : 'standard',
      motion: p.motion === 'reduce' || p.motion === 'full' ? p.motion : 'system',
    };
  } catch {
    return DEFAULTS;
  }
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reducedMotion: boolean;
}

const Ctx = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(read);
  const [systemReduced, setSystemReduced] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Settings still apply for this visit.
      }
      return next;
    });
  }, []);

  const reducedMotion = settings.motion === 'reduce' || (settings.motion === 'system' && systemReduced);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduce' : 'full';
  }, [reducedMotion]);

  const value = useMemo(() => ({ settings, update, reducedMotion }), [settings, update, reducedMotion]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
