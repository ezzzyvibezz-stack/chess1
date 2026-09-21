const modules = {
  wallet: { code: 'P05', title: 'Wallet', description: 'Manage your Coins, exchange rate, escrow, and transaction history.', cards: [['Balance', '47 Coins', '₦940 available'], ['Exchange', '1 Coin = ₦20', '$0.013 · GH₵0.20'], ['Escrow', '9070639567', 'Moniepoint settlement account']] },
  'profile-clan': { code: 'P06', title: 'Profile & Clan', description: 'Your player identity, reputation, and Kaduna Warriors membership.', cards: [['Musa [KAD]', 'Blitz 1240', 'RD115 · K20'], ['Standing', 'Top5 · Rank1', 'Kaduna Warriors'], ['Privacy', 'Friends only', 'Control what people can see']] },
  'tournament-wizard': { code: 'P07', title: 'Tournament Wizard', description: 'Create a tournament with clear time controls, entries, brackets, and prizes.', cards: [['Format', 'Group → Knockout', 'Legs 2×'], ['Entry', '50 Coins = ₦1,000', '8-player bracket'], ['Prize', '₦7,200 winner', '90% payout · 10% platform fee']] },
  'admin-anti-cheat': { code: 'P08', title: 'Admin Anti-Cheat', description: 'Review flagged games, PGNs, device checks, and engine alignment.', cards: [['Review queue', '0 pending', 'Manual review required'], ['Detection', 'Stockfish alignment', 'Standard threshold 90%'], ['Device checks', 'DEV-XXXX clear', 'Multi-account protection']] },
  'rules-ai': { code: 'P09', title: 'Rules & AI Detect', description: 'Understand the safeguards that keep Ezzzy Chess fair and welcoming.', cards: [['Fair play', '7 detection layers', 'Move, timing, focus, device'], ['Paid play', '3 games daily', 'Bible requirement applies'], ['Appeals', '24-hour window', 'PGN evidence supported']] },
  'leaderboard-betting': { code: 'P10', title: 'Leaderboard & Betting', description: 'Track global rankings, Top5 favorites, and spectator pools.', cards: [['Your rank', '#01', 'Top5 favorite · 1.40×'], ['Odds', '1.75 · 3.10 · 2.30', 'You · Draw · Opponent'], ['Bet limits', '5–100 Coins', '₦100–₦2,000']] },
  'elo-reputation': { code: 'P11', title: 'Elo & Reputation', description: 'See how rating, K-factor, RD, and verified reputation work together.', cards: [['Blitz', '1240', 'RD115 · K20'], ['Projection', '+12 / −8 / +2', 'Win · Loss · Draw'], ['Verification', 'Top5 · Rank1', 'Profile reputation active']] },
  'finance-bible': { code: 'P12', title: 'Finance & Bible', description: 'Complete the 10-minute reading guardrail and manage financial protections.', cards: [['Bible timer', '0 / 10 minutes', 'Paid entries locked'], ['Withdrawals', '50–5,000 Coins', '₦1,000–₦100,000'], ['Device', 'DEV-XXXX', 'Same-device checks active']] }
};
const key = new URLSearchParams(window.location.search).get('module') || 'wallet';
const pageData = modules[key] || modules.wallet;
document.title = `Ezzzy Chess | ${pageData.title}`;
document.querySelector('#module-code').textContent = `${pageData.code} · Module`;
document.querySelector('#module-title').textContent = pageData.title;
document.querySelector('#module-description').textContent = pageData.description;
document.querySelector('#module-content').innerHTML = pageData.cards.map(([label, value, detail]) => `<article class="info-card"><p>${label}</p><strong>${value}</strong><small>${detail}</small><button type="button" data-action="${label}">Open ${label.toLowerCase()}</button></article>`).join('');
document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => { button.textContent = 'Ready'; button.classList.add('ready'); }));
