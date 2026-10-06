import type { ComponentType } from 'react';
import { GoalSheet, SportikiSheet } from './screens/goal/GoalScreens';
import { DaySheet } from './screens/activity/ActivityScreen';
import { ExchangeSheet, PrizeConfirmDialog } from './screens/prizes/PrizesScreen';
import { GoalEditSheet, HealthAccessDialog, LogoutDialog } from './screens/profile/ProfileScreens';
import { JoinDialog } from './screens/tasks/ChallengeScreen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = ComponentType<any>;

export const SHEETS: Record<string, Any> = {
  goal: GoalSheet,
  sportiki: SportikiSheet,
  exchange: ExchangeSheet,
  'goal-edit': GoalEditSheet,
  day: DaySheet,
};

export const DIALOGS: Record<string, Any> = {
  join: JoinDialog,
  'prize-confirm': PrizeConfirmDialog,
  logout: LogoutDialog,
  health: HealthAccessDialog,
};
