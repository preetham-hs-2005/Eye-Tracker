import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const CountdownTimer = ({ lockTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = dayjs(lockTime).diff(dayjs(), 'second');
      if (diff <= 0) return setTimeLeft('Locked');
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockTime]);

  return <span className="text-trackRed font-semibold">{timeLeft}</span>;
};

export default CountdownTimer;
