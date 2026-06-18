import type { DayWorkout, WorkoutTemplate } from '../models';
import { db } from './db';

export const addTemplate = async (template: WorkoutTemplate): Promise<void> => {
  await db.templates.put(template);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await db.templates.delete(id);
};

export const deleteWorkout = async (id: string): Promise<void> => {
  await db.dayWorkouts.delete(id);
};

export const getAllTemplates = async (): Promise<WorkoutTemplate[]> => {
  return db.templates.toArray();
};

export const getAllWorkouts = async (): Promise<DayWorkout[]> => {
  return db.dayWorkouts.toArray();
};

export const getWorkoutById = async (id: string): Promise<DayWorkout | undefined> => {
  return db.dayWorkouts.get(id);
};

export const getWorkoutsByDate = async (date: string): Promise<DayWorkout[]> => {
  return db.dayWorkouts.where('date').equals(date).toArray();
};

export const getWorkoutsInRange = async (
  startDate: string,
  endDate: string,
): Promise<DayWorkout[]> => {
  return db.dayWorkouts.where('date').between(startDate, endDate, true, true).toArray();
};

export const saveWorkout = async (workout: DayWorkout): Promise<void> => {
  await db.dayWorkouts.put(workout);
};

export const syncWorkoutToTemplate = async (workout: DayWorkout): Promise<void> => {
  const allTemplates = await db.templates.toArray();
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

  await db.templates.put(updatedTemplate);
};
