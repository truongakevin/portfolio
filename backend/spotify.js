const cors = require('cors');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 59011;

// Add CORS middleware (this will allow all origins by default)
app.use(cors());

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// In-memory storage for access token, refresh token, and expiration time
let ACCESS_TOKEN = null;
let ACCESS_TOKEN_EXPIRATION = null;

// Callback URI and scopes
const SCOPE = 'user-top-read user-read-currently-playing user-read-playback-state';

// Middleware to check for a valid access token
const checkAccessToken = async (req, res, next) => {
  if (!ACCESS_TOKEN || Date.now() >= ACCESS_TOKEN_EXPIRATION) {
    console.log('Access token expired. Refreshing...');

    try {
      const tokenResponse = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `grant_type=refresh_token&refresh_token=${process.env.SPOTIFY_REFRESH_TOKEN}&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`
      });

      ACCESS_TOKEN = tokenResponse.data.access_token;
      ACCESS_TOKEN_EXPIRATION = Date.now() + (tokenResponse.data.expires_in * 1000);
    } catch (error) {
      console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
      return res.status(500).send('Error refreshing access token');
    }
  }
  next();
};

// Function to update .env file
function updateEnvFile(key, value) {
  const envFilePath = '.env';
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const newEnvContent = envContent.split('\n').map(line => {
    if (line.startsWith(key)) {
      return `${key} = "${value}"`;
    }
    return line;
  }).join('\n');

  fs.writeFileSync(envFilePath, newEnvContent);
}

// Route to start the login process
app.get('/spotify/login', (req, res) => {
  console.log("Login Attempt");
  const authURL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
  res.redirect(authURL);
});

// Callback route for Spotify to redirect after login
app.get('/spotify/callback', async (req, res) => {
  console.log("Callback");
  const code = req.query.code;

  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`
    });

    ACCESS_TOKEN = tokenResponse.data.access_token; // Store access token in memory
    const REFRESH_TOKEN = tokenResponse.data.refresh_token; // Store refresh token in memory
    ACCESS_TOKEN_EXPIRATION = Date.now() + (tokenResponse.data.expires_in * 1000); // Set expiration time

    // Store the refresh token in the .env file
    updateEnvFile('SPOTIFY_REFRESH_TOKEN', REFRESH_TOKEN);

    res.status(200).send({
      message: 'Spotify authentication successful'
    });
  } catch (error) {
    console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
    res.status(500).send('Error retrieving access token');
  }
});

// Route to get Spotify data with middleware
app.get('/spotify/data', checkAccessToken, async (req, res) => {
  console.log("Retrieving Data");

  try {
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
    };

    const [
      userProfile,
      userTopArtists,
      userTopTracks,
      userPlaylists,
      currentlyPlaying
    ] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
      axios.get('https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10', {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
      axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10', {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
      axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
      axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
    ]);

    res.json({
      user_profile: {
        id: userProfile.data.id,
        display_name: userProfile.data.display_name,
        email: userProfile.data.email,
        profile_image: userProfile.data.images[0] ? userProfile.data.images[0].url : null, // Get the first profile image URL if available
        followers: userProfile.data.followers.total,
      },
      top_artists: userTopArtists.data.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist.images.length ? artist.images[0].url : null, // Get the first image URL if available
        genres: artist.genres,
        popularity: artist.popularity,
      })),
      top_tracks: userTopTracks.data.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '), // List all artist names
        album: track.album.name,
        album_image: track.album.images[0] ? track.album.images[0].url : null, // Get the first album image URL if available
        duration_ms: track.duration_ms,
      })),
      user_playlists: shuffleArray(userPlaylists.data.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image: playlist.images.length ? playlist.images[0].url : null, // Get the first image URL if available
        tracks_count: playlist.tracks.total,
      }))).slice(0, 5), // Limit to 5 random playlists
      currently_playing: currentlyPlaying.data ? {
        is_playing: currentlyPlaying.data.is_playing,
        track: {
          id: currentlyPlaying.data.item.id,
          name: currentlyPlaying.data.item.name,
          artists: currentlyPlaying.data.item.artists.map(artist => artist.name).join(', '), // List all artist names
          album: currentlyPlaying.data.item.album.name,
          album_image: currentlyPlaying.data.item.album.images[0] ? currentlyPlaying.data.item.album.images[0].url : null, // Get the first album image URL if available
          progress_ms: currentlyPlaying.data.progress_ms,
          duration_ms: currentlyPlaying.data.item.duration_ms,
        },
      } : null // Return null if currently playing data is not available
    });
  } catch (error) {
    console.error('Error retrieving data from Spotify:', error.response ? error.response.data : error.message);
    res.status(500).send('Error retrieving data from Spotify');
  }
});

// Start the server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
