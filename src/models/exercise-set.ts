export interface ExerciseSet {
  completedAt: number | null;
  id: string;
  notes: string;
  reps: number;
  setNumber: number;
  totalWeight: number;
  weights: number[];
}
