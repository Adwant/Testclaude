import { motion } from 'framer-motion';
import { Sheet } from '../../ui/overlays';
import { NavBar, Screen } from '../../ui/shell';
import { Banner, Button, Card, CardTitle, IconBox, KV, RewardChip, StatusChip, TickBar, cx } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Img3D } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { useApp } from '../../lib/store';
import { HOME_PRESETS, leadOf, type WeekDay } from '../../data/home';
import { HISTORY } from '../../data/content';
import { METRIC_META, PAL, palVars, type Metric } from '../../lib/palette';
import { fmt } from '../../lib/format';
import { WeekDays } from '../home/parts';

/* ───────────── Шторка «Цель дня» ───────────── */

type GoalMode = 'progress' | 'done' | 'waiting' | 'revoked';

export function GoalSheet() {
  const { data, closeSheet, resolveTo } = useApp();
  const preset = HOME_PRESETS[data.homeState];
  const mode: GoalMode = preset.goal.revoked
    ? 'revoked'
    : preset.goal.closed
      ? 'done'
      : data.homeState === 'sync' || data.homeState === 'stale'
        ? 'waiting'
        : 'progress';
  const lead = leadOf(preset) ?? 'steps';
  const order: Metric[] = [lead, ...(['steps', 'cal', 'dist'] as Metric[]).filter((m) => m !== lead)];
  const tiles = Object.fromEntries(preset.tiles.map((t) => [t.metric, t]));

  const status =
    mode === 'done' ? (
      <StatusChip tone="ok">выполнена</StatusChip>
    ) : mode === 'waiting' ? (
      <StatusChip tone="wait">ждём данные</StatusChip>
    ) : mode === 'revoked' ? (
      <StatusChip tone="err" icon="lock">
        нет данных
      </StatusChip>
    ) : (
      <StatusChip tone="muted" icon="clock">
        не выполнена
      </StatusChip>
    );


  return (
    <Sheet onClose={closeSheet} title="Цель дня" tall>
      <div className="hstack between">
        <span className="t-body-s">Понедельник, 21 сентября</span>
        {status}
      </div>

      {mode === 'progress' && (
        <Banner tone="info" title="Достаточно одной планки">
          День закрывается при 100% по шагам, калориям или дистанции. Проценты не суммируются.
        </Banner>
      )}
      {mode === 'done' && (
        <Banner tone="ok" title={`День закрыт по ${lead === 'steps' ? 'шагам' : lead === 'cal' ? 'калориям' : 'дистанции'}`}>
          Награда начислена один раз, день серии засчитан. Планка сегодня уже не вырастет.
        </Banner>
      )}
      {mode === 'waiting' && (
        <Banner tone="wait" title="Часть показателей ещё не пришла">
          Калории не обновились с 14:20. Кольцо показывает максимум из уже подтверждённых способов.
        </Banner>
      )}
      {mode === 'revoked' && (
        <Banner tone="err" title="Доступ к данным отозван">
          Мы не получаем шаги, калории и дистанцию. Цель не считается невыполненной — её нельзя посчитать.
        </Banner>
      )}

      {order.map((m, i) => {
        const t = tiles[m];
        const meta = METRIC_META[m];
        const isLead = m === lead && mode !== 'revoked';
        const value = t.value;
        const pct = value === null ? 0 : Math.round((value / t.target) * 100);
        const noData = value === null;
        return (
          <Card key={m} palette={isLead ? m : undefined} size={isLead ? 'l' : 'm'} delay={0.05 + i * 0.07} className="method">
            <div className="method__head">
              <IconBox icon={meta.icon} palette={m} size={36} white={isLead} />
              <span className="t-body-s grow">{m === 'cal' ? 'Активные калории' : meta.label}</span>
              {isLead && mode === 'done' && (
                <span className="chip chip--white" style={palVars(m)}>
                  <Icon name="checkS" size={14} />
                  закрыла день
                </span>
              )}
              {isLead && mode !== 'done' && (
                <span className="chip chip--white" style={palVars(m)}>
                  <Icon name="trend" size={14} />
                  ведущий показатель
                </span>
              )}
              {!isLead && noData && mode === 'waiting' && <StatusChip tone="wait">ожидание</StatusChip>}
            </div>
            <div className="method__value">
              <span className="t-h2">
                {noData ? '—' : <AnimatedNumber value={value!} decimals={meta.decimals} />}
                {!noData && m !== 'steps' && <span className="t-h2"> {meta.of}</span>}
              </span>
              <span className="t-small c-2 grow">
                из {fmt(t.target)}
                {meta.of ? ' ' + meta.of : ''}
              </span>
              <span className="t-small-s" style={{ color: noData ? 'var(--text-2)' : PAL[m].accent }}>
                {noData ? 'нет данных' : <AnimatedNumber value={pct} suffix="%" />}
              </span>
            </div>
            <TickBar value={pct / 100} color={PAL[m].accent} opacity={noData ? 0.5 : 1} />
            <span className="t-small method__note">
              {mode === 'revoked'
                ? i === 0
                  ? 'Планка сохранена, зачёт возобновится после восстановления доступа.'
                  : null
                : noData
                  ? 'Это не подтверждённый ноль: значение появится после синхронизации.'
                  : isLead
                    ? mode === 'done'
                      ? 'Достигнуто 100% — этого достаточно.'
                      : 'Именно этот процент сейчас показывает кольцо на Главной.'
                    : mode === 'done'
                      ? i === 1
                        ? 'Повторную награду выполнение второй планки не даёт.'
                        : null
                      : mode === 'waiting'
                        ? 'Подтверждено устройством.'
                        : i === 1
                          ? 'Персональная планка на сегодня.'
                          : null}
            </span>
          </Card>
        );
      })}

      {mode !== 'revoked' && (
        <div className="goal-reward">
          <RewardChip amount={50} animate={false} />
          <span className="t-small c-2">
            {mode === 'done' ? 'начислено в 18:42 · история спортиков в профиле' : 'одна награда за цель дня, сколько бы планок вы ни выполнили'}
          </span>
        </div>
      )}

      <Card delay={0.3}>
        <CardTitle>Источник и свежесть данных</CardTitle>
        <KV
          rows={[
            ['Источник', 'Apple Health'],
            ['Обновлено', mode === 'waiting' ? '5 часов назад' : mode === 'revoked' ? '21 сентября, 09:10' : mode === 'done' ? '5 минут назад' : '12 минут назад', mode === 'waiting' ? 'c-warn' : undefined],
            ['Статус', mode === 'waiting' ? 'Ожидание данных' : mode === 'revoked' ? 'Разрешение отозвано' : 'Подключено', mode === 'waiting' ? 'c-warn' : mode === 'revoked' ? 'c-err' : 'c-ok'],
          ]}
        />
      </Card>

      <button
        type="button"
        className="link-row t-body-s"
        onClick={() => resolveTo(mode === 'revoked' ? 'support' : 'goal-how')}
      >
        {mode === 'revoked' ? 'Написать в поддержку' : 'Как считается моя цель'}
        <Icon name="chevR" size={16} />
      </button>
    </Sheet>
  );
}

/* ───────────── Как считается цель ───────────── */

export function GoalHowScreen() {
  const { push } = useApp();
  return (
    <Screen top={<NavBar title="Как считается цель" />}>
      <div className="stack-v gap-10">
        <h1 className="t-h1">Персональная цель</h1>
        <p className="t-body c-2">
          Планка рассчитывается по детерминированным правилам: одинаковые входные данные при одинаковых правилах дают одинаковый результат. Это не подбор нагрузки искусственным интеллектом и не медицинское назначение.
        </p>
      </div>
      <Card size="l">
        <CardTitle>Что мы учли</CardTitle>
        <KV
          rows={[
            ['История активности', '14 дней'],
            ['Средние шаги в день', <AnimatedNumber key="a" value={6400} />],
            ['Спорт вне телефона', '1–2 раза в неделю'],
            ['Пол, возраст, рост, вес', 'указаны в онбординге'],
          ]}
        />
      </Card>
      <Card size="l" delay={0.08}>
        <CardTitle>Как получилась планка</CardTitle>
        <p className="t-small c-2">
          По этим признакам вы отнесены к группе стартового уровня «умеренная активность». Для группы задана стартовая цель дня, из неё считаются сопоставимые пороги по шагам, калориям и дистанции.
        </p>
        <div className="hstack" style={{ gap: 10 }}>
          <span className="chip chip--blue">Умеренная активность</span>
          <span className="t-small c-2">ваша группа стартового уровня</span>
        </div>
      </Card>
      <Banner tone="info" title="Правило зачёта" delay={0.12}>
        Достаточно достичь 100% любой одной доступной планки. Кольцо показывает максимальный процент выполнения, а не сумму показателей и не количество спортиков.
      </Banner>
      <Banner tone="wait" icon="warn" title="Методика уточняется" delay={0.16}>
        Интервал и коэффициент роста планки определит методология. Планка не является медицинской рекомендацией.
      </Banner>
      <button type="button" className="link-row t-body-s" onClick={() => push('goal-change')}>
        Почему изменилась планка
        <Icon name="chevR" size={16} />
      </button>
    </Screen>
  );
}

/* ───────────── Изменение цели ───────────── */

export function GoalChangeScreen() {
  return (
    <Screen top={<NavBar title="Изменение цели" />}>
      <div className="stack-v gap-10">
        <h1 className="t-h1">Ваша планка выросла</h1>
        <p className="t-body c-2">Цель есть каждый день, но её планка растёт не каждый день. Через заданный интервал она повышается по настроенным правилам.</p>
      </div>
      <Card size="l" palette="steps">
        <div className="change">
          <div className="stack-v gap-2">
            <span className="t-small">Было</span>
            <span className="t-h3" style={{ opacity: 0.75 }}>
              7 000 шагов
            </span>
          </div>
          <motion.span className="change__arrow" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
            <Icon name="chevR" size={18} />
          </motion.span>
          <div className="stack-v gap-2">
            <span className="t-small">Стало</span>
            <span className="t-h2">
              <AnimatedNumber value={9000} from={7000} delay={0.3} /> шагов
            </span>
          </div>
        </div>
        <span className="t-small">Пересчитано 22 сентября по правилам роста для вашей группы. Сегодняшняя планка зафиксирована: выполнение цели не повышает её задним числом.</span>
      </Card>
      <Card size="l" delay={0.08}>
        <CardTitle>Как это работает</CardTitle>
        <KV
          rows={[
            ['Интервал пересчёта', 'раз в неделю'],
            ['Правило', 'повышение относительно стартовой цели'],
            ['Следующий пересчёт', '29 сентября'],
          ]}
        />
      </Card>
      <Banner tone="wait" icon="warn" title="Интервал и коэффициент ещё в разработке" delay={0.14}>
        Как учитывать перерывы, ограничения нагрузки и выполнение прошлых целей, определит методология.
      </Banner>
    </Screen>
  );
}

/* ───────────── Серия недели ───────────── */

type StreakState = 'progress' | 'bonus' | 'pending' | 'failed';

const WEEK_FULL = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
function wk(marks: WeekDay['mark'][], today?: number): WeekDay[] {
  return WEEK_FULL.map((label, i) => ({ label, mark: marks[i], num: today && i === today - 1 ? today : undefined }));
}

export function StreakScreen({ state = 'progress' }: { state?: StreakState }) {
  const { push } = useApp();
  return (
    <Screen top={<NavBar title="Серия недели" />}>
      {state === 'bonus' && (
        <Banner tone="ok" title="Бонус за неделю начислен">
          +200 спортиков зачислены на баланс 28 сентября в 21:05.
        </Banner>
      )}
      {state === 'pending' && (
        <Banner tone="wait" title="Условие выполнено, бонус начисляется">
          Обычно занимает несколько минут. Начисленный бонус появится в истории спортиков.
        </Banner>
      )}
      {state === 'failed' && (
        <Banner tone="info" title="Бонус за эту неделю не начислен">
          Выполнено 3 дня из 5. Ранее заработанные спортики и полученные призы остаются у вас.
        </Banner>
      )}

      {state === 'progress' && (
        <Card size="l">
          <div className="card-title">
            <span className="t-h3">22–28 сентября</span>
            <StatusChip tone="muted">осталось 4 дня</StatusChip>
          </div>
          <StreakDays days={wk(['done', 'done', 'done', 'today', 'empty', 'empty', 'empty'], 4)} />
          <span className="t-small c-2">Засчитано 3 выполнения из 5. Дни не обязаны идти подряд.</span>
        </Card>
      )}
      {state === 'bonus' && (
        <Card size="l" delay={0.05}>
          <div className="card-title">
            <span className="t-h3">22–28 сентября</span>
            <StatusChip tone="ok">выполнена</StatusChip>
          </div>
          <StreakDays days={wk(['done', 'done', 'done', 'miss', 'done', 'done', 'miss'])} />
          <span className="t-small c-2">5 выполненных дней из 5 нужных. Два дня пропущено — это не помешало получить бонус.</span>
        </Card>
      )}
      {state === 'pending' && (
        <Card size="l" delay={0.05}>
          <div className="card-title">
            <span className="t-h3">22–28 сентября</span>
            <StatusChip tone="wait">начисляется</StatusChip>
          </div>
          <StreakDays days={wk(['done', 'done', 'done', 'miss', 'done', 'done', 'today'], 7)} />
          <div className="hstack">
            <RewardChip amount={200} animate={false} />
            <span className="t-small c-2">ожидает начисления</span>
          </div>
        </Card>
      )}
      {state === 'failed' && (
        <>
          <Card size="l" delay={0.05}>
            <div className="card-title">
              <span className="t-h3">15–21 сентября</span>
              <StatusChip tone="muted" icon="cal">
                завершена
              </StatusChip>
            </div>
            <StreakDays days={wk(['done', 'miss', 'done', 'miss', 'done', 'miss', 'miss'])} />
            <span className="t-small c-2">Незавершённая неделя не отнимает награды за выполненные дни: за каждый из трёх дней спортики уже начислены.</span>
          </Card>
          <Card size="l" delay={0.1}>
            <span className="t-h3">Текущая неделя</span>
            <StreakDays days={wk(['done', 'done', 'done', 'today', 'empty', 'empty', 'empty'], 4)} />
            <span className="t-small c-2">Новая серия началась 22 сентября. Осталось 2 выполнения до бонуса.</span>
          </Card>
        </>
      )}

      {state === 'progress' && (
        <>
          <Card size="l" palette="yellow" delay={0.08}>
            <span className="t-h3">Награда за серию</span>
            <div className="hstack" style={{ gap: 10 }}>
              <RewardChip amount={200} />
              <span className="t-small-s">начислим, когда за неделю наберётся 5 выполненных дней</span>
            </div>
            <span className="t-small" style={{ opacity: 0.8 }}>
              Это отдельный недельный бонус: он не заменяет награду за цель дня.
            </span>
          </Card>
          <Card size="l" delay={0.14}>
            <CardTitle>Что засчитывает день</CardTitle>
            <ul className="checklist">
              <li>
                <span className="checklist__mark" style={{ background: 'rgba(22,163,74,.14)', color: '#16a34a' }}>
                  <Icon name="checkS" size={14} />
                </span>
                <span className="t-small">Выполнение личной цели дня по подтверждённым данным</span>
              </li>
              {['Вход в приложение', 'Награда за вызов или челлендж', 'Ручное одобрение задания само по себе'].map((t) => (
                <li key={t}>
                  <span className="checklist__mark" style={{ background: 'rgba(16,21,28,.06)', color: 'var(--text-2)' }}>
                    <Icon name="close" size={14} />
                  </span>
                  <span className="t-small c-2">{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
      {state === 'bonus' && (
        <Card size="l" delay={0.1}>
          <span className="t-h3">Следующая серия</span>
          <span className="t-small c-2">Новая неделя началась 29 сентября. Прогресс обнулён, заработанные спортики остаются у вас.</span>
        </Card>
      )}
      {state === 'pending' && <p className="t-small c-2">Ожидание начисления и уже начисленный бонус различаются явно — в истории спортиков и здесь.</p>}

      <button type="button" className="link-row t-body-s" onClick={() => push('streak-rules')}>
        Правила серии и пропусков
        <Icon name="chevR" size={16} />
      </button>
    </Screen>
  );
}

function StreakDays({ days }: { days: WeekDay[] }) {
  return (
    <div className="streak-days">
      <WeekDays days={days} palette="blue" delay={0.1} />
    </div>
  );
}

export function StreakRulesScreen() {
  return (
    <Screen top={<NavBar title="Правила серии" />}>
      <h1 className="t-h1">Как работает серия</h1>
      <Card size="l">
        <KV
          rows={[
            ['Что засчитывает день', 'выполнение цели дня по подтверждённым данным'],
            ['Сколько дней нужно', '5 выполнений за календарную неделю'],
            ['Подряд или нет', 'подряд не обязательно'],
            ['Допустимые пропуски', 'до 2 дней без потери бонуса'],
            ['Период', 'понедельник — воскресенье'],
            ['Награда', '+200 спортиков за выполненную неделю'],
          ]}
        />
      </Card>
      <Banner tone="info" icon="clock" title="Ожидание данных — не пропуск" delay={0.1}>
        Если синхронизация задержалась или произошла ошибка, день показывается как ожидание, а не как подтверждённый пропуск.
      </Banner>
      <Card size="l" delay={0.15}>
        <span className="t-body-s">Чего в первом релизе нет</span>
        <span className="t-small c-2">Заморозок серии, покупки восстановления, штрафов и потери ранее полученных наград.</span>
      </Card>
    </Screen>
  );
}

/* ───────────── Шторка «Спортики» ───────────── */

export function SportikiSheet() {
  const { data, closeSheet, setTab, resolveTo } = useApp();
  return (
    <Sheet
      onClose={closeSheet}
      title="Спортики"
      footer={
        <>
          <Button icon="gift" onClick={() => setTab('prizes')}>
            Перейти в «Призы»
          </Button>
          <Button
            variant="ghost"
            onClick={() => resolveTo('sportiki-history')}
          >
            История спортиков
          </Button>
        </>
      }
    >
      <Card size="l" palette="yellow" className="balance-card">
        <div className="stack-v gap-2">
          <span className="t-small">Ваш баланс</span>
          <span className="balance-card__num">
            <AnimatedNumber value={data.balance} duration={1.2} />
          </span>
          <span className="t-body-s">спортиков</span>
        </div>
        <Img3D name="crystal" size={104} float rotate={8} className="balance-card__img" />
      </Card>
      <Card size="l" delay={0.06}>
        <CardTitle>Как получать</CardTitle>
        <KV
          rows={[
            ['Выполненная цель дня', '+50', 'c-reward'],
            ['Недельная серия из 5 дней', '+200', 'c-reward'],
            ['Ежедневный вызов', '+30…100', 'c-reward'],
            ['Завершённый челлендж', 'по условию челленджа'],
            ['Онбординг и подключение данных', '+150 один раз', 'c-reward'],
          ]}
        />
      </Card>
      <Card size="l" delay={0.1}>
        <CardTitle>Как использовать</CardTitle>
        <span className="t-small c-2">Спортики обмениваются на призы в разделе «Призы»: награду Aladdin начислим в кошелёк, мерч выдаст компания.</span>
      </Card>
      <Banner tone="neutral" title="Важно" delay={0.14}>
        Спортики — игровая валюта внутри программы. Это не деньги и не обязательство выплаты.
      </Banner>
    </Sheet>
  );
}

/* ───────────── История спортиков ───────────── */

export function SportikiHistoryScreen() {
  return (
    <Screen top={<NavBar title="История спортиков" />}>
      <Banner tone="info" title="Здесь только спортики">
        Продуктовые события — вход, онбординг, подключение устройства — попадают сюда, но это не история активности.
      </Banner>
      <Card size="l" delay={0.06}>
        <div className="rows">
          {HISTORY.map((h, i) => (
            <motion.div key={i} className="hist-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <IconBox icon={h.icon} palette={h.palette} size={40} />
              <div className="stack-v gap-2 grow">
                <span className="t-body-s">{h.title}</span>
                <span className="t-small c-2">{h.date}</span>
              </div>
              <span className={cx('t-body-s tnum', h.amount > 0 && !h.pending && 'c-reward', h.pending && 'c-2')}>
                {h.amount > 0 ? '+' : '−'}
                {fmt(Math.abs(h.amount))}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </Screen>
  );
}
