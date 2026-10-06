import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface RulerProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: string;
}

const STEP_PX = 12;

/**
 * Горизонтальная шкала: тянем пальцем, значение снапится к делению.
 * Крупное число над шкалой можно отредактировать с клавиатуры.
 */
export function Ruler({ value, min, max, onChange, unit }: RulerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pad, setPad] = useState(0);
  const lock = useRef(false);
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setPad(el.clientWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Синхронизация позиции шкалы со значением (при вводе с клавиатуры и при первом показе).
  useEffect(() => {
    const el = ref.current;
    if (!el || !pad) return;
    const target = (value - min) * STEP_PX;
    if (Math.abs(el.scrollLeft - target) > 1) {
      lock.current = true;
      el.scrollTo({ left: target, behavior: editing ? 'smooth' : 'auto' });
      setTimeout(() => (lock.current = false), 350);
    }
    if (!editing) setDraft(String(value));
  }, [value, pad, min, editing]);

  const onScroll = () => {
    const el = ref.current;
    if (!el || lock.current) return;
    const v = Math.round(el.scrollLeft / STEP_PX) + min;
    const clamped = Math.max(min, Math.min(max, v));
    if (clamped !== value) {
      onChange(clamped);
      if ('vibrate' in navigator) navigator.vibrate?.(2);
    }
  };

  const ticks = max - min + 1;
  return (
    <div className="ruler-wrap">
      <div className="ruler-value">
        <motion.input
          className="ruler-input t-display tnum"
          inputMode="numeric"
          pattern="[0-9]*"
          value={editing ? draft : String(value)}
          onFocus={() => {
            setEditing(true);
            setDraft(String(value));
          }}
          onBlur={() => {
            setEditing(false);
            const n = parseInt(draft, 10);
            if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
          }}
          onChange={(e) => {
            const s = e.target.value.replace(/\D/g, '').slice(0, 3);
            setDraft(s);
            const n = parseInt(s, 10);
            if (!Number.isNaN(n) && n >= min && n <= max) onChange(n);
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          style={{ width: `${Math.max(2, (editing ? draft : String(value)).length) * 0.62 + 0.1}em` }}
          aria-label={`Значение, ${unit}`}
        />
        <span className="t-h3 c-2">{unit}</span>
      </div>
      <div className="ruler" ref={ref} onScroll={onScroll}>
        <div className="ruler__track" style={{ paddingLeft: pad, paddingRight: pad, width: ticks * STEP_PX + pad * 2 }}>
          {Array.from({ length: ticks }, (_, i) => {
            const n = min + i;
            const major = n % 10 === 0;
            const mid = n % 5 === 0;
            return <i key={n} className={major ? 'is-major' : mid ? 'is-mid' : undefined} />;
          })}
        </div>
        <span className="ruler__marker" />
      </div>
      <span className="t-small c-2">Потяните шкалу или введите значение</span>
    </div>
  );
}
