import { motion } from 'framer-motion';
import { NavBar, Screen } from '../../ui/shell';
import { Banner, Button, Card, CardTitle, KV, RewardChip, StatusChip, TickBar, cx } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Img3D } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Dialog } from '../../ui/overlays';
import { useApp } from '../../lib/store';
import { CHALLENGES, FINISHED, type Challenge } from '../../data/content';
import { PAL, palVars } from '../../lib/palette';
import { fmt } from '../../lib/format';

export type ChalState = 'available' | 'active' | 'done' | 'done-pending' | 'failed' | 'error';

function find(id: string): Challenge {
  return [...CHALLENGES, ...FINISHED].find((c) => c.id === id) ?? CHALLENGES[0];
}

/** Шапка активного/завершённого челленджа: фиолетовая карточка с названием и чипами. */
function ChalHead({ c, chip }: { c: Challenge; chip: React.ReactNode }) {
  return (
    <Card size="l" palette="purple" className="chal-head">
      <h1 className="t-h2">{c.title}</h1>
      <div className="hstack wrap">
        {chip}
        <RewardChip amount={c.reward} />
      </div>
    </Card>
  );
}

function DayDots({ days, start, today }: { days: ('done' | 'miss' | 'empty')[]; start: number; today?: number }) {
  return (
    <div className="weekdays" style={palVars('blue')}>
      {days.map((m, i) => {
        const n = start + i;
        const isToday = today === n;
        return (
          <div key={i} className={cx('wday', isToday ? 'wday--today' : `wday--${m}`)}>
            <motion.span className="wday__c" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.1 + i * 0.05 }}>
              {isToday ? <span className="t-small-s">{n}</span> : m === 'done' ? <Icon name="checkS" size={16} /> : m === 'miss' ? <Icon name="minus" size={16} /> : null}
            </motion.span>
            <span className={cx('t-cap', isToday && 't-cap-s')}>{n}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ChallengeScreen({ id, state }: { id: string; state?: ChalState }) {
  const { data, push, openDialog, openSheet, setTab, set } = useApp();
  const c = find(id);
  const joined = !!data.joined[c.id];
  const st: ChalState = state ?? (joined ? 'active' : c.state === 'available' ? 'available' : (c.state as ChalState));
  const purple = PAL.purple.accent;

  /* ── Доступен: регулярный бесплатный / за спортики / не хватает ── */
  if (st === 'available' && !joined) {
    const insufficient = c.fee > data.balance;
    const dock = insufficient ? (
      <>
        <Button variant="disabled">Не хватает {fmt(c.fee - data.balance)} спортиков</Button>
        <Button variant="ghost" onClick={() => openSheet('sportiki')}>
          Посмотреть, как получать спортики
        </Button>
      </>
    ) : (
      <Button
        icon={c.fee ? 'checkS' : undefined}
        onClick={() => {
          if (c.fee) openDialog('join', { id: c.id });
          else {
            set((d) => ({ joined: { ...d.joined, [c.id]: true } }));
          }
        }}
      >
        {c.fee ? `Вступить за ${c.fee} спортиков` : 'Участвовать'}
      </Button>
    );
    return (
      <Screen top={<NavBar title="Челлендж" />} dock={dock}>
        <div className="chal-hero hero-img" style={palVars(c.palette)}>
          <Img3D name={c.img} size={150} float rotate={c.img === 'sneaker' ? 4 : 0} />
        </div>
        <div className="stack-v gap-10">
          <h1 className="t-h1">{c.title}</h1>
          <div className="hstack wrap">
            {c.fee ? <RewardChip label={`вход ${c.fee} спортиков`} className="chip--fee" /> : <StatusChip tone="ok">вход бесплатный</StatusChip>}
            <RewardChip amount={c.reward} />
          </div>
        </div>
        {insufficient && (
          <Banner tone="err" title={`Не хватает ${fmt(c.fee - data.balance)} спортиков`}>
            На балансе {fmt(data.balance)} спортиков. Вступление не состоится, списания не будет.
          </Banner>
        )}
        <Card size="l" delay={0.06}>
          <CardTitle>{insufficient ? 'Как накопить' : 'Условие'}</CardTitle>
          {insufficient ? (
            <KV rows={[['Цель дня', '+50 за каждый выполненный день', 'c-reward'], ['Серия недели', '+200 за 5 выполненных дней', 'c-reward'], ['Ежедневные вызовы', 'от +30', 'c-reward']]} />
          ) : (
            <span className="t-small c-2">
              {c.type === 'cumulative'
                ? 'Набрать 100 км суммарно за период. Ежедневную норму выполнять не нужно: дни без активности не обнуляют накопленное.'
                : c.type === 'manual'
                  ? 'Провести 6 тренировок за две недели и отправить подтверждение каждой. Засчитывает проверяющий.'
                  : 'Каждый день в течение недели набирать не менее 10 000 шагов. Засчитывается по подтверждённым данным устройства.'}
            </span>
          )}
        </Card>
        {!insufficient && (
          <Card size="l" delay={0.1}>
            <CardTitle>Настройки челленджа</CardTitle>
            <KV
              rows={
                c.type === 'cumulative'
                  ? [
                      ['Вид', 'совокупный результат'],
                      ['Период', '1–31 октября'],
                      ['Метрика', 'дистанция, км'],
                      ['Целевое значение', '100 км'],
                      ['Допустимые пропуски', 'не применяются'],
                      ['Вход', `${c.fee} спортиков`],
                      ['Награда', `+${c.reward} спортиков`, 'c-reward'],
                    ]
                  : c.type === 'manual'
                    ? [
                        ['Вид', 'с ручной проверкой'],
                        ['Период', '17–30 сентября'],
                        ['Планка', '6 подтверждённых результатов'],
                        ['Вход', 'без взноса'],
                        ['Награда', `+${c.reward} спортиков`, 'c-reward'],
                      ]
                    : [
                        ['Вид', 'регулярное выполнение'],
                        ['Период', '24–30 сентября (7 дней)'],
                        ['Повторяемое условие', 'не менее 10 000 шагов в день'],
                        ['Допустимые пропуски', '2 дня из 7'],
                        ['Вход', 'без взноса'],
                        ['Награда', `+${c.reward} спортиков`, 'c-reward'],
                      ]
              }
            />
          </Card>
        )}
        {c.fee > 0 && !insufficient && (
          <Card size="l" palette="yellow" delay={0.14}>
            <span className="t-small">Ваш баланс</span>
            <div className="hstack">
              <RewardChip amount={data.balance} sign="" />
              <span className="t-small-s">после вступления останется {fmt(data.balance - c.fee)}</span>
            </div>
          </Card>
        )}
        {insufficient ? (
          <p className="t-small c-2">Челлендж остаётся видимым: право участвовать и возможность вступить прямо сейчас — разные состояния.</p>
        ) : (
          <Banner tone="info" title={c.fee ? 'Взнос открывает участие' : 'Открытие карточки не начинает участие'} delay={0.18}>
            {c.fee ? 'Он не покупает прогресс или выполнение. Списание один раз, повторное нажатие не приведёт к повторному взносу.' : 'Награда челленджа не заменяет выполнение цели дня и не закрывает её.'}
          </Banner>
        )}
      </Screen>
    );
  }

  /* ── Ошибка вступления ── */
  if (st === 'error') {
    return (
      <Screen
        top={<NavBar title="Челлендж" />}
        dock={
          <>
            <Button onClick={() => openDialog('join', { id: c.id })}>Повторить</Button>
            <Button variant="ghost" onClick={() => push('support')}>
              Написать в поддержку
            </Button>
          </>
        }
      >
        <Banner tone="err" title="Не удалось вступить">
          Связь прервалась. Спортики не списаны, участие не создано — состояние осталось прежним.
        </Banner>
        <ChalHead c={c} chip={<RewardChip label={`вход ${c.fee || 100} спортиков`} className="chip--fee" />} />
        <Card size="l" delay={0.08}>
          <CardTitle>Что произошло</CardTitle>
          <KV rows={[['Списание', 'не выполнено'], ['Участие', 'не создано'], ['Баланс', `${fmt(data.balance)} спортиков — без изменений`]]} />
        </Card>
        <p className="t-small c-2">Ошибка не должна оставлять списание без участия. Повторное нажатие не приводит к повторному взносу.</p>
      </Screen>
    );
  }

  /* ── Выполнен ── */
  if (st === 'done') {
    return (
      <Screen top={<NavBar title="Челлендж" />} dock={<Button icon="gift" onClick={() => setTab('prizes')}>Перейти в «Призы»</Button>}>
        <Banner tone="ok" title="Челлендж выполнен">
          +{c.reward} спортиков начислены 30 сентября в 23:05.
        </Banner>
        <ChalHead c={c} chip={<StatusChip tone="ok">выполнен</StatusChip>} />
        <Card size="l" delay={0.08}>
          <CardTitle>Итог</CardTitle>
          <DayDots days={['done', 'done', 'miss', 'done', 'done', 'done', 'done']} start={24} />
          <TickBar value={1} color={purple} />
          <KV rows={[['Зачтённые дни', '6 из 7'], ['Использованные пропуски', '1 из 2'], ['Награда', `+${c.reward} спортиков начислены`, 'c-reward']]} />
        </Card>
        <Card size="l" delay={0.12}>
          <CardTitle>Это не приз</CardTitle>
          <span className="t-small c-2">Завершение челленджа даёт спортики. Материальная награда появляется отдельно — через обмен спортиков в разделе «Призы».</span>
        </Card>
      </Screen>
    );
  }

  /* ── Выполнен, ожидает начисления ── */
  if (st === 'done-pending') {
    return (
      <Screen top={<NavBar title="Челлендж" />}>
        <Banner tone="wait" title="Условие выполнено, награда начисляется">
          Обычно занимает несколько минут. Начисление появится в истории спортиков.
        </Banner>
        <ChalHead c={find('marathon')} chip={<StatusChip tone="wait">начисляется</StatusChip>} />
        <Card size="l" delay={0.08}>
          <CardTitle>Итог</CardTitle>
          <div className="big-progress">
            <span className="t-display">
              <AnimatedNumber value={101.2} decimals={1} />
            </span>
            <span className="t-small c-2">из 100 км</span>
          </div>
          <TickBar value={1} color={purple} />
          <KV rows={[['Статус выполнения', 'зафиксировано 29 октября'], ['Статус награды', 'ожидает начисления', 'c-warn']]} />
          <span className="t-small c-2">Приложение различает выполнение, ожидание начисления, начисленные спортики и ошибку.</span>
        </Card>
      </Screen>
    );
  }

  /* ── Не выполнен ── */
  if (st === 'failed') {
    return (
      <Screen top={<NavBar title="Челлендж" />} dock={<><Button onClick={() => push('challenge', { id: 'steps10k', state: 'available' })}>Попробовать снова</Button><p className="t-small dock__note">Возможность новой попытки зависит от правил челленджа.</p></>}>
        <Banner tone="info" title="Попытка не засчитана">
          Использовано 3 пропуска при допустимых 2. Ранее начисленные спортики и история остаются у вас.
        </Banner>
        <ChalHead c={{ ...c, title: c.id === 'km50' ? c.title : 'Неделя без лифта' }} chip={<StatusChip tone="muted" icon="close">не выполнен</StatusChip>} />
        <Card size="l" delay={0.08}>
          <CardTitle>Итог</CardTitle>
          <DayDots days={['done', 'miss', 'done', 'miss', 'done', 'miss', 'done']} start={8} />
          <TickBar value={4 / 7} color={purple} />
          <KV rows={[['Зачтённые дни', '4 из 7'], ['Пропуски', '3 при допустимых 2', 'c-err'], ['Награда челленджа', 'не начислена']]} />
        </Card>
        <Card size="l" delay={0.12}>
          <CardTitle>Что это не отменяет</CardTitle>
          <span className="t-small c-2">Спортики за выполненные цели дня в эти даты остались у вас, серия недели считается отдельно, полученные призы не отзываются.</span>
        </Card>
      </Screen>
    );
  }

  /* ── Активный: регулярный / накопительный / ручная проверка ── */
  if (c.type === 'cumulative') {
    return (
      <Screen top={<NavBar title="Челлендж" />}>
        <ChalHead c={c} chip={<StatusChip tone="purple">участвую</StatusChip>} />
        <Card size="l" delay={0.06}>
          <CardTitle>Ваш прогресс</CardTitle>
          <div className="big-progress">
            <span className="t-display">
              <AnimatedNumber value={38.4} decimals={1} />
            </span>
            <span className="t-small c-2 grow">из 100 км</span>
            <span className="t-body-s" style={{ color: purple }}>
              <AnimatedNumber value={38} suffix="%" />
            </span>
          </div>
          <TickBar value={0.384} color={purple} delay={0.2} />
          <KV rows={[['Период', '1–31 октября'], ['Осталось', '18 дней'], ['Средний темп нужен', '3,4 км в день']]} />
          <span className="t-small c-2">Ежедневную норму выполнять не нужно. Дни без активности не прерывают попытку и не обнуляют накопленное.</span>
        </Card>
        <Card size="l" delay={0.1}>
          <CardTitle>Что суммируется</CardTitle>
          <span className="t-small c-2">Подходящие данные дистанции за период. Разные единицы не складываются автоматически: у метрики один источник и одно правило зачёта.</span>
        </Card>
        <Button variant="secondary">Выйти из челленджа</Button>
        <p className="t-small c-2">Правила выхода и возврата взноса определяются отдельно и сообщаются до вступления.</p>
      </Screen>
    );
  }

  if (c.type === 'manual') {
    const sent: [string, string, string][] = [
      ['22 сентября · тренировка', 'Одобрено', 'c-ok'],
      ['20 сентября · тренировка', 'Одобрено', 'c-ok'],
      ['18 сентября · тренировка', 'Одобрено', 'c-ok'],
      ['23 сентября · тренировка', 'Ожидает проверки', 'c-warn'],
      ['17 сентября · тренировка', 'Отклонено', 'c-err'],
    ];
    return (
      <Screen top={<NavBar title="Челлендж" />} dock={<Button icon="share" onClick={() => push('call', { id: 'gym', mode: 'manual' })}>Отправить результат</Button>}>
        <ChalHead c={c} chip={<StatusChip tone="purple">участвую</StatusChip>} />
        <Card size="l" delay={0.06}>
          <CardTitle>Ваш прогресс</CardTitle>
          <div className="big-progress">
            <span className="t-display">
              <AnimatedNumber value={3} />
            </span>
            <span className="t-small c-2">подтверждено из 6</span>
          </div>
          <TickBar value={0.5} color={purple} delay={0.2} />
          <div className="hstack" style={{ gap: 10, alignItems: 'flex-start' }}>
            <StatusChip tone="wait">ещё 1 ожидает проверки</StatusChip>
            <span className="t-cap c-2">не увеличивает подтверждённый прогресс</span>
          </div>
        </Card>
        <Card size="l" delay={0.1}>
          <CardTitle>Отправленные результаты</CardTitle>
          <div className="rows">
            {sent.map(([d, s, cls]) => (
              <div key={d} className="hstack between sent-row">
                <span className="t-small">{d}</span>
                <span className={cx('t-small-s', cls)}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card size="l" delay={0.14}>
          <CardTitle>Условие</CardTitle>
          <KV rows={[['Что считаем', 'число подтверждённых выполнений'], ['Период', '17–30 сентября'], ['Планка', '6 подтверждённых результатов']]} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen top={<NavBar title="Челлендж" />}>
      <ChalHead c={c} chip={<StatusChip tone="purple">участвую</StatusChip>} />
      <Card size="l" delay={0.06}>
        <CardTitle>Ваш прогресс</CardTitle>
        <DayDots days={['done', 'done', 'miss', 'done', 'empty', 'empty', 'empty']} start={24} today={28} />
        <TickBar value={3 / 7} color={purple} delay={0.25} />
        <KV rows={[['Зачтённые дни', '3 из 7'], ['Использованные пропуски', '1 из 2'], ['Осталось времени', '3 дня']]} />
        <span className="t-small c-2">Допустимый пропуск не становится выполненным днём, но и не проваливает челлендж.</span>
      </Card>
      <Card size="l" delay={0.1}>
        <CardTitle>Условие</CardTitle>
        <span className="t-small c-2">Не менее 10 000 шагов в день по подтверждённым данным устройства. Пороги задал администратор челленджа.</span>
      </Card>
      <Banner tone="info" icon="clock" title="Задержка данных — не пропуск" delay={0.14}>
        Пока синхронизация не завершилась, день показывается как ожидание, а не как подтверждённый пропуск.
      </Banner>
    </Screen>
  );
}

/* ───────────── Диалог подтверждения взноса ───────────── */

export function JoinDialog({ id }: { id: string }) {
  const { data, set, closeDialog, toast } = useApp();
  const c = find(id);
  return (
    <Dialog title={`Вступить в «${c.title}»?`} onClose={closeDialog}>
      <div className="kv kv--box">
        <KV
          rows={[
            ['Входной взнос', `−${c.fee} спортиков`, 'c-err'],
            ['Баланс сейчас', `${fmt(data.balance)} спортиков`],
            ['Останется', `${fmt(data.balance - c.fee)} спортиков`],
            ['Награда за выполнение', `+${c.reward} спортиков`, 'c-reward'],
          ]}
        />
      </div>
      <p className="t-small c-2">Списание произойдёт один раз. Повторное нажатие не приведёт к повторному взносу.</p>
      <div className="dialog__actions">
        <Button
          icon="checkS"
          onClick={() => {
            set((d) => ({ balance: d.balance - c.fee, joined: { ...d.joined, [c.id]: true } }));
            closeDialog();
            toast(`Вы в челлендже · −${c.fee} спортиков`);
          }}
        >
          Вступить и списать {c.fee}
        </Button>
        <Button variant="ghost" onClick={closeDialog}>
          Отмена
        </Button>
      </div>
    </Dialog>
  );
}
