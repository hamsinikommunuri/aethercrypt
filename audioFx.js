/**
 * AETHERCRYPT // Web Audio API Synthesizer Sound Engine
 * Zero external audio files. Pure procedural synthesized mechanical & crystal haptics.
 */
window.AudioFx = (function() {
  let ctx = null;
  let isMuted = localStorage.getItem('aether_sound') === 'muted';

  function getContext() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) ctx = new AudioContext();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('aether_sound', isMuted ? 'muted' : 'unmuted');
    updateIcon();
    return !isMuted;
  }

  function updateIcon() {
    const icon = document.getElementById('soundIconSpan');
    if (icon) {
      icon.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  function playTick(freq = 900, duration = 0.035) {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, c.currentTime + duration);

      gain.gain.setValueAtTime(0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (e) {}
  }

  function playChime() {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        const start = c.currentTime + idx * 0.06;
        const dur = 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {}
  }

  function playLaser() {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      const dur = 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, c.currentTime + dur);

      gain.gain.setValueAtTime(0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start();
      osc.stop(c.currentTime + dur);
    } catch (e) {}
  }

  function playSnap() {
    if (isMuted) return;
    try {
      const c = getContext();
      if (!c) return;
      playTick(1200, 0.05);
      setTimeout(() => playTick(800, 0.04), 40);
    } catch (e) {}
  }

  function init() {
    updateIcon();
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        const active = toggleMute();
        if (active) playChime();
      });
    }
  }

  return {
    init,
    toggleMute,
    playTick,
    playChime,
    playLaser,
    playSnap
  };
})();
