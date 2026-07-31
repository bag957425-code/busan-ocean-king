(() => {
  const SITES_ORIGIN = 'https://busan-ocean-king.qudwls132.chatgpt.site';
  const API_URL = `${SITES_ORIGIN}/api/ai`;
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

  async function request(action, payload = {}) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || 'AI 연결이 잠시 원활하지 않아요.');
    return data.result;
  }

  async function loadPhotoPool(item) {
    if (photoPools.has(item.id)) return photoPools.get(item.id);
    const searchName = item.latin || item.name;
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      generator: 'search',
      gsrsearch: `${searchName} filetype:bitmap`,
      gsrnamespace: '6',
      gsrlimit: '20',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '720'
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    const data = await response.json();
    const photos = Object.values(data.query?.pages || {}).map((page) => {
      const info = page.imageinfo?.[0];
      return {
        url: info?.thumburl || info?.url,
        source: info?.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        title: page.title.replace(/^File:/, ''),
        credit: info?.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '') || 'Wikimedia Commons'
      };
    }).filter((photo) => photo.url && /\.(jpe?g|png|webp)(\?|$)/i.test(photo.url));
    if (!photos.length) throw new Error('실제 생물 사진을 찾지 못했어요.');
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
