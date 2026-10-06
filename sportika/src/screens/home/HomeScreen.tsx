import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Avatar, BalancePill, Screen, Section, SeeAll } from '../../ui/shell';
import { Icon } from '../../ui/Icon';
import { cx } from '../../ui/kit';
import { useApp } from '../../lib/store';
import { HOME_PRESETS } from '../../data/home';
import { HOME_CALLS, HOME_CHALLENGES } from '../../data/content';
import { CallsStack, ChallengeCarousel, GoalCard, HomeSkeleton, MetricTile } from './parts';

const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

export function HomeScreen() {
  const { data, set, push, openSheet, openDialog, toast, setTab } = useApp();
  const preset = HOME_PRESETS[data.homeState];
  const [expanded, setExpanded] = useState(preset.calls.expanded);

  useEffect(() => setExpanded(preset.calls.expanded), [preset]);

  const loading = data.homeState === 'loading';
  const acceptedCount = HOME_CALLS.filter((c) => data.accepted[c.id]).length;
  const counter = data.homeState === 'new' ? `${acceptedCount} ${acceptedCount === 1 ? 'принят' : 'принято'}` : preset.calls.counter;

  const accept = (id: string) => {
    set((d) => ({ accepted: { ...d.accepted, [id]: true } }));
    toast('Вызов принят — прогресс считается автоматически');
  };

  return (
    <Screen
      tabs
      key={data.homeState}
      top={
        <div className="home-head">
          <div className="home-head__left">
            <Avatar onClick={() => push('profile')} />
            <div className="home-head__text">
              <span className="t-small c-2">{dateLabel()}</span>
              <span className="t-h3">Сегодня</span>
            </div>
          </div>
          <BalancePill />
        </div>
      }
    >
      {loading ? (
        <HomeSkeleton />
      ) : (
        <>
          <div className="tiles">
            {preset.tiles.map((t, i) => (
              <MetricTile key={t.metric} t={t} delay={i * 0.06} onClick={() => openSheet('goal')} />
            ))}
          </div>

          <GoalCard goal={preset.goal} onOpen={() => openSheet('goal')} onWeek={() => push('streak')} onAllow={() => openDialog('health')} />

          {preset.calls.counter && (
            <Section
              delay={0.2}
              title={
                <span className="hstack">
                  Вызовы дня
                  <motion.span key={counter} className="chip chip--purple counter-chip" initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                    {counter}
                  </motion.span>
                </span>
              }
              right={
                <motion.button type="button" className="chev-btn" onClick={() => setExpanded((v) => !v)} animate={{ rotate: expanded ? 180 : 0 }} aria-label={expanded ? 'Сложить вызовы' : 'Развернуть вызовы'} aria-expanded={expanded}>
                  <Icon name="chevD" size={18} />
                </motion.button>
              }
            >
              <CallsStack
                calls={HOME_CALLS}
                accepted={data.accepted}
                expanded={expanded}
                first={preset.calls}
                onAccept={accept}
                onOpen={() => push('calls')}
                onToggle={() => setExpanded(true)}
              />
            </Section>
          )}
        </>
      )}

      <Section delay={0.3} title="Челленджи" right={<SeeAll label="все 6" onClick={() => setTab('tasks')} />}>
        {loading ? (
          <div className="carousel">
            {[0, 1].map((i) => (
              <div key={i} className={cx('chcard card')} style={{ background: 'rgba(255,255,255,.6)' }}>
                <span className="skel" style={{ width: 36, height: 36, borderRadius: 12 }} />
                <span className="skel" style={{ width: '80%', height: 14 }} />
                <span className="skel" style={{ width: '60%', height: 10, marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        ) : (
          <ChallengeCarousel
            items={HOME_CHALLENGES}
            progressOverride={preset.challengeProgress}
            joined={data.joined}
            onOpen={(id) => push('challenge', { id: id === 'steps10k' ? 'steps10k' : id === 'km30' ? 'marathon' : 'steps10k', state: id === 'team50' ? undefined : 'active' })}
            onJoin={(id) => push('challenge', { id: id === 'team50' ? 'marathon' : id })}
          />
        )}
      </Section>
    </Screen>
  );
}

function dateLabel() {
  // Дата совпадает с макетом: неделя на карточке цели заканчивается понедельником, 21 сентября.
  return WEEKDAY.format(new Date(2026, 8, 21)).replace('.', '');
}
