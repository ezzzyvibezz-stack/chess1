/* Adaptive ambient canvas for the Page 13 Super App. */
(() => {
  'use strict';

  if (document.getElementById('adaptive-animation-canvas')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  const particles = [];
  let width = 0;
  let height = 0;
  let colors = ['#ffd700', '#2a305a', '#00ff88'];
  let animationFrame = 0;

  canvas.id = 'adaptive-animation-canvas';
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100svh', pointerEvents: 'none', zIndex: '0', opacity: '0.34' });
  document.body.prepend(canvas);
  document.querySelectorAll('body > *:not(#adaptive-animation-canvas):not(.settings-drawer):not(.drawer-scrim):not(.profile-modal)').forEach((element) => { element.style.position = element.style.position || 'relative'; element.style.zIndex = element.style.zIndex || '1'; });

  function extractPalette() {
    const counts = {};
    document.querySelectorAll('header, nav, main, section, h1, h2, button, a').forEach((element) => {
      const style = getComputedStyle(element);
      [style.backgroundColor, style.color, style.borderColor].forEach((color) => { if (color && color !== 'transparent' && !color.includes('0, 0, 0, 0')) counts[color] = (counts[color] || 0) + 1; });
    });
    const extracted = Object.entries(counts).sort((first, second) => second[1] - first[1]).map(([color]) => color).slice(0, 4);
    if (extracted.length) colors = extracted;
  }

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * scale); canvas.height = Math.floor(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  class Particle {
    constructor() { this.color = colors[Math.floor(Math.random() * colors.length)] || '#6495ed'; this.reset(true); }
    reset(initial = false) { this.x = Math.random() * width; this.y = initial ? Math.random() * height : (Math.random() < .5 ? -12 : height + 12); this.vx = (Math.random() - .5) * .8; this.vy = (Math.random() - .5) * .8; this.radius = Math.random() * 2.5 + .8; this.alpha = Math.random() * .4 + .12; }
    update() { this.x += this.vx; this.y += this.vy; if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) this.reset(); }
    draw() { context.globalAlpha = this.alpha; context.fillStyle = this.color; context.beginPath(); context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); context.fill(); }
  }

  function drawConnections() {
    const maxDistance = 120;
    for (let first = 0; first < particles.length; first += 1) for (let second = first + 1; second < particles.length; second += 1) {
      const dx = particles[first].x - particles[second].x; const dy = particles[first].y - particles[second].y; const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= maxDistance * maxDistance) continue;
      context.globalAlpha = (1 - Math.sqrt(distanceSquared) / maxDistance) * .18; context.strokeStyle = colors[0]; context.lineWidth = .8; context.beginPath(); context.moveTo(particles[first].x, particles[first].y); context.lineTo(particles[second].x, particles[second].y); context.stroke();
    }
  }

  function animate() { context.clearRect(0, 0, width, height); particles.forEach((particle) => { particle.update(); particle.draw(); }); drawConnections(); context.globalAlpha = 1; animationFrame = requestAnimationFrame(animate); }
  extractPalette(); resize(); const count = Math.min(60, Math.max(28, Math.floor((width * height) / 24000))); for (let index = 0; index < count; index += 1) particles.push(new Particle()); animate();
  window.addEventListener('resize', () => { resize(); particles.splice(Math.floor(width * height / 24000), particles.length); while (particles.length < Math.min(60, Math.max(28, Math.floor(width * height / 24000)))) particles.push(new Particle()); }, { passive: true });
  reducedMotion.addEventListener?.('change', () => { if (reducedMotion.matches) { cancelAnimationFrame(animationFrame); context.clearRect(0, 0, width, height); } });
})();
