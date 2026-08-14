#!/usr/bin/env python3
"""
음식 사진(배경 교체본 PNG)을 웹용 JPEG 로 만듭니다.

들어오는 것
  _retouched/food/<분류>/MH_xxxxx.png   ← 배경을 갈아 끼운 원본 (1MB 넘는 PNG)

나가는 것
  assets/img/food/<영문이름>.jpg        ← 사이트가 실제로 쓰는 파일

왜 변환하나
  · PNG 는 사진에 쓰면 JPEG 보다 5~10배 무겁습니다.
  · 폴더 이름이 한글이라 주소에 그대로 쓰면 브라우저마다 처리가 달라집니다.
    그래서 영문 파일명으로 바꿔 한 폴더에 모읍니다.

쓰는 법
  python3 tools/build_food_photos.py            # 실제로 만듭니다
  python3 tools/build_food_photos.py --dry-run  # 무엇이 만들어지는지만 봅니다

사진을 바꾸려면 아래 MAP 의 원본 번호만 갈아 끼우면 됩니다.
"""
import io
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_retouched" / "food"          # 배경 교체 원본 (다시 만들 수 없는 작업물)
FOOD = ROOT / "assets" / "img" / "food"     # 사이트가 쓰는 결과물
RATIO = 4 / 3      # 사이트에서 4:3 으로 잘라 보여줍니다
WIDTH = 900        # 화면 표시 최대 약 430px → 고해상도 화면 대비 2배
QUALITY = 82

# 만들 파일 : (원본이 든 폴더, 원본 이름)
MAP = {
    # 계란이 비빔밥을 덮어 야채가 안 보인다고 하셔서 뺐습니다 (다시 찍은 bibimbap.jpg 로 대체)
    # "meal-1.jpg":   ("식사준비", "MH_07485"),
    # "meal-2.jpg":   ("식사준비", "MH_07519"),
    "meal-3.jpg":   ("식사준비", "MH_07534"),
    "meal-4.jpg":   ("식사준비", "MH_07504"),
    "meal-5.jpg":   ("식사준비", "MH_07528"),
    # 2차 촬영 — 메뉴판 품목을 하나씩 찍은 사진들
    # 파일명이 「김치찌개」로 왔지만 실제로는 국물떡볶이입니다 (사업주 확인)
    "tteokbokki.jpg":   ("식사준비", "tteokbokki"),
    # 비스듬히 찍은 두 번째 컷(tteokbokki-2)은 사업주 요청으로 뺐습니다
    "nakji.jpg":    ("식사준비", "nakji"),   # 3차 교체본 — 이미 바로 서 있어 회전 없음
    "bibimbap.jpg": ("식사준비", "bibimbap"),
    "donkatsu.jpg": ("식사준비", "donkatsu"),
    "naengmyeon.jpg": ("식사준비", "naengmyeon"),
    "buchujeon.jpg":  ("식사준비", "buchujeon"),
    "hwarak-1.jpg": ("화락",     "MH_07459"),
    "hwarak-2.jpg": ("화락",     "ganjang-chibap"),
    # 남자피자는 셋 다 같은 피자를 찍은 것이라 생맥주가 함께 나온 한 장만 씁니다
    "pizza-2.jpg":  ("남자피자", "MH_07559"),
    "pizza-4.jpg":  ("남자피자", "potato-pizza"),
    "pizza-5.jpg":  ("남자피자", "potato-pizza-2"),
    "kc-1.jpg":     ("KC치킨",   "MH_07450"),
    "kc-2.jpg":     ("KC치킨",   "MH_07472"),
    "kc-3.jpg":     ("KC치킨",   "MH_07455"),
    "night-1.jpg":  ("KC치킨",   "MH_07546"),
    "night-2.jpg":  ("KC치킨",   "MH_07539"),
    "icebar.jpg":   ("상하목장", "icebar"),      # ICE FACTORY 천연과일 아이스크림 6종
    "ramen-cup.jpg": ("한강라면", "ramen-cup"),
    "waffle.jpg":   ("매점",     "waffle"),
    "squid.jpg":    ("매점",     "squid"),
    "sangha-1.jpg": ("상하목장", "MH_07632"),
    "sangha-2.jpg": ("상하목장", "MH_07622"),
    # 빙수(MH_07634 · MH_07607)와 음료(MH_07560)는 배경 교체본 대신
    # 주황 배경 원본(patbingsu*.jpg · sikhye.jpg)을 그대로 씁니다 — 사업주 요청.
    # 다시 배경 교체본으로 바꾸시려면 아래 세 줄의 # 를 지우고
    # data/site-data.js 의 매점 photos 도 같이 바꾸면 됩니다.
    # "bingsu-1.jpg": ("상하목장", "MH_07634"),
    # "bingsu-2.jpg": ("상하목장", "MH_07607"),
    # "drink-1.jpg":  ("공용메뉴", "MH_07560"),
}

# 여백이 많아 음식이 작아 보이는 사진은 가운데를 잘라 키웁니다.
#   값은 「원본의 몇 할을 쓸지」 — 0.8 이면 가운데 80%만 씁니다.
ZOOM = {
    "bibimbap.jpg": 0.78,   # 양푼이비빔밥 — 초록 배경이 넓어 상이 작아 보였습니다
}


# 배경 교체본이 없어 촬영 원본에서 바로 뽑은 사진.
# 세로로 찍힌 자판기라 4:3 안에 기계 전체를 담을 수 없습니다. 그래서
# 무엇을 파는 기계인지 한눈에 알 수 있는 부분 — 간판과 가격 화면 — 이
# 들어오도록 위쪽을 기준으로 잘라냅니다.
#   이름 : (원본번호, 가로/세로, 가로폭, 왼쪽 시작 비율, 쓸 가로 비율, 위 시작 비율)
FROM_ORIGINAL = {
    "ramen.jpg":  ("MH_07754", 4 / 3, 900, 0.00, 1.00, 0.22),  # 한강라면 IoT 라면자판기
    "coffee.jpg": ("MH_07751", 4 / 3, 900, 0.00, 1.00, 0.02),  # 스타벅스 캡슐 커피 자판기
}


def fit_on_background(im: Image.Image, ratio: float, width: int,
                      margin: float = 0.07) -> Image.Image:
    """단색 배경 위에 음식이 놓인 사진을 자르지 않고 정해진 비율로 맞춥니다.

    원본이 정사각(1254x1254)인데 화면은 4:3 이라, 그냥 잘라내면
    위아래가 잘리고 음식이 한쪽으로 치우칩니다. 스튜디오 사진은 배경이
    한 가지 색이라 모자란 쪽을 그 색으로 채우면 이어 붙인 티가 나지
    않습니다. 그래서 자르는 대신 채워서 음식을 온전히 가운데에 둡니다.
    """
    im = im.convert("RGB")
    W, H = im.size

    # 이미 원하는 비율로 찍혀 온 사진은 손대지 않습니다. 사진가가 잡은
    # 여백이 곧 구도라, 다시 재보고 가운데로 옮기면 오히려 답답해집니다.
    if abs(W / H - ratio) < 0.02:
        return im.resize((width, round(width / ratio)), Image.LANCZOS)

    # ① 네 귀퉁이에서 배경색을 읽습니다
    s = im.resize((240, max(1, round(240 * H / W))))
    px = s.load(); sw, sh = s.size
    cor = [px[1, 1], px[sw - 2, 1], px[1, sh - 2], px[sw - 2, sh - 2]]
    bg = tuple(sum(c[i] for c in cor) // 4 for i in range(3))

    # ② 배경과 다른 화소 = 음식. 그 범위를 찾습니다
    #
    # 줄 단위로 셉니다. 그릇 밑에서 옆으로 길게 늘어진 그림자는 배경과
    # 색이 달라 음식으로 잡히는데, 두께가 얇아 그 세로줄에는 몇 점밖에
    # 없습니다. 반대로 음식이 걸친 줄에는 화소가 두툼하게 쌓입니다.
    # 그래서 「몇 점 안 되는 줄」은 음식이 아니라고 보고 넘깁니다.
    # (이 걸러내기가 없으면 그림자까지 한 덩어리로 보고 가운데를 잡아
    #  음식이 반대쪽으로 밀려납니다 — 상하목장 아이스크림이 그랬습니다)
    col = [0] * sw
    row = [0] * sh
    for y in range(sh):
        for x in range(sw):
            r, g, b = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > 78:
                col[x] += 1; row[y] += 1
    xi = [x for x in range(sw) if col[x] >= max(2, sh * 0.03)]
    yi = [y for y in range(sh) if row[y] >= max(2, sw * 0.03)]
    if xi and yi:
        x0, x1 = xi[0] / sw * W, xi[-1] / sw * W
        y0, y1 = yi[0] / sh * H, yi[-1] / sh * H
    else:
        x0, y0, x1, y1 = 0, 0, W, H

    cw, ch = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

    # ③ 음식이 여백을 두고 다 들어가는 판을 잡습니다
    bw = max(cw * (1 + margin * 2), ch * (1 + margin * 2) * ratio)
    bh = bw / ratio

    def place(board, size, center):
        """원본을 판 위 어디에 놓을지 정합니다."""
        # 판이 원본보다 넓다 = 여백을 덧대는 쪽입니다. 이때는 원본을 한가운데
        # 둡니다. 사진가가 잡아둔 좌우 여백이 곧 구도이고, 굳이 음식 기준으로
        # 다시 맞추면 그릇 밑에 깔린 그림자까지 음식으로 세어 반대쪽으로
        # 밀려납니다 (상하목장 아이스크림이 그랬습니다).
        if board >= size:
            return (board - size) / 2
        # 판이 좁다 = 잘라내는 쪽입니다. 음식이 잘리지 않게 음식 가운데에
        # 맞추되, 판이 원본 밖으로 나가 빈 곳이 생기지 않도록 붙잡아 둡니다.
        return min(0, max(board - size, board / 2 - center))

    out = Image.new("RGB", (round(bw), round(bh)), bg)
    out.paste(im, (round(place(bw, W, cx)), round(place(bh, H, cy))))
    return out.resize((width, round(width / ratio)), Image.LANCZOS)


def main() -> None:
    dry = "--dry-run" in sys.argv
    total = 0
    missing = []

    for name, entry in MAP.items():
        # (폴더, 파일명) 또는 (폴더, 파일명, 시계방향 회전각)
        folder, stem = entry[0], entry[1]
        rotate = entry[2] if len(entry) > 2 else 0
        # 받은 파일이 png 일 때도 jpg 일 때도 있어 둘 다 찾아봅니다
        src = next((SRC / folder / f"{stem}{e}" for e in (".png", ".jpg", ".jpeg")
                    if (SRC / folder / f"{stem}{e}").exists()), SRC / folder / f"{stem}.png")
        if not src.exists():
            missing.append(f"{folder}/{stem}.png ({name})")
            continue

        with Image.open(src) as im:
            # 시계 방향으로 돌립니다 (Pillow 는 반시계 기준이라 부호를 뒤집습니다)
            src_im = im.rotate(-rotate, expand=True) if rotate else im
            out = fit_on_background(src_im, RATIO, WIDTH)
        z = ZOOM.get(name)
        if z:
            w, h = out.size
            cw, ch = round(w * z), round(h * z)
            out = out.crop(((w - cw) // 2, (h - ch) // 2,
                            (w - cw) // 2 + cw, (h - ch) // 2 + ch))
            out = out.resize((WIDTH, round(WIDTH / RATIO)), Image.LANCZOS)

        buf = io.BytesIO()
        out.save(buf, "JPEG", quality=QUALITY, optimize=True,
                 progressive=True, subsampling="4:2:0")
        total += buf.tell()
        print(f"  {name:14} ← {folder}/{src.name}  "
              f"{src.stat().st_size//1024}KB → {buf.tell()//1024}KB")
        if not dry:
            (FOOD / name).write_bytes(buf.getvalue())

    # 촬영 원본에서 바로 뽑는 것들
    from pathlib import Path as _P
    orig = _P.home() / "Desktop" / "king-원본사진"
    for name, (stem, ratio, width, x0f, wf, y0f) in FROM_ORIGINAL.items():
        src = orig / f"{stem}.jpg"
        if not src.exists():
            missing.append(f"{stem}.jpg ({name}) — 촬영 원본")
            continue
        with Image.open(src) as im:
            im.draft("RGB", (width * 4, width * 4))
            im = im.convert("RGB")
            w0, h0 = im.size
            cw = min(w0, round(w0 * wf))
            ch = min(h0, round(cw / ratio))
            cw = round(ch * ratio)
            x0 = max(0, min(round(w0 * x0f), w0 - cw))
            y0 = max(0, min(round(h0 * y0f), h0 - ch))
            out = im.crop((x0, y0, x0 + cw, y0 + ch))
            out = out.resize((width, round(width / ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        out.save(buf, "JPEG", quality=QUALITY, optimize=True,
                 progressive=True, subsampling="4:2:0")
        total += buf.tell()
        print(f"  {name:14} ← {stem}.jpg (촬영 원본)  → {buf.tell()//1024}KB")
        if not dry:
            (FOOD / name).write_bytes(buf.getvalue())

    if missing:
        print("\n⚠️  원본을 찾지 못했습니다:")
        for m in missing:
            print("   ", m)

    print(f"\n{len(MAP) - len(missing)}장 · 합계 {total/1048576:.1f}MB"
          + ("  (--dry-run 이라 실제로는 안 만들었습니다)" if dry else ""))


if __name__ == "__main__":
    main()
