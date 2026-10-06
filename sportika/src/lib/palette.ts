import type { CSSProperties } from 'react';

/** Палитры карточек из токенов Figma: «Метрика/*» и «Палитра/*». */
export interface Palette {
  bg1: string;
  bg2: string;
  text: string;
  accent: string;
  accent2: string;
  /** RGB тени без альфы — для rgba(). */
  shadow: string;
}

export const PAL = {
  steps: { bg1: '#e4f6ea', bg2: '#d2efdc', text: '#12532c', accent: '#16a34a', accent2: '#7bdda0', shadow: '22, 163, 74' },
  cal: { bg1: '#fff0de', bg2: '#ffe1c2', text: '#6e3606', accent: '#e07b18', accent2: '#ffb56b', shadow: '224, 123, 24' },
  dist: { bg1: '#e0f3fa', bg2: '#cce9f6', text: '#0b4a6e', accent: '#1b96d1', accent2: '#7fcbf2', shadow: '27, 150, 209' },
  blue: { bg1: '#e7eeff', bg2: '#d6e3ff', text: '#12306e', accent: '#1d4ed8', accent2: '#68a3fe', shadow: '37, 99, 235' },
  purple: { bg1: '#f2ebff', bg2: '#e6d9ff', text: '#2e1065', accent: '#6d28d9', accent2: '#b18cff', shadow: '109, 40, 217' },
  yellow: { bg1: '#fff8df', bg2: '#fff0bf', text: '#3f3208', accent: '#d99a00', accent2: '#ffd35c', shadow: '224, 168, 0' },
  gray: { bg1: '#f0f1f5', bg2: '#e6e8ee', text: '#6c7280', accent: '#a3a9b5', accent2: '#c9cdd6', shadow: '16, 24, 40' },
  white: { bg1: '#ffffff', bg2: '#f7f8fb', text: '#10151c', accent: '#10151c', accent2: '#6c7280', shadow: '16, 24, 40' },
  red: { bg1: '#fdecea', bg2: '#f9dcd8', text: '#7a1b1b', accent: '#dc3d26', accent2: '#f19a8c', shadow: '220, 61, 38' },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PAL;
export type Metric = 'steps' | 'cal' | 'dist';

/** CSS-переменные палитры для style={...}. */
export function palVars(name: PaletteName): CSSProperties {
  const p = PAL[name];
  return {
    ['--p-bg1' as string]: p.bg1,
    ['--p-bg2' as string]: p.bg2,
    ['--p-text' as string]: p.text,
    ['--p-accent' as string]: p.accent,
    ['--p-accent2' as string]: p.accent2,
    ['--p-shadow' as string]: p.shadow,
    ['--p-tint' as string]: p.accent + '24',
    ['--p-tint-2' as string]: p.accent + '14',
  };
}

export const METRIC_META: Record<Metric, { label: string; unit: string; of: string; icon: 'steps' | 'flame' | 'route'; decimals: number }> = {
  steps: { label: 'Шаги', unit: 'шагов', of: '', icon: 'steps', decimals: 0 },
  cal: { label: 'Калории', unit: 'ккал', of: 'ккал', icon: 'flame', decimals: 0 },
  dist: { label: 'Дистанция', unit: 'км', of: 'км', icon: 'route', decimals: 1 },
};
