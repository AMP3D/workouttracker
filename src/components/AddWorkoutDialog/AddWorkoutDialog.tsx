import { useState } from 'react';
import { templates } from '../../state/workout-state';
import { Modal } from '../Modal/Modal';
import {
  type AddWorkoutDialogProps,
  findSuggestedForDay,
  sortTemplatesByLastCompleted,
} from './add-workout-dialog';
import './add-workout-dialog.scss';

export const AddWorkoutDialog = ({
  dayOfWeek,
  onClose,
  onConfirm,
  workouts,
}: AddWorkoutDialogProps) => {
  const [customName, setCustomName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const allTemplates = templates.value;
  const sortedTemplates = sortTemplatesByLastCompleted(allTemplates, workouts);
  const suggestedTemplates = findSuggestedForDay(allTemplates, workouts, dayOfWeek);
  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId);
  const workoutName = selectedTemplate?.name ?? customName;
  const canConfirm = workoutName.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }

    onConfirm(workoutName.trim(), selectedTemplate);
  };

  const handleTemplateClick = (id: string) => {
    setSelectedTemplateId(selectedTemplateId === id ? null : id);
    setCustomName('');
  };

  return (
    <Modal onClose={onClose} showCloseButton title="Add Workout">
      {suggestedTemplates.length > 0 && (
        <>
          <p className="add-workout-dialog__section-label">Suggested</p>

          <div className="add-workout-dialog__template-list">
            {suggestedTemplates.map((template) => (
              <button
                className={`add-workout-dialog__template-item add-workout-dialog__template-item--suggested ${
                  selectedTemplateId === template.id
                    ? 'add-workout-dialog__template-item--selected'
                    : ''
                }`}
                key={`suggested-${template.id}`}
                onClick={() => handleTemplateClick(template.id)}
                type="button"
              >
                {template.name}
              </button>
            ))}
          </div>
        </>
      )}

      {sortedTemplates.length > 0 && (
        <>
          <p className="add-workout-dialog__section-label">From Template</p>

          <div className="add-workout-dialog__template-list">
            {sortedTemplates.map((template) => (
              <button
                className={`add-workout-dialog__template-item ${
                  selectedTemplateId === template.id
                    ? 'add-workout-dialog__template-item--selected'
                    : ''
                }`}
                key={template.id}
                onClick={() => handleTemplateClick(template.id)}
                type="button"
              >
                {template.name}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="add-workout-dialog__section-label">Or Custom Name</p>

      <input
        className="add-workout-dialog__input"
        onChange={(e) => {
          setCustomName(e.target.value);
          setSelectedTemplateId(null);
        }}
        placeholder="e.g. Chest/Triceps"
        type="text"
        value={selectedTemplateId ? '' : customName}
      />

      <div className="modal__actions">
        <button className="modal__btn-cancel" onClick={onClose} type="button">
          Cancel
        </button>

        <button
          className="modal__btn-confirm"
          disabled={!canConfirm}
          onClick={handleConfirm}
          type="button"
        >
          Add
        </button>
      </div>
    </Modal>
  );
};
