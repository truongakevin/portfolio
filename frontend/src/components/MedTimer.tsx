import React, { useState, useEffect } from 'react';

interface MedTimerDisplayProps {
  medName: string;
}

const MedTimerDisplay: React.FC<MedTimerDisplayProps> = ({ medName }) => {
  const [timeSinceLastMeds, setTimeSinceLastMeds] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSinceLastMeds = async () => {
      try {
        const response = await fetch(`https://kevinatruong.com/api/med/check/${medName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch timer data');
        }
        const data = await response.json();
        setTimeSinceLastMeds(data.elapsed_time);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSinceLastMeds();
    const interval = setInterval(fetchTimeSinceLastMeds, 1000);
    return () => clearInterval(interval);
  }, [medName]);

  if (loading) return <h2 className="text-dark">Loading...</h2>;
  if (error) return <h2 className="text-red-500">Error: {error}</h2>;

  if (timeSinceLastMeds === null) return null;
  const days = Math.floor(timeSinceLastMeds / (24 * 3600));
  const hours = Math.floor((timeSinceLastMeds % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeSinceLastMeds % 3600) / 60);
  const seconds = timeSinceLastMeds % 60;

  return (
    <h2 className="">
      {days}D {hours}H {minutes}M {seconds}S
    </h2>
  );
};

export default MedTimerDisplay;