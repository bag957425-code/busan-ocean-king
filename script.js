(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const XP_GOAL = 300;

  const species = [
    { id: 'mackerel', name: '고등어', icon: '🐟', rarity: '흔함', habitat: '부산 연안과 외해', facts: '고등어는 부산을 대표하는 회유성 어류예요. 빠르게 헤엄치며 플랑크톤과 작은 물고기를 먹고 무리를 지어 이동해요.', guide: '아가미가 아니라 물속의 산소를 이용하며, 부산공동어시장은 전국 고등어 유통의 중심지로 알려져 있어요.' },
    { id: 'rock-bream', name: '돌돔', icon: '🐠', rarity: '보통', habitat: '태종대·오륙도 암초', facts: '돌돔은 단단한 이빨로 성게와 조개껍데기를 깨 먹어요. 어린 개체는 검은 줄무늬가 선명해요.', guide: '암초 생태계의 먹이 관계를 보여주는 중요한 물고기예요.' },
    { id: 'seahorse', name: '해마', icon: '🦄', rarity: '희귀', habitat: '해조류 숲', facts: '해마는 꼬리로 해조류를 붙잡고 생활하며 수컷이 알을 품는 특별한 물고기예요.', guide: '해조류 숲이 사라지면 살 곳도 함께 줄어들기 때문에 서식지 보호가 중요해요.' },
    { id: 'octopus', name: '참문어', icon: '🐙', rarity: '보통', habitat: '기장·영도 바위틈', facts: '참문어는 주변 환경에 맞춰 몸의 색과 무늬를 바꿀 수 있고, 빨판으로 먹이를 감지해요.', guide: '지능이 높은 무척추동물로 도구를 사용하거나 미로를 학습하기도 해요.' },
    { id: 'starfish', name: '별불가사리', icon: '⭐', rarity: '흔함', habitat: '다대포 조간대', facts: '불가사리는 극피동물이며 관족이라는 작은 발로 천천히 움직여요.', guide: '관찰 후에는 원래 있던 자리에 두고, 햇빛 아래 오래 꺼내놓지 마세요.' },
    { id: 'sea-turtle', name: '푸른바다거북', icon: '🐢', rarity: '전설', habitat: '부산 외해', facts: '푸른바다거북은 먼 바다를 이동하는 보호종이에요. 비닐을 해파리로 착각할 수 있어요.', guide: '발견하면 거리를 두고 관찰하고 해양쓰레기를 줄여 서식 환경을 지켜주세요.' },
    { id: 'moon-jelly', name: '보름달물해파리', icon: '🪼', rarity: '보통', habitat: '수영만·연안', facts: '몸속에 보이는 네 개의 고리 모양 생식샘 때문에 보름달물해파리라는 이름이 붙었어요.', guide: '약한 독성이지만 피부에 닿지 않도록 안전거리를 유지해요.' },
    { id: 'squid', name: '살오징어', icon: '🦑', rarity: '보통', habitat: '기장 앞바다', facts: '살오징어는 몸속 색소포를 조절해 빠르게 색을 바꾸고 제트 추진으로 이동해요.', guide: '밤에는 빛에 모이는 습성이 있어 집어등 어업에 이용돼요.' },
    { id: 'dolphin', name: '상괭이', icon: '🐬', rarity: '희귀', habitat: '남해와 부산 외해', facts: '상괭이는 등지느러미가 없는 작은 돌고래예요. 숨을 쉬기 위해 정기적으로 수면 위로 올라와요.', guide: '멸종위기 해양보호생물로 배에서 발견해도 쫓아가거나 먹이를 주면 안 돼요.' },
    { id: 'crab', name: '꽃게', icon: '🦀', rarity: '보통', habitat: '낙동강 하구 모래바닥', facts: '꽃게의 마지막 다리는 노처럼 납작해 헤엄치기에 알맞아요.', guide: '어린 꽃게가 자랄 수 있도록 금어기와 포획 금지 크기를 지키는 것이 중요해요.' },
    { id: 'anchovy', name: '멸치', icon: '🐟', rarity: '흔함', habitat: '기장 연안', facts: '멸치는 작은 몸으로 큰 무리를 이루며 많은 바닷새와 대형 물고기의 먹이가 돼요.', guide: '부산 기장에서는 봄철 멸치 어업과 멸치 축제로 지역 바다 문화를 만날 수 있어요.' },
    { id: 'sea-hare', name: '군소', icon: '🐌', rarity: '희귀', habitat: '송정 얕은 암반', facts: '군소는 해조류를 먹는 바다 달팽이예요. 위협을 받으면 보라색 액체를 내보내기도 해요.', guide: '독성이 있을 수 있으므로 손으로 만지거나 먹지 말고 눈으로만 관찰해요.' }
  ];

  const state = {
    points: 0,
    xp: 0,
    level: 1,
    trash: 0,
    collection: new Map(),
    creatures: new Map(),
    user: null,
    quizDone: false,
    postsUnsubscribe: null,
    chatUnsubscribe: null,
    profiles: []
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
  }

  async function saveProgress() {
    if (!window.OceanCloud || !state.user) return;
    try {
      await window.OceanCloud.saveProgress({
        level: state.level,
        xp: state.xp,
        points: state.points,
        trash: state.trash
      });
    } catch (_) {
      $('#cloudState').textContent = '저장 대기';
      $('#cloudState').classList.remove('online');
    }
  }

  function gain(points, xp, message) {
    state.points += points;
    state.xp += xp;
    let leveledUp = false;
    while (state.xp >= XP_GOAL) {
      state.xp -= XP_GOAL;
      state.level += 1;
      leveledUp = true;
    }
    renderProgress();
    saveProgress();
    if (leveledUp) toast(`🎉 레벨 업! 레벨 ${state.level} 탐험가가 되었어요.`);
    else if (message) toast(message);
  }

  function openDialog(title, kicker, body, className = '') {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <section class="dialog-card ${className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="dialog-top"><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div><button class="dialog-close" type="button" aria-label="닫기">×</button></div>
        <div class="dialog-body">${body}</div>
      </section>`;
    $('#dialogLayer').append(overlay);
    const close = () => {
      if (state.chatUnsubscribe) {
        state.chatUnsubscribe();
        state.chatUnsubscribe = null;
      }
      overlay.remove();
    };
    $('.dialog-close', overlay).addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    setTimeout(() => $('.dialog-close', overlay).focus(), 0);
    return { overlay, body: $('.dialog-body', overlay), close };
  }

  function randomPosition() {
    return { x: 4 + Math.random() * 82, y: 4 + Math.random() * 72 };
  }

  function moveCreature(entry) {
    if (!entry.element.isConnected) return;
    const position = randomPosition();
    entry.x = position.x;
    entry.y = position.y;
    entry.element.style.transform = `translate(${position.x / 100 * $('#creatureLayer').clientWidth}px, ${position.y / 100 * $('#creatureLayer').clientHeight}px)`;
    updateTargets();
  }

  function removeCreature(id, caught = false) {
    const entry = state.creatures.get(id);
    if (!entry) return;
    clearInterval(entry.moveTimer);
    clearTimeout(entry.lifeTimer);
    entry.element.classList.add('vanish');
    setTimeout(() => entry.element.remove(), 420);
    state.creatures.delete(id);
    if (!caught) $('#arenaStatus').textContent = `${entry.species.name}이(가) 시야에서 사라졌어요.`;
  }

  function spawnCreature() {
    if ($('#playScreen').classList.contains('hidden') || state.creatures.size >= 4) return;
    const available = species.filter((item) => ![...state.creatures.values()].some((entry) => entry.species.id === item.id));
    const selected = (available.length ? available : species)[Math.floor(Math.random() * (available.length || species.length))];
    const id = `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'wild-creature';
    element.dataset.creatureId = id;
    element.setAttribute('aria-label', `${selected.name}, 움직이는 해양 생물`);
    element.innerHTML = `<i>${selected.icon}</i><small>${selected.name}</small>`;
    $('#creatureLayer').append(element);
    const entry = { id, species: selected, element, x: 0, y: 0 };
    state.creatures.set(id, entry);
    moveCreature(entry);
    entry.moveTimer = setInterval(() => moveCreature(entry), 1500 + Math.random() * 800);
    entry.lifeTimer = setTimeout(() => removeCreature(id), 10000 + Math.random() * 6000);
    element.addEventListener('click', () => {
      element.classList.add('target');
      setTimeout(() => element.classList.remove('target'), 900);
      $('#arenaStatus').textContent = `${selected.name}: 포획 원 안으로 들어올 때 버튼을 누르세요!`;
    });
    $('#arenaStatus').textContent = `${selected.name} 출현! 움직임을 잘 살펴보세요.`;
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

  async function captureCreature() {
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
    const isNew = !state.collection.has(found.id);
    state.collection.set(found.id, found);
    renderCollection();
    if (window.OceanCloud && state.user) {
      try { await window.OceanCloud.addSpecies(found); } catch (_) { toast('도감 저장이 잠시 지연되고 있어요.'); }
    }
    gain(isNew ? 60 : 20, isNew ? 80 : 25);
    const dialog = openDialog(isNew ? '새로운 생물 발견!' : '다시 만난 바다 친구!', 'CAPTURE SUCCESS', `
      <div class="caught-card">
        <div class="caught-icon">${found.icon}</div>
        <h2>${found.name}</h2>
        <span class="reward">${isNew ? '+80 XP · 도감 신규 등록' : '+25 XP · 관찰 보너스'}</span>
        <p>${found.facts}</p>
        <div class="species-facts"><b>서식지</b> ${found.habitat}<br><b>관찰 포인트</b> ${found.guide}</div>
        <button class="dialog-primary caught-confirm" type="button">도감 확인하기</button>
      </div>`, 'caught-dialog');
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
      card.innerHTML = `<i>${item.icon}</i><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.habitat)} · ${escapeHtml(item.rarity)}</small>`;
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
    $('#collectionCount').textContent = `${collected.length}종 수집`;
  }

  function showSpeciesDetail(item) {
    openDialog(item.name, `${item.rarity} · 부산 해양 생물`, `
      <div class="species-detail"><i>${item.icon}</i><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.facts)}</p><div class="species-facts"><b>주요 서식지</b><br>${escapeHtml(item.habitat)}<br><br><b>교육 포인트</b><br>${escapeHtml(item.guide)}</div></div>`);
  }

  function showAllSpecies() {
    const cards = species.map((item) => {
      const caught = state.collection.has(item.id);
      return `<article class="profile-row"><span>${caught ? item.icon : '❔'}</span><div><b>${caught ? escapeHtml(item.name) : '아직 만나지 못한 생물'}</b><small>${caught ? `${escapeHtml(item.habitat)} · ${escapeHtml(item.rarity)}` : '부산 바다를 탐험해 발견하세요'}</small></div></article>`;
    }).join('');
    openDialog('부산 생물 전체 목록', `${state.collection.size} / ${species.length}종 발견`, `<div class="profile-list">${cards}</div>`);
  }

  function requireLogin(action = '이 기능') {
    if (state.user) return true;
    toast(`${action}을 사용하려면 Google 로그인이 필요해요.`);
    window.OceanCloud?.signIn();
    return false;
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
        const labels = { none: '친구 요청', sent: '요청 보냄', received: '요청 수락', friends: '친구 ✓' };
        return `<article class="profile-row"><span>${escapeHtml(person.avatar || '🌊')}</span><div><b>${escapeHtml(person.displayName || '바다 탐험가')}</b><small>${escapeHtml(person.location || '부산')} · ${person.online ? '온라인' : '최근 활동'}</small></div><button type="button" data-person="${escapeHtml(person.uid)}" data-relation="${person.relation}" ${['sent','friends'].includes(person.relation) ? 'disabled' : ''}>${labels[person.relation] || labels.none}</button></article>`;
      }).join('');
      $$('[data-person]', list).forEach((button) => button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          if (button.dataset.relation === 'received') {
            await window.OceanCloud.acceptFriend(button.dataset.person);
            button.textContent = '친구 ✓';
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
    const people = $('#chatPeople', dialog.body);
    if (!friends.length) {
      people.innerHTML = '<button class="chat-person" type="button">친구 없음</button>';
      return;
    }
    people.innerHTML = friends.map((friend) => `<button class="chat-person" type="button" data-chat-user="${escapeHtml(friend.uid)}">${escapeHtml(friend.displayName || '바다 친구')}</button>`).join('');
    let activeFriend = null;
    $$('[data-chat-user]', people).forEach((button) => button.addEventListener('click', () => {
      $$('[data-chat-user]', people).forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      activeFriend = friends.find((item) => item.uid === button.dataset.chatUser);
      $('#chatHeader', dialog.body).textContent = `${activeFriend.displayName || '바다 친구'}님과의 대화`;
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

  function renderPosts(posts) {
    const list = $('#postsList');
    if (!posts.length) {
      list.innerHTML = '<div class="auth-banner"><div><span>🌊</span><p><b>첫 번째 이야기를 기다려요</b><small>부산 바다에서의 모험을 공유해 보세요.</small></p></div></div>';
      return;
    }
    list.innerHTML = posts.map((post) => `
      <article class="post">
        <div class="post-user"><span>${escapeHtml(post.avatar || '🌊')}</span><div><b>${escapeHtml(post.authorName || '바다 탐험가')}</b><small>${escapeHtml(post.location || '부산')} · ${escapeHtml(post.timeLabel || '최근')}</small></div></div>
        <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body)}</p>
        <div class="post-meta"><span>📍 ${escapeHtml(post.location || '부산')}</span><b>부산 바다 피드</b></div>
      </article>`).join('');
  }

  function loadCommunity() {
    if (!state.user || !window.OceanCloud) return;
    if (state.postsUnsubscribe) return;
    state.postsUnsubscribe = window.OceanCloud.subscribePosts(renderPosts, () => toast('게시물을 불러오지 못했어요.'));
  }

  function updateAuthUI(user) {
    state.user = user;
    const connected = Boolean(user);
    $('#cloudState').textContent = connected ? (user.displayName || '저장됨') : '체험 모드';
    $('#cloudState').classList.toggle('online', connected);
    $('#authButton').textContent = connected ? (user.photoURL ? '✓' : '👤') : '👤';
    $('#authButton').title = connected ? '로그아웃' : 'Google 로그인';
    $('#authBanner').classList.toggle('connected', connected);
    $('#communityLoginButton').textContent = connected ? `${user.displayName || '탐험가'} · 로그아웃` : 'Google 로그인';
    if (!connected && state.postsUnsubscribe) {
      state.postsUnsubscribe();
      state.postsUnsubscribe = null;
    }
    if (connected && $('#community').classList.contains('active')) loadCommunity();
  }

  function applyCloudProgress(detail) {
    const progress = detail?.progress || {};
    state.level = Math.max(1, Number(progress.level) || 1);
    state.xp = Math.max(0, Math.min(XP_GOAL - 1, Number(progress.xp) || 0));
    state.points = Math.max(0, Number(progress.points) || 0);
    state.trash = Math.max(0, Math.min(3, Number(progress.trash) || 0));
    state.collection.clear();
    (detail?.species || []).forEach((saved) => {
      const full = species.find((item) => item.id === saved.id) || saved;
      if (full?.id) state.collection.set(full.id, full);
    });
    $('#missionCount').textContent = `${state.trash}/3`;
    renderProgress();
    renderCollection();
  }

  $('#sailButton').addEventListener('click', () => {
    $('#startScreen').classList.add('hidden');
    $('#playScreen').classList.remove('hidden');
    setTimeout(() => {
      spawnCreature();
      spawnCreature();
      updateTargets();
    }, 350);
  });
  $$('[data-tab]').forEach((button) => button.addEventListener('click', () => showTab(button.dataset.tab)));
  $('#captureButton').addEventListener('click', captureCreature);
  $('#showAllSpecies').addEventListener('click', showAllSpecies);
  $('#friendButton').addEventListener('click', openFriends);
  $('#openChatButton').addEventListener('click', openChat);
  $('#newPostButton').addEventListener('click', openPostComposer);
  $('#refreshPosts').addEventListener('click', () => {
    if (state.postsUnsubscribe) state.postsUnsubscribe();
    state.postsUnsubscribe = null;
    loadCommunity();
    toast('부산 바다 피드를 새로 불러왔어요.');
  });
  $('#authButton').addEventListener('click', () => state.user ? window.OceanCloud?.signOut() : window.OceanCloud?.signIn());
  $('#communityLoginButton').addEventListener('click', () => state.user ? window.OceanCloud?.signOut() : window.OceanCloud?.signIn());

  $('#trashFile').addEventListener('change', (event) => {
    if (!event.target.files?.[0]) return;
    if (state.trash >= 3) {
      toast('오늘의 쓰레기 줍기 미션을 이미 완료했어요!');
      event.target.value = '';
      return;
    }
    state.trash += 1;
    $('#missionCount').textContent = `${state.trash}/3`;
    gain(50, 35, `인증 완료! +50 씨앗 · +35 XP (${state.trash}/3)`);
    if (state.trash === 3) setTimeout(() => gain(150, 100, '해변 정화 미션 완료! 보너스 +100 XP'), 500);
    event.target.value = '';
  });

  $$('#answers button').forEach((button) => button.addEventListener('click', () => {
    if (state.quizDone) return;
    state.quizDone = true;
    if (button.hasAttribute('data-correct')) {
      button.classList.add('correct');
      $('#quizFeedback').textContent = '정답! 플라스틱은 사라지지 않고 미세플라스틱으로 남을 수 있어요.';
      gain(30, 30, '정답이에요! +30 XP');
    } else {
      button.classList.add('wrong');
      $('#quizFeedback').textContent = '아쉬워요. 정답은 약 200년 이상이에요.';
    }
  }));

  window.addEventListener('ocean-auth', (event) => updateAuthUI(event.detail?.user || null));
  window.addEventListener('ocean-progress-loaded', (event) => applyCloudProgress(event.detail));
  window.addEventListener('ocean-cloud-error', (event) => toast(event.detail?.message || 'Firebase 연결을 확인해 주세요.'));
  window.addEventListener('resize', updateTargets);
  setInterval(spawnCreature, 3200);
  renderProgress();
  renderCollection();
})();
