import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { fmt } from '../lib/format';

interface Props {
  value: number;
  decimals?: number;
  /** Начальное значение анимации при первом показе (по умолчанию 0). */
  from?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Число, которое «докручивается» до значения при появлении в зоне видимости
 * и плавно перетекает при каждом изменении. Ширина цифр фиксирована (tabular-nums),
 * чтобы соседние элементы не дёргались.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  from = 0,
  duration = 1.1,
  delay = 0,
  prefix = '',
  suffix = '',
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReducedMotion();
  const current = useRef(from);
  const [shown, setShown] = useState(reduce ? value : from);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      current.current = value;
      setShown(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, inView, reduce, duration, delay]);

  return (
    <span ref={ref} className={['tnum', className].filter(Boolean).join(' ')}>
      {prefix}
      {fmt(shown, decimals)}
      {suffix}
    </span>
  );
}
