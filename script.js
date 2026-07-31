(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const XP_GOAL = 300;
  const TRASH_GOAL = 5;

  const legacySpecies = [
    { id: 'mackerel', name: '고등어', latin: 'Scomber japonicus', icon: '🐟', rarity: '흔함', habitat: '부산 연안과 외해', facts: '고등어는 부산을 대표하는 회유성 어류예요. 빠르게 헤엄치며 플랑크톤과 작은 물고기를 먹고 무리를 지어 이동해요.', guide: '부산공동어시장은 전국 고등어 유통의 중심지로 알려져 있어요.' },
    { id: 'rock-bream', name: '돌돔', latin: 'Oplegnathus fasciatus', icon: '🐠', rarity: '보통', habitat: '태종대·오륙도 암초', facts: '돌돔은 단단한 이빨로 성게와 조개껍데기를 깨 먹어요. 어린 개체는 검은 줄무늬가 선명해요.', guide: '암초 생태계의 먹이 관계를 보여주는 중요한 물고기예요.' },
    { id: 'seahorse', name: '가시해마', latin: 'Hippocampus histrix', icon: '🦄', rarity: '희귀', habitat: '부산 연안 해조류 숲', facts: '해마는 꼬리로 해조류를 붙잡고 생활하며 수컷이 알을 품는 특별한 물고기예요.', guide: '해조류 숲이 사라지면 살 곳도 함께 줄어들기 때문에 서식지 보호가 중요해요.' },
    { id: 'octopus', name: '참문어', latin: 'Octopus vulgaris', icon: '🐙', rarity: '보통', habitat: '기장·영도 바위틈', facts: '참문어는 주변 환경에 맞춰 몸의 색과 무늬를 바꿀 수 있고, 빨판으로 먹이를 감지해요.', guide: '지능이 높은 무척추동물로 도구를 사용하거나 미로를 학습하기도 해요.' },
    { id: 'starfish', name: '별불가사리', latin: 'Asterina pectinifera', icon: '⭐', rarity: '흔함', habitat: '다대포 조간대', facts: '불가사리는 극피동물이며 관족이라는 작은 발로 천천히 움직여요.', guide: '관찰 후에는 원래 있던 자리에 두고, 햇빛 아래 오래 꺼내놓지 마세요.' },
    { id: 'sea-turtle', name: '푸른바다거북', latin: 'Chelonia mydas', icon: '🐢', rarity: '전설', habitat: '부산 외해', facts: '푸른바다거북은 먼 바다를 이동하는 보호종이에요. 비닐을 해파리로 착각할 수 있어요.', guide: '발견하면 거리를 두고 관찰하고 해양쓰레기를 줄여 서식 환경을 지켜주세요.' },
    { id: 'moon-jelly', name: '보름달물해파리', latin: 'Aurelia coerulea', icon: '🪼', rarity: '보통', habitat: '수영만·연안', facts: '몸속에 보이는 네 개의 고리 모양 생식샘 때문에 보름달물해파리라는 이름이 붙었어요.', guide: '약한 독성이지만 피부에 닿지 않도록 안전거리를 유지해요.' },
    { id: 'squid', name: '살오징어', latin: 'Todarodes pacificus', icon: '🦑', rarity: '보통', habitat: '기장 앞바다', facts: '살오징어는 몸속 색소포를 조절해 빠르게 색을 바꾸고 제트 추진으로 이동해요.', guide: '밤에는 빛에 모이는 습성이 있어 집어등 어업에 이용돼요.' },
    { id: 'dolphin', name: '상괭이', latin: 'Neophocaena asiaeorientalis', icon: '🐬', rarity: '희귀', habitat: '남해와 부산 외해', facts: '상괭이는 등지느러미가 없는 작은 돌고래예요. 숨을 쉬기 위해 정기적으로 수면 위로 올라와요.', guide: '멸종위기 해양보호생물로 배에서 발견해도 쫓아가거나 먹이를 주면 안 돼요.' },
    { id: 'crab', name: '꽃게', latin: 'Portunus trituberculatus', icon: '🦀', rarity: '보통', habitat: '낙동강 하구 모래바닥', facts: '꽃게의 마지막 다리는 노처럼 납작해 헤엄치기에 알맞아요.', guide: '어린 꽃게가 자랄 수 있도록 금어기와 포획 금지 크기를 지키는 것이 중요해요.' },
    { id: 'anchovy', name: '멸치', latin: 'Engraulis japonicus', icon: '🐟', rarity: '흔함', habitat: '기장 연안', facts: '멸치는 작은 몸으로 큰 무리를 이루며 많은 바닷새와 대형 물고기의 먹이가 돼요.', guide: '부산 기장에서는 봄철 멸치 어업과 멸치 축제로 지역 바다 문화를 만날 수 있어요.' },
    { id: 'sea-hare', name: '군소', latin: 'Aplysia kurodai', icon: '🐌', rarity: '희귀', habitat: '송정 얕은 암반', facts: '군소는 해조류를 먹는 바다 달팽이예요. 위협을 받으면 보라색 액체를 내보내기도 해요.', guide: '독성이 있을 수 있으므로 손으로 만지거나 먹지 말고 눈으로만 관찰해요.' }
  ];
  const species = window.OceanCatalog?.species || legacySpecies;
  const marineWastes = window.OceanCatalog?.wastes || [];
  const mermaid = {
    id: 'mermaid-bonus',
    name: '인어',
    icon: '🧜‍♀️',
    kind: 'bonus',
    rarity: '신비',
    habitat: '부산 바다의 신비한 물결'
  };
  const difficulties = {
    beginner: { name: '초급 탐험가', zone: 168, moveMin: 2100, moveRange: 900, transition: 1.35, zoneStay: 2000, cooldown: 500, maxEntities: 4, trashTarget: 1, trashChance: 0.10 },
    intermediate: { name: '중급 탐험가', zone: 142, moveMin: 1450, moveRange: 750, transition: 0.9, zoneStay: 1000, cooldown: 1000, maxEntities: 5, trashTarget: 2, trashChance: 0.18 },
    advanced: { name: '고급 탐험가', zone: 116, moveMin: 900, moveRange: 550, transition: 0.62, zoneStay: 500, cooldown: 2000, maxEntities: 6, trashTarget: 3, trashChance: 0.28 },
    master: { name: '마스터', zone: 92, moveMin: 520, moveRange: 380, transition: 0.38, zoneStay: 100, cooldown: 3000, maxEntities: 7, trashTarget: 4, trashChance: 0.42 }
  };

  const state = {
    points: 0,
    xp: 0,
    level: 1,
    trash: 0,
    collection: new Map(),
    creatures: new Map(),
    captureReadyAt: 0,
    captureCooldownTimer: null,
    difficulty: 'beginner',
    xpBuffs: [],
    user: null,
    quizDone: false,
    postsUnsubscribe: null,
    chatUnsubscribe: null,
    commentsUnsubscribe: null,
    notificationUnsubscribe: null,
    notifications: [],
    notificationsReady: false,
    profiles: [],
    posts: [],
    spawnSpecies: [...species],
    location: null
  };

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.add('hidden'), 2600);
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[character]);
  }

  function safeAvatarImage(value = '') {
    const image = String(value || '');
    if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(image)) return image;
    if (/^https:\/\/[^\s"'<>]+$/i.test(image)) return image;
    return '';
  }

  function avatarMarkup(profile = {}, alt = '프로필 사진') {
    const image = safeAvatarImage(profile.avatarImage);
    if (image) return `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}">`;
    return `<span aria-hidden="true">${escapeHtml(profile.avatar || '🌊')}</span>`;
  }

  function compressProfileImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('사진 파일을 선택해 주세요.'));
      if (file.size > 12 * 1024 * 1024) return reject(new Error('12MB 이하의 사진을 선택해 주세요.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('사진을 읽지 못했어요.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('지원하지 않는 사진 형식이에요.'));
        image.onload = () => {
          const maxSize = 256;
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          context.fillStyle = '#e8f7ff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          let quality = 0.84;
          let result = canvas.toDataURL('image/jpeg', quality);
          while (result.length > 230000 && quality > 0.48) {
            quality -= 0.08;
            result = canvas.toDataURL('image/jpeg', quality);
          }
          if (result.length > 260000) return reject(new Error('사진 용량을 줄이지 못했어요. 다른 사진을 선택해 주세요.'));
          resolve(result);
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function showTab(id) {
    $$('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === id));
    $$('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'community') loadCommunity();
  }

  function renderProgress() {
    $('#levelNumber').textContent = state.level;
    $('#xpNow').textContent = state.xp;
    $('#xpGoal').textContent = XP_GOAL;
    $('#xpLeft').textContent = `다음 레벨까지 ${XP_GOAL - state.xp} XP`;
    $('#xpBar').style.width = `${Math.min(100, state.xp / XP_GOAL * 100)}%`;
    $('#pointTotal').textContent = state.points.toLocaleString();
    renderBuffState();
  }

  function activeXpMultiplier() {
    const now = Date.now();
    state.xpBuffs = state.xpBuffs.filter((expiresAt) => expiresAt > now);
    return 2 ** state.xpBuffs.length;
  }

  function renderBuffState() {
    const element = $('#xpBuffState');
    if (!element) return;
    const multiplier = activeXpMultiplier();
    if (multiplier === 1) {
      element.classList.add('hidden');
      return;
    }
    const remaining = Math.max(0, Math.ceil((Math.min(...state.xpBuffs) - Date.now()) / 1000));
    element.textContent = `🧜‍♀️ XP ×${multiplier} · 다음 효과 종료 ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
    element.classList.remove('hidden');
  }

  function addMermaidBuff() {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    state.xpBuffs.push(expiresAt);
    const multiplier = activeXpMultiplier();
    renderBuffState();
    setTimeout(() => {
      const before = state.xpBuffs.length;
      state.xpBuffs = state.xpBuffs.filter((time) => time > Date.now());
      renderBuffState();
      if (state.xpBuffs.length < before) toast('인어의 XP 두 배 효과 하나가 끝났어요.');
    }, 5 * 60 * 1000 + 100);
    return multiplier;
  }

  function difficultySettings() {
    return difficulties[state.difficulty] || difficulties.beginner;
  }

  function applyDifficulty(value, persist = true) {
    state.difficulty = difficulties[value] ? value : 'beginner';
    const settings = difficultySettings();
    const zone = $('#captureZone');
    zone.style.width = `${settings.zone}px`;
    zone.style.height = `${settings.zone}px`;
    $('#creatureLayer').style.setProperty('--creature-move-duration', `${settings.transition}s`);
    $('#difficultySelect').value = state.difficulty;
    $('#difficultySummary').textContent = `${settings.name} · 원 안 ${settings.zoneStay / 1000}초 · 포획 쿨타임 ${settings.cooldown / 1000}초`;
    [...state.creatures.keys()].slice(settings.maxEntities).forEach((id) => removeCreature(id));
    updateTargets();
    state.creatures.forEach((entry) => restartCreatureMovement(entry));
    if (persist) saveProgress();
  }

  async function saveProgress() {
    if (!window.OceanCloud || !state.user) return;
    try {
      await window.OceanCloud.saveProgress({
        level: state.level,
        xp: state.xp,
        points: state.points,
        trash: state.trash,
        difficulty: state.difficulty
      });
    } catch (_) {
      $('#cloudState').textContent = '저장 대기';
      $('#cloudState').classList.remove('online');
    }
  }

  function gain(points, xp, message) {
    const multiplier = activeXpMultiplier();
    const earnedXp = Math.round(xp * multiplier);
    state.points += points;
    state.xp += earnedXp;
    let leveledUp = false;
    while (state.xp >= XP_GOAL) {
      state.xp -= XP_GOAL;
      state.level += 1;
      leveledUp = true;
    }
    renderProgress();
    saveProgress();
    if (leveledUp) toast(`🎉 레벨 업! 레벨 ${state.level} 탐험가가 되었어요.`);
    else if (message) toast(multiplier > 1 ? `${message} · 인어 효과 XP ×${multiplier}` : message);
    return earnedXp;
  }

  function openDialog(title, kicker, body, className = '') {
    const overlay = document.createElement('div');
    const cleanups = [];
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <section class="dialog-card ${className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="dialog-top"><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div><button class="dialog-close" type="button" aria-label="닫기">×</button></div>
        <div class="dialog-body">${body}</div>
      </section>`;
    $('#dialogLayer').append(overlay);
    const close = () => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      overlay.remove();
    };
    $('.dialog-close', overlay).addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    setTimeout(() => $('.dialog-close', overlay).focus(), 0);
    return { overlay, body: $('.dialog-body', overlay), close, addCleanup: (cleanup) => cleanups.push(cleanup) };
  }

  function randomPosition() {
    return { x: 4 + Math.random() * 82, y: 4 + Math.random() * 72 };
  }

  function positionInsideCaptureZone(entry, position) {
    const layer = $('#creatureLayer').getBoundingClientRect();
    const zone = $('#captureZone').getBoundingClientRect();
    const centerX = layer.left + position.x / 100 * layer.width + entry.element.offsetWidth / 2;
    const centerY = layer.top + position.y / 100 * layer.height + entry.element.offsetHeight / 2;
    const radius = zone.width / 2;
    return Math.hypot(centerX - (zone.left + radius), centerY - (zone.top + radius)) <= radius - 8;
  }

  function moveCreature(entry) {
    if (!entry.element.isConnected) return;
    const position = randomPosition();
    entry.x = position.x;
    entry.y = position.y;
    entry.destinationInsideZone = positionInsideCaptureZone(entry, position);
    entry.element.style.transform = `translate(${position.x / 100 * $('#creatureLayer').clientWidth}px, ${position.y / 100 * $('#creatureLayer').clientHeight}px)`;
    clearTimeout(entry.targetTimer);
    entry.targetTimer = setTimeout(updateTargets, difficultySettings().transition * 1000 + 20);
    return entry.destinationInsideZone;
  }

  function placeCreature(entry) {
    const position = randomPosition();
    entry.x = position.x;
    entry.y = position.y;
    entry.destinationInsideZone = positionInsideCaptureZone(entry, position);
    entry.element.style.transition = 'none';
    entry.element.style.transform = `translate(${position.x / 100 * $('#creatureLayer').clientWidth}px, ${position.y / 100 * $('#creatureLayer').clientHeight}px)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (entry.element.isConnected) entry.element.style.transition = '';
      });
    });
  }

  function restartCreatureMovement(entry) {
    clearTimeout(entry.moveTimer);
    const schedule = (delay) => {
      const settings = difficultySettings();
      entry.moveTimer = setTimeout(() => {
        if (!entry.element.isConnected) return;
        const arrivedInside = !$('#playScreen').classList.contains('hidden') && moveCreature(entry);
        const nextSettings = difficultySettings();
        const nextDelay = arrivedInside
          ? nextSettings.transition * 1000 + nextSettings.zoneStay
          : nextSettings.moveMin + Math.random() * nextSettings.moveRange;
        schedule(nextDelay);
      }, delay);
    };
    const settings = difficultySettings();
    schedule(entry.destinationInsideZone
      ? settings.zoneStay
      : settings.moveMin + Math.random() * settings.moveRange);
  }

  function removeCreature(id, caught = false) {
    const entry = state.creatures.get(id);
    if (!entry) return;
    clearTimeout(entry.moveTimer);
    clearTimeout(entry.targetTimer);
    clearTimeout(entry.lifeTimer);
    entry.element.classList.add('vanish');
    setTimeout(() => entry.element.remove(), 420);
    state.creatures.delete(id);
    if (!caught) $('#arenaStatus').textContent = '??? 유닛이 시야에서 사라졌어요.';
  }

  function spawnCreature() {
    const settings = difficultySettings();
    if ($('#playScreen').classList.contains('hidden') || state.creatures.size >= settings.maxEntities) return;
    const pool = state.spawnSpecies.length ? state.spawnSpecies : species;
    const visibleIds = new Set([...state.creatures.values()].map((entry) => entry.species.id));
    const visibleTrash = [...state.creatures.values()].filter((entry) => entry.species.kind === 'waste').length;
    let selected;
    if (Math.random() < 0.04 && !visibleIds.has(mermaid.id)) {
      selected = mermaid;
    } else if (marineWastes.length && (visibleTrash < settings.trashTarget || Math.random() < settings.trashChance)) {
      const availableWaste = marineWastes.filter((item) => !visibleIds.has(item.id));
      const wastePool = availableWaste.length ? availableWaste : marineWastes;
      selected = wastePool[Math.floor(Math.random() * wastePool.length)];
    } else {
      const available = pool.filter((item) => !visibleIds.has(item.id));
      const speciesPool = available.length ? available : pool;
      selected = speciesPool[Math.floor(Math.random() * speciesPool.length)];
    }
    const id = `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `wild-creature ${selected.kind === 'waste' ? 'waste-creature' : selected.kind === 'bonus' ? 'bonus-creature' : ''}`;
    element.dataset.creatureId = id;
    element.setAttribute('aria-label', `정체불명의 움직이는 ${selected.kind === 'waste' ? '해양 쓰레기' : selected.kind === 'bonus' ? '보너스 대상' : '해양 생물'}`);
    element.innerHTML = `<i>${selected.icon}</i><small>???</small>`;
    $('#creatureLayer').append(element);
    const entry = { id, species: selected, element, x: 0, y: 0 };
    state.creatures.set(id, entry);
    placeCreature(entry);
    restartCreatureMovement(entry);
    entry.lifeTimer = setTimeout(() => removeCreature(id), 10000 + Math.random() * 6000);
    element.addEventListener('click', async () => {
      element.classList.add('target');
      setTimeout(() => element.classList.remove('target'), 900);
      if (selected.kind === 'waste') {
        $('#arenaStatus').textContent = '??? 쓰레기의 실제 현장 사진을 찾는 중...';
        try {
          const photo = await window.OceanAI.nextWastePhoto(selected);
          $('i', element).innerHTML = `<img src="${escapeHtml(photo.url)}" alt="바다에서 발견된 정체불명 쓰레기 실제 사진">`;
          element.title = `${photo.credit || 'Wikimedia Commons'} · 실제 해양 쓰레기 현장 사진`;
          $('#arenaStatus').textContent = '???: 아이콘을 다시 누르면 다른 실제 현장 사진이 나와요.';
        } catch (_) {
          $('#arenaStatus').textContent = '???: 포획 원에 들어오면 잡아서 바다를 정화하세요!';
        }
        return;
      }
      if (selected.kind === 'bonus') {
        $('#arenaStatus').textContent = '??? 보너스 유닛이에요! 포획하면 특별한 효과를 확인할 수 있어요.';
        return;
      }
      $('#arenaStatus').textContent = '??? 생물의 실제 사진을 찾는 중...';
      try {
        const photo = await window.OceanAI.nextSpeciesPhoto(selected);
        $('i', element).innerHTML = `<img src="${escapeHtml(photo.url)}" alt="정체불명 해양 생물 실제 사진">`;
        element.title = `${photo.credit || 'iNaturalist 관찰자'} · 살아있는 개체 관찰 사진`;
        $('#arenaStatus').textContent = '???: 아이콘을 다시 누르면 다른 실제 사진이 나와요.';
      } catch (_) {
        $('#arenaStatus').textContent = '???: 포획 원 안으로 들어올 때 버튼을 누르세요!';
      }
    });
    $('#arenaStatus').textContent = '??? 유닛 출현! 정체는 포획한 뒤 확인할 수 있어요.';
    updateTargets();
  }

  function creaturesInsideZone() {
    const zone = $('#captureZone').getBoundingClientRect();
    const radius = zone.width / 2;
    const center = { x: zone.left + radius, y: zone.top + radius };
    return [...state.creatures.values()].map((entry) => {
      const rect = entry.element.getBoundingClientRect();
      const creatureCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const distance = Math.hypot(creatureCenter.x - center.x, creatureCenter.y - center.y);
      return { entry, distance };
    }).filter(({ distance }) => distance <= radius - 8).sort((a, b) => a.distance - b.distance);
  }

  function updateTargets() {
    const inside = new Set(creaturesInsideZone().map(({ entry }) => entry.id));
    state.creatures.forEach((entry) => entry.element.classList.toggle('target', inside.has(entry.id)));
    if (inside.size) $('#arenaStatus').textContent = '지금이에요! 포획 버튼을 눌러보세요.';
  }

  function beginCaptureCooldown() {
    const button = $('#captureButton');
    const cooldown = difficultySettings().cooldown;
    state.captureReadyAt = Date.now() + cooldown;
    button.disabled = true;
    button.classList.add('cooling');
    button.setAttribute('aria-label', '포획 버튼 재충전 중');
    const render = () => {
      const remaining = Math.max(0, state.captureReadyAt - Date.now());
      button.style.setProperty('--cooldown-progress', `${Math.min(360, (1 - remaining / cooldown) * 360)}deg`);
      const label = $('b', button);
      if (remaining > 0) {
        label.textContent = `${(remaining / 1000).toFixed(1)}초`;
        state.captureCooldownTimer = setTimeout(render, 50);
      } else {
        clearTimeout(state.captureCooldownTimer);
        button.disabled = false;
        button.classList.remove('cooling');
        button.style.removeProperty('--cooldown-progress');
        button.setAttribute('aria-label', '포획');
        label.textContent = '포획';
      }
    };
    render();
  }

  async function captureCreature() {
    if (Date.now() < state.captureReadyAt) return;
    beginCaptureCooldown();
    const target = creaturesInsideZone()[0];
    const arena = $('#captureArena');
    arena.classList.add('capture-flash');
    setTimeout(() => arena.classList.remove('capture-flash'), 520);
    if (!target) {
      toast('포획 원 안에 생물이 없어요. 조금 더 기다려보세요!');
      return;
    }
    const found = target.entry.species;
    removeCreature(target.entry.id, true);
    if (found.kind === 'bonus') {
      const multiplier = addMermaidBuff();
      const dialog = openDialog('신비한 인어를 만났어요!', 'MERMAID XP BOOST', `
        <div class="caught-card mermaid-card">
          <div class="bonus-symbol">🧜‍♀️</div>
          <h2>5분간 XP ×${multiplier}</h2>
          <span class="reward">인어 효과는 여러 번 중첩할 수 있어요</span>
          <p>인어는 생물 도감에 등록되지 않아요. 효과가 유지되는 동안 퀴즈·포획·정화 활동에서 얻는 모든 XP가 증가해요.</p>
          <button class="dialog-primary caught-confirm" type="button">효과 사용하기</button>
        </div>`, 'caught-dialog');
      $('.caught-confirm', dialog.body).addEventListener('click', dialog.close);
      toast(`🧜‍♀️ 인어 효과 발동! 현재 XP ×${multiplier}`);
      return;
    }
    if (found.kind === 'waste') {
      const earnedXp = gain(30, 25, `${found.name} 정화 성공! +30 씨앗`);
      openWasteDetail(found, true, earnedXp);
      return;
    }
    const isNew = !state.collection.has(found.id);
    state.collection.set(found.id, found);
    renderCollection();
    if (window.OceanCloud && state.user) {
      try { await window.OceanCloud.addSpecies(found); } catch (_) { toast('도감 저장이 잠시 지연되고 있어요.'); }
    }
    const earnedXp = gain(isNew ? 60 : 20, isNew ? 80 : 25);
    const dialog = openDialog(isNew ? '새로운 생물 발견!' : '다시 만난 바다 친구!', 'CAPTURE SUCCESS', `
      <div class="caught-card">
        <button class="caught-icon photo-swap" type="button" aria-label="${escapeHtml(found.name)} 실제 사진 바꾸기">${found.icon}</button>
        <a class="photo-credit hidden" target="_blank" rel="noopener noreferrer"></a>
        <h2>${found.name}</h2>
        <span class="reward">+${earnedXp} XP · ${isNew ? '도감 신규 등록' : '관찰 보너스'}</span>
        <p>${found.facts}</p>
        <div class="species-facts"><b>서식지</b> ${found.habitat}<br><b>관찰 포인트</b> ${found.guide}</div>
        <button class="dialog-primary caught-confirm" type="button">도감 확인하기</button>
      </div>`, 'caught-dialog');
    const caughtIcon = $('.caught-icon', dialog.body);
    const caughtCredit = $('.photo-credit', dialog.body);
    const swapCaughtPhoto = async () => {
      caughtIcon.classList.add('loading-photo');
      try {
        const photo = await window.OceanAI.nextSpeciesPhoto(found);
        caughtIcon.innerHTML = `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(found.name)} 실제 사진">`;
        caughtIcon.title = '누르면 다른 실제 사진';
        caughtCredit.href = photo.source;
        caughtCredit.textContent = `사진: ${photo.credit || 'iNaturalist 관찰자'} · 관찰 기록 보기`;
        caughtCredit.classList.remove('hidden');
      } catch (_) {
        caughtIcon.textContent = found.icon;
      } finally {
        caughtIcon.classList.remove('loading-photo');
      }
    };
    caughtIcon.addEventListener('click', swapCaughtPhoto);
    swapCaughtPhoto();
    $('.caught-confirm', dialog.body).addEventListener('click', () => {
      dialog.close();
      showTab('learn');
    });
  }

  function renderCollection() {
    const grid = $('#collectionGrid');
    grid.innerHTML = '';
    const collected = [...state.collection.values()];
    collected.forEach((item) => {
      const card = document.createElement('article');
      card.tabIndex = 0;
      card.innerHTML = `<button class="species-thumb" type="button" aria-label="${escapeHtml(item.name)} 실제 사진 보기">${item.icon}</button><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.habitat)} · ${escapeHtml(item.rarity)}</small>`;
      const thumb = $('.species-thumb', card);
      thumb.addEventListener('click', async (event) => {
        event.stopPropagation();
        thumb.classList.add('loading-photo');
        try {
          const photo = await window.OceanAI.nextSpeciesPhoto(item);
          thumb.innerHTML = `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(item.name)} 실제 사진">`;
          thumb.title = `${photo.credit || 'iNaturalist 관찰자'} · 살아있는 개체 관찰 사진 · 누르면 다른 사진`;
        } catch (_) {
          toast('실제 사진을 잠시 불러오지 못했어요.');
        } finally {
          thumb.classList.remove('loading-photo');
        }
      });
      const open = () => showSpeciesDetail(item);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
      grid.append(card);
    });
    while (grid.children.length < 3) {
      const locked = document.createElement('article');
      locked.className = 'locked';
      locked.innerHTML = '<i>?</i><b>미발견 생물</b><small>탐험 화면에서 포획하세요</small>';
      grid.append(locked);
    }
    $('#collectionCount').textContent = `${collected.length} / ${species.length}종 수집`;
  }

  async function showSpeciesDetail(item) {
    const dialog = openDialog(item.name, `${item.rarity} · AI 생태 해설`, `
      <div class="species-detail">
        <button class="species-photo photo-swap loading-photo" type="button" aria-label="${escapeHtml(item.name)} 실제 사진 바꾸기">${item.icon}</button>
        <a class="photo-credit hidden" target="_blank" rel="noopener noreferrer"></a>
        <h2>${escapeHtml(item.name)}</h2><em>${escapeHtml(item.latin || '')}</em>
        <div class="species-story"><p>AI가 실제 생태 정보를 탐색하고 있어요...</p></div>
        <div class="species-facts"><b>주요 서식지</b><br>${escapeHtml(item.habitat)}<br><br><b>안전한 관찰</b><br>${escapeHtml(item.guide)}</div>
      </div>`);
    const photoButton = $('.species-photo', dialog.body);
    const photoCredit = $('.photo-credit', dialog.body);
    const story = $('.species-story', dialog.body);
    const swapPhoto = async () => {
      photoButton.classList.add('loading-photo');
      try {
        const photo = await window.OceanAI.nextSpeciesPhoto(item);
        photoButton.innerHTML = `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(item.name)} 실제 사진">`;
        photoButton.title = '누르면 다른 실제 사진';
        photoCredit.href = photo.source;
        photoCredit.textContent = `사진: ${photo.credit || 'iNaturalist 관찰자'} · 살아있는 개체 관찰 기록`;
        photoCredit.classList.remove('hidden');
      } catch (_) {
        photoButton.textContent = item.icon;
      } finally {
        photoButton.classList.remove('loading-photo');
      }
    };
    photoButton.addEventListener('click', swapPhoto);
    swapPhoto();
    const fallbackLines = [
      item.facts,
      `${item.name}의 주요 관찰 지역은 ${item.habitat}입니다.`,
      `학명은 ${item.latin || '자료 확인 중'}이며, 생김새와 행동을 함께 살펴보면 종을 구별하기 쉬워요.`,
      item.guide,
      '야생 생물은 잡거나 먹이를 주지 말고 충분한 거리를 두어 관찰해야 해요.'
    ];
    try {
      const info = await window.OceanAI.request('species-info', {
        name: item.name,
        latin: item.latin,
        habitat: item.habitat
      });
      const lines = Array.isArray(info.lines) && info.lines.length >= 5 ? info.lines : fallbackLines;
      story.innerHTML = lines.slice(0, 7).map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    } catch (_) {
      story.innerHTML = fallbackLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    }
  }

  function openWasteDetail(item, captured = false, earnedXp = 0) {
    const lines = Array.isArray(item.impacts) ? item.impacts.slice(0, 7) : [];
    const dialog = openDialog(item.name, captured ? 'OCEAN CLEAN-UP SUCCESS' : 'MARINE LITTER GUIDE', `
      <div class="waste-detail">
        <button class="waste-photo photo-swap loading-photo" type="button" aria-label="${escapeHtml(item.name)} 실제 현장 사진 바꾸기">${escapeHtml(item.icon)}</button>
        <a class="photo-credit hidden" target="_blank" rel="noopener noreferrer"></a>
        ${captured ? `<span class="reward">정화 보상 +30 씨앗 · +${earnedXp} XP</span>` : ''}
        <h3>해양 환경에 미치는 영향</h3>
        <ol>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ol>
        <div class="species-facts"><b>안전한 수거</b><br>맨손으로 만지지 말고 집게와 장갑을 사용하세요. 날카롭거나 정체를 알 수 없는 물체는 보호자 또는 관리기관에 알려요.</div>
        <button class="dialog-primary waste-confirm" type="button">${captured ? '정화 완료' : '확인'}</button>
      </div>`);
    const photoButton = $('.waste-photo', dialog.body);
    const photoCredit = $('.photo-credit', dialog.body);
    const swapPhoto = async () => {
      photoButton.classList.add('loading-photo');
      try {
        const photo = await window.OceanAI.nextWastePhoto(item);
        photoButton.innerHTML = `<img src="${escapeHtml(photo.url)}" alt="바다에서 발견된 ${escapeHtml(item.name)} 실제 사진">`;
        photoButton.title = '누르면 다른 실제 현장 사진';
        photoCredit.href = photo.source;
        photoCredit.textContent = `사진: ${photo.credit || 'Wikimedia Commons'}${photo.license ? ` · ${photo.license}` : ''} · 원본 보기`;
        photoCredit.classList.remove('hidden');
      } catch (_) {
        photoButton.textContent = item.icon;
        photoButton.title = '사진을 불러오지 못했어요. 다시 눌러보세요.';
      } finally {
        photoButton.classList.remove('loading-photo');
      }
    };
    photoButton.addEventListener('click', swapPhoto);
    swapPhoto();
    $('.waste-confirm', dialog.body).addEventListener('click', dialog.close);
  }

  function showAllSpecies() {
    const cards = species.map((item) => {
      const caught = state.collection.has(item.id);
      return `<article class="profile-row catalog-row">
        <span>${item.icon}</span>
        <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.habitat)} · ${escapeHtml(item.rarity)} · ${caught ? '도감 등록' : '미발견'}</small></div>
        <button type="button" data-species-detail="${escapeHtml(item.id)}">AI 탐색</button>
      </article>`;
    }).join('');
    const dialog = openDialog('부산 해안 생물 100종', `${state.collection.size} / ${species.length}종 발견 · 모든 종 AI 탐색 가능`, `<div class="profile-list catalog-list">${cards}</div>`);
    $$('[data-species-detail]', dialog.body).forEach((button) => button.addEventListener('click', () => {
      const item = species.find((candidate) => candidate.id === button.dataset.speciesDetail);
      if (item) showSpeciesDetail(item);
    }));
  }

  function showWasteCatalog() {
    const cards = marineWastes.map((item) => `
      <article class="profile-row catalog-row waste-catalog-row">
        <span>${item.icon}</span>
        <div><b>${escapeHtml(item.name)}</b><small>현실의 해안에서 자주 발견되는 해양 쓰레기 · 영향 설명 ${item.impacts.length}줄</small></div>
        <button type="button" data-waste-detail="${escapeHtml(item.id)}">영향 보기</button>
      </article>`).join('');
    const dialog = openDialog('해양 쓰레기 7종', 'MARINE LITTER ENCYCLOPEDIA', `<div class="dialog-note">탐험 화면에서 쓰레기를 포획하면 정화 XP와 씨앗을 받을 수 있어요.</div><div class="profile-list catalog-list">${cards}</div>`);
    $$('[data-waste-detail]', dialog.body).forEach((button) => button.addEventListener('click', () => {
      const item = marineWastes.find((candidate) => candidate.id === button.dataset.wasteDetail);
      if (item) openWasteDetail(item);
    }));
  }

  function requireLogin(action = '이 기능') {
    if (state.user) return true;
    toast(`${action}을 사용하려면 Google 로그인이 필요해요.`);
    window.OceanCloud?.signIn();
    return false;
  }

  function profileMarkup(profile, own = false) {
    return `
      <section class="user-profile-card">
        <div class="profile-avatar">${avatarMarkup(profile, `${profile.nickname || '탐험가'}의 프로필 사진`)}</div>
        <h2>${escapeHtml(profile.nickname || profile.displayName || '바다 탐험가')}</h2>
        <span>${profile.online ? '● 온라인' : '○ 오프라인'}</span>
        <dl>
          <div><dt>거주지</dt><dd>${escapeHtml(profile.residence || profile.location || '미등록')}</dd></div>
          <div><dt>나이</dt><dd>${profile.age ? `${Number(profile.age)}세` : '미등록'}</dd></div>
          <div class="profile-bio"><dt>소개</dt><dd>${escapeHtml(profile.bio || '아직 소개가 없어요.')}</dd></div>
        </dl>
        ${own ? '<button class="dialog-primary edit-my-profile" type="button">프로필 수정</button><button class="profile-logout" type="button">로그아웃</button>' : ''}
      </section>`;
  }

  async function openProfileEditor(profile = null, required = false) {
    if (!requireLogin('프로필 등록')) return;
    const current = profile || await window.OceanCloud.getMyProfile().catch(() => ({}));
    const avatarIcons = ['🌊', '⚓', '🐬', '🐢', '🐳', '🦀', '🐙', '🪼', '🏄', '⛵'];
    let selectedAvatar = current.avatar || '🌊';
    let selectedAvatarImage = safeAvatarImage(current.avatarImage);
    const dialog = openDialog(required ? '프로필을 완성해 주세요' : '내 프로필 수정', required ? 'WELCOME, OCEAN EXPLORER' : 'MY PROFILE', `
      <div class="dialog-note">${required ? '닉네임, 거주지, 나이와 소개를 등록하면 다른 탐험가들과 소통할 수 있어요.' : '수정한 정보는 Firebase에 저장되고 다른 로그인 사용자에게 공개됩니다.'}</div>
      <form class="dialog-form profile-form" id="profileForm">
        <section class="avatar-editor" aria-labelledby="avatarEditorTitle">
          <div id="profileAvatarPreview" class="avatar-preview">${avatarMarkup(current, '선택한 프로필 사진')}</div>
          <div>
            <b id="avatarEditorTitle">프로필 사진</b>
            <small>아이콘을 고르거나 내 사진을 등록하세요.</small>
          </div>
          <div class="avatar-options">
            ${avatarIcons.map((icon) => `<button class="${!selectedAvatarImage && icon === selectedAvatar ? 'selected' : ''}" type="button" data-avatar-icon="${icon}" aria-label="${icon} 아이콘 선택">${icon}</button>`).join('')}
          </div>
          <div class="avatar-upload-actions">
            <label for="profileCameraInput">📷 사진 찍기</label>
            <label for="profileGalleryInput">🖼️ 보관함 선택</label>
          </div>
          <input id="profileCameraInput" type="file" accept="image/*" capture="user" hidden>
          <input id="profileGalleryInput" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          <p id="avatarUploadStatus" class="avatar-upload-status" role="status"></p>
        </section>
        <label>닉네임<input id="profileNickname" maxlength="24" minlength="2" required value="${escapeHtml(current.nickname || current.displayName || '')}" placeholder="예: 광안리돌고래"></label>
        <label>거주지<input id="profileResidence" maxlength="40" required value="${escapeHtml(current.residence || current.location || '')}" placeholder="예: 부산광역시 수영구"></label>
        <label>나이<input id="profileAge" type="number" min="1" max="120" required value="${current.age ? Number(current.age) : ''}" placeholder="나이"></label>
        <label>기타 설명<textarea id="profileBio" maxlength="300" placeholder="좋아하는 해양 활동이나 나를 소개해 주세요.">${escapeHtml(current.bio || '')}</textarea></label>
        <button class="dialog-primary" type="submit">프로필 저장하기</button>
      </form>`);
    const preview = $('#profileAvatarPreview', dialog.body);
    const status = $('#avatarUploadStatus', dialog.body);
    const renderAvatarPreview = () => {
      preview.innerHTML = selectedAvatarImage
        ? `<img src="${escapeHtml(selectedAvatarImage)}" alt="선택한 프로필 사진">`
        : `<span aria-hidden="true">${escapeHtml(selectedAvatar)}</span>`;
      $$('[data-avatar-icon]', dialog.body).forEach((button) => {
        button.classList.toggle('selected', !selectedAvatarImage && button.dataset.avatarIcon === selectedAvatar);
      });
    };
    $$('[data-avatar-icon]', dialog.body).forEach((button) => button.addEventListener('click', () => {
      selectedAvatar = button.dataset.avatarIcon;
      selectedAvatarImage = '';
      status.textContent = '아이콘을 프로필 사진으로 선택했어요.';
      renderAvatarPreview();
    }));
    const handleProfilePhoto = async (file) => {
      if (!file) return;
      status.textContent = '사진을 프로필 크기에 맞게 준비하고 있어요...';
      try {
        selectedAvatarImage = await compressProfileImage(file);
        status.textContent = '사진이 준비됐어요. 저장 버튼을 눌러 완료하세요.';
        renderAvatarPreview();
      } catch (error) {
        status.textContent = error.message || '사진을 준비하지 못했어요.';
      }
    };
    $('#profileCameraInput', dialog.body).addEventListener('change', (event) => handleProfilePhoto(event.target.files?.[0]));
    $('#profileGalleryInput', dialog.body).addEventListener('change', (event) => handleProfilePhoto(event.target.files?.[0]));
    $('#profileForm', dialog.body).addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = $('button[type="submit"]', event.currentTarget);
      button.disabled = true;
      try {
        const saved = await window.OceanCloud.saveProfile({
          nickname: $('#profileNickname', dialog.body).value,
          residence: $('#profileResidence', dialog.body).value,
          age: $('#profileAge', dialog.body).value,
          bio: $('#profileBio', dialog.body).value,
          avatar: selectedAvatar,
          avatarImage: selectedAvatarImage
        });
        state.user.displayName = saved.nickname;
        state.user.profile = saved;
        updateAuthUI(state.user);
        dialog.close();
        toast('프로필이 Firebase에 저장되었어요.');
      } catch (error) {
        button.disabled = false;
        toast(error.message || '프로필을 저장하지 못했어요.');
      }
    });
  }

  async function showUserProfile(uid) {
    if (!requireLogin('프로필 보기')) return;
    try {
      const profile = await window.OceanCloud.getProfile(uid);
      const own = uid === state.user.uid;
      const dialog = openDialog(profile.nickname || profile.displayName || '바다 탐험가', 'OCEAN EXPLORER PROFILE', profileMarkup(profile, own));
      if (own) {
        $('.edit-my-profile', dialog.body).addEventListener('click', () => {
          dialog.close();
          openProfileEditor(profile);
        });
        $('.profile-logout', dialog.body).addEventListener('click', () => {
          dialog.close();
          window.OceanCloud.signOut();
        });
      }
    } catch (error) {
      toast(error.message || '프로필을 불러오지 못했어요.');
    }
  }

  function startNotifications() {
    if (!state.user || state.notificationUnsubscribe) return;
    state.notificationUnsubscribe = window.OceanCloud.subscribeNotifications((notifications) => {
      const previous = new Set(state.notifications.map((item) => item.id));
      state.notifications = notifications;
      const unread = notifications.filter((item) => !item.read);
      $('#notificationBadge').textContent = unread.length > 99 ? '99+' : unread.length;
      $('#notificationBadge').classList.toggle('hidden', !unread.length);
      if (state.notificationsReady) {
        const fresh = unread.find((item) => !previous.has(item.id));
        if (fresh) toast(`🔔 ${fresh.actorName || '바다 탐험가'}님: ${fresh.text}`);
      }
      state.notificationsReady = true;
    }, () => toast('알림을 불러오지 못했어요.'));
  }

  async function openNotifications() {
    if (!requireLogin('알림')) return;
    const items = state.notifications;
    const body = items.length ? items.map((item) => `
      <button class="notification-row ${item.read ? '' : 'unread'}" type="button" data-notification="${escapeHtml(item.id)}" data-notification-type="${escapeHtml(item.type || '')}">
        <span>${avatarMarkup({ avatar: item.actorAvatar, avatarImage: item.actorAvatarImage }, `${item.actorName || '탐험가'}의 프로필 사진`)}</span>
        <div><b>${escapeHtml(item.actorName || '바다 탐험가')}</b><p>${escapeHtml(item.text || '새 알림이 도착했어요.')}</p><small>${escapeHtml(item.timeLabel || '방금 전')}</small></div>
      </button>`).join('') : '<div class="dialog-note">아직 도착한 알림이 없어요.</div>';
    const dialog = openDialog('알림', `${items.filter((item) => !item.read).length}개의 읽지 않은 알림`, `<div class="notification-list">${body}</div>`);
    $$('[data-notification]', dialog.body).forEach((button) => button.addEventListener('click', () => {
      const type = button.dataset.notificationType;
      dialog.close();
      if (type === 'friend_request' || type === 'friend_accept') openFriends();
      if (type === 'message') openChat();
      if (type === 'comment') showTab('community');
    }));
    const unreadIds = items.filter((item) => !item.read).map((item) => item.id);
    if (unreadIds.length) {
      await window.OceanCloud.markNotificationsRead(unreadIds).catch(() => {});
    }
  }

  async function openFriends() {
    if (!requireLogin('친구 추가')) return;
    const dialog = openDialog('주변 바다 탐험가', 'FRIENDS NEAR BUSAN', '<div class="dialog-note">부산 바다를 함께 탐험할 실제 가입 사용자가 여기에 표시됩니다.</div><div class="profile-list" id="profileList"><p>친구 목록을 불러오는 중...</p></div>');
    try {
      const people = await window.OceanCloud.getPeople();
      state.profiles = people;
      const list = $('#profileList', dialog.body);
      if (!people.length) {
        list.innerHTML = '<div class="dialog-note">아직 주변에 다른 탐험가가 없어요. 친구가 가입하면 이곳에서 요청을 보낼 수 있어요.</div>';
        return;
      }
      list.innerHTML = people.map((person) => {
        const labels = { none: '친구 요청', sent: '요청 보냄', received: '요청 수락', friends: '친구 삭제' };
        return `<article class="profile-row">
          <button class="profile-link" type="button" data-profile="${escapeHtml(person.uid)}"><span>${avatarMarkup(person, `${person.nickname || '탐험가'}의 프로필 사진`)}</span><div><b>${escapeHtml(person.nickname || person.displayName || '바다 탐험가')}</b><small>${escapeHtml(person.residence || person.location || '부산')} · ${person.age ? `${Number(person.age)}세 · ` : ''}${person.online ? '● 온라인' : '○ 오프라인'}</small></div></button>
          <button type="button" data-person="${escapeHtml(person.uid)}" data-relation="${person.relation}" ${person.relation === 'sent' ? 'disabled' : ''}>${labels[person.relation] || labels.none}</button>
        </article>`;
      }).join('');
      $$('[data-profile]', list).forEach((button) => button.addEventListener('click', () => showUserProfile(button.dataset.profile)));
      $$('[data-person]', list).forEach((button) => button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          if (button.dataset.relation === 'friends') {
            if (!window.confirm('이 사용자를 친구에서 삭제할까요?')) {
              button.disabled = false;
              return;
            }
            await window.OceanCloud.removeFriend(button.dataset.person);
            button.dataset.relation = 'none';
            button.textContent = '친구 요청';
            button.disabled = false;
            toast('친구 목록에서 삭제했어요.');
          } else if (button.dataset.relation === 'received') {
            await window.OceanCloud.acceptFriend(button.dataset.person);
            button.dataset.relation = 'friends';
            button.textContent = '친구 삭제';
            button.disabled = false;
            toast('친구가 되었어요! 이제 채팅할 수 있어요.');
          } else {
            await window.OceanCloud.sendFriendRequest(button.dataset.person);
            button.textContent = '요청 보냄';
            toast('친구 요청을 보냈어요.');
          }
        } catch (_) {
          button.disabled = false;
          toast('친구 요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
      }));
    } catch (_) {
      $('#profileList', dialog.body).innerHTML = '<div class="dialog-note">목록을 불러오지 못했어요. Firebase 연결 상태를 확인해 주세요.</div>';
    }
  }

  async function openChat() {
    if (!requireLogin('채팅')) return;
    const dialog = openDialog('바다 친구 채팅', 'REAL-TIME MESSAGES', `
      <div class="chat-layout">
        <aside class="chat-people" id="chatPeople"><span class="chat-person">친구를 불러오는 중...</span></aside>
        <section class="chat-main">
          <div class="chat-header" id="chatHeader">대화할 친구를 선택하세요</div>
          <div class="messages" id="messages"><div class="dialog-note">친구 추가에서 요청을 수락하면 메시지를 보낼 수 있어요.</div></div>
          <form class="chat-compose" id="chatForm"><input id="chatInput" maxlength="500" autocomplete="off" placeholder="메시지 입력" aria-label="메시지"><button type="submit">전송</button></form>
        </section>
      </div>`, 'chat-dialog');
    const friends = await window.OceanCloud.getFriends().catch(() => []);
    dialog.addCleanup(() => {
      if (state.chatUnsubscribe) {
        state.chatUnsubscribe();
        state.chatUnsubscribe = null;
      }
    });
    const people = $('#chatPeople', dialog.body);
    if (!friends.length) {
      people.innerHTML = '<button class="chat-person" type="button">친구 없음</button>';
      return;
    }
    people.innerHTML = friends.map((friend) => `<button class="chat-person" type="button" data-chat-user="${escapeHtml(friend.uid)}">${friend.online ? '🟢' : '⚪'} ${escapeHtml(friend.nickname || friend.displayName || '바다 친구')}</button>`).join('');
    let activeFriend = null;
    $$('[data-chat-user]', people).forEach((button) => button.addEventListener('click', () => {
      $$('[data-chat-user]', people).forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      activeFriend = friends.find((item) => item.uid === button.dataset.chatUser);
      $('#chatHeader', dialog.body).textContent = `${activeFriend.nickname || activeFriend.displayName || '바다 친구'}님과의 대화`;
      if (state.chatUnsubscribe) state.chatUnsubscribe();
      state.chatUnsubscribe = window.OceanCloud.subscribeMessages(activeFriend.uid, (messages) => {
        const container = $('#messages', dialog.body);
        container.innerHTML = messages.length ? messages.map((message) => `<div class="message ${message.senderId === state.user.uid ? 'mine' : ''}">${escapeHtml(message.text)}</div>`).join('') : '<div class="dialog-note">첫 메시지를 보내 바다 이야기를 시작해 보세요.</div>';
        container.scrollTop = container.scrollHeight;
      });
    }));
    $('#chatForm', dialog.body).addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = $('#chatInput', dialog.body);
      const text = input.value.trim();
      if (!activeFriend) return toast('먼저 대화할 친구를 선택해 주세요.');
      if (!text) return;
      input.value = '';
      try { await window.OceanCloud.sendMessage(activeFriend.uid, text); }
      catch (_) { input.value = text; toast('메시지를 보내지 못했어요.'); }
    });
  }

  function openPostComposer() {
    if (!requireLogin('게시물 작성')) return;
    const dialog = openDialog('새 게시물', 'SHARE YOUR BUSAN OCEAN', `
      <form class="dialog-form" id="postForm">
        <input id="postTitle" maxlength="80" required placeholder="제목">
        <input id="postLocation" maxlength="30" value="광안리" required placeholder="부산의 장소">
        <textarea id="postBody" maxlength="1000" required placeholder="오늘의 바다 활동과 함께할 사람들에게 전할 내용을 적어주세요."></textarea>
        <button class="dialog-primary" type="submit">게시물 올리기</button>
      </form>`);
    $('#postForm', dialog.body).addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = $('button[type="submit"]', event.currentTarget);
      button.disabled = true;
      try {
        await window.OceanCloud.createPost({
          title: $('#postTitle', dialog.body).value.trim(),
          location: $('#postLocation', dialog.body).value.trim(),
          body: $('#postBody', dialog.body).value.trim()
        });
        dialog.close();
        toast('게시물이 부산 바다 피드에 올라갔어요!');
      } catch (_) {
        button.disabled = false;
        toast('게시물을 저장하지 못했어요. Firebase 연결을 확인해 주세요.');
      }
    });
  }

  function openComments(post) {
    if (!requireLogin('댓글')) return;
    const dialog = openDialog(`댓글 · ${post.title}`, 'BUSAN OCEAN TALK', `
      <div class="comment-list" id="commentList"><div class="dialog-note">댓글을 불러오는 중...</div></div>
      <form class="comment-form" id="commentForm">
        <input id="commentInput" maxlength="400" required autocomplete="off" placeholder="따뜻한 댓글을 남겨 주세요." aria-label="댓글">
        <button type="submit">등록</button>
      </form>`);
    const commentsUnsubscribe = window.OceanCloud.subscribeComments(post.id, (comments) => {
      const list = $('#commentList', dialog.body);
      list.innerHTML = comments.length ? comments.map((comment) => {
        const canDelete = comment.authorId === state.user.uid || post.authorId === state.user.uid;
        return `<article class="comment-row">
          <button class="comment-author profile-link" type="button" data-comment-profile="${escapeHtml(comment.authorId)}">
            <span>${avatarMarkup(comment, `${comment.authorName || '탐험가'}의 프로필 사진`)}</span>
            <div><b>${escapeHtml(comment.authorName || '바다 탐험가')}</b><small>${escapeHtml(comment.timeLabel || '방금 전')}</small></div>
          </button>
          <p>${escapeHtml(comment.text)}</p>
          ${canDelete ? `<button class="comment-delete" type="button" data-comment-delete="${escapeHtml(comment.id)}">삭제</button>` : ''}
        </article>`;
      }).join('') : '<div class="dialog-note">첫 댓글을 남겨 대화를 시작해 보세요.</div>';
      $$('[data-comment-profile]', list).forEach((button) => button.addEventListener('click', () => showUserProfile(button.dataset.commentProfile)));
      $$('[data-comment-delete]', list).forEach((button) => button.addEventListener('click', async () => {
        if (!window.confirm('이 댓글을 삭제할까요?')) return;
        button.disabled = true;
        try {
          await window.OceanCloud.deleteComment(post.id, button.dataset.commentDelete);
          toast('댓글을 삭제했어요.');
        } catch (error) {
          button.disabled = false;
          toast(error.message || '댓글을 삭제하지 못했어요.');
        }
      }));
    }, () => {
      $('#commentList', dialog.body).innerHTML = '<div class="dialog-note">댓글을 불러오지 못했어요.</div>';
    });
    state.commentsUnsubscribe = commentsUnsubscribe;
    dialog.addCleanup(() => {
      commentsUnsubscribe();
      if (state.commentsUnsubscribe === commentsUnsubscribe) state.commentsUnsubscribe = null;
    });
    $('#commentForm', dialog.body).addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = $('#commentInput', dialog.body);
      const button = $('button', event.currentTarget);
      const text = input.value.trim();
      if (!text) return;
      button.disabled = true;
      input.value = '';
      try {
        await window.OceanCloud.addComment(post.id, text);
      } catch (error) {
        input.value = text;
        toast(error.message || '댓글을 등록하지 못했어요.');
      } finally {
        button.disabled = false;
      }
    });
  }

  function renderPosts(posts) {
    state.posts = posts;
    const list = $('#postsList');
    if (!posts.length) {
      list.innerHTML = '<div class="auth-banner"><div><span>🌊</span><p><b>첫 번째 이야기를 기다려요</b><small>부산 바다에서의 모험을 공유해 보세요.</small></p></div></div>';
      return;
    }
    list.innerHTML = posts.map((post) => `
      <article class="post">
        <button class="post-user profile-link" type="button" data-post-profile="${escapeHtml(post.authorId)}"><span>${avatarMarkup(post, `${post.authorName || '탐험가'}의 프로필 사진`)}</span><div><b>${escapeHtml(post.authorName || '바다 탐험가')}</b><small>${escapeHtml(post.location || '부산')} · ${escapeHtml(post.timeLabel || '최근')}</small></div></button>
        <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body)}</p>
        <div class="post-meta"><span>📍 ${escapeHtml(post.location || '부산')}</span><b>부산 바다 피드</b></div>
        <div class="post-tools">
          <button type="button" data-post-comments="${escapeHtml(post.id)}">💬 댓글 보기·쓰기</button>
          ${post.authorId === state.user?.uid ? `<button class="post-delete" type="button" data-post-delete="${escapeHtml(post.id)}">게시물 삭제</button>` : ''}
        </div>
      </article>`).join('');
    $$('[data-post-profile]', list).forEach((button) => button.addEventListener('click', () => showUserProfile(button.dataset.postProfile)));
    $$('[data-post-comments]', list).forEach((button) => button.addEventListener('click', () => {
      const post = state.posts.find((item) => item.id === button.dataset.postComments);
      if (post) openComments(post);
    }));
    $$('[data-post-delete]', list).forEach((button) => button.addEventListener('click', async () => {
      if (!window.confirm('이 게시물과 댓글을 삭제할까요? 삭제 후 되돌릴 수 없어요.')) return;
      button.disabled = true;
      try {
        await window.OceanCloud.deletePost(button.dataset.postDelete);
        toast('게시물을 삭제했어요.');
      } catch (error) {
        button.disabled = false;
        toast(error.message || '게시물을 삭제하지 못했어요.');
      }
    }));
  }

  function loadCommunity() {
    if (!state.user || !window.OceanCloud) return;
    if (state.postsUnsubscribe) return;
    state.postsUnsubscribe = window.OceanCloud.subscribePosts(renderPosts, () => toast('게시물을 불러오지 못했어요.'));
  }

  function updateAuthUI(user) {
    state.user = user;
    const connected = Boolean(user);
    const online = connected && navigator.onLine && document.visibilityState === 'visible';
    $('#cloudState').textContent = connected ? (online ? '온라인' : '오프라인') : '체험 모드';
    $('#cloudState').classList.toggle('online', online);
    $('#authButton').innerHTML = connected ? avatarMarkup(user.profile || user, '내 프로필 사진') : '<span aria-hidden="true">👤</span>';
    $('#authButton').title = connected ? '내 프로필' : 'Google 로그인';
    $('#authBanner').classList.toggle('connected', connected);
    $('#communityLoginButton').textContent = connected ? `${user.displayName || '탐험가'} · 로그인됨` : 'Google 로그인';
    if (!connected && state.postsUnsubscribe) {
      state.postsUnsubscribe();
      state.postsUnsubscribe = null;
    }
    if (!connected && state.notificationUnsubscribe) {
      state.notificationUnsubscribe();
      state.notificationUnsubscribe = null;
      state.notifications = [];
      state.notificationsReady = false;
      $('#notificationBadge').classList.add('hidden');
    }
    if (connected) startNotifications();
    if (connected && $('#community').classList.contains('active')) loadCommunity();
  }

  function applyCloudProgress(detail) {
    const progress = detail?.progress || {};
    state.level = Math.max(1, Number(progress.level) || 1);
    state.xp = Math.max(0, Math.min(XP_GOAL - 1, Number(progress.xp) || 0));
    state.points = Math.max(0, Number(progress.points) || 0);
    state.trash = Math.max(0, Math.min(TRASH_GOAL, Number(progress.trash) || 0));
    applyDifficulty(progress.difficulty || 'beginner', false);
    state.collection.clear();
    (detail?.species || []).forEach((saved) => {
      const full = species.find((item) => item.id === saved.id) || saved;
      if (full?.id) state.collection.set(full.id, full);
    });
    $('#missionCount').textContent = `${state.trash}/${TRASH_GOAL}`;
    renderProgress();
    renderCollection();
  }

  function weatherIcon(code) {
    if ([0, 1].includes(code)) return '☀️';
    if ([2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
  }

  async function personalizeByLocation() {
    try {
      const position = await window.OceanAI.getPosition();
      state.location = position;
      const coordinateLabel = `${position.latitude.toFixed(3)}, ${position.longitude.toFixed(3)}`;
      $('.arena-copy>span').textContent = `📍 내 위치 · ${coordinateLabel}`;
      const [weather, local] = await Promise.all([
        window.OceanAI.getWeather(position),
        window.OceanAI.request('local-species', {
          latitude: position.latitude,
          longitude: position.longitude,
          candidates: species.map(({ id, name, latin }) => ({ id, name, latin }))
        }).catch(() => null)
      ]);
      const localIds = Array.isArray(local?.ids) ? local.ids : [];
      const matched = species.filter((item) => localIds.includes(item.id));
      if (matched.length >= 4) state.spawnSpecies = matched;
      const wave = Number(weather.wave_height);
      const seaTemperature = Number(weather.sea_surface_temperature);
      const safe = (!Number.isFinite(wave) || wave < 1.2) && Number(weather.wind_speed_10m || 0) < 30;
      $('#weatherIcon').textContent = weatherIcon(Number(weather.weather_code));
      $('#weatherTitle').textContent = `내 위치 ${coordinateLabel} 날씨`;
      $('#weatherDetail').textContent = [
        `기온 ${Math.round(weather.temperature_2m)}°`,
        Number.isFinite(seaTemperature) ? `수온 ${seaTemperature.toFixed(1)}°` : null,
        Number.isFinite(wave) ? `파고 ${wave.toFixed(1)}m` : null,
        `바람 ${Math.round(weather.wind_speed_10m || 0)}km/h`
      ].filter(Boolean).join(' · ');
      $('#weatherSafety').textContent = safe ? '좋음' : '주의';
      $('#weatherSafety').classList.toggle('caution', !safe);
      $('#arenaStatus').textContent = `현재 위치에서 자주 관찰되는 ${state.spawnSpecies.length}종을 찾는 중이에요.`;
    } catch (error) {
      $('#weatherTitle').textContent = '부산 바다 기본 날씨';
      $('#weatherDetail').textContent = error.message || '위치 권한을 허용하면 실제 날씨를 표시해요.';
      $('#weatherSafety').textContent = '권한 필요';
    }
  }

  function bindQuiz(quiz) {
    const choices = Array.isArray(quiz?.choices) && quiz.choices.length >= 3
      ? quiz.choices.slice(0, 4)
      : ['약 5년', '약 50년', '약 200년 이상'];
    const correctIndex = Number.isInteger(quiz?.correctIndex) ? quiz.correctIndex : 2;
    $('#quizQuestion').textContent = quiz?.question || '플라스틱 빨대가 바다에서 완전히 분해되는 데 걸리는 시간은?';
    $('#answers').innerHTML = choices.map((choice, index) => `<button type="button" ${index === correctIndex ? 'data-correct' : ''}>${escapeHtml(choice)}</button>`).join('');
    $('#quizFeedback').textContent = '정답을 골라 바다 지식을 채워보세요!';
    state.quizDone = false;
    $$('#answers button').forEach((button) => button.addEventListener('click', () => {
      if (state.quizDone) return;
      state.quizDone = true;
      if (button.hasAttribute('data-correct')) {
        button.classList.add('correct');
        $('#quizFeedback').textContent = quiz?.explanation || '정답이에요! 작은 실천이 바다 생태계를 지켜요.';
        gain(30, 30, '정답이에요! +30 XP');
      } else {
        button.classList.add('wrong');
        const answer = choices[correctIndex] || '정답 보기';
        $('#quizFeedback').textContent = `아쉬워요. 정답은 “${answer}”예요. ${quiz?.explanation || ''}`;
      }
    }));
  }

  async function loadAiQuiz() {
    const fallback = {
      question: '플라스틱 빨대가 바다에서 완전히 분해되는 데 걸리는 시간은?',
      choices: ['약 5년', '약 50년', '약 200년 이상'],
      correctIndex: 2,
      explanation: '플라스틱은 잘 사라지지 않고 더 작은 미세플라스틱으로 남을 수 있어요.'
    };
    const fallbacks = [
      fallback,
      { question: '바다거북이 비닐을 먹이로 착각하는 가장 큰 이유는?', choices: ['해파리와 모양이 비슷해서', '소리가 나서', '빛이 나서'], correctIndex: 0, explanation: '물속에서 떠다니는 비닐은 해파리처럼 보여 바다거북에게 위험해요.' },
      { question: '조간대 생물을 관찰한 뒤 가장 올바른 행동은?', choices: ['집으로 가져간다', '원래 있던 자리에 둔다', '먹이를 준다'], correctIndex: 1, explanation: '생물이 살던 돌과 물의 위치를 그대로 지켜주는 것이 가장 좋아요.' }
    ];
    try {
      const quiz = await window.OceanAI.request('quiz', {
        nonce: `${Date.now()}-${Math.random()}`,
        location: state.location || { name: '부산' }
      });
      const content = `${quiz?.question || ''} ${(quiz?.choices || []).join(' ')}`;
      if (!Array.isArray(quiz?.choices) || quiz.choices.length < 3 ||
          !Number.isInteger(quiz.correctIndex) || quiz.correctIndex < 0 ||
          quiz.correctIndex >= quiz.choices.length ||
          /불꽃축제|지역 축제|세계 최초|정확한 개최/.test(content)) {
        throw new Error('교육 검증 기준을 통과하지 못한 문제');
      }
      bindQuiz(quiz);
    } catch (_) {
      bindQuiz(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
  }

  $('#sailButton').addEventListener('click', () => {
    $('#startScreen').classList.add('hidden');
    $('#playScreen').classList.remove('hidden');
    setTimeout(() => {
      spawnCreature();
      spawnCreature();
      updateTargets();
    }, 350);
    personalizeByLocation();
  });
  $$('[data-tab]').forEach((button) => button.addEventListener('click', () => showTab(button.dataset.tab)));
  $('#captureButton').addEventListener('click', captureCreature);
  $('#showAllSpecies').addEventListener('click', showAllSpecies);
  $('#showWasteCatalog').addEventListener('click', showWasteCatalog);
  $('#difficultySelect').addEventListener('change', (event) => {
    applyDifficulty(event.target.value);
    const settings = difficultySettings();
    toast(`${settings.name} 난이도로 변경했어요.`);
    for (let index = state.creatures.size; index < settings.maxEntities; index += 1) spawnCreature();
  });
  $('#friendButton').addEventListener('click', openFriends);
  $('#openChatButton').addEventListener('click', openChat);
  $('#newPostButton').addEventListener('click', openPostComposer);
  $('#refreshPosts').addEventListener('click', () => {
    if (state.postsUnsubscribe) state.postsUnsubscribe();
    state.postsUnsubscribe = null;
    loadCommunity();
    toast('부산 바다 피드를 새로 불러왔어요.');
  });
  $('#authButton').addEventListener('click', () => state.user ? showUserProfile(state.user.uid) : window.OceanCloud?.signIn());
  $('#notificationButton').addEventListener('click', openNotifications);
  $('#communityLoginButton').addEventListener('click', () => state.user ? showUserProfile(state.user.uid) : window.OceanCloud?.signIn());

  $('#trashFile').addEventListener('change', async (event) => {
    if (!event.target.files?.[0]) return;
    if (state.trash >= TRASH_GOAL) {
      toast('오늘의 쓰레기 줍기 미션을 이미 완료했어요!');
      event.target.value = '';
      return;
    }
    const label = $('.trash-proof');
    const original = label.textContent;
    label.textContent = '🤖 AI가 쓰레기인지 판독 중...';
    label.classList.add('checking');
    try {
      const photo = await window.OceanAI.prepareImage(event.target.files[0]);
      const result = await window.OceanAI.request('trash', {
        image: photo.data,
        mimeType: photo.mimeType
      });
      if (!result.isTrash || Number(result.confidence || 0) < 55) {
        toast(result.reason || '쓰레기로 확인되지 않아 수치가 올라가지 않았어요.');
        return;
      }
      state.trash = Math.min(TRASH_GOAL, state.trash + 1);
      $('#missionCount').textContent = `${state.trash}/${TRASH_GOAL}`;
      gain(50, 35, `${result.item || '쓰레기'} 인증 완료! +50 씨앗 · +35 XP (${state.trash}/${TRASH_GOAL})`);
      if (state.trash === TRASH_GOAL) setTimeout(() => gain(150, 100, '해변 정화 미션 완료! 보너스 +100 XP'), 500);
    } catch (error) {
      toast(error.message || 'AI 판독에 실패해 점수를 지급하지 않았어요.');
    } finally {
      label.textContent = original;
      label.classList.remove('checking');
      event.target.value = '';
    }
  });

  window.addEventListener('ocean-auth', (event) => updateAuthUI(event.detail?.user || null));
  window.addEventListener('ocean-presence', (event) => {
    if (!state.user) return;
    const online = Boolean(event.detail?.online);
    $('#cloudState').textContent = online ? '온라인' : '오프라인';
    $('#cloudState').classList.toggle('online', online);
  });
  window.addEventListener('ocean-profile-required', (event) => openProfileEditor(event.detail?.profile || null, true));
  window.addEventListener('ocean-progress-loaded', (event) => applyCloudProgress(event.detail));
  window.addEventListener('ocean-cloud-error', (event) => toast(event.detail?.message || 'Firebase 연결을 확인해 주세요.'));
  window.addEventListener('resize', updateTargets);
  setInterval(spawnCreature, 1200);
  setInterval(renderBuffState, 1000);
  applyDifficulty('beginner', false);
  renderProgress();
  renderCollection();
  loadAiQuiz();
})();
