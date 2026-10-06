import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../../lib/store';
import { Screen } from '../../ui/shell';
import { Banner, Button, Card, CheckList, IconBox, RewardChip, Steps, Toggle, cx } from '../../ui/kit';
import { Icon, type IconName } from '../../ui/Icon';
import { Img3D, type ImgName } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { palVars, type PaletteName } from '../../lib/palette';
import { Ruler } from './Ruler';

type Step =
  | 'login'
  | 'value'
  | 'why'
  | 'gender'
  | 'age'
  | 'height'
  | 'weight'
  | 'sport'
  | 'connect'
  | 'noaccess'
  | 'calc'
  | 'result'
  | 'little'
  | 'return';

const ORDER: Step[] = ['login', 'value', 'why', 'gender', 'age', 'height', 'weight', 'sport', 'connect', 'calc', 'result'];

/** Сколько групп прогресса «закрыто» на шаге (индикатор из 6 точек). */
const PROGRESS: Partial<Record<Step, number>> = {
  value: 1,
  why: 2,
  gender: 3,
  age: 3,
  height: 3,
  weight: 3,
  sport: 3,
  connect: 4,
  noaccess: 4,
  calc: 5,
  little: 6,
  return: 3,
};

export function Onboarding() {
  const { data, set } = useApp();
  const initial: Step = data.onbStart === 'return' ? 'return' : data.onbStart === 'little-history' ? 'little' : 'login';
  const [step, setStep] = useState<Step>(initial);
  const [dir, setDir] = useState(1);
  const [health, setHealth] = useState(false);
  const [answers, setAnswers] = useState({ gender: 'm', age: 32, height: 178, weight: 74, sport: '1-2' });

  const go = (s: Step) => {
    setDir(ORDER.indexOf(s) >= ORDER.indexOf(step) ? 1 : -1);
    setStep(s);
  };
  const next = () => go(ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(step) + 1)]);
  const prev = () => {
    const i = ORDER.indexOf(step);
    if (i > 0) go(ORDER[i - 1]);
  };
  const finish = () => set({ phase: 'main', onbStart: 'login', balance: Math.max(1240, data.balance) });

  let content: ReactNode;
  switch (step) {
    case 'login':
      content = <Login onNext={next} />;
      break;
    case 'value':
      content = <Values onNext={next} />;
      break;
    case 'why':
      content = <Why onNext={next} />;
      break;
    case 'gender':
      content = (
        <Question n={1} title="Ваш пол" text="Нужен для расчёта расхода калорий и посильной планки." onNext={next} onBack={prev}>
          <Options
            value={answers.gender}
            onChange={(gender) => setAnswers({ ...answers, gender })}
            items={[
              { id: 'm', title: 'Мужской' },
              { id: 'f', title: 'Женский' },
              { id: 'x', title: 'Не хочу указывать', sub: 'Планку рассчитаем по усреднённым значениям' },
            ]}
          />
        </Question>
      );
      break;
    case 'age':
      content = (
        <Question n={2} title="Сколько вам лет" text="Возраст влияет на рекомендуемую нагрузку." onNext={next} onBack={prev}>
          <RulerCard img="hourglass" value={answers.age} min={16} max={80} unit={plural(answers.age)} onChange={(age) => setAnswers({ ...answers, age })} />
        </Question>
      );
      break;
    case 'height':
      content = (
        <Question n={3} title="Ваш рост" text="Нужен, чтобы перевести шаги в дистанцию." onNext={next} onBack={prev}>
          <RulerCard img="tape" value={answers.height} min={130} max={220} unit="см" onChange={(height) => setAnswers({ ...answers, height })} />
        </Question>
      );
      break;
    case 'weight':
      content = (
        <Question n={4} title="Ваш вес" text="Нужен для расчёта калорий. Компания этих данных не видит." onNext={next} onBack={prev}>
          <RulerCard img="kettlebell" value={answers.weight} min={35} max={180} unit="кг" onChange={(weight) => setAnswers({ ...answers, weight })} />
        </Question>
      );
      break;
    case 'sport':
      content = (
        <Question n={5} title="Сколько раз в неделю вы занимаетесь спортом" text="Зал, бассейн, игровые виды — то, что телефон не фиксирует." img="dumbbell" onNext={next} onBack={prev}>
          <Options
            value={answers.sport}
            onChange={(sport) => setAnswers({ ...answers, sport })}
            items={[
              { id: '0', title: 'Не занимаюсь' },
              { id: '1-2', title: '1–2 раза в неделю' },
              { id: '3-4', title: '3–4 раза в неделю' },
              { id: '5', title: '5 раз и чаще' },
            ]}
          />
        </Question>
      );
      break;
    case 'connect':
      content = <Connect onConnect={() => setHealth(true)} onBack={prev} />;
      break;
    case 'noaccess':
      content = <NoAccess onSettings={() => setHealth(true)} onRetry={() => go('calc')} />;
      break;
    case 'calc':
      content = <Calc onDone={() => go('result')} />;
      break;
    case 'result':
      content = <Result onStart={finish} />;
      break;
    case 'little':
      content = <Little onStart={finish} />;
      break;
    case 'return':
      content = <Return onContinue={() => go('sport')} onRestart={() => go('login')} />;
      break;
  }

  const progress = PROGRESS[step];
  return (
    <div className="onb">
      {progress !== undefined && <OnbProgress done={progress} right={qLabel(step)} />}
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div
          key={step}
          className="layer"
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d * 60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d * -60, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {health && (
          <HealthDialog
            onAllow={() => {
              setHealth(false);
              go('calc');
            }}
            onDeny={() => {
              setHealth(false);
              go('noaccess');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function qLabel(step: Step) {
  const i = ['gender', 'age', 'height', 'weight', 'sport'].indexOf(step);
  return i >= 0 ? `Вопрос ${i + 1} из 5` : undefined;
}

function plural(n: number) {
  const a = n % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return 'лет';
  if (b === 1) return 'год';
  if (b > 1 && b < 5) return 'года';
  return 'лет';
}

/* ───────────── Индикатор прогресса ───────────── */

function OnbProgress({ done, right }: { done: number; right?: string }) {
  return (
    <div className="onb-progress">
      <div className="onb-dots" aria-label={`Шаг ${done} из 6`}>
        <motion.span className="onb-dots__pill" layout transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
          {Array.from({ length: done }, (_, i) => (
            <motion.i key={i} layout initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
          ))}
        </motion.span>
        {Array.from({ length: 6 - done }, (_, i) => (
          <motion.i key={'r' + i} layout className="onb-dots__rest" />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {right && (
          <motion.span key={right} className="t-small c-2" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
            {right}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── 01 · Вход ───────────── */

function Login({ onNext }: { onNext: () => void }) {
  const reduce = useReducedMotion();
  return (
    <Screen
      center
      dock={
        <>
          <Button onClick={onNext}>Войти через Aladdin</Button>
          <p className="t-small dock__note">Доступ открыт сотрудникам компаний — клиентов Aladdin. Мы используем вашу учётную запись Aladdin.</p>
        </>
      }
    >
      <div className="login">
        <motion.div
          className="login__logo"
          initial={reduce ? false : { scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          <motion.svg width="54" height="54" viewBox="12 0 32 56" animate={reduce ? undefined : { rotate: [0, -8, 6, 0], scale: [1, 1.08, 1] }} transition={{ duration: 0.9, delay: 0.7, repeat: Infinity, repeatDelay: 3.2 }}>
            <path
              fill="#fffffe"
              d="M24.52 .86C24.9 .32 25.52 0 26.18 0H41.08C42.2 0 43.11 .91 43.11 2.03V8.24C43.11 8.55 43.04 8.85 42.9 9.13L38.9 17.33C38.57 18.01 39.06 18.79 39.81 18.79H41.08C42.2 18.79 43.11 19.7 43.11 20.82V28.71C43.11 29.3 42.85 29.86 42.41 30.24L16.19 53.07C14.88 54.21 12.83 53.28 12.83 51.54V47.37C12.83 46.84 13.04 46.32 13.42 45.94L27.93 31.37C28.57 30.73 28.11 29.64 27.21 29.64H14.86C13.74 29.64 12.83 28.73 12.83 27.61V18.02C12.83 17.6 12.96 17.19 13.2 16.85L24.52 .86Z"
            />
          </motion.svg>
        </motion.div>
        <motion.h1 className="t-h1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Спортика
        </motion.h1>
        <motion.p className="t-body c-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          Двигайтесь в своём темпе и получайте награды в Aladdin
        </motion.p>
      </div>
    </Screen>
  );
}

/* ───────────── 02–04 · Ценность (свайп-карусель) ───────────── */

interface ValueSlide {
  img: ImgName;
  palette: PaletteName;
  title: string;
  text: string;
  chips: { icon: IconName; text: string; pos: 'tl' | 'tr' | 'bl'; iconColor?: string }[];
}

const SLIDES: ValueSlide[] = [
  {
    img: 'sneaker',
    palette: 'blue',
    title: 'Своя цель, а не чужой норматив',
    text: 'Мы считаем персональную планку на день по вашим данным и ответам. Новичку и тренированному сотруднику — разная планка.',
    chips: [
      { icon: 'close', text: 'не 10 000 для всех', pos: 'tr', iconColor: '#1d4ed8' },
      { icon: 'steps', text: 'Ваша планка: 7 000 шагов', pos: 'bl', iconColor: '#1d4ed8' },
    ],
  },
  {
    img: 'calendar',
    palette: 'steps',
    title: 'Прогресс видно сразу',
    text: 'Тело меняется не за неделю. Приложение показывает, что уже засчитано, как выполняется цель и насколько регулярно вы двигаетесь.',
    chips: [
      { icon: 'bolt', text: 'серия · 5 дней', pos: 'tr', iconColor: '#16a34a' },
      { icon: 'checkS', text: '4 из 7 дней закрыто', pos: 'bl', iconColor: '#16a34a' },
    ],
  },
  {
    img: 'gift',
    palette: 'yellow',
    title: 'Награда, которой можно воспользоваться',
    text: 'За выполненные цели и задания начисляются спортики. Их можно обменять на призы работодателя и на баллы в Aladdin.',
    chips: [
      { icon: 'gift', text: 'призы в Aladdin', pos: 'tr', iconColor: '#d99a00' },
      { icon: 'bolt', text: '+150 спортиков за старт', pos: 'bl', iconColor: '#d99a00' },
    ],
  },
];

function Values({ onNext }: { onNext: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => {
    if (n < 0 || n >= SLIDES.length) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(i + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(i - 1);
  };
  const s = SLIDES[i];
  return (
    <Screen dock={<Button onClick={() => (i < SLIDES.length - 1 ? go(i + 1) : onNext())}>Далее</Button>} gap={20}>
      <div className="onb-spacer" />
      <motion.div className="value-pager" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={onDragEnd}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            className="value-slide"
            variants={{
              enter: (d: number) => ({ x: d * 120, opacity: 0, scale: 0.96 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ x: d * -120, opacity: 0, scale: 0.96 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <div className="value-hero hero-img" style={palVars(s.palette)}>
              <Img3D name={s.img} size={250} float rotate={i === 0 ? 8 : 0} />
              {s.chips.map((c, k) => (
                <motion.span
                  key={c.text}
                  className={cx('float-chip', `float-chip--${c.pos}`)}
                  style={{ ['--sh' as string]: `rgba(${s.palette === 'blue' ? '37,99,235' : s.palette === 'steps' ? '22,163,74' : '224,168,0'},.18)` }}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.25 + k * 0.12 }}
                >
                  <Icon name={c.icon} size={14} color={c.iconColor} />
                  <span className="t-small-s">{c.text}</span>
                </motion.span>
              ))}
            </div>
            <div className="stack-v gap-10">
              <h1 className="t-h1">{s.title}</h1>
              <p className="t-body c-2">{s.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="pager-dots" role="tablist">
        {SLIDES.map((_, k) => (
          <button key={k} type="button" className={cx('pager-dot', k === i && 'is-active')} onClick={() => go(k)} aria-label={`Слайд ${k + 1}`} />
        ))}
      </div>
    </Screen>
  );
}

/* ───────────── 05 · Зачем спрашиваем ───────────── */

function Why({ onNext }: { onNext: () => void }) {
  const items: { icon: IconName; pal: PaletteName; title: string; text: string }[] = [
    { icon: 'user', pal: 'blue', title: 'Планка под вас, а не под всех', text: 'Ответы вместе с данными телефона определяют стартовый уровень.' },
    { icon: 'sneaker', pal: 'purple', title: 'Учтём спорт, который телефон не видит', text: 'Зал, бассейн и игровые виды не записываются автоматически.' },
    { icon: 'gift', pal: 'yellow', title: 'В конце — первая награда', text: 'За онбординг и подключение данных начислим спортики.' },
  ];
  return (
    <Screen dock={<Button onClick={onNext}>Ответить на вопросы</Button>}>
      <div className="onb-spacer" />
      <div className="q-head">
        <h1 className="t-h1 grow">Пять коротких вопросов — и цель будет вашей</h1>
        <Img3D name="target" size={84} float />
      </div>
      <Card size="l">
        <span className="t-small-s">Что это даёт</span>
        <div className="rows">
          {items.map((it, i) => (
            <motion.div key={it.title} className="why-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
              <IconBox icon={it.icon} palette={it.pal} size={36} />
              <div className="stack-v gap-2 grow">
                <span className="t-body-s">{it.title}</span>
                <span className="t-small c-2">{it.text}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </Screen>
  );
}

/* ───────────── 06–10 · Вопросы ───────────── */

function Question({ title, text, children, onNext, img }: { n: number; title: string; text: string; children: ReactNode; onNext: () => void; onBack: () => void; img?: ImgName }) {
  return (
    <Screen dock={<Button onClick={onNext}>Далее</Button>}>
      <div className="onb-spacer" />
      <div className="q-head">
        <div className="stack-v gap-8 grow">
          <h1 className="t-h1">{title}</h1>
          <p className="t-body c-2">{text}</p>
        </div>
        {img && <Img3D name={img} size={84} float rotate={-6} />}
      </div>
      {children}
    </Screen>
  );
}

function Options({ items, value, onChange }: { items: { id: string; title: string; sub?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="options">
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <motion.button
            key={it.id}
            type="button"
            className={cx('option', on && 'is-on')}
            onClick={() => onChange(it.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            role="radio"
            aria-checked={on}
          >
            <span className="stack-v gap-2 grow">
              <span className="t-body-s">{it.title}</span>
              {it.sub && <span className="t-small c-2">{it.sub}</span>}
            </span>
            <span className="option__radio">
              <AnimatePresence>
                {on && (
                  <motion.span className="option__dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 22 }}>
                    <Icon name="checkS" size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function RulerCard({ img, value, min, max, unit, onChange }: { img: ImgName; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <Card size="l" className="ruler-card">
      <Img3D name={img} size={96} float rotate={img === 'hourglass' ? -8 : 0} />
      <Ruler value={value} min={min} max={max} unit={unit} onChange={onChange} />
    </Card>
  );
}

/* ───────────── 11 · Подключить данные ───────────── */

function Connect({ onConnect }: { onConnect: () => void; onBack: () => void }) {
  const reads: { icon: IconName; pal: PaletteName; t: string }[] = [
    { icon: 'steps', pal: 'steps', t: 'Шаги' },
    { icon: 'sneaker', pal: 'purple', t: 'Тренировки' },
    { icon: 'route', pal: 'dist', t: 'Дистанция и активные калории' },
  ];
  return (
    <Screen dock={<Button onClick={onConnect}>Подключить Apple Health</Button>}>
      <div className="onb-spacer" />
      <div className="stack-v gap-8">
        <h1 className="t-h1">Подключите данные активности</h1>
        <p className="t-body c-2">Без данных мы не рассчитаем персональную цель и не начислим награду. Это часть онбординга.</p>
      </div>
      <Card size="l">
        <div className="card-title">
          <span className="t-body-s">Что читаем</span>
          <span className="t-small c-2">только чтение</span>
        </div>
        <div className="rows">
          {reads.map((r, i) => (
            <motion.div key={r.t} className="why-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <IconBox icon={r.icon} palette={r.pal} size={36} />
              <span className="t-body-s grow">{r.t}</span>
              <Icon name="checkS" size={16} color="#16a34a" />
            </motion.div>
          ))}
        </div>
      </Card>
      <Card size="l" delay={0.1}>
        <span className="t-body-s">Чего не читаем</span>
        <CheckList tone="no" items={['Медицинскую карту и диагнозы', 'Геопозицию и маршруты']} />
      </Card>
      <Banner tone="info" icon="lock" title="Что видит компания" delay={0.2}>
        Только сводные цифры по всем сотрудникам. Личные показатели и ответы работодателю не передаются.
      </Banner>
    </Screen>
  );
}

/* ───────────── 12 · Системный диалог ───────────── */

function HealthDialog({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  const [on, setOn] = useState({ steps: true, workouts: true, dist: true, cal: true });
  const rows: [keyof typeof on, string][] = [
    ['steps', 'Шаги'],
    ['workouts', 'Тренировки'],
    ['dist', 'Дистанция'],
    ['cal', 'Активные калории'],
  ];
  return (
    <div className="overlay overlay--dialog">
      <motion.div className="backdrop backdrop--blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="dialog dialog--system" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
        <h2 className="t-h3 center">«Спортика» запрашивает доступ к данным Здоровья</h2>
        <p className="t-small c-2 center">Системный экран iOS. Управление доступом остаётся за пользователем.</p>
        <div className="rows">
          {rows.map(([k, t]) => (
            <div key={k} className="hstack between sys-row">
              <span className="t-body-s">{t}</span>
              <Toggle on={on[k]} onChange={(v) => setOn({ ...on, [k]: v })} />
            </div>
          ))}
        </div>
        <div className="dialog__actions">
          <Button onClick={onAllow}>Разрешить</Button>
          <Button variant="ghost" onClick={onDeny}>
            Не разрешать
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────── 13 · Считаем ───────────── */

function Calc({ onDone }: { onDone: () => void }) {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 450);
    const done = setTimeout(onDone, 3000);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [onDone]);
  return (
    <Screen center>
      <div className="calc">
        <div className="calc__img">
          <Img3D name="stopwatch" size={170} float />
          <motion.span className="calc__shadow" animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.35, 0.5] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <h1 className="t-h2">Считаем ваш стартовый уровень</h1>
        <p className="t-body c-2">Смотрим историю активности за последние две недели и ваши ответы. Это займёт несколько секунд.</p>
        <div className="calc__dots">
          {[0, 1, 2].map((i) => (
            <motion.i key={i} animate={{ scale: dot === i ? 1.3 : 1, opacity: dot === i ? 1 : 0.35 }} />
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ───────────── 14 · Итог ───────────── */

function Result({ onStart }: { onStart: () => void }) {
  return (
    <Screen dock={<Button onClick={onStart}>Начать</Button>}>
      <div className="q-head">
        <h1 className="t-h1 grow">Готово. Вот ваш старт</h1>
        <Img3D name="trophy" size={84} float />
      </div>
      <Card size="l" palette="blue" delay={0.05}>
        <span className="t-small">Ваш стартовый уровень</span>
        <span className="t-h2">Умеренная активность</span>
        <span className="t-small">
          В среднем <AnimatedNumber value={6400} /> шагов в день за последние две недели и 1–2 тренировки в неделю по вашим ответам.
        </span>
      </Card>
      <Card size="l" palette="yellow" delay={0.15}>
        <div className="card-title">
          <span className="t-small">Первая награда</span>
          <RewardChip label="+150 спортиков" className="spk-pop" />
        </div>
        <span className="t-small">За прохождение онбординга и подключение данных. Уже на балансе.</span>
      </Card>
      <Card size="l" palette="steps" delay={0.25}>
        <span className="t-small">Ваша первая цель на завтра</span>
        <span className="t-h2">
          <AnimatedNumber value={7000} delay={0.3} /> шагов
        </span>
        <span className="t-small">или 320 ккал, или 5 км — достаточно выполнить любую одну планку</span>
      </Card>
      <Card size="l" palette="gray" delay={0.35} className="trust">
        <div className="hstack" style={{ alignItems: 'flex-start', gap: 10 }}>
          <span className="trust__icon">
            <Icon name="heart" size={16} />
          </span>
          <div className="stack-v gap-2">
            <span className="t-body-s" style={{ color: 'var(--text)' }}>
              Знак доверия · концепт
            </span>
            <span className="t-small">Правила расчёта проверены спортивным врачом и опираются на рекомендации ВОЗ. Появится после ревью.</span>
          </div>
        </div>
      </Card>
    </Screen>
  );
}

/* ───────────── 15 · Нет доступа ───────────── */

function NoAccess({ onSettings, onRetry }: { onSettings: () => void; onRetry: () => void }) {
  return (
    <Screen
      dock={
        <>
          <Button onClick={onSettings}>Открыть настройки</Button>
          <Button variant="secondary" onClick={onRetry}>
            Повторить
          </Button>
        </>
      }
    >
      <div className="onb-spacer" />
      <Banner tone="err" title="Нет доступа к данным активности">
        Разрешение не выдано, поэтому мы не можем рассчитать персональную цель.
      </Banner>
      <div className="q-head">
        <h2 className="t-h3 grow">Что сделать</h2>
        <Img3D name="lock" size={72} float />
      </div>
      <Card size="l">
        <Steps items={['Откройте «Настройки» → «Здоровье» → «Доступ к данным»', 'Найдите «Спортика» и включите шаги, тренировки и дистанцию', 'Вернитесь в приложение и нажмите «Повторить»']} />
      </Card>
      <p className="t-small c-2">Пока доступа нет, цель дня, серия и награды за активность недоступны. Ошибка данных — не ваш пропуск.</p>
    </Screen>
  );
}

/* ───────────── 16 · Мало истории ───────────── */

function Little({ onStart }: { onStart: () => void }) {
  return (
    <Screen dock={<Button onClick={onStart}>Начать</Button>}>
      <div className="onb-spacer" />
      <h1 className="t-h1">Данные подключены, истории пока мало</h1>
      <Banner tone="wait" title="Истории меньше двух недель">
        Стартовую планку рассчитаем по вашим ответам и уточним, когда накопятся данные.
      </Banner>
      <Card size="l" palette="steps" delay={0.1}>
        <span className="t-small">Предварительная цель на завтра</span>
        <span className="t-h2">
          <AnimatedNumber value={6000} /> шагов
        </span>
        <span className="t-small">или 280 ккал, или 4,2 км. Через неделю пересчитаем планку по фактическим данным и объясним изменение.</span>
      </Card>
      <Card size="l" palette="yellow" delay={0.2}>
        <div className="card-title">
          <span className="t-small">Первая награда</span>
          <RewardChip label="+150 спортиков" />
        </div>
        <span className="t-small">Награда за онбординг не зависит от объёма истории.</span>
      </Card>
    </Screen>
  );
}

/* ───────────── 17 · Возврат ───────────── */

function Return({ onContinue, onRestart }: { onContinue: () => void; onRestart: () => void }) {
  return (
    <Screen
      dock={
        <>
          <Button onClick={onContinue}>Продолжить</Button>
          <Button variant="ghost" onClick={onRestart}>
            Начать онбординг заново
          </Button>
        </>
      }
    >
      <div className="onb-spacer" />
      <div className="q-head">
        <div className="stack-v gap-8 grow">
          <h1 className="t-h1">Продолжим с того места, где остановились</h1>
          <p className="t-body c-2">Ваши ответы сохранены. Осталось два шага: последний вопрос и подключение данных.</p>
        </div>
        <Img3D name="flag" size={84} float />
      </div>
      <Card size="l">
        <div className="kv">
          <div className="kv__row">
            <span className="t-small c-2">Ценность продукта</span>
            <span className="t-small-s c-ok">Пройдено</span>
          </div>
          <div className="kv__row">
            <span className="t-small c-2">Пять вопросов</span>
            <span className="t-small-s">4 из 5</span>
          </div>
          <div className="kv__row">
            <span className="t-small c-2">Подключение данных</span>
            <span className="t-small-s c-2">Не начато</span>
          </div>
          <div className="kv__row">
            <span className="t-small c-2">Результат и первая цель</span>
            <span className="t-small-s c-2">Не начато</span>
          </div>
        </div>
      </Card>
    </Screen>
  );
}
