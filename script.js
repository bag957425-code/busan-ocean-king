const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let points = 1240;
let xp = 20;
let level = 8;
let trash = 0;

const species = [
  ['고등어', '🐟', '부산 연안의 대표적인 회유성 어류예요. 플랑크톤과 작은 갑각류를 먹으며 무리를 지어 이동해요.', '먹이: 플랑크톤 · 서식: 부산 연안'],
  ['돌돔', '🐠', '암초 주변에서 사는 물고기로, 단단한 이빨로 성게와 조개를 먹어요.', '먹이: 성게·조개 · 서식: 암초'],
  ['해마', '🦄', '해조류 사이에 몸을 숨기는 해양 생물이에요. 서식지 훼손에 특히 약해요.', '보전: 해조류 숲 보호'],
  ['문어', '🐙', '바위틈에 숨어 살며 주변 환경에 따라 몸 색을 바꿀 수 있어요.', '특징: 위장 능력 · 서식: 바위틈'],
  ['불가사리', '⭐', '팔이 손상돼도 일부를 재생할 수 있는 극피동물이에요.', '특징: 재생 능력 · 서식: 조간대'],
  ['바다거북', '🐢', '해초와 해파리를 먹는 보호종이에요. 플라스틱을 먹이로 착각할 수 있어요.', '보전: 플라스틱 줄이기']
];

const dynamicStyle = document.createElement('style');
dynamicStyle.textContent = `
  .fab{position:fixed;right:calc((100% - min(470px,100%))/2 + 20px);bottom:88px;z-index:9;border:0;border-radius:50%;width:53px;height:53px;background:#f6c84e;color:#17494f;font-size:27px;box-shadow:0 4px 12px #0004}
  .friend-fab{bottom:151px;font-size:20px}
  .gamepop{position:fixed;z-index:30;inset:0;background:#073e49cc;display:grid;place-items:center;padding:22px}
  .gamebox{background:#fffefa;border-radius:20px;padding:20px;width:min(390px,100%);max-height:85vh;overflow:auto;text-align:center}
  .gamebox>.closepop{float:right;border:0;background:transparent;font-size:22px}
  .reel{height:160px;background:linear-gradient(#67c7df,#13738c);border-radius:16px;display:grid;place-items:center;font-size:65px;margin:12px 0}
  .reel-action,.game-primary{border:0;border-radius:12px;padding:13px;background:#f7cb52;color:#244f55;font-weight:bold;width:100%}
  .friends-pop article,.post-form{background:#fff;border-radius:14px;padding:12px;margin:9px 0;text-align:left}
  .friends-pop button,.post-form button{border:0;background:#087a82;color:#fff;padding:8px 11px;border-radius:8px;float:right}
  .post-form input,.post-form textarea{width:100%;padding:10px;margin:7px 0;border:1px solid #d2e6e5;border-radius:9px;font-family:inherit}
  .extra-creatures{display:flex;gap:9px;overflow:auto;padding:12px 20px;background:#f6fbf8}
  .extra-creatures button{border:0;background:#dff2ef;border-radius:13px;padding:9px;min-width:70px;font-size:24px}
  .extra-creatures small{display:block;font-size:9px;color:#376d72}
  .trash-proof{border:2px dashed #95c7c4;padding:11px;border-radius:13px;background:#effaf7;margin-top:10px;display:block;text-align:center;color:#29736f;font-weight:bold;cursor:pointer}
`;
document.head.append(dynamicStyle);

function toast(message) {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.remove('hidden');
  window.setTimeout(() => element.classList.add('hidden'), 2400);
}

function showTab(id) {
  $$('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === id));
  $$('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === id));
  const communityOnly = id === 'community';
  if (friendButton) friendButton.hidden = !communityOnly;
  if (plusButton) plusButton.hidden = !communityOnly;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gain(pointAmount, xpAmount) {
  points += pointAmount;
  xp += xpAmount;
  while (xp >= 300) {
    xp -= 300;
    level += 1;
    toast(`레벨 업! 탐험가 레벨 ${level}`);
  }
  const badge = $('.level-badge');
  const total = $('.level > strong');
  const progress = $('.level em');
  const remaining = $('.level div:nth-child(2) small');
  if (badge) badge.textContent = level;
  if (total) total.innerHTML = `${points.toLocaleString()} <small>XP</small>`;
  if (progress) progress.style.width = `${Math.round((xp / 300) * 100)}%`;
  if (remaining) remaining.textContent = `다음 레벨까지 ${300 - xp} XP`;
}

function popup(content) {
  const overlay = document.createElement('div');
  overlay.className = 'gamepop';
  overlay.innerHTML = `<div class="gamebox">${content}</div>`;
  document.body.append(overlay);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('.closepop')) overlay.remove();
  });
  return overlay;
}

function fishing(selected) {
  const game = popup(`
    <button class="closepop" aria-label="닫기">×</button>
    <h2>낚시 미니게임</h2>
    <div class="reel">${selected[1]}</div>
    <p>물고기가 원 안에 들어올 때 낚싯대를 당겨보세요!</p>
    <button class="reel-action" id="reelBtn">🎣 낚싯대 당기기</button>
  `);
  game.querySelector('#reelBtn').addEventListener('click', () => {
    game.remove();
    const caught = popup(`
      <button class="closepop" aria-label="닫기">×</button>
      <h2>잡았어요! ${selected[0]}</h2>
      <div class="reel">${selected[1]}</div>
      <p>${selected[2]}</p>
      <p><b>${selected[3]}</b></p>
      <button class="game-primary" id="registerSpecies">도감에 등록 +80 XP</button>
    `);
    caught.querySelector('#registerSpecies').addEventListener('click', () => {
      gain(120, 80);
      caught.remove();
      toast(`${selected[0]} 도감 등록 완료!`);
    });
  });
}

function openFriends() {
  const dialog = popup(`
    <button class="closepop" aria-label="닫기">×</button>
    <h2>주변 온라인 친구</h2>
    <div class="friends-pop">
      <article>🏄 민서 <button data-friend>친구 요청</button></article>
      <article>🐳 바다러버 <button data-friend>친구 요청</button></article>
      <article>🪼 해양탐험가 <button data-friend>친구 요청</button></article>
    </div>
  `);
  dialog.querySelectorAll('[data-friend]').forEach((button) => {
    button.addEventListener('click', () => {
      button.textContent = '요청 완료';
      button.disabled = true;
      toast('친구 요청을 보냈어요!');
    });
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

function openPostForm() {
  const dialog = popup(`
    <button class="closepop" aria-label="닫기">×</button>
    <h2>새 블로그 글</h2>
    <div class="post-form">
      <input id="postTitle" placeholder="제목">
      <textarea id="postBody" placeholder="부산 바다에서의 오늘을 나눠보세요" rows="4"></textarea>
      <button id="publishPost">올리기</button>
    </div>
  `);
  dialog.querySelector('#publishPost').addEventListener('click', () => {
    const title = dialog.querySelector('#postTitle').value.trim() || '나의 부산 바다 기록';
    const body = dialog.querySelector('#postBody').value.trim() || '오늘도 푸른 바다를 지켰어요!';
    const post = document.createElement('article');
    post.className = 'post';
    post.innerHTML = `<div class="post-user"><span>🧑🏻</span><div><b>나의 블루로그</b><small>방금 전</small></div></div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>`;
    $('#community .section-head').after(post);
    dialog.remove();
    toast('블로그 글을 올렸어요!');
  });
}

$$('[data-tab]').forEach((button) => button.addEventListener('click', () => showTab(button.dataset.tab)));

const creatureRow = document.createElement('div');
creatureRow.className = 'extra-creatures';
species.forEach((item) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `${item[1]}<small>${item[0]}</small>`;
  button.addEventListener('click', () => fishing(item));
  creatureRow.append(button);
});
$('.map').after(creatureRow);

$('#scanBtn')?.addEventListener('click', () => fishing(species[Math.floor(Math.random() * species.length)]));
$$('.creature').forEach((button) => {
  button.addEventListener('click', () => {
    const selected = species.find((item) => item[0] === button.dataset.name)
      || [button.dataset.name, button.dataset.icon, button.dataset.desc, '부산 바다에서 관찰할 수 있어요.'];
    fishing(selected);
  });
});

const mission = $('#missionCard');
if (mission) {
  mission.insertAdjacentHTML('beforeend', '<label class="trash-proof" for="trashFile">📷 쓰레기 사진으로 인증하기</label><input id="trashFile" type="file" accept="image/*" hidden>');
  $('#trashFile').addEventListener('change', (event) => {
    if (!event.target.files[0]) return;
    trash = Math.min(3, trash + 1);
    $('#missionCount').textContent = `${trash}/3`;
    gain(50, 35);
    toast(`인증 완료! +50P · +35XP (${trash}/3)`);
    if (trash === 3) {
      gain(150, 100);
      toast('일일 정화 미션 완료! 보너스 +150P · +100XP');
    }
    event.target.value = '';
  });
}

const friendButton = document.createElement('button');
friendButton.className = 'fab friend-fab';
friendButton.type = 'button';
friendButton.textContent = '👥';
friendButton.title = '친구 추가';
friendButton.addEventListener('click', openFriends);

const plusButton = document.createElement('button');
plusButton.className = 'fab';
plusButton.type = 'button';
plusButton.textContent = '＋';
plusButton.title = '게시글 작성';
plusButton.addEventListener('click', openPostForm);
document.body.append(friendButton, plusButton);
friendButton.hidden = true;
plusButton.hidden = true;

$('#friendBtn')?.addEventListener('click', openFriends);
$('#postBtn')?.addEventListener('click', openPostForm);
$('.profile')?.addEventListener('click', () => popup('<button class="closepop" aria-label="닫기">×</button><h2>나의 탐험 기록</h2><p>레벨 8 파도 탐험가 · 1,240 XP</p><button class="game-primary closepop">확인</button>'));
$('#editProfile')?.addEventListener('click', () => popup('<button class="closepop" aria-label="닫기">×</button><h2>안전 프로필</h2><p>수영 실력과 선호 활동을 설정하는 기능을 준비 중이에요.</p><button class="game-primary closepop">확인</button>'));

$$('#answers button').forEach((button) => {
  button.addEventListener('click', () => {
    $$('#answers button').forEach((item) => item.classList.remove('correct'));
    if (button.hasAttribute('data-correct')) {
      button.classList.add('correct');
      $('#quizFeedback').textContent = '정답이에요! 플라스틱은 바다에서 매우 오래 남아 생물을 위협해요.';
      toast('정답! 바다씨앗 +30');
    } else {
      $('#quizFeedback').textContent = '아쉬워요. 플라스틱 빨대는 약 200년 이상 남을 수 있어요.';
    }
  });
});
