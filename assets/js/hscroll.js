/* ============================================================
   옆으로 미는 목록에 「점 표시」를 붙입니다.

   왜 필요한가
     좁은 화면에서 시설 카드(8장)와 물놀이 사진(4장)은 한 줄로 두고
     손가락으로 밀어 보게 되어 있습니다. 그런데 밀 수 있다는 표시가 없어서
     화면에 보이는 두어 장이 전부인 줄 알고 지나칩니다.
     아래에 점을 찍어 "뒤에 더 있다"는 것과 지금 어디쯤인지를 알립니다.

   점은 좁은 화면에서만 보입니다 (넓은 화면에서는 전부 펼쳐지므로 필요 없음).
   ============================================================ */
(function () {
  'use strict';

  function attach(track) {
    if (!track || !track.children.length) return;

    /* 미리 그려 둔 페이지에는 점 목록이 이미 들어 있습니다.
       그럴 때는 새로 만들지 않고 그대로 다시 씁니다 (안 그러면 두 벌이 됩니다) */
    var dots = track.nextElementSibling;
    if (!dots || !dots.classList.contains('hsdots')) {
      dots = document.createElement('ol');
      dots.className = 'hsdots';
      track.parentNode.insertBefore(dots, track.nextSibling);
    }

    var items = Array.prototype.slice.call(track.children);
    dots.innerHTML = items.map(function (_, i) {
      return '<li><button type="button" aria-label="' + (i + 1) + '번째로 이동"></button></li>';
    }).join('');

    var btns = Array.prototype.slice.call(dots.querySelectorAll('button'));

    function mark() {
      var x = track.scrollLeft;
      var max = track.scrollWidth - track.clientWidth;
      var near;

      if (x >= max - 2) {
        /* 끝까지 민 상태. 마지막 칸은 왼쪽 끝까지 올 수 없어서
           거리로만 재면 끝의 한두 칸 앞에서 멈춥니다 — 여기서는 마지막으로 못박습니다 */
        near = items.length - 1;
      } else if (x <= 2) {
        near = 0;
      } else {
        /* 그 밖에는 왼쪽 끝에서 가장 가까운 칸 */
        near = 0;
        var best = Infinity;
        items.forEach(function (el, i) {
          var d = Math.abs(el.offsetLeft - track.offsetLeft - x);
          if (d < best) { best = d; near = i; }
        });
      }
      btns.forEach(function (b, i) { b.classList.toggle('is-on', i === near); });
    }

    var timer;
    track.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(mark, 80);
    }, { passive: true });

    dots.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var i = btns.indexOf(b);
      if (i < 0) return;
      track.scrollTo({
        left: items[i].offsetLeft - track.offsetLeft,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });

    mark();
  }

  function init() {
    ['.facils--row', '#slpPhotos', '#wsPhotos'].forEach(function (sel) {
      attach(document.querySelector(sel));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
