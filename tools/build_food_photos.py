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
    "kimchi.jpg":   ("식사준비", "kimchi-jjigae"),
    "kimchi-2.jpg": ("식사준비", "kimchi-jjigae-2"),
    "nakji.jpg":    ("식사준비", "nakji"),
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

# 배경 교체본이 없어 촬영 원본에서 바로 뽑은 사진.
# 자판기가 프레임을 채우도록 좌우를 잘라 씁니다.
#   이름 : (원본번호, 가로/세로, 가로폭, 좌측 시작 비율, 사용할 폭 비율)
FROM_ORIGINAL = {
    "ramen.jpg":  ("MH_07167", 4 / 3, 900, 0.02, 0.62),   # 한강라면 IoT 라면자판기
    "coffee.jpg": ("MH_07163", 4 / 3, 900, 0.10, 0.55),   # 스타벅스 캡슐 커피 자판기
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

    # ① 네 귀퉁이에서 배경색을 읽습니다
    s = im.resize((240, max(1, round(240 * H / W))))
    px = s.load(); sw, sh = s.size
    cor = [px[1, 1], px[sw - 2, 1], px[1, sh - 2], px[sw - 2, sh - 2]]
    bg = tuple(sum(c[i] for c in cor) // 4 for i in range(3))

    # ② 배경과 다른 화소 = 음식. 그 범위를 찾습니다
    xs, ys = [], []
    for y in range(sh):
        for x in range(sw):
            r, g, b = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > 78:
                xs.append(x); ys.append(y)
    if xs:
        xs.sort(); ys.sort()
        cut = max(1, len(xs) // 50)          # 튀는 점 몇 개는 무시합니다
        x0, x1 = xs[cut] / sw * W, xs[-cut] / sw * W
        y0, y1 = ys[cut] / sh * H, ys[-cut] / sh * H
    else:
        x0, y0, x1, y1 = 0, 0, W, H

    cw, ch = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

    # ③ 음식이 여백을 두고 다 들어가는 판을 잡고 가운데에 붙입니다
    bw = max(cw * (1 + margin * 2), ch * (1 + margin * 2) * ratio)
    bh = bw / ratio
    out = Image.new("RGB", (round(bw), round(bh)), bg)
    out.paste(im, (round(bw / 2 - cx), round(bh / 2 - cy)))
    return out.resize((width, round(width / ratio)), Image.LANCZOS)


def main() -> None:
    dry = "--dry-run" in sys.argv
    total = 0
    missing = []

    for name, (folder, stem) in MAP.items():
        # 받은 파일이 png 일 때도 jpg 일 때도 있어 둘 다 찾아봅니다
        src = next((SRC / folder / f"{stem}{e}" for e in (".png", ".jpg", ".jpeg")
                    if (SRC / folder / f"{stem}{e}").exists()), SRC / folder / f"{stem}.png")
        if not src.exists():
            missing.append(f"{folder}/{stem}.png ({name})")
            continue

        with Image.open(src) as im:
            out = fit_on_background(im, RATIO, WIDTH)

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
    for name, (stem, ratio, width, x0f, wf) in FROM_ORIGINAL.items():
        src = orig / f"{stem}.jpg"
        if not src.exists():
            missing.append(f"{stem}.jpg ({name}) — 촬영 원본")
            continue
        with Image.open(src) as im:
            im.draft("RGB", (width * 4, width * 4))
            im = im.convert("RGB")
            w0, h0 = im.size
            sub = im.crop((int(w0 * x0f), 0, int(w0 * x0f) + int(w0 * wf), h0))
            sw, sh = sub.size
            if sw / sh > ratio:
                nw, nh = round(sh * ratio), sh
            else:
                nw, nh = sw, round(sw / ratio)
            out = sub.crop(((sw - nw) // 2, (sh - nh) // 2,
                            (sw - nw) // 2 + nw, (sh - nh) // 2 + nh))
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
