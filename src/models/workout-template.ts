export interface SetTemplate {
  notes: string;
  reps: number;
  weights: number[];
}

export interface ExerciseTemplate {
  muscles: string[];
  name: string;
  sets: SetTemplate[];
}

export interface WorkoutTemplate {
  exercises: ExerciseTemplate[];
  id: string;
  name: string;
}
