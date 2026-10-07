#!/usr/bin/env python3
"""Thu nhỏ ảnh trong assets/ cho game nhẹ (mặc định sprite cao tối đa 640px; chạy `python thu_nho_anh.py 512` để nhỏ hơn) và cập nhật manifest.
Chạy SAU xu_ly_anh.py:  python thu_nho_anh.py   (chạy lại nhiều lần vẫn an toàn)."""
import os, sys, json
from PIL import Image
MAXH = int(sys.argv[1]) if len(sys.argv) > 1 else 640          # chiều cao sprite tối đa (px); thẻ rộng tối đa = MAXH
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
m = json.load(open(os.path.join(A, "manifest.json"), encoding="utf-8"))
for k, v in m.items():
    if v["kind"] in ("bg",): continue
    p = os.path.join(A, v["file"]); im = Image.open(p)
    if v["kind"] == "card": s = min(1.0, MAXH / im.width)
    elif v["kind"] == "fx": s = min(1.0, 512 / max(im.size))
    else: s = min(1.0, MAXH / im.height)
    if s >= 0.999: continue
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    im.save(p, optimize=True)
    v["w"], v["h"] = im.size
    for f in ("foot_y", "top_y", "body_h", "cx", "body_w"):
        if f in v: v[f] = round(v[f] * s)
json.dump(m, open(os.path.join(A, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(A, "manifest.js"), "w", encoding="utf-8").write("window.GOMA_MANIFEST = " + json.dumps(m, ensure_ascii=False) + ";\n")
print("xong")
