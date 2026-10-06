import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Empty, NavBar, PageHeader, Screen } from '../../ui/shell';
import { Banner, Button, Card, CardTitle, KV, RewardChip, Segmented, StatusChip, TickBar, cx } from '../../ui/kit';
import { Img3D } from '../../ui/Img3D';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Sheet } from '../../ui/overlays';
import { Dialog } from '../../ui/overlays';
import { useApp } from '../../lib/store';
import { PRIZES, RECEIVED, type Prize } from '../../data/content';
import { PAL, palVars } from '../../lib/palette';
import { fmt } from '../../lib/format';

type Seg = 'available' | 'received';

export function PrizesScreen() {
  const { data, push, openSheet } = useApp();
  const [seg, setSeg] = useState<Seg>('available');

  return (
    <Screen tabs top={<PageHeader kicker="обменяй спортики" title="Призы" />}>
      <Segmented id="prizes" value={seg} onChange={setSeg} items={[{ id: 'available', label: 'Доступные' }, { id: 'received', label: 'Полученные' }]} />
      <AnimatePresence mode="wait">
        <motion.div key={seg} className="stack-v gap-20 grow-col" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {seg === 'available' ? (
            data.prizesEmpty ? (
              <>
                <Empty
                  img={<Img3D name="box" size={170} float />}
                  title="Призов пока нет"
                  text="Работодатель ещё не добавил предложения. Спортики копятся и никуда не пропадут."
                  action={
                    <Button variant="secondary" onClick={() => openSheet('sportiki')}>
                      Как получать спортики
                    </Button>
                  }
                />
                <p className="t-small c-2 center">В каталоге нет чужих корпоративных призов — только предложения вашей компании.</p>
              </>
            ) : (
              <>
                <div className="prize-grid">
                  {PRIZES.map((p, i) => (
                    <PrizeTile key={p.id} p={p} i={i} balance={data.balance} onOpen={() => push('prize', { id: p.id })} onExchange={() => openSheet('exchange', { id: p.id })} />
                  ))}
                </div>
                <p className="t-small c-2">Право на приз и возможность обменять его сейчас — разные состояния: нехватка спортиков приз не скрывает.</p>
              </>
            )
          ) : (
            <>
              {RECEIVED.map((r, i) => (
                <Card key={r.id} className="recv" delay={i * 0.06} onClick={() => push('prize-received', { id: r.id })}>
                  <div className="recv__main">
                    <span className="recv__img hero-img" style={palVars(r.prizeId === 'bottle' ? 'dist' : 'yellow')}>
                      <Img3D name={r.img} size={36} pop={false} />
                    </span>
                    <div className="stack-v gap-2 grow">
                      <span className="t-body-s">{r.title}</span>
                      <span className="t-small c-2">
                        {r.date} · {fmt(r.price)} спортиков
                      </span>
                    </div>
                    {r.status === 'credited' ? <StatusChip tone="ok" size="s">начислено</StatusChip> : <StatusChip tone="wait" size="s">ожидает выдачи</StatusChip>}
                  </div>
                  <span className="t-small c-2">{r.note}</span>
                </Card>
              ))}
              <p className="t-small c-2">Оформленный обмен и фактическая выдача мерча различаются явно. Один и тот же приз может быть и здесь, и в «Доступных», пока не исчерпана квота.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}

function PrizeTile({ p, i, balance, onOpen, onExchange }: { p: Prize; i: number; balance: number; onOpen: () => void; onExchange: () => void }) {
  const short = p.price - balance;
  return (
    <motion.div className="prize card" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.07 }} whileTap={{ scale: 0.98 }} onClick={onOpen}>
      <div className="prize__img hero-img" style={palVars(p.palette)}>
        <Img3D name={p.img} size={p.img === 'bottle' || p.img === 'dumbbell' ? 104 : 96} float delay={i * 0.4} rotate={p.img === 'dumbbell' ? -12 : 0} />
      </div>
      <span className="t-body-s prize__title">{p.title}</span>
      <span className="t-small c-2 prize__sub">{p.subtitle}</span>
      <RewardChip amount={p.price} sign="" animate={false} size="m" className="prize__price" />
      <div onClick={(e) => e.stopPropagation()}>
        {p.quotaExhausted ? (
          <Button variant="disabled" size="s">
            Квота исчерпана
          </Button>
        ) : short > 0 ? (
          <Button variant="disabled" size="s">
            Не хватает {fmt(short)}
          </Button>
        ) : (
          <Button size="s" onClick={onExchange}>
            Обменять
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────── Шторка обмена ───────────── */

export function ExchangeSheet({ id }: { id: string }) {
  const { data, closeSheet, set, resolveTo } = useApp();
  const p = PRIZES.find((x) => x.id === id) ?? PRIZES[0];
  const left = data.balance - p.price;
  return (
    <Sheet
      onClose={closeSheet}
      closeButton={false}
      footer={
        <>
          <Button
            icon="checkS"
            onClick={() => {
              set((d) => ({ balance: d.balance - p.price, exchanged: [...d.exchanged, p.id] }));
              resolveTo('prize-done', { id: p.id });
            }}
          >
            Обменять за {fmt(p.price)}
          </Button>
          <Button variant="ghost" onClick={closeSheet}>
            Отмена
          </Button>
        </>
      }
    >
      <div className="xchg__img hero-img" style={palVars(p.palette)}>
        <Img3D name={p.img} size={150} float />
      </div>
      <div className="stack-v gap-4 center">
        <span className="t-h2">{p.title}</span>
        <span className="t-small c-2">
          Спишем {fmt(p.price)} спортиков, {p.kind === 'aladdin' ? 'деньги придут на счёт Aladdin в течение дня.' : 'приз выдаст HR лично.'}
        </span>
      </div>
      <Card palette="yellow" className="xchg__left">
        <div className="hstack between">
          <div className="stack-v gap-2">
            <span className="t-small">Останется</span>
            <span className="t-h3">
              <AnimatedNumber value={left} from={data.balance} delay={0.2} /> спортиков
            </span>
          </div>
          <span className="chip chip--white" style={palVars('yellow')}>
            −{fmt(p.price)}
          </span>
        </div>
      </Card>
    </Sheet>
  );
}

/* ───────────── Карточка приза ───────────── */

export function PrizeScreen({ id }: { id: string }) {
  const { data, openDialog, openSheet } = useApp();
  const p = PRIZES.find((x) => x.id === id) ?? PRIZES[0];
  const short = p.price - data.balance;
  const can = short <= 0 && !p.quotaExhausted;

  const dock = p.quotaExhausted ? (
    <>
      <Button variant="disabled">Квота исчерпана</Button>
      <p className="t-small dock__note">Следующее получение будет доступно с 1 января</p>
    </>
  ) : short > 0 ? (
    <>
      <Button variant="disabled">Не хватает {fmt(short)} спортиков</Button>
      <p className="t-small dock__note">Причина недоступности указана прямо на кнопке</p>
    </>
  ) : (
    <>
      <Button icon="checkS" onClick={() => openDialog('prize-confirm', { id: p.id })}>
        Обменять за {fmt(p.price)}
      </Button>
      <p className="t-small dock__note">
        {p.kind === 'aladdin' ? `На балансе ${fmt(data.balance)} спортиков — после обмена останется ${fmt(data.balance - p.price)}` : 'Обмен фиксирует получение из квоты, выдача происходит отдельно'}
      </p>
    </>
  );

  return (
    <Screen top={<NavBar title="Приз" balance />} dock={dock}>
      <div className="prize-hero hero-img" style={palVars(p.palette)}>
        <Img3D name={p.img === 'crystal' || p.img === 'boltGold' ? 'boltOrange' : p.img} size={150} float rotate={p.img === 'dumbbell' ? -12 : 0} />
      </div>
      <div className="stack-v gap-8">
        <h1 className="t-h1">{p.title}</h1>
        <span className="t-body c-2">{p.description}</span>
        <div className="hstack wrap">
          <RewardChip amount={p.price} sign="" />
          {p.quotaExhausted ? (
            <StatusChip tone="muted" icon="lock">
              квота исчерпана
            </StatusChip>
          ) : can ? (
            <StatusChip tone="ok">можно обменять</StatusChip>
          ) : (
            <StatusChip tone="err">не хватает {fmt(short)}</StatusChip>
          )}
        </div>
      </div>

      {p.quotaExhausted && (
        <Banner tone="info" title="Новый обмен недоступен до 1 января">
          Исчерпанная квота или завершённый срок предложения не позволяют новый обмен. Прошлые получения остаются в истории.
        </Banner>
      )}
      {!p.quotaExhausted && short > 0 && (
        <>
          <Banner tone="err" title={`Не хватает ${fmt(short)} спортиков`}>
            На балансе {fmt(data.balance)}. Приз остаётся в каталоге: право на приз и возможность обменять сейчас — разные состояния.
          </Banner>
          <Card size="l" delay={0.06}>
            <CardTitle>Сколько осталось накопить</CardTitle>
            <TickBar value={data.balance / p.price} color={PAL.yellow.accent} delay={0.2} />
            <span className="t-small-s">
              {fmt(data.balance)} из {fmt(p.price)} спортиков
            </span>
            <KV rows={[['Цель дня', '+50 за каждый выполненный день', 'c-reward'], ['Серия недели', '+200 за 5 выполненных дней', 'c-reward'], ['Вызовы дня', 'от +30', 'c-reward']]} />
            <button type="button" className="link-row t-small-s" onClick={() => openSheet('sportiki')}>
              Как получать спортики
            </button>
          </Card>
        </>
      )}

      <Card size="l" delay={0.1}>
        <CardTitle>Условия</CardTitle>
        <KV
          rows={
            p.quotaExhausted
              ? [['Личная квота', p.quota], ['Использовано', '2 из 2'], ['Следующая квота', 'с 1 января'], ['Срок предложения', 'до 31 декабря']]
              : [
                  ['Что получите', p.kind === 'aladdin' ? `${p.title.replace(' в Aladdin', '')} в кошелёк заданий Aladdin` : p.title],
                  ['Цена', `${fmt(p.price)} спортиков`],
                  ['Личная квота', p.quota],
                  ['Осталось', p.left],
                  ['Способ получения', p.method],
                ]
          }
        />
      </Card>
      {p.kind === 'aladdin' ? (
        <>
          <Card size="l" delay={0.14}>
            <CardTitle>Как получить</CardTitle>
            <span className="t-small c-2">Отдельно активировать сертификат или переходить в Aladdin ради начисления не нужно. После обмена сумма появится в кошельке, и вы сможете тратить её в Aladdin.</span>
          </Card>
          <Card size="l" delay={0.18}>
            <CardTitle>Это не универсальный курс</CardTitle>
            <span className="t-small c-2">Вы выбираете конкретное предложение работодателя. Цена и номинал фиксируются в момент обмена.</span>
          </Card>
        </>
      ) : p.quotaExhausted ? (
        <Card size="l" delay={0.14}>
          <CardTitle>Ваши прошлые получения</CardTitle>
          <KV rows={[['12 марта', '2 000 спортиков'], ['4 июля', '2 000 спортиков']]} />
        </Card>
      ) : (
        <Card size="l" delay={0.14}>
          <CardTitle>Как забрать</CardTitle>
          <KV rows={[['Где', 'HR, каб. 214, будни 10:00–18:00'], ['Срок', '14 дней после обмена']]} />
        </Card>
      )}
    </Screen>
  );
}

/* ───────────── Подтверждение обмена ───────────── */

export function PrizeConfirmDialog({ id }: { id: string }) {
  const { data, set, closeDialog, resolveTo } = useApp();
  const p = PRIZES.find((x) => x.id === id) ?? PRIZES[0];
  return (
    <Dialog title={`Получить «${p.title}»?`} onClose={closeDialog}>
      <div className="kv--box">
        <KV
          rows={[
            ['Спишем', `−${fmt(p.price)} спортиков`, 'c-err'],
            ['Останется', `${fmt(data.balance - p.price)} спортиков`],
            ['Получите', p.kind === 'aladdin' ? `${p.title.replace(' в Aladdin', '')} в кошелёк заданий` : p.title],
            ['Останется получений', p.kind === 'aladdin' ? '1 из 3 в сентябре' : '0 до 31 декабря'],
          ]}
        />
      </div>
      <p className="t-small c-2">Цена и результат сохранятся в истории. Изменение предложения работодателем не поменяет их задним числом.</p>
      <div className="dialog__actions">
        <Button
          icon="checkS"
          onClick={() => {
            set((d) => ({ balance: d.balance - p.price, exchanged: [...d.exchanged, p.id] }));
            resolveTo('prize-done', { id: p.id });
          }}
        >
          Обменять за {fmt(p.price)}
        </Button>
        <Button variant="ghost" onClick={closeDialog}>
          Отмена
        </Button>
      </div>
    </Dialog>
  );
}

/* ───────────── Обмен выполнен ───────────── */

export function PrizeDoneScreen({ id }: { id: string }) {
  const { popToRoot, push } = useApp();
  const p = PRIZES.find((x) => x.id === id) ?? PRIZES[0];
  const aladdin = p.kind === 'aladdin';
  return (
    <Screen
      top={<NavBar close />}
      dock={
        aladdin ? (
          <>
            <Button onClick={popToRoot}>Открыть Aladdin</Button>
            <Button variant="ghost" onClick={popToRoot}>
              Вернуться к призам
            </Button>
          </>
        ) : (
          <>
            <Button onClick={popToRoot}>Понятно</Button>
            <Button variant="ghost" onClick={() => push('support')}>
              Написать HR
            </Button>
          </>
        )
      }
    >
      <div className="done-hero">
        <Confetti />
        <Img3D name={aladdin ? 'check' : 'bottle'} size={aladdin ? 120 : 140} float rotate={aladdin ? -4 : 0} />
        <motion.h1 className="t-h1 center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {aladdin ? `${p.title.replace(' в Aladdin', '')} начислены` : 'Обмен оформлен'}
        </motion.h1>
        <motion.p className="t-body c-2 center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          {aladdin ? 'Сумма уже в кошельке заданий Aladdin. Активировать сертификат не нужно.' : 'Приз пока не выдан — это ожидание выдачи, а не фактическое получение.'}
        </motion.p>
      </div>
      <Card size="l" delay={0.3}>
        <CardTitle>Детали получения</CardTitle>
        <KV
          rows={
            aladdin
              ? [['Приз', p.title], ['Списано', `${fmt(p.price)} спортиков`], ['Дата', '24 сентября, 10:12'], ['Статус', 'начислено', 'c-ok'], ['Осталось получений', '1 из 3 в сентябре']]
              : [['Приз', p.title], ['Списано', `${fmt(p.price)} спортиков`], ['Дата обмена', '24 сентября, 10:20'], ['Статус', 'ожидает выдачи', 'c-warn'], ['Забрать до', '8 октября']]
          }
        />
      </Card>
      <Card size="l" delay={0.36}>
        <CardTitle>{aladdin ? 'Что дальше' : 'Инструкция'}</CardTitle>
        <span className="t-small c-2">
          {aladdin ? 'Откройте Aladdin под своей учётной записью и тратьте начисленные баллы из кошелька заданий.' : 'HR, каб. 214, будни 10:00–18:00. Назовите фамилию и номер обмена №А-2481. Вопросы — в поддержку.'}
        </span>
      </Card>
    </Screen>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const colors = ['#16a34a', '#ffd35c', '#1b96d1', '#b18cff', '#e07b18'];
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((i) => {
        const a = (i / pieces.length) * Math.PI * 2;
        const r = 90 + (i % 3) * 30;
        return (
          <motion.span
            key={i}
            style={{ background: colors[i % colors.length], borderRadius: i % 2 ? 2 : 6 }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8 + 30, scale: [0, 1, 0.8], rotate: i * 40, opacity: [1, 1, 0] }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        );
      })}
    </div>
  );
}

/* ───────────── Полученный приз ───────────── */

export function PrizeReceivedScreen({ id }: { id: string }) {
  const { push } = useApp();
  const r = RECEIVED.find((x) => x.id === id) ?? RECEIVED[1];
  const waiting = r.status === 'waiting';
  return (
    <Screen top={<NavBar title="Полученный приз" />} dock={<Button variant="secondary" onClick={() => push('support')}>Написать в поддержку</Button>}>
      <div className="prize-hero hero-img" style={palVars(waiting ? 'dist' : 'yellow')}>
        <Img3D name={r.img} size={140} float />
      </div>
      <div className="stack-v gap-8">
        <h1 className="t-h1">{r.title}</h1>
        <div>{waiting ? <StatusChip tone="wait">ожидает выдачи</StatusChip> : <StatusChip tone="ok">начислено</StatusChip>}</div>
      </div>
      <Card size="l" delay={0.06}>
        <CardTitle>Ваше получение</CardTitle>
        <KV rows={[['Номер обмена', '№А-2481'], ['Дата', `${r.date}, 14:02`], ['Списано', `${fmt(r.price)} спортиков`], ['Статус', waiting ? 'ожидает выдачи' : 'начислено', waiting ? 'c-warn' : 'c-ok']]} />
        <span className="t-small c-2">Цена и состав приза сохранены на момент обмена и не меняются задним числом.</span>
      </Card>
      <Card size="l" delay={0.1}>
        <CardTitle>{waiting ? 'Инструкция по получению' : 'Где посмотреть'}</CardTitle>
        <span className="t-small c-2">{waiting ? 'HR, каб. 214, будни 10:00–18:00. Забрать до 2 октября.' : 'Сумма в кошельке заданий Aladdin.'}</span>
      </Card>
      <Card size="l" delay={0.14}>
        <CardTitle>Эта же квота</CardTitle>
        <span className="t-small c-2">Получений в этом году больше не осталось: 1 из 1 использовано.</span>
      </Card>
    </Screen>
  );
}

/* ───────────── Ошибка обмена ───────────── */

export function PrizeErrorScreen() {
  const { data, push, openDialog } = useApp();
  return (
    <Screen
      top={<NavBar title="Приз" balance />}
      dock={
        <>
          <Button onClick={() => openDialog('prize-confirm', { id: 'a1000' })}>Повторить</Button>
          <Button variant="ghost" onClick={() => push('support')}>
            Написать в поддержку
          </Button>
        </>
      }
    >
      <div className="prize-hero prize-hero--s hero-img" style={palVars('yellow')}>
        <Img3D name="boltOrange" size={110} float />
      </div>
      <Banner tone="err" title="Не удалось выполнить обмен">
        Связь прервалась. Спортики не списаны, квота не израсходована — состояние осталось прежним.
      </Banner>
      <h1 className="t-h2">1 000 ₽ в Aladdin</h1>
      <Card size="l" delay={0.08}>
        <CardTitle>Что произошло</CardTitle>
        <KV rows={[['Списание', 'не выполнено'], ['Квота', 'не израсходована'], ['Баланс', `${fmt(data.balance)} спортиков — без изменений`]]} />
        <span className="t-small c-2">Повторное нажатие не создаст два получения. Если спортики списались, а приз не появился — напишите в поддержку.</span>
      </Card>
    </Screen>
  );
}

export { cx };
