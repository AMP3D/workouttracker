import type { DayWorkout } from './day-workout';
import type { WorkoutTemplate } from './workout-template';

export interface ImportData {
  dayWorkouts: DayWorkout[];
  templates: WorkoutTemplate[];
  version: number;
}

export interface ImportSet {
  notes?: string;
  reps: number | string;
  weights: number[];
}

export interface ImportExercise {
  muscles: string[];
  name: string;
  sets: ImportSet[];
}

export interface ImportWorkout {
  exercises: ImportExercise[];
  name: string;
}
