"""Builds the two layers the scroll portrait projects onto its 3D scene.

  src/luke-portrait.webp   the published portrait (1600 square, mono, grain)
  src/luke-mask.png        the cut-out of Luke (1856 square, same framing)

Writes, at 1600 square:
  plate.webp   the portrait with Luke taken out. Each row of the gap is filled by
               mirroring the field from either side of him (same row = same depth,
               so the grass and blur are the right scale), crossfaded in the middle
               and nudged to meet both edges. The camera only moves a little, so
               only the edges of the gap are ever seen.
  person.webp  Luke alone, straight from the portrait, with a soft alpha edge

The mask stops above his shoes. That's fine: the shoes sit on the ground where
his card stands, so they move with the ground and are left on the plate.

Run:  python dev/portrait-3d/prep.py
"""
import os, cv2, numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
N = 1600
KEEP_BELOW = 1425   # rows under this are left alone: his shoes and the ground they stand on

final = cv2.imread(os.path.join(SRC, "luke-portrait.webp"), cv2.IMREAD_GRAYSCALE).astype(np.float32)
mask = cv2.resize(cv2.imread(os.path.join(SRC, "luke-mask.png"), cv2.IMREAD_GRAYSCALE), (N, N), interpolation=cv2.INTER_AREA)

hole = cv2.dilate((mask > 20).astype(np.uint8), np.ones((19, 19), np.uint8))
hole[KEEP_BELOW:] = 0

plate = final.copy()
for y in range(N):
    xs = np.flatnonzero(hole[y])
    if xs.size == 0: continue
    xl, xr = xs.min() - 1, xs.max() + 1
    x = np.arange(xl + 1, xr)
    # crossfade where the two mirrors meet: wide in the soft distance, tight in the sharp grass
    fade = float(np.interp(y, [500, 900, 1300], [420, 160, 40]))
    dl, dr = x - xl, xr - x
    left = final[y, np.clip(xl - dl, 0, N - 1)]
    right = final[y, np.clip(xr + dr, 0, N - 1)]
    # where a mirror runs off the frame, lean on the other side
    w = np.clip((dl - dr) / fade * 0.5 + 0.5, 0, 1)
    w = np.where(xl - dl < 0, 1.0, np.where(xr + dr > N - 1, 0.0, w))
    row = left * (1 - w) + right * w
    plate[y, xl + 1:xr] = row

# soften the seam a touch, but only its low frequencies, so the grain survives
low_p = cv2.GaussianBlur(plate, (0, 0), 6); hp = plate - low_p
low_p = cv2.GaussianBlur(low_p, (0, 0), 6)
inside = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 4)
plate = plate * (1 - inside) + (low_p + hp) * inside
# and blend into the untouched rows below
cv2.imwrite(os.path.join(HERE, "plate.webp"), np.clip(plate, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 88])

m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 1.0)
rgba = np.dstack([final, final, final, m]).astype(np.uint8)
cv2.imwrite(os.path.join(HERE, "person.webp"), rgba, [cv2.IMWRITE_WEBP_QUALITY, 90])
ys, xs = np.where(m > 2)
print("ok; person bbox x %d-%d y %d-%d of %d" % (xs.min(), xs.max(), ys.min(), ys.max(), N))
