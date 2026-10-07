# Prompt Flow – ảnh bổ sung cho game GOMA

Cách dùng: dán **khối phong cách** + **prompt riêng** + **khối kỹ thuật**. Nếu Flow cho đính ảnh tham chiếu, đính **1 ảnh tướng đã làm** (để quái cùng nét vẽ). Prompt viết tiếng Anh (Flow hiểu tốt hơn), ghi chú tiếng Việt ở dưới mỗi mục.

## 0. Ba khối dùng chung

**KHỐI PHONG CÁCH (dán đầu mọi prompt):**
```
Chibi cartoon style, thick clean dark outlines, flat vibrant colors with simple cel shading, cute exaggerated proportions, same art style as the reference image.
```

**KHỐI KỸ THUẬT cho NHÂN VẬT / QUÁI (dán cuối prompt):**
```
Full body, single character, plain solid white background, NO ground shadow, no text, no floating props, character fills about 80% of the frame with a wide empty margin around, feet at the same baseline.
```

**KHỐI KỸ THUẬT cho HIỆU ỨNG (dán cuối prompt):**
```
Pure solid black background (#000000), bright glowing effect only, no character, no ground, no text, centered, square 1:1.
```

Quy tắc hướng: **tướng và main quay sang PHẢI**, **quái quay sang TRÁI** (đối mặt nhau). Quái to nhỏ khác nhau thì cứ vẽ cho đầy khung, tôi chỉnh kích thước trong game.

---

## 1. QUÁI (mỗi con 1 ảnh đứng; bị đánh, gục tôi làm bằng code)

Thêm dòng `facing LEFT` vào prompt. File: `q01_idle.png`...

| Mã | Quái | Prompt riêng |
|---|---|---|
| Q01 | Chuột | `A mischievous warehouse rat, grey-brown fur, big front teeth, small scrap of carpet in its paws, cheeky grin, facing LEFT.` |
| Q02 | Mèo hoang | `A scruffy stray cat, orange tabby with a torn ear, arched back, claws out, fierce hissing expression, facing LEFT.` |
| Q03 | Thảm mốc (tinh anh map 1, tùy chọn) | `A living rolled-up carpet monster covered in green mold and small mushrooms, angry eyes, stubby arms, a tattered edge dragging on the floor, facing LEFT.` |
| Q04 | Đại ca mèo (boss 1.10, tùy chọn) | `A huge fat stray cat boss with a scar over one eye, wearing a small crown made of cardboard, a gold chain, menacing smirk, facing LEFT.` |
| Q05 | Khách khó tính (boss giữa map 2) | `A picky middle-aged customer in a polo shirt, arms crossed, one eyebrow raised, frowning, holding a rolled-up quotation paper, stubborn expression, facing LEFT.` |
| Q06 | Trợ lý nam ác | `A sly male assistant in a slim dark suit with glasses, holding a clipboard, evil smirk, facing LEFT.` |
| Q07 | Trợ lý nữ ác | `A sharp-tongued female assistant in a blazer and pencil skirt, glasses, high ponytail, holding a tablet, arched eyebrow and contemptuous smile, facing LEFT.` |
| Q08 | Chó dữ | `A fierce guard dog with a spiked collar, snarling with bared teeth and drool, muscular, ready to pounce, facing LEFT.` |
| Q09 | Đối tác dự án lớn (boss 2.10) | `A wealthy project partner, heavyset businessman in an expensive suit with a gold watch and a thick contract in hand, confident smug smile, larger and imposing, facing LEFT.` |
| Q10 | Bảo vệ | `A stern security guard in a uniform and cap holding a baton, arms spread to block the way, serious face, facing LEFT.` |
| Q11 | Siêu đối tác dự án (tinh anh map 3) | `A super-rich project partner in a glossy white suit with sunglasses and a briefcase full of contracts, sparkling jewelry, arrogant pose, facing LEFT.` |
| Q12 | Siêu giám đốc khó tính (boss 3.10) | `A super-strict executive boss in a sharp black suit with a red tie, standing tall with arms crossed, intimidating glare, a faint dark aura behind him, very large and imposing, facing LEFT.` |

Ghi chú: Q03 và Q04 tùy chọn (nếu không kịp, tôi dùng ảnh Q01/Q02 phóng to kèm viền màu). Anh chưa nói rõ "siêu đối tác dự án" và "siêu giám đốc khó tính" là một hay hai quái, tôi đang tách hai (Q11 giữa map 3, Q12 boss cuối). Nếu là một thì bỏ Q11.

---

## 2. NỀN (4 ảnh, 16:9, không có nhân vật)

Dán khối phong cách. Thêm cuối mỗi prompt: `wide 16:9 background, side-view, no characters, no text, open empty floor area in the lower middle for characters to stand, soft depth.` File: `bg_kho.png`, `bg_phongkhach.png`, `bg_congtykhach.png`, `bg_phonghop.png`.

| File | Bối cảnh | Prompt riêng |
|---|---|---|
| `bg_kho.png` | Map 1: kho thảm trải sàn | `Interior of a carpet flooring warehouse: tall metal shelves with colorful rolled carpets, wooden pallets stacked with carpet-tile boxes, concrete floor, bright overhead lights, a few chewed carpet scraps on the floor.` |
| `bg_phongkhach.png` | Map 2: phòng khách bàn hợp tác | `A client's showroom meeting lounge: sofa set, coffee table with tea cups, wall displays of carpet samples, framed pictures, warm friendly lighting.` |
| `bg_congtykhach.png` | Map 3: công ty khách | `A luxury corporate office lobby: polished marble floor, glass walls, a reception desk, a large blank logo wall, dark wood and gold accents, cold formal lighting.` |
| `bg_phonghop.png` | Cảnh gacha: họp đề xuất nhân viên | `A company meeting room: long table with chairs, a whiteboard with blank paper sheets, a projector screen, large window with daylight, tidy and a little funny.` |

---

## 3. HIỆU ỨNG (nền đen, tôi dùng chế độ "screen" nên chỉ cần phần phát sáng)

Dán khối phong cách + prompt riêng + **khối kỹ thuật hiệu ứng**. File: `fx_*.png`.

| File | Hiệu ứng | Prompt riêng |
|---|---|---|
| `fx_bang.png` | Đóng băng | `A block of translucent light-blue ice with sharp crystal shards and sparkles, frosty mist.` |
| `fx_hoisinh.png` | Hồi sinh | `A golden holy light pillar rising upward with small feathers and sparkles, warm glow.` |
| `fx_dientiet.png` | Điên tiết | `A swirling red-orange fiery rage aura with flame tongues, intense energy.` |
| `fx_khieukich.png` | Khiêu khích | `A bold glowing red exclamation mark with a cartoon anger vein symbol, provoking, punchy.` |

Tùy chọn (nếu không làm, tôi vẽ bằng code): `fx_sao.png` (vòng sao quay quanh đầu khi choáng), `fx_zzz.png` (bong bóng "Zzz" ru ngủ), `fx_khien.png` (khiên năng lượng xanh hình bong bóng).

---

## 4. MAIN (nhân vật chính, đứng góc cổ vũ)

**Bước 1: tạo thiết kế main** (nam và nữ, mỗi bên 1 ảnh, rồi dùng làm ảnh tham chiếu cho các pose). Dán khối phong cách + khối kỹ thuật nhân vật:
* (*) Nam: `A young new employee, boy, neat short black hair, bright eager eyes, black company t-shirt with white "GOMA" lettering, dark jeans, sneakers, small backpack, a lanyard ID badge, friendly smile, facing RIGHT.`
* (*) Nữ: `A young new employee, girl, black hair in a ponytail, bright eager eyes, black company t-shirt with white "GOMA" lettering, dark pants, sneakers, a lanyard ID badge, friendly smile, facing RIGHT.`

**Bước 2: 10 pose** (đính ảnh thiết kế main làm tham chiếu, giữ nguyên mặt và quần áo). Thêm: `facing RIGHT`. File: `main_nam_idle.png`, `main_nu_idle.png`...

| Thứ tự | File | Pose | Dùng khi |
|---|---|---|---|
| 1 (bắt buộc) | `idle` | Đứng chờ, vỗ tay nhịp | giữa các lượt |
| 2 (bắt buộc) | `cheer` | Cổ vũ, hai tay giơ cao, miệng hô to | tướng mình xả skill |
| 3 (bắt buộc) | `win` | Ăn mừng, nhảy lên, nắm tay | thắng trận |
| 4 (bắt buộc) | `cry` | Khóc ròng, nước mắt chảy | thua trận, tướng gục |
| 5 (nên có) | `worry` | Lo lắng, cắn móng tay, giọt mồ hôi | tướng mình sắp gục |
| 6 | `shout` | Hô hào, một tay chỉ về phía trước | bắt đầu trận |
| 7 | `scared` | Giật mình, hai tay ôm má | bị skill của boss |
| 8 | `joy` | Nhảy cẫng mừng, hai tay giơ, lấp lánh | gacha ra phẩm chất cao |
| 9 | `sad` | Thất vọng, vai xụi, mây xám trên đầu | gacha ra Trắng |
| 10 | `sleepy` | Gật gù buồn ngủ, bong bóng mũi | chờ lâu |

Nếu thiếu thời gian: làm 5 pose đầu cho cả nam và nữ (10 ảnh).

---

## 5. INTRO: Hiếu đón người mới (tùy chọn, dùng ảnh tham chiếu là ảnh Thủ kho Hiếu)

Dán khối phong cách + khối kỹ thuật nhân vật, đính ảnh Hiếu. Thêm `facing RIGHT`:
* (*) `intro_hieu_chao.png`: `Same character, friendly welcoming pose, one hand waving and the other hand holding a cardboard box, warm smile.`
* (*) `intro_hieu_gietminh.png`: `Same character, startled pose with wide eyes and sweat drops, hands up, shocked at something on the floor.`
* (*) `intro_hieu_gai_dau.png`: `Same character, scratching his head confusedly, forgetting something, goofy expression.`

---

## 6. Danh sách kiểm (đặt tên đúng để game tự nhận)

* (*) Quái: `q01_idle.png` ... `q12_idle.png` (Q03, Q04 tùy chọn).
* (*) Nền: `bg_kho.png`, `bg_phongkhach.png`, `bg_congtykhach.png`, `bg_phonghop.png`.
* (*) Hiệu ứng: `fx_bang.png`, `fx_hoisinh.png`, `fx_dientiet.png`, `fx_khieukich.png` (+ tùy chọn).
* (*) Main: `main_nam_*.png`, `main_nu_*.png` (+ ảnh thiết kế `main_nam_card.png`, `main_nu_card.png` cho màn chọn nhân vật).
* (*) Intro (tùy chọn): `intro_hieu_*.png`.
* (*) Tổng tối thiểu: quái 10, nền 4, hiệu ứng 4, main 10 (5 pose × 2 giới) + 2 ảnh chọn nhân vật = **30 ảnh**.

Mẹo: tạo cả 12 quái trong **một lượt chạy** (cùng prompt khung, đổi mô tả) để nét vẽ đồng đều; nền thì tạo bản 16:9 rồi kiểm tra khoảng trống ở giữa còn đủ chỗ cho 5 tướng và 5 quái.
