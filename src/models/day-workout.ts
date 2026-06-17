import type { Exercise } from './exercise';

export interface DayWorkout {
  completedAt: number | null;
  date: string;
  exercises: Exercise[];
  id: string;
  startedAt: number | null;
  workoutName: string;
}
