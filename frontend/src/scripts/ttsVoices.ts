interface Voice {
  name: string;
  voice_id: string;
  sample: string;
}

async function fetchVoices(): Promise<void> {
  try {
    const response = await fetch('https://kevinatruong.com/api/tts/voices');
    const voices: Voice[] = await response.json();
    const voiceSelect = document.getElementById('voice_id') as HTMLSelectElement | null;

    if (!voiceSelect) return;

    const customNames: Record<string, string> = {
      "Akari": "Japanese Girl",
      "Alpha": "",
      "Anita": "Hindi Women",
      "Atlas": "Default Man",
      "Aurora": "Default Woman",
      "Axel": "",
      "Barter": "",
      "Beep": "",
      "Bella": "Isabelle Villager",
      "Blitz": "",
      "Breaker": "",
      "Breeze": "ASMR",
      "Bulk": "",
      "Buzz": "Watchmojo Lady",
      "Byte": "R2-D2",
      "Chef": "Gordan Ramsey",
      "Circuit": "Linus Tech Tips",
      "Commander": "",
      "Czar": "Russian Man",
      "Dash": "Sonic",
      "Debater": "Ben Shapiro",
      "Diplomat": "Joe Biden",
      "Elder": "Morgan Freeman",
      "Epic  Narrator": "",
      "Explorer": "National Geographic Narrator",
      "Forge": "",
      "Frogman": "Kermit",
      "Frost": "Chills",
      "Gemma": "Megan",
      "Gravel": "Penguinz0",
      "Herald": "",
      "Hunter": "",
      "Inferno": "",
      "Ironclad": "",
      "Kawaii": "Weeb Girl",
      "Leader": "Obama",
      "Mentor": "",
      "Merlin": "French Man",
      "Micro": "Plankton",
      "Nova": "Default Man",
      "Oracle": "GladOs",
      "Outlaw": "Kkona",
      "Pablo": "",
      "Phantom": "",
      "Pinnacle": "",
      "Pulse": "Zoomer",
      "Quill": "",
      "Reasonable": "",
      "Scout": "Bart",
      "Sentient": "Become Human: Connor",
      "Sentinel": "",
      "Shade": "",
      "Singer": "",
      "Specter": "",
      "Spectral": "",
      "Spongey": "Spongebob Squarepants",
      "Star": "Patrick Star",
      "Stella": "",
      "Tentacle": "Squidward",
      "Titan": "",
      "Titanus": "",
      "Tycoon": "Trump",
      "Vera": "",
      "Verdant": "",
      "Vice": "Patrick Batemen",
      "Wanderer": "",
      "Warden": "",
      "Whisper": "",
      "Wretch": "",
      "Yuki": "Japanese Women",
    };

    voices.forEach((voice: Voice) => {
      if (Object.prototype.hasOwnProperty.call(customNames, voice.name)) {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        option.textContent = customNames[voice.name] || voice.name;
        option.dataset.sample = voice.sample;
        voiceSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
  }
}

let audio: HTMLAudioElement;
const playButton = document.getElementById('playPreviewButton') as HTMLButtonElement | null;

if (playButton) {
  playButton.addEventListener('click', () => {
    const voiceSelect = document.getElementById('voice_id') as HTMLSelectElement | null;
    const selected = voiceSelect?.selectedOptions[0];
    const previewUrl = selected?.dataset.sample;

    if (!previewUrl) {
      alert('No preview available for this voice.');
      return;
    }

    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }

    audio = new Audio(previewUrl);
    audio.play();
  });
}

document.addEventListener('DOMContentLoaded', fetchVoices);
