// Mobile nav toggle
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  header.classList.toggle('open');
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form (demo-only: shows success without sending)
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    status.textContent = 'Thanks! We received your message.';
    form.reset();
    setTimeout(() => (status.textContent = ''), 5000);
  });
}
