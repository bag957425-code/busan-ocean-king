(() => {
  const toggle = document.getElementById('bgmToggle');
  const playToggle = document.getElementById('playBgmToggle');
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
  let mode = 'start';
  const scheduledNodes = new Set();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  function setButtonState(active) {
    playing = active;
    toggle.classList.toggle('playing', active);
    toggle.setAttribute('aria-pressed', String(active));
    toggle.setAttribute('aria-label', active ? '배경음악 끄기' : '배경음악 켜기');
    toggle.querySelector('span').textContent = active ? '🔊' : '🔇';
    if (playToggle) {
      playToggle.classList.toggle('playing', active);
      playToggle.setAttribute('aria-pressed', String(active));
      playToggle.setAttribute('aria-label', active ? '플레이 배경음악 끄기' : '플레이 배경음악 켜기');
      playToggle.querySelector('span').textContent = active ? '🔊' : '🔇';
    }
    if (active) hint?.classList.add('dismissed');
  }

  function trackNode(node) {
    scheduledNodes.add(node);
    node.addEventListener('ended', () => scheduledNodes.delete(node), { once: true });
    return node;
  }

  function stopScheduledNodes() {
    scheduledNodes.forEach((node) => {
      try { node.stop(); } catch (_) {}
    });
    scheduledNodes.clear();
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
    const oscillator = trackNode(context.createOscillator());
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
    const oscillator = trackNode(context.createOscillator());
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
      const oscillator = trackNode(context.createOscillator());
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

  function drum(start, accent = false) {
    const oscillator = trackNode(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(accent ? 132 : 105, start);
    oscillator.frequency.exponentialRampToValueAtTime(accent ? 46 : 55, start + 0.24);
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    gain.gain.setValueAtTime(accent ? 0.12 : 0.075, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (accent ? 0.72 : 0.46));
    oscillator.connect(filter).connect(gain).connect(effects);
    oscillator.start(start);
    oscillator.stop(start + 0.76);

    const noiseBuffer = context.createBuffer(1, Math.round(context.sampleRate * 0.18), context.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noise.length; index += 1) noise[index] = (Math.random() * 2 - 1) * (1 - index / noise.length);
    const noiseSource = trackNode(context.createBufferSource());
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = accent ? 170 : 220;
    noiseFilter.Q.value = 1.4;
    noiseGain.gain.setValueAtTime(accent ? 0.055 : 0.03, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(effects);
    noiseSource.start(start);
    noiseSource.stop(start + 0.19);
  }

  function steelPan(frequency, start, duration = 0.72, volume = 0.032) {
    [1, 2.01, 3.96].forEach((ratio, index) => {
      const oscillator = trackNode(context.createOscillator());
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency * ratio, start);
      oscillator.detune.setValueAtTime(index * 3, start);
      filter.type = 'bandpass';
      filter.frequency.value = Math.min(5200, frequency * ratio * 1.5);
      filter.Q.value = index === 0 ? 0.7 : 2.2;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume / (index + 1.4), start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration * (index === 0 ? 1 : 0.62));
      oscillator.connect(filter).connect(gain).connect(music);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    });
  }

  function marimba(frequency, start, duration = 0.42, volume = 0.026) {
    const oscillator = trackNode(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.992, start + duration);
    filter.type = 'lowpass';
    filter.frequency.value = 1600;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter).connect(gain).connect(music);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function clave(start, accent = false) {
    const oscillator = trackNode(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(accent ? 2250 : 1780, start);
    filter.type = 'bandpass';
    filter.frequency.value = accent ? 2400 : 1900;
    filter.Q.value = 5.5;
    gain.gain.setValueAtTime(accent ? 0.022 : 0.015, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.065);
    oscillator.connect(filter).connect(gain).connect(effects);
    oscillator.start(start);
    oscillator.stop(start + 0.07);
  }

  function shaker(start, volume = 0.013) {
    const buffer = context.createBuffer(1, Math.round(context.sampleRate * 0.09), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      const envelope = Math.pow(1 - index / data.length, 2);
      data[index] = (Math.random() * 2 - 1) * envelope;
    }
    const source = trackNode(context.createBufferSource());
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 4200;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
    source.connect(filter).connect(gain).connect(effects);
    source.start(start);
    source.stop(start + 0.095);
  }

  function conga(start, high = false, volume = 0.055) {
    const oscillator = trackNode(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const frequency = high ? 235 : 165;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.58, start + 0.23);
    filter.type = 'lowpass';
    filter.frequency.value = 650;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    oscillator.connect(filter).connect(gain).connect(effects);
    oscillator.start(start);
    oscillator.stop(start + 0.3);
  }

  function scheduleStartSegment(start) {
    const bars = [
      { bass: 130.81, chord: [261.63, 329.63, 392], melody: [523.25, 659.25, 587.33, 783.99] },
      { bass: 174.61, chord: [261.63, 349.23, 440], melody: [698.46, 659.25, 523.25, 440] },
      { bass: 196, chord: [293.66, 392, 493.88], melody: [587.33, 783.99, 659.25, 880] },
      { bass: 164.81, chord: [246.94, 329.63, 392], melody: [659.25, 587.33, 493.88, 523.25] }
    ];
    bars.forEach((bar, barIndex) => {
      const barStart = start + barIndex * 4;
      note(bar.bass, barStart, 4.25, 'triangle', 0.027);
      bar.chord.forEach((frequency, index) => note(frequency, barStart, 4.15, 'sine', 0.012 / (index + 1)));
      [0.35, 1.15, 2.05, 3.1].forEach((offset, step) => steelPan(bar.melody[step], barStart + offset, 0.68, 0.034));
      [0.75, 1.75, 2.75, 3.55].forEach((offset, step) => marimba(step % 2 ? bar.bass * 2 : bar.bass * 1.5, barStart + offset));
      [0, 0.75, 1.75, 2.5, 3.25].forEach((offset, step) => clave(barStart + offset, step === 0));
      for (let beat = 0; beat < 8; beat += 1) shaker(barStart + beat * 0.5, beat % 2 ? 0.01 : 0.014);
      conga(barStart, false, 0.046);
      conga(barStart + 1.5, true, 0.038);
      conga(barStart + 3, false, 0.048);
    });
    seagull(start + 5.1);
    seagull(start + 5.62, 120);
    shipHorn(start + 10.1);
    seagull(start + 14.2, -80);
  }

  function schedulePlaySegment(start) {
    const bars = [
      { bass: 130.81, chord: [261.63, 329.63, 392], motif: [659.25, 783.99, 880, 783.99, 659.25, 587.33] },
      { bass: 174.61, chord: [261.63, 349.23, 440], motif: [698.46, 880, 783.99, 698.46, 659.25, 523.25] },
      { bass: 196, chord: [293.66, 392, 493.88], motif: [783.99, 880, 987.77, 880, 783.99, 659.25] },
      { bass: 130.81, chord: [261.63, 329.63, 392], motif: [659.25, 783.99, 1046.5, 987.77, 880, 783.99] }
    ];
    bars.forEach((bar, barIndex) => {
      const barStart = start + barIndex * 4;
      note(bar.bass, barStart, 3.95, 'triangle', 0.021);
      bar.chord.forEach((frequency, index) => note(frequency, barStart, 3.9, 'sine', 0.009 / (index + 1)));
      [0.15, 0.78, 1.42, 2.08, 2.72, 3.4].forEach((offset, step) => {
        steelPan(bar.motif[step], barStart + offset, 0.42, step % 3 === 0 ? 0.031 : 0.027);
      });
      [0.35, 1.35, 2.35, 3.35].forEach((offset, step) => {
        marimba(step % 2 ? bar.bass * 2 : bar.bass * 1.5, barStart + offset, 0.24, 0.022);
      });
      [0.25, 1.5, 2.75, 3.5].forEach((offset, step) => {
        conga(barStart + offset, step % 2 === 1, step === 0 ? 0.038 : 0.03);
      });
      [0, 0.75, 1.75, 2.5, 3.25].forEach((offset, step) => clave(barStart + offset, step === 0));
      for (let beat = 0; beat < 8; beat += 1) {
        shaker(barStart + beat * 0.5, beat % 2 === 0 ? 0.013 : 0.009);
      }
    });
    steelPan(1046.5, start + 15.55, 0.38, 0.034);
  }

  function scheduleSegment(start) {
    if (mode === 'play') schedulePlaySegment(start);
    else scheduleStartSegment(start);
  }

  function keepScheduled() {
    if (!playing || !context) return;
    while (nextSegmentTime < context.currentTime + 20) {
      scheduleSegment(nextSegmentTime);
      nextSegmentTime += 16;
    }
  }

  async function start(requestedMode = mode) {
    if (!AudioContextClass) {
      hint.textContent = '이 브라우저에서는 배경음악을 재생할 수 없어요.';
      return;
    }
    createAudioGraph();
    await context.resume();
    mode = requestedMode;
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
    stopScheduledNodes();
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
    else start(mode);
  });

  playToggle?.addEventListener('click', () => {
    if (playing) pause();
    else start('play');
  });

  document.addEventListener('pointerdown', (event) => {
    if (playing || event.target.closest('#bgmToggle')) return;
    start(mode);
  }, { once: true });

  sailButton?.addEventListener('click', () => {
    mode = 'play';
    if (!playing || !context) {
      start('play');
      return;
    }
    clearInterval(scheduler);
    stopScheduledNodes();
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.48);
    setTimeout(() => {
      if (!playing || !context || mode !== 'play') return;
      nextSegmentTime = context.currentTime + 0.04;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0.0001, context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.46, context.currentTime + 0.8);
      keepScheduled();
      scheduler = setInterval(keepScheduled, 5000);
    }, 500);
  });
})();
