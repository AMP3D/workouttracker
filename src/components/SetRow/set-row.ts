import type { ExerciseSet } from '../../models';
import { calculateTotalWeight, parseWeightsString } from '../../utils/weight-utils';

export interface SetRowProps {
  editing: boolean;
  onChange: (updated: ExerciseSet) => void;
  onClone: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  set: ExerciseSet;
}

export const applyWeightsToSet = (set: ExerciseSet, value: string): ExerciseSet => {
  const weights = parseWeightsString(value);
  const totalWeight = calculateTotalWeight(weights);

  return { ...set, totalWeight, weights };
};

export const flashLastChild = (parentElement: HTMLElement | null | undefined): void => {
  const lastChild = parentElement?.lastElementChild as HTMLElement | null;

  if (!lastChild) {
    return;
  }

  lastChild.classList.add('set-row--flash');
  lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    lastChild.classList.remove('set-row--flash');
  }, 800);
};

export const updateSetNotes = (set: ExerciseSet, notes: string): ExerciseSet => ({
  ...set,
  notes,
});

export const updateSetReps = (set: ExerciseSet, value: string): ExerciseSet => {
  const reps = parseInt(value, 10) || 0;

  return { ...set, reps };
};
