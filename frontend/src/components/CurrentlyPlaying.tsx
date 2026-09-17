import React, { useEffect, useState } from 'react';

type CurrentlyPlayingTrack = {
  is_playing: boolean;
  track: {
    name: string;
    artists: string;
    album: string;
    album_image: string;
    progress_ms: number;
    duration_ms: number;
  };
};

type SpotifyData = {
  currently_playing: CurrentlyPlayingTrack | null;
};

const CurrentlyPlaying: React.FC = () => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData>({ currently_playing: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInterval = 15000;

  const fetchData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/spotify/data');
      if (!response.ok) throw new Error('Failed to fetch Spotify data');
      const data: SpotifyData = await response.json();
      setSpotifyData(data);
  } catch (err: any) {
      setError(err.message ?? 'Unknown error');
      console.error(err);
  } finally {
      setLoading(false);
  }
  };
  
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, fetchInterval);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <h4>Loading...</h4>;
  }

  if (error) {
    return <h4>Error: {error}</h4>;
  }

  const currentlyPlaying = spotifyData?.currently_playing;

  // Calculate progress percentage for the progress bar
  const progressPercentage = currentlyPlaying ? (currentlyPlaying.track.progress_ms / currentlyPlaying.track.duration_ms) * 100 : 0;

  return (
    <div>
      {currentlyPlaying?.is_playing ? (
        <div className='flex flex-col gap-1'>
          <div className="flex flex-row gap-1">
            <div className="flex-shrink-0">
              <img className=" object-cover w-[clamp(3.75rem,5vw,20rem)] h-[clamp(3.75rem,5vw,20rem)];" src={currentlyPlaying.track.album_image} alt={currentlyPlaying.track.album}/>
            </div>
            <div className="my-auto">
              <h4 className=''>{currentlyPlaying.track.name}</h4>
              <h5 className='text-accent'>{currentlyPlaying.track.artists}</h5>
            </div>
          </div>
          <div className="block lg:w-2/3 h-[7px] mr-2 bg-accent rounded relative overflow-hidden">
            <div className="h-full bg-dark"
              style={{
                transition: `width ${fetchInterval / 1000}s linear`,
                width: `${progressPercentage}%`
              }}
            />
          </div>
          <h6 className="m-0">
            {Math.floor(currentlyPlaying.track.progress_ms / 60000)}: {((currentlyPlaying.track.progress_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}{' '}
            / {Math.floor(currentlyPlaying.track.duration_ms / 60000)}: {((currentlyPlaying.track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </h6>
        </div>
      ) : (
        <h4 className='text-accent'>Nothing Playing</h4>
      )}
    </div>
  );
};

export default CurrentlyPlaying;
