import type { DayWorkout, Exercise } from '../models';

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${displayHours}:${mm}:${ss} ${period}`;
};

export const formatDuration = (ms: number, showSeconds: boolean = false): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (showSeconds) {
    if (minutes > 0) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
  }

  return `${totalMinutes}m`;
};

export const getExerciseDuration = (exercise: Exercise): number | null => {
  let earliest: number | null = null;
  let latest: number | null = null;

  for (const set of exercise.sets) {
    if (!set.completedAt) {
      continue;
    }

    if (earliest === null || set.completedAt < earliest) {
      earliest = set.completedAt;
    }

    if (latest === null || set.completedAt > latest) {
      latest = set.completedAt;
    }
  }

  if (!earliest || !latest || earliest === latest) {
    return null;
  }

  return latest - earliest;
};

export const getEarliestCompletion = (workouts: DayWorkout[]): number | null => {
  let earliest: number | null = null;

  for (const workout of workouts) {
    const timestamp = getFirstSetCompletion(workout);

    if (timestamp && (earliest === null || timestamp < earliest)) {
      earliest = timestamp;
    }
  }

  return earliest;
};

export const getFirstSetCompletion = (workout: DayWorkout): number | null => {
  let earliest: number | null = null;

  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (set.completedAt && (earliest === null || set.completedAt < earliest)) {
        earliest = set.completedAt;
      }
    }
  }

  return earliest;
};

export const getLastSetCompletion = (workout: DayWorkout): number | null => {
  let latest: number | null = null;

  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (set.completedAt && (latest === null || set.completedAt > latest)) {
        latest = set.completedAt;
      }
    }
  }

  return latest;
};

export const getLatestCompletion = (workouts: DayWorkout[]): number | null => {
  let latest: number | null = null;

  for (const workout of workouts) {
    const timestamp = getLastSetCompletion(workout);

    if (timestamp && (latest === null || timestamp > latest)) {
      latest = timestamp;
    }
  }

  return latest;
};
