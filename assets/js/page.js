/* ============================================================
   섹션별 페이지용 — 아주 작은 스크립트.
   내용은 이미 HTML 안에 다 들어 있어서, 여기서는
   모바일 메뉴 열고 닫기와 「맨 위로」 버튼만 담당합니다.
   ============================================================ */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var menu   = document.getElementById('nav');
  var toTop  = document.getElementById('toTop');

  if (header) {
    var stick = function () { header.classList.toggle('is-stuck', window.scrollY > 40); };
    window.addEventListener('scroll', stick, { passive: true });
    stick();
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (toTop) {
    var tick = function () { toTop.classList.toggle('is-on', window.scrollY > 420); };
    window.addEventListener('scroll', tick, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    tick();
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
