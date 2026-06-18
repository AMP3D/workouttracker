import type { DayWorkout } from '../../models';
import { formatDateId } from '../../utils/date-utils';
import { formatDuration, getFirstSetCompletion, getLastSetCompletion } from '../../utils/workout-utils';

export interface CalendarDay {
  date: Date;
}

export interface CalendarDayView {
  className: string;
  dateId: string;
  dayNumber: number;
}

export interface SelectedWorkoutDetails {
  duration: string;
  workout: DayWorkout;
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const buildCalendarDayViews = (
  days: CalendarDay[],
  currentMonth: number,
  selectedDate: string,
  workoutDates: Set<string>,
): CalendarDayView[] => {
  const todayStr = new Date().toDateString();

  return days.map((day) => {
    const dateId = formatDateId(day.date);
    const className = [
      'logs__day',
      day.date.toDateString() === todayStr ? 'logs__day--today' : '',
      dateId === selectedDate ? 'logs__day--selected' : '',
      workoutDates.has(dateId) && dateId !== selectedDate ? 'logs__day--has-workout' : '',
      day.date.getMonth() !== currentMonth ? 'logs__day--other-month' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return { className, dateId, dayNumber: day.date.getDate() };
  });
};

export const getSelectedWorkoutDetails = (
  workouts: DayWorkout[],
  selectedDate: string,
): SelectedWorkoutDetails | null => {
  const workout = workouts.find((w) => w.date === selectedDate);

  if (!workout) {
    return null;
  }

  const startTime = getFirstSetCompletion(workout);
  const endTime = getLastSetCompletion(workout);
  const duration = startTime && endTime ? formatDuration(endTime - startTime) : '';

  return { duration, workout };
};

export const getWorkoutDates = (workouts: DayWorkout[]): Set<string> =>
  new Set(workouts.map((w) => w.date));

export const buildCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const days: CalendarDay[] = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d) });
  }

  while (days.length % 7 !== 0) {
    const nextDate = new Date(
      year,
      month + 1,
      days.length - startDayOfWeek - lastDay.getDate() + 1,
    );
    days.push({ date: nextDate });
  }

  return days;
};

export const getNextMonth = (
  month: number,
  year: number,
): { month: number; year: number } => {
  if (month === 11) {
    return { month: 0, year: year + 1 };
  }

  return { month: month + 1, year };
};

export const getPrevMonth = (
  month: number,
  year: number,
): { month: number; year: number } => {
  if (month === 0) {
    return { month: 11, year: year - 1 };
  }

  return { month: month - 1, year };
};
