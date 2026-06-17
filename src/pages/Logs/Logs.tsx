import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '../../assets/icons';
import { Header } from '../../components/Header/Header';
import type { DayWorkout } from '../../models';
import { getAllWorkouts } from '../../storage/workout-storage';
import { formatDateId, formatDateLabel, getMonthName, parseDateId } from '../../utils/date-utils';
import { formatWeight } from '../../utils/weight-utils';
import { formatDuration, getFirstSetCompletion, getLastSetCompletion } from '../../utils/workout-utils';
import { buildCalendarDays, getNextMonth, getPrevMonth, WEEKDAY_LABELS } from './logs-utils';
import './logs.scss';

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

  const workoutStart = selectedWorkout ? getFirstSetCompletion(selectedWorkout) : null;
  const workoutEnd = selectedWorkout ? getLastSetCompletion(selectedWorkout) : null;
  const workoutDuration =
    workoutStart && workoutEnd ? formatDuration(workoutEnd - workoutStart) : '';

  const handleNextMonth = () => {
    const next = getNextMonth(currentMonth, currentYear);
    setCurrentMonth(next.month);
    setCurrentYear(next.year);
  };

  const handlePrevMonth = () => {
    const prev = getPrevMonth(currentMonth, currentYear);
    setCurrentMonth(prev.month);
    setCurrentYear(prev.year);
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

                  <span className="logs__workout-duration">{workoutDuration}</span>
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
                          {set.completedAt && workoutStart
                            ? ` · ${formatDuration(set.completedAt - workoutStart)}`
                            : ''}
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
