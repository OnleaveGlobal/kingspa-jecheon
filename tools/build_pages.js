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
    desc: '목욕 8,000원(소인 7,000원), 찜질방 12,000원(소인 11,000원). 헬스장 무료, 24시간 연중무휴, 주차 무료. 횟수권 · 정기권 안내.',
  },
  {
    slug: 'guide', from: '#guide',
    nav: '이용안내',
    title: '이용안내 — 처음 오시는 분께',
    desc: '발권부터 찜질까지 순서대로 안내합니다. 남녀 구분, 준비물, 외출 후 재입장, 어린이 동반, 주차 안내.',
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

function navHtml(current) {
  const items = PAGES.map((p) =>
    `      <a href="/${p.slug}/"${p.slug === current ? ' class="is-active" aria-current="page"' : ''}>${p.nav}</a>`);
  return items.join('\n');
}

function shell({ slug, title, desc, body, jsonld, nav }) {
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
    <a class="cta__btn" href="tel:0507-1385-4604">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z"/></svg>
      <span>0507-1385-4604</span>
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
      <p>충북 제천시 풍양로9길 5</p>
      <p>대표 김동술 &nbsp;·&nbsp; TEL. <a href="tel:0507-1385-4604">0507-1385-4604</a></p>
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

<script src="/assets/js/page.js"></script>
</body>
</html>
`;
}

/* ---------- 페이지별 구조화 데이터 ---------- */
function jsonldFor(page, data) {
  const crumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: page.nav, item: `${SITE}/${page.slug}/` },
    ],
  };
  const graph = [crumb, {
    '@type': 'WebPage',
    name: page.title,
    description: page.desc,
    url: `${SITE}/${page.slug}/`,
    isPartOf: { '@type': 'WebSite', name: '제천킹스파찜질방', url: SITE + '/' },
  }];

  if (page.slug === 'pricing') {
    graph.push({
      '@type': 'Offer', name: '이용요금', url: `${SITE}/pricing/`,
      priceCurrency: 'KRW',
      offers: data.pricing.main.map((r) => ({
        '@type': 'Offer', name: r.item,
        price: String(r.adult).replace(/[^0-9]/g, ''), priceCurrency: 'KRW',
      })),
    });
  }
  if (page.slug === 'menu') {
    graph.push({
      '@type': 'Menu', name: '제천킹스파찜질방 식당 메뉴', url: `${SITE}/menu/`,
      hasMenuSection: data.menu.groups.map((g) => ({
        '@type': 'MenuSection', name: g.name,
        hasMenuItem: (g.items || []).filter((i) => i.name).map((i) => ({
          '@type': 'MenuItem', name: i.name,
          offers: { '@type': 'Offer', price: String(i.price || '').replace(/[^0-9]/g, ''), priceCurrency: 'KRW' },
        })),
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
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
  const written = [];

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
      body: tidy(body), jsonld: jsonldFor(p, data), nav: navHtml(p.slug),
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
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{ loc: SITE + '/', pri: '1.0' }]
    .concat(written.map((p) => ({ loc: `${SITE}/${p.slug}/`, pri: '0.8' })));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`);

  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

  console.log(`\n${written.length}개 페이지 + sitemap.xml + robots.txt 생성 완료`);
  await browser.close();
  server.close();
})();
