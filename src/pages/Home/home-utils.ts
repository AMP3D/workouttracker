import type { DayWorkout, WorkoutTemplate } from '../../models';

export type DestructiveAction = 'clear' | 'import' | 'loadDefaults';
import {
  getAllTemplates,
  getAllWorkouts,
  getWorkoutsByDate,
} from '../../storage/workout-storage';
import { formatDateId } from '../../utils/date-utils';

export const CONFIRM_MESSAGES: Record<DestructiveAction, { message: string; title: string }> = {
  clear: {
    message:
      'This will permanently delete ALL workouts and templates. This is irreversible. Consider exporting your data first.',
    title: 'Clear Database',
  },
  import: {
    message:
      'Importing will merge data into your existing database. Consider exporting a backup first.',
    title: 'Import Database',
  },
  loadDefaults: {
    message:
      'This will load the default workout templates. Existing templates with the same name will not be overwritten. Consider exporting a backup first.',
    title: 'Load Default Templates',
  },
};

export const buildWeekWorkoutMap = async (
  weekDates: Date[],
): Promise<Map<string, DayWorkout[]>> => {
  const newMap = new Map<string, DayWorkout[]>();

  for (const date of weekDates) {
    const dateId = formatDateId(date);
    const dayWorkouts = await getWorkoutsByDate(dateId);

    if (dayWorkouts.length > 0) {
      newMap.set(dateId, dayWorkouts);
    }
  }

  return newMap;
};

export const fetchHomeData = async (
  weekDates: Date[],
): Promise<{
  loadedTemplates: WorkoutTemplate[];
  weekMap: Map<string, DayWorkout[]>;
}> => {
  const loadedTemplates = await getAllTemplates();
  const weekMap = await buildWeekWorkoutMap(weekDates);

  return { loadedTemplates, weekMap };
};

export const hasExistingData = async (): Promise<boolean> => {
  const existingTemplates = await getAllTemplates();
  const existingWorkouts = await getAllWorkouts();

  return existingTemplates.length > 0 || existingWorkouts.length > 0;
};

export const ICON_STYLE = { height: '1rem', width: '1rem' };
