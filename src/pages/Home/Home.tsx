import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  DocumentIcon,
  TrashIcon,
} from '../../assets/icons';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { Header } from '../../components/Header/Header';
import { Menu } from '../../components/Menu/Menu';
import { Toast } from '../../components/Toast/Toast';
import { WorkoutRow } from '../../components/WorkoutRow/WorkoutRow';
import type { DayWorkout } from '../../models';
import { APP_NAME } from '../../models';
import { showToast } from '../../state/app-state';
import { templates, weekWorkouts } from '../../state/workout-state';
import { loadDefaultData } from '../../storage/default-data';
import { clearDatabase, exportDatabase, importDatabase } from '../../storage/import-export';
import { getAllTemplates, getAllWorkouts, getWorkoutsByDate } from '../../storage/workout-storage';
import { formatDateId, formatWeekRange, getWeekDates } from '../../utils/date-utils';
import './home.scss';

type DestructiveAction = 'clear' | 'import' | 'loadDefaults';

const ICON_STYLE = { height: '1rem', width: '1rem' };

export const Home = () => {
  const navigate = useNavigate();

  const [pendingAction, setPendingAction] = useState<DestructiveAction | null>(null);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const weekRange = formatWeekRange(weekDates);
  const isCurrentWeek = weekOffset === 0;
  const workoutMap = weekWorkouts.value;

  useEffect(() => {
    loadData();
  }, [weekOffset]);

  const confirmMessages: Record<DestructiveAction, { message: string; title: string }> = {
    clear: {
      message:
        'This will permanently delete ALL workouts and templates. This is irreversible. Consider exporting your data first.',
      title: 'Clear Database',
    },
    import: {
      message:
        'Importing will merge data into your existing database. Consider exporting a backup first.',
      title: 'Import Database',
    },
    loadDefaults: {
      message:
        'This will load the default workout templates. Existing templates with the same name will not be overwritten. Consider exporting a backup first.',
      title: 'Load Default Templates',
    },
  };

  const handleClearDb = async () => {
    await clearDatabase();
    setPendingAction(null);
    await loadData();
    showToast('Database cleared');
  };

  const handleConfirmDestructive = async () => {
    switch (pendingAction) {
      case 'clear':
        await handleClearDb();
        break;
      case 'import':
        await handleImportConfirmed();
        break;
      case 'loadDefaults':
        await handleLoadDefaults();
        break;
    }
  };

  const handleExport = async () => {
    await exportDatabase();
    showToast('Database exported');
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.accept = '.json';
    input.type = 'file';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      const hasData = await hasExistingData();

      if (hasData) {
        setPendingImportFile(file);
        setPendingAction('import');
      } else {
        await performImport(file);
      }
    };

    input.click();
  };

  const handleImportConfirmed = async () => {
    if (pendingImportFile) {
      await performImport(pendingImportFile);
      setPendingImportFile(null);
    }

    setPendingAction(null);
  };

  const handleLoadDefaults = async () => {
    await loadDefaultData();
    setPendingAction(null);
    await loadData();
    showToast('Default templates loaded');
  };

  const handleLoadDefaultsClick = async () => {
    const hasData = await hasExistingData();

    if (hasData) {
      setPendingAction('loadDefaults');
    } else {
      await loadDefaultData();
      await loadData();
      showToast('Default templates loaded');
    }
  };

  const handleStartClear = async () => {
    const hasData = await hasExistingData();

    if (!hasData) {
      showToast('Database is already empty');
      return;
    }

    setPendingAction('clear');
  };

  const hasExistingData = async (): Promise<boolean> => {
    const existingTemplates = await getAllTemplates();
    const existingWorkouts = await getAllWorkouts();

    return existingTemplates.length > 0 || existingWorkouts.length > 0;
  };

  const loadData = async () => {
    const loadedTemplates = await getAllTemplates();
    templates.value = loadedTemplates;

    const newMap = new Map<string, DayWorkout[]>();

    for (const date of weekDates) {
      const dateId = formatDateId(date);
      const dayWorkouts = await getWorkoutsByDate(dateId);

      if (dayWorkouts.length > 0) {
        newMap.set(dateId, dayWorkouts);
      }
    }

    weekWorkouts.value = newMap;
  };

  const performImport = async (file: File) => {
    try {
      await importDatabase(file);
      await loadData();
      showToast('Database imported successfully');
    } catch {
      showToast('Failed to import database');
    }
  };

  const menuItems = [
    {
      icon: <TrashIcon style={ICON_STYLE} />,
      label: 'Clear DB',
      onClick: handleStartClear,
    },
    {
      icon: <ArrowDownTrayIcon style={ICON_STYLE} />,
      label: 'Export DB',
      onClick: handleExport,
    },
    {
      icon: <ArrowUpTrayIcon style={ICON_STYLE} />,
      label: 'Import DB',
      onClick: handleImportClick,
    },
    {
      icon: <DocumentIcon style={ICON_STYLE} />,
      label: 'Load Default DB',
      onClick: handleLoadDefaultsClick,
    },
    {
      icon: <CalendarIcon style={ICON_STYLE} />,
      label: 'Logs',
      onClick: () => navigate('/logs'),
    },
  ];

  const activeConfirm = pendingAction ? confirmMessages[pendingAction] : null;

  return (
    <>
      <Header rightContent={<Menu items={menuItems} />} title={APP_NAME} />

      <div className="page">
        <div className="home fade-in">
          <div className="home__week-nav">
            <button
              className="home__week-nav-btn"
              onClick={() => setWeekOffset(weekOffset - 1)}
              type="button"
            >
              <ArrowLeftIcon />
            </button>

            <span className="home__week-range">{weekRange}</span>

            <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
              {!isCurrentWeek && (
                <button className="home__today-btn" onClick={() => setWeekOffset(0)} type="button">
                  Today
                </button>
              )}

              {weekOffset < 0 && (
                <button
                  className="home__week-nav-btn"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  type="button"
                >
                  <ArrowLeftIcon style={{ transform: 'rotate(180deg)' }} />
                </button>
              )}
            </div>
          </div>

          <div className="home__week-list">
            {weekDates.map((date) => {
              const dateId = formatDateId(date);
              const dayWorkouts = workoutMap.get(dateId) ?? [];

              return <WorkoutRow date={date} key={dateId} workouts={dayWorkouts} />;
            })}
          </div>
        </div>
      </div>

      {activeConfirm && (
        <ConfirmDialog
          confirmLabel={pendingAction === 'clear' ? 'Clear All Data' : 'Continue'}
          danger={pendingAction === 'clear'}
          message={activeConfirm.message}
          onCancel={() => {
            setPendingAction(null);
            setPendingImportFile(null);
          }}
          onConfirm={handleConfirmDestructive}
          title={activeConfirm.title}
        />
      )}

      <Toast />
    </>
  );
};
