import type { DayWorkout, WorkoutTemplate } from '../../models';

export interface AddWorkoutDialogProps {
  dayOfWeek: number;
  onClose: () => void;
  onConfirm: (workoutName: string, template?: WorkoutTemplate) => void;
  workouts: DayWorkout[];
}

export const findSuggestedForDay = (
  allTemplates: WorkoutTemplate[],
  workouts: DayWorkout[],
  dayOfWeek: number,
): WorkoutTemplate[] => {
  const namesOnDay = new Set<string>();

  for (const workout of workouts) {
    const [mm, dd, yyyy] = workout.date.split('-').map(Number);
    const date = new Date(yyyy, mm - 1, dd);

    if (date.getDay() === dayOfWeek) {
      namesOnDay.add(workout.workoutName);
    }
  }

  return allTemplates.filter((t) => namesOnDay.has(t.name));
};

export const sortTemplatesByLastCompleted = (
  allTemplates: WorkoutTemplate[],
  workouts: DayWorkout[],
): WorkoutTemplate[] => {
  const lastCompletedMap = new Map<string, number>();

  for (const workout of workouts) {
    if (!workout.completedAt) {
      continue;
    }

    const existing = lastCompletedMap.get(workout.workoutName);

    if (!existing || workout.completedAt > existing) {
      lastCompletedMap.set(workout.workoutName, workout.completedAt);
    }
  }

  return [...allTemplates].sort((a, b) => {
    const aCompleted = lastCompletedMap.get(a.name);
    const bCompleted = lastCompletedMap.get(b.name);

    if (aCompleted && bCompleted) {
      return aCompleted - bCompleted;
    }

    if (aCompleted && !bCompleted) {
      return 1;
    }

    if (!aCompleted && bCompleted) {
      return -1;
    }

    return a.name.localeCompare(b.name);
  });
};
