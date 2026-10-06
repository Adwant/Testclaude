import { motion } from 'framer-motion';
import { Empty, NavBar, Screen, Section } from '../../ui/shell';
import { Banner, Button, Card, CardTitle, IconBox, KV, RewardChip, StatusChip, TickBar, cx } from '../../ui/kit';
import { Icon, type IconName } from '../../ui/Icon';
import { Img3D } from '../../ui/Img3D';
import { useApp } from '../../lib/store';
import { CALLS, ONE_TIME, type Call, type CallStatus } from '../../data/content';
import { PAL } from '../../lib/palette';

/* ───────────── Список вызовов ───────────── */

export function CallsScreen() {
  const { push, data, setTab } = useApp();
  if (data.callsEmpty) {
    return (
      <Screen tabs top={<NavBar title="Вызовы" />}>
        <Empty
          img={<Img3D name="clipboard" size={170} float />}
          title="Сегодня вызовов нет"
          text="Новые короткие задания появятся, когда работодатель их запустит. Цель дня и челленджи работают как обычно."
          action={<Button onClick={() => setTab('tasks')}>Перейти к челленджам</Button>}
        />
      </Screen>
    );
  }
  const statusOf = (c: Call): CallStatus => (c.kind === 'manual' && !data.submitted[c.id] && c.id !== 'gym' ? 'available' : c.status);
  return (
    <Screen tabs top={<NavBar title="Вызовы" />}>
      <Section
        title={
          <span className="hstack">
            Сегодня <span className="chip chip--purple counter-chip">3 активных</span>
          </span>
        }
      >
        {CALLS.map((c, i) => (
          <CallRow key={c.id} c={c} status={statusOf(c)} i={i} onClick={() => push('call', { id: c.id })} />
        ))}
      </Section>
      <Section
        delay={0.1}
        title={
          <span className="hstack">
            Разовые задания <span className="chip chip--purple counter-chip">2 доступно</span>
          </span>
        }
      >
        {ONE_TIME.map((c, i) => (
          <CallRow key={c.id} c={c} status={c.status} i={i + 3} onClick={c.status === 'done' ? undefined : () => push('call', { id: c.id })} />
        ))}
      </Section>
      <p className="t-small c-2">Завершённый онбординг и уже подключённое устройство повторно не предлагаются.</p>
    </Screen>
  );
}

const STATUS_CHIP: Record<CallStatus, { tone: 'muted' | 'wait' | 'ok' | 'err'; text: string; icon?: IconName }> = {
  available: { tone: 'muted', text: 'доступно', icon: 'clock' },
  pending: { tone: 'wait', text: 'на проверке' },
  approved: { tone: 'ok', text: 'одобрено' },
  rejected: { tone: 'err', text: 'отклонено' },
  done: { tone: 'ok', text: 'выполнено' },
};

function CallRow({ c, status, i, onClick }: { c: Call; status: CallStatus; i: number; onClick?: () => void }) {
  const st = STATUS_CHIP[status];
  const muted = status === 'done' && c.oneTime;
  return (
    <Card className={cx('call-row', muted && 'is-muted')} delay={0.04 * i} onClick={onClick}>
      <div className="call-row__main">
        <IconBox icon={c.icon} palette="purple" size={40} />
        <div className="stack-v gap-2 grow">
          <span className="t-body-s">{c.title}</span>
          <span className="t-small c-2">
            {c.deadline ? `${c.deadline} · ` : ''}
            {c.meta}
          </span>
        </div>
        <div className="call-row__side">
          <RewardChip amount={c.reward} animate={false} />
          {!(c.progress !== undefined && c.progress > 0) && <StatusChip tone={st.tone} icon={st.icon} size="s">{st.text}</StatusChip>}
        </div>
      </div>
      {c.progress !== undefined && c.progress > 0 && <TickBar value={c.progress} color={PAL.purple.accent} />}
    </Card>
  );
}

/* ───────────── Карточка вызова ───────────── */

function CallHeader({ c, status }: { c: Call; status: CallStatus }) {
  const st = STATUS_CHIP[status];
  return (
    <Card size="l" palette="purple" className="call-head">
      <div className="hstack" style={{ gap: 14 }}>
        <motion.span className="call-head__icon" initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          <Icon name={c.icon} size={26} />
        </motion.span>
        <h1 className="t-h2">{c.title}</h1>
      </div>
      <div className="hstack">
        <StatusChip tone={st.tone} icon={st.icon}>
          {st.text}
        </StatusChip>
        <RewardChip amount={c.reward} />
      </div>
    </Card>
  );
}

type CallMode = 'metric' | 'metric-done' | 'manual' | 'pending' | 'approved' | 'rejected' | 'event';

export function CallScreen({ id, mode: forced }: { id: string; mode?: CallMode }) {
  const { data, set, push, toast } = useApp();
  const c = [...CALLS, ...ONE_TIME].find((x) => x.id === id) ?? CALLS[0];
  const submitted = data.submitted[c.id];
  const mode: CallMode =
    forced ??
    (c.kind === 'event' ? 'event' : c.kind === 'manual' ? (submitted || c.status === 'pending' ? 'pending' : 'manual') : c.status === 'done' ? 'metric-done' : 'metric');
  const status: CallStatus = mode === 'metric-done' ? 'done' : mode === 'pending' ? 'pending' : mode === 'approved' ? 'approved' : mode === 'rejected' ? 'rejected' : 'available';

  const submit = () => {
    set((d) => ({ submitted: { ...d.submitted, [c.id]: true } }));
    toast('Отправлено на проверку');
  };

  let dock: React.ReactNode = undefined;
  if (mode === 'manual')
    dock = (
      <>
        <Button icon="share" onClick={submit}>
          Отправить на проверку
        </Button>
        <p className="t-small dock__note">Отправка на проверку не закрывает цель дня и не засчитывает день серии.</p>
      </>
    );
  if (mode === 'rejected')
    dock = (
      <>
        <Button icon="share" onClick={submit}>
          Отправить повторно
        </Button>
        <Button variant="ghost" onClick={() => push('support')}>
          Написать в поддержку
        </Button>
      </>
    );
  if (mode === 'event')
    dock = (
      <Button icon="watch" onClick={() => push('sources')}>
        Подключить устройство
      </Button>
    );

  return (
    <Screen top={<NavBar title={mode === 'event' ? 'Разовое задание' : 'Вызов'} />} dock={dock}>
      <CallHeader c={c} status={status} />

      {mode === 'metric' && (
        <>
          <Card size="l" delay={0.06}>
            <CardTitle>Что нужно сделать</CardTitle>
            <span className="t-small c-2">Набрать {c.title.replace('Пройти ', '').replace('Сжечь ', '')} до конца дня. Засчитается автоматически по подтверждённым данным устройства.</span>
            <TickBar value={c.progress ?? 0} color={PAL.purple.accent} delay={0.2} />
            <span className="t-small-s">{c.progressText}</span>
          </Card>
          <Card size="l" delay={0.1}>
            <CardTitle>Условия</CardTitle>
            <KV rows={[['Срок', 'сегодня до 23:59'], ['Подтверждение', 'данные Apple Health'], ['Награда', `+${c.reward} спортиков`, 'c-reward']]} />
          </Card>
          <Banner tone="info" title="Вызов может пересекаться с целью дня" delay={0.14}>
            Одна и та же активность учитывается и в цели, и в вызове. Награды разные, но сумма не заполняет кольцо цели дня.
          </Banner>
          <button type="button" className="link-row t-small c-2" onClick={() => push('call', { id: c.id, mode: 'metric-done' })}>
            Посмотреть состояние «выполнен»
            <Icon name="chevR" size={16} />
          </button>
        </>
      )}

      {mode === 'metric-done' && (
        <>
          <Banner tone="ok" title="Вызов выполнен">
            12 340 шагов подтверждены устройством. +{c.reward} спортиков начислены в 21:14.
          </Banner>
          <Card size="l" delay={0.06}>
            <CardTitle>Результат</CardTitle>
            <TickBar value={1} color={PAL.purple.accent} delay={0.15} />
            <span className="t-small-s">12 340 из 12 000 шагов</span>
          </Card>
          <Card size="l" delay={0.1}>
            <CardTitle>Что это продвинуло</CardTitle>
            <KV
              rows={[
                ['Цель дня', '100% по шагам — день закрыт', 'c-ok'],
                ['Челлендж', '«10 000 шагов каждый день» — день 4 из 7'],
              ]}
            />
          </Card>
          <p className="t-small c-2">Повторная загрузка тех же данных не начисляет награду второй раз.</p>
        </>
      )}

      {mode === 'manual' && (
        <>
          <Card size="l" delay={0.06}>
            <CardTitle>Что нужно сделать</CardTitle>
            <span className="t-small c-2">Провести тренировку и отправить подтверждение. Результат засчитает проверяющий — самостоятельно отметить «Выполнено» нельзя.</span>
          </Card>
          <Card size="l" delay={0.1}>
            <CardTitle>Условия</CardTitle>
            <KV
              rows={[
                ['Срок отправки', 'сегодня до 23:59'],
                ['Подтверждение', 'проверяет ответственный со стороны компании'],
                ['Срок проверки', 'до 2 рабочих дней'],
                ['Награда', '+60 спортиков', 'c-reward'],
              ]}
            />
          </Card>
          <Banner tone="wait" icon="warn" title="Формат подтверждения ещё не выбран" delay={0.14}>
            Фото тренировки — возможный пример. Обязательный фотоотчёт и автоматическая проверка этим прототипом не утверждаются.
          </Banner>
        </>
      )}

      {(mode === 'pending' || mode === 'approved') && (
        <>
          {mode === 'pending' ? (
            <Banner tone="wait" title="Результат отправлен 23 сентября">
              Проверка идёт. Пока результат не одобрен, он не увеличивает прогресс и не появляется в истории активности.
            </Banner>
          ) : (
            <Banner tone="ok" title="Результат одобрен">
              Проверяющий подтвердил тренировку 24 сентября. Засчитано за 23 сентября — день выполнения.
            </Banner>
          )}
          <Card size="l" delay={0.06}>
            <CardTitle>Статус проверки</CardTitle>
            <Timeline
              items={
                mode === 'pending'
                  ? [
                      { t: 'Отправлено на проверку', s: '23 сентября, 20:40', st: 'done' },
                      { t: 'Ожидает решения проверяющего', s: 'обычно до 2 рабочих дней', st: 'current' },
                      { t: 'Результат засчитан', st: 'todo' },
                      { t: 'Награда начислена', st: 'todo' },
                    ]
                  : [
                      { t: 'Отправлено на проверку', s: '23 сентября, 20:40', st: 'done' },
                      { t: 'Одобрено проверяющим', s: '24 сентября, 11:15', st: 'done' },
                      { t: 'Засчитано за 23 сентября', s: 'день выполнения, а не день одобрения', st: 'done' },
                      { t: '+60 спортиков начислены', s: '24 сентября, 11:15', st: 'done' },
                    ]
              }
            />
          </Card>
          {mode === 'pending' ? (
            <Card size="l" delay={0.1}>
              <CardTitle>Важно</CardTitle>
              <span className="t-small c-2">Если проверка закончится позже, результат отнесётся ко дню выполнения — 23 сентября, а не ко дню одобрения.</span>
              <span className="t-small c-2">Повторная отправка того же выполнения не увеличит результат второй раз.</span>
            </Card>
          ) : (
            <>
              <Card size="l" delay={0.1}>
                <CardTitle>Что это продвинуло</CardTitle>
                <KV
                  rows={[
                    ['Челлендж', '«6 тренировок за две недели» — 4 из 6'],
                    ['История активности', 'запись появилась за 23 сентября'],
                    ['Цель дня', 'не затронута'],
                  ]}
                />
              </Card>
              <p className="t-small c-2">Ручное одобрение не добавляет шаги, калории или тренировку в цель дня и не закрывает её.</p>
            </>
          )}
          <div className="hstack wrap" style={{ gap: 12 }}>
            {mode === 'pending' && (
              <button type="button" className="link-row t-small c-2" onClick={() => push('call', { id: c.id, mode: 'approved' })}>
                Состояние «одобрено» <Icon name="chevR" size={16} />
              </button>
            )}
            <button type="button" className="link-row t-small c-2" onClick={() => push('call', { id: c.id, mode: 'rejected' })}>
              Состояние «отклонено» <Icon name="chevR" size={16} />
            </button>
          </div>
        </>
      )}

      {mode === 'rejected' && (
        <>
          <Banner tone="err" title="Результат отклонён">
            Проверяющий не смог подтвердить выполнение. Награда не начислена, прогресс челленджа не изменился.
          </Banner>
          <Card size="l" delay={0.06}>
            <CardTitle>Комментарий проверяющего</CardTitle>
            <div className="quote t-small-s">«По присланному подтверждению не видно даты тренировки. Пришлите, пожалуйста, ещё раз.»</div>
            <span className="t-small c-2">Срок повторной отправки: до 26 сентября. Порядок разбора спорных случаев прорабатывается отдельно.</span>
          </Card>
        </>
      )}

      {mode === 'event' && (
        <>
          <Card size="l" delay={0.06}>
            <CardTitle>Что нужно сделать</CardTitle>
            <span className="t-small c-2">Подключить часы или браслет, если приложение поддерживает такой источник. Это необязательно: полноценно участвовать можно и без дополнительного устройства.</span>
          </Card>
          <Card size="l" delay={0.1}>
            <CardTitle>Условия</CardTitle>
            <KV rows={[['Тип', 'разовое задание'], ['Повтор', 'переподключение того же устройства награду не приносит'], ['Награда', '+100 спортиков один раз', 'c-reward']]} />
          </Card>
          <Banner tone="info" title="Продуктовые события отделены от активности" delay={0.14}>
            Вход, онбординг и подключение устройства не закрывают цель дня, не засчитывают серию и не попадают в историю физической активности.
          </Banner>
        </>
      )}
    </Screen>
  );
}

function Timeline({ items }: { items: { t: string; s?: string; st: 'done' | 'current' | 'todo' }[] }) {
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <motion.li key={i} className={cx('timeline__item', `is-${it.st}`)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
          <span className="timeline__dot">{it.st === 'done' && <Icon name="checkS" size={14} />}</span>
          <span className="stack-v gap-2">
            <span className={cx('t-body-s', it.st === 'todo' && 'c-2')}>{it.t}</span>
            {it.s && <span className="t-small c-2">{it.s}</span>}
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

