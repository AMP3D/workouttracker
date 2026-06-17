import type { DayWorkout, WorkoutTemplate } from '../models';
import { STORE_DAY_WORKOUTS, STORE_TEMPLATES } from '../models';
import { getDb } from './db';

export const addTemplate = async (template: WorkoutTemplate): Promise<void> => {
  const db = await getDb();
  await db.put(STORE_TEMPLATES, template);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete(STORE_TEMPLATES, id);
};

export const deleteWorkout = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete(STORE_DAY_WORKOUTS, id);
};

export const getAllTemplates = async (): Promise<WorkoutTemplate[]> => {
  const db = await getDb();
  return db.getAll(STORE_TEMPLATES);
};

export const getAllWorkouts = async (): Promise<DayWorkout[]> => {
  const db = await getDb();
  return db.getAll(STORE_DAY_WORKOUTS);
};

export const getWorkoutById = async (id: string): Promise<DayWorkout | undefined> => {
  const db = await getDb();
  return db.get(STORE_DAY_WORKOUTS, id);
};

export const getWorkoutsByDate = async (date: string): Promise<DayWorkout[]> => {
  const db = await getDb();
  return db.getAllFromIndex(STORE_DAY_WORKOUTS, 'date', date);
};

export const getWorkoutsInRange = async (
  startDate: string,
  endDate: string,
): Promise<DayWorkout[]> => {
  const db = await getDb();
  const all = await db.getAll(STORE_DAY_WORKOUTS);

  return all.filter((w) => w.date >= startDate && w.date <= endDate);
};

export const saveWorkout = async (workout: DayWorkout): Promise<void> => {
  const db = await getDb();
  await db.put(STORE_DAY_WORKOUTS, workout);
};

export const syncWorkoutToTemplate = async (workout: DayWorkout): Promise<void> => {
  const db = await getDb();
  const allTemplates: WorkoutTemplate[] = await db.getAll(STORE_TEMPLATES);
  const match = allTemplates.find((t) => t.name === workout.workoutName);

  if (!match) {
    return;
  }

  const updatedTemplate: WorkoutTemplate = {
    ...match,
    exercises: workout.exercises.map((ex) => ({
      muscles: [...ex.muscles],
      name: ex.name,
      sets: ex.sets.map((s) => ({
        notes: s.notes,
        reps: s.reps,
        weights: [...s.weights],
      })),
    })),
  };

  await db.put(STORE_TEMPLATES, updatedTemplate);
};
