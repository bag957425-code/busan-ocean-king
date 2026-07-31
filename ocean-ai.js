(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxvyo59LsqRySBpinKRk6lOKrzBlTT7FSu0-xAygrpsmy3s7eOutUlYY4_5dFhSvxGe/exec';
  const photoPools = new Map();
  const photoIndexes = new Map();

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function prepareImage(file) {
    if (!file?.type?.startsWith('image/')) throw new Error('사진 파일을 선택해 주세요.');
    if (file.size > 12 * 1024 * 1024) throw new Error('사진 크기는 12MB 이하로 선택해 주세요.');
    const originalUrl = await readAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('지원하지 않는 사진 형식이에요.'));
      element.src = originalUrl;
    });
    const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 변환하지 못했어요.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const previewUrl = canvas.toDataURL('image/jpeg', 0.82);
    return { data: previewUrl.split(',')[1], mimeType: 'image/jpeg', previewUrl };
  }

  function fetchResult(token) {
    return new Promise((resolve) => {
      const callbackName = `oceanAi_${token.replace(/[^a-z0-9]/gi, '')}`;
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
      script.src = `${API_URL}?token=${encodeURIComponent(token)}&callback=${callbackName}`;
      document.head.appendChild(script);
    });
  }

  async function request(action, payload = {}) {
    const token = `${Date.now()}${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement('iframe');
    const form = document.createElement('form');
    const field = document.createElement('textarea');
    frame.name = `oceanAiUpload${token}`;
    frame.hidden = true;
    form.hidden = true;
    form.method = 'POST';
    form.action = API_URL;
    form.target = frame.name;
    field.name = 'payload';
    field.value = JSON.stringify({ action, token, ...payload });
    form.appendChild(field);
    document.body.append(frame, form);
    form.submit();
    try {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, attempt ? 900 : 650));
        const response = await fetchResult(token);
        if (!response.pending) {
          if (!response.ok) throw new Error(response.error || 'AI 연결이 잠시 원활하지 않아요.');
          return Array.isArray(response.result) ? (response.result[0] || {}) : response.result;
        }
      }
      throw new Error('AI 응답 시간이 길어지고 있어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      frame.remove();
      form.remove();
    }
  }

  async function loadPhotoPool(item) {
    if (photoPools.has(item.id)) return photoPools.get(item.id);
    const searchName = item.latin || item.name;
    const params = new URLSearchParams({
      taxon_name: searchName,
      photos: 'true',
      quality_grade: 'research',
      term_id: '17',
      term_value_id: '18',
      per_page: '30',
      order: 'desc',
      order_by: 'id'
    });
    const response = await fetch(`https://api.inaturalist.org/v1/observations?${params}`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('살아있는 생물 관찰 사진을 불러오지 못했어요.');
    const data = await response.json();
    const photos = (data.results || []).flatMap((observation) =>
      (observation.observation_photos || []).map(({ photo }) => ({
        url: photo?.url?.replace('/square.', '/large.'),
        source: `https://www.inaturalist.org/observations/${observation.id}`,
        title: `${item.name} 살아있는 개체 관찰`,
        credit: photo?.attribution || 'iNaturalist 관찰자'
      }))
    ).filter((photo) => photo.url);
    if (!photos.length) throw new Error('살아있는 상태로 확인된 관찰 사진을 찾지 못했어요.');
    photos.sort(() => Math.random() - 0.5);
    photoPools.set(item.id, photos);
    return photos;
  }

  async function nextSpeciesPhoto(item) {
    const photos = await loadPhotoPool(item);
    const index = photoIndexes.get(item.id) || 0;
    photoIndexes.set(item.id, index + 1);
    return photos[index % photos.length];
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('이 기기에서는 위치 기능을 사용할 수 없어요.'));
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        }),
        () => reject(new Error('위치 권한을 허용하면 현재 지역의 바다 정보를 볼 수 있어요.')),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
      );
    });
  }

  async function getWeather(position) {
    const { latitude, longitude } = position;
    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.search = new URLSearchParams({
      latitude, longitude,
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'auto'
    });
    const marineUrl = new URL('https://marine-api.open-meteo.com/v1/marine');
    marineUrl.search = new URLSearchParams({
      latitude, longitude,
      current: 'wave_height,sea_surface_temperature',
      cell_selection: 'sea',
      timezone: 'auto'
    });
    const [weatherResponse, marineResponse] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);
    if (!weatherResponse.ok) throw new Error('현재 날씨를 불러오지 못했어요.');
    const weather = await weatherResponse.json();
    const marine = marineResponse.ok ? await marineResponse.json() : {};
    return { ...weather.current, ...(marine.current || {}) };
  }

  window.OceanAI = {
    request,
    prepareImage,
    nextSpeciesPhoto,
    getPosition,
    getWeather
  };
})();
