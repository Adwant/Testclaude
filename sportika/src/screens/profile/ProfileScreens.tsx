import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Avatar, NavBar, Screen } from '../../ui/shell';
import { Banner, Button, Card, CardTitle, CheckList, IconBox, KV, Row, StatusChip, Steps, Toggle, cx } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Img3D } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Dialog, Sheet } from '../../ui/overlays';
import { useApp, type ActivityMode } from '../../lib/store';
import { METRIC_META, palVars, type Metric } from '../../lib/palette';
import { fmt } from '../../lib/format';
import { HOME_ORDER, HOME_PRESETS, type HomeStateKey } from '../../data/home';

/* ───────────── Профиль ───────────── */

export function ProfileScreen() {
  const { data, set, push, openSheet, openDialog } = useApp();
  return (
    <Screen tabs top={<NavBar large="Профиль" balance />}>
      <Card size="l" palette="blue" className="me">
        <div className="hstack" style={{ gap: 14 }}>
          <Avatar size={56} />
          <div className="stack-v gap-2 grow">
            <span className="t-h3">Аня Соколова</span>
            <span className="t-small" style={{ opacity: 0.8 }}>
              в Спортике с марта 2026
            </span>
          </div>
          <button type="button" className="me__edit" aria-label="Редактировать">
            <Icon name="pencil" size={18} />
          </button>
        </div>
        <div className="me__stats">
          {[
            [128, 'дней с целью'],
            [5, 'серия сейчас'],
            [11, 'лучшая серия'],
          ].map(([n, l], i) => (
            <div key={l} className="stack-v gap-2">
              <span className="t-h2">
                <AnimatedNumber value={n as number} delay={0.1 + i * 0.08} />
              </span>
              <span className="t-cap" style={{ opacity: 0.75 }}>
                {l}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <motion.div className="promo" style={palVars('dist')} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} onClick={() => push('sources')} whileTap={{ scale: 0.98 }}>
        <div className="stack-v gap-6 promo__text">
          <span className="chip chip--white promo__chip">Apple Watch · Garmin</span>
          <span className="t-h2">Подключи часы</span>
          <span className="t-small">Шаги и дистанция точнее, серия не прервётся</span>
        </div>
        <Img3D name="watch" size={140} float rotate={-6} className="promo__img" />
      </motion.div>

      <Card size="l" delay={0.12}>
        <CardTitle right={<span className="t-small c-2">любая закрывает день</span>}>Цели на день</CardTitle>
        <div className="rows">
          {(['steps', 'cal', 'dist'] as Metric[]).map((m) => (
            <Row
              key={m}
              icon={METRIC_META[m].icon}
              palette={m}
              title={METRIC_META[m].label}
              right={<span className="t-body-s tnum">{fmt(data.goals[m])}{m === 'cal' ? ' ккал' : m === 'dist' ? ' км' : ''}</span>}
              chevron
              onClick={() => openSheet('goal-edit', { metric: m })}
            />
          ))}
        </div>
      </Card>

      <Card size="l" delay={0.16}>
        <CardTitle>Источники данных</CardTitle>
        <div className="rows">
          <Row icon="apple" palette="white" title="Apple Здоровье" subtitle={<span className="c-ok">подключено · обновлено в 9:41</span>} chevron onClick={() => push('sources')} />
          <Row icon="google" palette="gray" title="Google Fit" subtitle="не подключено" chevron onClick={() => push('sources')} />
        </div>
      </Card>

      <Card size="l" delay={0.2}>
        <CardTitle>Уведомления</CardTitle>
        <div className="rows">
          <Row icon="bell" palette="blue" title="Напоминать о цели" subtitle="в 18:00, если цель не закрыта" right={<Toggle on={data.notify.goal} onChange={(v) => set((d) => ({ notify: { ...d.notify, goal: v } }))} />} />
          <Row icon="cal" palette="purple" title="Итоги недели" subtitle="по понедельникам утром" right={<Toggle on={data.notify.week} onChange={(v) => set((d) => ({ notify: { ...d.notify, week: v } }))} />} />
        </div>
      </Card>

      <Card size="l" delay={0.24}>
        <div className="rows">
          <Row icon="lock" palette="blue" title="Что видит компания" chevron onClick={() => push('company')} />
          <Row icon="chat" palette="gray" title="Поддержка" chevron onClick={() => push('support')} />
          <Row icon="settings" palette="purple" title="Состояния экранов" subtitle="прототип: все состояния из макета" chevron onClick={() => push('demo')} />
        </div>
      </Card>

      <Button variant="secondary" icon="logout" onClick={() => openDialog('logout')} style={{ color: 'var(--error)' }}>
        Выйти из аккаунта
      </Button>
    </Screen>
  );
}

/* ───────────── Шторка «Цель по метрике» ───────────── */

const STEP: Record<Metric, number> = { steps: 1000, cal: 50, dist: 1 };
const PRESETS: Record<Metric, number[]> = { steps: [6000, 8000, 10000, 12000], cal: [300, 400, 500, 600], dist: [5, 6, 7, 8] };

export function GoalEditSheet({ metric }: { metric: Metric }) {
  const { data, set, closeSheet, toast } = useApp();
  const [v, setV] = useState(data.goals[metric]);
  const [dir, setDir] = useState(0);
  const title = metric === 'steps' ? 'Цель по шагам' : metric === 'cal' ? 'Цель по калориям' : 'Цель по дистанции';
  const unit = metric === 'steps' ? 'шагов в день' : metric === 'cal' ? 'ккал в день' : 'км в день';
  const change = (n: number) => {
    setDir(n > v ? 1 : -1);
    setV(Math.max(STEP[metric], n));
  };
  return (
    <Sheet
      onClose={closeSheet}
      title={
        <span className="stack-v gap-2">
          <span>{title}</span>
          <span className="t-small c-2">Начнёт действовать с завтрашнего дня</span>
        </span>
      }
      footer={
        <>
          <Button
            onClick={() => {
              set((d) => ({ goals: { ...d.goals, [metric]: v } }));
              closeSheet();
              toast('Цель сохранена — начнёт действовать завтра');
            }}
          >
            Сохранить
          </Button>
          <Button variant="ghost" onClick={closeSheet}>
            Отмена
          </Button>
        </>
      }
    >
      <div className="stepper">
        <motion.button type="button" className="round-btn stepper__btn" whileTap={{ scale: 0.88 }} onClick={() => change(v - STEP[metric])} aria-label="Меньше">
          <Icon name="minusBig" size={22} />
        </motion.button>
        <div className="stepper__val">
          <div className="stepper__num t-display">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.span
                key={v}
                custom={dir}
                variants={{ enter: (d: number) => ({ y: d * 24, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d: number) => ({ y: d * -24, opacity: 0 }) }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              >
                {fmt(v)}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="t-small c-2">{unit}</span>
        </div>
        <motion.button type="button" className="round-btn round-btn--dark stepper__btn" whileTap={{ scale: 0.88 }} onClick={() => change(v + STEP[metric])} aria-label="Больше">
          <Icon name="plus" size={22} />
        </motion.button>
      </div>
      <div className="presets">
        {PRESETS[metric].map((p) => (
          <button key={p} type="button" className={cx('preset', p === v && 'is-on')} onClick={() => change(p)}>
            {p === v && <motion.span className="preset__bg" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
            <span>{fmt(p)}</span>
          </button>
        ))}
      </div>
      <Banner tone="info" icon="trend" title={metric === 'steps' ? 'За 30 дней в среднем 8 900 шагов' : metric === 'cal' ? 'За 30 дней в среднем 430 ккал' : 'За 30 дней в среднем 6,2 км'}>
        {fmt(v)} — {v <= (metric === 'steps' ? 10000 : metric === 'cal' ? 500 : 7) ? 'в самый раз, серию не потеряешь.' : 'амбициозно: возможно, серия будет прерываться.'}
      </Banner>
    </Sheet>
  );
}

/* ───────────── Источники данных ───────────── */

export function SourcesScreen({ revoked: forced }: { revoked?: boolean }) {
  const { data, set, push, openDialog } = useApp();
  const revoked = forced ?? data.homeState === 'revoked';
  if (revoked) {
    return (
      <Screen
        top={<NavBar title="Источники данных" />}
        dock={
          <>
            <Button icon="settings" onClick={() => openDialog('health')}>
              Открыть настройки
            </Button>
            <Button variant="secondary" onClick={() => openDialog('health')}>
              Повторить
            </Button>
          </>
        }
      >
        <Banner tone="err" title="Доступ к данным отозван">
          С 23 сентября приложение не получает данные. Цель дня, серия и награды за активность приостановлены.
        </Banner>
        <Card size="l" delay={0.06}>
          <div className="hstack" style={{ gap: 14 }}>
            <IconBox icon="apple" palette="white" size={48} />
            <div className="stack-v gap-2 grow">
              <span className="t-body-s">Apple Здоровье</span>
              <span className="t-small c-2">Последнее обновление 23 сентября, 09:10</span>
            </div>
            <StatusChip tone="err" icon="lock" size="s">
              нет доступа
            </StatusChip>
          </div>
        </Card>
        <Card size="l" delay={0.1}>
          <CardTitle>Что сделать</CardTitle>
          <Steps items={['Откройте «Настройки» → «Здоровье» → «Доступ к данным»', 'Найдите «Спортика» и включите нужные показатели', 'Вернитесь и нажмите «Повторить»']} />
        </Card>
        <p className="t-small c-2">Отсутствие данных не считается вашим пропуском: цель показывается как непосчитанная, а не проваленная.</p>
      </Screen>
    );
  }
  return (
    <Screen top={<NavBar title="Источники данных" />}>
      <Card size="l">
        <div className="hstack" style={{ gap: 14 }}>
          <IconBox icon="apple" palette="white" size={48} />
          <div className="stack-v gap-2 grow">
            <span className="t-body-s">Apple Здоровье</span>
            <span className="t-small c-2">Обновлено 12 минут назад</span>
          </div>
          <StatusChip tone="ok" size="s">
            подключено
          </StatusChip>
        </div>
        <KV
          rows={[
            ['Шаги', 'читаем', 'c-ok'],
            ['Тренировки', 'читаем', 'c-ok'],
            ['Дистанция', 'читаем', 'c-ok'],
            ['Активные калории', 'читаем', 'c-ok'],
            ['Геопозиция и маршруты', 'не читаем', 'c-2'],
            ['Медицинская карта', 'не читаем', 'c-2'],
          ]}
        />
      </Card>
      <Card size="l" delay={0.08}>
        <CardTitle>Дополнительные устройства</CardTitle>
        <span className="t-small c-2">Мы используем данные телефона и подключённых к нему устройств. Отдельные часы не обязательны для участия.</span>
        <Button variant="secondary" icon="watch" onClick={() => push('call', { id: 'device' })}>
          Подключить часы или браслет
        </Button>
      </Card>
      <Button
        variant="ghost"
        onClick={() => {
          set({ homeState: 'revoked', activityMode: 'revoked' });
          push('sources', { revoked: true });
        }}
      >
        Отключить Apple Здоровье
      </Button>
      <p className="t-small c-2">При отключении цель дня, серия и награды за активность перестанут считаться. Уже начисленные спортики останутся.</p>
    </Screen>
  );
}

/* ───────────── Что видит компания ───────────── */

export function CompanyScreen() {
  return (
    <Screen top={<NavBar title="Что видит компания" />}>
      <h1 className="t-h1">Ваши данные и компания</h1>
      <Card size="l" palette="steps">
        <span className="t-body-s">Компания видит</span>
        <CheckList
          tone="ok"
          items={['Сводные показатели по всем участникам программы', 'Долю сотрудников, подключивших данные', 'Долю выполненных целей и завершённых челленджей', 'Факт выдачи материальных наград — для учёта бюджета']}
        />
      </Card>
      <Card size="l" delay={0.08}>
        <span className="t-body-s">Компания не видит</span>
        <CheckList tone="no" items={['Ваши ответы в онбординге: пол, возраст, рост, вес', 'Вашу личную историю активности по дням', 'Ваши тренировки и показатели по отдельности', 'Личную историю коллег — её не видите и вы']} />
      </Card>
      <Card size="l" delay={0.14}>
        <span className="t-body-s">Учёт наград ≠ доступ к активности</span>
        <span className="t-small c-2">Компания знает, какой приз вы получили, чтобы его выдать и учесть бюджет. Это не даёт доступа к вашей личной истории активности.</span>
      </Card>
    </Screen>
  );
}

/* ───────────── Поддержка ───────────── */

export function SupportScreen() {
  const { push } = useApp();
  const topics: [Parameters<typeof Row>[0]['icon'], Parameters<typeof Row>[0]['palette'], string][] = [
    ['trend', 'steps', 'Активность не засчиталась'],
    ['clock', 'blue', 'Данные не обновляются'],
    ['bolt', 'yellow', 'Не начислены спортики'],
    ['gift', 'cal', 'Проблема с призом или выдачей'],
    ['users', 'purple', 'Результат задания отклонён'],
    ['chat', 'gray', 'Другое'],
  ];
  return (
    <Screen top={<NavBar title="Поддержка" />}>
      <h1 className="t-h1">С чем помочь?</h1>
      <Card size="l">
        <div className="rows">
          {topics.map(([ic, pal, t]) => (
            <Row key={t} icon={ic} palette={pal} title={t} chevron iconSize={36} onClick={() => push('ticket')} />
          ))}
        </div>
      </Card>
      <h2 className="t-h3">Ваши обращения</h2>
      <Card size="l" delay={0.08} onClick={() => push('ticket')}>
        <div className="hstack between" style={{ alignItems: 'flex-start' }}>
          <span className="t-body-s grow">Не начислены спортики за 21 сентября</span>
          <StatusChip tone="wait" size="s">
            в работе
          </StatusChip>
        </div>
        <KV rows={[['Обращение', '№S-1043'], ['Создано', '22 сентября, 09:40'], ['Ответим', 'до 24 сентября']]} />
      </Card>
      <p className="t-small c-2">Прикладывать данные вручную не нужно: обращение из конкретной цели, задания или начисления уже содержит контекст.</p>
    </Screen>
  );
}

export function TicketScreen() {
  const { toast } = useApp();
  return (
    <Screen top={<NavBar title="Обращение №S-1043" />} dock={<Button variant="secondary" icon="send" onClick={() => toast('Сообщение отправлено')}>Дополнить обращение</Button>}>
      <Banner tone="wait" title="В работе">
        Спасибо, проверяем начисление. Ответим до 24 сентября.
      </Banner>
      <Card size="l" delay={0.06}>
        <CardTitle>О чём обращение</CardTitle>
        <KV rows={[['Тема', 'не начислены спортики'], ['Дата события', '21 сентября'], ['Связано с', 'цель дня, выполнена по шагам'], ['Статус', 'в работе', 'c-warn']]} />
      </Card>
      <Card size="l" delay={0.1}>
        <CardTitle>Переписка</CardTitle>
        <motion.div className="msg msg--me" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <span className="t-cap c-2">Вы · 22 сентября, 09:40</span>
          <span className="t-small-s">Цель за 21 сентября выполнена, но +50 спортиков не пришли.</span>
        </motion.div>
        <motion.div className="msg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <span className="t-cap c-2">Поддержка · 22 сентября, 11:15</span>
          <span className="t-small-s">Спасибо, проверяем начисление. Вернёмся с ответом до 24 сентября.</span>
        </motion.div>
      </Card>
    </Screen>
  );
}

/* ───────────── Диалоги ───────────── */

export function LogoutDialog() {
  const { closeDialog, set, popToRoot } = useApp();
  return (
    <Dialog title="Выйти из аккаунта?" onClose={closeDialog}>
      <p className="t-small c-2">Баланс спортиков, история активности и участие в челленджах сохранятся. При следующем входе через Aladdin всё вернётся.</p>
      <div className="dialog__actions">
        <Button
          variant="danger"
          icon="logout"
          onClick={() => {
            popToRoot();
            setTimeout(() => set({ phase: 'onboarding', onbStart: 'login' }), 50);
          }}
        >
          Выйти
        </Button>
        <Button variant="ghost" onClick={closeDialog}>
          Отмена
        </Button>
      </div>
    </Dialog>
  );
}

/** Имитация системного запроса доступа к Здоровью внутри основного приложения. */
export function HealthAccessDialog() {
  const { closeDialog, set, toast, popToRoot } = useApp();
  return (
    <Dialog title="«Спортика» запрашивает доступ к данным Здоровья" onClose={closeDialog}>
      <p className="t-small c-2">Системный экран iOS. В прототипе разрешение сразу восстанавливает доступ.</p>
      <div className="dialog__actions">
        <Button
          onClick={() => {
            set({ homeState: 'progress', activityMode: 'normal' });
            popToRoot();
            toast('Доступ к Здоровью восстановлен');
          }}
        >
          Разрешить
        </Button>
        <Button variant="ghost" onClick={closeDialog}>
          Не разрешать
        </Button>
      </div>
    </Dialog>
  );
}

/* ───────────── Состояния экранов (демо) ───────────── */

export function DemoScreen() {
  const { data, set, push, setTab, popToRoot, reset } = useApp();
  const goHome = (k: HomeStateKey) => {
    set({ homeState: k });
    setTab('home');
  };
  const acts: [ActivityMode, string][] = [
    ['normal', 'Неделя и месяц'],
    ['short', 'Короткая история · новичок'],
    ['partial', 'Неполные данные'],
    ['revoked', 'Нет доступа'],
  ];
  return (
    <Screen top={<NavBar title="Состояния экранов" />}>
      <Banner tone="neutral" title="Для просмотра макета">
        Здесь собраны все состояния из Figma, которые в реальном приложении зависят от данных. Выберите — и экран откроется в нужном виде.
      </Banner>

      <DemoGroup title="02 · Главная">
        {HOME_ORDER.map((k) => (
          <DemoItem key={k} label={HOME_PRESETS[k].title} meta={HOME_PRESETS[k].figma} on={data.homeState === k} onClick={() => goHome(k)} />
        ))}
      </DemoGroup>

      <DemoGroup title="01 · Онбординг">
        <DemoItem label="Первый запуск" onClick={() => { popToRoot(); set({ phase: 'onboarding', onbStart: 'login' }); }} />
        <DemoItem label="Мало истории" onClick={() => { popToRoot(); set({ phase: 'onboarding', onbStart: 'little-history' }); }} />
        <DemoItem label="Возврат после перерыва" onClick={() => { popToRoot(); set({ phase: 'onboarding', onbStart: 'return' }); }} />
      </DemoGroup>

      <DemoGroup title="03–04 · Цель, серия, спортики">
        <DemoItem label="Серия · в процессе" onClick={() => push('streak', { state: 'progress' })} />
        <DemoItem label="Серия · бонус начислен" onClick={() => push('streak', { state: 'bonus' })} />
        <DemoItem label="Серия · ожидает начисления" onClick={() => push('streak', { state: 'pending' })} />
        <DemoItem label="Серия · неделя не выполнена" onClick={() => push('streak', { state: 'failed' })} />
        <DemoItem label="Как считается цель" onClick={() => push('goal-how')} />
        <DemoItem label="Изменение цели" onClick={() => push('goal-change')} />
        <DemoItem label="История спортиков" onClick={() => push('sportiki-history')} />
      </DemoGroup>

      <DemoGroup title="05 · Вызовы дня">
        <DemoItem label="Список вызовов" onClick={() => { set({ callsEmpty: false }); push('calls'); }} />
        <DemoItem label="Метрика · доступен" onClick={() => push('call', { id: 'steps12k', mode: 'metric' })} />
        <DemoItem label="Метрика · выполнен" onClick={() => push('call', { id: 'steps12k', mode: 'metric-done' })} />
        <DemoItem label="Ручная проверка · доступен" onClick={() => push('call', { id: 'gym', mode: 'manual' })} />
        <DemoItem label="Ожидает проверки" onClick={() => push('call', { id: 'gym', mode: 'pending' })} />
        <DemoItem label="Одобрено" onClick={() => push('call', { id: 'gym', mode: 'approved' })} />
        <DemoItem label="Отклонено" onClick={() => push('call', { id: 'gym', mode: 'rejected' })} />
        <DemoItem label="Событие в приложении" onClick={() => push('call', { id: 'device' })} />
        <DemoItem label="Пустое состояние" onClick={() => { set({ callsEmpty: true }); push('calls'); }} />
      </DemoGroup>

      <DemoGroup title="06 · Челленджи">
        <DemoItem label="Регулярный · бесплатно" onClick={() => push('challenge', { id: 'steps10k', state: 'available' })} />
        <DemoItem label="Вход за спортики" onClick={() => push('challenge', { id: 'marathon', state: 'available' })} />
        <DemoItem label="Не хватает спортиков" onClick={() => { set({ balance: 40 }); push('challenge', { id: 'marathon', state: 'available' }); }} meta="баланс 40" />
        <DemoItem label="Регулярный · активный" onClick={() => push('challenge', { id: 'steps10k', state: 'active' })} />
        <DemoItem label="Накопительный · активный" onClick={() => push('challenge', { id: 'marathon', state: 'active' })} />
        <DemoItem label="Ручная проверка · активный" onClick={() => push('challenge', { id: 'gym6', state: 'active' })} />
        <DemoItem label="Выполнен · начислено" onClick={() => push('challenge', { id: 'steps10k', state: 'done' })} />
        <DemoItem label="Выполнен · ожидание" onClick={() => push('challenge', { id: 'marathon', state: 'done-pending' })} />
        <DemoItem label="Не выполнен" onClick={() => push('challenge', { id: 'nolift', state: 'failed' })} />
        <DemoItem label="Ошибка вступления" onClick={() => push('challenge', { id: 'marathon', state: 'error' })} />
        <DemoItem label="Активные · пусто" onClick={() => { set({ callsEmpty: true }); setTab('tasks'); }} />
      </DemoGroup>

      <DemoGroup title="07 · Активность">
        {acts.map(([m, l]) => (
          <DemoItem key={m} label={l} on={data.activityMode === m} onClick={() => { set({ activityMode: m }); setTab('activity'); }} />
        ))}
      </DemoGroup>

      <DemoGroup title="08 · Призы">
        <DemoItem label="Каталог" onClick={() => { set({ prizesEmpty: false }); setTab('prizes'); }} />
        <DemoItem label="Пустое состояние" onClick={() => { set({ prizesEmpty: true }); setTab('prizes'); }} />
        <DemoItem label="Приз Aladdin · можно обменять" onClick={() => { set({ balance: Math.max(data.balance, 1240) }); push('prize', { id: 'a1000' }); }} />
        <DemoItem label="Приз · не хватает спортиков" onClick={() => push('prize', { id: 'a3000' })} />
        <DemoItem label="Приз · квота исчерпана" onClick={() => push('prize', { id: 'gym' })} />
        <DemoItem label="Мерч · способ получения" onClick={() => push('prize', { id: 'bottle' })} />
        <DemoItem label="Обмен выполнен · Aladdin" onClick={() => push('prize-done', { id: 'a1000' })} />
        <DemoItem label="Обмен выполнен · мерч" onClick={() => push('prize-done', { id: 'bottle' })} />
        <DemoItem label="Полученный приз" onClick={() => push('prize-received', { id: 'r2' })} />
        <DemoItem label="Ошибка обмена" onClick={() => push('prize-error')} />
      </DemoGroup>

      <DemoGroup title="09 · Профиль">
        <DemoItem label="Источники · подключено" onClick={() => push('sources', { revoked: false })} />
        <DemoItem label="Источники · доступ отозван" onClick={() => push('sources', { revoked: true })} />
        <DemoItem label="Что видит компания" onClick={() => push('company')} />
        <DemoItem label="Поддержка" onClick={() => push('support')} />
        <DemoItem label="Обращение" onClick={() => push('ticket')} />
      </DemoGroup>

      <Button
        variant="secondary"
        onClick={() => {
          reset();
          popToRoot();
        }}
      >
        Сбросить прототип
      </Button>
    </Screen>
  );
}

function DemoGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card size="l">
      <span className="t-body-s">{title}</span>
      <div className="demo-list">{children}</div>
    </Card>
  );
}

function DemoItem({ label, meta, on, onClick }: { label: string; meta?: string; on?: boolean; onClick: () => void }) {
  return (
    <motion.button type="button" className={cx('demo-item', on && 'is-on')} onClick={onClick} whileTap={{ scale: 0.97 }}>
      <span className="t-small-s">{label}</span>
      {meta && <span className="t-cap c-2">{meta}</span>}
      {on ? <Icon name="checkS" size={16} /> : <Icon name="chevR" size={16} className="c-2" />}
    </motion.button>
  );
}

export { Img3D };
