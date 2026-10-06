import type { ComponentType } from 'react';
import { GoalChangeScreen, GoalHowScreen, SportikiHistoryScreen, StreakRulesScreen, StreakScreen } from './screens/goal/GoalScreens';
import { CallScreen, CallsScreen } from './screens/tasks/CallScreens';
import { ChallengeScreen } from './screens/tasks/ChallengeScreen';
import { PrizeDoneScreen, PrizeErrorScreen, PrizeReceivedScreen, PrizeScreen } from './screens/prizes/PrizesScreen';
import { CompanyScreen, DemoScreen, ProfileScreen, SourcesScreen, SupportScreen, TicketScreen } from './screens/profile/ProfileScreens';

interface RouteDef {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /** Экран показывается вместе с таб-баром. */
  tabs?: boolean;
}

export const ROUTES: Record<string, RouteDef> = {
  profile: { component: ProfileScreen, tabs: true },
  calls: { component: CallsScreen, tabs: true },
  call: { component: CallScreen },
  challenge: { component: ChallengeScreen },
  'goal-how': { component: GoalHowScreen },
  'goal-change': { component: GoalChangeScreen },
  streak: { component: StreakScreen },
  'streak-rules': { component: StreakRulesScreen },
  'sportiki-history': { component: SportikiHistoryScreen },
  prize: { component: PrizeScreen },
  'prize-done': { component: PrizeDoneScreen },
  'prize-received': { component: PrizeReceivedScreen },
  'prize-error': { component: PrizeErrorScreen },
  sources: { component: SourcesScreen },
  company: { component: CompanyScreen },
  support: { component: SupportScreen },
  ticket: { component: TicketScreen },
  demo: { component: DemoScreen },
};
