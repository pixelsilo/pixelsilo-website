import sys, cv2, numpy as np
src, out, maskout = sys.argv[1:4]
img = cv2.imread(src, cv2.IMREAD_COLOR)[180:180+1856, 0:1856]
H, W = img.shape[:2]
# 1) cut out the person with GrabCut from a rectangle around him
rect = (620, 70, 700, 1740)  # x, y, w, h
mask = np.zeros((H, W), np.uint8)
bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, rect, bg, fg, 6, cv2.GC_INIT_WITH_RECT)
person = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
# keep the largest blob, close small holes, soften the edge
n, lab, stats, _ = cv2.connectedComponentsWithStats(person)
if n > 1:
    big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); person = np.where(lab == big, 255, 0).astype(np.uint8)
person = cv2.morphologyEx(person, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
# the feet sit in the plane of focus, so the ground round them is left untouched below
alpha = cv2.GaussianBlur(person, (0, 0), 2.5).astype(np.float32) / 255.0
cv2.imwrite(maskout, person)
# 2) blur amount by depth on the ground plane: zero at his feet, rising with distance
horizon, feet = 560, 1745
y = np.arange(H, dtype=np.float32)
amt = np.maximum(np.abs(y - feet) - 140, 0) / (feet - 140 - horizon)   # sharp band round the feet, 1 at the horizon
amt = np.where(y < horizon, 1.15, amt)             # sky, hedge and trees: fully soft
amt = np.clip(amt, 0, 1.15)
amt = np.repeat(amt[:, None], W, axis=1)
# 3) blend a stack of lens-like (disc) blurs by amount
levels = [0, 4, 8, 13, 19, 26]
def disc(r):
    if r == 0: return img.astype(np.float32)
    k = np.zeros((2*r+1, 2*r+1), np.float32); cv2.circle(k, (r, r), r, 1, -1); k /= k.sum()
    return cv2.filter2D(img, -1, k, borderType=cv2.BORDER_REFLECT).astype(np.float32)
# fill in behind him first, so the blur doesn't smear his silhouette into the field
hole = cv2.dilate(person, np.ones((41, 41), np.uint8)); hole[1500:, :] = 0
small = cv2.resize(img, (W//4, H//4)); hs = cv2.resize(hole, (W//4, H//4))
filled = cv2.resize(cv2.inpaint(small, hs, 9, cv2.INPAINT_TELEA), (W, H))
img_bg = np.where(hole[..., None] > 0, filled, img)
def disc2(r):
    if r == 0: return img_bg.astype(np.float32)
    k = np.zeros((2*r+1, 2*r+1), np.float32); cv2.circle(k, (r, r), r, 1, -1); k /= k.sum()
    return cv2.filter2D(img_bg, -1, k, borderType=cv2.BORDER_REFLECT).astype(np.float32)
stack = [disc2(r) for r in levels]
pos = amt / 1.15 * (len(levels) - 1)
lo = np.floor(pos).astype(int); hi = np.minimum(lo + 1, len(levels) - 1); f = (pos - lo)[..., None]
res = np.zeros_like(stack[0])
for i in range(len(levels)):
    res += np.where((lo == i)[..., None], stack[i] * (1 - f), 0)
    res += np.where((hi == i)[..., None], stack[i] * f, 0)
# 4) person back in, sharp
a = alpha[..., None]
res = res * (1 - a) + img.astype(np.float32) * a
cv2.imwrite(out, np.clip(res, 0, 255).astype(np.uint8))
print("ok", H, W)
