(() => {
  const toggle = document.getElementById('bgmToggle');
  const hint = document.getElementById('bgmHint');
  const sailButton = document.getElementById('sailButton');
  if (!toggle) return;

  let context = null;
  let master = null;
  let music = null;
  let effects = null;
  let oceanSource = null;
  let scheduler = null;
  let nextSegmentTime = 0;
  let playing = false;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  function setButtonState(active) {
    playing = active;
    toggle.classList.toggle('playing', active);
    toggle.setAttribute('aria-pressed', String(active));
    toggle.setAttribute('aria-label', active ? '배경음악 끄기' : '배경음악 켜기');
    toggle.querySelector('span').textContent = active ? '🔊' : '🔇';
    if (active) hint?.classList.add('dismissed');
  }

  function createAudioGraph() {
    if (context || !AudioContextClass) return;
    context = new AudioContextClass();
    master = context.createGain();
    music = context.createGain();
    effects = context.createGain();
    master.gain.value = 0;
    music.gain.value = 0.68;
    effects.gain.value = 0.7;
    music.connect(master);
    effects.connect(master);
    master.connect(context.destination);

    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let smooth = 0;
    for (let index = 0; index < samples.length; index += 1) {
      smooth = smooth * 0.985 + (Math.random() * 2 - 1) * 0.015;
      samples[index] = smooth;
    }
    oceanSource = context.createBufferSource();
    const oceanFilter = context.createBiquadFilter();
    const oceanGain = context.createGain();
    oceanSource.buffer = buffer;
    oceanSource.loop = true;
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.value = 760;
    oceanGain.gain.value = 0.16;
    oceanSource.connect(oceanFilter).connect(oceanGain).connect(effects);
    oceanSource.start();
  }

  function note(frequency, start, duration, type = 'sine', volume = 0.04, destination = music) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    filter.type = 'lowpass';
    filter.frequency.value = type === 'sawtooth' ? 900 : 1800;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.35, duration * 0.22));
    gain.gain.setValueAtTime(volume, start + Math.max(0.4, duration * 0.65));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter).connect(gain).connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function seagull(start, shift = 0) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1180 + shift, start);
    oscillator.frequency.exponentialRampToValueAtTime(1860 + shift, start + 0.24);
    oscillator.frequency.exponentialRampToValueAtTime(1040 + shift, start + 0.62);
    oscillator.frequency.exponentialRampToValueAtTime(1510 + shift, start + 0.9);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.05);
    filter.type = 'bandpass';
    filter.frequency.value = 1650;
    filter.Q.value = 2.4;
    oscillator.connect(filter).connect(gain).connect(effects);
    oscillator.start(start);
    oscillator.stop(start + 1.08);
  }

  function shipHorn(start) {
    [73.42, 110, 146.83].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      oscillator.type = index === 0 ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.linearRampToValueAtTime(frequency * 0.975, start + 2.8);
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.035 / (index + 1), start + 0.42);
      gain.gain.setValueAtTime(0.035 / (index + 1), start + 1.75);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.1);
      oscillator.connect(filter).connect(gain).connect(effects);
      oscillator.start(start);
      oscillator.stop(start + 3.15);
    });
  }

  function scheduleSegment(start) {
    const chords = [
      [146.83, 220, 293.66],
      [130.81, 196, 261.63],
      [174.61, 220, 349.23],
      [110, 164.81, 220]
    ];
    chords.forEach((chord, chordIndex) => {
      const chordStart = start + chordIndex * 4;
      chord.forEach((frequency, noteIndex) => {
        note(frequency, chordStart, 4.8, noteIndex === 0 ? 'triangle' : 'sine', noteIndex === 0 ? 0.035 : 0.021);
      });
      const melody = [chord[1] * 2, chord[2] * 2, chord[1] * 2.25, chord[2] * 1.5];
      melody.forEach((frequency, step) => note(frequency, chordStart + 0.45 + step * 0.78, 1.25, 'triangle', 0.025));
    });
    seagull(start + 4.8);
    seagull(start + 5.35, 140);
    shipHorn(start + 9.1);
    seagull(start + 13.4, -90);
  }

  function keepScheduled() {
    if (!playing || !context) return;
    while (nextSegmentTime < context.currentTime + 20) {
      scheduleSegment(nextSegmentTime);
      nextSegmentTime += 16;
    }
  }

  async function start() {
    if (!AudioContextClass) {
      hint.textContent = '이 브라우저에서는 배경음악을 재생할 수 없어요.';
      return;
    }
    createAudioGraph();
    await context.resume();
    nextSegmentTime = context.currentTime + 0.08;
    setButtonState(true);
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.42, context.currentTime + 1.4);
    clearInterval(scheduler);
    keepScheduled();
    scheduler = setInterval(keepScheduled, 5000);
  }

  function pause(fadeSeconds = 0.5) {
    if (!context || !playing) return;
    const closingContext = context;
    setButtonState(false);
    clearInterval(scheduler);
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + fadeSeconds);
    setTimeout(() => {
      if (!playing && context === closingContext) {
        closingContext.close().catch(() => {});
        context = null;
        master = null;
        music = null;
        effects = null;
        oceanSource = null;
      }
    }, fadeSeconds * 1000 + 80);
  }

  toggle.addEventListener('click', () => {
    if (playing) pause();
    else start();
  });

  document.addEventListener('pointerdown', (event) => {
    if (playing || event.target.closest('#bgmToggle')) return;
    start();
  }, { once: true });

  sailButton?.addEventListener('click', () => pause(1.8));
})();
