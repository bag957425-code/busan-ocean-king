(() => {
  const rows = [
    ['mackerel','고등어','Scomber japonicus','🐟','흔함','부산 연안과 외해','큰 무리를 지어 빠르게 이동하는 부산의 대표 회유성 어류'],
    ['rock-bream','돌돔','Oplegnathus fasciatus','🐠','보통','태종대·오륙도 암초','단단한 이빨로 조개와 성게 껍데기를 깨 먹는 암초성 어류'],
    ['seahorse','해마','Hippocampus coronatus','🐠','희귀','기장·영도 해조류 숲','수컷이 육아낭에서 알을 보호하는 특별한 물고기'],
    ['octopus','참문어','Octopus vulgaris','🐙','보통','기장·영도 바위틈','색과 무늬를 바꾸고 빨판으로 주변을 탐색하는 영리한 두족류'],
    ['starfish','별불가사리','Patiria pectinifera','⭐','흔함','다대포·송정 조간대','관족이라는 작은 발로 천천히 이동하는 극피동물'],
    ['sea-turtle','푸른바다거북','Chelonia mydas','🐢','전설','부산 외해','먼 바다를 이동하며 해초를 먹는 보호 대상 바다거북'],
    ['moon-jelly','보름달물해파리','Aurelia coerulea','🪼','보통','수영만·부산 연안','네 개의 고리 모양 생식샘이 보이는 반투명 해파리'],
    ['squid','살오징어','Todarodes pacificus','🦑','보통','기장 앞바다','색소포로 몸빛을 바꾸고 제트 추진으로 헤엄치는 두족류'],
    ['dolphin','상괭이','Neophocaena asiaeorientalis','🐬','희귀','남해와 부산 외해','등지느러미가 없고 둥근 머리를 가진 작은 고래류'],
    ['crab','꽃게','Portunus trituberculatus','🦀','보통','낙동강 하구 모래바닥','노처럼 납작한 마지막 다리로 헤엄치는 게'],
    ['anchovy','멸치','Engraulis japonicus','🐟','흔함','기장 연안','먹이그물에서 많은 물고기와 바닷새를 지탱하는 소형 어류'],
    ['sea-hare','군소','Aplysia kurodai','🐌','희귀','송정·청사포 얕은 암반','해조류를 먹고 위협받으면 보라색 액체를 내는 바다달팽이'],
    ['horse-mackerel','전갱이','Trachurus japonicus','🐟','흔함','부산 연안 방파제와 외해','옆줄의 단단한 비늘판이 몸을 보호하는 무리성 어류'],
    ['red-seabream','참돔','Pagrus major','🐟','보통','기장·오륙도 암초','붉은 몸빛과 푸른 반점이 특징인 연안 대표 어류'],
    ['black-seabream','감성돔','Acanthopagrus schlegelii','🐟','보통','낙동강 하구·암초 연안','강 하구의 염분 변화에도 적응하는 힘이 강한 어류'],
    ['largescale-blackfish','벵에돔','Girella punctata','🐟','보통','영도·태종대 암반','해조류와 작은 무척추동물을 함께 먹는 암초성 어류'],
    ['sea-bass','농어','Lateolabrax japonicus','🐟','보통','낙동강 하구와 부산 연안','어릴 때 하구에서 자라고 성장하면 연안으로 이동하는 포식자'],
    ['flathead-grey-mullet','숭어','Mugil cephalus','🐟','흔함','수영강·낙동강 하구','바닥의 유기물과 조류를 먹으며 하구를 오가는 어류'],
    ['yellowtail','방어','Seriola quinqueradiata','🐟','보통','부산 외해','계절에 따라 긴 거리를 이동하는 빠른 대형 회유어'],
    ['greater-amberjack','부시리','Seriola lalandi','🐟','희귀','오륙도·생도 외해','힘찬 꼬리로 암초 주변을 빠르게 순찰하는 대형 어류'],
    ['largehead-hairtail','갈치','Trichiurus japonicus','🐟','보통','부산 먼바다','은빛 띠 모양 몸으로 밤에 수직 이동하는 포식성 어류'],
    ['spanish-mackerel','삼치','Scomberomorus niphonius','🐟','보통','기장·부산 외해','날카로운 이빨과 유선형 몸으로 작은 물고기를 추격하는 어류'],
    ['pacific-saury','꽁치','Cololabis saira','🐟','보통','부산 동쪽 외해','수면 가까이 무리를 이루며 계절 이동을 하는 표층성 어류'],
    ['pacific-herring','청어','Clupea pallasii','🐟','보통','기장 연안','차가운 계절 연안에 접근해 무리로 산란하는 어류'],
    ['japanese-sardine','정어리','Sardinops melanostictus','🐟','흔함','부산 연안과 외해','플랑크톤을 걸러 먹고 거대한 무리를 만드는 소형 회유어'],
    ['dotted-gizzard-shad','전어','Konosirus punctatus','🐟','보통','낙동강 하구·다대포','하구와 연안을 오가며 플랑크톤과 유기물을 먹는 어류'],
    ['halfbeak','학꽁치','Hyporhamphus sajori','🐟','보통','광안리·해운대 표층','아래턱이 길고 수면 가까이 떼를 지어 헤엄치는 어류'],
    ['filefish','쥐치','Stephanolepis cirrhifer','🐠','보통','오륙도·태종대 암초','거친 피부와 작은 입으로 부착생물을 뜯어 먹는 어류'],
    ['black-scraper','말쥐치','Thamnaconus modestus','🐠','보통','기장·부산 외해','등지느러미 가시를 세워 몸을 방어하는 어류'],
    ['grass-puffer','복섬','Takifugu niphobles','🐡','흔함','부산 조간대와 하구','위협받으면 물을 삼켜 몸을 부풀리는 작은 복어'],
    ['tiger-puffer','자주복','Takifugu rubripes','🐡','희귀','부산 연안 모래바닥','강한 이빨과 독을 지닌 복어류로 눈으로만 관찰해야 하는 종'],
    ['olive-flounder','넙치','Paralichthys olivaceus','🐟','보통','다대포·송정 모래바닥','두 눈이 몸의 왼쪽으로 이동해 바닥에 숨어 사는 어류'],
    ['brown-sole','참가자미','Pleuronectes herzensteini','🐟','보통','부산 연안 모래·펄 바닥','납작한 몸으로 바닥 색에 섞여 작은 저서생물을 먹는 어류'],
    ['marbled-sole','문치가자미','Pseudopleuronectes yokohamae','🐟','보통','낙동강 하구 모래바닥','얕은 바다 바닥에 몸을 숨기고 겨울철 산란하는 어류'],
    ['finespotted-flounder','도다리','Pleuronichthys cornutus','🐟','보통','부산 연안 모래바닥','몸 오른쪽에 두 눈이 모여 있는 작은 가자미류'],
    ['black-rockfish','조피볼락','Sebastes schlegelii','🐟','보통','방파제·암초','바위 그늘에 머물며 새끼를 낳는 난태생 볼락류'],
    ['goldeye-rockfish','불볼락','Sebastes thompsoni','🐟','보통','기장·오륙도 암초','큰 눈으로 어두운 암초 주변의 먹이를 찾는 볼락류'],
    ['jacopever','개볼락','Sebastes pachycephalus','🐟','보통','영도·송정 바위틈','얼룩무늬 몸으로 암초에 위장하는 정착성 어류'],
    ['marbled-rockfish','쏨뱅이','Sebastiscus marmoratus','🐟','보통','부산 얕은 암초','등지느러미 가시에 독이 있어 만지지 않아야 하는 어류'],
    ['whitespotted-conger','붕장어','Conger myriaster','🐍','보통','부산 모래·펄 바닥','낮에는 바닥에 숨어 있고 밤에 먹이를 찾는 길쭉한 어류'],
    ['inshore-hagfish','먹장어','Eptatretus burgeri','🐍','보통','부산 연안 깊은 바닥','점액을 많이 분비하며 사체를 분해하는 원시적인 무악어류'],
    ['daggertooth-pike-conger','갯장어','Muraenesox cinereus','🐍','보통','부산 남쪽 연안','긴 턱과 날카로운 이빨로 물고기와 갑각류를 사냥하는 어류'],
    ['surfperch','망상어','Ditrema temminckii','🐟','흔함','광안리·영도 얕은 암초','알이 아닌 완성된 새끼를 낳는 태생 어류'],
    ['pearl-spot-chromis','자리돔','Chromis notata','🐠','흔함','오륙도·태종대 암초','암초 위에서 플랑크톤을 먹으며 무리 짓는 작은 어류'],
    ['spotty-belly-greenling','노래미','Hexagrammos agrammus','🐟','흔함','송정·청사포 바위','바닥 가까이 머물고 계절에 따라 몸빛이 달라지는 어류'],
    ['fat-greenling','쥐노래미','Hexagrammos otakii','🐟','보통','기장·영도 암초','수컷이 산란장을 지키며 알을 보호하는 바닥성 어류'],
    ['multicolorfin-rainbowfish','용치놀래기','Parajulis poecilepterus','🐠','보통','오륙도·생도 암초','성장 과정에서 성과 몸빛이 변할 수 있는 화려한 놀래기류'],
    ['chameleon-wrasse','놀래기','Halichoeres tenuispinis','🐠','보통','부산 연안 해조류 숲','밤이면 모래 속에 몸을 숨겨 쉬는 작은 암초성 어류'],
    ['nakedheaded-goby','날개망둑','Favonigobius gymnauchen','🐟','흔함','낙동강 하구 모래바닥','얕은 하구 바닥에서 작은 무척추동물을 먹는 망둑어류'],
    ['yellowfin-goby','문절망둑','Acanthogobius flavimanus','🐟','흔함','낙동강 하구 펄바닥','민물과 바닷물이 만나는 곳에 잘 적응하는 망둑어류'],
    ['striated-frogfish','빨간씬벵이','Antennarius striatus','🐠','희귀','오륙도·영도 암초','낚싯대 같은 유인돌기로 먹이를 끌어당기는 위장 명수'],
    ['lizardfish','매퉁이','Saurida macrolepis','🐟','보통','부산 연안 모래바닥','모래 위에 엎드려 지나가는 먹이를 기습하는 포식자'],
    ['bartail-flathead','양태','Platycephalus indicus','🐟','보통','다대포·기장 모래바닥','납작한 머리와 위장색으로 바닥에 숨어 사냥하는 어류'],
    ['spiny-red-gurnard','성대','Chelidonichthys spinosus','🐟','보통','부산 모래·펄 바닥','가슴지느러미 아래의 분리된 지느러미살로 바닥을 더듬는 어류'],
    ['john-dory','달고기','Zeus faber','🐟','희귀','부산 외해 중층','옆으로 납작한 몸과 둥근 검은 무늬가 특징인 포식자'],
    ['japanese-whiting','보리멸','Sillago japonica','🐟','흔함','해운대·송정 모래바닥','모래 속 작은 갑각류와 갯지렁이를 찾는 가느다란 어류'],
    ['snailfish','꼼치','Liparis tanakae','🐟','희귀','부산 연안 깊은 바닥','부드러운 몸과 흡반 모양 배지느러미를 가진 냉수성 어류'],
    ['seaweed-pipefish','실고기','Syngnathus schlegeli','🐟','희귀','기장 해조류 숲','길고 가는 몸으로 해조류 사이에 위장하는 해마 친척'],
    ['butterfish','샛돔','Psenopsis anomala','🐟','보통','부산 외해 중층','납작한 은회색 몸으로 무리를 지어 이동하는 어류'],
    ['brown-croaker','민어','Miichthys miiuy','🐟','희귀','낙동강 하구와 부산 연안','부레를 울려 낮은 소리를 내는 대형 민어과 어류'],
    ['small-yellow-croaker','참조기','Larimichthys polyactis','🐟','보통','부산 남쪽 외해','황금빛 몸과 소리를 내는 부레가 특징인 회유성 어류'],
    ['silver-pomfret','병어','Pampus argenteus','🐟','보통','부산 외해 중층','매우 납작한 은빛 몸으로 플랑크톤과 작은 동물을 먹는 어류'],
    ['mottled-spinefoot','독가시치','Siganus fuscescens','🐠','희귀','기장·오륙도 해조류 숲','해조류를 먹지만 지느러미 가시에 독이 있어 주의해야 하는 어류'],
    ['neon-damselfish','파랑돔','Pomacentrus coelestis','🐠','희귀','부산 남쪽 암초','따뜻한 물을 따라 북상하며 푸른색 몸이 선명한 작은 어류'],
    ['bluestriped-angelfish','청줄돔','Chaetodontoplus septentrionalis','🐠','희귀','오륙도·생도 암초','파란 줄무늬와 노란 꼬리가 돋보이는 온대성 암초 어류'],
    ['japanese-sweeper','주걱치','Pempheris japonica','🐟','보통','영도·태종대 수중 동굴','낮에는 그늘에 모이고 밤에 플랑크톤을 먹는 어류'],
    ['asian-sheepshead-wrasse','혹돔','Semicossyphus reticulatus','🐠','희귀','오륙도 깊은 암초','성장한 수컷의 이마가 크게 솟는 대형 놀래기류'],
    ['ghost-crab','달랑게','Ocypode stimpsoni','🦀','희귀','다대포 모래해변','빠르게 달리며 모래에 굴을 파는 해변 건강 지표종'],
    ['mudflat-crab','풀게','Hemigrapsus penicillatus','🦀','흔함','낙동강 하구 돌밭','집게다리에 털다발이 있고 하구 돌 아래에 사는 게'],
    ['shore-crab','무늬발게','Hemigrapsus sanguineus','🦀','흔함','부산 바위 조간대','다리의 줄무늬가 뚜렷하고 바위틈을 빠르게 움직이는 게'],
    ['fiddler-crab','농게','Tubuca arcuata','🦀','희귀','낙동강 하구 갯벌','수컷의 한쪽 집게가 매우 커서 신호를 보내는 갯벌 생물'],
    ['hermit-crab','참집게','Pagurus filholi','🦀','흔함','송정·청사포 조간대','빈 고둥 껍데기를 집으로 사용하고 성장하면 집을 바꾸는 갑각류'],
    ['mantis-shrimp','갯가재','Oratosquilla oratoria','🦐','보통','부산 연안 펄바닥','강한 앞다리로 먹이를 순간적으로 공격하는 굴 생활 갑각류'],
    ['chinese-shrimp','대하','Fenneropenaeus chinensis','🦐','보통','낙동강 하구와 연안','하구에서 어린 시기를 보내고 바다로 이동하는 대형 새우'],
    ['kuruma-prawn','보리새우','Marsupenaeus japonicus','🦐','보통','부산 모래바닥','몸의 가로띠가 선명하고 밤에 활동하는 모래바닥 새우'],
    ['acorn-barnacle','따개비','Amphibalanus amphitrite','🐚','흔함','부산 항만·바위 조간대','석회질 껍데기로 바위에 붙어 물속 먹이를 걸러 먹는 갑각류'],
    ['goose-barnacle','거북손','Pollicipes mitella','🐚','보통','태종대·영도 파도 센 바위','긴 자루로 바위에 붙고 깃털 같은 다리로 먹이를 거르는 갑각류'],
    ['pacific-oyster','굴','Magallana gigas','🦪','흔함','낙동강 하구·암반','물을 걸러 먹으며 수질과 서식 공간에 영향을 주는 이매패류'],
    ['mediterranean-mussel','진주담치','Mytilus galloprovincialis','🦪','흔함','부산 항만·방파제','족사라는 실로 구조물에 단단히 붙어 군집을 이루는 조개'],
    ['hard-shelled-mussel','홍합','Mytilus coruscus','🦪','보통','기장·영도 암반','거친 파도에도 견디며 바위에 붙어 사는 큰 홍합류'],
    ['veined-rapa-whelk','피뿔고둥','Rapana venosa','🐚','보통','부산 연안 모래·암반','다른 조개를 잡아먹는 크고 단단한 육식성 고둥'],
    ['horned-turban','소라','Turbo sazae','🐚','보통','기장·오륙도 해조류 암반','단단한 뚜껑으로 입구를 막고 해조류를 갉아 먹는 고둥'],
    ['disk-abalone','전복','Haliotis discus hannai','🐚','보통','기장 암반 해조류 숲','넓은 발로 바위에 붙고 밤에 해조류를 먹는 고둥류'],
    ['manila-clam','바지락','Ruditapes philippinarum','🦪','흔함','낙동강 하구 모래·펄','두 개의 수관으로 물을 빨아들여 먹이를 거르는 조개'],
    ['chinese-mactra','개량조개','Mactra chinensis','🦪','보통','다대포 모래바닥','모래 속에 몸을 묻고 수관으로 물속 먹이를 거르는 조개'],
    ['pen-shell','키조개','Atrina pectinata','🦪','희귀','부산 연안 펄바닥','큰 삼각형 껍데기의 끝을 바닥에 묻고 사는 조개'],
    ['sea-cucumber','해삼','Apostichopus japonicus','🪸','보통','기장·영도 암초 바닥','바닥 퇴적물을 먹고 유기물을 순환시키는 극피동물'],
    ['purple-sea-urchin','보라성게','Heliocidaris crassispina','🦔','보통','오륙도·태종대 암반','긴 가시로 몸을 보호하고 해조류를 갉아 먹는 성게'],
    ['short-spined-urchin','말똥성게','Hemicentrotus pulcherrimus','🦔','보통','부산 얕은 암반','짧고 촘촘한 가시로 덮인 둥근 극피동물'],
    ['northern-pacific-seastar','아무르불가사리','Asterias amurensis','⭐','흔함','부산 연안 모래·암반','조개를 잡아먹으며 환경 변화에 따라 크게 늘 수 있는 불가사리'],
    ['ghost-jellyfish','유령해파리','Cyanea nozakii','🪼','희귀','부산 연안','긴 촉수에 강한 자포가 있어 멀리서 관찰해야 하는 대형 해파리'],
    ['nomura-jellyfish','노무라입깃해파리','Nemopilema nomurai','🪼','희귀','부산 외해·연안','지름이 매우 크게 자라 어업과 해수욕 안전에 영향을 주는 해파리'],
    ['sea-anemone','갈색꽃해변말미잘','Anthopleura japonica','🪸','보통','송정·태종대 바위 조간대','촉수의 자포로 작은 먹이를 잡고 바위에 붙어 사는 자포동물'],
    ['red-ascidian','빨강멍게','Herdmania momus','🪸','보통','오륙도·영도 암초','붉은 몸의 두 수관으로 바닷물을 걸러 먹는 피낭동물'],
    ['sea-squirt','우렁쉥이','Halocynthia roretzi','🪸','보통','기장 깊은 암반','단단한 껍질 속에서 물을 걸러 플랑크톤을 먹는 피낭동물'],
    ['clubbed-tunicate','미더덕','Styela clava','🪸','보통','부산 항만·암반','자루 모양 몸으로 구조물에 붙어 물을 걸러 먹는 피낭동물'],
    ['spoon-worm','개불','Urechis unicinctus','🪱','희귀','낙동강 하구 펄바닥','U자형 굴을 만들고 점액 그물로 먹이를 모으는 의충동물'],
    ['clam-worm','두토막눈썹참갯지렁이','Perinereis aibuhitensis','🪱','흔함','낙동강 하구 갯벌','갯벌 속을 파고들며 퇴적물을 섞고 많은 동물의 먹이가 되는 환형동물'],
    ['sargassum','괭생이모자반','Sargassum horneri','🌿','보통','기장·부산 연안 표층','공기주머니로 떠다니며 어린 물고기의 임시 서식처가 되는 갈조류'],
    ['ecklonia','감태','Ecklonia cava','🌿','희귀','기장·오륙도 수중 암반','바닷속 숲을 만들어 수많은 생물에게 먹이와 은신처를 주는 대형 갈조류']
  ];

  const species = rows.map(([id, name, latin, icon, rarity, habitat, feature]) => ({
    id, name, latin, icon, rarity, habitat, feature,
    kind: 'species',
    facts: `${name}은(는) ${feature}입니다. 부산의 다양한 암반·모래·하구 생태계에서 먹이그물의 한 부분을 맡고 있어요.`,
    guide: '야생 개체는 잡거나 먹이를 주지 말고, 충분한 거리를 두고 원래 서식 환경을 훼손하지 않으며 관찰해요.'
  }));

  const wastes = [
    {
      id: 'plastic-bottle', name: '페트병', icon: '🧴', kind: 'waste', searchTerm: 'plastic bottle marine litter beach',
      impacts: [
        '페트병은 가볍고 잘 떠서 강과 하천을 따라 바다까지 이동해요.',
        '파도와 햇빛에 잘게 부서지면 오랫동안 남는 미세플라스틱이 될 수 있어요.',
        '물고기와 바닷새가 작은 플라스틱 조각을 먹이로 착각할 수 있어요.',
        '병 속이나 고리 부분에 작은 생물이 끼어 다치거나 움직이지 못할 수 있어요.',
        '내용물을 비우고 라벨과 뚜껑을 분리해 배출하면 새 플라스틱 사용을 줄이는 데 도움이 돼요.'
      ]
    },
    {
      id: 'plastic-bag', name: '비닐봉지', icon: '🛍️', kind: 'waste', searchTerm: 'plastic bag marine debris beach',
      impacts: [
        '비닐봉지는 물속에서 해파리처럼 보여 바다거북이 먹이로 착각할 수 있어요.',
        '삼킨 비닐은 소화기관을 막아 야생동물이 제대로 먹지 못하게 만들 수 있어요.',
        '얇은 비닐은 해조류와 산호를 덮어 빛과 물의 흐름을 방해해요.',
        '시간이 지나 잘게 찢어져도 완전히 사라지지 않고 미세플라스틱으로 남아요.',
        '장바구니와 다회용 봉투를 사용하면 바다로 흘러가는 비닐을 줄일 수 있어요.'
      ]
    },
    {
      id: 'foam-buoy', name: '스티로폼 부표', icon: '⬜', kind: 'waste', searchTerm: 'polystyrene foam buoy marine debris beach',
      impacts: [
        '스티로폼 부표는 파도와 충격에 쉽게 부서져 수많은 작은 알갱이가 돼요.',
        '작은 알갱이는 해변 모래와 섞여 한 번에 수거하기 매우 어려워요.',
        '물고기와 바닷새가 알갱이를 먹이로 오인해 삼킬 수 있어요.',
        '표면에 오염물질이 붙은 채 먹이그물 안으로 이동할 가능성도 있어요.',
        '내구성 높은 인증 부표를 사용하고 잃어버린 부표를 회수하는 관리가 필요해요.'
      ]
    },
    {
      id: 'ghost-net', name: '폐어망·낚싯줄', icon: '🕸️', kind: 'waste', searchTerm: 'ghost fishing net marine debris',
      impacts: [
        '버려진 어망과 낚싯줄은 주인 없이도 계속 생물을 잡는 유령어업을 일으켜요.',
        '물고기·바다거북·새·해양포유류가 감기면 상처를 입거나 숨을 쉬지 못할 수 있어요.',
        '암초와 해조류 숲에 걸리면 서식지를 긁고 부러뜨릴 수 있어요.',
        '나일론 줄은 매우 오래 남으며 잘게 부서져 미세플라스틱이 될 수 있어요.',
        '낚시 뒤 줄과 바늘을 전용 수거함에 버리고 발견한 대형 어망은 안전기관에 신고해야 해요.'
      ]
    },
    {
      id: 'cigarette-butt', name: '담배꽁초', icon: '🚬', kind: 'waste', searchTerm: 'cigarette butts beach litter',
      impacts: [
        '담배꽁초 필터는 종이가 아니라 미세한 플라스틱 섬유로 만들어져요.',
        '빗물받이에 버려진 꽁초는 하천을 거쳐 바다로 바로 이동할 수 있어요.',
        '니코틴과 여러 화학물질이 물에 녹아 작은 수생생물에 해를 줄 수 있어요.',
        '잘게 부서진 필터 섬유는 해변과 바닷물 속 미세플라스틱을 늘려요.',
        '휴대용 재떨이를 사용하고 완전히 끈 꽁초를 일반쓰레기로 버려야 해요.'
      ]
    },
    {
      id: 'aluminum-can', name: '알루미늄 캔', icon: '🥫', kind: 'waste', searchTerm: 'aluminium can beach litter',
      impacts: [
        '찌그러지거나 찢어진 캔의 날카로운 가장자리는 사람과 야생동물에 상처를 줄 수 있어요.',
        '캔 안에 작은 생물이 들어가 갇히거나 먹이를 찾지 못할 수 있어요.',
        '바닷물 속에서 부식되는 동안 표면 코팅과 잔여 내용물이 주변에 퍼질 수 있어요.',
        '해변에 남은 캔은 경관을 해치고 맨발 이용자의 안전도 위협해요.',
        '알루미늄은 반복 재활용 가치가 높으므로 내용물을 비우고 분리배출하는 것이 중요해요.'
      ]
    },
    {
      id: 'glass-bottle', name: '유리병', icon: '🍾', kind: 'waste', searchTerm: 'glass bottle beach litter',
      impacts: [
        '유리병은 자연에서 쉽게 분해되지 않아 해변과 바닥에 오랫동안 남아요.',
        '깨진 유리 조각은 사람과 해양동물의 피부나 발을 깊게 베게 할 수 있어요.',
        '병 안에 들어간 작은 게와 물고기가 빠져나오지 못할 수 있어요.',
        '파도에 닳아 작아져도 날카로운 조각은 모래 사이에 숨어 안전사고를 만들어요.',
        '발견했을 때 맨손으로 잡지 말고 집게와 두꺼운 장갑을 사용해 안전하게 분리배출해야 해요.'
      ]
    }
  ];

  window.OceanCatalog = { species, wastes };
})();
