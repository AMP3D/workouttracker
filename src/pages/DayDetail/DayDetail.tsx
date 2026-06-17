import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../assets/icons';
import { AddWorkoutDialog } from '../../components/AddWorkoutDialog/AddWorkoutDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ExerciseItem } from '../../components/ExerciseItem/ExerciseItem';
import { Header } from '../../components/Header/Header';
import { Toast } from '../../components/Toast/Toast';
import type { DayWorkout, Exercise, ExerciseSet, WorkoutTemplate } from '../../models';
import { showToast } from '../../state/app-state';
import { templates } from '../../state/workout-state';
import {
  deleteWorkout,
  getAllTemplates,
  getAllWorkouts,
  getWorkoutsByDate,
  saveWorkout,
  syncWorkoutToTemplate,
} from '../../storage/workout-storage';
import { formatDateId, formatDateLabel, parseDateId } from '../../utils/date-utils';
import { makeExerciseId, makeSetId, makeWorkoutId } from '../../utils/id-utils';
import { calculateTotalWeight, formatVolume } from '../../utils/weight-utils';
import './day-detail.scss';

export const DayDetail = () => {
  const { dateId } = useParams<{ dateId: string }>();
  const navigate = useNavigate();

  const [allWorkouts, setAllWorkouts] = useState<DayWorkout[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<Map<string, Set<string>>>(new Map());
  const [dayWorkouts, setDayWorkouts] = useState<DayWorkout[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Set<string>>(new Set());
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState<string | null>(null);
  const [showBulkDeleteWorkoutId, setShowBulkDeleteWorkoutId] = useState<string | null>(null);
  const [newExerciseMuscles, setNewExerciseMuscles] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');

  const date = dateId ? parseDateId(dateId) : new Date();
  const dateLabel = formatDateLabel(date);

  useEffect(() => {
    if (dateId) {
      loadDayData(dateId);
    }
  }, [dateId]);

  const getCheckedForWorkout = (workoutId: string): Set<string> =>
    checkedExercises.get(workoutId) ?? new Set();

  const handleAddExercise = async (workoutId: string) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout || !newExerciseName.trim()) {
      return;
    }

    const muscles = newExerciseMuscles
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const defaultSet: ExerciseSet = {
      completedAt: null,
      id: makeSetId(),
      notes: '',
      reps: 10,
      setNumber: 1,
      totalWeight: 0,
      weights: [0],
    };

    const newExercise: Exercise = {
      completedAt: null,
      id: makeExerciseId(),
      muscles,
      name: newExerciseName.trim(),
      order: workout.exercises.length,
      sets: [defaultSet],
    };

    await persistWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });

    setNewExerciseMuscles('');
    setNewExerciseName('');
    setShowAddExerciseForm(null);
  };

  const handleAddWorkout = async (workoutName: string, template?: WorkoutTemplate) => {
    if (!dateId) {
      return;
    }

    const exercises: Exercise[] = template
      ? template.exercises.map((ex, index) => ({
          completedAt: null,
          id: makeExerciseId(),
          muscles: [...ex.muscles],
          name: ex.name,
          order: index,
          sets: ex.sets.map((s, sIndex) => ({
            completedAt: null,
            id: makeSetId(),
            notes: s.notes,
            reps: s.reps,
            setNumber: sIndex + 1,
            totalWeight: calculateTotalWeight(s.weights),
            weights: [...s.weights],
          })),
        }))
      : [];

    const workout: DayWorkout = {
      completedAt: null,
      date: dateId,
      exercises,
      id: makeWorkoutId(),
      startedAt: Date.now(),
      workoutName,
    };

    await saveWorkout(workout);
    setShowAddDialog(false);
    await loadDayData(dateId);
    showToast(`Added "${workoutName}"`);
  };

  const handleBulkDelete = async (workoutId: string) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);
    const checked = getCheckedForWorkout(workoutId);

    if (!workout) {
      return;
    }

    const updated: DayWorkout = {
      ...workout,
      exercises: workout.exercises.filter((e) => !checked.has(e.id)),
    };

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
    setCheckedExercises((prev) => {
      const next = new Map(prev);
      const workoutSet = new Set(next.get(workoutId) ?? []);

      if (checked) {
        workoutSet.add(exerciseId);
      } else {
        workoutSet.delete(exerciseId);
      }

      if (workoutSet.size === 0) {
        next.delete(workoutId);
      } else {
        next.set(workoutId, workoutSet);
      }

      return next;
    });
  };

  const handleCloneExercise = async (workoutId: string, exerciseIndex: number) => {
    const workout = dayWorkouts.find((w) => w.id === workoutId);

    if (!workout) {
      return;
    }

    const source = workout.exercises[exerciseIndex];
    const cloned: Exercise = {
      ...source,
      completedAt: null,
      id: makeExerciseId(),
      order: workout.exercises.length,
      sets: source.sets.map((s) => ({
        ...s,
        completedAt: null,
        id: makeSetId(),
      })),
    };

    await persistWorkout({
      ...workout,
      exercises: [...workout.exercises, cloned],
    });

    showToast(`Cloned "${source.name}"`);
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

    const name = workout.exercises[exerciseIndex].name;
    const exercises = workout.exercises
      .filter((_, i) => i !== exerciseIndex)
      .map((e, i) => ({ ...e, order: i }));

    await persistWorkout({ ...workout, exercises });
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

    const exercises = [...workout.exercises];
    const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;

    if (targetIndex < 0 || targetIndex >= exercises.length) {
      return;
    }

    [exercises[exerciseIndex], exercises[targetIndex]] = [
      exercises[targetIndex],
      exercises[exerciseIndex],
    ];
    const reordered = exercises.map((e, i) => ({ ...e, order: i }));

    await persistWorkout({ ...workout, exercises: reordered });
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

    const exercises = workout.exercises.map((e, i) => (i === exerciseIndex ? updated : e));
    const allExercisesComplete = exercises.every((e) => e.completedAt);

    await persistWorkout({
      ...workout,
      completedAt: allExercisesComplete ? Date.now() : null,
      exercises,
    });

    if (allSetsJustCompleted) {
      setExpandedExerciseIds((prev) => {
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });

      const nextIncomplete = exercises.findIndex((e, i) => i > exerciseIndex && !e.completedAt);

      if (nextIncomplete !== -1) {
        setTimeout(() => {
          setExpandedExerciseIds((prev) => new Set([...prev, exercises[nextIncomplete].id]));
        }, 300);
      }
    }
  };

  const loadDayData = async (id: string) => {
    const workouts = await getWorkoutsByDate(id);
    setDayWorkouts(workouts);

    const all = await getAllWorkouts();
    setAllWorkouts(all);

    const loadedTemplates = await getAllTemplates();
    templates.value = loadedTemplates;
  };

  const isToday = dateId === formatDateId(new Date());

  const persistWorkout = async (updated: DayWorkout) => {
    await saveWorkout(updated);

    if (isToday) {
      await syncWorkoutToTemplate(updated);
    }

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
            const checked = getCheckedForWorkout(workout.id);
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
                        setExpandedExerciseIds((prev) => {
                          const next = new Set(prev);
                          for (const ex of workout.exercises) {
                            next.delete(ex.id);
                          }
                          return next;
                        });
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
                        setExpandedExerciseIds((prev) => {
                          const next = new Set(prev);

                          if (next.has(exercise.id)) {
                            next.delete(exercise.id);
                          } else {
                            next.add(exercise.id);
                          }

                          return next;
                        })
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
          message="Delete this entire workout and all its exercises from the DB? This cannot be undone."
          onCancel={() => setPendingDeleteWorkoutId(null)}
          onConfirm={handleConfirmDeleteWorkout}
          title="Delete Workout"
        />
      )}

      {showBulkDeleteWorkoutId && (
        <ConfirmDialog
          confirmLabel="Delete"
          danger
          message={`Delete ${getCheckedForWorkout(showBulkDeleteWorkoutId).size} selected exercise(s) from the DB? This cannot be undone.`}
          onCancel={() => setShowBulkDeleteWorkoutId(null)}
          onConfirm={() => handleBulkDelete(showBulkDeleteWorkoutId)}
          title="Delete Exercises"
        />
      )}

      <Toast />
    </>
  );
};
