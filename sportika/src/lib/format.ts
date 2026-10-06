const NBSP = ' ';

/** 12400 → «12 400», 5.2 → «5,2» (неразрывный пробел между разрядами). */
export function fmt(value: number, decimals = 0): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = value < 0 ? '−' : '';
  return sign + (frac ? `${grouped},${frac}` : grouped);
}

export function signed(value: number): string {
  return (value > 0 ? '+' : value < 0 ? '−' : '') + fmt(Math.abs(value));
}

/** Склонение: plural(5, ['спортик', 'спортика', 'спортиков']) */
export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const sportikovWord = (n: number) => plural(n, ['спортик', 'спортика', 'спортиков']);

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
