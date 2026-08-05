"""흰 배경 이미지에서 배경만 깔끔하게 제거합니다.
   1) 가장자리에서 번져 들어가며 '바깥 배경'만 찾음 (캐릭터 안쪽 흰색은 보존)
   2) 경계를 부드럽게 (계단현상 제거)
   3) 반투명 경계 픽셀에 섞여 있는 흰색 성분을 걷어냄 (흰 테두리 제거)
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, sys, os

def cutout(path, tol=46, feather=0.9, crop=True):
    im = Image.open(path).convert('RGB')
    w, h = im.size

    # 1) 배경 영역 찾기 — 테두리 전체를 촘촘히 seed 로
    tmp = im.copy()
    M = (255, 0, 255)
    step = max(1, min(w, h) // 40)
    seeds = []
    for x in range(0, w, step): seeds += [(x, 0), (x, h - 1)]
    for y in range(0, h, step): seeds += [(0, y), (w - 1, y)]
    for s in seeds:
        try: ImageDraw.floodfill(tmp, s, M, thresh=tol)
        except Exception: pass

    bg = np.all(np.array(tmp) == np.array(M, dtype=np.uint8), axis=-1)

    # 2) 알파: 배경 0 / 나머지 255 → 살짝 흐리게 해서 경계를 매끄럽게
    a0 = np.where(bg, 0, 255).astype(np.uint8)
    a = np.asarray(
        Image.fromarray(a0, 'L').filter(ImageFilter.GaussianBlur(feather)),
        dtype=np.float32) / 255.0

    # 3) 흰 성분 제거 — 관측색 = a*진짜색 + (1-a)*흰색  →  진짜색 복원
    rgb = np.asarray(im, dtype=np.float32)
    a3 = a[..., None]
    unmul = np.clip((rgb - (1.0 - a3) * 255.0) / np.clip(a3, 0.25, 1.0), 0, 255)
    rgb = np.where(a3 > 0.02, unmul, rgb)

    out = np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)])
    img = Image.fromarray(out, 'RGBA')
    if not crop:
        return img                      # 원본 캔버스 유지 (여러 장의 상대 크기 보존)
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    cutout(src).save(dst, optimize=True)
    print(os.path.basename(dst), Image.open(dst).size)
