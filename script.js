// Mobile nav toggle
document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.site-header').classList.toggle('open');
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Load events from proxy
(async () => {
  const list = document.getElementById('eventsList');
  const empty = document.getElementById('eventsEmpty');

  try {
    const PROXY_URL = 'https://fb-events.your-worker.workers.dev'; // replace with your endpoint
    const res = await fetch(PROXY_URL);
    const { events } = await res.json();

    if (!events || events.length === 0) {
      empty.style.display = 'block';
      return;
    }

    list.innerHTML = events.map(ev =>
      `<li><strong>${ev.title}</strong><br>${new Date(ev.starts).toLocaleString()}</li>`
    ).join('');
  } catch (e) {
    empty.textContent = 'Unable to load events.';
    empty.style.display = 'block';
  }
})();
