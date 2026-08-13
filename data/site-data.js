/* ============================================================
   제천킹스파 · 사이트 콘텐츠 데이터
   ------------------------------------------------------------
   ▶ 이 파일만 수정하면 사이트 내용이 바뀝니다.
   ▶ HTML/CSS를 몰라도 아래 따옴표(" ") 안의 글자만 바꾸면 됩니다.
   ▶ 쉼표(,)와 중괄호({ })는 지우지 마세요.
   ============================================================ */

window.SITE_DATA = {

  /* ---------- 1. 기본 정보 ---------- */
  info: {
    name: "제천킹스파찜질방",
    shortName: "제천킹스파",
    tel: "043-646-5200",
    telRaw: "0436465200",          // 전화걸기용 (숫자만)
    address: "충북 제천시 풍양로9길 5",
    addressOld: "충북 제천시 의림동 50-1",
    hours: "24시간 연중무휴",
    naverMapUrl: "https://map.naver.com/p/search/%EC%A0%9C%EC%B2%9C%ED%82%B9%EC%8A%A4%ED%8C%8C%EC%B0%9C%EC%A7%88%EB%B0%A9",
    kakaoMapUrl: "https://map.kakao.com/?q=%EC%A0%9C%EC%B2%9C%ED%82%B9%EC%8A%A4%ED%8C%8C%EC%B0%9C%EC%A7%88%EB%B0%A9",
    instagramUrl: "",                // ⚠️ 인스타그램 주소가 있으면 입력 (없으면 빈칸 → 버튼 자동 숨김)

    // 사업자 정보 — 사업자등록증 그대로 (2026-08 확인)
    corpName: "주식회사 제천킹스파찜질방",   // 법인명 (간판 이름과 별개인 정식 상호)
    ceo: "김동술",
    bizNumber: "252-88-02984",
    // 법인등록번호(134211-0291685)는 홈페이지에 표시할 의무가 없어 넣지 않았습니다.
    // 통신판매업 신고번호는 온라인으로 물건·이용권을 파실 때만 필요합니다.
  },

  /* ---------- 2. 대문 사진 (슬라이드) ---------- */
  // 사진을 assets/img/ 에 넣고 아래에 한 줄씩 추가하면 순서대로 넘어갑니다.
  // 사진은 이미 배너 비율(16:9)로 잘라 두었습니다.
  hero: {
    interval: 5500,                  // 넘어가는 간격 (밀리초). 0 이면 자동으로 안 넘어감
    images: [
      { src: "assets/img/hero-1.jpg", alt: "제천킹스파찜질방 건물" },
      { src: "assets/img/hero-2.jpg", alt: "야외 노천탕" },
      { src: "assets/img/hero-3.jpg", alt: "대욕장 냉탕과 사우나" },
      { src: "assets/img/hero-4.jpg", alt: "옥상 물놀이 시설" },
      { src: "assets/img/hero-5.jpg", alt: "수면 릴렉스존" },
      { src: "assets/img/hero-6.jpg", alt: "전통 불가마" },
      { src: "assets/img/hero-7.jpg", alt: "헬스장" },
    ],
  },

  /* ---------- 3. 요금표 ---------- */
  // ✅ 목욕 대인 8,000원 확정 (2026-07 사업주 확인)
  // ⚠️ 나머지 금액은 최신 요금인지 한 번 더 확인해 주세요.
  pricing: {
    main: [
      { item: "목욕",                sub: "대욕장 · 사우나 · 노천탕",       adult: "8,000원",  child: "7,000원" },
      { item: "찜질방",              sub: "목욕 + 찜질 + 헬스장 무료",      adult: "12,000원", child: "11,000원" },
    ],
    // 결제 금액이 달라지는 안내라 요금표 바로 아래에 눈에 띄게 넣습니다
    childNote: "소인 기준이 만 5세로 변경되었습니다 — 12개월 ~ 60개월. 결제 전 꼭 확인해 주세요.",
    extras: [
      { label: "야간할증", value: "22:00 ~ 05:00 · 1,000원 추가" },
      // 기본 이용시간(6시간)과 초과 요금(10분당 200원)은 사업주 요청으로 뺐습니다.
      // 다시 넣으시려면 아래 두 줄 앞의 // 를 지우세요.
      // { label: "기본 이용시간", value: "6시간" },
      // { label: "초과 이용",     value: "6시간 초과 시 10분당 200원" },
    ],
    passes: [
      { name: "목욕 횟수권",   count: "10매",   price: "70,000원",  note: "1매당 7,000원" },
      { name: "찜질방 횟수권", count: "10매",   price: "110,000원", note: "1매당 11,000원" },
      { name: "목욕 정기권",   count: "1개월",  price: "129,000원", note: "정상가 270,000원", highlight: true },
    ],
    passFooter: "정기권은 1개월 · 3개월 · 6개월 · 1년 단위로 운영합니다. 자세한 사항은 프런트로 문의해 주세요.",
  },

  /* ---------- 4. 옥상 물놀이 시설 (시즌 배너) ---------- */
  waterslide: {
    show: true,                      // 시즌 끝나면 false 로 바꾸면 사이트에서 사라집니다
    title: "옥상 물놀이 시설",

    // 운영 기간 — 페이지에서 가장 크게 보이는 자리입니다
    season: {
      months: "7월 · 8월",
      note: "이 두 달 동안만 운영합니다",
      year: "2026년",
    },

    // 시설별 운영 시간
    attractions: [
      { name: "에어바운스", time: "10:00 ~ 17:30" },
      { name: "트램펄린",   time: "10:00 ~ 21:00" },
    ],

    // 시설 사진 — 사진을 바꾸시려면 assets/img 의 같은 이름 파일만 갈아 끼우면 됩니다
    photos: [
      { src: "assets/img/waterplay-air.jpg",   cap: "에어바운스",   alt: "옥상에 설치된 에어바운스" },
      { src: "assets/img/waterplay-tramp.jpg", cap: "트램펄린",     alt: "그물망을 두른 트램펄린" },
      { src: "assets/img/waterplay-slide.jpg", cap: "워터슬라이드", alt: "대형 워터슬라이드와 풀" },
      { src: "assets/img/waterplay-shade.jpg", cap: "그늘 쉼터",    alt: "초가 파라솔 아래 쉼터" },
    ],

    price: "찜질방 이용객 무료",
    wear: "수영복 지참을 권장합니다",

    // 안전 수칙 — 매장에서 안내하는 내용 그대로
    safety: [
      { title: "환복 규정",
        body: "찜질방으로 들어오실 때는 물기가 없는 상태로 이동해 주세요. 젖은 수영복과 수건에서 물이 떨어져 어린이 미끄럼 사고가 발생하고 있습니다." },
      { title: "체온 관리",
        body: "젖은 상태로 다니시면 체온이 떨어질 수 있습니다. 물놀이를 마치면 찜질복으로 갈아입어 주세요." },
      { title: "미끄럼 주의",
        body: "물이 있는 곳이라 바닥이 미끄럽습니다. 젖은 구간을 지나실 때 특히 조심해 주세요." },
    ],
  },

  /* ---------- 4-1. 위생 관리 (세스코) ---------- */
  // 시설안내 섹션 안, 시설 카드 아래에 나옵니다.
  // ⚠️ 실제로 받고 계신 서비스에 맞게 문장을 고쳐 주세요.
  hygiene: {
    show: true,
    badge: "assets/img/cesco.png",
    badgeAlt: "세스코 멤버스 인증 마크",
    title: "세스코가 관리합니다",
    desc: "많은 분이 오가는 곳이라 청결이 가장 중요합니다. " +
          "세스코 멤버스에 가입해 해충 방제와 위생 점검을 정기적으로 받고 있습니다.",
  },

  /* ---------- 5. 요일별 허브 노천탕 ---------- */
  herb: {
    // ⚠️ 7가지 허브의 요일별 배치를 알려주시면 showSchedule 을 true 로 바꿔 표로 보여드립니다.
    showSchedule: false,
    schedule: [
      { day: "월", herb: "" },
      { day: "화", herb: "" },
      { day: "수", herb: "" },
      { day: "목", herb: "" },
      { day: "금", herb: "" },
      { day: "토", herb: "" },
      { day: "일", herb: "" },
    ],
  },

  /* ---------- 6. 홍보 문구 ---------- */
  // "가성비~킹스파 / 가족끼리~킹스파 …" 의 뜻을 살리되,
  // '킹스파' 는 제목에서 한 번만 받고 아래에는 각자에게 와닿는 이유를 답니다.
  slogans: {
    show: true,
    title: "제천에 오면",
    titleStrong: "필수코스 킹스파",
    items: [
      { lead: "가성비",   sub: "목욕 8,000원부터",   char: "char-meal.png" },
      { lead: "가족끼리", sub: "키즈카페 · 식당까지", char: "char-eat.png" },
      { lead: "연인끼리", sub: "냉방과 찜질방",       char: "char-wave.png" },
      { lead: "친구끼리", sub: "24시간 밤새도록",     char: "char-sweetpotato.png" },
      { lead: "관광객도", sub: "터미널에서 도보 7분", char: "char-box.png" },
    ],
  },

  /* ---------- 6-1. 인사말 ---------- */
  // 시설안내 바로 앞에 나옵니다.
  // ⚠️ 아래 글은 초안입니다. 사장님 말투로 자유롭게 고쳐 주세요.
  //    문단은 배열 한 칸이 한 문단입니다. 줄을 늘리거나 지우셔도 됩니다.
  greeting: {
    show: true,
    // 대표님 사진 — 서명 옆에 작게 들어갑니다.
    // ⚠️ 아직 없어서 비워 두었습니다. assets/img/ceo.jpg 로 넣으면 자동으로 나옵니다.
    //    증명사진 비율(3:4) 권장, 가로 400px 정도면 충분합니다.
    photo: "",
    photoAlt: "제천킹스파찜질방 대표 김동술",
    label: "인사말",                 // 제목 위에 붙는 작은 머리말
    title: "편안하게 쉬었다 가시라고",
    body: [
      "제천 시내 한복판에 2,400평을 열어 두었습니다. 목욕만 하고 가셔도 좋고, 하루를 통째로 보내셔도 좋습니다.",
      "찜질방 이용권 한 장이면 헬스장까지 쓰실 수 있고, 식당은 찜질복 차림 그대로 들어오시면 됩니다.",
      "밤에도 문을 닫지 않습니다. 늦게 도착하셔도, 새벽에 나가셔도 언제나 사람이 있습니다.",
      "멀리서 오신 분도 가까이 사시는 분도 편안하게 쉬었다 가시면 좋겠습니다.",
    ],
    sign: "제천킹스파찜질방 대표 김동술",
  },

  /* ---------- 7. 제천 가볼 만한 곳 ---------- */
  // 제천시 공식 관광 누리집의 「추천 관광지」 10곳을 그대로 옮겨왔습니다.
  //   출처 https://www.jecheon.go.kr/tour/base/tour/reco/list?sc4=tour&menuLevel=2&menuNo=53
  //   사진 · 주소 · 전화 · 이용시간 · 요금 모두 그 페이지에서 가져온 값입니다.
  //
  // ⚠️ 요금과 운영시간은 바뀔 수 있습니다. 철마다 한 번씩 원문을 확인해 주세요.
  //
  // 사진 파일은 assets/img/nearby/ 안에 있습니다.
  //   <이름>-card.jpg  카드에 나오는 대표 사진
  //   <이름>-1.jpg …   사진을 눌렀을 때 크게 넘겨보는 사진들
  nearby: {
    show: true,
    title: "제천 가볼 만한 곳",
    desc: "모두 킹스파에서 차로 40분 안쪽입니다. 짐은 라커에 두고 다녀오세요 — 나갔다 오셔도 다시 들어오실 수 있습니다.",

    // ⚠️ 재입장 조건 — 요금이 다시 발생하는 내용이라 눈에 띄게 따로 보여줍니다.
    //    "다시 들어올 수 있다"만 알리고 이 조건을 빠뜨리면 카운터에서 다툼이 생깁니다.
    notice: "한 번 입실하신 뒤 신발장을 여시면 그 시점에 퇴실 처리됩니다. 다시 들어오실 때는 새로 발권하셔야 하니 주의해 주세요.",

    imgBase: "assets/img/nearby/",

    // 찜질방에서 걸어갈 수 있는 곳
    // slug 를 적으면 assets/img/nearby/<slug>-card.jpg 를 작은 사진으로 씁니다.
    // 파일이 없으면 "어떤 사진이 들어갈 자리"인지 안내 상자가 대신 나옵니다.
    walk: {
      label: "걸어서",
      items: [
        { slug: "market",   name: "중앙시장",         time: "4분",       desc: "제천 대표 재래시장. 장을 보고 오셔도 됩니다." },
        { slug: "terminal", name: "제천버스터미널",     time: "7분",       desc: "고속버스터미널도 길 건너에 있습니다. 막차를 놓치셨어도 저희는 밤새 열려 있습니다." },
        { slug: "station",  name: "제천역",           time: "택시 10분",  desc: "중앙선 KTX·무궁화호가 서는 역입니다." },
      ],
    },

    // 차로 다녀오는 곳 — 가까운 순
    placesLabel: "차로",
    places: [
      {
        slug: "uirimji",
        from: "5km · 차로 약 10분",
        name: "의림지",
        tag: "제천십경 제1경",
        sub: "삼한시대 농경문화 발상지",
        desc: "삼한시대에 쌓았다고 전해지는, 우리나라에서 가장 오래된 저수지입니다. " +
              "2006년 국가명승으로 지정됐고 수백 년 자란 소나무와 수양버들, 30m 용추폭포가 호수를 둘러쌉니다. " +
              "호수를 따라 목책 산책길이 나 있어 한 바퀴 걷기 좋습니다.",
        info: {
          주소: "충청북도 제천시 의림지로 33",
          전화: "043-651-7101 (의림지 관광안내소)",
          이용시간: "연중 상시 개방 (용추폭포·분수는 월요일 휴무)",
          쉬는날: "연중무휴",
          주차: "의림지 주차장",
        },
        photos: [
          { f: "uirimji-1.jpg", alt: "의림지 전경" },
          { f: "uirimji-2.jpg", alt: "숲이 가득한 의림지" },
          { f: "uirimji-3.jpg", alt: "폭포 위에 다리가 놓인 의림지" },
          { f: "uirimji-4.jpg", alt: "물 위에서 본 의림지" },
          { f: "uirimji-5.jpg", alt: "의림지 산책길" },
          { f: "uirimji-6.jpg", alt: "의림지 호숫가" },
          { f: "uirimji-7.jpg", alt: "의림지 야간 전경" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=1117&menuLevel=3&menuNo=67",
      },
      {
        slug: "samhan",
        // ⚠️ 이 산책로는 지도 서비스에 좌표가 등록돼 있지 않아 정확히 잴 수 없었습니다.
        //    바로 위 의림지 기준값을 그대로 썼습니다(의림지 아래 들판이라 거의 같습니다).
        //    실제로 가보신 소요시간이 다르면 이 줄만 고쳐 주세요.
        from: "5km · 차로 약 10분",
        name: "삼한의 초록길",
        sub: "의림지뜰을 걷는 사계절 산책로",
        desc: "의림지 아래 들판을 따라 2km 남짓 이어지는 산책길입니다. " +
              "봄·여름·가을·겨울을 주제로 나무 5만 5천 주와 풀꽃 23만 본, 140여 종을 심어두었습니다. " +
              "그네정원과 에코브릿지가 있어 아이와 함께 걷기에도 좋습니다.",
        info: {
          주소: "충청북도 제천시 성봉로 30",
          이용시간: "상시 개방",
          반려동물: "동반 가능",
          휠체어: "통행 가능",
        },
        photos: [
          { f: "samhan-1.jpg", alt: "삼한의 초록길 전경" },
          { f: "samhan-2.jpg", alt: "삼한의 초록길 산책로" },
          { f: "samhan-3.jpg", alt: "삼한의 초록길 정원" },
          { f: "samhan-4.jpg", alt: "삼한의 초록길 들꽃" },
          { f: "samhan-5.jpg", alt: "삼한의 초록길 들판" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=93753&menuLevel=3&menuNo=66",
      },
      {
        slug: "taksajeong",
        from: "14km · 차로 약 15분",
        name: "탁사정",
        tag: "제천십경 제9경",
        sub: "솔숲과 기암절벽이 어우러진 여름 피서지",
        desc: "원주에서 제천으로 들어오는 국도변에 있습니다. " +
              "조선 선조 때 임응룡이 해송 여덟 그루를 심어 '팔송'이라 했고, 아들이 그 자리에 정자를 세웠습니다. " +
              "주차장에서 5분쯤 올라가면 솔숲에 둘러싸인 정자가 나옵니다.",
        info: {
          주소: "충북 제천시 봉양읍 구학리 224-1",
          전화: "043-641-6731~3 (제천 관광정보센터)",
          이용시간: "상시 개방",
          쉬는날: "연중무휴",
          주차: "탁사정휴게소 무료주차",
        },
        note: "정자 터가 사유지여서 출입이 제한될 때가 있습니다.",
        photos: [
          { f: "taksajeong-1.jpg", alt: "탁사정 설경" },
          { f: "taksajeong-2.jpg", alt: "탁사정 전경" },
          { f: "taksajeong-3.jpg", alt: "탁사정 계곡" },
          { f: "taksajeong-4.jpg", alt: "탁사정 정자" },
          { f: "taksajeong-5.jpg", alt: "탁사정 가을 전경" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=15&menuLevel=3&menuNo=67",
      },
      {
        slug: "baeron",
        from: "15km · 차로 약 20분",
        name: "배론성지",
        tag: "제천십경 제10경",
        sub: "한국 천주교 전파의 진원지",
        desc: "골짜기 모양이 배 밑바닥을 닮았다 해서 배론입니다. " +
              "우리나라 최초의 신학교인 성요셉신학교 터와 황사영 백서 토굴, 최양업 신부 묘소가 있습니다. " +
              "가을 단풍이 특히 좋기로 알려진 곳입니다.",
        info: {
          주소: "충청북도 제천시 봉양읍 배론성지길 296",
          전화: "043-651-4527",
          이용시간: "10:00 ~ 17:00",
          쉬는날: "연중무휴",
          주차: "무료",
          홈페이지: "http://www.baeron.or.kr",
        },
        photos: [
          { f: "baeron-1.jpg", alt: "배론성지 전경" },
          { f: "baeron-2.jpg", alt: "배론성지 설경" },
          { f: "baeron-3.jpg", alt: "배론성지 가을 전경" },
          { f: "baeron-4.jpg", alt: "배론성지 단풍" },
          { f: "baeron-5.jpg", alt: "배론성지 파노라마 전경" },
          { f: "baeron-6.jpg", alt: "배론성지 봄 전경" },
          { f: "baeron-7.jpg", alt: "배론성지 비석" },
          { f: "baeron-8.jpg", alt: "배론성지 전시품" },
          { f: "baeron-9.jpg", alt: "배론성지 입구" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=16&menuLevel=3&menuNo=67",
      },
      {
        slug: "bakdaljae",
        from: "15km · 차로 약 15분",
        name: "박달재",
        tag: "제천십경 제2경",
        sub: "박달이와 금봉이 전설이 있는 고갯길",
        desc: "노래 「울고 넘는 박달재」로 널리 알려진 고개입니다. " +
              "굽이굽이 도는 길이 드라이브 코스로 인기가 있고, 성각스님이 깎은 목각공원과 " +
              "수백 년 된 느티나무에 불상을 새긴 목굴암, 오백나한상 전시관이 함께 있습니다.",
        info: {
          주소: "충청북도 제천시 백운면 박달로 231",
          전화: "043-642-9398 (박달재 관광안내소)",
          쉬는날: "신정 · 설날 · 추석",
          주차: "무료",
        },
        photos: [
          { f: "bakdaljae-1.jpg", alt: "박달재 가을 전경" },
          { f: "bakdaljae-2.jpg", alt: "박달재 소원 비는 소녀 동상" },
          { f: "bakdaljae-3.jpg", alt: "박달재 전경" },
          { f: "bakdaljae-4.jpg", alt: "박달재 목각 동상" },
          { f: "bakdaljae-5.jpg", alt: "박달재 목각 동상" },
          { f: "bakdaljae-6.jpg", alt: "박달재 목각 동상" },
          { f: "bakdaljae-7.jpg", alt: "박달재 전경" },
          { f: "bakdaljae-8.jpg", alt: "박달재 나무 조형물" },
          { f: "bakdaljae-9.jpg", alt: "박달재 돌계단" },
          { f: "bakdaljae-10.jpg", alt: "박달재 목굴암" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=8&menuLevel=3&menuNo=67",
      },
      {
        slug: "cheongpung",
        from: "22km · 차로 약 25분",
        name: "청풍문화유산단지",
        tag: "제천십경 제4경",
        sub: "호수 위의 작은 민속촌",
        desc: "충주댐이 생기며 물에 잠길 뻔한 청풍 일대의 문화재를 한자리에 옮겨 모았습니다. " +
              "보물 2점(한벽루·석조여래입상)을 비롯해 문화재 42점과 생활유물 2천여 점이 원형 그대로 복원돼 있습니다.",
        info: {
          주소: "충청북도 제천시 청풍면 청풍호로 2048",
          전화: "043-641-5542",
          이용시간: "3~10월 09:00~18:00 · 11~2월 09:00~17:00 (마감 1시간 전 입장 마감)",
          쉬는날: "연중무휴",
          입장료: "성인 3,000원 · 청소년/군인 2,000원 · 어린이 1,000원",
          주차: "무료",
        },
        note: "30명 이상 단체는 할인, 초등학생 미만·65세 이상·장애인·국가유공자는 무료입니다.",
        photos: [
          { f: "cheongpung-1.jpg", alt: "청풍문화유산단지 전경" },
          { f: "cheongpung-2.jpg", alt: "청풍문화유산단지 설경" },
          { f: "cheongpung-3.jpg", alt: "청풍문화유산단지 전경" },
          { f: "cheongpung-4.jpg", alt: "청풍문화유산단지 봄 전경" },
          { f: "cheongpung-5.jpg", alt: "청풍문화유산단지 입구" },
          { f: "cheongpung-6.jpg", alt: "청풍문화유산단지 가을 전경" },
          { f: "cheongpung-7.jpg", alt: "청풍문화유산단지 인형 동상" },
          { f: "cheongpung-8.jpg", alt: "청풍문화유산단지 역사관 전시" },
          { f: "cheongpung-9.jpg", alt: "청풍문화유산단지 역사관 입구" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=10&menuLevel=3&menuNo=67",
      },
      {
        slug: "cablecar",
        from: "25km · 차로 약 30분",
        name: "청풍호반 케이블카",
        sub: "물태리에서 비봉산 정상까지 2.3km",
        desc: "청풍면 물태리에서 해발 531m 비봉산 정상까지 오르는 케이블카입니다. " +
              "10인승 캐빈 46대가 오가는데 그중 13대는 바닥이 투명한 크리스탈 캐빈입니다. " +
              "편도 약 9분, 왕복 18분이면 청풍호를 내려다보고 옵니다.",
        info: {
          주소: "충청북도 제천시 청풍면 문화재길 166",
          전화: "043-643-7301",
          이용시간: "홈페이지 참조",
          입장료: "왕복 대인 18,000원 · 소인 14,000원",
          주차: "제1~제3주차장 (버스 · 일반 주차 가능)",
          홈페이지: "http://www.cheongpungcablecar.com/",
        },
        note: "초속 15m 이상 강풍이나 낙뢰가 있으면 운행이 멈출 수 있습니다. 가시기 전에 홈페이지를 확인해 주세요.",
        photos: [
          { f: "cablecar-1.jpg", alt: "청풍호반 케이블카 전경" },
          { f: "cablecar-2.jpg", alt: "청풍호반 케이블카 캐빈" },
          { f: "cablecar-3.jpg", alt: "청풍호반 케이블카에서 본 청풍호" },
          { f: "cablecar-4.jpg", alt: "청풍호반 케이블카 승강장" },
          { f: "cablecar-5.jpg", alt: "비봉산 정상 전망대" },
          { f: "cablecar-6.jpg", alt: "청풍호반 케이블카 야경" },
          { f: "cablecar-7.jpg", alt: "청풍호반 케이블카 노선" },
          { f: "cablecar-8.jpg", alt: "청풍호반 케이블카 주변 전경" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=3727&menuLevel=3&menuNo=16",
      },
      {
        slug: "sanyacho",
        from: "29km · 차로 약 35분",
        name: "제천산야초마을",
        sub: "약초로 하루를 보내는 체험마을",
        desc: "수산면 하천리의 약초 체험마을입니다. " +
              "천연염색과 약초 향기주머니 만들기, 약초떡 만들기, 두부 만들기, 천연비누와 아토피 연고 만들기 같은 " +
              "체험을 미리 예약하고 다녀올 수 있습니다.",
        info: {
          주소: "충청북도 제천시 수산면 옥순봉로6길 3",
          전화: "010-9947-4588 · 043-651-1357",
        },
        note: "체험은 예약제로 운영합니다. 가시기 전에 전화로 확인해 주세요.",
        photos: [
          { f: "sanyacho-1.jpg", alt: "제천산야초마을 전경" },
          { f: "sanyacho-2.jpg", alt: "제천산야초마을 체험장" },
          { f: "sanyacho-3.jpg", alt: "제천산야초마을 마당" },
          { f: "sanyacho-4.jpg", alt: "제천산야초마을 숙소" },
          { f: "sanyacho-5.jpg", alt: "제천산야초마을 주변 풍경" },
          { f: "sanyacho-6.jpg", alt: "제천산야초마을 입구" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=272&menuLevel=3&menuNo=64",
      },
      {
        slug: "oksunbong",
        from: "34km · 차로 약 40분",
        name: "옥순봉 출렁다리",
        tag: "제천십경 제8경",
        sub: "청풍호 수면 위 222m",
        desc: "2021년 10월에 문을 연 길이 222m, 너비 1.5m의 출렁다리입니다. " +
              "이어지는 408m 생태탐방 데크로드까지 걸으면 명승 제48호 옥순봉을 가장 가까이서 봅니다. " +
              "요즘 제천에서 가장 사람이 많이 찾는 곳입니다.",
        info: {
          주소: "충북 제천시 수산면 괴곡리 75-7",
          이용시간: "3~10월 09:00~18:00 (입장 17:20) · 11~2월 10:00~17:00 (입장 16:20)",
          쉬는날: "매주 월요일 · 설날 · 추석 · 근로자의 날",
          입장료: "일반 3,000원 (제천화폐 2,000원 환급) · 제천시민 1,000원 · 만 7세 미만 무료",
        },
        note: "호우·태풍·강풍 특보, 적설 1cm 이상, 가시거리 100m 미만일 때는 통행이 제한됩니다.",
        photos: [
          { f: "oksunbong-1.jpg", alt: "옥순봉 출렁다리 전경" },
          { f: "oksunbong-2.jpg", alt: "옥순봉 출렁다리와 청풍호" },
          { f: "oksunbong-3.jpg", alt: "옥순봉 출렁다리 위" },
          { f: "oksunbong-4.jpg", alt: "옥순봉 출렁다리 데크로드" },
          { f: "oksunbong-5.jpg", alt: "옥순봉 봉우리" },
          { f: "oksunbong-6.jpg", alt: "옥순봉 출렁다리 입구" },
          { f: "oksunbong-7.jpg", alt: "옥순봉 출렁다리 주변 전경" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?clturCntntsNo=94203&menuLevel=3&menuNo=852",
      },
      {
        slug: "cheukbaek",
        from: "36km · 차로 약 40분",
        name: "측백숲으로",
        sub: "천연기념물 측백나무 자생지의 체험장",
        desc: "수산면 측백숲은 천연기념물 제1호로 지정된 측백나무 자생지로, 넓이가 3만㎡에 이릅니다. " +
              "피톤치드가 많이 나와 삼림욕과 명상에 좋습니다. " +
              "측백족욕, 측백비누 만들기, 국궁 같은 체험 프로그램을 운영합니다.",
        info: {
          주소: "충청북도 제천시 수산면 수산리 25-1",
          홈페이지: "http://측백숲으로.com",
        },
        photos: [
          { f: "cheukbaek-1.jpg", alt: "측백숲으로 체험장 전경" },
          { f: "cheukbaek-2.jpg", alt: "측백숲 전경" },
        ],
        url: "https://www.jecheon.go.kr/tour/base/tour/contents/view?menuLevel=2&menuNo=53&clturCntntsNo=94190",
      },
],

    footer: "사진과 안내 내용은 제천시 공식 관광 누리집의 「추천 관광지」에서 가져왔습니다. 요금과 운영시간은 바뀔 수 있으니 가시기 전에 한 번 확인해 주세요.",
    // CC BY 사진은 저작자 표시가 의무입니다 — 지우지 말아 주세요.
    credit: "제천버스터미널 사진 ⓒ 커뷰 (CC BY 3.0) · 제천역 사진 ⓒ YanggoK (CC BY 4.0), Wikimedia Commons · 제천중앙시장 사진 ⓒ 한국관광공사 대한민국구석구석",
    link: {
      url: "https://www.jecheon.go.kr/tour/base/tour/reco/list?sc4=tour&menuLevel=2&menuNo=53",
      label: "제천 추천 관광지 전체 보기",
    },
  },

  /* ---------- 8. 360도 공간 둘러보기 ---------- */
  tour360: {
    // 시설안내 섹션 맨 아래에 들어갑니다 (사진으로 훑은 뒤 직접 돌려 보는 순서).
    // 사진이 아직 없으면 "준비하고 있습니다" 자리가 대신 나옵니다.
    show: true,
    title: "360도로 둘러보기",

    // ⚠️ 아래 ①②③ 중 하나만 채우면 됩니다. 다 비어 있으면 안내 문구가 나옵니다.

    // ① panoramas — 직접 찍은 360 파노라마 사진 ★ 이 방식으로 진행합니다
    //    · assets/img/360/ 폴더에 사진을 넣고 아래에 한 줄씩 추가하세요.
    //    · 사진은 정방향 파노라마(equirectangular, 가로:세로 = 2:1) 여야 합니다.
    //    · 여러 장을 넣으면 뷰어 아래에 이동 버튼이 생겨서 공간을 옮겨 다닐 수 있습니다.
    //
    //    예시)
    //    panoramas: [
    //      { name: "1층 로비",     img: "assets/img/360/lobby.jpg" },
    //      { name: "대욕장",       img: "assets/img/360/bath.jpg" },
    //      { name: "야외 노천탕",  img: "assets/img/360/herb-bath.jpg" },
    //    ],
    panoramas: [],

    // ② embedUrl — 완성된 360 투어를 페이지 안에 끼워 넣습니다 ★ 지금 이 방식입니다
    //    /tour/ 폴더에 투어가 통째로 들어 있습니다 (파노라마 82장 + 뷰어).
    //    투어 자체를 손보시려면 tour/tour.html 안의 SCENES 배열만 고치면 됩니다.
    //    주소 앞의 / 는 지우지 마세요 — 하위 페이지(/facilities/)에서도 찾아가야 합니다.
    embedUrl: "/tour/tour.html",

    // ③ linkUrl — 삽입이 안 되고 새 창으로만 열리는 경우
    linkUrl: "",
    poster: "assets/img/tour-poster.jpg",

    // 뷰어 아래 붙는 작은 주석. 비워 두면 아예 나오지 않습니다
    note: "",
  },

  /* ---------- 9. 식당 메뉴 ---------- */
  // ✅ 가격은 매장 메뉴판 사진 그대로 옮겼습니다 (2026-07 기준).
  // ⚠️ photos 의 name(사진 설명)만 제 추정입니다. 틀린 것은 고쳐주세요.
  menu: {
    show: true,
    note: "메뉴와 가격은 매장 사정에 따라 달라질 수 있습니다. 자세한 사항은 매장으로 문의해 주세요.",

    // 식당 운영 주체 — 찜질방(주식회사 제천킹스파찜질방)과 다른 법인입니다.
    // 음식과 주류를 파는 곳이라 그 사업자 정보를 따로 밝혀야 합니다. (2026-08 확인)
    business: {
      name: "주식회사 킹푸드",
      ceo: "이금숙",
      bizNumber: "772-81-03912",
      liquorNumber: "304-5-30156",     // 주류판매신고번호
    },

    // 원산지 표시 — 매장 메뉴판에 적힌 그대로입니다. 법으로 표시해야 하는 내용입니다.
    origin: "원산지 표시 · 김치 · 쌀 · 돼지고기 · 고춧가루 · 들기름 · 하림치킨 국내산 / " +
            "직화 닭고기 태국산 / 소고기 호주산 / 참기름 중국산",

    // 식당 전경 — 좌우로 넘겨 보는 사진들. 순서대로 나옵니다.
    hall: [
      // 첫 장이 섹션 대표 사진입니다 — 음식이 보이는 사진을 앞에 둡니다.
      // (예전 첫 장이던 rest-1 은 카운터 집기가 가득한 스냅이라 뒤로 옮겼습니다)
      { src: "assets/img/hall/rest-2.jpg", cap: "화덕에서 갓 구워 낸 피자",          alt: "직원이 갓 구운 피자를 나무 판에 올리는 모습" },
      { src: "assets/img/hall/rest-3.jpg", cap: "주방에서 그때그때 조리합니다",      alt: "조리 중인 식당 주방" },
      { src: "assets/img/hall/rest-1.jpg", cap: "주문하시면 바로 만들어 드립니다",   alt: "식당 카운터에서 일하는 직원" },
      { src: "assets/img/hall/rest-4.jpg", cap: "매점 · 음료 · 아이스크림 코너",     alt: "매점과 음료 코너" },
      { src: "assets/img/hall/rest-5.jpg", cap: "24시간 도는 라면 자판기",           alt: "라면 자판기에서 끓고 있는 라면" },
    ],

    groups: [
      {
        name: "식사준비",
        photos: [
          { img: "meal-1.jpg", name: "한상 차림" },
          { img: "meal-2.jpg", name: "비빔밥 정식" },
          { img: "meal-3.jpg", name: "찌개 한상" },
        ],
        items: [
          { name: "미역국",              price: "10,900원" },
          { name: "김치찌개",            price: "11,900원" },
          { name: "파 소불고기",         price: "11,900원" },
          { name: "양푼 열무비빔밥",      price: "11,900원" },
          { name: "여름별미 (콩국수)",    price: "9,900원", sub: "계절 메뉴 · 6~9월" },
          { name: "제육볶음",            price: "11,900원" },
          { name: "낙지볶음",            price: "11,900원" },
          { name: "오징어볶음",          price: "11,900원" },
          { name: "돈까스",              price: "11,900원" },
          { name: "국물떡볶이",          price: "8,900원" },
          { name: "물냉면 · 비빔냉면",    price: "9,900원" },
          { name: "김치전",              price: "7,900원" },
          { name: "부추전",              price: "7,900원" },
          { name: "공기밥",              price: "1,500원" },
          { name: "김치",                price: "2,000원" },
          { name: "단무지",              price: "1,000원" },
          { name: "계란후라이",          price: "1,000원" },
          // ⚠️ 메뉴판에 「해물된장찌개 / 해물순두부찌개 11,900원」이 줄이 그어진 채 있었습니다.
          //    다시 파신다면 아래 줄 앞의 // 를 지우면 표에 나옵니다.
          // { name: "해물된장찌개 · 해물순두부찌개", price: "11,900원" },
        ],
      },
      {
        name: "화락",
        photos: [
          { img: "hwarak-1.jpg", name: "직화 바베큐치킨" },
        ],
        items: [
          { name: "직화간장바베큐치킨",   price: "23,900원" },
          { name: "직화고추장바베큐치킨", price: "23,900원" },
          { name: "직화간장치밥",        price: "11,900원" },
          { name: "직화고추장치밥",      price: "11,900원" },
        ],
      },
      {
        name: "남자피자",
        photos: [
          { img: "pizza-1.jpg", name: "남자피자" },
          { img: "pizza-2.jpg", name: "피자 + 생맥주" },
        ],
        items: [
          { name: "남자피자 (매콤피자)", price: "20,900원",
            sub: "매콤소스 + 모짜렐라치즈 + 체다" },
          { name: "애플고르곤졸라",      price: "23,900원",
            sub: "애플소스 + 고르곤소스 + 모짜렐라치즈 + 고르곤졸라치즈 + 체다" },
          { name: "베이컨포테이토",      price: "23,900원",
            sub: "토마토소스 + 모짜렐라치즈 + 베이컨 + 감자튀김" },
          { name: "불고기피자",          price: "23,900원",
            sub: "토마토소스 + 양파 + 양송이 + 불고기 + 모짜렐라치즈" },
          { name: "오리지널피자",        price: "23,900원",
            sub: "토마토소스 + 양파 + 양송이 + 불고기 + 페퍼로니 + 블랙올리브 + 모짜렐라치즈" },
          { name: "치즈크러스트 추가",   price: "5,000원" },
          { name: "감자튀김 추가",       price: "3,000원" },
          { name: "피자소스 추가",       price: "1,000원", sub: "갈릭소스 · 핫소스" },
        ],
      },
      {
        name: "KC치킨",
        photos: [
          { img: "kc-1.jpg", name: "양념치킨 + 후라이드치킨" },
          { img: "kc-2.jpg", name: "양념치킨" },
        ],
        items: [
          { name: "후라이드치킨",  price: "20,900원" },
          { name: "양념치킨",      price: "22,900원" },
          { name: "양념소스",      price: "2,000원" },
          { name: "치킨무 추가",   price: "1,000원" },
        ],
      },
      {
        // 밤에도 주문할 수 있는 메뉴 — 24시간 영업의 강점이라 따로 세웁니다
        name: "야간 메뉴",
        desc: "밤 10시 ~ 새벽 1시 30분에는 아래 메뉴만 주문하실 수 있습니다.",
        photos: [
          { img: "night-1.jpg", name: "치킨 + 생맥주" },
        ],
        items: [
          { name: "남자피자",      price: "20,900원 ~ 23,900원", sub: "5종류" },
          { name: "후라이드치킨",  price: "20,900원" },
          { name: "양념치킨",      price: "22,900원" },
          { name: "양념소스",      price: "2,000원" },
          { name: "미역국",        price: "10,900원" },
          { name: "양푼비빔밥",    price: "11,900원" },
        ],
      },
      {
        // 상하목장(매일유업) 소프트 아이스크림 — 매점 안에 묻어두지 않고 대분류로 세웁니다
        name: "상하목장 아이스크림",
        photos: [
          { img: "sangha-1.jpg", name: "상하목장 소프트 아이스크림" },
          { img: "sangha-2.jpg", name: "상하목장 소프트 아이스크림" },
        ],
        items: [
          { name: "상하목장 소프트 아이스크림", price: "5,000원",
            sub: "유기농 우유로 만듭니다 · 우유 · 초코 · 반반" },
          { name: "천연과일 아이스크림",       price: "5,000원",
            sub: "ICE FACTORY · 스트로베리 · 블루레몬에이드 · 수박 · 레인보우팝 · 애니멀초코" },
          { name: "딸기팝핑 아이스크림",       price: "7,000원",
            sub: "딸기 · 초코링 · 톡톡 터지는 팝핑보바" },
          { name: "망고팝핑 아이스크림",       price: "7,000원",
            sub: "망고 · 톡톡 터지는 팝핑보바" },
          { name: "통통팥떡 아이스크림",       price: "7,000원",
            sub: "우리 팥과 떡을 얹었습니다" },
          { name: "벌집꿀 아이스크림",         price: "8,000원",
            sub: "벌집꿀을 통째로 얹었습니다" },
        ],
      },
      {
        name: "매점",
        photos: [
          // 빙수·식혜는 주황 배경 원본을 그대로 씁니다 (사업주 요청)
          { img: "patbingsu-2.jpg", name: "옛날 빙수" },
          { img: "patbingsu.jpg",   name: "옛날 빙수" },
          { img: "sikhye.jpg",      name: "식혜 · 냉커피" },
        ],
        items: [
          { name: "레인보우 슬러시",      price: "5,000원" },
          { name: "슬러시",              price: "4,000원" },
          { name: "옛날 빙수",            price: "8,000원" },
          { name: "팝콘",                price: "4,500원" },
          { name: "벨지언와플 & 생크림",  price: "3,000원" },
          { name: "버터구이 오징어",      price: "5,000원" },
          { name: "맥반석 계란",          price: "3,000원", sub: "3개" },
          { name: "훈제란",              price: "3,500원", sub: "3개" },

          { divider: "음료" },
          { name: "식혜",     price: "4,000원" },
          { name: "감식초",   price: "4,500원" },
          { name: "석류",     price: "4,500원" },
          { name: "매실",     price: "4,500원" },
          { name: "냉커피",   price: "4,500원" },
          { name: "냉녹차",   price: "4,500원" },
          { name: "얼음컵",   price: "2,000원" },

          { divider: "주류" },
          { name: "생맥주",       price: "5,000원", sub: "500cc" },
          { name: "국산 캔맥주",  price: "4,000원" },
          { name: "해외 캔맥주",  price: "6,000원" },
          { name: "흑맥주 캔",    price: "7,000원" },
          { name: "소주",         price: "5,000원" },
        ],
      },
],
  },

};
