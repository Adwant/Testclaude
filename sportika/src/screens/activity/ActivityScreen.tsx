import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { Empty, PageHeader, Screen, Section } from '../../ui/shell';
import { Banner, Button, Card, IconBox, RewardChip, Segmented, StatusChip, TickBar, cx } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Img3D } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Sheet } from '../../ui/overlays';
import { useApp } from '../../lib/store';
import { METRIC_META, PAL, palVars, type Metric } from '../../lib/palette';
import { MONTH_CLOSED, WEEK_LABELS, WEEK_SERIES } from '../../data/content';
import { WeekDays } from '../home/parts';
import type { WeekDay } from '../../data/home';

type Period = 'week' | 'month';

export function ActivityScreen() {
  const { data, openSheet, openDialog } = useApp();
  const [period, setPeriod] = useState<Period>('week');
  const mode = data.activityMode;
  const kicker = mode === 'short' ? '22–24 сентября' : mode === 'partial' || mode === 'revoked' ? '22–28 сентября' : period === 'week' ? '15–21 сентября' : 'Сентябрь 2026';

  return (
    <Screen tabs top={<PageHeader kicker={kicker} title="Активность" />}>
      <Segmented id="act" value={period} onChange={setPeriod} items={[{ id: 'week', label: 'Неделя' }, { id: 'month', label: 'Месяц' }]} />

      <AnimatePresence mode="wait">
        <motion.div key={period + mode} className="stack-v gap-20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {mode === 'revoked' ? (
            <Revoked onSettings={() => openDialog('health')} />
          ) : mode === 'short' ? (
            <ShortHistory />
          ) : mode === 'partial' ? (
            <Partial />
          ) : period === 'week' ? (
            <Week onDay={() => openSheet('day')} />
          ) : (
            <Month onDay={() => openSheet('day')} />
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}

/* ───────────── Плитки за период ───────────── */

function PeriodTiles({ items }: { items: { m: Metric; value: number; pct?: number; of: string; label?: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="tiles">
      {items.map((t, i) => (
        <motion.div
          key={t.m}
          className="tile tile--tinted"
          style={palVars(t.m)}
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.06 }}
        >
          <span className="tile__top">
            <span className="tile__icon is-white">
              <Icon name={METRIC_META[t.m].icon} size={16} />
            </span>
            {t.pct !== undefined && (
              <span className="t-cap-s" style={{ color: PAL[t.m].accent }}>
                <AnimatedNumber value={t.pct} suffix="%" />
              </span>
            )}
          </span>
          <span className="tile__value">
            <span className="t-h2 tile__num">
              <AnimatedNumber value={t.value} decimals={t.m === 'dist' && t.value < 100 && t.value % 1 ? 1 : 0} delay={0.05 * i} />
              {t.m === 'dist' && <span> км</span>}
            </span>
            <span className="t-small tile__label">{t.label ?? (t.m === 'steps' ? 'Шаги' : t.m === 'cal' ? 'Калории' : 'Дистанция')}</span>
            <span className="t-cap tile__of">{t.of}</span>
          </span>
          {t.pct !== undefined ? <TickBar value={t.pct / 100} color={PAL[t.m].accent} delay={0.15} /> : <span />}
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────── Неделя ───────────── */

const WEEK_DAYS: WeekDay[] = [
  { label: 'Вт', mark: 'miss' },
  { label: 'Ср', mark: 'done' },
  { label: 'Чт', mark: 'miss' },
  { label: 'Пт', mark: 'done' },
  { label: 'Сб', mark: 'miss' },
  { label: 'Вс', mark: 'done' },
  { label: 'Пн', mark: 'today', num: 21 },
];

function Week({ onDay }: { onDay: () => void }) {
  const [metric, setMetric] = useState<Metric>('steps');
  const s = WEEK_SERIES[metric];
  return (
    <>
      <PeriodTiles
        items={[
          { m: 'steps', value: 56800, pct: 81, of: 'из 70 000' },
          { m: 'cal', value: 2940, pct: 84, of: 'из 3 500 ккал' },
          { m: 'dist', value: 38, pct: 78, of: 'из 49 км' },
        ]}
      />
      <Card size="l" delay={0.08}>
        <div className="card-title">
          <span className="t-body-s">Дни недели</span>
          <span className="t-small c-2">4 из 7 закрыто</span>
        </div>
        <WeekDays days={WEEK_DAYS} palette="blue" onClick={onDay} delay={0.1} />
      </Card>
      <Card size="l" palette={metric} delay={0.12} className="chart-card">
        <div className="chips-row">
          {(['steps', 'cal', 'dist'] as Metric[]).map((m) => (
            <button key={m} type="button" className={cx('pill', m === metric && 'is-on')} onClick={() => setMetric(m)}>
              {m === metric && <motion.span layoutId="chart-pill" className="pill__bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span>{m === 'steps' ? 'Шаги' : m === 'cal' ? 'Калории' : 'Дистанция'}</span>
            </button>
          ))}
        </div>
        <div className="hstack between" style={{ alignItems: 'flex-start' }}>
          <div className="stack-v gap-2">
            <span className="t-body-s">{metric === 'steps' ? 'Шаги по дням' : metric === 'cal' ? 'Калории по дням' : 'Дистанция по дням'}</span>
            <span className="t-cap" style={{ opacity: 0.8 }}>
              в среднем {metric === 'dist' ? String(s.avg).replace('.', ',') : s.avg.toLocaleString('ru-RU')} · цель {s.target.toLocaleString('ru-RU')}
            </span>
          </div>
          <span className="chip chip--white">
            <Icon name="trend" size={14} />
            {s.trend > 0 ? '+' : '−'}
            {Math.abs(s.trend)}%
          </span>
        </div>
        <LineChart key={metric} values={s.values} target={s.target} metric={metric} />
      </Card>
      <SummaryCard week onSeries={() => undefined} />
    </>
  );
}

/** Линейный график: линия «прорисовывается», точки появляются по очереди, последняя пульсирует. */
function LineChart({ values, target, metric }: { values: number[]; target: number; metric: Metric }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(300);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = () => setW(Math.max(200, el.clientWidth));
    m();
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 120;
  const pad = 8;
  const max = Math.max(target, ...values) * 1.08;
  const min = Math.min(...values) * 0.6;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (values.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
  const pts = values.map((v, i) => [x(i), y(v)] as const);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const area = `${d} L${x(values.length - 1)} ${H} L${x(0)} ${H} Z`;
  const p = PAL[metric];
  const ty = y(target);
  return (
    <div className="chart">
      <div className="chart__plot" ref={ref}>
      <svg key={W} viewBox={`0 0 ${W} ${H}`} className="chart__svg" aria-hidden="true">
        <defs>
          <linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} stopOpacity="0.22" />
            <stop offset="1" stopColor={p.accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={0} x2={W} y1={ty} y2={ty} stroke={p.accent} strokeOpacity="0.35" strokeDasharray="3 4" />
        <motion.path d={area} fill={`url(#area-${metric})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
        <motion.path
          d={d}
          fill="none"
          stroke={p.accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
         
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
        />
      </svg>
      {pts.map(([px, py], i) => {
        const last = i === pts.length - 1;
        return (
          <motion.span
            key={i}
            className={cx('chart__pt', last && 'is-last')}
            style={{ left: `${(px / W) * 100}%`, top: `${(py / H) * 100}%`, ['--c' as string]: p.accent }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.15 + i * 0.13 }}
          />
        );
      })}
      </div>
      <div className="chart__labels">
        {WEEK_LABELS.map((l, i) => (
          <span key={l} className={cx('t-cap', i === WEEK_LABELS.length - 1 && 't-cap-s')}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ week }: { week: boolean; onSeries: () => void }) {
  return (
    <Card size="l" delay={0.16}>
      <div className="rows">
        <div className="sum-row">
          <IconBox icon="check" palette="blue" size={40} />
          <div className="stack-v gap-2 grow">
            <span className="t-body-s">{week ? 'Неделя' : 'Месяц'}</span>
            <span className="t-small c-2">{week ? '4 из 7 дней с закрытой целью' : '14 из 21 дня с закрытой целью'}</span>
          </div>
          <span className="t-body-s c-blue">{week ? '4 / 7' : '14 / 21'}</span>
        </div>
        <div className="sum-row">
          <IconBox icon="bolt" palette="purple" size={40} />
          <div className="stack-v gap-2 grow">
            <span className="t-body-s">Серия</span>
            <span className="t-small c-2">5 дней подряд · лучшая 11</span>
          </div>
          <span className="t-body-s c-purple">5 дней</span>
        </div>
        <div className="sum-row">
          <IconBox icon="bolt" palette="yellow" size={40} />
          <div className="stack-v gap-2 grow">
            <span className="t-body-s">Спортики за {week ? 'неделю' : 'месяц'}</span>
            <span className="t-small c-2">цель, вызовы и задания</span>
          </div>
          <RewardChip amount={week ? 120 : 320} />
        </div>
      </div>
    </Card>
  );
}

/* ───────────── Месяц ───────────── */

function Month({ onDay }: { onDay: () => void }) {
  const lead = 1; // 1 сентября 2026 — вторник
  const cells: ({ n: number; v: 0 | 1 | null } | null)[] = [...Array(lead).fill(null), ...MONTH_CLOSED.map((v, i) => ({ n: i + 1, v }))];
  return (
    <>
      <PeriodTiles
        items={[
          { m: 'steps', value: 170300, pct: 81, of: 'за сентябрь' },
          { m: 'cal', value: 8400, pct: 80, of: 'ккал за месяц' },
          { m: 'dist', value: 118, pct: 80, of: 'за месяц' },
        ]}
      />
      <Card size="l" delay={0.08}>
        <div className="card-title">
          <div className="stack-v gap-2">
            <span className="t-body-s">Закрытые дни</span>
            <span className="t-cap c-2">сентябрь · любая из трёх метрик</span>
          </div>
          <div className="hstack" style={{ gap: 4 }}>
            <button type="button" className="mini-nav" aria-label="Предыдущий месяц">
              <Icon name="chevL" size={18} />
            </button>
            <button type="button" className="mini-nav is-disabled" aria-label="Следующий месяц">
              <Icon name="chevR" size={16} />
            </button>
          </div>
        </div>
        <div className="cal" style={palVars('blue')}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <span key={d} className="cal__dow t-cap c-2">
              {d}
            </span>
          ))}
          {cells.map((c, i) =>
            c ? (
              <button type="button" key={i} className={cx('cal__cell', c.n === 21 ? 'is-today' : c.v === 1 ? 'is-done' : c.v === 0 ? 'is-miss' : 'is-future')} onClick={c.v !== null || c.n === 21 ? onDay : undefined}>
                <motion.span className="cal__c" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.1 + i * 0.012 }}>
                  {c.v === 1 && c.n !== 21 && <Icon name="checkS" size={14} />}
                  {c.v === 0 && c.n !== 21 && <Icon name="minus" size={14} />}
                </motion.span>
                <span className={cx('t-cap', c.n === 21 && 't-cap-s')}>{c.n}</span>
              </button>
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      </Card>
      <SummaryCard week={false} onSeries={() => undefined} />
    </>
  );
}

/* ───────────── Короткая история (новичок) ───────────── */

function Bars({ values, closed, max, empty }: { values: (number | null)[]; closed: boolean[]; max: number; empty?: boolean[] }) {
  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return (
    <div className="bars">
      {values.map((v, i) => (
        <div key={i} className="bars__col">
          <div className="bars__track">
            {v !== null && (
              <motion.span
                className={cx('bars__bar', closed[i] && 'is-closed')}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.15 + i * 0.07 }}
              />
            )}
            {empty?.[i] && <span className="bars__nodata" />}
          </div>
          <span className={cx('t-cap c-2', i === 6 && 't-cap-s')}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function DayLog({ title, values, closed, nodata }: { title: string; values?: [string, string, string]; closed?: boolean; nodata?: boolean }) {
  return (
    <Card size="l">
      <div className="card-title">
        <span className="t-body-s">{title}</span>
        {closed ? <StatusChip tone="ok">цель закрыта</StatusChip> : nodata ? <StatusChip tone="muted">нет данных</StatusChip> : null}
      </div>
      <div className="daylog">
        {(values ?? ['—', '—', '—']).map((v, i) => (
          <div key={i} className="stack-v gap-2">
            <span className="t-h3">{v}</span>
            <span className="t-cap c-2">{['шагов', 'ккал', 'км'][i]}</span>
          </div>
        ))}
      </div>
      {nodata && <span className="t-cap c-2">Прочерк и ноль различаются намеренно: ошибка данных не маскируется под провал.</span>}
    </Card>
  );
}

function ShortHistory() {
  return (
    <>
      <Banner tone="wait" title="Истории пока мало">
        Данные подключены 22 сентября. Через неделю пересчитаем планку по фактическим данным и объясним изменение.
      </Banner>
      <PeriodTiles
        items={[
          { m: 'steps', value: 18420, of: 'за 3 дня', label: 'шагов' },
          { m: 'cal', value: 890, of: 'за 3 дня', label: 'ккал' },
          { m: 'dist', value: 12.6, of: 'за 3 дня', label: 'дистанция' },
        ]}
      />
      <Card size="l" delay={0.1}>
        <div className="card-title">
          <span className="t-body-s">Шаги по дням</span>
          <StatusChip tone="ok">цель закрыта</StatusChip>
        </div>
        <Bars values={[null, null, null, null, 5200, 8640, 4580]} closed={[false, false, false, false, false, true, false]} max={9000} />
        <span className="t-small c-2">Пустые столбцы — дней ещё не было, а не нулевая активность.</span>
      </Card>
      <Section title="Журнал по датам">
        <DayLog title="Суббота, 27 сентября" values={['8 640', '410', '6,1']} closed />
      </Section>
    </>
  );
}

function Partial() {
  return (
    <>
      <Banner tone="info" title="Данные за среду не получены">
        Телефон не синхронизировался с 24 по 25 сентября. Это не пропуск: день показан прочерком, а не нулём.
      </Banner>
      <Card size="l" delay={0.06}>
        <div className="card-title">
          <span className="t-body-s">Шаги по дням</span>
          <StatusChip tone="ok">цель закрыта</StatusChip>
        </div>
        <Bars values={[7200, 9100, null, 8400, 5400, 9300, 2100]} closed={[true, true, false, true, false, true, false]} max={10000} empty={[false, false, true, false, false, false, false]} />
        <span className="t-small c-2">Отсутствие данных не изображается нулём: столбца нет, а подпись дня остаётся.</span>
      </Card>
      <Section title="Журнал по датам">
        <DayLog title="Четверг, 25 сентября" values={['10 120', '520', '7,3']} closed />
        <DayLog title="Среда, 24 сентября" nodata />
      </Section>
    </>
  );
}

function Revoked({ onSettings }: { onSettings: () => void }) {
  return (
    <>
      <Banner tone="err" title="Нет доступа к данным активности">
        Разрешение отозвано 23 сентября. Новые дни не считаются, история до этого дня сохранена.
      </Banner>
      <Empty
        img={<Img3D name="lock" size={140} float />}
        title="История не обновляется"
        text="Включите доступ в «Настройки» → «Здоровье» → «Доступ к данным» — и статистика продолжится с сегодняшнего дня."
        action={<Button onClick={onSettings}>Открыть настройки</Button>}
      />
      <Section title="История до 23 сентября">
        <DayLog title="Вторник, 23 сентября" values={['9 210', '480', '6,4']} closed />
      </Section>
    </>
  );
}

/* ───────────── Шторка «Запись дня» ───────────── */

export function DaySheet() {
  const { closeSheet } = useApp();
  const items: { icon: Parameters<typeof IconBox>[0]['icon']; pal: 'gray' | 'purple' | 'steps' | 'blue'; t: string; s: string }[] = [
    { icon: 'sneaker', pal: 'gray', t: 'Повседневная активность', s: '6 100 шагов · без записанной тренировки' },
    { icon: 'bolt', pal: 'purple', t: 'Тренировка, 42 мин', s: '3 110 шагов · 250 ккал · подтверждена устройством' },
    { icon: 'checkS', pal: 'steps', t: 'Цель дня', s: 'закрыта по калориям · +50 спортиков начислены' },
    { icon: 'award', pal: 'purple', t: 'Челлендж «10 000 шагов»', s: 'день 4 из 7 засчитан' },
    { icon: 'users', pal: 'purple', t: 'Задание «Тренировка в зале»', s: 'подтверждено проверяющим 24 сентября, засчитано за 23-е' },
  ];
  return (
    <Sheet onClose={closeSheet} closeButton={false}>
      <div className="hstack between">
        <span className="t-h2">Вторник, 23 сентября</span>
        <StatusChip tone="ok" size="s">
          цель закрыта
        </StatusChip>
      </div>
      <div className="tiles">
        {(
          [
            ['steps', 9210, 92, 'шагов', 'из 10 000'],
            ['cal', 480, 100, 'ккал', 'из 450'],
            ['dist', 6.4, 91, 'дистанция', 'из 7 км'],
          ] as [Metric, number, number, string, string][]
        ).map(([m, v, p, l, of], i) => (
          <div key={m} className="tile tile--tinted" style={palVars(m)}>
            <span className="tile__top">
              <span className="tile__icon is-white">
                <Icon name={METRIC_META[m].icon} size={16} />
              </span>
              <span className="t-cap-s" style={{ color: PAL[m].accent }}>
                {p}%
              </span>
            </span>
            <span className="tile__value">
              <span className="t-h2 tile__num">
                <AnimatedNumber value={v} decimals={m === 'dist' ? 1 : 0} delay={i * 0.05} />
                {m === 'dist' && ' км'}
              </span>
              <span className="t-small tile__label">{l}</span>
              <span className="t-cap tile__of">{of}</span>
            </span>
            <TickBar value={p / 100} color={PAL[m].accent} />
          </div>
        ))}
      </div>
      <Card size="l">
        <div className="rows">
          {items.map((it, i) => (
            <motion.div key={it.t} className="sum-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <IconBox icon={it.icon} palette={it.pal} size={40} />
              <div className="stack-v gap-2 grow">
                <span className="t-body-s">{it.t}</span>
                <span className="t-small c-2">{it.s}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
      <p className="t-small c-2">Вход в приложение, онбординг и подключение устройства сюда не попадают — они видны в заданиях и в истории спортиков.</p>
    </Sheet>
  );
}

