/* Ezzzy Chess auth and background game controller. */
(() => {
  'use strict';

  // Replace this with the Web OAuth client ID from Google Cloud Console.
  const GOOGLE_CLIENT_ID = document.querySelector('meta[name="google-client-id"]')?.content || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  const validGoogleClientId = /^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(GOOGLE_CLIENT_ID);
  const tabs = document.querySelectorAll('.tab');
  const signupFields = document.querySelectorAll('.signup-only');
  const loginOnly = document.querySelectorAll('.signup-hide');
  const title = document.querySelector('#form-title');
  const subtitle = document.querySelector('#form-subtitle');
  const submitLabel = document.querySelector('#submit-label');
  const form = document.querySelector('#auth-form');
  const identityInput = document.querySelector('#identity');
  const identityError = document.querySelector('#identity-error');
  const status = document.querySelector('#status-message');
  const googleButton = document.querySelector('#google-button');
  const accountModal = document.querySelector('#account-modal');
  let isSignup = false;
  let googleIdToken = '';

  const readApiResponse = async (response, context) => {
    const rawBody = await response.text();
    let payload = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      console.error(`${context}: server returned non-JSON response`, { status: response.status, statusText: response.statusText, body: rawBody });
    }
    if (!response.ok) {
      console.error(`${context}: API request failed`, { status: response.status, statusText: response.statusText, requestId: response.headers.get('x-request-id'), body: payload || rawBody });
    }
    return { payload, rawBody };
  };

  // These patterns intentionally allow only one primary email or phone identity.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phonePattern = /^(?:\+234\d{10}|0\d{10})$/;

  const validateIdentity = () => {
    const value = identityInput.value.trim();
    const valid = emailPattern.test(value) || phonePattern.test(value);
    identityInput.setCustomValidity(valid ? '' : 'Enter your primary email or a valid phone number.');
    identityError.textContent = valid || !value ? '' : 'Use a primary email (user@domain.com) or phone (+234... / 080...).';
    identityInput.classList.toggle('invalid', !valid && Boolean(value));
    return valid;
  };

  const closeModal = () => {
    accountModal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  const startSession = (email, profile = {}) => {
    const session = {
      email,
      name: profile.name || email.split('@')[0],
      token: `ezzzy-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      wallet: { coins: 47, naira: 940 },
      deviceBound: true
    };
    sessionStorage.setItem('ezzzySession', JSON.stringify(session));
    window.location.assign('page13-super-app.html');
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    isSignup = tab.id === 'signup-tab';
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', selected);
    });
    signupFields.forEach((field) => { field.hidden = !isSignup; });
    loginOnly.forEach((field) => { field.hidden = isSignup; });
    title.textContent = isSignup ? 'Make your first move.' : 'Your board awaits.';
    subtitle.textContent = isSignup ? 'Create an account and start playing free.' : 'Sign in to pick up where you left off.';
    submitLabel.textContent = isSignup ? 'Create account' : 'Log in';
    status.textContent = '';
  }));

  identityInput.addEventListener('input', validateIdentity);
  document.querySelector('.password-toggle').addEventListener('click', (event) => {
    const input = document.querySelector('#password');
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    event.currentTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    event.currentTarget.classList.toggle('visible', !visible);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateIdentity() || !form.checkValidity()) {
      form.reportValidity();
      return;
    }
      try {
        const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
        const result = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ identity: identityInput.value.trim(), password: document.querySelector('#password').value, name: document.querySelector('#name')?.value.trim() || undefined }) });
        const { payload } = await readApiResponse(result, 'Authentication');
        if (!result.ok) throw new Error(payload.error || 'Authentication failed.');
        startSession(payload.email, { name: payload.name });
      } catch (error) {
        console.error('Authentication request failed', error);
        status.textContent = error.message || 'Authentication is temporarily unavailable. Please try again.';
      }
  });

  // GIS returns a credential JWT. The server must verify it before creating a production session.
  const handleCredentialResponse = async (response) => {
    googleIdToken = response.credential;
    try {
      const result = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ credential: googleIdToken }) });
        const { payload } = await readApiResponse(result, 'Google authentication');
        if (!result.ok) throw new Error(payload.error || 'Google authentication was rejected by the server.');
        const user = payload;
        startSession(user.email, { name: user.name });
    } catch (error) {
      status.textContent = 'Google sign-in could not be verified. Please try again.';
      console.error(error);
    }
  };
  window.handleCredentialResponse = handleCredentialResponse;

  const renderGoogle = () => {
    if (!window.google?.accounts?.id) {
      status.textContent = 'Google Identity Services did not load. Check your internet connection.';
      return;
    }
    if (!validGoogleClientId) {
      googleButton.innerHTML = '<span class="google-icon" aria-hidden="true">G</span><span>Sign in with Google</span>';
      googleButton.dataset.configured = 'false';
      status.textContent = 'Google sign-in needs a valid Web Client ID ending in .apps.googleusercontent.com.';
      return;
    }
    googleButton.dataset.configured = 'true';
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, auto_select: false });
    if (!googleButton.querySelector('iframe')) window.google.accounts.id.renderButton(googleButton, { theme: 'outline', size: 'large', width: Math.min(430, googleButton.clientWidth || 430), text: 'signin_with', shape: 'rectangular', logo_alignment: 'left' });
    window.google.accounts.id.prompt();
  };

  googleButton.addEventListener('click', () => {
    if (!validGoogleClientId) {
      status.textContent = 'Add your valid Google Web Client ID to show saved system accounts.';
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      status.textContent = 'Google Identity Services is still loading. Try again in a moment.';
    }
  });
  googleButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); googleButton.click(); }
  });
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  accountModal.addEventListener('click', (event) => { if (event.target === accountModal) closeModal(); });
  document.querySelectorAll('.account-option').forEach((option) => option.addEventListener('click', () => { closeModal(); startSession(option.dataset.email, { name: option.querySelector('strong').textContent }); }));
  document.querySelector('.use-another').addEventListener('click', () => { closeModal(); identityInput.focus(); status.textContent = 'Enter your primary Google email to continue.'; });

  const chessboard = document.querySelector('.chessboard');
  const chessGame = new Chess();
  const pieceGlyphs = { p: '&#9823;', r: '&#9820;', n: '&#9822;', b: '&#9821;', q: '&#9819;', k: '&#9818;' };
  const renderGame = () => {
    chessboard.querySelectorAll('.live-piece').forEach((piece) => piece.remove());
    chessGame.board().forEach((row, rowIndex) => row.forEach((piece, columnIndex) => {
      if (!piece) return;
      const element = document.createElement('span');
      element.className = `live-piece ${piece.color === 'w' ? 'live-white' : 'live-black'}`;
      const glyph = pieceGlyphs[piece.type];
      element.innerHTML = piece.color === 'w' ? glyph.replace(/982[0-3]|981[8-9]/, (value) => String(Number(value) - 6)) : glyph;
      element.style.left = `${columnIndex * 12.5}%`;
      element.style.top = `${rowIndex * 12.5}%`;
      chessboard.appendChild(element);
    }));
  };
  const playLegalMove = () => {
    const moves = chessGame.moves({ verbose: true });
    if (!moves.length) { chessGame.reset(); renderGame(); return; }
    const captures = moves.filter((move) => move.captured);
    const move = captures.length && Math.random() > .35 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
    chessGame.move(move);
    renderGame();
  };
  renderGame();
  window.setInterval(playLegalMove, 1450);

  const waitForGoogle = () => window.google?.accounts?.id ? renderGoogle() : window.setTimeout(waitForGoogle, 150);
  window.addEventListener('load', waitForGoogle, { once: true });
})();
