const contactForm = document.getElementById('contactForm') as HTMLFormElement | null;
const nameInput = document.getElementById('name') as HTMLInputElement | null;
const emailInput = document.getElementById('email') as HTMLInputElement | null;
const messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
const submitButton = document.getElementById('submitButton') as HTMLButtonElement | null;
const title = document.getElementById('title') as HTMLElement | null;
const contactStatus = document.getElementById('contactStatus') as HTMLElement | null;

if (contactForm && nameInput && emailInput && messageInput && submitButton && title && contactStatus) {
  contactForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      message: messageInput.value,
    };

    submitButton.textContent = 'SENDING';
    submitButton.disabled = true;
    contactStatus.textContent = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Contact request failed (${response.status})`);
      title.textContent = 'THANK YOU FOR YOUR MESSAGE.';
      contactForm.reset();
      contactForm.style.display = 'none';
    } catch (error) {
      console.error('Contact request failed:', error);
      contactStatus.textContent = 'Your message was not sent. Please try again.';
    } finally {
      submitButton.textContent = 'SEND';
      submitButton.disabled = false;
    }
  });
}
