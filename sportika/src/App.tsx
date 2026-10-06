import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { useEffect } from 'react';
import { useApp, type Route, type Tab } from './lib/store';
import { TabBar } from './ui/shell';
import { Icon } from './ui/Icon';
import { HomeScreen } from './screens/home/HomeScreen';
import { TasksScreen } from './screens/tasks/TasksScreen';
import { ActivityScreen } from './screens/activity/ActivityScreen';
import { PrizesScreen } from './screens/prizes/PrizesScreen';
import { Onboarding } from './screens/onboarding/Onboarding';
import { ROUTES } from './routes';
import { SHEETS, DIALOGS } from './overlays';

const TAB_SCREENS: Record<Tab, () => JSX.Element> = {
  home: HomeScreen,
  tasks: TasksScreen,
  activity: ActivityScreen,
  prizes: PrizesScreen,
};

export function App() {
  const { data } = useApp();
  return (
    <div className="app">
      <AnimatePresence mode="wait" initial={false}>
        {data.phase === 'onboarding' ? (
          <motion.div key="onb" className="layer" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
            <Onboarding />
          </motion.div>
        ) : (
          <motion.div key="main" className="layer" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <Main />
          </motion.div>
        )}
      </AnimatePresence>
      <Toast />
    </div>
  );
}

function Main() {
  const { tab, nav, setTab } = useApp();
  const reduce = useReducedMotion();
  const top = nav.stack[nav.stack.length - 1];
  const tabbarVisible = !top || !!ROUTES[top.name]?.tabs;
  const covered = nav.stack.length > 0;
  const TabScreen = TAB_SCREENS[tab];

  // Внешний переход на вкладку (например, из пустых состояний).
  useEffect(() => {
    const on = (e: Event) => setTab((e as CustomEvent<Tab>).detail);
    window.addEventListener('sportika:tab', on);
    return () => window.removeEventListener('sportika:tab', on);
  }, [setTab]);

  return (
    <>
      <motion.div className="layer" animate={{ x: covered && !reduce ? '-28%' : 0 }} transition={SLIDE}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={tab} className="layer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <TabScreen />
          </motion.div>
        </AnimatePresence>
        <motion.div className="stack-dim" initial={false} animate={{ opacity: covered ? 0.12 : 0 }} transition={SLIDE} />
      </motion.div>

      <AnimatePresence initial={false}>
        {nav.stack.map((r, i) => (
          <StackScreen key={r.key} route={r} depth={nav.stack.length - 1 - i} />
        ))}
      </AnimatePresence>

      <TabBar visible={tabbarVisible} />

      <AnimatePresence>{nav.sheet && <SheetHost key={nav.sheet.key} />}</AnimatePresence>
      <AnimatePresence>{nav.dialog && <DialogHost key={nav.dialog.key} />}</AnimatePresence>
    </>
  );
}

const SLIDE = { type: 'spring' as const, stiffness: 320, damping: 36, mass: 0.9 };

function StackScreen({ route, depth }: { route: Route; depth: number }) {
  const { back } = useApp();
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const def = ROUTES[route.name];
  const Comp = def?.component;
  const isTop = depth === 0;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 600) back();
  };

  return (
    <motion.div
      className="stack-screen"
      style={{ zIndex: 5 + (10 - depth) }}
      initial={reduce ? { opacity: 0 } : { x: '100%' }}
      animate={reduce ? { opacity: 1 } : { x: depth > 0 ? '-28%' : 0 }}
      exit={reduce ? { opacity: 0 } : { x: '100%' }}
      transition={SLIDE}
      drag={isTop ? 'x' : false}
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 1 }}
      onDragEnd={onDragEnd}
    >
      {Comp ? <Comp {...(route.params ?? {})} /> : <Missing name={route.name} />}
      {depth > 0 && <motion.div className="stack-dim" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} exit={{ opacity: 0 }} />}
      {isTop && <div className="edge-swipe" onPointerDown={(e) => controls.start(e)} />}
    </motion.div>
  );
}

function SheetHost() {
  const { nav } = useApp();
  const s = nav.sheet!;
  const Comp = SHEETS[s.name];
  return Comp ? <Comp {...(s.params ?? {})} /> : null;
}

function DialogHost() {
  const { nav } = useApp();
  const d = nav.dialog!;
  const Comp = DIALOGS[d.name];
  return Comp ? <Comp {...(d.params ?? {})} /> : null;
}

function Missing({ name }: { name: string }) {
  return <div style={{ padding: 80 }}>Экран «{name}» не найден</div>;
}

function Toast() {
  const { toastText } = useApp();
  return (
    <AnimatePresence>
      {toastText && (
        <motion.div
          key={toastText.key}
          className="toast t-small-s"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          role="status"
        >
          <span style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="checkS" size={16} />
          </span>
          {toastText.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
