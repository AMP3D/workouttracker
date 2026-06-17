import type { ExerciseSet } from './exercise-set';

export interface Exercise {
  completedAt: number | null;
  id: string;
  muscles: string[];
  name: string;
  order: number;
  sets: ExerciseSet[];
}
