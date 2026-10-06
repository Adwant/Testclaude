import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { AnimatedNumber } from './AnimatedNumber';
import { SpkIcon, cx } from './kit';
import { useApp, type Tab } from '../lib/store';
import { HOME_PRESETS } from '../data/home';

/* ───────────── Экран ───────────── */

interface ScreenProps {
  children: ReactNode;
  /** Шапка, прилипающая к верху при прокрутке. */
  top?: ReactNode;
  /** Нижняя панель с кнопками (поверх контента, с градиентной подложкой). */
  dock?: ReactNode;
  /** Экран показывается вместе с таб-баром. */
  tabs?: boolean;
  gap?: number;
  className?: string;
  /** Без верхнего отступа под статус-бар (например, в шторке). */
  center?: boolean;
}

export function Screen({ children, top, dock, tabs, gap = 20, className, center }: ScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dockH, setDockH] = useState(0);

  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el) return setDockH(0);
    const measure = () => setDockH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dock]);

  const bottomPad = dock ? dockH + 12 : tabs ? 'calc(var(--tabbar-h) + 24px)' : 'calc(var(--sab) + 32px)';

  return (
    <div className={cx('screen', className)}>
      <div
        ref={scrollRef}
        className="screen__scroll"
        onScroll={(e) => setScrolled((e.currentTarget as HTMLDivElement).scrollTop > 6)}
      >
        {top && <div className={cx('topbar', scrolled && 'is-scrolled')}>{top}</div>}
        <div
          className={cx('screen__content', !top && 'no-top', center && 'is-center')}
          style={{ gap, paddingBottom: bottomPad }}
        >
          {children}
        </div>
      </div>
      {dock && (
        <div ref={dockRef} className={cx('dock', tabs && 'dock--tabs')}>
          {dock}
        </div>
      )}
    </div>
  );
}

/* ───────────── Баланс ───────────── */

export function BalancePill({ onClick }: { onClick?: () => void }) {
  const { data, openSheet } = useApp();
  const prev = useRef(data.balance);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (prev.current !== data.balance) setBump((b) => b + 1);
    prev.current = data.balance;
  }, [data.balance]);
  return (
    <motion.button
      type="button"
      className="balance"
      whileTap={{ scale: 0.95 }}
      onClick={onClick ?? (() => openSheet('sportiki'))}
      aria-label={`Баланс: ${data.balance} спортиков`}
    >
      <motion.span
        key={bump}
        className="balance__bolt"
        initial={bump ? { rotate: -18, scale: 1.35 } : false}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <SpkIcon size={18} color="var(--on-accent)" />
      </motion.span>
      <AnimatedNumber value={data.balance} from={data.balance} className="t-body-s" duration={0.8} />
    </motion.button>
  );
}

export function Avatar({ size = 44, onClick }: { size?: number; onClick?: () => void }) {
  return (
    <motion.button type="button" className="avatar" style={{ width: size, height: size }} whileTap={{ scale: 0.92 }} onClick={onClick} aria-label="Профиль">
      <span className={size > 50 ? 't-h3' : 't-body-s'}>АС</span>
    </motion.button>
  );
}

/** Крупный заголовок раздела: подпись + H1 + баланс (Задания, Активность, Призы). */
export function PageHeader({ kicker, title }: { kicker: ReactNode; title: string }) {
  return (
    <div className="page-head">
      <div className="page-head__text">
        <span className="t-small c-2">{kicker}</span>
        <h1 className="t-h1">{title}</h1>
      </div>
      <BalancePill />
    </div>
  );
}

/** Навбар вложенного экрана: «назад», заголовок по центру, опционально баланс. */
export function NavBar({ title, balance, close, large }: { title?: string; balance?: boolean; close?: boolean; large?: string }) {
  const { back } = useApp();
  return (
    <div className={cx('navbar', large && 'navbar--large')}>
      <motion.button type="button" className="round-btn" whileTap={{ scale: 0.9 }} onClick={back} aria-label={close ? 'Закрыть' : 'Назад'}>
        <Icon name={close ? 'close' : 'chevL'} size={close ? 22 : 22} />
      </motion.button>
      {large ? <h1 className="t-h1 navbar__large">{large}</h1> : <span className="t-h3 navbar__title">{title}</span>}
      <span className="navbar__right">{balance ? <BalancePill /> : <span style={{ width: 44 }} />}</span>
    </div>
  );
}

/* ───────────── Таб-бар ───────────── */

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Главная' },
  { id: 'tasks', label: 'Задания' },
  { id: 'activity', label: 'Активность' },
  { id: 'prizes', label: 'Призы' },
];

function RingIcon({ value, active }: { value: number; active: boolean }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity={active ? 0.16 : 0.22} strokeWidth="3" />
      <motion.circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  );
}

function TabIcon({ id, active, ring }: { id: Tab; active: boolean; ring: number }) {
  const reduce = useReducedMotion();
  const icon =
    id === 'home' ? (
      <RingIcon value={ring} active={active} />
    ) : id === 'tasks' ? (
      <Icon name="check" size={24} />
    ) : id === 'activity' ? (
      <Icon name="trend" size={24} />
    ) : (
      <Icon name="gift" size={24} />
    );
  return (
    <motion.span
      className="tab__icon"
      animate={active && !reduce ? { scale: [1, 1.18, 1], rotate: id === 'prizes' ? [0, -10, 8, 0] : 0 } : { scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {icon}
    </motion.span>
  );
}

export function TabBar({ visible }: { visible: boolean }) {
  const { tab, setTab, data } = useApp();
  const ring = HOME_PRESETS[data.homeState].goal.percent / 100;
  return (
    <motion.nav
      className="tabbar"
      initial={false}
      animate={{ y: visible ? 0 : '110%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      aria-label="Основные разделы"
    >
      {TABS.map((t) => (
        <button key={t.id} type="button" className={cx('tab', tab === t.id && 'is-active')} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
          <TabIcon id={t.id} active={tab === t.id} ring={ring} />
          <span className="tab__label">{t.label}</span>
        </button>
      ))}
    </motion.nav>
  );
}

/* ───────────── Раздел с заголовком ───────────── */

export function Section({ title, right, children, delay = 0 }: { title: ReactNode; right?: ReactNode; children: ReactNode; delay?: number }) {
  return (
    <motion.section className="section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      <div className="section__head">
        <h2 className="t-h3">{title}</h2>
        {right}
      </div>
      {children}
    </motion.section>
  );
}

export function SeeAll({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" className="see-all t-small c-2" onClick={onClick}>
      {label}
      <Icon name="chevR" size={16} />
    </button>
  );
}

/** Пустое состояние: 3D + заголовок + текст + действие. */
export function Empty({ img, title, text, action }: { img: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      {img}
      <motion.h2 className="t-h2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {title}
      </motion.h2>
      <motion.p className="t-body c-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        {text}
      </motion.p>
      {action && (
        <motion.div style={{ width: '100%' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {action}
        </motion.div>
      )}
    </div>
  );
}
