import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../assets/icons';
import { AddWorkoutDialog } from '../../components/AddWorkoutDialog/AddWorkoutDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ExerciseItem } from '../../components/ExerciseItem/ExerciseItem';
import { Header } from '../../components/Header/Header';
import { Toast } from '../../components/Toast/Toast';
import type { DayWorkout, Exercise, WorkoutTemplate } from '../../models';
import { showToast } from '../../state/app-state';
import { templates } from '../../state/workout-state';
import { deleteWorkout } from '../../storage/workout-storage';
import { formatDateId, formatDateLabel, parseDateId } from '../../utils/date-utils';
import { formatVolume } from '../../utils/weight-utils';
import {
  appendExerciseToWorkout,
  applyExerciseUpdate,
  cloneExerciseInWorkout,
  computeElapsedDisplay,
  fetchDayData,
  filterUncheckedExercises,
  findNextIncompleteIndex,
  getCheckedForWorkout,
  moveExerciseInWorkout,
  persistAndSync,
  removeExerciseFromWorkout,
  removeIdsFromSet,
  saveNewWorkout,
  toggleIdInSet,
  updateCheckedExercises,
} from './day-detail';
import './day-detail.scss';

export const DayDetail = () => {
  const { dateId } = useParams<{ dateId: string }>();
  const navigate = useNavigate();

  const [allWorkouts, setAllWorkouts] = useState<DayWorkout[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<Map<string, Set<string>>>(new Map());
  const [dayWorkouts, setDayWorkouts] = useState<DayWorkout[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState<string | null>(null);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Set<string>>(new Set());
  const [flashExerciseId, setFlashExerciseId] = useState<string | null>(null);
  const [newExerciseMuscles, setNewExerciseMuscles] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState<string | null>(null);
  const [showBulkDeleteWorkoutId, setShowBulkDeleteWorkoutId] = useState<string | null>(null);

  const date = dateId ? parseDateId(dateId) : new Date();
  const dateLabel = formatDateLabel(date);
  const isToday = dateId === formatDateId(new Date());

  useEffect(() => {
    if (dateId) {
      loadDayData(dateId);
    }
  }, [dateId]);

  useEffect(() => {
    const { display, isLive } = computeElapsedDisplay(dayWorkouts);
    setElapsedDisplay(display);

    if (!isLive) {
      return;
    }

    const interval = setInterval(() => {
      const { display: updated } = computeElapsedDisplay(dayWorkouts);
      setElapsedDisplay(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [dayWorkouts]);

  const handleAddExercise = async (workoutId: string) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout || !newExerciseName.trim()) {
      return;
    }

    const updated = appendExerciseToWorkout(workout, newExerciseName.trim(), newExerciseMuscles);
    await persistWorkout(updated);

    setNewExerciseMuscles('');
    setNewExerciseName('');
    setShowAddExerciseForm(null);
  };

  const handleAddWorkout = async (workoutName: string, template?: WorkoutTemplate) => {
    if (!dateId) {
      return;
    }

    await saveNewWorkout(dateId, workoutName, template);
    setShowAddDialog(false);
    await loadDayData(dateId);
    showToast(`Added "${workoutName}"`);
  };

  const handleBulkDelete = async (workoutId: string) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);
    const checked = getCheckedForWorkout(checkedExercises, workoutId);

    if (!workout) {
      return;
    }

    const updated = filterUncheckedExercises(workout, checked);
    await persistWorkout(updated);

    setCheckedExercises((prev) => {
      const next = new Map(prev);
      next.delete(workoutId);
      return next;
    });
    setShowBulkDeleteWorkoutId(null);
    showToast(`Deleted ${checked.size} exercise(s)`);
  };

  const handleCheckChange = (workoutId: string, exerciseId: string, checked: boolean) => {
    setCheckedExercises((prev) => updateCheckedExercises(prev, workoutId, exerciseId, checked));
  };

  const handleCloneExercise = async (workoutId: string, exerciseIndex: number) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout) {
      return;
    }

    const updated = cloneExerciseInWorkout(workout, exerciseIndex);
    await persistWorkout(updated);
    showToast(`Cloned "${workout.exercises[exerciseIndex].name}"`);
  };

  const handleConfirmDeleteWorkout = async () => {
    if (!pendingDeleteWorkoutId || !dateId) {
      return;
    }

    await deleteWorkout(pendingDeleteWorkoutId);
    setPendingDeleteWorkoutId(null);
    await loadDayData(dateId);
    showToast('Workout deleted');
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout) {
      return;
    }

    const { name, updated } = removeExerciseFromWorkout(workout, exerciseIndex);
    await persistWorkout(updated);
    showToast(`Deleted "${name}"`);
  };

  const handleMoveExercise = async (
    workoutId: string,
    exerciseIndex: number,
    direction: 'down' | 'up',
  ) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout) {
      return;
    }

    const updated = moveExerciseInWorkout(workout, exerciseIndex, direction);

    if (!updated) {
      return;
    }

    const movedId = workout.exercises[exerciseIndex].id;

    setFlashExerciseId(movedId);
    setTimeout(() => setFlashExerciseId(null), 1500);

    await persistWorkout(updated);
  };

  const handleUpdateExercise = async (
    workoutId: string,
    exerciseIndex: number,
    updated: Exercise,
    allSetsJustCompleted?: boolean,
  ) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout) {
      return;
    }

    const updatedWorkout = applyExerciseUpdate(workout, exerciseIndex, updated);
    await persistWorkout(updatedWorkout);

    if (allSetsJustCompleted) {
      setExpandedExerciseIds((prev) => {
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });

      const nextIdx = findNextIncompleteIndex(updatedWorkout.exercises, exerciseIndex);

      if (nextIdx !== -1) {
        setTimeout(() => {
          setExpandedExerciseIds(
            (prev) => new Set([...prev, updatedWorkout.exercises[nextIdx].id]),
          );
        }, 300);
      }
    }
  };

  const loadDayData = async (id: string) => {
    const data = await fetchDayData(id);
    setDayWorkouts(data.dayWorkouts);
    setAllWorkouts(data.allWorkouts);
    templates.value = data.templates;
  };

  const persistWorkout = async (updated: DayWorkout) => {
    await persistAndSync(updated, isToday);

    if (dateId) {
      await loadDayData(dateId);
    }
  };

  return (
    <>
      <Header
        leftContent={
          <button className="header__back-btn" onClick={() => navigate('/')} type="button">
            <ArrowLeftIcon style={{ height: '1.25rem', width: '1.25rem' }} />
          </button>
        }
        rightContent={
          dayWorkouts.length > 0 ? (
            <button
              className="header__icon-btn"
              onClick={() => setShowAddDialog(true)}
              type="button"
            >
              <PlusIcon />
            </button>
          ) : undefined
        }
        subtitle={elapsedDisplay ?? '\u00A0'}
        title={dateLabel}
      />

      <div className="page">
        <div className="day-detail fade-in">
          {dayWorkouts.length === 0 && (
            <div className="day-detail__empty">
              <button
                className="day-detail__empty-add"
                onClick={() => setShowAddDialog(true)}
                type="button"
              >
                <PlusIcon />
                <span>Add Workout</span>
              </button>
            </div>
          )}

          {dayWorkouts.map((workout) => {
            const checked = getCheckedForWorkout(checkedExercises, workout.id);
            const exerciseCount = workout.exercises.length;
            const totalVolume = formatVolume(workout.exercises);
            const allExercisesComplete =
              exerciseCount > 0 && workout.exercises.every((e) => e.completedAt);
            const sectionClass = [
              'day-detail__workout-section',
              allExercisesComplete ? 'day-detail__workout-section--completed' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div className={sectionClass} key={workout.id}>
                <div className="day-detail__workout-header">
                  <div className="day-detail__workout-info">
                    <h3 className="day-detail__workout-name">{workout.workoutName}</h3>

                    <span className="day-detail__workout-stats">
                      {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} ·{' '}
                      {totalVolume.toLocaleString()}lb
                    </span>
                  </div>

                  <div className="day-detail__workout-actions">
                    <button
                      className="day-detail__collapse-all-btn"
                      onClick={() => {
                        const ids = workout.exercises.map((ex) => ex.id);
                        setExpandedExerciseIds((prev) => removeIdsFromSet(prev, ids));
                      }}
                      type="button"
                    >
                      <ChevronUpIcon />
                    </button>

                    <button
                      className="day-detail__delete-workout-btn"
                      onClick={() => setPendingDeleteWorkoutId(workout.id)}
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {checked.size > 0 && (
                  <div className="day-detail__toolbar">
                    <span className="day-detail__selected-count">{checked.size} selected</span>

                    <button
                      className="day-detail__bulk-btn"
                      onClick={() => setShowBulkDeleteWorkoutId(workout.id)}
                      type="button"
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                )}

                <div className="day-detail__exercises">
                  {workout.exercises.map((exercise, index) => (
                    <ExerciseItem
                      checked={checked.has(exercise.id)}
                      editing={editingExerciseId === exercise.id}
                      exercise={exercise}
                      expanded={expandedExerciseIds.has(exercise.id)}
                      flash={flashExerciseId === exercise.id}
                      isFirst={index === 0}
                      isLast={index === workout.exercises.length - 1}
                      key={exercise.id}
                      onCheckChange={(isChecked) =>
                        handleCheckChange(workout.id, exercise.id, isChecked)
                      }
                      onClone={() => handleCloneExercise(workout.id, index)}
                      onDelete={() => handleDeleteExercise(workout.id, index)}
                      onMoveDown={() => handleMoveExercise(workout.id, index, 'down')}
                      onMoveUp={() => handleMoveExercise(workout.id, index, 'up')}
                      onToggleEditing={() =>
                        setEditingExerciseId(editingExerciseId === exercise.id ? null : exercise.id)
                      }
                      onToggleExpanded={() =>
                        setExpandedExerciseIds((prev) => toggleIdInSet(prev, exercise.id))
                      }
                      onUpdate={(updated, allSetsJustCompleted) =>
                        handleUpdateExercise(workout.id, index, updated, allSetsJustCompleted)
                      }
                    />
                  ))}
                </div>

                {showAddExerciseForm === workout.id ? (
                  <div className="add-exercise-form">
                    <div className="add-exercise-form__row">
                      <input
                        className="add-exercise-form__input"
                        onChange={(e) => setNewExerciseName(e.target.value)}
                        placeholder="Exercise name"
                        type="text"
                        value={newExerciseName}
                      />
                    </div>

                    <div className="add-exercise-form__row">
                      <input
                        className="add-exercise-form__input"
                        onChange={(e) => setNewExerciseMuscles(e.target.value)}
                        placeholder="Muscles (comma separated)"
                        type="text"
                        value={newExerciseMuscles}
                      />
                    </div>

                    <div className="add-exercise-form__actions">
                      <button
                        className="add-exercise-form__btn add-exercise-form__btn--cancel"
                        onClick={() => setShowAddExerciseForm(null)}
                        type="button"
                      >
                        Cancel
                      </button>

                      <button
                        className="add-exercise-form__btn add-exercise-form__btn--add"
                        disabled={!newExerciseName.trim()}
                        onClick={() => handleAddExercise(workout.id)}
                        type="button"
                      >
                        Add Exercise
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="day-detail__add-exercise"
                    onClick={() => {
                      setNewExerciseName('');
                      setNewExerciseMuscles('');
                      setShowAddExerciseForm(workout.id);
                    }}
                    type="button"
                  >
                    <PlusIcon />
                    Add Exercise
                  </button>
                )}
              </div>
            );
          })}

          {dayWorkouts.length > 0 && (
            <button
              className="day-detail__add-workout-btn"
              onClick={() => setShowAddDialog(true)}
              type="button"
            >
              <PlusIcon />
              Add Another Workout
            </button>
          )}
        </div>
      </div>

      {showAddDialog && (
        <AddWorkoutDialog
          dayOfWeek={date.getDay()}
          onClose={() => setShowAddDialog(false)}
          onConfirm={handleAddWorkout}
          workouts={allWorkouts}
        />
      )}

      {pendingDeleteWorkoutId && (
        <ConfirmDialog
          confirmLabel="Delete Workout"
          danger
          message="Delete this entire workout and all its exercises from this date? This cannot be undone."
          onCancel={() => setPendingDeleteWorkoutId(null)}
          onConfirm={handleConfirmDeleteWorkout}
          title="Delete Workout"
        />
      )}

      {showBulkDeleteWorkoutId && (
        <ConfirmDialog
          confirmLabel="Delete"
          danger
          message={`Delete ${getCheckedForWorkout(checkedExercises, showBulkDeleteWorkoutId).size} selected exercise(s) from the DB? This will be deleted from the tempalte and cannot be undone.`}
          onCancel={() => setShowBulkDeleteWorkoutId(null)}
          onConfirm={() => handleBulkDelete(showBulkDeleteWorkoutId)}
          title="Delete Exercises"
        />
      )}

      <Toast />
    </>
  );
};
