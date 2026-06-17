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
import type { Exercise, ExerciseSet } from '../../models';
import { makeSetId } from '../../utils/id-utils';
import { SetRow } from '../SetRow/SetRow';
import './exercise-item.scss';

interface ExerciseItemProps {
  checked: boolean;
  editing: boolean;
  exercise: Exercise;
  expanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCheckChange: (checked: boolean) => void;
  onClone: () => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onToggleEditing: () => void;
  onToggleExpanded: () => void;
  onUpdate: (exercise: Exercise, allSetsJustCompleted?: boolean) => void;
}

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
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      completedAt: null,
      id: makeSetId(),
      notes: '',
      reps: lastSet?.reps ?? 10,
      setNumber: totalSets + 1,
      totalWeight: lastSet?.totalWeight ?? 0,
      weights: lastSet?.weights ?? [0],
    };

    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const handleCloneSet = (setIndex: number) => {
    const source = exercise.sets[setIndex];
    const cloned: ExerciseSet = {
      ...source,
      completedAt: null,
      id: makeSetId(),
      setNumber: totalSets + 1,
    };

    const sets = [...exercise.sets, cloned];
    const renumbered = sets.map((s, i) => ({ ...s, setNumber: i + 1 }));

    onUpdate({ ...exercise, sets: renumbered });
  };

  const handleDeleteSet = (setIndex: number) => {
    const sets = exercise.sets
      .filter((_, i) => i !== setIndex)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));

    onUpdate({ ...exercise, sets });
  };

  const handleMusclesChange = (value: string) => {
    const muscles = value
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    onUpdate({ ...exercise, muscles });
  };

  const handleSetChange = (setIndex: number, updated: ExerciseSet) => {
    const sets = exercise.sets.map((s, i) => (i === setIndex ? updated : s));
    onUpdate({ ...exercise, sets });
  };

  const handleToggleSetComplete = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    const completedAt = set.completedAt ? null : Date.now();
    const sets = exercise.sets.map((s, i) => (i === setIndex ? { ...s, completedAt } : s));

    const nowAllComplete = sets.every((s) => s.completedAt);

    onUpdate({
      ...exercise,
      completedAt: nowAllComplete ? Date.now() : null,
      sets,
    });
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
