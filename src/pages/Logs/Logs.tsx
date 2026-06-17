import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '../../assets/icons';
import { Header } from '../../components/Header/Header';
import type { DayWorkout } from '../../models';
import { formatDateId, formatDateLabel, getMonthName, parseDateId } from '../../utils/date-utils';
import { formatWeight } from '../../utils/weight-utils';
import { getAllWorkouts } from '../../storage/workout-storage';
import './logs.scss';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const Logs = () => {
  const navigate = useNavigate();

  const [allWorkouts, setAllWorkouts] = useState<DayWorkout[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateId(new Date()));

  useEffect(() => {
    loadAllWorkouts();
  }, []);

  const workoutDates = new Set(allWorkouts.map((w) => w.date));
  const selectedWorkout = allWorkouts.find((w) => w.date === selectedDate);

  const calendarDays = buildCalendarDays(currentYear, currentMonth);

  const formatDuration = (startedAt: number | null, completedAt: number | null): string => {
    if (!startedAt || !completedAt) {
      return '';
    }

    const diffMin = Math.round((completedAt - startedAt) / 60000);

    if (diffMin < 60) {
      return `${diffMin}m`;
    }

    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;

    return `${hours}h ${mins}m`;
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const loadAllWorkouts = async () => {
    const workouts = await getAllWorkouts();
    setAllWorkouts(workouts);
  };

  return (
    <>
      <Header
        leftContent={
          <button className="header__back-btn" onClick={() => navigate('/')} type="button">
            <ArrowLeftIcon style={{ height: '1.25rem', width: '1.25rem' }} />
          </button>
        }
        title="Logs"
      />

      <div className="page">
        <div className="logs fade-in">
          <div className="logs__calendar">
            <div className="logs__calendar-header">
              <span className="logs__month-label">
                {getMonthName(currentMonth)} {currentYear}
              </span>

              <div className="logs__nav-btns">
                <button className="logs__nav-btn" onClick={handlePrevMonth} type="button">
                  <ChevronUpIcon />
                </button>

                <button className="logs__nav-btn" onClick={handleNextMonth} type="button">
                  <ChevronDownIcon />
                </button>
              </div>
            </div>

            <div className="logs__weekdays">
              {WEEKDAY_LABELS.map((d) => (
                <span className="logs__weekday" key={d}>
                  {d}
                </span>
              ))}
            </div>

            <div className="logs__days">
              {calendarDays.map((day, i) => {
                const dateId = formatDateId(day.date);
                const isCurrentMonth = day.date.getMonth() === currentMonth;
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = dateId === selectedDate;
                const hasWorkout = workoutDates.has(dateId);

                const dayClasses = [
                  'logs__day',
                  isToday ? 'logs__day--today' : '',
                  isSelected ? 'logs__day--selected' : '',
                  hasWorkout && !isSelected ? 'logs__day--has-workout' : '',
                  !isCurrentMonth ? 'logs__day--other-month' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    className={dayClasses}
                    key={i}
                    onClick={() => setSelectedDate(dateId)}
                    type="button"
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="logs__details">
            {!selectedWorkout && (
              <p className="logs__no-data">
                No workout on {formatDateLabel(parseDateId(selectedDate))}
              </p>
            )}

            {selectedWorkout && (
              <div className="logs__workout-card">
                <div className="logs__workout-header">
                  <span className="logs__workout-name">{selectedWorkout.workoutName}</span>

                  <span className="logs__workout-duration">
                    {formatDuration(selectedWorkout.startedAt, selectedWorkout.completedAt)}
                  </span>
                </div>

                {selectedWorkout.exercises.map((exercise) => (
                  <div className="logs__exercise-log" key={exercise.id}>
                    <div className="logs__exercise-name">
                      {exercise.name}
                      {exercise.completedAt && ' ✓'}
                    </div>

                    {exercise.sets.map((set) => (
                      <div className="logs__set-log" key={set.id}>
                        <span className={set.completedAt ? 'logs__set-completed' : ''}>
                          Set {set.setNumber}: {set.reps} reps × {formatWeight(set.totalWeight)}
                          {set.notes ? ` — ${set.notes}` : ''}
                          {set.completedAt ? ' ✓' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface CalendarDay {
  date: Date;
}

const buildCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
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
