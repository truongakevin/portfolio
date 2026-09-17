const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8855;
app.use(cors());
app.get('/health', (_req, res) => res.sendStatus(200));

// Load metadata
function generateMetadataFromArchive() {
  const archivePath = path.join(__dirname, './tiktoks/data/.appdata/facts.json');
  const data = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

  if (!data.likes?.officialList) {
    console.error('Missing likes or officialList');
    return [];
  }

  return data.likes.officialList.map(videoId => {
    const videoData = data.videos[videoId] || {};
    const authorData = data.authors[videoData.authorId || 'Unknown'] || {};
    return {
      filename: `${videoId}.mp4`,
      date: videoData.createTime || 'N/A',
      username: authorData.uniqueIds?.[0] || 'Unknown',
      nickname: authorData.nicknames?.[0] || 'Unknown',
      caption: data.videoDescriptions[videoId] || '',
      hearts: videoData.diggCount || 'N/A',
      plays: videoData.diggCount || 'N/A',
    };
  });
}

// Generate and load metadata
const metadata = generateMetadataFromArchive();
fs.writeFileSync(path.join(__dirname, 'tiktoks/data/.appdata/facts_extracted.json'), JSON.stringify(metadata, null, 2));

app.use('/tiktok/videos', express.static(path.join(__dirname, 'tiktoks/data/Likes/videos')));

app.get('/tiktok/random', (req, res) => {
  if (!metadata.length) {
    return res.status(500).json({ error: 'No video data available' });
  }

  const days = parseInt(req.query.days);

  let filtered = metadata;

  if (!isNaN(days)) {
    const cutoff = Date.now() / 1000 - (days * 86400);
    filtered = metadata.filter(video => {
      const videoDate = parseInt(video.date);
      return !isNaN(videoDate) && videoDate >= cutoff;
    });
  }

  const randomVideo = filtered[Math.floor(Math.random() * filtered.length)];
  console.log('Sending random video:', randomVideo);
  res.json(randomVideo);
});

app.listen(PORT, '127.0.0.1', () => console.log(`Server running at http://localhost:${PORT}`));
