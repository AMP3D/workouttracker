import type { ExerciseSet } from './set';
import type { SetTemplate } from './set';

export interface Exercise {
  completedAt: number | null;
  id: string;
  muscles: string[];
  name: string;
  order: number;
  sets: ExerciseSet[];
}

export interface ExerciseTemplate {
  muscles: string[];
  name: string;
  sets: SetTemplate[];
}
