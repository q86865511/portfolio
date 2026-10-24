# 由專案封面產生各詳情頁的社群分享圖(public/og/<slug>.jpg,1200x630)。
#
# 為什麼另存 JPG:封面是 WebP(1200x675),但 LINE / LinkedIn 等平台的連結預覽對 WebP
# 支援不穩;JPG 最保險,並自中心裁成 OG 建議的 1.91:1。
#
# 用法(需 Pillow):python3 apps/main/scripts/generate-project-og.py
# 換新封面後重跑一次並提交產物;詳情頁 metadata 會在對應 JPG 存在時改用它。
import glob
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(HERE, "..", "public")
W, H = 1200, 630

os.makedirs(os.path.join(PUBLIC, "og"), exist_ok=True)
for src in sorted(glob.glob(os.path.join(PUBLIC, "covers", "*.webp"))):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    crop_h = min(h, round(w * H / W))
    top = (h - crop_h) // 2
    im = im.crop((0, top, w, top + crop_h)).resize((W, H), Image.LANCZOS)
    out = os.path.join(PUBLIC, "og", os.path.basename(src)[:-5] + ".jpg")
    im.save(out, quality=84, optimize=True, progressive=True)
    print(os.path.relpath(out, PUBLIC), f"{os.path.getsize(out) // 1024} KB")
