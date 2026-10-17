let toastTimer;
let winnerSound;
let flowerSound;
let cooking = false;
let screenLock = null;
let lockPending = false;
let cookingSession = 0;

export function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 2200);
}

export function celebrateCat(button) {
  if (button.dataset.busy) return;
  button.dataset.busy = 'true';

  const flowers = button.dataset.celebrate === 'flowers';
  let sound;
  if (flowers) {
    winnerSound?.pause();
    flowerSound ||= new Audio('assets/audio/flowers.wav');
    sound = flowerSound;
  } else {
    flowerSound?.pause();
    winnerSound ||= new Audio('assets/audio/winner.wav');
    sound = winnerSound;
  }
  sound.volume = flowers ? 0.55 : 0.65;
  sound.currentTime = 0;
  sound.play().catch(() => {
    toast('Sound could not play. Check your browser’s sound settings.');
  });

  const image = button.querySelector('img').getBoundingClientRect();
  const burst = document.createElement('div');
  const colors = ['#f9d84a', '#ed9aa6', '#a9bf85', '#d6b4db', '#efb276'];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  burst.className = flowers ? 'confetti-burst flower-burst' : 'confetti-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.left = `${image.left + image.width / 2 - 5}px`;
  burst.style.top = `${image.top + image.height / 2}px`;

  for (let index = 0; index < (flowers ? 20 : 32); index++) {
    const piece = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const distance = 65 + Math.random() * 125;

    piece.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--y', `${Math.sin(angle) * distance - 65}px`);
    piece.style.setProperty('--turn', `${Math.random() * 720 - 360}deg`);
    if (flowers) {
      piece.style.color = colors[index % colors.length];
      piece.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <g fill="currentColor">
            <circle cx="12" cy="5" r="4.8"/>
            <circle cx="18.7" cy="9.8" r="4.8"/>
            <circle cx="16.1" cy="17.6" r="4.8"/>
            <circle cx="7.9" cy="17.6" r="4.8"/>
            <circle cx="5.3" cy="9.8" r="4.8"/>
          </g>
          <circle cx="12" cy="12" r="3.4" fill="#fff3b0"/>
        </svg>
      `;
    } else {
      piece.style.backgroundColor = colors[index % colors.length];
    }

    if (reducedMotion) {
      piece.style.transform = `translate(${Math.cos(angle) * 55}px, ${Math.sin(angle) * 55}px)`;
    }

    burst.append(piece);
  }

  document.body.append(burst);
  setTimeout(() => burst.remove(), reducedMotion ? 700 : 1400);
  setTimeout(() => delete button.dataset.busy, 2000);
}

function setWakeStatus(message, canRetry = false) {
  const status = document.querySelector('#wake-status');
  const retry = document.querySelector('[data-retry-wake]');

  if (status) status.textContent = message;
  if (retry) retry.hidden = !canRetry;
}

export async function acquireScreenLock() {
  if (!cooking || document.visibilityState !== 'visible' || lockPending) return;
  if (screenLock && !screenLock.released) return;

  if (!navigator.wakeLock) {
    setWakeStatus('This browser cannot keep the screen awake. You can still tick off the steps.');
    return;
  }

  const session = cookingSession;
  lockPending = true;
  setWakeStatus('Keeping your screen awake…');

  try {
    const lock = await navigator.wakeLock.request('screen');

    // Navigation or a second click can finish cooking mode before the request resolves.
    if (!cooking || session !== cookingSession || document.visibilityState !== 'visible') {
      await lock.release();
      return;
    }

    screenLock = lock;
    setWakeStatus('Screen stays awake while this page is visible.');
    lock.addEventListener('release', () => {
      if (screenLock !== lock) return;
      screenLock = null;
      if (cooking) setWakeStatus('Screen wake lock paused. You can retry it below.', true);
    });
  } catch {
    if (cooking && session === cookingSession) {
      setWakeStatus('Your device did not allow screen wake lock. You can retry it below.', true);
    }
  } finally {
    lockPending = false;
    if (cooking && session !== cookingSession) acquireScreenLock();
  }
}

export function stopCooking() {
  cooking = false;
  cookingSession++;
  document.querySelector('main').classList.remove('cooking');

  const previousLock = screenLock;
  screenLock = null;
  previousLock?.release().catch(() => {});

  const button = document.querySelector('[data-cooking]');
  if (button) {
    button.textContent = 'Cooking mode';
    button.setAttribute('aria-pressed', 'false');
  }

  setWakeStatus('Cooking mode can keep your screen awake while this page is open.');
}

export function toggleCooking() {
  if (cooking) {
    stopCooking();
    return;
  }

  cooking = true;
  document.querySelector('main').classList.add('cooking');
  const button = document.querySelector('[data-cooking]');
  button.textContent = 'Leave cooking mode';
  button.setAttribute('aria-pressed', 'true');
  return acquireScreenLock();
}

export async function printRecipe(button) {
  const main = document.querySelector('main');
  const recipe = main.querySelector('article');
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Preparing print…';

  try {
    await Promise.allSettled([...main.querySelectorAll('img')].map(image => image.decode()));
    if (document.fonts) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (main.querySelector('article') === recipe) window.print();
  } catch {
    toast('Printing could not open. Please use your browser’s Print menu.');
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
