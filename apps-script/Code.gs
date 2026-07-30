function doPost(e) {
  const input = JSON.parse(e.parameter.payload || '{}');
  const token = input.token;

  try {
    const key = PropertiesService.getScriptProperties()
      .getProperty('GEMINI_API_KEY');

    if (!key) throw new Error('GEMINI_API_KEY가 없습니다.');

    const prompt = [
      '사진 속 대상을 분석하고 반드시 JSON만 반환해.',
      '분석 대상은 육상·민물·해양의 동물과 곤충, 물고기, 외래종, 생태계교란종, 위험종, 멸종위기 야생생물,',
      '해안 지형 및 해양 지질이다.',
      '해안 지형에는 해식절벽, 해식동굴, 시스택, 파식대, 갯벌,',
      '해안사구, 사빈, 자갈해안, 주상절리, 화산암 지형 등을 포함한다.',
      'JSON 형식:',
      '{"recognized":true,"name":"한국어 이름","latin":"학명 또는 영문명",',
      '"category":"외래종/생태계교란종/위험종/멸종위기 야생생물 I급/멸종위기 야생생물 II급/해안 지형/해양 지질/일반 관찰/미확인",',
      '"rarity":"낮음/보통/높음","risk":"안전/주의/고위험군",',
      '"confidence":90,"description":"특징, 형성과정 또는 생태 설명과 보전 가치",',
      '"guide":"관찰 안전수칙과 훼손 방지 안내","points":100}',
      '생태계 생물이나 해안 지형·해양 지질이 아니면 recognized를 false로 해.',
      '한국에서 알려진 생태계교란 생물로 판단되면 category를 반드시 생태계교란종으로 해.',
      '대한민국 멸종위기 야생생물로 판단되면 공식 등급에 따라 category를',
      '"멸종위기 야생생물 I급" 또는 "멸종위기 야생생물 II급"으로 해.',
      '멸종위기 여부가 불확실하면 멸종위기로 단정하지 말고 confidence를 낮춰.',
      '사진만으로 확정하기 어려우면 confidence를 낮추고 description에',
      '"사진 기반 추정 결과이며 전문가 확인이 필요합니다"라고 밝혀.',
      '모든 설명은 쉽고 정확한 한국어로 작성해.'
    ].join(' ');

    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-goog-api-key': key },
        payload: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: input.mimeType,
                  data: input.image
                }
              },
              { text: prompt }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }),
        muteHttpExceptions: true
      }
    );

    const body = JSON.parse(response.getContentText());

    if (response.getResponseCode() >= 400) {
      const apiMessage = body.error && body.error.message || 'Gemini 호출 오류';
      if (/quota|rate.?limit|retry/i.test(apiMessage)) {
        throw new Error('무료 AI 요청 한도에 잠시 도달했어요. 1분 후 다시 시도해 주세요.');
      }
      throw new Error(apiMessage);
    }

    const resultText = body.candidates[0].content.parts[0].text;
    CacheService.getScriptCache().put(
      token,
      JSON.stringify({
        ok: true,
        result: JSON.parse(resultText)
      }),
      120
    );
  } catch (error) {
    CacheService.getScriptCache().put(
      token,
      JSON.stringify({
        ok: false,
        error: String(error.message || error)
      }),
      120
    );
  }

  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const callback = e.parameter.callback || 'callback';
  const token = e.parameter.token || '';
  const value = CacheService.getScriptCache().get(token);
  const payload = value || JSON.stringify({
    ok: false,
    pending: true
  });

  return ContentService
    .createTextOutput(callback + '(' + payload + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
