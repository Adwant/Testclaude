import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Empty, PageHeader, Screen, Section, SeeAll } from '../../ui/shell';
import { Button, Card, IconBox, RewardChip, Segmented, StatusChip, TickBar } from '../../ui/kit';
import { Img3D } from '../../ui/Img3D';
import { useApp } from '../../lib/store';
import { CHALLENGES, FINISHED, type Challenge } from '../../data/content';
import { PAL, palVars } from '../../lib/palette';

type Seg = 'available' | 'active' | 'done';

export function TasksScreen() {
  const { push, data } = useApp();
  const [seg, setSeg] = useState<Seg>('available');
  const activeList = CHALLENGES;

  return (
    <Screen tabs top={<PageHeader kicker="челленджи и вызовы" title="Задания" />}>
      <Segmented
        id="tasks"
        value={seg}
        onChange={setSeg}
        items={[
          { id: 'available', label: 'Доступные' },
          { id: 'active', label: 'Активные' },
          { id: 'done', label: 'Завершённые' },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div key={seg} className="stack-v gap-20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {seg === 'available' && (
            <>
              <Section title="Короткие вызовы" right={<SeeAll label="все" onClick={() => push('calls')} />}>
                <Card onClick={() => push('call', { id: 'steps12k' })} className="short-call">
                  <IconBox icon="steps" palette="purple" size={40} />
                  <div className="stack-v gap-2 grow">
                    <span className="t-body-s">Пройти 12 000 шагов</span>
                    <span className="t-small c-2">сегодня · короткий вызов</span>
                  </div>
                  <RewardChip amount={30} animate={false} />
                </Card>
              </Section>
              <Section title="Длинные челленджи" delay={0.05}>
                {CHALLENGES.map((c, i) => (
                  <ChallengeCard key={c.id} c={c} i={i} mode="available" joined={!!data.joined[c.id]} onOpen={() => push('challenge', { id: c.id, state: data.joined[c.id] ? 'active' : 'available' })} />
                ))}
              </Section>
            </>
          )}
          {seg === 'active' &&
            (data.callsEmpty ? (
              <Empty
                img={<Img3D name="blocks" size={170} float />}
                title="Вы пока ни в чём не участвуете"
                text="Выберите челлендж во вкладке «Доступные». Просмотр карточки не начинает участие и не списывает спортики."
                action={<Button onClick={() => setSeg('available')}>Смотреть доступные</Button>}
              />
            ) : (
              activeList.map((c, i) => <ChallengeCard key={c.id} c={c} i={i} mode="active" joined onOpen={() => push('challenge', { id: c.id, state: 'active' })} />)
            ))}
          {seg === 'done' && (
            <>
              {FINISHED.map((c, i) => (
                <ChallengeCard key={c.id} c={c} i={i} mode="done" joined onOpen={() => push('challenge', { id: c.id, state: c.state })} />
              ))}
              <p className="t-small c-2">Ранее выданные награды и история не отзываются даже при невыполненной попытке.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}

function ChallengeCard({ c, i, mode, joined, onOpen }: { c: Challenge; i: number; mode: 'available' | 'active' | 'done'; joined: boolean; onOpen: () => void }) {
  const accent = PAL[c.palette].accent;
  return (
    <Card className="lchal" delay={0.05 + i * 0.07} onClick={onOpen}>
      <div className="lchal__hero hero-img" style={palVars(c.palette)}>
        <Img3D name={c.img} size={c.img === 'road' ? 116 : 104} float delay={i * 0.3} rotate={c.img === 'sneaker' ? 4 : c.img === 'dumbbell' ? -10 : 0} />
      </div>
      <span className="t-h3">{c.title}</span>
      <div className="hstack wrap">
        {mode === 'available' && !joined && (c.fee ? <RewardChip label={`вход ${c.fee} спортиков`} className="chip--fee" /> : c.type === 'manual' ? <StatusChip tone="purple" icon="users">ручная проверка</StatusChip> : <StatusChip tone="ok">вход бесплатный</StatusChip>)}
        {(mode === 'active' || (mode === 'available' && joined)) && <StatusChip tone="purple">участвую</StatusChip>}
        {mode === 'done' && (c.state === 'done' ? <StatusChip tone="ok">выполнен</StatusChip> : <StatusChip tone="muted" icon="close">не выполнен</StatusChip>)}
        <RewardChip amount={c.reward} animate={false} />
      </div>
      {mode === 'available' ? (
        <>
          <span className="t-small c-2">{c.meta}</span>
          <div onClick={(e) => e.stopPropagation()}>
            {joined ? (
              <Button variant="tint" size="s" onClick={onOpen}>
                Участвую
              </Button>
            ) : (
              <Button size="s" onClick={onOpen}>
                {c.fee ? `Вступить за ${c.fee}` : 'Участвовать'}
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <TickBar value={c.progress ?? 0} color={accent} />
          <span className="t-small c-2">{mode === 'active' ? c.activeMeta : c.meta}</span>
        </>
      )}
    </Card>
  );
}
