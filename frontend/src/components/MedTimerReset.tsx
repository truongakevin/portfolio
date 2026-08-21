import React, { useState, useEffect } from 'react';

interface MedResetButtonProps {
  medName: string;
  minWaitTime: number;
}

const MedResetButton: React.FC<MedResetButtonProps> = ({ medName, minWaitTime }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [canTakeMed, setCanTakeMed] = useState<boolean>(false);

  useEffect(() => {
    const fetchTimeSinceLastMeds = async () => {
      try {
        const response = await fetch(`https://kevinatruong.com/api/med/check/${medName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch timer data');
        }
        const data = await response.json();
        setElapsedTime(data.elapsed_time);
      } catch (err: any) {
        console.log('Error:', err.message);
      }
    };

    fetchTimeSinceLastMeds();
    const interval = setInterval(fetchTimeSinceLastMeds, 1000);
    return () => clearInterval(interval);
  }, [medName]);

  useEffect(() => {
    setCanTakeMed(elapsedTime >= minWaitTime);
  }, [elapsedTime, minWaitTime]);

  const handleResetTimer = async () => {
    try {
      const response = await fetch(`https://kevinatruong.com/api/med/reset/${medName}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reset timer');
      }
    } catch (err: any) {
      console.log('Error:', err.message);
    }
  };

  const progress = Math.min(1, elapsedTime / minWaitTime);
  
  return (
    <div className="">
      <button
        onClick={handleResetTimer}
        disabled={!canTakeMed}
        style={{ background: `linear-gradient(to right, var(--color-dark) ${progress * 100}%, var(--color-accent) ${progress * 100}%)` }}
        className={`w-12/12 lg:w-fit text-light ${
          canTakeMed ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
      >
        <h3 className="py-2 px-10">RESET TIMER</h3>
      </button>
    </div>
  );
};

export default MedResetButton;