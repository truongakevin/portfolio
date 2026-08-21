document.getElementById('ttsForm')?.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  const messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
  const voiceSelect = document.getElementById('voice_id') as HTMLSelectElement | null;

  if (!messageInput || !voiceSelect) return;

  const formData = {
    message: messageInput.value,
    voice_id: voiceSelect.value,
  };

  const submitButton = document.getElementById('submitButton') as HTMLButtonElement | null;
  if (submitButton) {
    submitButton.innerHTML = "<img id='loading' style='width: 15px;' src='https://global.discourse-cdn.com/sitepoint/original/3X/e/3/e352b26bbfa8b233050087d6cb32667da3ff809c.gif'/>";
    submitButton.disabled = true;
  }

  try {
    const response = await fetch('https://kevinatruong.com/api/tts/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const result = await response.text();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    const title = document.getElementById('title') as HTMLElement | null;
    const input = document.getElementById('ttsForm') as HTMLFormElement | null;
    if (title) title.innerHTML = "THANK YOU FOR YOUR MESSAGE.";
    if (input) input.innerHTML = "";
  }
});