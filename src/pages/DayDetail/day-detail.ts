import type { DayWorkout, Exercise, ExerciseSet, WorkoutTemplate } from '../../models';
import {
  getAllTemplates,
  getAllWorkouts,
  getWorkoutsByDate,
  saveWorkout,
  syncWorkoutToTemplate,
} from '../../storage/workout-storage';
import { makeExerciseId, makeSetId, makeWorkoutId } from '../../utils/id-utils';
import { calculateTotalWeight } from '../../utils/weight-utils';
import {
  formatDuration,
  formatTime,
  getEarliestCompletion,
  getLatestCompletion,
} from '../../utils/workout-utils';

export const appendExerciseToWorkout = (
  workout: DayWorkout,
  name: string,
  musclesStr: string,
): DayWorkout => {
  const muscles = musclesStr
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  const newExercise = createExercise(name, muscles, workout.exercises.length);

  return {
    ...workout,
    exercises: [...workout.exercises, newExercise],
  };
};

export const applyExerciseUpdate = (
  workout: DayWorkout,
  exerciseIndex: number,
  updated: Exercise,
): DayWorkout => {
  const exercises = workout.exercises.map((e, i) => (i === exerciseIndex ? updated : e));
  const allExercisesComplete = exercises.every((e) => e.completedAt);

  return {
    ...workout,
    completedAt: allExercisesComplete ? Date.now() : null,
    exercises,
  };
};

export const buildNewWorkout = (
  dateId: string,
  workoutName: string,
  template?: WorkoutTemplate,
): DayWorkout => ({
  completedAt: null,
  date: dateId,
  exercises: template ? createExercisesFromTemplate(template) : [],
  id: makeWorkoutId(),
  startedAt: Date.now(),
  workoutName,
});

export const cloneExercise = (source: Exercise, newOrder: number): Exercise => ({
  ...source,
  completedAt: null,
  id: makeExerciseId(),
  order: newOrder,
  sets: source.sets.map((s) => ({
    ...s,
    completedAt: null,
    id: makeSetId(),
  })),
});

export const cloneExerciseInWorkout = (workout: DayWorkout, exerciseIndex: number): DayWorkout => {
  const source = workout.exercises[exerciseIndex];
  const cloned = cloneExercise(source, workout.exercises.length);

  return {
    ...workout,
    exercises: [...workout.exercises, cloned],
  };
};

export const computeElapsedDisplay = (
  workouts: DayWorkout[],
): { display: string | null; isLive: boolean } => {
  const firstTimestamp = getEarliestCompletion(workouts);

  if (!firstTimestamp) {
    return { display: null, isLive: false };
  }

  const startTime = formatTime(firstTimestamp);
  const allComplete = workouts.length > 0 && workouts.every((w) => w.completedAt);

  if (allComplete) {
    const lastTimestamp = getLatestCompletion(workouts);
    const duration = lastTimestamp ? formatDuration(lastTimestamp - firstTimestamp, true) : null;

    return {
      display: duration ? `${startTime} · ${duration}` : startTime,
      isLive: false,
    };
  }

  return {
    display: `Start: ${startTime} (${formatDuration(Date.now() - firstTimestamp, true)} ago)`,
    isLive: true,
  };
};

export const createDefaultSet = (): ExerciseSet => ({
  completedAt: null,
  id: makeSetId(),
  notes: '',
  reps: 10,
  setNumber: 1,
  totalWeight: 0,
  weights: [0],
});

export const createExercise = (name: string, muscles: string[], order: number): Exercise => ({
  completedAt: null,
  id: makeExerciseId(),
  muscles,
  name,
  order,
  sets: [createDefaultSet()],
});

export const createExercisesFromTemplate = (template: WorkoutTemplate): Exercise[] =>
  template.exercises.map((ex, index) => ({
    completedAt: null,
    id: makeExerciseId(),
    muscles: [...ex.muscles],
    name: ex.name,
    order: index,
    sets: ex.sets.map((s, sIndex) => ({
      completedAt: null,
      id: makeSetId(),
      notes: s.notes,
      reps: s.reps,
      setNumber: sIndex + 1,
      totalWeight: calculateTotalWeight(s.weights),
      weights: [...s.weights],
    })),
  }));

export const fetchDayData = async (
  dateId: string,
): Promise<{
  allWorkouts: DayWorkout[];
  dayWorkouts: DayWorkout[];
  templates: WorkoutTemplate[];
}> => {
  const dayWorkouts = await getWorkoutsByDate(dateId);
  const allWorkouts = await getAllWorkouts();
  const loadedTemplates = await getAllTemplates();

  return { allWorkouts, dayWorkouts, templates: loadedTemplates };
};

export const filterUncheckedExercises = (
  workout: DayWorkout,
  checkedIds: Set<string>,
): DayWorkout => ({
  ...workout,
  exercises: workout.exercises.filter((e) => !checkedIds.has(e.id)),
});

export const findNextIncompleteIndex = (exercises: Exercise[], afterIndex: number): number =>
  exercises.findIndex((e, i) => i > afterIndex && !e.completedAt);

export const getCheckedForWorkout = (
  checkedExercises: Map<string, Set<string>>,
  workoutId: string,
): Set<string> => checkedExercises.get(workoutId) ?? new Set();

export const moveExerciseInWorkout = (
  workout: DayWorkout,
  exerciseIndex: number,
  direction: 'down' | 'up',
): DayWorkout | null => {
  const exercises = reorderExercises(workout.exercises, exerciseIndex, direction);

  if (!exercises) {
    return null;
  }

  return { ...workout, exercises };
};

export const persistAndSync = async (workout: DayWorkout, isToday: boolean): Promise<void> => {
  await saveWorkout(workout);

  if (isToday) {
    await syncWorkoutToTemplate(workout);
  }
};

export const removeExercise = (exercises: Exercise[], index: number): Exercise[] =>
  exercises.filter((_, i) => i !== index).map((e, i) => ({ ...e, order: i }));

export const removeExerciseFromWorkout = (
  workout: DayWorkout,
  exerciseIndex: number,
): { name: string; updated: DayWorkout } => {
  const name = workout.exercises[exerciseIndex].name;
  const exercises = removeExercise(workout.exercises, exerciseIndex);

  return { name, updated: { ...workout, exercises } };
};

export const removeIdsFromSet = (prev: Set<string>, ids: string[]): Set<string> => {
  const next = new Set(prev);

  for (const id of ids) {
    next.delete(id);
  }

  return next;
};

export const reorderExercises = (
  exercises: Exercise[],
  fromIndex: number,
  direction: 'down' | 'up',
): Exercise[] | null => {
  const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

  if (targetIndex < 0 || targetIndex >= exercises.length) {
    return null;
  }

  const reordered = [...exercises];

  [reordered[fromIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[fromIndex]];

  return reordered.map((e, i) => ({ ...e, order: i }));
};

export const saveNewWorkout = async (
  dateId: string,
  workoutName: string,
  template?: WorkoutTemplate,
): Promise<void> => {
  const workout = buildNewWorkout(dateId, workoutName, template);
  await saveWorkout(workout);
};

export const toggleIdInSet = (prev: Set<string>, id: string): Set<string> => {
  const next = new Set(prev);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  return next;
};

export const updateCheckedExercises = (
  prev: Map<string, Set<string>>,
  workoutId: string,
  exerciseId: string,
  checked: boolean,
): Map<string, Set<string>> => {
  const next = new Map(prev);
  const workoutSet = new Set(next.get(workoutId) ?? []);

  if (checked) {
    workoutSet.add(exerciseId);
  } else {
    workoutSet.delete(exerciseId);
  }

  if (workoutSet.size === 0) {
    next.delete(workoutId);
  } else {
    next.set(workoutId, workoutSet);
  }

  return next;
};
