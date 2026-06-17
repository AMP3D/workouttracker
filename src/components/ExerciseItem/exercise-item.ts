import type { Exercise, ExerciseSet } from '../../models';
import { makeSetId } from '../../utils/id-utils';

export interface ExerciseItemProps {
  checked: boolean;
  editing: boolean;
  exercise: Exercise;
  expanded: boolean;
  flash: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCheckChange: (checked: boolean) => void;
  onClone: () => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onToggleEditing: () => void;
  onToggleExpanded: () => void;
  onUpdate: (exercise: Exercise, allSetsJustCompleted?: boolean) => void;
}

export const addSetToExercise = (exercise: Exercise): Exercise => {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const newSet: ExerciseSet = {
    completedAt: null,
    id: makeSetId(),
    notes: '',
    reps: lastSet?.reps ?? 10,
    setNumber: exercise.sets.length + 1,
    totalWeight: lastSet?.totalWeight ?? 0,
    weights: lastSet?.weights ?? [0],
  };

  return { ...exercise, sets: [...exercise.sets, newSet] };
};

export const cloneSetInExercise = (exercise: Exercise, setIndex: number): Exercise => {
  const source = exercise.sets[setIndex];
  const cloned: ExerciseSet = {
    ...source,
    completedAt: null,
    id: makeSetId(),
    setNumber: exercise.sets.length + 1,
  };

  const sets = [...exercise.sets, cloned].map((s, i) => ({ ...s, setNumber: i + 1 }));

  return { ...exercise, sets };
};

export const deleteSetFromExercise = (exercise: Exercise, setIndex: number): Exercise => {
  const sets = exercise.sets
    .filter((_, i) => i !== setIndex)
    .map((s, i) => ({ ...s, setNumber: i + 1 }));

  return { ...exercise, sets };
};

export const toggleSetCompletion = (exercise: Exercise, setIndex: number): Exercise => {
  const set = exercise.sets[setIndex];
  const completedAt = set.completedAt ? null : Date.now();
  const sets = exercise.sets.map((s, i) => (i === setIndex ? { ...s, completedAt } : s));
  const nowAllComplete = sets.every((s) => s.completedAt);

  return {
    ...exercise,
    completedAt: nowAllComplete ? Date.now() : null,
    sets,
  };
};

export const updateExerciseMuscles = (exercise: Exercise, value: string): Exercise => {
  const muscles = value
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  return { ...exercise, muscles };
};

export const updateSetInExercise = (
  exercise: Exercise,
  setIndex: number,
  updated: ExerciseSet,
): Exercise => {
  const sets = exercise.sets.map((s, i) => (i === setIndex ? updated : s));

  return { ...exercise, sets };
};
