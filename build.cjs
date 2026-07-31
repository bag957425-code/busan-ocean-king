const fs = require('fs');
const path = require('path');
const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const assets = {
  '/': { body: read('index.html'), type: 'text/html; charset=utf-8' },
  '/index.html': { body: read('index.html'), type: 'text/html; charset=utf-8' },
  '/style.css': { body: read('style.css'), type: 'text/css; charset=utf-8' },
  '/ai-photo.css': { body: read('ai-photo.css'), type: 'text/css; charset=utf-8' },
  '/ocean-ai.css': { body: read('ocean-ai.css'), type: 'text/css; charset=utf-8' },
  '/script.js': { body: read('script.js'), type: 'application/javascript; charset=utf-8' },
  '/ai-photo.js': { body: read('ai-photo.js'), type: 'application/javascript; charset=utf-8' },
  '/ocean-ai.js': { body: read('ocean-ai.js'), type: 'application/javascript; charset=utf-8' },
  '/firebase-auth.js': { body: read('firebase-auth.js'), type: 'application/javascript; charset=utf-8' }
};

const worker = `
const assets=${JSON.stringify(assets)};
const cors={
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'POST,OPTIONS',
  'access-control-allow-headers':'content-type'
};
function promptFor(input){
  if(input.action==='trash')return [
    '사진을 보고 해변이나 야외에서 수거할 수 있는 인공 쓰레기인지 판독하세요.',
    '자연물, 살아있는 생물, 풍경, 음식 자체는 쓰레기가 아닙니다. 버려진 포장지, 병, 캔, 비닐, 담배꽁초, 폐어구 등만 쓰레기입니다.',
    '확실하지 않으면 isTrash를 false로 하세요.',
    'JSON만 반환: {"isTrash":true,"confidence":0,"item":"물체 이름","reason":"판단 근거","recyclable":"분리배출 안내"}'
  ].join(' ');
  if(input.action==='quiz')return [
    '한국어 어린이 해양 환경 교육 퀴즈를 지금 새로 1개 만드세요. 매번 소재와 표현을 바꾸세요.',
    '부산 바다, 해양생물, 기후, 해양쓰레기, 안전한 관찰 중 하나를 골라 사실이 명확한 객관식 문제를 만드세요.',
    '정답은 하나뿐이고 선택지는 3~4개입니다.',
    'JSON만 반환: {"question":"문제","choices":["선택1","선택2","선택3"],"correctIndex":0,"explanation":"두 문장 이내 설명"}'
  ].join(' ');
  if(input.action==='species-info')return [
    input.name+'('+input.latin+')의 실제 생태 정보를 웹에서 확인해 초등학생도 이해할 한국어로 설명하세요.',
    '서식지, 먹이, 생김새, 행동, 생태계 역할, 보전 또는 안전한 관찰을 서로 다른 내용으로 쓰세요.',
    '과장하거나 추측하지 말고 최소 5개, 최대 7개의 완전한 문장으로 만드세요.',
    'JSON만 반환: {"lines":["문장1","문장2","문장3","문장4","문장5"],"sourceNote":"확인한 정보 요약"}'
  ].join(' ');
  if(input.action==='local-species')return [
    '위도 '+input.latitude+', 경도 '+input.longitude+' 주변 바다에서 비교적 관찰 가능성이 있는 해양생물을 후보 목록에서 고르세요.',
    '위치의 해역과 생물 분포를 고려해 4~8개만 고르고, 후보에 없는 id는 절대 만들지 마세요.',
    '후보: '+JSON.stringify(input.candidates),
    'JSON만 반환: {"ids":["후보 id"],"region":"해역 이름","reason":"선정 근거"}'
  ].join(' ');
  return [
    '사진 속 실제 대상을 분석하세요. 해양생물 또는 해안 생태 대상이면 종을 가능한 범위에서 식별하세요.',
    '확신이 낮으면 종을 단정하지 말고 recognized를 false로 하세요.',
    '한국어로 교육적이고 안전하게 설명하세요.',
    'JSON만 반환: {"recognized":true,"name":"한국어 이름","latin":"학명","category":"분류","confidence":90,"description":"특징과 생태를 3문장 이상","guide":"안전한 관찰법"}'
  ].join(' ');
}
async function callGemini(input,env){
  if(!env.GEMINI_API_KEY)throw new Error('AI 서버 키가 설정되지 않았어요.');
  const parts=[];
  if(input.image)parts.push({inline_data:{mime_type:input.mimeType||'image/jpeg',data:input.image}});
  parts.push({text:promptFor(input)});
  const grounded=['quiz','species-info','local-species'].includes(input.action);
  const payload={
    contents:[{parts}],
    generationConfig:{responseMimeType:'application/json',temperature:grounded?0.8:0.1}
  };
  if(grounded)payload.tools=[{google_search:{}}];
  let response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',{
    method:'POST',
    headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify(payload)
  });
  if(!response.ok&&grounded){
    delete payload.tools;
    response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',{
      method:'POST',
      headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify(payload)
    });
  }
  const body=await response.json();
  if(!response.ok)throw new Error(body.error?.message||'Gemini 분석에 실패했어요.');
  const text=body.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('')||'{}';
  return JSON.parse(text.replace(/^\\\`\\\`\\\`json\\s*|\\\`\\\`\\\`$/g,'').trim());
}
export default{
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/ai'){
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
      if(request.method!=='POST')return Response.json({ok:false,error:'POST 요청만 지원합니다.'},{status:405,headers:cors});
      try{
        const input=await request.json();
        if(input.image&&input.image.length>3000000)throw new Error('사진 데이터가 너무 커요.');
        const result=await callGemini(input,env);
        return Response.json({ok:true,result},{headers:cors});
      }catch(error){
        return Response.json({ok:false,error:String(error.message||error)},{status:400,headers:cors});
      }
    }
    const asset=assets[url.pathname]||assets['/'];
    return new Response(asset.body,{headers:{'content-type':asset.type,'cache-control':url.pathname==='/'?'no-cache':'public, max-age=300'}});
  }
};`;

fs.mkdirSync(path.join(root, 'dist', 'server'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'server', 'index.js'), worker);
fs.mkdirSync(path.join(root, 'dist', '.openai'), { recursive: true });
fs.copyFileSync(path.join(root, '.openai', 'hosting.json'), path.join(root, 'dist', '.openai', 'hosting.json'));
