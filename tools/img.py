#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10.0", "numpy>=1.26"]
# ///
"""
제천킹스파 사이트 이미지 도구
=============================

사진을 받을 때마다 이 스크립트로 처리하면 됩니다.
uv 가 알아서 필요한 프로그램(pillow, numpy)을 받아오므로 따로 설치할 게 없습니다.

    uv run tools/img.py <명령> [옵션]

명령
----
  cutout   흰 배경을 투명하게 (로고·캐릭터처럼 흰 바탕에 그려진 그림)
  chars    캐릭터 여러 장의 크기와 바닥선을 맞춤
  web      사진을 웹용으로 줄이고 JPEG 로 변환
  crop     사진을 정해진 비율(대문 16:9 등)로 미리 잘라냄
  logo     로고 한 장에서 마크·파비콘·링크 미리보기 이미지를 뽑음

예시
----
  uv run tools/img.py cutout 새캐릭터.png assets/img/char-new.png
  uv run tools/img.py chars _original-photos/*.png -o assets/img
  uv run tools/img.py web ~/사진/*.jpg -o assets/img/food --max 1400
  uv run tools/img.py crop 원본.jpg --ratio 2:1 --width 1800 --y .58 --name waterplay
  uv run tools/img.py logo 제천킹스파_로고.jpg -o assets/img
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# 캐릭터 본체로 인정할 최소 불투명도.
# 원본에 알파 119 짜리 옅은 테두리가 섞여 있어 그보다 높게 잡는다.
SOLID = 130


# ──────────────────────────────────────────────────────────
# 누끼
# ──────────────────────────────────────────────────────────
def cutout(path: Path, tol: int = 46, feather: float = 0.9, crop: bool = True) -> Image.Image:
    """흰 배경만 지우고 그림은 남긴다.

    1) 가장자리에서 안쪽으로 번져 들어가며 '바깥 배경'만 찾는다.
       캐릭터 안쪽 흰색(얼굴·양말)은 테두리에 막혀 살아남는다.
    2) 경계를 살짝 흐려 계단현상을 없앤다.
    3) 반투명 경계에 섞인 흰색을 걷어낸다. 이걸 안 하면 흰 테두리가 남는다.
    """
    im = Image.open(path).convert("RGB")
    w, h = im.size

    tmp = im.copy()
    MARK = (255, 0, 255)
    step = max(1, min(w, h) // 40)
    seeds = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)]
    seeds += [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]

    # 씨앗은 '흰색인 자리'에만 뿌린다.
    # 그림이 캔버스 끝에 닿아 있으면(예: 갈래머리가 오른쪽 끝까지 그려진 경우)
    # 그 위에 씨앗이 떨어져 그림을 통째로 지워버린다.
    px = im.load()
    for s in seeds:
        r, g, b = px[s]
        if min(r, g, b) < 235:
            continue
        try:
            ImageDraw.floodfill(tmp, s, MARK, thresh=tol)
        except Exception:
            pass

    bg = np.all(np.asarray(tmp) == np.array(MARK, dtype=np.uint8), axis=-1)

    a0 = np.where(bg, 0, 255).astype(np.uint8)
    alpha = (
        np.asarray(Image.fromarray(a0, "L").filter(ImageFilter.GaussianBlur(feather)), dtype=np.float32)
        / 255.0
    )

    # 관측색 = 진짜색 × 알파 + 흰색 × (1 - 알파)  →  진짜색을 되돌린다
    rgb = np.asarray(im, dtype=np.float32)
    a3 = alpha[..., None]
    restored = np.clip((rgb - (1.0 - a3) * 255.0) / np.clip(a3, 0.25, 1.0), 0, 255)
    rgb = np.where(a3 > 0.02, restored, rgb)

    out = Image.fromarray(
        np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)]), "RGBA"
    )
    if not crop:
        return out
    box = solid_bbox(out)
    return out.crop(box) if box else out


def solid_bbox(img: Image.Image) -> tuple[int, int, int, int] | None:
    """또렷한 부분만으로 테두리 상자를 구한다 (옅은 잔여물 무시)."""
    a = np.asarray(img)[..., 3] >= SOLID
    ys, xs = np.where(a)
    if len(ys) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def head_width(img: Image.Image) -> int:
    """위쪽 35% 구간의 최대 가로폭 = 머리(수건 포함) 크기.
    포즈가 달라도 이 값을 맞추면 같은 크기로 보인다."""
    a = np.asarray(img)[..., 3] > 60
    ys, _ = np.where(a)
    if len(ys) == 0:
        return 0
    top, bot = ys.min(), ys.max()
    rows = a[top : top + max(1, int((bot - top) * 0.35))]
    widths = [np.where(r)[0].max() - np.where(r)[0].min() for r in rows if r.any()]
    return int(max(widths)) if widths else 0


# ──────────────────────────────────────────────────────────
# 명령들
# ──────────────────────────────────────────────────────────
def cmd_cutout(args) -> None:
    src = Path(args.src)
    dst = Path(args.dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = cutout(src, tol=args.tol, crop=not args.no_crop)
    img.save(dst, optimize=True)
    print(f"{src.name} → {dst}  {img.size[0]}×{img.size[1]}")


def cmd_chars(args) -> None:
    """캐릭터 여러 장을 같은 크기·같은 바닥선으로 맞춘다.

    · 머리 크기를 기준으로 배율을 정하므로 앉은 포즈와 선 포즈가 섞여도 어울린다.
    · 발끝을 캔버스 아래에 붙여서, CSS 에서 높이만 주면 한 줄로 선다.
    """
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)

    scaled: dict[str, Image.Image] = {}
    for p in [Path(x) for x in args.src]:
        im = cutout(p, tol=args.tol, crop=False)
        box = solid_bbox(im)
        if box is None:
            print(f"  건너뜀 (내용 없음): {p.name}")
            continue
        im = im.crop(box)
        hw = head_width(im)
        if hw == 0:
            print(f"  건너뜀 (머리 못 찾음): {p.name}")
            continue
        k = args.head / hw
        scaled[p.stem] = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)

    if not scaled:
        sys.exit("처리할 이미지가 없습니다.")

    W = max(i.width for i in scaled.values())
    H = max(i.height for i in scaled.values())
    print(f"공통 캔버스 {W}×{H}  (머리폭 기준 {args.head}px)\n")

    for name, im in sorted(scaled.items()):
        canvas = Image.new("RGBA", (W, H), (255, 255, 255, 0))
        canvas.paste(im, ((W - im.width) // 2, H - im.height), im)  # 가로 가운데 · 바닥 맞춤
        out = outdir / f"{name}.png"
        canvas.save(out, optimize=True)
        print(f"  {out.name:<28} 머리폭 {head_width(canvas):3d}px")


def cmd_web(args) -> None:
    """사진을 웹용으로 줄인다. 원본은 건드리지 않는다."""
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)
    total_before = total_after = 0

    for p in [Path(x) for x in args.src]:
        im = Image.open(p)
        if im.mode in ("RGBA", "P", "LA"):
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im.convert("RGBA"), mask=im.convert("RGBA").split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        im.thumbnail((args.max, args.max), Image.LANCZOS)

        out = outdir / f"{p.stem}.jpg"
        im.save(out, quality=args.quality, optimize=True, progressive=True)

        before, after = p.stat().st_size, out.stat().st_size
        total_before += before
        total_after += after
        print(f"  {p.name:<30} {before/1024:6.0f}KB → {after/1024:5.0f}KB  {im.size[0]}×{im.size[1]}")

    if total_before:
        print(f"\n합계 {total_before/1024/1024:.1f}MB → {total_after/1024/1024:.1f}MB "
              f"({100 - total_after/total_before*100:.0f}% 감소)")


def cmd_crop(args) -> None:
    """사진을 정해진 비율로 미리 잘라서 저장한다.

    브라우저에서 object-fit 으로 자르면 화면 크기마다 잘리는 곳이 달라진다.
    대문 사진처럼 '무엇이 보여야 하는지' 가 분명한 사진은 여기서 잘라 둔다.
    """
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)
    rw, rh = (float(x) for x in args.ratio.split(":"))
    ratio = rw / rh

    for p in [Path(x) for x in args.src]:
        im = Image.open(p).convert("RGB")
        w, h = im.size
        if w / h > ratio:                     # 원본이 더 넓다 → 좌우를 자른다
            nw, nh = round(h * ratio), h
        else:                                 # 원본이 더 높다 → 위아래를 자른다
            nw, nh = w, round(w / ratio)
        im = im.crop((
            round((w - nw) * args.x), round((h - nh) * args.y),
            round((w - nw) * args.x) + nw, round((h - nh) * args.y) + nh,
        ))
        im = im.resize((args.width, round(args.width / ratio)), Image.LANCZOS)

        out = outdir / f"{args.name or p.stem}.jpg"
        im.save(out, quality=args.quality, optimize=True, progressive=True)
        print(f"  {out.name:<26} {im.size[0]}×{im.size[1]}  {out.stat().st_size/1024:5.0f}KB   ← {p.name}")


def cmd_logo(args) -> None:
    """로고 한 장에서 사이트에 필요한 이미지들을 뽑는다."""
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)

    logo = cutout(Path(args.src), tol=args.tol)
    logo.resize((900, round(900 * logo.height / logo.width)), Image.LANCZOS).save(
        outdir / "logo.png", optimize=True)

    # 글자를 뺀 그림 부분만 = 헤더·푸터에 쓰는 마크
    mark = logo.crop((0, 0, logo.width, int(logo.height * args.mark_ratio)))
    box = solid_bbox(mark)
    if box:
        mark = mark.crop(box)
    mark.thumbnail((640, 640), Image.LANCZOS)
    mark.save(outdir / "mark.png", optimize=True)

    fav = mark.copy()
    fav.thumbnail((180, 180), Image.LANCZOS)
    canvas = Image.new("RGBA", (180, 180), (255, 255, 255, 0))
    canvas.paste(fav, ((180 - fav.width) // 2, (180 - fav.height) // 2), fav)
    canvas.save(outdir / "favicon.png", optimize=True)

    og = Image.new("RGB", (1200, 630), "#ffffff")
    ImageDraw.Draw(og).rectangle([0, 0, 1200, 10], fill=args.brand)
    big = Image.open(outdir / "logo.png")
    big.thumbnail((520, 520), Image.LANCZOS)
    og.paste(big, ((1200 - big.width) // 2, (630 - big.height) // 2 + 10), big)
    og.save(outdir / "og-image.jpg", quality=88, optimize=True)

    for f in ("logo.png", "mark.png", "favicon.png", "og-image.jpg"):
        p = outdir / f
        print(f"  {f:<16} {Image.open(p).size[0]}×{Image.open(p).size[1]}  {p.stat().st_size/1024:.0f}KB")


# ──────────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(
        description="제천킹스파 사이트 이미지 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("cutout", help="흰 배경을 투명하게")
    p.add_argument("src"); p.add_argument("dst")
    p.add_argument("--tol", type=int, default=46, help="배경으로 볼 색의 허용 범위 (기본 46)")
    p.add_argument("--no-crop", action="store_true", help="여백을 자르지 않고 원본 크기 유지")
    p.set_defaults(func=cmd_cutout)

    p = sub.add_parser("chars", help="캐릭터 크기·바닥선 맞추기")
    p.add_argument("src", nargs="+")
    p.add_argument("-o", "--out", default="assets/img")
    p.add_argument("--head", type=int, default=197, help="맞출 머리 가로폭 (기본 197)")
    p.add_argument("--tol", type=int, default=46)
    p.set_defaults(func=cmd_chars)

    p = sub.add_parser("web", help="사진 웹용으로 줄이기")
    p.add_argument("src", nargs="+")
    p.add_argument("-o", "--out", default="assets/img")
    p.add_argument("--max", type=int, default=1400, help="긴 변 최대 픽셀 (기본 1400)")
    p.add_argument("--quality", type=int, default=78, help="JPEG 품질 (기본 78)")
    p.set_defaults(func=cmd_web)

    p = sub.add_parser("crop", help="사진을 정해진 비율로 잘라내기")
    p.add_argument("src", nargs="+")
    p.add_argument("-o", "--out", default="assets/img")
    p.add_argument("--ratio", default="16:9", help="가로:세로 (기본 16:9)")
    p.add_argument("--width", type=int, default=1600, help="가로 픽셀 (기본 1600)")
    p.add_argument("--name", help="저장할 이름 (사진 한 장일 때만)")
    p.add_argument("--x", type=float, default=0.5, help="좌우 기준점 0~1 (기본 0.5=가운데)")
    p.add_argument("--y", type=float, default=0.5, help="위아래 기준점 0~1 (기본 0.5=가운데)")
    p.add_argument("--quality", type=int, default=82, help="JPEG 품질 (기본 82)")
    p.set_defaults(func=cmd_crop)

    p = sub.add_parser("logo", help="로고에서 마크·파비콘·미리보기 뽑기")
    p.add_argument("src")
    p.add_argument("-o", "--out", default="assets/img")
    p.add_argument("--tol", type=int, default=46)
    p.add_argument("--mark-ratio", type=float, default=0.74, help="위에서 몇 %까지가 그림인지 (기본 0.74)")
    p.add_argument("--brand", default="#e96113")
    p.set_defaults(func=cmd_logo)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
