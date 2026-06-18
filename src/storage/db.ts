import Dexie, { type EntityTable } from 'dexie';
import type { DayWorkout, WorkoutTemplate } from '../models';
import { DB_NAME } from '../models';

export const db = new Dexie(DB_NAME) as Dexie & {
  dayWorkouts: EntityTable<DayWorkout, 'id'>;
  templates: EntityTable<WorkoutTemplate, 'id'>;
};

db.version(1).stores({
  dayWorkouts: 'id, date',
  templates: 'id',
});
