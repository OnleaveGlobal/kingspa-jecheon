360 가상투어 — 배포용 폴더
================================

[로컬에서 확인]
  이 폴더에서 아래 명령 중 하나를 실행한 뒤 브라우저로 접속하세요.
    python3 -m http.server 8000      → http://localhost:8000/tour.html
    npx serve                        → 표시되는 주소 뒤에 /tour.html
  (file:// 로 그냥 열면 브라우저 보안 때문에 사진이 안 뜹니다. 반드시 서버로 여세요.)

[웹사이트에 붙이기]
  1) 이 tour 폴더를 통째로 사이트에 업로드하고 /tour.html 로 링크하거나
  2) 다른 페이지에 iframe 으로 삽입:
     <iframe src="tour/tour.html" style="width:100%;height:600px;border:0" allowfullscreen></iframe>

[구성]
  tour.html        투어 페이지 (이 안의 SCENES 배열만 고치면 지점/핫스팟이 바뀝니다)
  lib/             360 뷰어 라이브러리 (Pannellum, MIT) — 수정하지 마세요
  images/          지점 사진 (equirectangular, 2:1)

인터넷 없이도 동작합니다 (라이브러리가 lib/ 에 포함).