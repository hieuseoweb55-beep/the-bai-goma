#!/usr/bin/env python3
"""
Kiểm tra và xử lý ảnh game GOMA.  Chạy trên máy anh, ví dụ:

    pip install pillow numpy scipy
    python xu_ly_anh.py --src "F:\\game the bai" --out assets

Việc script làm:
  1. Quét thư mục (cả thư mục con), so tên file với danh sách cần có, báo thiếu / thừa / gần giống.
  2. Kiểm từng ảnh: độ phân giải, nền có phẳng không, nhân vật có chạm mép (bị cắt) không, quá nhỏ trong khung...
  3. Cắt nền (nền phẳng một màu) cho tướng, quái, main; bỏ bóng đổ; hiệu ứng nền đen -> nền trong suốt.
     Nền (background) chỉ đổi cỡ. Ảnh thẻ (card) giữ nguyên.
  4. Ghi manifest.json (kích thước, đường chân, tâm ngang) để game căn các pose không bị nhảy.
  5. Làm vài ảnh tổng hợp trong thư mục kiem_tra/ để gửi cho Claude xem nhanh.
Dùng --check-only để chỉ kiểm tra, không ghi ảnh.
"""
import os, sys, re, json, argparse, difflib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

EXTS = {".png", ".jpg", ".jpeg", ".webp"}
POSES = ["idle", "windup", "attack", "skill", "hit", "dead", "card"]
MAIN_POSES = ["idle", "cheer", "win", "cry", "worry", "shout", "scared", "joy", "sad", "sleepy"]
MAIN_REQ = {"idle", "cheer", "win", "cry", "worry"}


def expected_files(data_path):
    codes = ["NV01", "NV02", "NV03", "NV04", "NV05", "NV06", "NV07", "NV08", "NV09", "NV11"]
    if data_path and os.path.exists(data_path):
        try: codes = [h["code"] for h in json.load(open(data_path, encoding="utf-8"))["heroes"]]
        except Exception: pass
    exp = {}                                              # tên chuẩn -> (loại, bắt buộc)
    for c in codes:
        for p in POSES: exp[f"{c.lower()}_{p}"] = ("card" if p == "card" else "hero", True)
    for c in codes:                                        # ảnh Tím/Đỏ riêng (tùy chọn): thiếu thì game dùng ảnh gốc
        for t in (3, 4):
            for p in ("card", "idle", "skill"): exp[f"{c.lower()}_{p}_t{t}"] = ("card" if p == "card" else "hero", False)
    for i in range(1, 38): exp[f"q{i:02d}_idle"] = ("monster", i not in (3, 4))
    for n in ("bg_kho", "bg_phongkhach", "bg_congtykhach", "bg_phonghop", "bg_xuongdet", "bg_cang", "bg_caotoc", "bg_hoicho", "bg_thamthan"): exp[n] = ("bg", True)
    for n in ("fx_bang", "fx_hoisinh", "fx_dientiet", "fx_khieukich"): exp[n] = ("fx", True)
    for n in ("fx_sao", "fx_zzz", "fx_khien", "fx_aura_t3", "fx_aura_t4", "fx_frame_t3", "fx_frame_t4", "fx_burst", "fx_slash", "fx_wave", "fx_heal"): exp[n] = ("fx", False)
    for g in ("nam", "nu"):
        for p in MAIN_POSES: exp[f"main_{g}_{p}"] = ("main", p in MAIN_REQ)
        exp[f"main_{g}_card"] = ("card", True)
    for n in ("chao", "gietminh", "gai_dau"): exp[f"intro_hieu_{n}"] = ("main", False)
    return exp


def norm(stem):
    s = stem.lower().strip().replace(" ", "_").replace("-", "_")
    return re.sub(r"_+", "_", s)


# ---------- cắt nền ----------
def cut_sprite(rgb):
    a = rgb.astype(float); H, W, _ = a.shape
    edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bgc = np.median(edge, axis=0)
    dist = np.abs(a - bgc).max(axis=2)
    bgish = dist <= 12
    lab, n = ndi.label(bgish)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgconn = np.isin(lab, list(border))
    areas = ndi.sum(bgish, lab, range(1, n + 1))
    hole_min = 0.0033 * H * W                              # vùng nền kín đủ lớn (vòng quai túi...) cũng là nền
    big = np.isin(lab, [i + 1 for i, s in enumerate(areas) if s >= hole_min])
    bgconn |= big
    g = a.mean(axis=2); mn = a.min(axis=2); sat = a.max(axis=2) - mn
    dark = g < 100
    solid = ndi.binary_fill_holes(ndi.binary_closing(dark, iterations=3)) & ~big
    near_dark = ndi.binary_dilation(dark, iterations=2)
    alpha = np.zeros((H, W)); rgbo = a.copy(); alpha[solid] = 1.0
    out = ~solid & ~bgconn
    # bóng đổ: xám phẳng phổ biến nhất ngoài nhân vật
    low = out & (sat < 8) & (g > 110) & (g < 235)
    shadow = np.zeros_like(low)
    shadow_found = False
    if low.sum() > 0.002 * H * W:
        hist = np.bincount(g[low].astype(int), minlength=256); s = int(np.argmax(hist[110:235]) + 110)
        shadow = ndi.binary_dilation(low & (np.abs(g - s) < 24), iterations=2); shadow_found = shadow.sum() > 0.002 * H * W
    e = out & near_dark & (sat < 12) & ~shadow
    alpha[e] = (255 - g[e]) / 255; rgbo[e] = 20
    white_bg = bgc.min() > 235
    glow = out & ~e & ~shadow & (sat >= 8)
    if white_bg:                                           # ánh sáng màu trên nền trắng: tách "màu sang alpha"
        d = 255 - mn; al = np.clip(d[glow] / 110, 0.02, 1); alpha[glow] = al
        rgbo[glow] = np.clip((a[glow] - 255 * (1 - al[:, None])) / al[:, None], 0, 255)
    else:
        alpha[glow] = 1.0
    m = alpha > 0.05
    l2, n2 = ndi.label(ndi.binary_dilation(m, iterations=3))
    sizes = ndi.sum(m, l2, range(1, n2 + 1))
    keep = np.isin(l2, [i + 1 for i, z in enumerate(sizes) if z >= 150]); alpha[~keep] = 0
    return np.dstack([rgbo, alpha * 255]).astype(np.uint8), bgc, shadow_found


def fx_to_alpha(rgb):
    a = rgb.astype(float); mx = a.max(axis=2); al = np.clip(mx / 255.0, 0, 1)
    out = np.zeros(a.shape, float); nz = al > 0.01
    out[nz] = np.clip(a[nz] / al[nz][:, None], 0, 255)
    return np.dstack([out, al * 255]).astype(np.uint8)


def body_metrics(rgba):
    al = rgba[..., 3] > 40
    lab, n = ndi.label(al)
    if n == 0: return None
    sizes = ndi.sum(al, lab, range(1, n + 1)); main = lab == (int(np.argmax(sizes)) + 1)
    ys, xs = np.where(main)
    return dict(foot_y=int(ys.max()), top_y=int(ys.min()), body_h=int(ys.max() - ys.min() + 1), cx=int(xs.mean()), body_w=int(xs.max() - xs.min() + 1))


def thumb_sheet(items, path, cols=5, cell=240, bg=(205, 175, 135)):
    if not items: return
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 20)), bg); d = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(items):
        im = im.convert("RGBA"); s = min((cell - 10) / im.width, (cell - 10) / im.height); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))))
        x = (i % cols) * cell + (cell - im.width) // 2; y = (i // cols) * (cell + 20) + (cell - im.height)
        sheet.paste(im, (x, y), im); d.text(((i % cols) * cell + 4, (i // cols) * (cell + 20) + cell + 4), name, fill=(20, 20, 20))
    sheet.save(path, quality=88)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True); ap.add_argument("--out", default="assets")
    ap.add_argument("--data", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json"))
    ap.add_argument("--check-only", action="store_true")
    args = ap.parse_args()
    exp = expected_files(args.data)
    files = {}
    for root, _, fs in os.walk(args.src):
        for f in fs:
            st, ext = os.path.splitext(f)
            if ext.lower() in EXTS and "kiem_tra" not in root:
                k = norm(st)
                if k not in files or os.path.getmtime(os.path.join(root, f)) > os.path.getmtime(files[k]): files[k] = os.path.join(root, f)
    rep = []; warn = {}; manifest = {}
    missing_req = [k for k, (t, r) in exp.items() if r and k not in files]
    missing_opt = [k for k, (t, r) in exp.items() if not r and k not in files]
    extra = [k for k in files if k not in exp]
    rep.append(f"Tìm thấy {len(files)} ảnh trong {args.src}. Cần có {sum(1 for t, r in exp.values() if r)} ảnh bắt buộc + {sum(1 for t, r in exp.values() if not r)} tùy chọn.")
    rep.append(f"\n== THIẾU (bắt buộc): {len(missing_req)} ==")
    for k in missing_req:
        cands = [e for e in extra if e.split("_")[0] == k.split("_")[0]]          # chỉ gợi ý file cùng mã nhân vật
        sg = difflib.get_close_matches(k, cands, n=1, cutoff=0.6)
        rep.append(f"  - {k}" + (f"   (có file gần giống: {sg[0]} -> đổi tên?)" if sg else ""))
    rep.append(f"\n== THIẾU (tùy chọn): {len(missing_opt)} ==\n  " + ", ".join(missing_opt))
    rep.append(f"\n== TÊN LẠ (không có trong danh sách): {len(extra)} ==")
    for k in extra:
        sg = difflib.get_close_matches(k, list(exp), n=1, cutoff=0.6)
        rep.append(f"  - {k}" + (f"   (gần giống: {sg[0]})" if sg else ""))
    out_dir = args.out; os.makedirs(out_dir, exist_ok=True) if not args.check_only else None
    sheets = {"tuong": [], "quai": [], "main": [], "nen_fx": []}
    for name, (kind, req) in exp.items():
        if name not in files: continue
        try:
            im = Image.open(files[name]).convert("RGB")
        except Exception as e:
            warn.setdefault(name, []).append(f"không mở được: {e}"); continue
        W, H = im.size; w = warn.setdefault(name, [])
        if min(W, H) < 400: w.append(f"độ phân giải thấp ({W}x{H})")
        rgb = np.asarray(im)
        if kind == "bg":
            if abs(W / H - 16 / 9) > 0.08: w.append(f"tỷ lệ {W}x{H} không phải 16:9")
            if not args.check_only:
                s = min(1.0, 1920 / W); im.resize((int(W * s), int(H * s))).save(os.path.join(out_dir, name + ".jpg"), quality=90)
            sheets["nen_fx"].append((name, im)); manifest[name] = dict(kind=kind, file=name + ".jpg", w=int(W * min(1.0, 1920 / W)), h=int(H * min(1.0, 1920 / W))); continue
        if kind == "card":
            if not args.check_only: im.save(os.path.join(out_dir, name + ".png"))
            manifest[name] = dict(kind=kind, file=name + ".png", w=W, h=H); sheets["tuong" if name.startswith("nv") else "main"].append((name, im)); continue
        if kind == "fx":
            edge = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3)]).astype(float)
            if edge.mean() > 40: w.append("nền hiệu ứng không đen (cần nền đen thuần để tách)")
            rgba = fx_to_alpha(rgb); Image.fromarray(rgba, "RGBA").save(os.path.join(out_dir, name + ".png")) if not args.check_only else None
            manifest[name] = dict(kind=kind, file=name + ".png", w=W, h=H); sheets["nen_fx"].append((name, Image.fromarray(rgba, "RGBA"))); continue
        rgba, bgc, shadow = cut_sprite(rgb)
        edge_std = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3), rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3)]).astype(float).std(axis=0).max()
        if edge_std > 6: w.append(f"nền không phẳng (độ lệch {edge_std:.0f}); tách nền có thể xấu")
        if shadow: w.append("có bóng đổ dưới chân (đã tự bỏ; lần sau nhờ Flow 'no ground shadow')")
        al = rgba[..., 3] > 40
        if not al.any(): w.append("KHÔNG tách được nhân vật (toàn nền?)"); continue
        ys, xs = np.where(al); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        border_touch = (al[:3].any() or al[-3:].any() or al[:, :3].any() or al[:, -3:].any())
        if border_touch: w.append("nhân vật hoặc hiệu ứng chạm mép ảnh (có thể bị cắt)")
        if (y1 - y0) / H < 0.35: w.append(f"nhân vật quá nhỏ trong khung ({(y1 - y0) / H:.0%} chiều cao)")
        pad = 24; crop = rgba[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
        # đo thân (thành phần lớn nhất) trên ảnh đã cắt
        mt = body_metrics(crop)
        if mt is None: w.append("không đo được thân nhân vật"); continue
        pil = Image.fromarray(crop, "RGBA")
        if not args.check_only: pil.save(os.path.join(out_dir, name + ".png"))
        manifest[name] = dict(kind=kind, file=name + ".png", w=pil.width, h=pil.height, **mt)
        sheets["tuong" if kind == "hero" else "quai" if kind == "monster" else "main"].append((name, pil))
    # cảnh báo chéo: chiều cao thân giữa các pose của cùng một tướng
    by = {}
    for n, m in manifest.items():
        if m["kind"] == "hero" and "body_h" in m: by.setdefault(n.split("_")[0], {})[n.split("_", 1)[1]] = m
    for c, d in by.items():
        if "idle" in d:
            for p in ("attack", "skill", "windup"):
                if p in d and not (0.6 < d[p]["body_h"] / d["idle"]["body_h"] < 1.5):
                    warn.setdefault(f"{c}_{p}", []).append(f"cao thân lệch nhiều so với idle ({d[p]['body_h']} so với {d['idle']['body_h']} px): nhân vật bị phóng to/nhỏ khác pose khác")
    rep.append("\n== CẢNH BÁO TỪNG ẢNH ==")
    nw = 0
    for n, w in warn.items():
        if w: nw += 1; rep.append(f"  {n}: " + "; ".join(w))
    if not nw: rep.append("  (không có)")
    rep.append(f"\nTổng: {len(files) - len(extra)} ảnh hợp lệ, {len(missing_req)} thiếu bắt buộc, {len(extra)} tên lạ, {nw} ảnh có cảnh báo.")
    text = "\n".join(rep); print(text)
    if not args.check_only:
        json.dump(manifest, open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        open(os.path.join(out_dir, "manifest.js"), "w", encoding="utf-8").write("window.GOMA_MANIFEST = " + json.dumps(manifest, ensure_ascii=False) + ";\n")
        kt = os.path.join(out_dir, "kiem_tra"); os.makedirs(kt, exist_ok=True)
        open(os.path.join(kt, "bao_cao.txt"), "w", encoding="utf-8").write(text)
        for label, items in sheets.items():
            for k in range(0, len(items), 20): thumb_sheet(items[k:k + 20], os.path.join(kt, f"tong_hop_{label}_{k // 20 + 1}.jpg"))
        print(f"\nĐã ghi ảnh đã cắt vào '{out_dir}', báo cáo và ảnh tổng hợp vào '{kt}'.")


if __name__ == "__main__":
    main()
