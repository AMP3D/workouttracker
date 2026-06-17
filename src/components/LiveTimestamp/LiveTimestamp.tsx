import { useEffect, useState } from 'react';
import { formatElapsed } from '../../utils/date-utils';

interface LiveTimestampProps {
  className?: string;
  timestamp: number;
}

export const LiveTimestamp = ({ className, timestamp }: LiveTimestampProps) => {
  const [display, setDisplay] = useState(() => formatElapsed(timestamp));

  useEffect(() => {
    setDisplay(formatElapsed(timestamp));

    const interval = setInterval(() => {
      setDisplay(formatElapsed(timestamp));
    }, 5000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className={className}>{display}</span>;
};
