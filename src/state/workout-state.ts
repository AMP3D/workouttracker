import { signal } from '@preact/signals-react';
import type { DayWorkout, WorkoutTemplate } from '../models';

export const templates = signal<WorkoutTemplate[]>([]);
export const weekWorkouts = signal<Map<string, DayWorkout[]>>(new Map());
