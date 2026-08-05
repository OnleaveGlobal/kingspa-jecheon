#!/usr/bin/env python3
"""
사진을 화면에 필요한 크기로 줄이고 다시 저장합니다.

왜 필요한가
  사진 파일이 화면에 보이는 크기보다 훨씬 컸습니다.
  (예: salt-room.jpg 는 1400px 짜리인데 화면에는 332px 로만 나옵니다)
  그만큼을 폰이 통신으로 다 받아야 해서 첫 화면이 늦게 떴습니다.

쓰는 법
  python3 tools/optimize_images.py           # 실제로 줄입니다
  python3 tools/optimize_images.py --dry-run # 얼마나 줄어드는지만 봅니다

원본은 Desktop/king-assets-backup-<날짜>/ 에 있습니다.
사진을 새로 넣은 뒤에도 이 파일을 한 번 돌려 주세요.
"""
import io
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"

# 폴더별 가로 최대 길이 — 화면에 나오는 크기의 2배(고해상도 화면 대비)로 잡았습니다
RULES = [
    ("360",     2400),   # 파노라마는 돌려 보므로 크게 둡니다
    ("nearby",  1100),   # 관광지 — 크게 보기 창이 최대 1000px
    ("food",     900),   # 메뉴 사진 — 한 칸 최대 약 430px
    ("hall",    1400),   # 식당 전경 — 가로 전체를 씁니다
]
DEFAULT_MAX = 1600       # 대문 사진 등 가로를 다 쓰는 사진
FACILITY_MAX = 900       # 시설 카드 — 한 칸 최대 약 300px
FACILITY = {
    "salt-room", "hinoki", "hwangto", "ice-room", "capsule", "gym",
    "kids", "arcade", "bath", "bulgama", "herb-bath", "trampoline",
    "waterplay-air", "waterplay-tramp", "waterplay-slide", "waterplay-shade",
    "about", "front",
}
QUALITY = 80


def max_width_for(p: Path) -> int:
    rel = p.relative_to(IMG)
    if len(rel.parts) > 1:
        for folder, w in RULES:
            if rel.parts[0] == folder:
                return w
    if p.stem in FACILITY:
        return FACILITY_MAX
    return DEFAULT_MAX


def main() -> None:
    dry = "--dry-run" in sys.argv
    before = after = 0
    changed = 0

    for p in sorted(IMG.rglob("*")):
        if p.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        size0 = p.stat().st_size
        before += size0

        with Image.open(p) as im:
            im = ImageOps.exif_transpose(im)   # 회전 정보를 화소에 반영하고 지웁니다
            limit = max_width_for(p)
            w, h = im.size
            if w > limit:
                im = im.resize((limit, round(h * limit / w)), Image.LANCZOS)

            if p.suffix.lower() == ".png":
                # 캐릭터·로고 — 투명도가 있으므로 PNG 그대로, 색만 줄입니다
                src = im if im.mode == "RGBA" else im.convert("RGBA")
                out = src.quantize(colors=256, method=Image.FASTOCTREE)
                fmt, opts = "PNG", dict(optimize=True)
            else:
                out = im.convert("RGB")
                fmt = "JPEG"
                opts = dict(quality=QUALITY, optimize=True,
                            progressive=True, subsampling="4:2:0")

            # 결과를 먼저 메모리에 만들어 보고, 작아질 때만 덮어씁니다.
            # 이미 잘 압축된 사진을 다시 저장하면 용량은 그대로인데 화질만 깎입니다
            buf = io.BytesIO()
            out.save(buf, fmt, **opts)
            size1 = buf.tell()
            newsize = im.size[0]

        # 눈에 띄게 줄 때만 손댑니다. 몇 KB 벌자고 다시 저장하면
        # 화질만 깎이고, 이 파일을 두 번 돌렸을 때 또 깎입니다
        if size1 < size0 * 0.9 and size0 - size1 > 4096:
            after += size1
            changed += 1
            print(f"  {p.relative_to(ROOT)}  {w}px {size0//1024}KB"
                  f" → {newsize}px {size1//1024}KB")
            if not dry:
                p.write_bytes(buf.getvalue())
        else:
            after += size0   # 그대로 둡니다

    print(f"\n{changed}개 파일 손봄 · {before/1048576:.1f}MB → {after/1048576:.1f}MB"
          + ("  (--dry-run 이라 실제로는 안 바꿨습니다)" if dry else ""))


if __name__ == "__main__":
    main()
