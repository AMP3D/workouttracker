export const calculateTotalWeight = (weights: number[]): number =>
  weights.reduce((sum, w) => sum + w, 0);

export const calculateVolume = (reps: number, totalWeight: number): number => reps * totalWeight;

export const formatWeight = (weight: number): string => `${weight}lb`;

export const formatVolume = (
  exercises: { sets: { reps: number; totalWeight: number }[] }[],
): number =>
  exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (exTotal, set) => exTotal + calculateVolume(set.reps, set.totalWeight),
        0,
      ),
    0,
  );

export const parseWeightsString = (input: string): number[] =>
  input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map(Number)
    .filter((n) => !isNaN(n));
