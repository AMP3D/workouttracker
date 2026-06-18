import type { WorkoutTemplate } from '../models';
import { generateId } from '../utils/id-utils';
import { db } from './db';

const DEFAULT_TEMPLATES: Omit<WorkoutTemplate, 'id'>[] = [
  {
    name: 'Chest, Shoulders, Triceps (Push A)',
    exercises: [
      {
        name: 'Bird dog',
        muscles: ['Abs'],
        sets: [
          { notes: '', reps: 10, weights: [0] },
          { notes: '', reps: 10, weights: [0] },
        ],
      },
      {
        name: 'Decline Flies + Super-set Flat Flies',
        muscles: ['Chest'],
        sets: [
          { notes: 'Warm-up set, 15 reps per exercise', reps: 30, weights: [5, 10, 10] },
          { notes: '12 reps per exercise', reps: 24, weights: [5, 10, 10, 10, 5] },
          { notes: '12 reps per exercise', reps: 24, weights: [5, 10, 10, 10, 5] },
          { notes: '12 reps per exercise', reps: 24, weights: [5, 10, 10, 10, 5] },
          { notes: '12 reps per exercise', reps: 24, weights: [5, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Tricep Rope Pull-down',
        muscles: ['Medial Head Tricep'],
        sets: [
          { notes: 'Warm-up', reps: 20, weights: [5, 10, 10] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Weighted Crunch',
        muscles: ['Abs'],
        sets: [
          { notes: '', reps: 15, weights: [25] },
          { notes: '', reps: 15, weights: [25] },
          { notes: '', reps: 15, weights: [25] },
        ],
      },
      {
        name: 'Knee Crunch',
        muscles: ['Abs'],
        sets: [{ notes: '', reps: 15, weights: [0] }],
      },
      {
        name: 'Flat Press Drop-Sets',
        muscles: ['Chest'],
        sets: [
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 2.5, 2.5, 2.5, 2.5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 2.5, 2.5, 2.5] },
          { notes: '', reps: 8, weights: [5, 10, 10, 10, 2.5, 2.5] },
          { notes: '', reps: 6, weights: [5, 10, 10, 10, 2.5] },
        ],
      },
      {
        name: 'One Arm Cable Front Press',
        muscles: ['Delts'],
        sets: [
          { notes: 'Warm up', reps: 15, weights: [5] },
          { notes: '', reps: 10, weights: [5, 2.5] },
          { notes: '', reps: 10, weights: [5, 2.5] },
          { notes: '', reps: 10, weights: [5, 2.5] },
          { notes: '', reps: 10, weights: [5, 2.5] },
        ],
      },
      {
        name: 'Planks',
        muscles: ['Abs'],
        sets: [
          { notes: '1 minute duration', reps: 1, weights: [0] },
          { notes: '1 minute duration', reps: 1, weights: [0] },
        ],
      },
      {
        name: 'Overhead Tricep Extension',
        muscles: ['Long Head Tricep'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
        ],
      },
    ],
  },
  {
    name: 'Back, Biceps, Delts (Pull A)',
    exercises: [
      {
        name: 'Horizontal Concentration Curls',
        muscles: ['Brachialis', 'Long-Head', 'Biceps'],
        sets: [
          { notes: 'Warmup', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 2.5] },
        ],
      },
      {
        name: 'Glute Kick-backs',
        muscles: ['Glutes'],
        sets: [
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
        ],
      },
      {
        name: 'Bayesian Curls',
        muscles: ['Long-Head Biceps'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 2.5] },
        ],
      },
      {
        name: 'Superset Lat Pulldown with Rows',
        muscles: ['Lats', 'Traps'],
        sets: [
          { notes: '10 sets each exercise', reps: 20, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '10 sets each exercise', reps: 20, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '10 sets each exercise', reps: 20, weights: [5, 10, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Close-grip Lat Pull-Down',
        muscles: ['Lats', 'Traps'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 7.5, 5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 7.5, 5] },
        ],
      },
      {
        name: 'Reverse Flies',
        muscles: ['Traps'],
        sets: [
          { notes: '', reps: 12, weights: [5, 5] },
          { notes: '', reps: 12, weights: [5, 5] },
          { notes: '', reps: 12, weights: [5, 5] },
          { notes: '', reps: 12, weights: [5, 5] },
        ],
      },
      {
        name: 'Hammer Curls',
        muscles: ['Brachioradialas', 'Brachialis'],
        sets: [
          { notes: 'Dumbell', reps: 15, weights: [15] },
          { notes: 'Dumbell', reps: 15, weights: [15] },
          { notes: 'Dumbell', reps: 15, weights: [15] },
          { notes: 'Dumbell', reps: 15, weights: [15] },
        ],
      },
      {
        name: 'Face-Pulls',
        muscles: ['Back-Delts', 'Teres'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
        ],
      },
      {
        name: 'Seated Leg Curls',
        muscles: ['Hamstrings'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
          { notes: '', reps: 15, weights: [5, 10, 7.5] },
        ],
      },
    ],
  },
  {
    name: 'Legs, Core',
    exercises: [
      {
        name: 'Bird-Dog',
        muscles: ['Abs'],
        sets: [{ notes: '', reps: 10, weights: [0] }],
      },
      {
        name: 'Leg Extensions',
        muscles: ['Quads'],
        sets: [
          { notes: 'Warmup', reps: 10, weights: [5, 10, 7.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
        ],
      },
      {
        name: 'Ab Trunk Rotation',
        muscles: ['Abs'],
        sets: [
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 2.5] },
        ],
      },
      {
        name: 'Calf Press (One-Leg)',
        muscles: ['Calves'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 7.5, 5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 7.5, 5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 7.5, 5] },
        ],
      },
      {
        name: 'Ab Roller',
        muscles: ['Abs'],
        sets: [
          { notes: '', reps: 12, weights: [0] },
          { notes: '', reps: 12, weights: [0] },
          { notes: '', reps: 12, weights: [0] },
        ],
      },
      {
        name: 'Knee Crunch',
        muscles: ['Abs'],
        sets: [{ notes: '', reps: 15, weights: [0] }],
      },
      {
        name: 'Capture Weight',
        muscles: [''],
        sets: [{ notes: '', reps: 1, weights: [0] }],
      },
    ],
  },
  {
    name: 'Chest, Abs (Push B)',
    exercises: [
      {
        name: 'Decline Press',
        muscles: ['Chest'],
        sets: [
          { notes: 'Warm-up set', reps: 20, weights: [5, 10, 10] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: '', reps: 12, weights: [5, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Flat Flies',
        muscles: ['Chest'],
        sets: [
          { notes: 'Hold last rep for 10 seconds', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: 'Hold last rep for 10 seconds', reps: 12, weights: [5, 10, 10, 10, 5] },
          { notes: 'Hold last rep for 10 seconds', reps: 12, weights: [5, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Tricep Bar Push-Down',
        muscles: ['Triceps'],
        sets: [
          { notes: 'Warmup', reps: 20, weights: [5, 10, 10] },
          { notes: '', reps: 10, weights: [5, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 5] },
        ],
      },
      {
        name: 'Incline Press',
        muscles: ['Chest'],
        sets: [
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Incline Tricep Kickbacks',
        muscles: ['Long', 'Head', 'Tricep'],
        sets: [
          { notes: '', reps: 15, weights: [5, 2.5, 10] },
          { notes: '', reps: 15, weights: [5, 2.5, 10] },
          { notes: '', reps: 15, weights: [5, 2.5, 10] },
          { notes: '', reps: 15, weights: [5, 2.5, 10] },
        ],
      },
      {
        name: 'Lateral Raise',
        muscles: ['Delts', 'Serratus'],
        sets: [
          { notes: '', reps: 12, weights: [5, 2.5] },
          { notes: '', reps: 12, weights: [5, 2.5] },
          { notes: '', reps: 12, weights: [5, 2.5] },
          { notes: '', reps: 12, weights: [5, 2.5] },
        ],
      },
    ],
  },
  {
    name: 'Back, Biceps (Pull B)',
    exercises: [
      {
        name: 'Bird dog',
        muscles: ['Abs'],
        sets: [{ notes: '', reps: 10, weights: [0] }],
      },
      {
        name: 'Rows',
        muscles: ['Lats', 'Traps'],
        sets: [
          { notes: 'Warm-up set', reps: 20, weights: [5, 10, 10, 10] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Upright Leg Press (One Legged)',
        muscles: ['Quads', 'Glutes'],
        sets: [
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 5] },
          { notes: '', reps: 15, weights: [5, 10, 10, 10, 10, 5] },
        ],
      },
      {
        name: 'Dumbell Bicep Curl',
        muscles: ['Brachialis'],
        sets: [{ notes: '', reps: 15, weights: [15] }],
      },
      {
        name: 'Chin ups',
        muscles: ['Biceps'],
        sets: [
          { notes: 'Warm-up', reps: 20, weights: [5, 10, 10, 10, 10, 7.5, 5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 7.5, 5, 2.5, 2.5, 2.5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 7.5, 5, 2.5, 2.5, 2.5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 7.5, 5, 2.5, 2.5, 2.5] },
          { notes: '', reps: 10, weights: [5, 10, 10, 10, 10, 7.5, 5, 2.5, 2.5, 2.5] },
        ],
      },
      {
        name: 'Ab Roller',
        muscles: ['Abs'],
        sets: [
          { notes: '', reps: 12, weights: [0] },
          { notes: '', reps: 12, weights: [0] },
          { notes: '', reps: 12, weights: [0] },
        ],
      },
      {
        name: 'Knee Crunch',
        muscles: ['Abs'],
        sets: [{ notes: '', reps: 15, weights: [0] }],
      },
      {
        name: 'Sideways Standing Bicep Curl',
        muscles: ['Biceps Brachii'],
        sets: [
          { notes: '7 full, 7 partial, 7 full reps', reps: 21, weights: [5, 10, 7.5] },
          { notes: '7 full, 7 partial, 7 full reps', reps: 21, weights: [5, 10, 7.5] },
          { notes: '7 full, 7 partial, 7 full reps', reps: 21, weights: [5, 10, 7.5] },
        ],
      },
    ],
  },
];

export const loadDefaultData = async (): Promise<void> => {
  const templates = DEFAULT_TEMPLATES.map((raw) => ({
    ...raw,
    id: generateId(),
  }));

  await db.templates.bulkPut(templates);
};
