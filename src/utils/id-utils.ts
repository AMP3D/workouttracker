export const generateId = (): string => crypto.randomUUID();

export const makeExerciseId = (): string => `exercise-${generateId()}`;

export const makeSetId = (): string => `set-${generateId()}`;

export const makeWorkoutId = (): string => `workout-${generateId()}`;
