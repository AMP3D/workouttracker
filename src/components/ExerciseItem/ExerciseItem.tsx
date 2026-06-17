import { useEffect, useRef } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '../../assets/icons';
import type { ExerciseSet } from '../../models';
import { SetRow } from '../SetRow/SetRow';
import {
  addSetToExercise,
  cloneSetInExercise,
  deleteSetFromExercise,
  type ExerciseItemProps,
  toggleSetCompletion,
  updateExerciseMuscles,
  updateSetInExercise,
} from './exercise-item';
import './exercise-item.scss';

export const ExerciseItem = ({
  checked,
  editing,
  exercise,
  expanded,
  isFirst,
  isLast,
  onCheckChange,
  onClone,
  onDelete,
  onMoveDown,
  onMoveUp,
  onToggleEditing,
  onToggleExpanded,
  onUpdate,
}: ExerciseItemProps) => {
  const prevAllCompleteRef = useRef(false);

  const completedSets = exercise.sets.filter((s) => s.completedAt).length;
  const totalSets = exercise.sets.length;
  const allComplete = totalSets > 0 && completedSets === totalSets;

  useEffect(() => {
    if (allComplete && !prevAllCompleteRef.current) {
      onUpdate({ ...exercise, completedAt: Date.now() }, true);
    }

    prevAllCompleteRef.current = allComplete;
  }, [allComplete]);

  const handleAddSet = () => {
    onUpdate(addSetToExercise(exercise));
  };

  const handleCloneSet = (setIndex: number) => {
    onUpdate(cloneSetInExercise(exercise, setIndex));
  };

  const handleDeleteSet = (setIndex: number) => {
    onUpdate(deleteSetFromExercise(exercise, setIndex));
  };

  const handleMusclesChange = (value: string) => {
    onUpdate(updateExerciseMuscles(exercise, value));
  };

  const handleSetChange = (setIndex: number, updated: ExerciseSet) => {
    onUpdate(updateSetInExercise(exercise, setIndex, updated));
  };

  const handleToggleSetComplete = (setIndex: number) => {
    onUpdate(toggleSetCompletion(exercise, setIndex));
  };

  return (
    <div
      className={[
        'exercise-item',
        allComplete ? 'exercise-item--completed' : '',
        expanded ? 'exercise-item--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="exercise-item__header" onClick={onToggleExpanded}>
        <input
          checked={checked}
          className="exercise-item__checkbox"
          onChange={(e) => {
            e.stopPropagation();
            onCheckChange(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          type="checkbox"
        />

        <div className="exercise-item__info">
          <span className="exercise-item__name">{exercise.name}</span>

          {editing && expanded ? (
            <input
              className="exercise-item__muscles-input"
              onChange={(e) => {
                e.stopPropagation();
                handleMusclesChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Muscle groups (comma separated)"
              type="text"
              value={exercise.muscles.join(', ')}
            />
          ) : (
            exercise.muscles.length > 0 && (
              <span className="exercise-item__muscles">{exercise.muscles.join(', ')}</span>
            )
          )}
        </div>

        <div className="exercise-item__meta">
          <span className="exercise-item__progress">
            {completedSets}/{totalSets}
          </span>

          <div className="exercise-item__move-btns" onClick={(e) => e.stopPropagation()}>
            <button disabled={isFirst} onClick={onMoveUp} type="button">
              <ArrowUpIcon />
            </button>

            <button disabled={isLast} onClick={onMoveDown} type="button">
              <ArrowDownIcon />
            </button>
          </div>

          <span
            className={`exercise-item__chevron ${expanded ? 'exercise-item__chevron--open' : ''}`}
          >
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="exercise-item__body">
          <div className="exercise-item__sets-header">
            <span className="exercise-item__sets-title">Sets</span>

            <div className="exercise-item__set-actions">
              <button
                className="exercise-item__edit-toggle"
                onClick={onToggleEditing}
                type="button"
              >
                <PencilIcon />
                {editing ? 'Done' : 'Edit'}
              </button>

              <button className="exercise-item__add-set-btn" onClick={handleAddSet} type="button">
                <PlusIcon />
                Add Set
              </button>
            </div>
          </div>

          {exercise.sets.map((set, i) => (
            <SetRow
              editing={editing}
              key={set.id}
              onChange={(updated) => handleSetChange(i, updated)}
              onClone={() => handleCloneSet(i)}
              onDelete={() => handleDeleteSet(i)}
              onToggleComplete={() => handleToggleSetComplete(i)}
              set={set}
            />
          ))}

          {editing && (
            <div className="exercise-item__exercise-actions">
              <button className="exercise-item__clone-btn" onClick={onClone} type="button">
                <DocumentDuplicateIcon />
                Clone Exercise
              </button>

              <button className="exercise-item__delete-btn" onClick={onDelete} type="button">
                <TrashIcon />
                Delete Exercise
              </button>
            </div>
          )}

          <button className="exercise-item__footer-toggle" onClick={onToggleExpanded} type="button">
            <span className={`exercise-item__chevron exercise-item__chevron--open`}>
              <ChevronDownIcon />
            </span>
            Collapse
          </button>
        </div>
      )}
    </div>
  );
};
