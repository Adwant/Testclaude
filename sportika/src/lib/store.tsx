import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { HomeStateKey } from '../data/home';

export type Tab = 'home' | 'tasks' | 'activity' | 'prizes';

export interface Route {
  name: string;
  params?: Record<string, any>;
  key: number;
}
export interface Overlay {
  name: string;
  params?: Record<string, any>;
  key: number;
}

export type ActivityMode = 'normal' | 'short' | 'partial' | 'revoked';
export type OnbStart = 'login' | 'return' | 'little-history';

interface NavState {
  stack: Route[];
  sheet: Overlay | null;
  dialog: Overlay | null;
}

export interface AppData {
  phase: 'onboarding' | 'main';
  onbStart: OnbStart;
  homeState: HomeStateKey;
  activityMode: ActivityMode;
  prizesEmpty: boolean;
  callsEmpty: boolean;
  balance: number;
  /** Вызовы дня, которые пользователь принял. */
  accepted: Record<string, boolean>;
  /** Челленджи, в которые пользователь вступил в этой сессии. */
  joined: Record<string, boolean>;
  /** Отправленные на проверку ручные вызовы. */
  submitted: Record<string, boolean>;
  goals: { steps: number; cal: number; dist: number };
  notify: { goal: boolean; week: boolean };
  exchanged: string[];
}

const STORAGE_KEY = 'sportika.style1.v1';

const defaults: AppData = {
  phase: 'onboarding',
  onbStart: 'login',
  homeState: 'progress',
  activityMode: 'normal',
  prizesEmpty: false,
  callsEmpty: false,
  balance: 1240,
  accepted: { lunch3k: true },
  joined: {},
  submitted: {},
  goals: { steps: 10000, cal: 500, dist: 7 },
  notify: { goal: true, week: true },
  exchanged: [],
};

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    /* приватный режим Safari — работаем без сохранения */
  }
  return defaults;
}

interface Ctx {
  data: AppData;
  set: (patch: Partial<AppData> | ((d: AppData) => Partial<AppData>)) => void;
  reset: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  nav: NavState;
  push: (name: string, params?: Record<string, any>) => void;
  replace: (name: string, params?: Record<string, any>) => void;
  back: () => void;
  popToRoot: () => void;
  openSheet: (name: string, params?: Record<string, any>) => void;
  closeSheet: () => void;
  openDialog: (name: string, params?: Record<string, any>) => void;
  closeDialog: () => void;
  /** Закрыть всё поверх и открыть экран (например, после подтверждения в диалоге). */
  resolveTo: (name: string, params?: Record<string, any>) => void;
  toast: (text: string) => void;
  toastText: { text: string; key: number } | null;
}

const AppContext = createContext<Ctx | null>(null);

let keySeq = 1;
const depth = (n: NavState) => n.stack.length + (n.sheet ? 1 : 0) + (n.dialog ? 1 : 0);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [tab, setTabState] = useState<Tab>('home');
  const [nav, setNav] = useState<NavState>({ stack: [], sheet: null, dialog: null });
  const [toastText, setToast] = useState<{ text: string; key: number } | null>(null);
  const navRef = useRef(nav);
  navRef.current = nav;
  const skipPop = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data]);

  /** Применяет новое состояние навигации и синхронизирует историю браузера. */
  const apply = useCallback((next: NavState) => {
    const prev = navRef.current;
    const delta = depth(next) - depth(prev);
    navRef.current = next;
    setNav(next);
    if (delta > 0) {
      try {
        for (let i = 0; i < delta; i++) history.pushState({ sportika: depth(prev) + i + 1 }, '');
      } catch {
        /* встроенный просмотр может запрещать History API — навигация работает и без него */
      }
    } else if (delta < 0) {
      try {
        skipPop.current += 1;
        history.go(delta);
      } catch {
        skipPop.current -= 1;
      }
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (skipPop.current > 0) {
        skipPop.current -= 1;
        return;
      }
      const n = navRef.current;
      let next: NavState;
      if (n.dialog) next = { ...n, dialog: null };
      else if (n.sheet) next = { ...n, sheet: null };
      else if (n.stack.length) next = { ...n, stack: n.stack.slice(0, -1) };
      else return;
      navRef.current = next;
      setNav(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const api = useMemo<Omit<Ctx, 'data' | 'tab' | 'nav' | 'toastText'>>(() => {
    const cur = () => navRef.current;
    return {
      set: (patch) => setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) })),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setData(defaults);
      },
      setTab: (t) => {
        setTabState(t);
        const n = cur();
        if (n.stack.length || n.sheet || n.dialog) apply({ stack: [], sheet: null, dialog: null });
      },
      push: (name, params) => apply({ ...cur(), stack: [...cur().stack, { name, params, key: keySeq++ }] }),
      replace: (name, params) => {
        const n = cur();
        const stack = [...n.stack.slice(0, -1), { name, params, key: keySeq++ }];
        apply({ ...n, stack });
      },
      back: () => {
        const n = cur();
        if (n.dialog) apply({ ...n, dialog: null });
        else if (n.sheet) apply({ ...n, sheet: null });
        else if (n.stack.length) apply({ ...n, stack: n.stack.slice(0, -1) });
      },
      popToRoot: () => apply({ stack: [], sheet: null, dialog: null }),
      openSheet: (name, params) => apply({ ...cur(), dialog: null, sheet: { name, params, key: keySeq++ } }),
      closeSheet: () => apply({ ...cur(), sheet: null, dialog: null }),
      openDialog: (name, params) => apply({ ...cur(), dialog: { name, params, key: keySeq++ } }),
      closeDialog: () => apply({ ...cur(), dialog: null }),
      resolveTo: (name, params) => {
        const n = cur();
        apply({ stack: [...n.stack, { name, params, key: keySeq++ }], sheet: null, dialog: null });
      },
      toast: (text) => setToast({ text, key: keySeq++ }),
    };
  }, [apply]);

  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toastText]);

  const value: Ctx = { ...api, data, tab, nav, toastText };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
