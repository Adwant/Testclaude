import type { IconName } from '../ui/Icon';
import type { ImgName } from '../ui/Img3D';
import type { PaletteName } from '../lib/palette';

/* ───────────── Вызовы дня ───────────── */

export type CallKind = 'metric' | 'manual' | 'event';
export type CallStatus = 'available' | 'pending' | 'approved' | 'rejected' | 'done';

export interface Call {
  id: string;
  title: string;
  icon: IconName;
  reward: number;
  kind: CallKind;
  status: CallStatus;
  deadline: string;
  meta: string;
  /** Короткая подпись для главной: «до 22:00 · 20 этажей». */
  homeMeta: string;
  progress?: number;
  progressText?: string;
  oneTime?: boolean;
}

export const HOME_CALLS: Call[] = [
  { id: 'lunch3k', title: '3 км до обеда', icon: 'lunch', reward: 15, kind: 'metric', status: 'available', deadline: 'до 14:00', meta: 'по данным устройства', homeMeta: 'до 14:00 · 3 км' },
  { id: 'stairs20', title: '20 этажей вверх', icon: 'stairs', reward: 10, kind: 'metric', status: 'available', deadline: 'до 22:00', meta: 'по данным устройства', homeMeta: 'до 22:00 · 20 этажей' },
  { id: 'run20', title: 'Пробежка 20 минут', icon: 'sneaker', reward: 20, kind: 'metric', status: 'available', deadline: 'до 22:00', meta: 'по данным устройства', homeMeta: 'до 22:00 · 20 минут' },
];

export const CALLS: Call[] = [
  { id: 'steps12k', title: 'Пройти 12 000 шагов', icon: 'steps', reward: 30, kind: 'metric', status: 'available', deadline: 'до 23:59', meta: 'по данным устройства', homeMeta: '', progress: 0, progressText: '0 из 12 000 шагов' },
  { id: 'cal500', title: 'Сжечь 500 активных калорий', icon: 'flame', reward: 40, kind: 'metric', status: 'available', deadline: 'до 23:59', meta: 'по данным устройства', homeMeta: '', progress: 0.62, progressText: '310 из 500 ккал' },
  { id: 'gym', title: 'Подтвердить тренировку в зале', icon: 'sneaker', reward: 60, kind: 'manual', status: 'pending', deadline: 'до 23:59', meta: 'подтверждает проверяющий', homeMeta: '' },
];

export const ONE_TIME: Call[] = [
  { id: 'device', title: 'Подключить дополнительное устройство', icon: 'watch', reward: 100, kind: 'event', status: 'available', deadline: '', meta: 'награда один раз · переподключение не считается', homeMeta: '', oneTime: true },
  { id: 'login', title: 'Зайти в приложение', icon: 'check', reward: 5, kind: 'event', status: 'done', deadline: '', meta: 'не чаще одного зачёта в день', homeMeta: '', oneTime: true },
];

/* ───────────── Челленджи ───────────── */

export type ChallengeType = 'regular' | 'cumulative' | 'manual';
export type ChallengeState = 'available' | 'active' | 'done' | 'done-pending' | 'failed';

export interface Challenge {
  id: string;
  title: string;
  img: ImgName;
  palette: PaletteName;
  icon: IconName;
  type: ChallengeType;
  reward: number;
  fee: number;
  state: ChallengeState;
  meta: string;
  activeMeta?: string;
  progress?: number;
  /** Для главной (карусель). */
  homeCaption?: string;
}

export const CHALLENGES: Challenge[] = [
  { id: 'steps10k', title: '10 000 шагов каждый день', img: 'sneaker', palette: 'steps', icon: 'steps', type: 'regular', reward: 500, fee: 0, state: 'available', meta: 'Регулярный · 7 дней · допустимо 2 пропуска · начать можно сегодня', activeMeta: '3 из 7 дней · 1 пропуск из 2 · осталось 4 дня', progress: 3 / 7 },
  { id: 'marathon', title: 'Марафон 100 км за месяц', img: 'road', palette: 'dist', icon: 'route', type: 'cumulative', reward: 900, fee: 100, state: 'available', meta: 'Накопительный · 1–31 октября', activeMeta: '38 из 100 км · осталось 18 дней', progress: 0.384 },
  { id: 'gym6', title: '6 тренировок за две недели', img: 'dumbbell', palette: 'purple', icon: 'users', type: 'manual', reward: 700, fee: 0, state: 'available', meta: 'С проверкой · 17–30 сентября', activeMeta: '3 из 6 подтверждено · 1 ожидает проверки', progress: 0.5 },
];

export const FINISHED: Challenge[] = [
  { id: 'nolift', title: 'Неделя без лифта', img: 'sneaker', palette: 'steps', icon: 'stairs', type: 'regular', reward: 300, fee: 0, state: 'done', meta: '7 из 7 дней · 8–14 сентября · награда начислена', progress: 1 },
  { id: 'km50', title: '50 км за две недели', img: 'medal', palette: 'dist', icon: 'route', type: 'cumulative', reward: 400, fee: 0, state: 'failed', meta: '31 из 50 км · 1–14 сентября · повторная попытка доступна', progress: 0.62 },
  { id: 'gym5', title: '5 тренировок за неделю', img: 'dumbbell', palette: 'purple', icon: 'users', type: 'manual', reward: 350, fee: 0, state: 'done', meta: '5 из 5 подтверждено · 1–7 сентября', progress: 1 },
];

export interface HomeChallenge {
  id: string;
  title: string;
  icon: IconName;
  palette: PaletteName;
  reward: number;
  joined: boolean;
  progress?: number;
  caption: string;
  percentLabel?: string;
}

export const HOME_CHALLENGES: HomeChallenge[] = [
  { id: 'steps10k', title: '5 дней по 10 000 шагов', icon: 'steps', palette: 'steps', reward: 150, joined: true, progress: 0.6, caption: '3 из 5 дней' },
  { id: 'team50', title: 'Командный забег 50 км', icon: 'users', palette: 'purple', reward: 200, joined: false, caption: '5 из 8 в команде · 1 240 участников' },
  { id: 'km30', title: '30 км за неделю', icon: 'route', palette: 'dist', reward: 100, joined: true, progress: 0.71, caption: '21,4 из 30 км' },
];

/* ───────────── Призы ───────────── */

export type PrizeKind = 'aladdin' | 'merch';
export interface Prize {
  id: string;
  title: string;
  img: ImgName;
  palette: PaletteName;
  price: number;
  subtitle: string;
  description: string;
  kind: PrizeKind;
  quota: string;
  left: string;
  method: string;
  quotaExhausted?: boolean;
}

export const PRIZES: Prize[] = [
  { id: 'a1000', title: '1 000 ₽ в Aladdin', img: 'boltGold', palette: 'yellow', price: 500, subtitle: 'зачислим в течение дня', description: 'Номинал автоматически начислим в кошелёк заданий после обмена.', kind: 'aladdin', quota: '3 получения в месяц', left: '2 до конца сентября', method: 'автоматическое начисление' },
  { id: 'a3000', title: '3 000 ₽ в Aladdin', img: 'crystal', palette: 'yellow', price: 1400, subtitle: 'зачислим в течение дня', description: 'Номинал автоматически начислим в кошелёк заданий после обмена.', kind: 'aladdin', quota: '1 получение в месяц', left: '1 до конца сентября', method: 'автоматическое начисление' },
  { id: 'bottle', title: 'Бутылка для воды', img: 'bottle', palette: 'dist', price: 300, subtitle: 'выдача в офисе', description: 'Фирменная спортивная бутылка 750 мл с логотипом компании.', kind: 'merch', quota: '1 получение в год', left: '1 до 31 декабря', method: 'выдаёт HR лично' },
  { id: 'gym', title: 'Абонемент в зал', img: 'dumbbell', palette: 'cal', price: 2000, subtitle: 'на месяц · партнёр', description: 'Корпоративное благо на месяц, оформляет HR.', kind: 'merch', quota: '2 получения в год', left: '0 до 1 января', method: 'оформляет HR', quotaExhausted: true },
];

export interface ReceivedPrize {
  id: string;
  prizeId: string;
  title: string;
  img: ImgName;
  date: string;
  price: number;
  status: 'credited' | 'waiting';
  note: string;
}

export const RECEIVED: ReceivedPrize[] = [
  { id: 'r1', prizeId: 'a1000', title: '1 000 ₽ в Aladdin', img: 'boltOrange', date: '22 сентября', price: 500, status: 'credited', note: 'Сумма в кошельке заданий Aladdin' },
  { id: 'r2', prizeId: 'bottle', title: 'Бутылка для воды', img: 'bottle', date: '18 сентября', price: 300, status: 'waiting', note: 'Забрать у HR, каб. 214, до 30 сентября' },
  { id: 'r3', prizeId: 'a1000', title: '1 000 ₽ в Aladdin', img: 'boltOrange', date: '5 августа', price: 500, status: 'credited', note: 'Сумма в кошельке заданий Aladdin' },
];

/* ───────────── История спортиков ───────────── */

export interface HistoryItem {
  title: string;
  date: string;
  amount: number;
  icon: IconName;
  palette: PaletteName;
  pending?: boolean;
}

export const HISTORY: HistoryItem[] = [
  { title: 'Цель дня выполнена', date: '23 сентября, 18:42', amount: 50, icon: 'checkS', palette: 'steps' },
  { title: 'Вызов «12 000 шагов»', date: '23 сентября, 20:10', amount: 30, icon: 'bolt', palette: 'purple' },
  { title: 'Приз «1 000 ₽ в Aladdin»', date: '22 сентября, 12:05', amount: -900, icon: 'gift', palette: 'blue' },
  { title: 'Бонус за серию недели', date: '21 сентября, 21:05', amount: 200, icon: 'cal', palette: 'blue' },
  { title: 'Челлендж «Марафон 100 км»', date: '21 сентября, 09:30 · вступительный взнос', amount: -100, icon: 'users', palette: 'purple' },
  { title: 'Тренировка подтверждена', date: '20 сентября, 19:20 · ожидает начисления', amount: 60, icon: 'sneaker', palette: 'yellow', pending: true },
  { title: 'Онбординг и подключение данных', date: '15 сентября, 10:02', amount: 150, icon: 'steps', palette: 'steps' },
];

/* ───────────── Активность ───────────── */

export const WEEK_LABELS = ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн'];
export const WEEK_SERIES = {
  steps: { values: [8300, 9200, 6400, 8900, 5900, 8400, 7700], target: 10000, avg: 8120, trend: 9, unit: 'шагов' },
  cal: { values: [420, 470, 310, 450, 290, 430, 340], target: 500, avg: 420, trend: 6, unit: 'ккал' },
  dist: { values: [6.1, 6.8, 4.6, 6.5, 4.2, 6.2, 5.2], target: 7, avg: 5.7, trend: -3, unit: 'км' },
};
/** Закрытые дни месяца (сентябрь 2026): 1 — закрыт, 0 — нет, null — будущий день. */
export const MONTH_CLOSED: (0 | 1 | null)[] = [
  1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, ...Array(9).fill(null),
];
