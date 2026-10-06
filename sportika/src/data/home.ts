import type { Metric, PaletteName } from '../lib/palette';

export type DayMark = 'done' | 'miss' | 'empty' | 'today' | 'wait';
export interface WeekDay {
  label: string;
  mark: DayMark;
  num?: number;
}

export type HomeStateKey =
  | 'new'
  | 'progress'
  | 'done'
  | 'sync'
  | 'stale'
  | 'revoked'
  | 'loading'
  | 'missed'
  | 'zero'
  | 'progress-steps'
  | 'progress-cal'
  | 'done-cal'
  | 'done-dist'
  | 'compact-progress'
  | 'compact-done';

export type TileVariant = 'plain' | 'tinted' | 'lead' | 'faded';

export interface TileData {
  metric: Metric;
  value: number | null;
  target: number;
  variant: TileVariant;
  /** Подпись вместо «из N» — например «нет данных». */
  note?: string;
  showPercent: boolean;
}

export type GoalChip =
  | { kind: 'any' }
  | { kind: 'lead'; metric: Metric }
  | { kind: 'reward'; amount: number }
  | { kind: 'wait'; text: string }
  | { kind: 'missed' }
  | { kind: 'fresh' }
  | { kind: 'lock' };

export interface GoalData {
  palette: PaletteName;
  percent: number;
  caption: string;
  subtitle?: string;
  chip: GoalChip;
  img?: 'check' | 'stopwatch' | 'lock' | 'spiral';
  week: WeekDay[];
  bonus: string;
  revoked?: boolean;
  /** Закрыто — шкала заполнена полностью ярким цветом. */
  closed?: boolean;
}

export interface CallState {
  /** Подпись прогресса первого (принятого) вызова. */
  caption: string;
  progress: number;
  done?: boolean;
  doneNote?: string;
  faded?: boolean;
  counter: string;
  expanded: boolean;
}

export interface HomePreset {
  title: string;
  figma: string;
  balance: number;
  tiles: TileData[];
  goal: GoalData;
  calls: CallState;
  challengeProgress: number;
}

const days = ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
function week(marks: DayMark[]): WeekDay[] {
  return [...days.map((label, i) => ({ label, mark: marks[i] })), { label: 'Пн', mark: 'today' as DayMark, num: 21 }];
}
const W_BASE = week(['done', 'done', 'miss', 'done', 'miss', 'miss']);
const W_MISSED = week(['done', 'done', 'miss', 'miss', 'miss', 'miss']);
const W_REVOKED = week(['empty', 'empty', 'empty', 'empty', 'empty', 'empty']);

const T = { steps: 10000, cal: 500, dist: 7 };

function tiles(
  v: [number | null, number | null, number | null],
  lead: Metric | null,
  opts: { tinted?: boolean; faded?: boolean; notes?: [string?, string?, string?] } = {},
): TileData[] {
  const ms: Metric[] = ['steps', 'cal', 'dist'];
  return ms.map((metric, i) => ({
    metric,
    value: v[i],
    target: T[metric],
    variant: opts.faded ? 'faded' : opts.tinted ? 'tinted' : lead === metric ? 'lead' : 'plain',
    note: opts.notes?.[i],
    showPercent: !opts.tinted && !opts.faded && v[i] !== null,
  }));
}

const BONUS_5 = 'бонус за 5 закрытых дней до воскресенья';

export const HOME_PRESETS: Record<HomeStateKey, HomePreset> = {
  new: {
    title: 'Новая цель дня',
    figma: '02 · 01',
    balance: 1240,
    tiles: tiles([0, 0, 0], null, { tinted: true }),
    goal: {
      palette: 'white',
      percent: 0,
      caption: 'день впереди',
      subtitle: 'Закрой любую из трёх — день зачтён',
      chip: { kind: 'any' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: 'новый вызов · 0 из 3 км', progress: 0, counter: '1 принят', expanded: true },
    challengeProgress: 0.6,
  },
  progress: {
    title: 'В процессе · дистанция',
    figma: '02 · 02',
    balance: 1240,
    tiles: tiles([7200, 340, 5.2], 'dist'),
    goal: {
      palette: 'dist',
      percent: 74,
      caption: 'до закрытия дня',
      subtitle: 'Ближе всего дистанция — ещё 1,8 км',
      chip: { kind: 'lead', metric: 'dist' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: '1,8 из 3 км', progress: 0.6, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  done: {
    title: 'Цель закрыта · шаги',
    figma: '02 · 03',
    balance: 1290,
    tiles: tiles([12400, 560, 8.4], 'steps'),
    goal: {
      palette: 'steps',
      percent: 100,
      caption: 'закрыта по шагам',
      subtitle: 'Шаги 12 400 · калории 560 · 8,4 км',
      chip: { kind: 'reward', amount: 50 },
      img: 'check',
      week: W_BASE,
      bonus: 'серия 5 из 5 — бонус зачислим в воскресенье',
      closed: true,
    },
    calls: { caption: '3 из 3 км · зачтено в 12:10', progress: 1, done: true, doneNote: '+15 спортиков', counter: '1 из 3', expanded: false },
    challengeProgress: 0.8,
  },
  sync: {
    title: 'Ожидание синхронизации',
    figma: '02 · 04',
    balance: 1240,
    tiles: tiles([4050, null, 2.8], 'steps', { notes: [undefined, 'нет данных', undefined] }),
    goal: {
      palette: 'white',
      percent: 45,
      caption: 'по шагам · на 14:20',
      subtitle: 'Калории ещё не пришли — считаем по подтверждённым данным',
      chip: { kind: 'wait', text: 'ждём данные' },
      img: 'stopwatch',
      week: W_BASE,
      bonus: 'ожидание данных не считается пропуском',
    },
    calls: { caption: '1,2 из 3 км · ждём данные', progress: 0.4, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  stale: {
    title: 'Данные устарели',
    figma: '02 · 05',
    balance: 1240,
    tiles: tiles([5400, 205, 2.4], 'steps'),
    goal: {
      palette: 'white',
      percent: 54,
      caption: 'на 9:15',
      subtitle: 'Открой Здоровье, чтобы обновить',
      chip: { kind: 'wait', text: 'данные на 9:15' },
      img: 'stopwatch',
      week: W_BASE,
      bonus: 'ожидание данных не считается пропуском',
    },
    calls: { caption: '1,2 из 3 км на 9:15', progress: 0.4, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  revoked: {
    title: 'Разрешение отозвано',
    figma: '02 · 06',
    balance: 1240,
    tiles: tiles([null, null, null], null, { faded: true, notes: ['нет доступа', 'нет доступа', 'нет доступа'] }),
    goal: {
      palette: 'gray',
      percent: 0,
      caption: '',
      chip: { kind: 'lock' },
      img: 'lock',
      week: W_REVOKED,
      bonus: '',
      revoked: true,
    },
    calls: { caption: 'нет данных', progress: 0, counter: '3', expanded: false, faded: true },
    challengeProgress: 0.6,
  },
  loading: {
    title: 'Загрузка',
    figma: '02 · 07',
    balance: 1240,
    tiles: tiles([0, 0, 0], null),
    goal: { palette: 'white', percent: 0, caption: '', chip: { kind: 'any' }, img: 'spiral', week: W_REVOKED, bonus: '' },
    calls: { caption: '', progress: 0, counter: '', expanded: false },
    challengeProgress: 0,
  },
  missed: {
    title: 'Новый день после пропуска',
    figma: '02 · 08',
    balance: 1240,
    tiles: tiles([0, 0, 0], null, { tinted: true }),
    goal: {
      palette: 'white',
      percent: 0,
      caption: 'новый день',
      subtitle: 'Два дня без выполнения — планка не выросла, штрафов нет',
      chip: { kind: 'missed' },
      week: W_MISSED,
      bonus: 'осталось 3 выполнения до бонуса — ещё успеваете',
    },
    calls: { caption: '0 из 3 км', progress: 0, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  zero: {
    title: 'Подтверждённый ноль',
    figma: '02 · 09',
    balance: 1240,
    tiles: tiles([0, 0, 0], null, { tinted: true }),
    goal: {
      palette: 'white',
      percent: 0,
      caption: 'пока без движения',
      subtitle: 'Обновлено минуту назад: это подтверждённый ноль, не прочерк',
      chip: { kind: 'fresh' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: '0 из 3 км', progress: 0, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  'progress-steps': {
    title: 'В процессе · шаги',
    figma: '02 · 10',
    balance: 1240,
    tiles: tiles([7400, 280, 4.1], 'steps'),
    goal: {
      palette: 'steps',
      percent: 74,
      caption: 'до закрытия дня',
      subtitle: 'Ближе всего шаги — ещё 2 600',
      chip: { kind: 'lead', metric: 'steps' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: '1,8 из 3 км', progress: 0.6, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  'progress-cal': {
    title: 'В процессе · калории',
    figma: '02 · 10',
    balance: 1240,
    tiles: tiles([6100, 370, 4.3], 'cal'),
    goal: {
      palette: 'cal',
      percent: 74,
      caption: 'до закрытия дня',
      subtitle: 'Ближе всего калории — ещё 130 ккал',
      chip: { kind: 'lead', metric: 'cal' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: '1,8 из 3 км', progress: 0.6, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  'done-cal': {
    title: 'Цель закрыта · калории',
    figma: '02 · 10',
    balance: 1290,
    tiles: tiles([8900, 530, 6.1], 'cal'),
    goal: {
      palette: 'cal',
      percent: 100,
      caption: 'закрыта по калориям',
      subtitle: 'Калории 530 · шаги 8 900 · 6,1 км',
      chip: { kind: 'reward', amount: 50 },
      img: 'check',
      week: W_BASE,
      bonus: 'серия 5 из 5 — бонус зачислим в воскресенье',
      closed: true,
    },
    calls: { caption: '3 из 3 км · зачтено в 12:10', progress: 1, done: true, doneNote: '+15 спортиков', counter: '1 из 3', expanded: false },
    challengeProgress: 0.8,
  },
  'done-dist': {
    title: 'Цель закрыта · дистанция',
    figma: '02 · 10',
    balance: 1290,
    tiles: tiles([9800, 410, 7.6], 'dist'),
    goal: {
      palette: 'dist',
      percent: 100,
      caption: 'закрыта по дистанции',
      subtitle: 'Дистанция 7,6 км · шаги 9 800 · 410 ккал',
      chip: { kind: 'reward', amount: 50 },
      img: 'check',
      week: W_BASE,
      bonus: 'серия 5 из 5 — бонус зачислим в воскресенье',
      closed: true,
    },
    calls: { caption: '3 из 3 км · зачтено в 12:10', progress: 1, done: true, doneNote: '+15 спортиков', counter: '1 из 3', expanded: false },
    challengeProgress: 0.8,
  },
  'compact-progress': {
    title: 'Компактная цель · в процессе',
    figma: '02 · 11',
    balance: 1240,
    tiles: tiles([7200, 340, 5.2], 'dist'),
    goal: {
      palette: 'dist',
      percent: 74,
      caption: 'до закрытия дня',
      chip: { kind: 'lead', metric: 'dist' },
      week: W_BASE,
      bonus: BONUS_5,
    },
    calls: { caption: '1,8 из 3 км', progress: 0.6, counter: '3', expanded: false },
    challengeProgress: 0.6,
  },
  'compact-done': {
    title: 'Компактная цель · закрыта',
    figma: '02 · 12',
    balance: 1290,
    tiles: tiles([8900, 530, 6.1], 'cal'),
    goal: {
      palette: 'cal',
      percent: 100,
      caption: 'закрыта по калориям',
      chip: { kind: 'reward', amount: 50 },
      week: W_BASE,
      bonus: 'серия 5 из 5 — бонус зачислим в воскресенье',
      closed: true,
    },
    calls: { caption: '3 из 3 км · зачтено в 12:10', progress: 1, done: true, doneNote: '+15 спортиков', counter: '1 из 3', expanded: false },
    challengeProgress: 0.8,
  },
};

export const HOME_ORDER: HomeStateKey[] = [
  'new',
  'progress',
  'done',
  'sync',
  'stale',
  'revoked',
  'loading',
  'missed',
  'zero',
  'progress-steps',
  'progress-cal',
  'done-cal',
  'done-dist',
  'compact-progress',
  'compact-done',
];

/** Ведущая метрика состояния (для шторки «Цель дня»). */
export function leadOf(p: HomePreset): Metric | null {
  const t = p.tiles.find((x) => x.variant === 'lead');
  return t ? t.metric : null;
}
