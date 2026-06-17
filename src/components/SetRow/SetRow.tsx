import { useRef, useState } from 'react';
import { DocumentDuplicateIcon, TrashIcon } from '../../assets/icons';
import { formatWeight } from '../../utils/weight-utils';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { LiveTimestamp } from '../LiveTimestamp/LiveTimestamp';
import {
  applyWeightsToSet,
  flashLastChild,
  type SetRowProps,
  updateSetNotes,
  updateSetReps,
} from './set-row';
import './set-row.scss';

export const SetRow = ({
  editing,
  onChange,
  onClone,
  onDelete,
  onToggleComplete,
  set,
}: SetRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [weightsStr, setWeightsStr] = useState(set.weights.join(', '));

  const classNames = ['set-row', set.completedAt ? 'set-row--completed' : '']
    .filter(Boolean)
    .join(' ');

  const handleClone = () => {
    onClone();

    requestAnimationFrame(() => {
      flashLastChild(rowRef.current?.parentElement);
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange(updateSetNotes(set, notes));
  };

  const handleRepsChange = (value: string) => {
    onChange(updateSetReps(set, value));
  };

  const handleWeightsChange = (value: string) => {
    setWeightsStr(value);
    onChange(applyWeightsToSet(set, value));
  };

  return (
    <>
      <div className={classNames} ref={rowRef}>
        <div className="set-row__top">
          <span className="set-row__number">#{set.setNumber}</span>

          <div className="set-row__details">
            <div className="set-row__detail-line">
              <span className="set-row__stat">
                <span className="set-row__stat-label">Reps: </span>
                <span className="set-row__reps-value">{set.reps}</span>
              </span>

              <span className="set-row__stat set-row__total">{formatWeight(set.totalWeight)}</span>
            </div>

            <div className="set-row__detail-line">
              <span className="set-row__stat">
                <span className="set-row__stat-label">Weights: </span>
                <span className="set-row__stat-value">{set.weights.join(', ')}</span>
              </span>
            </div>

            {set.notes && !editing && (
              <div className="set-row__detail-line">
                <span className="set-row__stat">
                  <span className="set-row__stat-label">Notes: </span>
                  <span className="set-row__stat-value">{set.notes}</span>
                </span>
              </div>
            )}

            <div className="set-row__detail-line set-row__row-actions">
              <button
                className="set-row__action-btn"
                onClick={handleClone}
                title="Clone set"
                type="button"
              >
                <DocumentDuplicateIcon />
                Clone
              </button>

              <button
                className="set-row__action-btn set-row__action-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete set"
                type="button"
              >
                <TrashIcon />
                Delete
              </button>
            </div>
          </div>

          <div className="set-row__complete">
            <span className="set-row__complete-label">Complete</span>

            <input
              checked={!!set.completedAt}
              className="set-row__checkbox"
              onChange={onToggleComplete}
              type="checkbox"
            />

            {set.completedAt && (
              <LiveTimestamp className="set-row__last-completed" timestamp={set.completedAt} />
            )}
          </div>
        </div>

        {editing && (
          <div className="set-row__edit-fields">
            <div className="set-row__edit-top">
              <div className="set-row__field">
                <label className="set-row__field-label">Reps</label>

                <input
                  className="set-row__field-input"
                  min="0"
                  onChange={(e) => handleRepsChange(e.target.value)}
                  type="number"
                  value={set.reps}
                />
              </div>

              <div className="set-row__field">
                <label className="set-row__field-label">Weights</label>

                <input
                  className="set-row__field-input set-row__field-input--wide"
                  onChange={(e) => handleWeightsChange(e.target.value)}
                  placeholder="5, 10, 10"
                  type="text"
                  value={weightsStr}
                />
              </div>
            </div>

            <div className="set-row__field set-row__field--full">
              <label className="set-row__field-label">Notes</label>

              <input
                className="set-row__notes-input"
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Optional note..."
                type="text"
                value={set.notes}
              />
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          confirmLabel="Delete Set"
          danger
          message={`Delete set #${set.setNumber}? This cannot be undone.`}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete();
          }}
          title="Delete Set"
        />
      )}
    </>
  );
};
