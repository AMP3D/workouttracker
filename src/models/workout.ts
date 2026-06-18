import type { Exercise } from './exercise';
import type { ExerciseTemplate } from './exercise';

export interface DayWorkout {
  completedAt: number | null;
  date: string;
  exercises: Exercise[];
  id: string;
  startedAt: number | null;
  workoutName: string;
}

export interface WorkoutTemplate {
  exercises: ExerciseTemplate[];
  id: string;
  name: string;
}
