#!/usr/bin/env python3
"""
촬영 원본(약 7000px)에서 사이트용 사진을 다시 뽑습니다.

왜 필요한가
  사이트에 올라가 있던 사진은 원본을 1400~1920px 로 줄인 파일이었습니다.
  촬영 원본 199장이 그대로 남아 있어서, 거기서 필요한 비율로
  다시 잘라내면 훨씬 선명합니다.

원본 사진은 어디에 있나
  /Users/leeyoonsu/Desktop/king-원본사진/   (약 1.5GB, 199장)
  원래는 king/__pycache__/ 안에 있었는데, 그 폴더는 파이썬이 만들고
  지우는 캐시라 청소 한 번에 사라질 수 있어 밖으로 옮겼습니다.

쓰는 법
  python3 tools/rebuild_photos.py            # 실제로 만듭니다
  python3 tools/rebuild_photos.py --dry-run  # 무엇이 바뀌는지만 봅니다

사진을 바꾸고 싶으면 MAP 의 원본 번호(MH_xxxxx)만 갈아 끼우세요.
  · pos 는 세로 어디를 남길지입니다. 0=위쪽  0.5=가운데  1=아래쪽
"""
import io
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
QUALITY = 82

# 촬영 원본 199장이 들어 있는 폴더.
# 위에서부터 차례로 찾아보고 먼저 있는 곳을 씁니다.
# 원본을 다른 데로 옮기셨으면 맨 앞에 그 경로를 한 줄 추가하세요.
SRC_CANDIDATES = [
    Path.home() / "Desktop" / "king-원본사진",
    ROOT.parent / "king-원본사진",
    ROOT / "_original-photos" / "촬영본",
    # 예전 자리 — __pycache__ 는 파이썬이 지울 수 있는 폴더라 여기서 옮겨 왔습니다
    ROOT / "__pycache__" / "제천 킹스파 관련 사진 종합",
]
SRC = next((p for p in SRC_CANDIDATES if p.is_dir()), SRC_CANDIDATES[0])

# 보정본 폴더 — 여기에 같은 번호(MH_xxxxx.jpg)로 넣어 두면 촬영 원본보다 먼저 씁니다.
# 촬영 원본을 손봤는데(사람·물건 지우기, 색보정 등) 다시 만들 수 없는 작업은
# 여기에 넣어야 이 스크립트를 다시 돌려도 보정 결과가 유지됩니다.
RETOUCHED = ROOT / "_retouched"


def source_for(stem: str) -> Path:
    """보정본이 있으면 그것을, 없으면 촬영 원본을 씁니다."""
    fixed = RETOUCHED / f"{stem}.jpg"
    return fixed if fixed.exists() else SRC / f"{stem}.jpg"

# 대상파일 : (원본, 가로/세로 비율, 출력 가로폭, 세로 크롭 위치)
MAP = {
    # ── 대문 슬라이드 (16:9) ─────────────────────────────
    "hero-1.jpg":    ("MH_06986", 16 / 9, 1600, .55),  # 건물 외관
    "hero-2.jpg":    ("MH_06637", 16 / 9, 1600, .50),  # 야외 노천탕
    "hero-3.jpg":    ("MH_03573", 16 / 9, 1600, .50),  # 대욕장 냉탕
    "hero-4.jpg":    ("MH_06454", 16 / 9, 1600, .50),  # 옥상 물놀이
    "hero-5.jpg":    ("MH_07019", 16 / 9, 1600, .50),  # 수면 릴렉스존
    "hero-6.jpg":    ("MH_07202", 16 / 9, 1600, .50),  # 전통 불가마
    "hero-7.jpg":    ("MH_07150", 16 / 9, 1600, .43),  # 헬스장

    # ── 시설안내 띠 ────────────────────────────────────
    # 띠는 화면 폭에 따라 가로로 아주 납작해집니다(데스크톱 약 4.5:1, 모바일 1.5:1).
    # 16:9 처럼 넉넉한 사진을 넣으면 데스크톱에서 가운데 가로줄만 보여 욕조가 잘렸습니다.
    # 그래서 천장을 빼고 욕조가 프레임을 채우도록 2.6:1 로 납작하게 잘라 둡니다.
    # pos=1.0 은 "아래쪽 기준" — 위쪽(돔 천장)을 잘라낸다는 뜻입니다.
    "bath.jpg":      ("MH_03530", 2.6, 1600, 1.0),     # 대욕장 (돔 천장 아래 이벤트탕)

    # ── 시설 카드 (5:4) ─────────────────────────────────
    "salt-room.jpg": ("MH_03335", 5 / 4, 900, .50),
    "hinoki.jpg":    ("MH_07117", 5 / 4, 900, .50),
    "hwangto.jpg":   ("MH_03322", 5 / 4, 900, .30),
    "ice-room.jpg":  ("MH_03355", 5 / 4, 900, .35),
    "capsule.jpg":   ("MH_07029", 5 / 4, 900, .50),
    "gym.jpg":       ("MH_07157", 5 / 4, 900, .50),
    "kids.jpg":      ("MH_07172", 5 / 4, 900, .50),
    "arcade.jpg":    ("MH_07038", 5 / 4, 900, .50),

    # ── 식당 전경 (16:9) ───────────────────────────────
    # 세로 사진이라 위아래를 크게 잘라냅니다.
    # pos .62 = 피자와 손이 다 들어오고 빈 조리대는 최소로 남는 자리
    "hall/rest-2.jpg": ("MH_07415", 16 / 9, 1400, .62),

    # ── 옥상 물놀이 ────────────────────────────────────
    "waterplay.jpg":       ("MH_06456", 5 / 2, 1600, .55),  # 대표 사진
    "waterplay-air.jpg":   ("MH_06445", 5 / 4,  900, .50),
    "waterplay-tramp.jpg": ("MH_06483", 5 / 4,  900, .50),
    "waterplay-slide.jpg": ("MH_06460", 5 / 4,  900, .50),
    "waterplay-shade.jpg": ("MH_06443", 5 / 4,  900, .50),

    # ── 수면방 ─────────────────────────────────────────
    "sleep.jpg":   ("MH_07550", 5 / 2, 1600, .55),  # 대표 사진 — 방 전체
    "sleep-1.jpg": ("MH_07569", 5 / 4,  900, .50),  # 침상 한 칸
    "sleep-2.jpg": ("MH_07568", 5 / 4,  900, .50),  # 남 · 여 구분 표시
    "sleep-3.jpg": ("MH_07575", 5 / 4,  900, .50),  # 침상 안쪽 (목침)
    "sleep-4.jpg": ("MH_07567", 5 / 4,  900, .50),  # 침상 사이 통로
}


def render(src: Path, ratio: float, width: int, pos: float) -> Image.Image:
    im = Image.open(src)
    im.draft("RGB", (width * 3, width * 3))   # 큰 원본을 빠르게 읽기 위한 힌트
    im = im.convert("RGB")
    w, h = im.size
    if w / h > ratio:                          # 원본이 더 넓다 → 좌우를 자른다
        nw, nh = round(h * ratio), h
    else:                                      # 원본이 더 높다 → 위아래를 자른다
        nw, nh = w, round(w / ratio)
    x = (w - nw) // 2
    y = int((h - nh) * pos)
    return im.crop((x, y, x + nw, y + nh)).resize(
        (width, round(width / ratio)), Image.LANCZOS)


def main() -> None:
    dry = "--dry-run" in sys.argv
    if not SRC.is_dir():
        sys.exit("원본 사진 폴더를 찾을 수 없습니다. 아래를 찾아봤습니다:\n  "
                 + "\n  ".join(str(p) for p in SRC_CANDIDATES)
                 + "\n폴더를 옮기셨으면 이 파일 위쪽 SRC_CANDIDATES 맨 앞에 그 경로를 넣어 주세요.")
    print(f"원본 폴더: {SRC}\n")

    total0 = total1 = 0
    for name, (stem, ratio, width, pos) in MAP.items():
        src = source_for(stem)
        dst = IMG / name
        if not src.exists():
            print(f"  ⚠️  원본 없음 → 건너뜀: {stem}.jpg ({name})")
            continue
        mark = " [보정본]" if src.parent == RETOUCHED else ""

        out = render(src, ratio, width, pos)
        buf = io.BytesIO()
        out.save(buf, "JPEG", quality=QUALITY, optimize=True,
                 progressive=True, subsampling="4:2:0")

        old = dst.stat().st_size if dst.exists() else 0
        total0 += old
        total1 += buf.tell()
        with Image.open(src) as o:
            osize = o.size
        print(f"  {name:22} ← {stem}{mark}  {osize[0]}x{osize[1]}"
              f" → {out.size[0]}x{out.size[1]}  {old//1024}KB→{buf.tell()//1024}KB")
        if not dry:
            dst.write_bytes(buf.getvalue())

    print(f"\n{len(MAP)}장 · {total0/1048576:.1f}MB → {total1/1048576:.1f}MB"
          + ("  (--dry-run 이라 실제로는 안 바꿨습니다)" if dry else ""))


if __name__ == "__main__":
    main()
