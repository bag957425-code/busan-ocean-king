(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyAJ-xGbpIFupFgHhrSt7v__ks9w9InZ4sY',
    authDomain: 'busan-ocean-king-957425.firebaseapp.com',
    projectId: 'busan-ocean-king-957425',
    storageBucket: 'busan-ocean-king-957425.firebasestorage.app',
    messagingSenderId: '617705306002',
    appId: '1:617705306002:web:642432c7d7086ecf73b34b'
  };

  const dispatch = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
  const cloudError = (message, error) => {
    console.error(message, error || '');
    dispatch('ocean-cloud-error', { message, code: error?.code || '' });
  };

  if (!window.firebase) {
    cloudError('Firebase 연결 파일을 불러오지 못했어요.');
    return;
  }

  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
  const auth = app.auth();
  const db = app.firestore();
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const serverTime = () => firebase.firestore.FieldValue.serverTimestamp();
  const currentUser = () => auth.currentUser;
  const requireUser = () => {
    const user = currentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    return user;
  };

  function conversationId(uidA, uidB) {
    return [uidA, uidB].sort().join('__');
  }

  function friendshipId(uidA, uidB) {
    return [uidA, uidB].sort().join('__');
  }

  function timeLabel(timestamp) {
    if (!timestamp?.toDate) return '방금 전';
    const difference = Date.now() - timestamp.toDate().getTime();
    if (difference < 60000) return '방금 전';
    if (difference < 3600000) return `${Math.floor(difference / 60000)}분 전`;
    if (difference < 86400000) return `${Math.floor(difference / 3600000)}시간 전`;
    return timestamp.toDate().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  async function ensureProfile(user) {
    const profile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || '바다 탐험가',
      email: user.email || '',
      photoURL: user.photoURL || '',
      avatar: '🌊',
      location: '부산',
      online: true,
      lastSeen: serverTime()
    };
    await db.collection('profiles').doc(user.uid).set(profile, { merge: true });
    return profile;
  }

  async function loadProgress(user) {
    const userRef = db.collection('users').doc(user.uid);
    const [progressSnapshot, speciesSnapshot] = await Promise.all([
      userRef.get(),
      userRef.collection('species').get()
    ]);
    const progress = progressSnapshot.exists ? progressSnapshot.data() : {
      level: 1, xp: 0, points: 0, trash: 0
    };
    if (!progressSnapshot.exists) {
      await userRef.set({
        level: 1,
        xp: 0,
        points: 0,
        trash: 0,
        createdAt: serverTime(),
        updatedAt: serverTime()
      });
    }
    dispatch('ocean-progress-loaded', {
      progress: {
        level: Math.max(1, Number(progress.level) || 1),
        xp: Math.max(0, Number(progress.xp) || 0),
        points: Math.max(0, Number(progress.points) || 0),
        trash: Math.max(0, Number(progress.trash) || 0)
      },
      species: speciesSnapshot.docs.map((document) => document.data())
    });
  }

  const OceanCloud = {
    async signIn() {
      try {
        await auth.signInWithPopup(googleProvider);
      } catch (error) {
        if (error.code === 'auth/popup-blocked') {
          await auth.signInWithRedirect(googleProvider);
          return;
        }
        const message = error.code === 'auth/unauthorized-domain'
          ? 'Firebase에서 현재 웹사이트 주소를 승인해야 Google 로그인을 사용할 수 있어요.'
          : 'Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';
        cloudError(message, error);
      }
    },

    async signOut() {
      const user = currentUser();
      if (user) {
        await db.collection('profiles').doc(user.uid).set({ online: false, lastSeen: serverTime() }, { merge: true }).catch(() => {});
      }
      await auth.signOut();
    },

    async saveProgress(progress) {
      const user = requireUser();
      await db.collection('users').doc(user.uid).set({
        level: Math.max(1, Number(progress.level) || 1),
        xp: Math.max(0, Number(progress.xp) || 0),
        points: Math.max(0, Number(progress.points) || 0),
        trash: Math.max(0, Number(progress.trash) || 0),
        updatedAt: serverTime()
      }, { merge: true });
    },

    async addSpecies(species) {
      const user = requireUser();
      await db.collection('users').doc(user.uid).collection('species').doc(species.id).set({
        id: species.id,
        name: species.name,
        icon: species.icon,
        rarity: species.rarity,
        habitat: species.habitat,
        facts: species.facts,
        guide: species.guide,
        collectedAt: serverTime()
      }, { merge: true });
    },

    async createPost(post) {
      const user = requireUser();
      await db.collection('posts').add({
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || '바다 탐험가',
        avatar: '🌊',
        title: String(post.title || '').slice(0, 80),
        body: String(post.body || '').slice(0, 1000),
        location: String(post.location || '부산').slice(0, 30),
        createdAt: serverTime()
      });
    },

    subscribePosts(onPosts, onError) {
      requireUser();
      return db.collection('posts').orderBy('createdAt', 'desc').limit(30).onSnapshot((snapshot) => {
        onPosts(snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
          timeLabel: timeLabel(document.data().createdAt)
        })));
      }, onError);
    },

    async getPeople() {
      const user = requireUser();
      const [profilesSnapshot, sentSnapshot, receivedSnapshot, friendsSnapshot] = await Promise.all([
        db.collection('profiles').limit(50).get(),
        db.collection('friendRequests').where('fromUid', '==', user.uid).get(),
        db.collection('friendRequests').where('toUid', '==', user.uid).get(),
        db.collection('friendships').where('members', 'array-contains', user.uid).get()
      ]);
      const sent = new Map(sentSnapshot.docs.map((document) => [document.data().toUid, document.data().status]));
      const received = new Map(receivedSnapshot.docs.map((document) => [document.data().fromUid, document.data().status]));
      const friends = new Set(friendsSnapshot.docs.flatMap((document) => document.data().members || []).filter((uid) => uid !== user.uid));
      return profilesSnapshot.docs
        .map((document) => ({ uid: document.id, ...document.data() }))
        .filter((profile) => profile.uid !== user.uid)
        .map((profile) => ({
          ...profile,
          relation: friends.has(profile.uid) ? 'friends' : received.has(profile.uid) ? 'received' : sent.has(profile.uid) ? 'sent' : 'none'
        }))
        .sort((a, b) => Number(b.online) - Number(a.online));
    },

    async sendFriendRequest(toUid) {
      const user = requireUser();
      if (!toUid || toUid === user.uid) return;
      const id = `${user.uid}__${toUid}`;
      await db.collection('friendRequests').doc(id).set({
        fromUid: user.uid,
        toUid,
        status: 'pending',
        createdAt: serverTime()
      });
    },

    async acceptFriend(fromUid) {
      const user = requireUser();
      const requestRef = db.collection('friendRequests').doc(`${fromUid}__${user.uid}`);
      const friendRef = db.collection('friendships').doc(friendshipId(fromUid, user.uid));
      await db.runTransaction(async (transaction) => {
        const request = await transaction.get(requestRef);
        if (!request.exists || request.data().toUid !== user.uid) throw new Error('유효한 친구 요청이 없습니다.');
        transaction.set(friendRef, { members: [fromUid, user.uid].sort(), createdAt: serverTime() });
        transaction.update(requestRef, { status: 'accepted', acceptedAt: serverTime() });
      });
    },

    async getFriends() {
      const user = requireUser();
      const friendships = await db.collection('friendships').where('members', 'array-contains', user.uid).get();
      const uids = friendships.docs.flatMap((document) => document.data().members || []).filter((uid) => uid !== user.uid);
      const unique = [...new Set(uids)];
      const profiles = await Promise.all(unique.map((uid) => db.collection('profiles').doc(uid).get()));
      return profiles.filter((document) => document.exists).map((document) => ({ uid: document.id, ...document.data() }));
    },

    subscribeMessages(friendUid, onMessages) {
      const user = requireUser();
      const id = conversationId(user.uid, friendUid);
      return db.collection('conversations').doc(id).collection('messages')
        .orderBy('createdAt', 'asc').limit(100)
        .onSnapshot((snapshot) => onMessages(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))), (error) => cloudError('메시지를 불러오지 못했어요.', error));
    },

    async sendMessage(friendUid, text) {
      const user = requireUser();
      const id = conversationId(user.uid, friendUid);
      const conversation = db.collection('conversations').doc(id);
      const friendship = await db.collection('friendships').doc(friendshipId(user.uid, friendUid)).get();
      if (!friendship.exists) throw new Error('친구에게만 메시지를 보낼 수 있습니다.');
      await conversation.set({
        members: [user.uid, friendUid].sort(),
        updatedAt: serverTime(),
        lastMessage: String(text).slice(0, 120)
      }, { merge: true });
      await conversation.collection('messages').add({
        senderId: user.uid,
        text: String(text).trim().slice(0, 500),
        createdAt: serverTime()
      });
    }
  };

  window.OceanCloud = OceanCloud;

  auth.onAuthStateChanged(async (user) => {
    dispatch('ocean-auth', { user: user ? {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || '바다 탐험가',
      email: user.email || '',
      photoURL: user.photoURL || ''
    } : null });
    if (!user) return;
    try {
      await ensureProfile(user);
      await loadProgress(user);
    } catch (error) {
      cloudError('Firebase에서 탐험 기록을 불러오지 못했어요.', error);
    }
  });
})();
