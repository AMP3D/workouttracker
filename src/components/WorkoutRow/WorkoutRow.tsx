import { useNavigate } from 'react-router-dom';
import type { DayWorkout } from '../../models';
import { formatDateId, formatDateLabel } from '../../utils/date-utils';
import './workout-row.scss';

interface WorkoutRowProps {
  date: Date;
  workouts: DayWorkout[];
}

export const WorkoutRow = ({ date, workouts }: WorkoutRowProps) => {
  const navigate = useNavigate();

  const isToday = date.toDateString() === new Date().toDateString();
  const dateLabel = formatDateLabel(date);
  const hasWorkouts = workouts.length > 0;

  const classNames = [
    'workout-row',
    isToday ? 'workout-row--today' : '',
    !hasWorkouts ? 'workout-row--empty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    navigate(`/day/${formatDateId(date)}`);
  };

  return (
    <div className={classNames} onClick={handleClick}>
      <span className="workout-row__date">{dateLabel}</span>

      {workouts.length === 1 && (
        <span className="workout-row__workout-name">{workouts[0].workoutName}</span>
      )}

      {workouts.length > 1 && (
        <div className="workout-row__multi">
          {workouts.map((w) => (
            <span className="workout-row__workout-name" key={w.id}>
              {w.workoutName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
