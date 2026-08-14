/**
 * 섹션별 독립 페이지를 만듭니다.
 *
 * 왜 만드나
 *   랜딩페이지(index.html)는 한 장에 모든 내용이 들어 있어서,
 *   검색엔진이 "제천 찜질방 요금", "제천 찜질방 식당 메뉴" 같은 검색에
 *   내놓을 만한 페이지가 따로 없습니다. 섹션마다 주소를 하나씩 주면
 *   각각이 그 주제의 페이지로 색인됩니다.
 *
 *   또 지금 랜딩페이지는 요금·메뉴·관광지를 자바스크립트로 채웁니다.
 *   검색엔진이 자바스크립트를 돌려야만 글자가 보이는 구조라 불리합니다.
 *   이 파일이 만드는 페이지는 글자가 HTML 안에 그대로 박혀 있습니다.
 *
 * 어떻게 만드나
 *   랜딩페이지를 실제 브라우저로 열어 자바스크립트까지 다 돌린 뒤,
 *   각 섹션의 결과물을 그대로 떼어 옵니다.
 *   → data/site-data.js 만 고치면 이 페이지들도 같이 바뀝니다. 따로 관리할 필요가 없습니다.
 *
 * 쓰는 법
 *   npm run build:pages
 *
 * 내용을 바꾼 뒤에는 반드시 한 번 돌려 주세요. 안 그러면 섹션 페이지가 옛 내용으로 남습니다.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.jecheonkingspa.com';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8931;

/* 만들 페이지 — 폴더 이름, 어느 섹션에서 가져올지, 검색결과에 뜰 제목·설명 */
const PAGES = [
  {
    slug: 'facilities', from: '#facilities',
    nav: '시설안내',
    title: '시설안내 — 대욕장 · 노천탕 · 불가마 · 찜질방',
    desc: '충북 최대 2,400평. 돔 천장 대욕장, 허브를 요일마다 바꿔 담는 야외 노천탕, 참나무 전통 불가마, 히말라야 소금방 · 편백 히노키방 · 냉방 · 수면 릴렉스존 · 헬스장 · 키즈존까지.',
  },
  {
    slug: 'waterslide', from: '#waterslide',
    nav: '물놀이 시설',
    title: '옥상 물놀이 시설 — 7 · 8월 운영',
    desc: '여름 두 달만 여는 옥상 물놀이 시설. 에어바운스 · 트램펄린 · 워터슬라이드 · 그늘 쉼터. 찜질방 이용객은 무료입니다.',
  },
  {
    slug: 'menu', from: '#menu', allTabs: true,
    nav: '식당',
    title: '식당 메뉴와 가격 — 식사 · 치킨 · 피자 · 야간메뉴',
    desc: '찜질복 차림 그대로 이용하는 식당. 미역국 10,900원부터, 직화 바베큐치킨 · 남자피자 · KC치킨 · 상하목장 아이스크림 · 매점까지 전 품목 가격 안내. 밤 10시~새벽 1시 30분 야간 메뉴도 있습니다.',
  },
  {
    slug: 'pricing', from: '#pricing',
    nav: '이용요금',
    title: '이용요금 — 목욕 8,000원 · 찜질방 12,000원',
    desc: '목욕 8,000원(소인 7,000원), 찜질방 12,000원(소인 11,000원). 헬스장 무료, 24시간 연중무휴, 주차 무료. 횟수권과 헬스 + 사우나 회원권 안내.',
  },
  {
    slug: 'guide', from: '#guide',
    nav: '이용안내',
    title: '이용안내 — 처음 오시는 분께',
    desc: '발권부터 찜질까지 순서대로 안내합니다. 남녀 구분, 준비물, 외출 후 재입장, 어린이 동반, 주차 안내.',
    /* 자주 묻는 질문 — 검색결과와 AI 답변에 그대로 인용되는 부분입니다.
       본문(이용안내 표)과 같은 내용을 질문 형태로만 바꾼 것입니다. */
    faq: [
      { q: '남녀가 함께 이용할 수 있나요?',
        a: '대욕장과 야외 노천탕은 남탕과 여탕이 따로 있습니다. 찜질 공간과 헬스장, 식당은 찜질복을 입고 남녀가 함께 이용합니다.' },
      { q: '무엇을 챙겨 가야 하나요?',
        a: '수건과 찜질복은 드립니다. 세면도구는 개인 지참을 권하며, 매점에서도 구입하실 수 있습니다.' },
      { q: '나갔다가 다시 들어올 수 있나요?',
        a: '이용 중 외출하셨다가 다시 들어오실 수 있습니다. 프런트에 말씀해 주세요. 다만 신발장을 여시면 그 시점에 퇴실 처리되어, 다시 들어오실 때는 새로 발권하셔야 합니다.' },
      { q: '아이와 함께 가도 되나요?',
        a: '미취학 아동은 소인 요금입니다. 키즈존이 있어 아이와 함께 오시기 좋습니다.' },
      { q: '주차는 무료인가요?',
        a: '건물 전용 주차장과 길 건너 제2주차장 모두 무료입니다. 주말에는 제2주차장이 여유롭습니다.' },
      { q: '몇 시까지 하나요?',
        a: '24시간 연중무휴로 운영합니다. 설과 추석에도 영업합니다.' },
      { q: '요금이 얼마인가요?',
        a: '목욕은 대인 8,000원, 소인 7,000원입니다. 찜질방은 대인 12,000원, 소인 11,000원이며 헬스장 이용이 포함됩니다. 22시부터 05시까지는 1,000원이 추가됩니다.' },
    ],
  },
  {
    slug: 'location', from: '#location',
    nav: '오시는 길',
    title: '오시는 길 — 고속버스터미널 도보 7분',
    desc: '충북 제천시 풍양로9길 5. 고속버스터미널에서 걸어서 7분, 중앙시장 4분, 제천역 택시 10분. 주차장 두 곳 모두 무료입니다.',
  },
  {
    slug: 'nearby', from: '#nearby', openDetails: true,
    nav: '제천 여행',
    title: '제천 가볼 만한 곳 — 킹스파에서 얼마나 걸리나',
    desc: '의림지 · 청풍문화유산단지 · 박달재 · 옥순봉 출렁다리 등 제천 추천 관광지 10곳. 모두 킹스파에서 차로 40분 안쪽입니다. 짐은 라커에 두고 다녀오세요.',
  },
];

/* ---------- 아주 작은 정적 서버 (file:// 은 일부 기능이 막힙니다) ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(PORT);
}

/* ---------- 페이지 껍데기 ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* 상단 메뉴 — index.html 의 메뉴와 항목·순서가 같아야 합니다.
   「360도 둘러보기」는 그 자체로 페이지는 아니고 시설안내 안의 한 자리라
   PAGES 에 없습니다. 시설안내 바로 뒤에 끼워 넣어 홈과 똑같이 맞춥니다.
   (index.html 의 메뉴를 고치면 이 목록도 같이 고쳐 주세요) */
function navHtml(current) {
  const items = [];
  PAGES.forEach((p) => {
    items.push(`      <a href="/${p.slug}/"${p.slug === current ? ' class="is-active" aria-current="page"' : ''}>${p.nav}</a>`);
    // 360도는 시설안내 안의 한 자리라 바로 뒤에 붙입니다
    if (p.slug === 'facilities') {
      items.push(`      <a href="/facilities/#tour">360도 둘러보기</a>`);
    }
  });
  return items.join('\n');
}

/* 모바일 하단 고정 바 — 랜딩페이지와 똑같이 모든 섹션 페이지에도 답니다.
   메뉴로 들어왔는데 하단 바가 사라지면 다음 이동 수단이 없어집니다.
   물놀이가 시즌 종료(show:false)면 그 칸을 빼고 네 칸으로 만듭니다. */
function mobilebarHtml(data, slug) {
  const on = !!(data.waterslide && data.waterslide.show);
  const ico = {
    map: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5',
    price: 'M4 4h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm0 5h10v2H4z',
    facil: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
    water: 'M4 18c1.6 0 1.6 1.2 3.2 1.2S8.8 18 10.4 18s1.6 1.2 3.2 1.2S15.2 18 16.8 18s1.6 1.2 3.2 1.2V21c-1.6 0-1.6-1.2-3.2-1.2S15.2 21 13.6 21s-1.6-1.2-3.2-1.2S8.8 21 7.2 21 5.6 19.8 4 19.8zm3-3V6a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0v9zm7 0V9h6v6z',
    menu: 'M7 2v8a3 3 0 0 0 2 2.8V22h2V12.8A3 3 0 0 0 13 10V2h-1.6v6.4H10.4V2H9.6v6.4H8.6V2zm10 0c-1.7 0-3 2.7-3 6 0 2.4.7 4.3 1.8 5.2V22h2V2z',
  };
  const item = (href, d, label, extra = '', ext = false) =>
    `  <a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}${slug && href === `/${slug}/` ? ' aria-current="page"' : ''}>\n` +
    `    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>\n` +
    `    ${label}${extra}\n  </a>`;

  return `<div class="mobilebar${on ? '' : ' mobilebar--4'}">\n` + [
    item(data.info.naverMapUrl, ico.map, '길찾기', '', true),
    item('/pricing/', ico.price, '이용요금'),
    item('/facilities/', ico.facil, '시설안내'),
    on ? item('/waterslide/', ico.water, '물놀이', '<span class="dot-new"></span>') : null,
    item('/menu/', ico.menu, '식당'),
  ].filter(Boolean).join('\n') + '\n</div>';
}

function shell({ slug, title, desc, body, jsonld, nav, mobilebar, data }) {
  const url = `${SITE}/${slug}/`;
  const full = `${title} | 제천킹스파찜질방`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>

<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="제천킹스파찜질방">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/img/og-image.jpg">
<meta property="og:locale" content="ko_KR">
<meta name="theme-color" content="#e96113">
<link rel="icon" href="/assets/img/favicon.png">

<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="stylesheet" href="/assets/css/page.css">

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>

<body class="subpage">

<header class="hd" id="header">
  <div class="container hd__in">
    <a href="/" class="brand">
      <img class="brand__mark" src="/assets/img/mark.png" alt="" width="56" height="48">
      <img class="brand__wm" src="/assets/img/wordmark.png" alt="제천킹스파찜질방" width="734" height="96">
    </a>
    <nav class="gnb" id="nav">
${nav}
    </nav>
    <button class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<nav class="crumb" aria-label="현재 위치">
  <div class="container">
    <a href="/">홈</a> <span aria-hidden="true">›</span> <b>${esc(title.split(' — ')[0])}</b>
  </div>
</nav>

<main id="main">
${body}
</main>

<section class="cta">
  <div class="container cta__in">
    <img class="cta__char" src="/assets/img/char-hello.png" alt="" loading="lazy">
    <div>
      <p class="cta__lead">궁금한 점이 있으신가요?</p>
      <p class="cta__sub">언제 전화하셔도 됩니다. 24시간 사람이 있습니다.</p>
    </div>
    <a class="cta__btn" href="tel:043-646-5200">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z"/></svg>
      <span>043-646-5200</span>
    </a>
  </div>
</section>

<footer class="ft">
  <div class="container ft__in">
    <div class="ft__brand">
      <img class="brand__mark" src="/assets/img/mark.png" alt="" width="56" height="48">
      <img class="brand__wm" src="/assets/img/wordmark-light.png" alt="제천킹스파찜질방" width="734" height="96">
    </div>
    <div class="ft__meta">
      <p class="ft__corp">${data.info.corpName || ''}</p>
      <p>${data.info.address}</p>
      <p>대표 ${data.info.ceo} &nbsp;·&nbsp; TEL. <a href="tel:${data.info.tel}">${data.info.tel}</a></p>
      <p>사업자등록번호 ${data.info.bizNumber}</p>
      <nav class="ft__nav" aria-label="사이트 안내">
${PAGES.map((p) => `        <a href="/${p.slug}/">${p.nav}</a>`).join('\n')}
      </nav>
      <p class="ft__copy">&copy; <span id="year">2026</span> 제천킹스파찜질방</p>
    </div>
  </div>
</footer>

<button class="totop" id="toTop" aria-label="맨 위로">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6l7 7-1.4 1.4L13 9.8V20h-2V9.8l-4.6 4.6L5 13z"/></svg>
</button>

${mobilebar}

<script src="/assets/js/page.js"></script>
<script src="/assets/js/hscroll.js"></script>
</body>
</html>
`;
}

/* ---------- 페이지별 구조화 데이터 ----------
   사업체(LocalBusiness)를 @id 로 한 번 정의하고 모든 페이지에서 그걸 가리킵니다.
   그래야 검색엔진과 AI 가 "이 요금·메뉴는 제천킹스파찜질방의 것"이라고 묶어서 이해합니다. */
const BIZ_ID = `${SITE}/#business`;

function business(data) {
  const i = data.info;
  return {
    '@type': ['HealthAndBeautyBusiness', 'DaySpa'],
    '@id': BIZ_ID,
    name: i.name,
    alternateName: i.shortName,
    legalName: i.corpName || undefined,
    taxID: i.bizNumber || undefined,
    url: SITE + '/',
    telephone: '+82-43-646-5200',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '풍양로9길 5',
      addressLocality: '제천시', addressRegion: '충청북도', addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 37.1385239, longitude: 128.2085504 },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59',
    },
    priceRange: '₩8,000 - ₩12,000',
    image: `${SITE}/assets/img/og-image.jpg`,
  };
}

function jsonldFor(page, data, today) {
  const graph = [
    business(data),
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: page.nav, item: `${SITE}/${page.slug}/` },
      ],
    },
    {
      '@type': 'WebPage',
      name: page.title,
      description: page.desc,
      url: `${SITE}/${page.slug}/`,
      inLanguage: 'ko-KR',
      dateModified: today,
      about: { '@id': BIZ_ID },
      isPartOf: { '@type': 'WebSite', name: '제천킹스파찜질방', url: SITE + '/' },
    },
  ];

  if (page.slug === 'pricing') {
    // Offer 안에 offers 를 넣는 건 잘못된 모양입니다. 입장권을 Product 로 두고
    // 각 요금을 Offer 로 다는 것이 규격에 맞고 검색결과에 가격이 뜰 수 있습니다.
    data.pricing.main.forEach((r) => {
      graph.push({
        '@type': 'Product',
        name: `${data.info.name} ${r.item} 이용권`,
        description: r.sub || '',
        brand: { '@id': BIZ_ID },
        offers: [
          {
            '@type': 'Offer', name: '대인', url: `${SITE}/pricing/`,
            price: String(r.adult).replace(/[^0-9]/g, ''), priceCurrency: 'KRW',
            availability: 'https://schema.org/InStock',
            seller: { '@id': BIZ_ID },
          },
          {
            '@type': 'Offer', name: '소인', url: `${SITE}/pricing/`,
            price: String(r.child).replace(/[^0-9]/g, ''), priceCurrency: 'KRW',
            availability: 'https://schema.org/InStock',
            seller: { '@id': BIZ_ID },
          },
        ],
      });
    });

    // 헬스 + 사우나 회원권 — 기간별 금액을 하나의 Product 에 Offer 로 답니다
    const mb = data.pricing.membership;
    if (mb && mb.show !== false) {
      graph.push({
        '@type': 'Product',
        name: `${data.info.name} ${mb.title}`,
        description: mb.desc || '',
        brand: { '@id': BIZ_ID },
        offers: mb.items.map((v) => ({
          '@type': 'Offer', name: v.name, url: `${SITE}/pricing/`,
          price: String(v.price).replace(/[^0-9]/g, ''), priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          seller: { '@id': BIZ_ID },
        })),
      });
    }
  }

  if (page.slug === 'menu') {
    graph.push({
      '@type': 'Menu', name: '제천킹스파찜질방 식당 메뉴', url: `${SITE}/menu/`,
      inLanguage: 'ko-KR',
      hasMenuSection: data.menu.groups.map((g) => ({
        '@type': 'MenuSection', name: g.name,
        description: g.desc || undefined,
        hasMenuItem: (g.items || []).filter((i) => i.name && i.price).map((i) => ({
          '@type': 'MenuItem', name: i.name,
          description: i.sub || undefined,
          offers: {
            '@type': 'Offer',
            price: String(i.price).replace(/[^0-9]/g, ''), priceCurrency: 'KRW',
          },
        })),
      })),
    });
  }

  /* 이용안내는 원래 「무엇이 어떻습니까」 형태라 그대로 FAQ 로 옮깁니다.
     AI 검색이 답변을 만들 때 가장 잘 가져다 쓰는 형식입니다. */
  if (page.faq && page.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/* ---------- 랜딩페이지 미리 그려두기 ----------
   index.html 은 요금·메뉴·관광지를 자바스크립트로 채웁니다.
   그래서 소스에는 글자가 없고, 자바스크립트를 돌리지 않는 크롤러(특히 AI 답변 엔진)는
   빈 페이지를 봅니다. 여기서는 브라우저로 한 번 그린 결과를 index.html 에 되돌려 적어,
   소스에 글자가 남게 합니다.

   자바스크립트는 그대로 두므로 사람이 볼 때 동작은 완전히 같습니다.
   (스크립트가 같은 내용을 다시 그릴 뿐입니다)                                    */
async function prerenderIndex(page) {
  const html = await page.evaluate(() => {
    const doc = document.documentElement.cloneNode(true);

    // 스크롤·클릭 때문에 잠깐 붙었던 흔적은 지웁니다. 처음 열었을 때 모습이어야 합니다.
    doc.querySelectorAll('.gnb a.is-active').forEach((a) => a.classList.remove('is-active'));
    doc.querySelectorAll('#header.is-stuck').forEach((h) => h.classList.remove('is-stuck'));
    doc.querySelectorAll('#toTop.is-on').forEach((b) => b.classList.remove('is-on'));
    const bg = doc.querySelector('#burger');
    if (bg) { bg.setAttribute('aria-expanded', 'false'); bg.setAttribute('aria-label', '메뉴 열기'); }
    const body = doc.querySelector('body');
    if (body) body.removeAttribute('style');
    doc.querySelectorAll('img[data-ph-done]').forEach((i) => i.removeAttribute('data-ph-done'));

    // 대문 사진은 첫 장만 바로 받고 나머지는 재워 둡니다 (지연 로딩 유지)
    doc.querySelectorAll('.vslide').forEach((img, i) => {
      if (i === 0) return;
      const src = img.getAttribute('src');
      if (src) { img.setAttribute('data-src', src); img.removeAttribute('src'); }
      img.classList.remove('is-on');
    });

    // 파일 끝의 줄바꿈은 브라우저가 </body> 안쪽 끝으로 끌어들입니다.
    // 그대로 두면 다시 돌릴 때마다 빈 줄이 하나씩 쌓이므로 여기서 걷어냅니다.
    const b = doc.querySelector('body');
    while (b && b.lastChild && b.lastChild.nodeType === 3 && !b.lastChild.nodeValue.trim()) {
      b.removeChild(b.lastChild);
    }
    return doc.outerHTML;
  });
  return '<!DOCTYPE html>\n' + html.trim() + '\n';
}

/* ---------- 본문 정리 ---------- */
function tidy(html) {
  return html
    // /pricing/ 같은 하위 주소에서도 그림·파일을 찾도록 절대경로로
    .replace(/(src|href)="assets\//g, '$1="/assets/')
    // 랜딩페이지 안쪽 이동 링크는 랜딩페이지로 되돌립니다
    .replace(/href="#(\w+)"/g, 'href="/#$1"')
    // 왼쪽 제목이 따라다니는 효과는 한 섹션짜리 페이지에선 필요 없습니다
    .replace(/class="shd shd--/g, 'class="shd shd--')
    .trim();
}

(async () => {
  const server = serve();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));

  const data = await page.evaluate(() => window.SITE_DATA);
  const TODAY = new Date().toISOString().slice(0, 10);
  const written = [];

  /* ① 랜딩페이지를 먼저 미리 그려 둡니다 */
  const before = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const rendered = await prerenderIndex(page);
  fs.writeFileSync(path.join(ROOT, 'index.html'), rendered);
  const grew = rendered.length - before.length;
  console.log(`  index.html   ${(before.length / 1024).toFixed(0)}KB → ${(rendered.length / 1024).toFixed(0)}KB`
    + `  (${grew >= 0 ? '+' : ''}${(grew / 1024).toFixed(0)}KB · 소스에 글자가 박혔습니다)`);


  for (const p of PAGES) {
    // 식당은 탭마다 다른 내용이 나오므로 전부 눌러 모읍니다 (검색엔진은 탭을 누르지 못합니다)
    if (p.allTabs) {
      await page.evaluate(() => {
        const tabs = [...document.querySelectorAll('.mtab')];
        const body = document.querySelector('#menuBody');
        const out = [];
        tabs.forEach((t) => {
          t.click();
          out.push(`<h3 class="msec">${t.querySelector('b').textContent}</h3>` + body.innerHTML);
        });
        document.querySelector('#menuTabs').remove();
        document.querySelector('#menuHall').remove();
        body.innerHTML = out.join('\n');
      });
    }
    if (p.openDetails) {
      await page.evaluate(() => {
        document.querySelectorAll('#nearby details').forEach((d) => d.setAttribute('open', ''));
      });
    }

    const body = await page.evaluate((sel) => {
      const sec = document.querySelector(sel);
      if (!sec) return null;
      const clone = sec.cloneNode(true);
      clone.removeAttribute('hidden');
      clone.removeAttribute('id');
      // 페이지마다 제목이 하나씩은 h1 이어야 합니다.
      // 랜딩페이지에서는 h1 이 「충북 최대 규모 2,400평 찜질방」이고
      // 섹션 제목은 h2 였는데, 이 페이지에서는 섹션이 곧 주제이므로 h1 로 올립니다.
      const top = clone.querySelector('h2');
      if (top) {
        const h1 = document.createElement('h1');
        [...top.attributes].forEach((a) => h1.setAttribute(a.name, a.value));
        h1.innerHTML = top.innerHTML;
        top.replaceWith(h1);
      }
      // 섹션 안의 id 는 페이지마다 하나뿐이면 되므로 그대로 두되, 자바스크립트용 껍데기는 정리
      clone.querySelectorAll('[data-spot]').forEach((b) => {
        const img = b.querySelector('img');
        if (img) b.replaceWith(img);
      });
      return clone.outerHTML;
    }, p.from);

    if (!body) {
      console.log(`  ⚠️  ${p.slug} — #${p.from} 섹션이 없어 건너뜁니다 (site-data 에서 꺼져 있나요?)`);
      continue;
    }

    const html = shell({
      slug: p.slug, title: p.title, desc: p.desc,
      body: tidy(body), jsonld: jsonldFor(p, data, TODAY), nav: navHtml(p.slug),
      mobilebar: mobilebarHtml(data, p.slug), data,
    });
    const dir = path.join(ROOT, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    written.push(p);
    console.log(`  /${p.slug}/  ${(html.length / 1024).toFixed(0)}KB  ${p.title}`);

    if (p.allTabs || p.openDetails) {   // 원래 상태로 되돌리기 위해 다시 읽습니다
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  /* sitemap.xml — 검색엔진에 "이 주소들이 있습니다" 하고 알려주는 목록 */
  const today = TODAY;
  const urls = [{ loc: SITE + '/', pri: '1.0' }]
    .concat(written.map((p) => ({ loc: `${SITE}/${p.slug}/`, pri: '0.8' })));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`);

  /* robots.txt — 검색·AI 크롤러 모두에게 전체 공개.
     ChatGPT · Claude · Perplexity 같은 AI 답변 엔진은 자기 이름의 크롤러를 쓰는데,
     차단하지 않으면 우리 요금·메뉴를 답변에 인용할 수 있습니다. 여기서는 명시적으로 열어 둡니다. */
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    ['User-agent: *', 'Allow: /', '',
     '# AI 답변 엔진 (검색 결과에 우리 정보가 인용되도록 열어 둡니다)',
     ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User',
         'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']
       .flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
     `Sitemap: ${SITE}/sitemap.xml`, ''].join('\n'));

  console.log(`\n${written.length}개 페이지 + sitemap.xml + robots.txt 생성 완료`);
  await browser.close();
  server.close();
})();
