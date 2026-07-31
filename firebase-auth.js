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
  let profileCache = null;
  let presenceTimer = null;
  let presenceCleanup = null;

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

  function withLivePresence(profile) {
    const lastSeen = profile?.lastSeen?.toMillis?.() || 0;
    const recentlyActive = lastSeen > Date.now() - 2 * 60 * 1000;
    return { ...profile, online: Boolean(profile?.online && recentlyActive) };
  }

  function stopPresence() {
    clearInterval(presenceTimer);
    presenceTimer = null;
    if (presenceCleanup) presenceCleanup();
    presenceCleanup = null;
  }

  function startPresence(user) {
    stopPresence();
    const reference = db.collection('profiles').doc(user.uid);
    const sync = (forcedState) => {
      if (currentUser()?.uid !== user.uid) return;
      const online = typeof forcedState === 'boolean'
        ? forcedState
        : navigator.onLine && document.visibilityState === 'visible';
      reference.set({ online, lastSeen: serverTime() }, { merge: true }).catch(() => {});
      if (profileCache) profileCache.online = online;
      dispatch('ocean-presence', { online });
    };
    const visibilityHandler = () => sync();
    const onlineHandler = () => sync();
    const offlineHandler = () => sync(false);
    const pageHideHandler = () => sync(false);
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    window.addEventListener('pagehide', pageHideHandler);
    presenceCleanup = () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      window.removeEventListener('pagehide', pageHideHandler);
    };
    sync();
    presenceTimer = setInterval(() => sync(), 45 * 1000);
  }

  async function ensureProfile(user) {
    const reference = db.collection('profiles').doc(user.uid);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      profileCache = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || '바다 탐험가',
        nickname: '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        avatar: '🌊',
        avatarImage: '',
        residence: '',
        location: '',
        age: null,
        bio: '',
        profileComplete: false,
        online: true,
        createdAt: serverTime(),
        lastSeen: serverTime()
      };
      await reference.set(profileCache);
      return profileCache;
    }
    profileCache = { uid: user.uid, ...snapshot.data() };
    await reference.set({
      email: user.email || '',
      photoURL: user.photoURL || '',
      online: true,
      lastSeen: serverTime()
    }, { merge: true });
    return profileCache;
  }

  async function loadProgress(user) {
    const userRef = db.collection('users').doc(user.uid);
    const [progressSnapshot, speciesSnapshot] = await Promise.all([
      userRef.get(),
      userRef.collection('species').get()
    ]);
    const progress = progressSnapshot.exists ? progressSnapshot.data() : {
      level: 1, xp: 0, points: 0, trash: 0, difficulty: 'beginner'
    };
    if (!progressSnapshot.exists) {
      await userRef.set({
        level: 1,
        xp: 0,
        points: 0,
        trash: 0,
        difficulty: 'beginner',
        createdAt: serverTime(),
        updatedAt: serverTime()
      });
    }
    dispatch('ocean-progress-loaded', {
      progress: {
        level: Math.max(1, Number(progress.level) || 1),
        xp: Math.max(0, Number(progress.xp) || 0),
        points: Math.max(0, Number(progress.points) || 0),
        trash: Math.max(0, Number(progress.trash) || 0),
        difficulty: ['beginner', 'intermediate', 'advanced', 'master'].includes(progress.difficulty) ? progress.difficulty : 'beginner'
      },
      species: speciesSnapshot.docs.map((document) => document.data())
    });
  }

  async function actorProfile() {
    if (profileCache?.profileComplete) return profileCache;
    const user = requireUser();
    const snapshot = await db.collection('profiles').doc(user.uid).get();
    profileCache = snapshot.exists ? { uid: user.uid, ...snapshot.data() } : await ensureProfile(user);
    return profileCache;
  }

  async function addNotification({ toUid, type, text, referenceId = '' }) {
    const user = requireUser();
    if (!toUid || toUid === user.uid) return;
    const actor = await actorProfile();
    await db.collection('notifications').add({
      toUid,
      fromUid: user.uid,
      actorName: actor.nickname || actor.displayName || '바다 탐험가',
      actorAvatar: actor.avatar || '🌊',
      actorAvatarImage: actor.avatarImage || '',
      type,
      text: String(text || '').slice(0, 160),
      referenceId,
      read: false,
      createdAt: serverTime()
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
      stopPresence();
      if (user) {
        await db.collection('profiles').doc(user.uid).set({ online: false, lastSeen: serverTime() }, { merge: true }).catch(() => {});
      }
      profileCache = null;
      await auth.signOut();
    },

    async getMyProfile() {
      const user = requireUser();
      const snapshot = await db.collection('profiles').doc(user.uid).get();
      profileCache = snapshot.exists ? { uid: user.uid, ...snapshot.data() } : await ensureProfile(user);
      return profileCache;
    },

    async saveProfile(input) {
      const user = requireUser();
      const nickname = String(input.nickname || '').trim().slice(0, 24);
      const residence = String(input.residence || '').trim().slice(0, 40);
      const age = Math.round(Number(input.age));
      const bio = String(input.bio || '').trim().slice(0, 300);
      const avatarImage = String(input.avatarImage || '');
      if (nickname.length < 2) throw new Error('닉네임은 두 글자 이상 입력해 주세요.');
      if (!residence) throw new Error('거주지를 입력해 주세요.');
      if (!Number.isFinite(age) || age < 1 || age > 120) throw new Error('나이는 1세부터 120세 사이로 입력해 주세요.');
      if (avatarImage && (!/^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(avatarImage) || avatarImage.length > 260000)) {
        throw new Error('프로필 사진 형식이나 용량을 확인해 주세요.');
      }
      const profile = {
        uid: user.uid,
        nickname,
        displayName: nickname,
        residence,
        location: residence,
        age,
        bio,
        avatar: input.avatar || profileCache?.avatar || '🌊',
        avatarImage,
        email: user.email || '',
        photoURL: user.photoURL || '',
        profileComplete: true,
        online: true,
        updatedAt: serverTime(),
        lastSeen: serverTime()
      };
      await db.collection('profiles').doc(user.uid).set(profile, { merge: true });
      await user.updateProfile({ displayName: nickname }).catch(() => {});
      profileCache = { ...(profileCache || {}), ...profile };
      return profileCache;
    },

    async getProfile(uid) {
      requireUser();
      const snapshot = await db.collection('profiles').doc(uid).get();
      if (!snapshot.exists) throw new Error('프로필을 찾을 수 없어요.');
      return withLivePresence({ uid: snapshot.id, ...snapshot.data() });
    },

    async saveProgress(progress) {
      const user = requireUser();
      await db.collection('users').doc(user.uid).set({
        level: Math.max(1, Number(progress.level) || 1),
        xp: Math.max(0, Number(progress.xp) || 0),
        points: Math.max(0, Number(progress.points) || 0),
        trash: Math.max(0, Math.min(5, Number(progress.trash) || 0)),
        difficulty: ['beginner', 'intermediate', 'advanced', 'master'].includes(progress.difficulty) ? progress.difficulty : 'beginner',
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
      const actor = await actorProfile();
      await db.collection('posts').add({
        authorId: user.uid,
        authorName: actor.nickname || actor.displayName || '바다 탐험가',
        avatar: actor.avatar || '🌊',
        avatarImage: actor.avatarImage || '',
        title: String(post.title || '').slice(0, 80),
        body: String(post.body || '').slice(0, 1000),
        location: String(post.location || actor.residence || '부산').slice(0, 30),
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

    async deletePost(postId) {
      const user = requireUser();
      const postRef = db.collection('posts').doc(postId);
      const post = await postRef.get();
      if (!post.exists || post.data().authorId !== user.uid) throw new Error('본인이 작성한 게시물만 삭제할 수 있어요.');
      const comments = await postRef.collection('comments').limit(200).get();
      const batch = db.batch();
      comments.docs.forEach((comment) => batch.delete(comment.ref));
      batch.delete(postRef);
      await batch.commit();
    },

    subscribeComments(postId, onComments, onError) {
      requireUser();
      return db.collection('posts').doc(postId).collection('comments')
        .orderBy('createdAt', 'asc').limit(100)
        .onSnapshot((snapshot) => onComments(snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
          timeLabel: timeLabel(document.data().createdAt)
        }))), onError);
    },

    async addComment(postId, text) {
      const user = requireUser();
      const actor = await actorProfile();
      const postRef = db.collection('posts').doc(postId);
      const post = await postRef.get();
      if (!post.exists) throw new Error('게시물을 찾을 수 없어요.');
      const body = String(text || '').trim().slice(0, 400);
      if (!body) return;
      await postRef.collection('comments').add({
        authorId: user.uid,
        authorName: actor.nickname || actor.displayName || '바다 탐험가',
        avatar: actor.avatar || '🌊',
        avatarImage: actor.avatarImage || '',
        text: body,
        createdAt: serverTime()
      });
      await addNotification({
        toUid: post.data().authorId,
        type: 'comment',
        text: `회원님의 게시물에 댓글을 남겼어요: ${body}`,
        referenceId: postId
      });
    },

    async deleteComment(postId, commentId) {
      const user = requireUser();
      const postRef = db.collection('posts').doc(postId);
      const [post, comment] = await Promise.all([
        postRef.get(),
        postRef.collection('comments').doc(commentId).get()
      ]);
      if (!comment.exists || (comment.data().authorId !== user.uid && post.data()?.authorId !== user.uid)) {
        throw new Error('댓글을 삭제할 권한이 없어요.');
      }
      await comment.ref.delete();
    },

    async getPeople() {
      const user = requireUser();
      const [profilesSnapshot, sentSnapshot, receivedSnapshot, friendsSnapshot] = await Promise.all([
        db.collection('profiles').limit(50).get(),
        db.collection('friendRequests').where('fromUid', '==', user.uid).get(),
        db.collection('friendRequests').where('toUid', '==', user.uid).get(),
        db.collection('friendships').where('members', 'array-contains', user.uid).get()
      ]);
      const sent = new Map(sentSnapshot.docs.filter((document) => document.data().status === 'pending').map((document) => [document.data().toUid, 'sent']));
      const received = new Map(receivedSnapshot.docs.filter((document) => document.data().status === 'pending').map((document) => [document.data().fromUid, 'received']));
      const friends = new Set(friendsSnapshot.docs.flatMap((document) => document.data().members || []).filter((uid) => uid !== user.uid));
      return profilesSnapshot.docs
        .map((document) => withLivePresence({ uid: document.id, ...document.data() }))
        .filter((profile) => profile.uid !== user.uid && profile.profileComplete)
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
      await addNotification({
        toUid,
        type: 'friend_request',
        text: '친구 요청을 보냈어요.',
        referenceId: id
      });
    },

    async acceptFriend(fromUid) {
      const user = requireUser();
      const requestRef = db.collection('friendRequests').doc(`${fromUid}__${user.uid}`);
      const friendRef = db.collection('friendships').doc(friendshipId(fromUid, user.uid));
      await db.runTransaction(async (transaction) => {
        const request = await transaction.get(requestRef);
        if (!request.exists || request.data().toUid !== user.uid) throw new Error('유효한 친구 요청이 없습니다.');
        transaction.set(friendRef, {
          members: [fromUid, user.uid].sort(),
          acceptedBy: user.uid,
          requestId: `${fromUid}__${user.uid}`,
          createdAt: serverTime()
        });
        transaction.update(requestRef, { status: 'accepted', acceptedAt: serverTime() });
      });
      await addNotification({
        toUid: fromUid,
        type: 'friend_accept',
        text: '친구 요청을 수락했어요.',
        referenceId: friendshipId(fromUid, user.uid)
      });
    },

    async removeFriend(friendUid) {
      const user = requireUser();
      await db.collection('friendships').doc(friendshipId(user.uid, friendUid)).delete();
      const batch = db.batch();
      batch.delete(db.collection('friendRequests').doc(`${user.uid}__${friendUid}`));
      batch.delete(db.collection('friendRequests').doc(`${friendUid}__${user.uid}`));
      await batch.commit();
    },

    async getFriends() {
      const user = requireUser();
      const friendships = await db.collection('friendships').where('members', 'array-contains', user.uid).get();
      const uids = friendships.docs.flatMap((document) => document.data().members || []).filter((uid) => uid !== user.uid);
      const unique = [...new Set(uids)];
      const profiles = await Promise.all(unique.map((uid) => db.collection('profiles').doc(uid).get()));
      return profiles.filter((document) => document.exists).map((document) => withLivePresence({ uid: document.id, ...document.data() }));
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
      const body = String(text).trim().slice(0, 500);
      await conversation.set({
        members: [user.uid, friendUid].sort(),
        updatedAt: serverTime(),
        lastMessage: body.slice(0, 120)
      }, { merge: true });
      await conversation.collection('messages').add({
        senderId: user.uid,
        text: body,
        createdAt: serverTime()
      });
      await addNotification({
        toUid: friendUid,
        type: 'message',
        text: body,
        referenceId: id
      });
    },

    subscribeNotifications(onNotifications, onError) {
      const user = requireUser();
      return db.collection('notifications').where('toUid', '==', user.uid).limit(100)
        .onSnapshot((snapshot) => {
          const notifications = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
            timeLabel: timeLabel(document.data().createdAt)
          })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          onNotifications(notifications);
        }, onError);
    },

    async markNotificationsRead(ids) {
      const user = requireUser();
      const batch = db.batch();
      ids.slice(0, 100).forEach((id) => {
        batch.update(db.collection('notifications').doc(id), { read: true, readAt: serverTime(), toUid: user.uid });
      });
      await batch.commit();
    }
  };

  window.OceanCloud = OceanCloud;

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      stopPresence();
      dispatch('ocean-auth', { user: null });
      return;
    }
    try {
      const profile = await ensureProfile(user);
      startPresence(user);
      dispatch('ocean-auth', {
        user: {
          uid: user.uid,
          displayName: profile.nickname || profile.displayName || user.email?.split('@')[0] || '바다 탐험가',
          email: user.email || '',
          photoURL: user.photoURL || '',
          profile
        }
      });
      if (!profile.profileComplete) dispatch('ocean-profile-required', { profile });
      await loadProgress(user);
    } catch (error) {
      cloudError('Firebase에서 탐험 기록을 불러오지 못했어요.', error);
    }
  });
})();
