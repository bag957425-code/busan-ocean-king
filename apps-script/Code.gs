function promptFor_(input) {
  if (input.action === 'trash') {
    return [
      '사진을 보고 해변이나 야외에서 수거할 수 있는 인공 쓰레기인지 판독해.',
      '자연물, 살아있는 생물, 풍경, 음식 자체는 쓰레기가 아니야.',
      '버려진 포장지, 병, 캔, 비닐, 담배꽁초, 폐어구 등만 쓰레기로 판정해.',
      '확실하지 않으면 isTrash를 false로 하고 반드시 JSON만 반환해.',
      '{"isTrash":true,"confidence":90,"item":"물체 이름","reason":"판단 근거","recyclable":"분리배출 안내"}'
    ].join(' ');
  }
  if (input.action === 'quiz') {
    return [
      '한국어 어린이 해양 환경 교육 퀴즈를 지금 새로 1개 만들어.',
      '부산 바다, 해양생물, 기후, 해양쓰레기, 안전한 관찰 중 하나를 골라 매번 소재와 표현을 바꿔.',
      '사실이 명확하고 정답이 하나뿐인 3~4지선다 문제로 만들고 반드시 JSON만 반환해.',
      '{"question":"문제","choices":["선택1","선택2","선택3"],"correctIndex":0,"explanation":"두 문장 이내 설명"}'
    ].join(' ');
  }
  if (input.action === 'species-info') {
    return [
      input.name + '(' + input.latin + ')의 실제 생태 정보를 확인해 초등학생도 이해할 한국어로 설명해.',
      '서식지, 먹이, 생김새, 행동, 생태계 역할, 보전 또는 안전한 관찰을 서로 다른 내용으로 써.',
      '과장하거나 추측하지 말고 최소 5개, 최대 7개의 완전한 문장으로 만들고 반드시 JSON만 반환해.',
      '{"lines":["문장1","문장2","문장3","문장4","문장5"],"sourceNote":"확인한 정보 요약"}'
    ].join(' ');
  }
  if (input.action === 'local-species') {
    return [
      '위도 ' + input.latitude + ', 경도 ' + input.longitude + ' 주변 바다에서 비교적 관찰 가능성이 있는 해양생물을 후보에서 골라.',
      '위치의 해역과 생물 분포를 고려해 4~8개만 고르고 후보에 없는 id는 만들지 마.',
      '후보: ' + JSON.stringify(input.candidates || []),
      '반드시 JSON만 반환해: {"ids":["후보 id"],"region":"해역 이름","reason":"선정 근거"}'
    ].join(' ');
  }
  return [
    '사진 속 실제 대상을 분석하고 반드시 JSON만 반환해.',
    '해양생물 또는 해안 생태 대상이면 종을 가능한 범위에서 식별하고 확신이 낮으면 recognized를 false로 해.',
    '{"recognized":true,"name":"한국어 이름","latin":"학명","category":"분류","confidence":90,',
    '"description":"특징과 생태를 세 문장 이상","guide":"안전한 관찰법"}',
    '모든 설명은 쉽고 정확한 한국어로 작성해.'
  ].join(' ');
}

function doPost(e) {
  var input = JSON.parse(e.parameter.payload || '{}');
  var token = input.token;
  try {
    var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!key) throw new Error('GEMINI_API_KEY가 없습니다.');
    var parts = [];
    if (input.image) {
      parts.push({
        inline_data: {
          mime_type: input.mimeType || 'image/jpeg',
          data: input.image
        }
      });
    }
    parts.push({ text: promptFor_(input) });
    var payload = {
      contents: [{ parts: parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: ['quiz', 'species-info', 'local-species'].indexOf(input.action) >= 0 ? 0.8 : 0.1
      }
    };
    if (['quiz', 'species-info', 'local-species'].indexOf(input.action) >= 0) {
      payload.tools = [{ google_search: {} }];
    }
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': key },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() >= 400 && payload.tools) {
      delete payload.tools;
      options.payload = JSON.stringify(payload);
      response = UrlFetchApp.fetch(url, options);
    }
    var body = JSON.parse(response.getContentText());
    if (response.getResponseCode() >= 400) {
      throw new Error(body.error && body.error.message || 'Gemini 호출 오류');
    }
    var resultText = body.candidates[0].content.parts.map(function (part) {
      return part.text || '';
    }).join('').replace(/^```json\s*|```$/g, '').trim();
    CacheService.getScriptCache().put(token, JSON.stringify({
      ok: true,
      result: JSON.parse(resultText)
    }), 180);
  } catch (error) {
    CacheService.getScriptCache().put(token, JSON.stringify({
      ok: false,
      error: String(error.message || error)
    }), 180);
  }
  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  var callback = e.parameter.callback || 'callback';
  var token = e.parameter.token || '';
  var value = CacheService.getScriptCache().get(token);
  var payload = value || JSON.stringify({ ok: false, pending: true });
  return ContentService
    .createTextOutput(callback + '(' + payload + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
