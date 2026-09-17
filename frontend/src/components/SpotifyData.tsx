import React, { useEffect, useState } from 'react';
import CurrentlyPlaying from './CurrentlyPlaying';

interface UserProfile {
  display_name: string;
  profile_image: string;
}

interface Artist {
  id: string;
  name: string;
  image: string;
}

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  album_image: string;
}

interface SpotifyData {
  user_profile: UserProfile;
  top_artists: Artist[];
  top_tracks: Track[];
}

const SpotifyData: React.FC = () => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const response = await fetch('/api/spotify/data');
        if (!response.ok) throw new Error(`Spotify request failed (${response.status})`);
        const data: SpotifyData = await response.json();
        setSpotifyData(data);
      } catch (reason) {
        console.error(reason);
        setError(true);
      }
    };

    fetchSpotifyData();
  }, []);

  if (error) return <h4>Spotify data is unavailable right now.</h4>;

  if (!spotifyData) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="flex flex-col gap-4">
     <div className="flex flex-row gap-2">
        <div className="flex items-center">
          <img className="w-[clamp(12rem,15vw,50rem)] h-[clamp(10rem,13vw,50rem)] object-cover" src={spotifyData.user_profile.profile_image} />
        </div>
        <div className="flex flex-col w-full my-auto gap-1">
          <div className='flex flex-col gap-2'>
            <h1><a href="https://open.spotify.com/user/kevinolis" target="_blank" rel="noopener noreferrer">
              {spotifyData.user_profile.display_name}
            </a></h1>
            <h3>CURRENTLY PLAYING</h3>
          </div>
          <CurrentlyPlaying />
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <h2>TOP ARTISTS THIS MONTH</h2>
        <div className="px-[16px] overflow-y-hidden overflow-x-auto flex flex-row gap-2 w-[calc(100%+32px)] translate-x-[-16px] [&::-webkit-scrollbar]:hidden">
          {spotifyData.top_artists.map((artist) => (
            <div className="" key={artist.id}>
              <img className="object-cover w-[clamp(8rem,12vw,50rem)] h-[clamp(8rem,12vw,50rem)] rounded-full" src={artist.image} alt={artist.name} />
              <h5 className='break-words w-[clamp(8rem,12vw,50rem)]'>{artist.name}</h5>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2>TOP TRACKS THIS MONTH</h2>
        <div className="flex flex-col gap-2">
          {spotifyData.top_tracks.map((track) => (
            <div className="flex flex-row gap-2" key={track.id}>
              <div className="flex-shrink-0 my-auto">
                <img className="album-cover" src={track.album_image} alt={track.album} />
              </div>
              <div className="my-auto">
                <h4 className='break-words'>{track.name}</h4>
                <h5 className='break-words text-accent'>{track.artists}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SpotifyData;
