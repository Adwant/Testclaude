import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { AnimatedNumber } from './AnimatedNumber';
import { palVars, type PaletteName } from '../lib/palette';
import { fmt } from '../lib/format';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ───────────── Кнопки ───────────── */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'tint' | 'disabled' | 'danger';
interface ButtonProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: 'l' | 's';
  icon?: IconName;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  full?: boolean;
}

export function Button({ children, variant = 'primary', size = 'l', icon, onClick, className, style, full = true }: ButtonProps) {
  const disabled = variant === 'disabled';
  return (
    <motion.button
      type="button"
      className={cx('btn', `btn--${variant}`, `btn--${size}`, full && 'btn--full', className)}
      style={style}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
    >
      {icon && <Icon name={icon} size={size === 'l' ? 18 : 16} />}
      <span>{children}</span>
    </motion.button>
  );
}

/* ───────────── Чипы ───────────── */

/** Награда в спортиках: жёлтый чип с молнией. */
export function RewardChip({ amount, sign = '+', size = 'm', animate = true, className, label }: { amount?: number; sign?: string; size?: 'm' | 's'; animate?: boolean; className?: string; label?: string }) {
  return (
    <span className={cx('chip chip--reward', size === 's' && 'chip--s', className)}>
      <SpkIcon size={size === 's' ? 12 : 14} />
      {label ?? (
        <span>
          {sign}
          {animate && amount !== undefined ? <AnimatedNumber value={amount} duration={0.9} /> : amount !== undefined ? fmt(amount) : ''}
        </span>
      )}
    </span>
  );
}

export type Tone = 'ok' | 'wait' | 'err' | 'muted' | 'purple' | 'blue' | 'white';
export function StatusChip({ tone, icon, children, size = 'm', className }: { tone: Tone; icon?: IconName | null; children: ReactNode; size?: 'm' | 's'; className?: string }) {
  const defIcon: Record<Tone, IconName | undefined> = {
    ok: 'checkS',
    wait: 'clock',
    err: 'warn',
    muted: 'clock',
    purple: 'checkS',
    blue: 'info',
    white: undefined,
  };
  const ic = icon === null ? undefined : icon ?? defIcon[tone];
  return (
    <span className={cx('chip', `chip--${tone}`, size === 's' && 'chip--s', className)}>
      {ic && <Icon name={ic} size={size === 's' ? 12 : 14} />}
      <span>{children}</span>
    </span>
  );
}

/** Логотип-молния «Спортик». */
export function SpkIcon({ size = 14, color = 'var(--reward-icon)', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="12 0 32 56" className={cx('spk', className)} style={{ color, flexShrink: 0 }} aria-hidden="true">
      <path
        fill="currentColor"
        d="M24.52 .86C24.9 .32 25.52 0 26.18 0H41.08C42.2 0 43.11 .91 43.11 2.03V8.24C43.11 8.55 43.04 8.85 42.9 9.13L38.9 17.33C38.57 18.01 39.06 18.79 39.81 18.79H41.08C42.2 18.79 43.11 19.7 43.11 20.82V28.71C43.11 29.3 42.85 29.86 42.41 30.24L16.19 53.07C14.88 54.21 12.83 53.28 12.83 51.54V47.37C12.83 46.84 13.04 46.32 13.42 45.94L27.93 31.37C28.57 30.73 28.11 29.64 27.21 29.64H14.86C13.74 29.64 12.83 28.73 12.83 27.61V18.02C12.83 17.6 12.96 17.19 13.2 16.85L24.52 .86Z"
      />
    </svg>
  );
}

/* ───────────── Карточки ───────────── */

interface CardProps {
  children: ReactNode;
  palette?: PaletteName;
  size?: 'm' | 'l';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  delay?: number;
  appear?: boolean;
}

/** Белая (или цветная, по палитре) карточка. Появляется с мягким подъёмом. */
export function Card({ children, palette, size = 'm', className, style, onClick, delay = 0, appear = true }: CardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cx('card', size === 'l' && 'card--l', palette && palette !== 'white' && 'card--pal', onClick && 'is-tappable', className)}
      style={{ ...(palette ? palVars(palette) : null), ...style }}
      initial={appear && !reduce ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/* ───────────── Плашки ───────────── */

export type BannerTone = 'info' | 'ok' | 'wait' | 'err' | 'neutral';
const BANNER_ICON: Record<BannerTone, IconName> = { info: 'info', ok: 'checkS', wait: 'clock', err: 'warn', neutral: 'info' };

export function Banner({ tone, title, children, icon, delay = 0 }: { tone: BannerTone; title: ReactNode; children?: ReactNode; icon?: IconName; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cx('banner', `banner--${tone}`)}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <span className="banner__icon">
        <Icon name={icon ?? BANNER_ICON[tone]} size={16} className={tone === 'err' || tone === 'wait' ? 'icon-wiggle' : undefined} />
      </span>
      <div className="banner__body">
        <div className="t-body-s">{title}</div>
        {children && <div className="t-small banner__text">{children}</div>}
      </div>
    </motion.div>
  );
}

/* ───────────── Таблица «ключ — значение» ───────────── */

export function KV({ rows }: { rows: [ReactNode, ReactNode, string?][] }) {
  return (
    <div className="kv">
      {rows.map(([k, v, cls], i) => (
        <div className="kv__row" key={i}>
          <span className="kv__k t-small c-2">{k}</span>
          <span className={cx('kv__v t-small-s', cls)}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="card-title">
      <span className="t-body-s">{children}</span>
      {right}
    </div>
  );
}

/* ───────────── Иконка в квадрате ───────────── */

export function IconBox({ icon, palette = 'blue', size = 40, solid, white, className }: { icon: IconName; palette?: PaletteName; size?: number; solid?: boolean; white?: boolean; className?: string }) {
  const r = size >= 40 ? 14 : size >= 36 ? 12 : 10;
  const ic = size >= 36 ? Math.round(size * 0.55) : 16;
  return (
    <span
      className={cx('iconbox', solid && 'iconbox--solid', white && 'iconbox--white', className)}
      style={{ ...palVars(palette), width: size, height: size, borderRadius: r }}
    >
      <Icon name={icon} size={ic} />
    </span>
  );
}

/* ───────────── Прогресс из штрихов ───────────── */

interface TickBarProps {
  value: number;
  color?: string;
  /** Шаг между штрихами в px. */
  pitch?: number;
  className?: string;
  opacity?: number;
  delay?: number;
  /** Без «шапки» (для полностью заполненных шкал). */
  capless?: boolean;
}

/**
 * Пунктирный прогресс из макета: заполненная часть — штрихи 2×7, текущая позиция —
 * штрих 3×11, оставшаяся — точки 2×3. Количество штрихов подстраивается под ширину.
 */
export function TickBar({ value, color = 'currentColor', pitch = 5.2, className, opacity = 1, delay = 0, capless }: TickBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCount(Math.max(8, Math.floor(el.clientWidth / pitch) + 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pitch]);

  useEffect(() => {
    if (reduce) return setReady(true);
    const t = setTimeout(() => setReady(true), 60 + delay * 1000);
    return () => clearTimeout(t);
  }, [reduce, delay]);

  const v = Math.max(0, Math.min(1, value));
  const filled = Math.round(v * (count - 1));
  const capAt = v <= 0 || v >= 1 || capless ? -1 : filled;

  return (
    <div ref={ref} className={cx('ticks', ready && 'is-ready', className)} style={{ color, opacity }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const kind = i === capAt ? 'cap' : i < filled || (v >= 1 && i <= filled) ? 'on' : 'off';
        return <i key={i} className={`tick tick--${kind}`} style={{ ['--i' as string]: i }} />;
      })}
    </div>
  );
}

/* ───────────── Сегменты ───────────── */

export function Segmented<T extends string>({ items, value, onChange, id }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; id: string }) {
  return (
    <div className="segmented" role="tablist">
      {items.map((it) => (
        <button key={it.id} type="button" role="tab" aria-selected={value === it.id} className={cx('segmented__item', value === it.id && 'is-active')} onClick={() => onChange(it.id)}>
          {value === it.id && <motion.span layoutId={`seg-${id}`} className="segmented__thumb" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
          <span className="segmented__label">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ───────────── Переключатель ───────────── */

export function Toggle({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={cx('toggle', on && 'is-on')} onClick={() => onChange?.(!on)}>
      <motion.span className="toggle__knob" layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} />
    </button>
  );
}

/* ───────────── Строка списка ───────────── */

interface RowProps {
  icon?: IconName;
  palette?: PaletteName;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  iconSize?: number;
}
export function Row({ icon, palette = 'blue', title, subtitle, right, chevron, onClick, iconSize = 40 }: RowProps) {
  return (
    <motion.div className={cx('row', onClick && 'is-tappable')} onClick={onClick} whileTap={onClick ? { scale: 0.985 } : undefined}>
      {icon && <IconBox icon={icon} palette={palette} size={iconSize} />}
      <div className="row__body">
        <div className="t-body-s">{title}</div>
        {subtitle && <div className="t-small c-2">{subtitle}</div>}
      </div>
      {right}
      {chevron && <Icon name="chevR" size={16} className="row__chev" />}
    </motion.div>
  );
}

/* ───────────── Нумерованные шаги ───────────── */

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="steps">
      {items.map((t, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
          <span className="steps__num">{i + 1}</span>
          <span className="t-small-s">{t}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/* ───────────── Списки с галочкой / крестиком ───────────── */

export function CheckList({ items, tone }: { items: ReactNode[]; tone: 'ok' | 'no' }) {
  return (
    <ul className={cx('checklist', `checklist--${tone}`)}>
      {items.map((t, i) => (
        <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
          <span className="checklist__mark">
            <Icon name={tone === 'ok' ? 'checkS' : 'close'} size={14} />
          </span>
          <span className="t-small">{t}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export { cx };
