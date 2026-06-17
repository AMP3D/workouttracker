const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatDateId = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${mm}-${dd}-${yyyy}`;
};

export const formatDateLabel = (date: Date): string => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const dayName = isToday ? 'Today' : DAYS_OF_WEEK[date.getDay()];

  return `${dayName}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatElapsed = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  if (diffMin < 60) {
    const remainSec = diffSec % 60;
    return `${diffMin}m ${remainSec}s ago`;
  }

  if (diffHours < 24) {
    const remainMin = diffMin % 60;
    return `${diffHours}h ${remainMin}m ago`;
  }

  const date = new Date(timestamp);
  return formatShortDate(date);
};

export const formatShortDate = (date: Date): string => {
  const dayName = DAYS_OF_WEEK[date.getDay()];

  return `${dayName}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
};

export const formatWeekRange = (dates: Date[]): string => {
  const first = dates[0];
  const last = dates[dates.length - 1];

  if (first.getMonth() === last.getMonth()) {
    return `${MONTHS[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
  }

  return `${MONTHS[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${MONTHS[last.getMonth()].slice(0, 3)} ${last.getDate()}, ${last.getFullYear()}`;
};

export const getMonthName = (month: number): string => MONTHS[month];

export const getWeekDates = (weekOffset: number = 0): Date[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};

export const parseDateId = (dateId: string): Date => {
  const [mm, dd, yyyy] = dateId.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
};
