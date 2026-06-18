import type {
  ExerciseTemplate,
  ImportData,
  ImportWorkout,
  WorkoutTemplate,
} from '../models';
import { generateId } from '../utils/id-utils';
import { db } from './db';

export const exportDatabase = async (): Promise<void> => {
  const [dayWorkouts, templates] = await Promise.all([
    db.dayWorkouts.toArray(),
    db.templates.toArray(),
  ]);

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

  await db.transaction('rw', db.dayWorkouts, db.templates, async () => {
    if (data.templates) {
      await db.templates.bulkPut(data.templates);
    }

    if (data.dayWorkouts) {
      await db.dayWorkouts.bulkPut(data.dayWorkouts);
    }
  });
};

const importFormat = async (workouts: ImportWorkout[]): Promise<void> => {
  const templates: WorkoutTemplate[] = workouts.map((workout) => {
    const exercises: ExerciseTemplate[] = workout.exercises.map((ex) => ({
      muscles: ex.muscles,
      name: ex.name,
      sets: ex.sets.map((s) => ({
        notes: s.notes ?? '',
        reps: typeof s.reps === 'string' ? parseInt(s.reps, 10) : s.reps,
        weights: s.weights,
      })),
    }));

    return {
      exercises,
      id: generateId(),
      name: workout.name,
    };
  });

  await db.templates.bulkPut(templates);
};

export const clearDatabase = async (): Promise<void> => {
  await db.transaction('rw', db.dayWorkouts, db.templates, async () => {
    await db.dayWorkouts.clear();
    await db.templates.clear();
  });
};
