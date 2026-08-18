/* ============================================================
   제천킹스파 · 공통 스크립트
   내용 수정은 data/site-data.js 에서 하세요.
   ============================================================ */
(function () {
  'use strict';

  var D = window.SITE_DATA || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* 따옴표가 들어간 이름을 속성값에 넣을 때 씁니다 */
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };

  /* ---------- 기본 정보 채우기 ---------- */
  function fillInfo() {
    var i = D.info; if (!i) return;

    $$('[data-tel-link]').forEach(function (el) { el.setAttribute('href', 'tel:' + i.tel); });
    $$('[data-tel-text]').forEach(function (el) { el.textContent = i.tel; });
    $$('[data-address]').forEach(function (el) { el.textContent = i.address; });
    $$('[data-address-old]').forEach(function (el) { el.textContent = '지번 : ' + i.addressOld; });
    $$('[data-ceo]').forEach(function (el) { el.textContent = i.ceo || '-'; });
    $$('[data-corp]').forEach(function (el) {
      if (i.corpName) { el.textContent = i.corpName; el.hidden = false; }
      else { el.hidden = true; }
    });
    $$('[data-hours]').forEach(function (el) { el.textContent = i.hours; });
    $$('[data-map-naver]').forEach(function (el) { el.setAttribute('href', i.naverMapUrl); });
    $$('[data-map-kakao]').forEach(function (el) { el.setAttribute('href', i.kakaoMapUrl); });

    $$('[data-biz]').forEach(function (el) {
      if (i.bizNumber) { el.hidden = false; var s = $('span', el); if (s) s.textContent = i.bizNumber; }
      else { el.hidden = true; }
    });

    $$('[data-instagram]').forEach(function (el) {
      if (i.instagramUrl) { el.setAttribute('href', i.instagramUrl); el.hidden = false; }
      else { el.hidden = true; }
    });

    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- 요금표 ---------- */
  function fillPricing() {
    var p = D.pricing; if (!p) return;

    var tb = $('#priceTable tbody');
    if (tb) {
      tb.innerHTML = p.main.map(function (r) {
        return '<tr>' +
          '<th scope="row"><strong>' + r.item + '</strong>' + (r.sub ? '<span>' + r.sub + '</span>' : '') + '</th>' +
          '<td class="is-main">' + r.adult + '</td>' +
          '<td>' + r.child + '</td>' +
          '</tr>';
      }).join('');
    }

    var cn = $('#priceChildNote');
    if (cn) cn.textContent = p.childNote || '';

    var ex = $('#priceExtras');
    if (ex) {
      ex.innerHTML = p.extras.map(function (e) {
        return '<li><span class="extras__label">' + e.label + '</span><span class="extras__value">' + e.value + '</span></li>';
      }).join('');
    }

    var ps = $('#passes');
    if (ps) {
      ps.innerHTML = p.passes.map(function (v) {
        return '<div class="pass' + (v.highlight ? ' is-hot' : '') + '">' +
          '<h4>' + v.name + '</h4>' +
          '<p class="pass__count">' + v.count + '</p>' +
          '<p class="pass__price">' + v.price + '</p>' +
          (v.note ? '<p class="pass__note">' + v.note + '</p>' : '') +
          '</div>';
      }).join('');
    }

    var pf = $('#passFooter');
    if (pf) { pf.textContent = p.passFooter || ''; pf.hidden = !p.passFooter; }

    // 헬스 + 사우나 회원권 — 기간권이라 횟수권과 나눠서 보여줍니다
    var mb = p.membership, mw = $('#memb');
    if (mw && mb && mb.show !== false) {
      mw.hidden = false;
      $('#membTitle').textContent = mb.title || '';
      var md = $('#membDesc');
      md.textContent = mb.desc || ''; md.hidden = !mb.desc;
      $('#membItems').innerHTML = (mb.items || []).map(function (v) {
        return '<div class="pass' + (v.highlight ? ' is-hot' : '') + '">' +
          '<h4>' + v.name + '</h4>' +
          '<p class="pass__price">' + v.price + '</p>' +
          (v.note ? '<p class="pass__note">' + v.note + '</p>' : '') +
          '</div>';
      }).join('');
      $('#membRules').innerHTML = (mb.rules || []).map(function (t) {
        return '<li>' + t + '</li>';
      }).join('');
    }
  }

  /* ---------- 수면방 ---------- */
  function fillSleep() {
    var d = D.sleep, sec = $('#sleep');
    if (!sec) return;
    if (!d || d.show === false) { sec.hidden = true; return; }
    sec.hidden = false;

    $('#slpTitle').textContent = d.title || '';
    $('#slpSub').textContent = d.sub || '';
    $('#slpDesc').textContent = d.desc || '';

    var lead = $('#slpLead');
    if (lead && d.lead) { lead.src = d.lead.src; lead.alt = d.lead.alt || ''; }

    $('#slpPhotos').innerHTML = (d.photos || []).map(function (p) {
      return '<li><figure>' +
        '<img src="' + p.src + '" alt="' + (p.alt || p.cap || '') + '" loading="lazy">' +
        (p.cap ? '<figcaption>' + p.cap + '</figcaption>' : '') +
        '</figure></li>';
    }).join('');

    $('#slpInfo').innerHTML = (d.info || []).map(function (r) {
      return '<div><dt>' + r.t + '</dt><dd>' + r.d + '</dd></div>';
    }).join('');
  }

  /* ---------- 워터슬라이드 ---------- */
  function fillWaterslide() {
    var w = D.waterslide;
    var sec = $('#waterslide');
    if (!sec) return;

    if (!w || !w.show) {
      sec.hidden = true;
      $$('[data-nav="waterslide"]').forEach(function (el) { el.hidden = true; });
      /* 하단 바는 칸을 다섯으로 나눠 두었으므로 네 칸으로 되돌립니다 */
      var mb = $('.mobilebar');
      if (mb) mb.classList.add('mobilebar--4');
      return;
    }
    sec.hidden = false;

    // 운영 기간 — 사진 위에 크게
    var se = $('#wsSeason');
    if (se) {
      var s = w.season || {};
      se.innerHTML =
        (s.year ? '<em>' + s.year + '</em>' : '') +
        '<b>' + (s.months || '') + '</b>' +
        (s.note ? '<span>' + s.note + '</span>' : '');
    }

    // 시설별 운영 시간
    var sp = $('#wsSpecs');
    if (sp) {
      sp.innerHTML = (w.attractions || []).map(function (a) {
        return '<li><b>' + a.name + '</b><span>' + a.time + '</span></li>';
      }).join('');
    }

    // 시설별 사진
    var ph = $('#wsPhotos');
    if (ph) {
      ph.innerHTML = (w.photos || []).map(function (p) {
        return '<li><figure>' +
          '<img src="' + p.src + '" alt="' + (p.alt || p.cap || '') + '" loading="lazy">' +
          (p.cap ? '<figcaption>' + p.cap + '</figcaption>' : '') +
          '</figure></li>';
      }).join('');
    }

    var on = $('#wsOpenNote');
    if (on) {
      if (w.openNote) { on.textContent = w.openNote; on.hidden = false; }
      else { on.hidden = true; }
    }

    // 기본 안내
    var info = $('#wsInfo');
    if (info) {
      var rows = [];
      if (w.price)  rows.push(['이용 요금', w.price]);
      if (w.wear)   rows.push(['복장', w.wear]);
      info.innerHTML = rows.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
      }).join('');
    }

    // 안전 수칙
    var sf = $('#wsSafety');
    if (sf) {
      if (!w.safety || !w.safety.length) { sf.innerHTML = ''; }
      else {
        sf.innerHTML = '<p class="wssafe__hd">안전을 위해 꼭 지켜주세요</p><ul>' +
          w.safety.map(function (s) {
            return '<li><b>' + s.title + '</b><span>' + s.body + '</span></li>';
          }).join('') + '</ul>';
      }
    }
  }

  /* ---------- 인사말 ---------- */
  function fillGreeting() {
    var g = D.greeting;
    var sec = $('#greeting');
    if (!sec) return;
    if (!g || !g.show) { sec.hidden = true; return; }
    sec.hidden = false;

    /* 인사말 아래 사진 — 없으면 통째로 감춥니다 */
    var box = $('#greetPhotoBox');
    var img = $('#greetPhoto');
    if (box && img) {
      if (g.photo) {
        img.src = g.photo; img.alt = g.photoAlt || '';
        var cap = $('#greetPhotoCap');
        if (cap) cap.textContent = g.photoCaption || '';
        box.hidden = false;
      } else { img.removeAttribute('src'); box.hidden = true; }
    }
    var lb = $('#greetLabel');
    if (lb) {
      if (g.label) { lb.textContent = g.label; lb.hidden = false; }
      else { lb.hidden = true; }
    }
    var t = $('#greetTitle'); if (t) t.textContent = g.title || '';
    var b = $('#greetBody');
    if (b) b.innerHTML = (g.body || []).map(function (p) { return '<p>' + p + '</p>'; }).join('');

    /* 손글씨 사진이 있으면 그것을 보여주고, 글은 화면에서만 감춥니다.
       지우지 않는 이유 — 사진 속 글자는 검색엔진도 화면낭독기도 읽지 못합니다.
       감춘 글이 그 역할을 대신합니다. */
    var hand = $('#greetHand');
    if (hand) {
      if (g.handwriting) {
        hand.src = g.handwriting;
        hand.alt = (g.body || []).join(' ');
        hand.hidden = false;
        if (b) b.classList.add('is-sr');
      } else {
        hand.removeAttribute('src');
        hand.hidden = true;
        if (b) b.classList.remove('is-sr');
      }
    }
    var sg = $('#greetSign'); if (sg) sg.textContent = g.sign || '';
    /* 손으로 쓰신 서명 — 이름은 위 글자가 이미 알려주므로 alt 는 비웁니다 */
    var si = $('#greetSignImg');
    if (si) {
      if (g.signImage) { si.src = g.signImage; si.alt = ''; si.hidden = false; }
      else { si.removeAttribute('src'); si.hidden = true; }
    }
  }

  /* ---------- 위생 관리 (세스코) ---------- */
  function fillHygiene() {
    var h = D.hygiene;
    var box = $('#hygiene');
    if (!box) return;
    if (!h || !h.show) { box.hidden = true; return; }
    box.hidden = false;

    box.innerHTML =
      '<img class="hyg__badge" src="' + h.badge + '" alt="' + esc(h.badgeAlt || '') + '" loading="lazy">' +
      '<div class="hyg__bd">' +
        '<p class="hyg__t">' + h.title + '</p>' +
        '<p class="hyg__d">' + h.desc + '</p>' +
      '</div>';
  }

  /* ---------- 허브 노천탕 ---------- */
  function fillHerb() {
    var h = D.herb; if (!h) return;

    var box = $('#herbSchedule');
    if (!box) return;
    if (!h.showSchedule) { box.innerHTML = ''; return; }

    box.innerHTML = '<table class="herbtable"><tbody><tr>' +
      h.schedule.map(function (d) { return '<th>' + d.day + '</th>'; }).join('') +
      '</tr><tr>' +
      h.schedule.map(function (d) { return '<td>' + (d.herb || '-') + '</td>'; }).join('') +
      '</tr></tbody></table>';
  }

  /* ---------- 대문 사진 슬라이드 ---------- */
  function heroSlider() {
    var h = D.hero;
    var box = $('#heroSlides');
    if (!box || !h || !h.images || !h.images.length) return;

    var list = h.images;
    /* 슬라이드는 모두 화면 안에 겹쳐 놓이므로 loading="lazy" 가 통하지 않습니다.
       (브라우저가 "보이는 사진"으로 판단해 여섯 장을 한꺼번에 내려받았습니다 — 약 2.2MB)
       그래서 첫 장만 주소를 걸어 두고 나머지는 data-src 로 재워 둡니다.
       페이지가 다 뜬 뒤 두 번째 장을 미리 깨우고, 그다음부터는 넘어가기 직전에 깨웁니다. */
    box.innerHTML = list.map(function (im, i) {
      return '<img class="vslide' + (i === 0 ? ' is-on' : '') + '"' +
             (i === 0 ? ' src="' + im.src + '" fetchpriority="high"'
                      : ' data-src="' + im.src + '" loading="lazy" decoding="async"') +
             ' alt="' + (im.alt || '') + '"' +
             ' style="object-position:' + (im.pos || 'center') + '">';
    }).join('');

    var dots = $('#heroDots');
    if (dots) {
      dots.innerHTML = list.map(function (im, i) {
        return '<li><button type="button" class="' + (i === 0 ? 'is-on' : '') +
               '" data-i="' + i + '" aria-label="' + (i + 1) + '번째 사진"></button></li>';
      }).join('');
    }

    var slides = $$('.vslide', box);
    var btns = dots ? $$('button', dots) : [];
    var cur = 0, timer = null;

    /* 재워 둔 사진을 깨웁니다 — 이미 깨어 있으면 아무 일도 하지 않습니다 */
    function wake(i) {
      var el = slides[(i + slides.length) % slides.length];
      if (el && el.dataset.src) {
        el.src = el.dataset.src;
        delete el.dataset.src;
      }
    }

    function go(n) {
      cur = (n + slides.length) % slides.length;
      wake(cur);
      wake(cur + 1);   // 다음 장을 미리 받아 둬야 넘길 때 깜빡이지 않습니다
      slides.forEach(function (el, i) { el.classList.toggle('is-on', i === cur); });
      btns.forEach(function (el, i) { el.classList.toggle('is-on', i === cur); });
    }
    function start() {
      if (!h.interval || slides.length < 2) return;
      stop();
      timer = setInterval(function () { go(cur + 1); }, h.interval);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    var prev = $('#heroPrev'), next = $('#heroNext');
    if (prev) prev.addEventListener('click', function () { go(cur - 1); start(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); start(); });
    if (dots) dots.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) { go(parseInt(b.dataset.i, 10)); start(); }
    });

    // 마우스를 올리면 멈추고, 다른 탭에 가 있으면 돌지 않는다
    var sec = $('#home');
    if (sec) {
      sec.addEventListener('mouseenter', stop);
      sec.addEventListener('mouseleave', start);
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    // 손가락으로 밀어서 넘기기
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      x0 = null; start();
    });

    /* 첫 화면이 다 그려진 뒤에 두 번째 장을 미리 받아 둡니다 */
    if (document.readyState === 'complete') wake(1);
    else window.addEventListener('load', function () { wake(1); });

    start();
  }

  /* ---------- 홍보 문구 ---------- */
  function fillSlogans() {
    var g = D.slogans;
    var sec = $('#slogan');
    if (!sec) return;
    if (!g || !g.show || !g.items || !g.items.length) { sec.hidden = true; return; }
    sec.hidden = false;

    var t = $('#sloganTitle');  if (t) t.textContent = g.title || '';
    var b = $('#sloganStrong'); if (b) b.textContent = g.titleStrong || '';

    var box = $('#sloganList');
    if (!box) return;
    box.innerHTML = g.items.map(function (it) {
      return '<li>' +
        '<img class="slogan__char" src="assets/img/' + it.char + '" alt="" loading="lazy">' +
        '<p class="slogan__txt">' +
          '<b>' + it.lead + '</b>' +
          (it.sub ? '<span>' + it.sub + '</span>' : '') +
        '</p>' +
      '</li>';
    }).join('');
  }

  /* ---------- 제천 가볼 만한 곳 ---------- */
  function fillNearby() {
    var n = D.nearby;
    var sec = $('#nearby');
    if (!sec) return;
    if (!n || !n.show || !(n.places || []).length) { sec.hidden = true; return; }
    sec.hidden = false;

    var t = $('#nearbyTitle'); if (t) t.textContent = n.title || '';
    var dz = $('#nearbyDesc'); if (dz) dz.textContent = n.desc || '';
    var nt = $('#nearbyNotice');
    if (nt) {
      if (n.notice) { nt.textContent = n.notice; nt.hidden = false; }
      else { nt.hidden = true; }
    }

    var base = n.imgBase || 'assets/img/nearby/';
    var box = $('#nearbyBody');

    if (box) {
      var html = '';

      /* 걸어서 갈 수 있는 곳 — 표 한 줄짜리 목록 */
      if (n.walk && (n.walk.items || []).length) {
        html += '<div class="nb">' +
          '<p class="nb__label">' + n.walk.label + '</p>' +
          '<ul class="nb__list">' + n.walk.items.map(function (it) {
            return '<li>' +
              (it.slug
                ? '<img class="nb__img" src="' + base + it.slug + '-card.jpg" alt="' + esc(it.name) + '"' +
                  ' data-photo="' + esc(it.name) + '" data-size="640×480" loading="lazy">'
                : '') +
              '<div class="nb__txt">' +
                '<span class="nb__time">' + it.time + '</span>' +
                '<b>' + it.name + '</b><p>' + it.desc + '</p>' +
              '</div>' +
            '</li>';
          }).join('') + '</ul>' +
        '</div>';
      }

      /* 차로 다녀오는 곳 — 사진 카드 */
      html += '<div class="nb">' +
        '<p class="nb__label">' + (n.placesLabel || '차로') + '</p>' +
        '<div class="spots">' + n.places.map(function (p, i) {
          var info = p.info || {};
          return '<article class="spot">' +
            '<button class="spot__img" type="button" data-spot="' + i + '"' +
                   ' aria-label="' + esc(p.name) + ' 사진 크게 보기">' +
              '<img src="' + base + p.slug + '-card.jpg" alt="' + esc(p.name) + '" loading="lazy" width="760" height="428">' +
            '</button>' +
            '<div class="spot__bd">' +
              /* 킹스파에서 얼마나 걸리는지를 이름보다 먼저 보여줍니다 */
              (p.from ? '<span class="spot__from">' + p.from + '</span>' : '') +
              '<p class="spot__t">' + p.name +
                (p.tag ? '<em class="nb__tag">' + p.tag + '</em>' : '') + '</p>' +
              (p.sub ? '<p class="spot__sub">' + p.sub + '</p>' : '') +
              /* 설명과 주소·시간은 접어 둔다 — 카드가 짧아야 여러 곳이 한눈에 들어온다 */
              '<details class="spot__more">' +
                '<summary>자세히</summary>' +
                '<p class="spot__d">' + p.desc + '</p>' +
                '<dl class="spot__info">' + Object.keys(info).map(function (k) {
                  var v = info[k];
                  var isLink = /^https?:\/\//.test(v);
                  return '<dt>' + k + '</dt><dd>' +
                    (isLink ? '<a href="' + v + '" target="_blank" rel="noopener">' + v + '</a>' : v) +
                    '</dd>';
                }).join('') + '</dl>' +
                (p.note ? '<p class="spot__note">' + p.note + '</p>' : '') +
                '<a class="spot__link" href="' + p.url + '" target="_blank" rel="noopener">제천시 안내 보기 ↗</a>' +
              '</details>' +
            '</div>' +
          '</article>';
        }).join('') + '</div>' +
      '</div>';

      box.innerHTML = html;
      spotViewer(n, base);
    }

    var f = $('#nearbyFooter');
    if (f) {
      f.innerHTML = (n.footer || '') +
        (n.link && n.link.url
          ? ' <a class="cnote__link" href="' + n.link.url + '" target="_blank" rel="noopener">' +
            (n.link.label || '바로가기') + ' ↗</a>'
          : '') +
        /* CC BY 사진의 저작자 표시 — 라이선스상 반드시 함께 보여야 합니다 */
        (n.credit ? '<span class="cnote__credit">' + n.credit + '</span>' : '');
    }
  }

  /* ---------- 관광지 사진 크게 보기 ----------
     카드 사진을 누르면 그 장소의 사진을 전부 넘겨볼 수 있는 창이 뜹니다.
     사진은 창을 열 때 비로소 내려받으므로 평소에는 페이지가 무거워지지 않습니다.  */
  function spotViewer(n, base) {
    var box = $('#spotView');
    if (!box) return;

    var img   = $('#spotViewImg');
    var cap   = $('#spotViewCap');
    var count = $('#spotViewCount');
    var place = null, idx = 0, lastFocus = null;

    function show(i) {
      var shots = place.photos;
      idx = (i + shots.length) % shots.length;
      img.src = base + shots[idx].f;
      img.alt = shots[idx].alt || place.name;
      cap.textContent = shots[idx].alt || place.name;
      count.textContent = (idx + 1) + ' / ' + shots.length;
    }

    function open(i) {
      place = n.places[i];
      if (!place || !(place.photos || []).length) return;
      lastFocus = document.activeElement;
      $('#spotViewTtl').textContent = place.name;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      show(0);
      $('#spotViewClose').focus();
    }

    function close() {
      box.hidden = true;
      img.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-spot]').forEach(function (b) {
      b.addEventListener('click', function () { open(parseInt(b.dataset.spot, 10)); });
    });

    $('#spotViewPrev').onclick  = function () { show(idx - 1); };
    $('#spotViewNext').onclick  = function () { show(idx + 1); };
    $('#spotViewClose').onclick = close;
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- 360 파노라마 뷰어 ----------
     사진을 드래그해서 돌려보는 뷰어입니다. pannellum 라이브러리를 쓰며,
     파노라마 사진이 있을 때만 내려받으므로 평소에는 페이지가 무거워지지 않습니다.  */
  var PANO_JS  = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
  var PANO_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';

  function loadPannellum(cb) {
    if (window.pannellum) { cb(); return; }
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = PANO_CSS;
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = PANO_JS;
    // onload 는 이벤트 객체를 넘기므로 인자 없이 호출해야 합니다
    js.onload  = function () { cb(); };
    js.onerror = function () { cb(new Error('viewer load failed')); };
    document.head.appendChild(js);
  }

  function buildPanoViewer(box, list) {
    box.innerHTML =
      '<div class="pano"><div class="pano__stage" id="panoStage">' +
        '<div class="pano__loading">360도 화면을 불러오는 중입니다…</div>' +
      '</div></div>' +
      (list.length > 1
        ? '<div class="pano__tabs">' + list.map(function (p, i) {
            return '<button type="button" class="pano__tab' + (i === 0 ? ' is-on' : '') +
                   '" data-i="' + i + '">' + p.name + '</button>';
          }).join('') + '</div>'
        : '');

    loadPannellum(function (err) {
      var stage = $('#panoStage');
      if (err || !window.pannellum) {
        stage.innerHTML = '<div class="pano__fail">360도 화면을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
        return;
      }
      stage.innerHTML = '';

      var scenes = {};
      list.forEach(function (p, i) {
        scenes['s' + i] = {
          type: 'equirectangular',
          panorama: p.img,
          title: p.name || '',
          autoLoad: true,
          hfov: 100
        };
      });

      var viewer = window.pannellum.viewer(stage, {
        default: {
          firstScene: 's0',
          autoLoad: true,
          showFullscreenCtrl: true,
          sceneFadeDuration: 700,
          autoRotate: -2,
          autoRotateInactivityDelay: 3000
        },
        scenes: scenes
      });

      var tabs = $$('.pano__tab', box);
      tabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
          tabs.forEach(function (b) { b.classList.remove('is-on'); });
          btn.classList.add('is-on');
          viewer.loadScene('s' + btn.dataset.i);
        });
      });
    });
  }

  /* ---------- 360도 공간 둘러보기 ---------- */
  function fillTour() {
    var t = D.tour360;
    var sec = $('#tour');
    if (!sec) return;
    if (!t || !t.show) { sec.hidden = true; $$('a[href="#tour"]').forEach(function (a) { a.style.display = 'none'; }); return; }
    sec.hidden = false;

    var set = function (id, v) { var el = $(id); if (el) el.textContent = v || ''; };
    set('#tourTitle', t.title);
    set('#tourDesc', t.desc);
    set('#tourNote', t.note);

    var box = $('#tourBox');
    if (!box) return;

    if (t.panoramas && t.panoramas.length) {
      // ① 직접 찍은 파노라마 — 자체 뷰어로 재생
      buildPanoViewer(box, t.panoramas);

    } else if (t.embedUrl) {
      // ① 페이지 안에 바로 삽입
      box.innerHTML = '<div class="tour__frame">' +
        '<iframe src="' + t.embedUrl + '" title="360도 공간 둘러보기" loading="lazy" ' +
        'allowfullscreen allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope"></iframe></div>';

    } else if (t.linkUrl) {
      // ② 사진 위에 버튼 → 새 창으로 열기
      box.innerHTML = '<a class="tour__poster" href="' + t.linkUrl + '" target="_blank" rel="noopener">' +
        '<img data-photo="360도 투어 대표 이미지" data-size="1600×900" src="' + (t.poster || '') + '" alt="">' +
        '<span class="tour__play">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
          '360도로 둘러보기' +
        '</span></a>';
      photoPlaceholders();

    } else {
      // ③ 아직 준비 전
      box.innerHTML = '<div class="tour__wait">' +
        '<span class="tour__wait-ico">🔄</span>' +
        '<b>360도 투어를 준비하고 있습니다</b>' +
        '<span>파노라마 사진이 준비되면 이 자리에서 바로 돌려 보실 수 있습니다.</span>' +
        '</div>';
    }
  }

  /* ---------- 식당 메뉴 ---------- */
  /* 좌우로 넘겨 보는 사진 — 손가락으로 밀거나 화살표를 누른다 */
  function gallery(ids, photos) {
    var track = $(ids.track);
    var box   = $(ids.box);
    if (!track || !box) return;
    if (!photos || !photos.length) { box.hidden = true; return; }
    box.hidden = false;

    track.innerHTML = photos.map(function (p) {
      return '<figure class="gal__item">' +
        '<img src="' + p.src + '" alt="' + (p.alt || p.cap || '') + '" loading="lazy">' +
        (p.cap ? '<figcaption>' + p.cap + '</figcaption>' : '') +
        '</figure>';
    }).join('');

    var dots = $(ids.dots);
    if (dots) {
      dots.innerHTML = photos.map(function (p, i) {
        return '<li' + (i ? '' : ' class="is-on"') + '><button type="button" aria-label="' +
          (i + 1) + '번째 사진"></button></li>';
      }).join('');
    }

    var prev = $(ids.prev);
    var next = $(ids.next);
    var last = photos.length - 1;
    var cur  = 0;

    // 몇 번째 사진인지 표시를 고친다
    var mark = function (i) {
      cur = i;
      if (dots) {
        [].forEach.call(dots.children, function (li, n) { li.classList.toggle('is-on', n === i); });
      }
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= last;
    };

    // 눌렀을 때는 스크롤을 기다리지 않고 바로 표시를 바꾼다
    var go = function (i) {
      i = Math.max(0, Math.min(last, i));
      mark(i);
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    };

    if (prev) prev.addEventListener('click', function () { go(cur - 1); });
    if (next) next.addEventListener('click', function () { go(cur + 1); });
    if (dots) {
      dots.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        go([].indexOf.call(dots.children, b.parentNode));
      });
    }

    // 손가락으로 밀었을 때 — 멈춘 뒤에 맞춘다
    var timer;
    track.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        mark(Math.round(track.scrollLeft / track.clientWidth));
      }, 90);
    });
    window.addEventListener('resize', function () {
      track.scrollTo({ left: cur * track.clientWidth, behavior: 'instant' });
    });
    mark(0);
  }

  function fillMenu() {
    var m = D.menu;
    var sec = $('#menu');
    if (!sec) return;
    if (!m || !m.show || !m.groups || !m.groups.length) { sec.hidden = true; return; }
    sec.hidden = false;

    gallery({
      box: '#menuHall', track: '#hallTrack', dots: '#hallDots',
      prev: '#hallPrev', next: '#hallNext',
    }, m.hall);

    var tabs = $('#menuTabs');
    var body = $('#menuBody');
    if (!body) return;

    if (tabs) {
      tabs.innerHTML = m.groups.map(function (g, i) {
        return '<button type="button" class="mtab' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">' +
          '<b>' + g.name + '</b>' + (g.en ? '<em>' + g.en + '</em>' : '') + '</button>';
      }).join('');
    }

    var render = function (i) {
      var g = m.groups[i];
      var hasTable = !!(g.items && g.items.length);
      var pics = g.photos || [];

      var photos = pics.length
        ? '<div class="mgrid' + (pics.length === 1 ? ' is-one' : '') + '">' +
            pics.map(function (p) {
              return '<figure class="mitem"><div class="mitem__img">' +
                '<img data-photo="' + (p.name || g.name) + '" data-size="1400×1400"' +
                ' src="assets/img/food/' + p.img + '" alt="' + (p.name || g.name) + '">' +
              '</div></figure>';
            }).join('') +
          '</div>'
        : '';

      var table = hasTable
        ? '<div class="tablewrap mtblwrap"><table class="mtbl">' +
            '<thead><tr><th>메뉴</th><th>판매가</th></tr></thead><tbody>' +
            g.items.map(function (it) {
              /* { divider: "주류" } 처럼 적으면 표 중간에 소분류 줄이 들어갑니다 */
              if (it.divider) {
                return '<tr class="mtbl__div"><th colspan="2" scope="colgroup">' +
                  it.divider + '</th></tr>';
              }
              return '<tr><th scope="row">' + it.name +
                /* 피자 토핑처럼 메뉴판에 적힌 설명은 이름 아래 작게 */
                (it.sub ? '<span>' + it.sub + '</span>' : '') +
                '</th><td>' + (it.price || '-') + '</td></tr>';
            }).join('') +
          '</tbody></table></div>'
        : '';

      // 사진과 가격표가 다 있으면 좌우로, 하나만 있으면 전체 폭을 씁니다.
      // (사진 없이 가격표만 있으면 왼쪽 사진칸이 빈 채로 남습니다)
      /* 분류마다 붙는 안내 한 줄 (예: 야간 메뉴 주문 가능 시간) */
      var lead = g.desc ? '<p class="mlead">' + g.desc + '</p>' : '';

      body.innerHTML = lead + ((hasTable && pics.length)
        ? '<div class="mbody"><div class="mside">' + photos + '</div>' + table + '</div>'
        : '<div class="mbody mbody--wide">' + photos + table + '</div>');

      photoPlaceholders();
    };
    render(0);

    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.mtab');
        if (!btn) return;
        $$('.mtab', tabs).forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        render(parseInt(btn.dataset.i, 10));
      });
    }

    var note = $('#menuNote');
    if (note) {
      var biz = m.business;
      note.innerHTML = (m.note || '') +
        (m.origin ? '<span class="cnote__credit">' + m.origin + '</span>' : '') +
        /* 식당은 찜질방과 사업자가 다릅니다 — 음식·주류를 파는 주체를 밝힙니다 */
        (biz ? '<span class="cnote__credit">식당 운영 ' + biz.name +
               ' · 대표 ' + biz.ceo +
               ' · 사업자등록번호 ' + biz.bizNumber +
               (biz.liquorNumber ? ' · 주류판매신고번호 ' + biz.liquorNumber : '') +
               '</span>' : '');
    }
  }

  /* ---------- 사진 자리표시자 ----------
     실제 이미지 파일이 없으면 "여기에 어떤 사진이 들어가는지" 안내 박스를 대신 보여줍니다.
     assets/img/ 에 같은 이름의 파일을 넣으면 자동으로 사진이 나옵니다.            */
  function photoPlaceholders() {
    $$('img[data-photo]').forEach(function (img) {
      var swap = function () {
        if (img.dataset.phDone) return;
        img.dataset.phDone = '1';
        var box = document.createElement('div');
        box.className = 'ph';
        box.innerHTML =
          '<span class="ph__ico">📷</span>' +
          '<span class="ph__label">' + img.dataset.photo + '</span>' +
          '<span class="ph__meta">' + (img.getAttribute('src') || '') +
            (img.dataset.size ? ' · 권장 ' + img.dataset.size : '') + '</span>';
        if (img.parentNode) img.parentNode.replaceChild(box, img);
      };
      img.addEventListener('error', swap);
      if (img.complete && img.naturalWidth === 0) swap();
    });
  }

  /* ---------- 헤더 · 모바일 메뉴 · 현재 위치 ---------- */
  function nav() {
    var header = $('#header');
    var burger = $('#burger');
    var menu   = $('#nav');

    if (header) {
      var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 40); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      });
      $$('a', menu).forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('nav-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // 스크롤 위치에 따라 메뉴 활성화
    // 360도 둘러보기처럼 다른 섹션 안에 들어 있는 자리는 지켜보지 않습니다.
    // 둘이 동시에 화면에 걸려 메뉴 표시가 왔다 갔다 하기 때문입니다.
    var links = $$('a[href^="#"]', menu || document).filter(function (a) {
      if (a.getAttribute('href').length <= 1) return false;
      var el = document.getElementById(a.getAttribute('href').slice(1));
      return el && el.tagName === 'SECTION';
    });
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secs.indexOf(e.target);
        if (i < 0) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        links[i].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ---------- 맨 위로 버튼 ---------- */
  function toTop() {
    var btn = $('#toTop');
    if (!btn) return;
    var tick = function () { btn.classList.toggle('is-on', window.scrollY > 420); };
    window.addEventListener('scroll', tick, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    tick();
  }

  /* ---------- 실행 ---------- */
  function init() {
    fillInfo();
    heroSlider();
    fillPricing();
    fillSleep();
    fillWaterslide();
    fillHerb();
    fillGreeting();
    fillHygiene();
    fillSlogans();
    fillNearby();
    fillTour();
    fillMenu();
    photoPlaceholders();
    nav();
    toTop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
