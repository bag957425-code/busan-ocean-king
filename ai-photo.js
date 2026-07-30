(() => {
  const AI_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxvyo59LsqRySBpinKRk6lOKrzBlTT7FSu0-xAygrpsmy3s7eOutUlYY4_5dFhSvxGe/exec';
  const galleryInput = document.getElementById('aiGalleryInput');
  const cameraInput = document.getElementById('aiCameraInput');
  const preview = document.getElementById('aiPhotoPreview');
  const prompt = document.getElementById('aiUploadPrompt');
  const status = document.getElementById('aiAnalysisStatus');
  const result = document.getElementById('aiAnalysisResult');
  const error = document.getElementById('aiAnalysisError');
  const analyzeAgain = document.getElementById('aiAnalyzeAgain');
  const galleryButton = document.getElementById('aiGalleryButton');
  const cameraButton = document.getElementById('aiCameraButton');

  if (!galleryInput || !cameraInput) return;

  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  function setState(name) {
    status.classList.toggle('hidden', name !== 'loading');
    result.classList.toggle('hidden', name !== 'result');
    error.classList.toggle('hidden', name !== 'error');
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function prepareImage(file) {
    if (!file.type.startsWith('image/')) throw new Error('JPG, PNG 또는 WEBP 사진을 선택해 주세요.');
    if (file.size > 12 * 1024 * 1024) throw new Error('사진 크기는 12MB 이하로 선택해 주세요.');

    const originalUrl = await readAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('지원하지 않는 사진 형식이에요.'));
      element.src = originalUrl;
    });
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 변환하지 못했어요.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const previewUrl = canvas.toDataURL('image/jpeg', 0.82);
    return {
      data: previewUrl.split(',')[1],
      mimeType: 'image/jpeg',
      previewUrl
    };
  }

  function fetchResult(token) {
    return new Promise((resolve) => {
      const callbackName = `blueWaveAi_${token.replace(/[^a-z0-9]/gi, '')}`;
      const script = document.createElement('script');
      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };
      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };
      script.onerror = () => {
        cleanup();
        resolve({ ok: false, pending: true });
      };
      script.src = `${AI_ENDPOINT}?action=result&token=${encodeURIComponent(token)}&callback=${callbackName}`;
      document.head.appendChild(script);
    });
  }

  async function requestAnalysis(photo) {
    const token = `${Date.now()}${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement('iframe');
    const form = document.createElement('form');
    const payload = document.createElement('textarea');
    frame.name = `blueWaveUpload${token}`;
    frame.hidden = true;
    form.hidden = true;
    form.method = 'POST';
    form.action = AI_ENDPOINT;
    form.target = frame.name;
    payload.name = 'payload';
    payload.value = JSON.stringify({ image: photo.data, mimeType: photo.mimeType, token });
    form.appendChild(payload);
    document.body.append(frame, form);
    form.submit();

    try {
      for (let attempt = 0; attempt < 36; attempt += 1) {
        await wait(attempt === 0 ? 700 : 900);
        const response = await fetchResult(token);
        if (!response.pending) {
          if (!response.ok) throw new Error(response.error || 'AI 분석에 실패했어요.');
          return response.result;
        }
      }
      throw new Error('분석 시간이 길어지고 있어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      frame.remove();
      form.remove();
    }
  }

  function showResult(data) {
    const recognized = Boolean(data && data.recognized);
    document.getElementById('aiCategory').textContent = data.category || (recognized ? '발견한 대상' : '인식 어려움');
    document.getElementById('aiName').textContent = recognized ? (data.name || '이름을 확인 중이에요') : '대상을 확실히 인식하지 못했어요';
    document.getElementById('aiLatin').textContent = recognized && data.latin ? data.latin : '';
    const confidence = Math.max(0, Math.min(100, Number(data.confidence) || 0));
    document.getElementById('aiConfidence').textContent = `${confidence}%`;
    document.getElementById('aiDescription').textContent = data.description || '대상이 더 크게 보이도록 밝은 곳에서 다시 촬영해 주세요.';
    document.getElementById('aiGuide').textContent = data.guide || '안전거리를 지키고 생물을 만지거나 이동시키지 마세요.';
    setState('result');
  }

  async function analyze(file) {
    if (!file) return;
    try {
      error.textContent = '';
      const photo = await prepareImage(file);
      preview.src = photo.previewUrl;
      preview.classList.remove('hidden');
      prompt.classList.add('hidden');
      setState('loading');
      const analysis = await requestAnalysis(photo);
      showResult(analysis);
    } catch (caught) {
      error.textContent = caught.message || '사진을 분석하지 못했어요. 잠시 후 다시 시도해 주세요.';
      setState('error');
    } finally {
      galleryInput.value = '';
      cameraInput.value = '';
    }
  }

  galleryInput.addEventListener('change', (event) => analyze(event.target.files[0]));
  cameraInput.addEventListener('change', (event) => analyze(event.target.files[0]));
  galleryButton.addEventListener('click', () => galleryInput.click());
  cameraButton.addEventListener('click', () => cameraInput.click());
  analyzeAgain.addEventListener('click', () => {
    preview.removeAttribute('src');
    preview.classList.add('hidden');
    prompt.classList.remove('hidden');
    setState('idle');
    galleryInput.focus();
  });
})();
