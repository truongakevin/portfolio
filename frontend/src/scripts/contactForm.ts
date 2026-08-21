const contactForm = document.getElementById('contactForm') as HTMLFormElement | null;
const nameInput = document.getElementById('name') as HTMLInputElement | null;
const emailInput = document.getElementById('email') as HTMLInputElement | null;
const messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
const submitButton = document.getElementById('submitButton') as HTMLButtonElement | null;
const title = document.getElementById('title') as HTMLElement | null;

if (contactForm && nameInput && emailInput && messageInput && submitButton && title) {
  contactForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      message: messageInput.value,
    };

    submitButton.innerHTML = `<img class="w-5 h-5 m-auto" src="https://global.discourse-cdn.com/sitepoint/original/3X/e/3/e352b26bbfa8b233050087d6cb32667da3ff809c.gif" alt="Loading" />`;
    // submitButton.innerHTML = `<img class="w-20 h-20" src="https://global.discourse-cdn.com/sitepoint/original/3X/e/3/e352b26bbfa8b233050087d6cb32667da3ff809c.gif" alt="Loading"/>`;
    submitButton.disabled = true;

    try {
      const response = await fetch('https://kevinatruong.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.text();
      // Optionally handle result
    } catch (error) {
      console.error('Error:', error);
    } finally {
      title.innerHTML = 'THANK YOU FOR YOUR MESSAGE.';
      contactForm.innerHTML = '';
    }
  });
}