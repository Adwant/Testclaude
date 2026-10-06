import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Button, IconBox, RewardChip, StatusChip, TickBar, cx } from '../../ui/kit';
import { Img3D } from '../../ui/Img3D';
import { METRIC_META, PAL, palVars, type Metric, type PaletteName } from '../../lib/palette';
import { fmt } from '../../lib/format';
import type { GoalChip, GoalData, TileData, WeekDay } from '../../data/home';
import type { Call, HomeChallenge } from '../../data/content';

const METRIC_ANIM: Record<Metric, string> = { steps: 'icon-step', cal: 'icon-flicker', dist: 'icon-pin' };

/* ───────────── Плитка метрики ───────────── */

export function MetricTile({ t, delay = 0, onClick }: { t: TileData; delay?: number; onClick?: () => void }) {
  const meta = METRIC_META[t.metric];
  const pct = t.value === null ? 0 : Math.round((t.value / t.target) * 100);
  const colored = t.variant !== 'plain';
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      className={cx('tile', `tile--${t.variant}`)}
      style={palVars(t.metric)}
      onClick={onClick}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: t.variant === 'faded' ? 0.55 : 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="tile__top">
        <span className={cx('tile__icon', colored && 'is-white')}>
          <Icon name={meta.icon} size={16} className={METRIC_ANIM[t.metric]} />
        </span>
        {t.showPercent && (
          <span className={cx('tile__pct', t.variant === 'lead' && 'is-lead')}>
            <AnimatedNumber value={pct} suffix="%" delay={delay + 0.1} />
          </span>
        )}
      </span>
      <span className="tile__value">
        <span className="t-h2 tile__num">
          {t.value === null ? '—' : <AnimatedNumber value={t.value} decimals={meta.decimals} delay={delay + 0.05} />}
        </span>
        <span className="t-small tile__label">{meta.label}</span>
        <span className="t-cap tile__of">{t.note ?? `из ${fmt(t.target)}${meta.of ? ' ' + meta.of : ''}`}</span>
      </span>
      <TickBar value={t.value === null ? 0 : pct / 100} color={PAL[t.metric].accent} opacity={t.variant === 'plain' ? 0.6 : 1} delay={delay + 0.15} />
    </motion.button>
  );
}

/* ───────────── Шкала цели (46 делений) ───────────── */

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}

export function GoalScale({ percent, palette, delay = 0, count = 46 }: { percent: number; palette: PaletteName; delay?: number; count?: number }) {
  const p = PAL[palette];
  const filled = Math.round((Math.min(100, percent) / 100) * count);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80 + delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={cx('gscale', ready && 'is-ready')} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const on = i < filled;
        const bg = on ? mix(p.accent, p.accent2, filled > 1 ? i / (filled - 1) : 0) : p.accent2;
        return <i key={i} className={cx('gscale__t', on && 'is-on')} style={{ background: bg, ['--i' as string]: i }} />;
      })}
    </div>
  );
}

/* ───────────── Дни недели ───────────── */

export function WeekDays({ days, palette, onClick, delay = 0 }: { days: WeekDay[]; palette: PaletteName; onClick?: () => void; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cx('weekdays', onClick && 'is-tappable')}
      style={palVars(palette)}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
    >
      {days.map((d, i) => (
        <div className={cx('wday', `wday--${d.mark}`)} key={i}>
          <motion.span
            className="wday__c"
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20, delay: delay + i * 0.045 }}
          >
            {d.mark === 'done' && <Icon name="checkS" size={16} />}
            {d.mark === 'miss' && <Icon name="minus" size={16} />}
            {d.mark === 'wait' && <Icon name="clock" size={14} />}
            {d.mark === 'today' && <span className="t-small-s">{d.num}</span>}
          </motion.span>
          <span className={cx('t-cap', d.mark === 'today' && 't-cap-s')}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Чип в шапке карточки цели ───────────── */

const LEAD_TEXT: Record<Metric, string> = { steps: 'шаги', cal: 'калории', dist: 'дистанция' };

function GoalHeaderChip({ chip }: { chip: GoalChip }) {
  switch (chip.kind) {
    case 'any':
      return (
        <span className="chip chip--dark">
          <Icon name="check" size={14} />
          любая из трёх
        </span>
      );
    case 'lead':
      return (
        <span className="chip chip--white" style={palVars(chip.metric)}>
          <Icon name={METRIC_META[chip.metric].icon as IconName} size={14} className={METRIC_ANIM[chip.metric]} />
          ближе всего {LEAD_TEXT[chip.metric]}
        </span>
      );
    case 'reward':
      return <RewardChip label={`+${chip.amount} спортиков`} className="spk-pop" />;
    case 'wait':
      return <StatusChip tone="wait">{chip.text}</StatusChip>;
    case 'missed':
      return (
        <StatusChip tone="blue" icon="cal">
          после пропуска
        </StatusChip>
      );
    case 'fresh':
      return <StatusChip tone="ok">данные свежие</StatusChip>;
    case 'lock':
      return (
        <span className="chip chip--white chip--lock">
          <Icon name="lock" size={14} />
          нет доступа
        </span>
      );
  }
}

/* ───────────── Карточка «Цель дня» ───────────── */

interface GoalCardProps {
  goal: GoalData;
  onOpen: () => void;
  onWeek: () => void;
  onAllow: () => void;
}

export function GoalCard({ goal, onOpen, onWeek, onAllow }: GoalCardProps) {
  const accentPal: PaletteName = goal.palette === 'white' ? 'blue' : goal.palette;
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cx('goal card card--l card--pal', goal.revoked && 'goal--revoked')}
      style={palVars(goal.palette)}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
    >
      <div className="goal__head">
        <span className="t-body goal__title">Цель дня</span>
        <GoalHeaderChip chip={goal.chip} />
      </div>

      {goal.revoked ? (
        <>
          <div className="goal__value">
            <div className="grow stack-v gap-4">
              <h3 className="t-h2">Нет доступа к Здоровью</h3>
              <span className="t-small c-2">Без данных день не засчитается</span>
            </div>
            <Img3D name="lock" size={64} float />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Button onClick={onAllow}>Разрешить доступ</Button>
          </div>
        </>
      ) : (
        <>
          <div className="goal__value">
            <div className="grow stack-v gap-4">
              <div className="goal__big">
                <span className="t-display goal__pct">
                  <AnimatedNumber value={goal.percent} delay={0.2} duration={1.3} />%
                </span>
                <span className="t-small goal__cap">{goal.caption}</span>
              </div>
              {goal.subtitle && <span className="t-small goal__sub">{goal.subtitle}</span>}
            </div>
            {goal.img && <Img3D name={goal.img} size={goal.img === 'check' ? 76 : 64} float delay={0.5} rotate={goal.img === 'check' ? -4 : 0} />}
          </div>
          <div style={palVars(accentPal)}>
            <GoalScale percent={goal.percent} palette={accentPal} delay={0.3} />
          </div>
        </>
      )}

      <WeekDays
        days={goal.week}
        palette={goal.revoked ? 'gray' : accentPal}
        delay={0.35}
        onClick={onWeek}
      />

      {goal.bonus && (
        <div className="goal__bonus">
          <RewardChip amount={200} />
          <span className="t-cap goal__bonus-text">{goal.bonus}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────── Стопка «Вызовы дня» ───────────── */

interface CallsStackProps {
  calls: Call[];
  accepted: Record<string, boolean>;
  expanded: boolean;
  first: { caption: string; progress: number; done?: boolean; doneNote?: string; faded?: boolean };
  onAccept: (id: string) => void;
  onOpen: () => void;
  onToggle: () => void;
}

export function CallsStack({ calls, accepted, expanded, first, onAccept, onOpen, onToggle }: CallsStackProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const [topH, setTopH] = useState(0);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const measure = () => setTopH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spring = reduce ? { duration: 0.01 } : { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.9 };

  return (
    <motion.div
      className={cx('cstack', expanded ? 'is-expanded' : 'is-collapsed')}
      layout
      transition={spring}
      style={{ paddingBottom: expanded ? 0 : 12 }}
      onClick={!expanded ? onToggle : undefined}
    >
      {calls.map((c, i) => {
        const isAccepted = !!accepted[c.id];
        const behind = !expanded && i > 0;
        const isFirst = i === 0;
        const pal: PaletteName = isAccepted ? 'purple' : 'white';
        return (
          <motion.div
            key={c.id}
            ref={isFirst ? topRef : undefined}
            layout
            transition={spring}
            className={cx('ccard', isAccepted && 'is-accepted', behind && 'is-behind', first.faded && isFirst && 'is-faded')}
            style={{
              ...palVars(pal),
              borderRadius: 24,
              zIndex: calls.length - i,
              ...(behind
                ? { position: 'absolute', top: 6 * i, left: 12 * i, right: 12 * i, height: topH || undefined }
                : { position: 'relative' }),
            }}
            onClick={(e) => {
              if (!expanded) return;
              e.stopPropagation();
              onOpen();
            }}
          >
            <motion.div className="ccard__veil" initial={false} animate={{ opacity: behind ? 1 : 0 }} transition={{ duration: 0.25 }} />
            <motion.div className="ccard__body" layout="position" initial={false} animate={{ opacity: behind ? 0 : 1 }} transition={{ duration: behind ? 0.12 : 0.3, delay: behind ? 0 : 0.08 }}>
              <div className="ccard__head">
                <span className={cx('ccard__icon', isAccepted && 'is-white')}>
                  <Icon name={c.icon} size={22} className={c.icon === 'lunch' ? 'icon-ring' : undefined} />
                </span>
                <div className="grow stack-v gap-2">
                  <span className="t-small ccard__kicker">Вызов дня</span>
                  <span className="t-body-s">{c.title}</span>
                </div>
                {isFirst && first.done ? (
                  <span className="chip chip--white" style={palVars('purple')}>
                    <Icon name="check" size={14} />
                    выполнен
                  </span>
                ) : (
                  <RewardChip amount={c.reward} animate={false} />
                )}
              </div>

              {isFirst && isAccepted ? (
                <>
                  <TickBar value={first.progress} color={PAL.purple.accent} capless={first.done} />
                  <div className="ccard__meta t-cap">
                    <span>{first.caption}</span>
                    <span className="t-cap-s c-purple">{first.done ? first.doneNote : c.deadline}</span>
                  </div>
                  {!first.done && (
                    <Button variant="tint" size="s">
                      Принят
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="ccard__clock t-cap c-2">
                    <Icon name="clock" size={14} />
                    {c.homeMeta}
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={isAccepted ? 'yes' : 'no'} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
                      {isAccepted ? (
                        <Button variant="tint" size="s" icon="checkS">
                          Принят
                        </Button>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Button size="s" onClick={() => onAccept(c.id)}>
                            Принять вызов
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ───────────── Карусель челленджей ───────────── */

export function ChallengeCarousel({ items, progressOverride, onOpen, onJoin, joined }: { items: HomeChallenge[]; progressOverride?: number; onOpen: (id: string) => void; onJoin: (id: string) => void; joined: Record<string, boolean> }) {
  return (
    <div className="carousel">
      {items.map((c, i) => {
        const isJoined = c.joined || joined[c.id];
        const prog = i === 0 && progressOverride !== undefined ? progressOverride : c.progress;
        return (
          <motion.div
            key={c.id}
            className="chcard card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(c.id)}
          >
            <div className="hstack between">
              <IconBox icon={c.icon} palette={c.palette} size={36} />
              <RewardChip amount={c.reward} animate={false} />
            </div>
            <span className="t-body-s chcard__title">{c.title}</span>
            <div className="chcard__status">
              {prog !== undefined ? (
                <>
                  <TickBar value={prog} color={PAL[c.palette].accent} />
                  <div className="hstack between t-cap">
                    <span className="c-2">{i === 0 && progressOverride !== undefined ? `${Math.round(prog * 5)} из 5 дней` : c.caption}</span>
                    <span className="t-cap-s" style={{ color: PAL[c.palette].accent }}>
                      {Math.round(prog * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="hstack t-cap c-2" style={{ gap: 6 }}>
                  <Icon name="users" size={14} />
                  <span className="ellipsis">{c.caption}</span>
                </div>
              )}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {isJoined ? (
                <Button variant="tint" size="s" onClick={() => onOpen(c.id)}>
                  Участвую
                </Button>
              ) : (
                <Button size="s" onClick={() => onJoin(c.id)}>
                  Участвовать
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────── Скелетон главной ───────────── */

const SKEL_WEEK: WeekDay[] = [
  ...['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label): WeekDay => ({ label, mark: 'empty' })),
  { label: 'Пн', mark: 'today', num: 21 },
];

export function HomeSkeleton() {
  return (
    <>
      <div className="tiles">
        {[0, 1, 2].map((i) => (
          <div key={i} className="tile tile--plain tile--skel">
            <span className="skel" style={{ width: 28, height: 28 }} />
            <span className="stack-v gap-6">
              <span className="skel" style={{ width: '70%', height: 18 }} />
              <span className="skel" style={{ width: '50%', height: 10 }} />
            </span>
            <span className="skel" style={{ width: '100%', height: 4 }} />
          </div>
        ))}
      </div>
      <div className="goal card card--l goal--skel">
        <div className="goal__head">
          <span className="t-body c-2">Цель дня</span>
          <span className="skel" style={{ width: 92, height: 26, borderRadius: 14 }} />
        </div>
        <div className="goal__value">
          <div className="grow stack-v gap-8">
            <span className="skel" style={{ width: '45%', height: 44, borderRadius: 14 }} />
            <span className="skel" style={{ width: '70%', height: 12 }} />
          </div>
          <Img3D name="spiral" size={56} spin />
        </div>
        <span className="skel" style={{ width: '100%', height: 14 }} />
        <WeekDays days={SKEL_WEEK} palette="gray" />
      </div>
      <div className="card card--l" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <span className="skel" style={{ width: 40, height: 40, borderRadius: 14 }} />
        <span className="stack-v gap-6 grow">
          <span className="skel" style={{ width: '60%', height: 12 }} />
          <span className="skel" style={{ width: '40%', height: 12 }} />
        </span>
      </div>
    </>
  );
}
