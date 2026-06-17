import type {
  DayWorkout,
  ExerciseTemplate,
  ImportData,
  ImportWorkout,
  WorkoutTemplate,
} from '../models';
import { STORE_DAY_WORKOUTS, STORE_TEMPLATES } from '../models';
import { generateId } from '../utils/id-utils';
import { getDb } from './db';

export const exportDatabase = async (): Promise<void> => {
  const db = await getDb();
  const dayWorkouts: DayWorkout[] = await db.getAll(STORE_DAY_WORKOUTS);
  const templates: WorkoutTemplate[] = await db.getAll(STORE_TEMPLATES);

  const data: ImportData = {
    dayWorkouts,
    templates,
    version: 1,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-export-${timestamp}.json`;
  a.click();

  URL.revokeObjectURL(url);
};

export const importDatabase = async (file: File): Promise<void> => {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed) && parsed.length > 0 && 'exercises' in parsed[0]) {
    await importFormat(parsed as ImportWorkout[]);
    return;
  }

  const data = parsed as ImportData;
  const db = await getDb();
  const tx = db.transaction([STORE_DAY_WORKOUTS, STORE_TEMPLATES], 'readwrite');

  if (data.templates) {
    const templateStore = tx.objectStore(STORE_TEMPLATES);
    for (const template of data.templates) {
      await templateStore.put(template);
    }
  }

  if (data.dayWorkouts) {
    const workoutStore = tx.objectStore(STORE_DAY_WORKOUTS);
    for (const workout of data.dayWorkouts) {
      await workoutStore.put(workout);
    }
  }

  await tx.done;
};

const importFormat = async (workouts: ImportWorkout[]): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
  const store = tx.objectStore(STORE_TEMPLATES);

  for (const workout of workouts) {
    const exercises: ExerciseTemplate[] = workout.exercises.map((ex) => ({
      muscles: ex.muscles,
      name: ex.name,
      sets: ex.sets.map((s) => ({
        notes: s.notes ?? '',
        reps: typeof s.reps === 'string' ? parseInt(s.reps, 10) : s.reps,
        weights: s.weights,
      })),
    }));

    const template: WorkoutTemplate = {
      exercises,
      id: generateId(),
      name: workout.name,
    };

    await store.put(template);
  }

  await tx.done;
};

export const clearDatabase = async (): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction([STORE_DAY_WORKOUTS, STORE_TEMPLATES], 'readwrite');

  await tx.objectStore(STORE_DAY_WORKOUTS).clear();
  await tx.objectStore(STORE_TEMPLATES).clear();
  await tx.done;
};
