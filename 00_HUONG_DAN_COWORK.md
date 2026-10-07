# HƯỚNG DẪN BÀN GIAO – Game thẻ bài GOMA (dành cho Cowork)

Đọc hết file này trước khi làm. Chủ dự án là **anh Hiếu** (thủ kho, tự làm game cho vui với đồng nghiệp công ty thảm trải sàn Goma). Nói chuyện bằng **tiếng Việt**.

## 1. Mục tiêu và hạn

* (*) Làm **bản chơi được** (mở thẳng `game/index.html` bằng trình duyệt, không cần cài gì, không cần server) cho khoảng 20 đồng nghiệp chơi thử.
* (*) Hạn: **tối 07/10/2026**. Nếu có thể làm xong sớm hơn thì tốt, nhưng **đừng cắt luật hay đổi số** để chạy cho kịp. Nếu không kịp thì cắt theo thứ tự ở mục 8.
* (*) Phần "bộ não" (engine luật trận, số liệu, quái, màn) **đã làm xong và đã kiểm** (25 bài kiểm đạt). Việc còn lại: **xử lý ảnh, dựng giao diện, nối ảnh, tự kiểm, báo cáo.**

## 2. Cấu trúc thư mục

```
goma_game_package/
  00_HUONG_DAN_COWORK.md        <- file này
  01_PROMPT_DAN_VAO_COWORK.txt  <- câu lệnh ngắn để dán
  data/Goma_Game_Data_v8.xlsx   <- NGUỒN SỐ LIỆU DUY NHẤT (tướng, skill, quái, màn, luật). Anh Hiếu sửa ở đây.
  docs/Goma_Game_Thiet_Ke_v6.md <- tổng hợp thiết kế, quyết định (đã chốt / tạm / treo)
  docs/Prompt_Flow_Anh_Bo_Sung.md <- danh sách ảnh cần có và tên file chuẩn
  game/
    engine.js        luật trận (chạy cả trình duyệt và Node), KHÔNG ĐỔI luật nếu chưa hỏi
    level_builder.js dựng đội quái từ data
    data.json, data.js  số liệu xuất từ Excel (data.js để mở bằng file://)
    export_data.py   Excel -> data.json + data.js  (chạy lại khi Excel đổi)
    xu_ly_anh.py     kiểm và cắt nền ảnh -> assets/ + manifest.js
    test_engine.js   25 bài kiểm luật (node test_engine.js)
    sim_*.js, calibrate*.js, smoke_levels.js  mô phỏng cân bằng
    make_md.py       sinh lại docs/...md từ Excel
    assets/          (trống) nơi xuất ảnh đã xử lý
```

Ảnh gốc anh Hiếu đã làm xong nằm ở **`F:\game the bai`** (trên máy anh, ngoài gói này). **Không xóa, không sửa ảnh gốc**; chỉ đọc và xuất bản sao vào `game/assets/`.

## 3. Trạng thái hiện tại (đừng làm lại)

| Phần | Trạng thái |
|---|---|
| Luật trận, nộ, né, chí mạng, khiên, trạng thái, nội tại 10 tướng | Xong, 25/25 bài kiểm |
| 10 tướng × 3 phẩm chất (Trắng, Xanh lá, Xanh dương) | Xong (số nháp) |
| 12 quái và boss, 30 màn (3 map × 10) | Xong dữ liệu. **Map 1 đã hiệu chỉnh**, map 2 và 3 CHƯA (boss gần như không thắng được) |
| Ảnh | Anh Hiếu đã tạo xong (chưa ai kiểm). **Việc của bạn: kiểm và xử lý** |
| Giao diện, gacha, intro, lưu tiến trình | **Chưa có. Việc chính của bạn** |
| Mini-game của main, PvP, phẩm chất Tím/Đỏ, mảnh nâng cấp | **Ngoài phạm vi đợt này** |

## 4. Việc cần làm, theo thứ tự

### Bước 0: kiểm tra môi trường
* (*) Trong `game/`: `node test_engine.js` phải ra **25 đạt, 0 lỗi**. Nếu máy không có Node thì ghi chú và bỏ qua (không bắt buộc).
* (*) `python export_data.py` chạy được (cần `pip install openpyxl`). Nó tạo lại `data.json` và `data.js`.

### Bước 1: xử lý ảnh
* (*) Trong `game/`: `pip install pillow numpy scipy` rồi `python xu_ly_anh.py --src "F:\game the bai" --out assets`.
* (*) Đọc `assets/kiem_tra/bao_cao.txt` và nhìn các ảnh `assets/kiem_tra/tong_hop_*.jpg`. Cần báo lại cho anh Hiếu: ảnh thiếu, tên sai, ảnh lỗi (bóng đổ, chạm mép, dép/hướng nhìn không nhất quán, nét vẽ lệch giữa các pose của cùng một tướng).
* (*) Tên file sai **rõ ràng** (ví dụ `nv01_attak`) thì đổi tên **bản sao** trong `assets/` hoặc sửa bằng cách chạy lại với bản sao đã đổi tên ở thư mục tạm; không động vào thư mục gốc. Tên sai mơ hồ thì hỏi anh Hiếu.
* (*) Kết quả cần có: `assets/*.png|jpg`, `assets/manifest.json`, `assets/manifest.js` (định nghĩa `window.GOMA_MANIFEST`).
* (*) Quy ước tên: tướng `nvXX_{idle,windup,attack,skill,hit,dead,card}.png`; quái `qXX_idle.png`; nền `bg_kho|bg_phongkhach|bg_congtykhach|bg_phonghop`; hiệu ứng `fx_bang|fx_hoisinh|fx_dientiet|fx_khieukich`; main `main_{nam|nu}_{idle,cheer,win,cry,worry,shout,scared,joy,sad,sleepy,card}`; intro `intro_hieu_{chao,gietminh,gai_dau}`. **Mã NV10 không tồn tại**; Bích Thích Chan là **nv11**.
* (*) **Ảnh nào chưa có thì game vẫn phải chạy** bằng hình thay thế (khối màu + tên), và có thông báo nhẹ ở chế độ debug.

### Bước 2: dựng giao diện (`game/index.html`)
Thuần HTML + CSS + JavaScript, **không framework, không bước build, không tải tài nguyên từ mạng**. Các script nạp theo thứ tự: `data.js`, `assets/manifest.js` (nếu có), `engine.js`, `level_builder.js`, rồi mã giao diện (có thể tách `ui/*.js`, `ui/style.css`). Tỷ lệ 16:9 cố định (khung logic 1920×1080, co giãn vừa cửa sổ), nền tối ngoài khung. Giao diện chữ tiếng Việt.

Chi tiết từng màn ở **mục 5**.

### Bước 3: tự kiểm
* (*) Nếu có trình duyệt tự động (Playwright/Chromium headless): mở `index.html` qua `file://`, đi hết luồng: chọn main, intro, rút lần đầu, vào màn 1.1, chơi tới hết trận, nhận thưởng, mở màn 1.2. Chụp ảnh màn hình từng bước và **không có lỗi console**.
* (*) Thêm chế độ `?debug=1`: bỏ qua intro, có đủ 10 tướng ở bậc chọn được, nhiều lượt quay, mở tất cả màn của map 1, hiện thông tin ảnh thiếu.
* (*) Chạy trận ở cả 3 tốc độ phát lại; bấm "bỏ qua" giữa trận vẫn ra kết quả đúng; kết quả phải **giống hệt** khi chạy engine không giao diện với cùng seed.

### Bước 4: báo cáo cho anh Hiếu
Ngắn gọn, gạch đầu dòng (*): cái gì đã làm, cái gì chưa, lỗi ảnh, các giả định mới bạn tự đặt (ghi **"ngoài yêu cầu"** nếu thêm gì ngoài mục này), cách mở game, và 1-3 câu hỏi nếu còn vướng.

## 5. Đặc tả giao diện

### 5.1 Luồng
`Chọn main` → `Intro (3 cảnh)` → `Rút gacha lần đầu` → `Bản đồ/Chọn màn` ⇄ `Chọn đội` → `Trận` → `Kết quả` → quay lại `Bản đồ`. Menu phụ: `Gacha`, `Bộ sưu tập`, `Cài đặt` (tốc độ mặc định, xóa tiến trình).

### 5.2 Chọn main
Hai thẻ **Nam** và **Nữ** (ảnh `main_nam_card`, `main_nu_card`), ô nhập tên (không bắt buộc; mặc định "Nhân viên mới"). Lưu lựa chọn.

### 5.3 Intro (bản A: hội thoại chữ kèm chân dung)
Hộp thoại ở dưới, chân dung bên trái (ảnh `intro_hieu_*` nếu có, không thì `nv01_idle`), bấm để sang câu kế. Kịch bản nháp (anh Hiếu sẽ sửa chữ, nên **để toàn bộ chữ trong một file `ui/intro_script.js`** dễ sửa):

* (*) **Cảnh 1 (nền `bg_kho`):** Hiếu: "Chào em! Anh là Hiếu, thủ kho. Hôm nay anh dẫn em đi một vòng cho biết kho." → "Đây là kệ cuộn, đây là pallet hộp... à khoan, em tên gì ấy nhỉ?" → (tên người chơi) → "Chuột! Huynh đệ à, cứ bình tĩnh đi đó mà... Một mình anh không xuể." → "Em lên phòng họp đề xuất công ty thêm người đi, anh giữ kho ở đây."
* (*) **Cảnh 2 (nền `bg_phonghop`):** "Công ty đồng ý cho đề xuất một nhân viên hỗ trợ kho." → **rút gacha lần đầu** (xem 5.4) → tướng xuất hiện và nói câu `quote` của họ (có trong `data.heroes[i].quote`).
* (*) **Cảnh 3 (nền `bg_kho`):** Hiếu: "Có thêm người rồi! Em đứng đó cổ vũ, tụi anh lo." → vào trận 1.1.
Có nút **Bỏ qua intro**.

### 5.4 Gacha (nền `bg_phonghop`)
* (*) Tiền tệ: **lượt quay** (số nguyên). Lần rút đầu tiên **miễn phí** và **100% ra tướng Trắng khác Hiếu** (đều trong 9 tướng còn lại).
* (*) Các lần sau tốn 1 lượt: phẩm chất **Trắng 65% / Xanh lá 27% / Xanh dương 8%** (`data.gacha.weights`), tướng chọn đều trong 10 tướng (kể cả Hiếu).
* (*) Người chơi sở hữu **phẩm chất cao nhất đã rút** của mỗi tướng. Rút **trùng hoặc thấp hơn** thì **hoàn 1 lượt quay** (hiện "Trùng, hoàn 1 lượt"). Rút **cao hơn** thì nâng lên phẩm chất đó (hiện "Nâng cấp"). Hiếu có sẵn bậc Trắng.
* (*) Hiệu ứng lật thẻ: viền màu theo phẩm chất, ánh sáng; hiện tên, vai trò, câu `quote`.
* (*) Nút rút 1 lần và rút 10 lần (chỉ khi đủ lượt).
* (*) **GIẢ ĐỊNH** (số tạm, để trong `GOMA_CONFIG`): thưởng thắng mỗi màn thường **lần đầu** thắng = 3 lượt quay, boss (màn 10) = 5 lượt. Thắng lại màn đã qua không có thưởng.

### 5.5 Bản đồ / chọn màn
Ba tab Map 1, 2, 3 (lấy từ `data.levels`, mỗi map 10 màn, hiện tên màn, bối cảnh, icon boss/tinh anh, **số tướng đề nghị** `level.team`). Mở khóa tuần tự. **Mặc định chỉ Map 1 chơi được; Map 2 và 3 hiện "Sắp ra mắt" (khóa)** vì chưa hiệu chỉnh, bật bằng `GOMA_CONFIG.enableMap23 = true`. Nền theo map: `bg_kho`, `bg_phongkhach`, `bg_congtykhach`.

### 5.6 Chọn đội
Tối đa **5 tướng**, 2 hàng × 3 ô. Danh sách tướng đang có (hiện bậc bằng viền màu, vai trò, chỉ số bậc đó). Nút **"Tự chọn đội mạnh nhất"** (ưu tiên bậc cao, rồi đa dạng vai trò). Hàng mặc định theo `hero.row`; nút đổi hàng cho từng tướng. Dùng `GomaLevels.placeHeroes` để xếp ô (tối đa 3 mỗi hàng, tràn sang hàng kia). Phải có ít nhất 1 tướng.

### 5.7 Trận (màn chính)
* (*) **Bố cục** (khung 1920×1080): tướng bên TRÁI, quái bên PHẢI, nền theo map. Chân (đường đáy) các sprite nằm ở 3 làn, y ≈ 640 / 760 / 880. Hàng trước tướng x ≈ 640, hàng sau x ≈ 440; hàng trước quái x ≈ 1280, hàng sau x ≈ 1480. Ô `slot` 0,1,2 ứng với 3 làn y. **Main đứng góc dưới trái** (x ≈ 120, cao khoảng 300px), chỉ cổ vũ.
* (*) **Kích thước sprite:** tướng có thân cao khoảng 260px (tính từ `manifest[nvXX_idle].body_h`, các pose của cùng tướng dùng **chung một hệ số phóng** để không nhảy). Quái nhân với hệ số theo mã: Q01 0.45, Q02 0.65, Q03 0.8, Q04 1.3, Q05 1.2, Q06 1.0, Q07 1.0, Q08 0.75, Q09 1.35, Q10 1.1, Q11 1.35, Q12 1.5 (để trong `GOMA_CONFIG.monsterScale`).
* (*) **Căn pose:** đặt ảnh sao cho `foot_y` và `cx` (từ manifest) trùng điểm đứng của đơn vị, nên đổi pose không bị nhảy.
* (*) **Phẩm chất:** chỉ có ảnh Trắng. Xanh lá và Xanh dương dùng **cùng ảnh nhưng thêm viền màu bằng CSS**: Xanh lá = `filter: drop-shadow(0 0 1px #46dc5a) drop-shadow(0 0 1px #46dc5a) drop-shadow(0 0 8px rgba(70,220,90,.65))`; Xanh dương = `drop-shadow(0 0 1px #3c8cff) drop-shadow(0 0 2px #3c8cff) drop-shadow(0 0 14px rgba(60,140,255,.8))`. Khung thẻ: Trắng `#e8e8e8`, Xanh lá `#46dc5a`, Xanh dương `#3c8cff`. Nếu có ảnh riêng `nvXX_xanhla_*` hay `nvXX_xanhduong_*` thì ưu tiên dùng.
* (*) **Thanh trên đầu mỗi đơn vị:** máu (xanh lá, đỏ khi dưới 30%), khiên (xanh dương phủ lên), **nộ** (vàng, đủ 100 thì nhấp nháy "SKILL"), hàng icon trạng thái (Choáng, Đóng băng, Ru ngủ, Làm chậm, Khiêu khích, Điên tiết, buff công).
* (*) **Đầu màn:** hiện tên màn, bối cảnh, "Lượt n/15". Nút tốc độ **1× / 2× / 4×** và **Bỏ qua** (nhảy thẳng tới kết quả).
* (*) **Phát lại sự kiện:** gọi engine chạy hết trận, rồi **phát lại** `battle.events`, mỗi sự kiện kèm `snap` (máu, nộ, khiên, sống/chết, trạng thái của mọi đơn vị tại thời điểm đó), nên thanh luôn đúng. Trạng thái **ban đầu** lấy từ `battle.units` trước khi chạy.
* (*) **Hoạt họa (bằng code, không cần ảnh động):**
  * Đứng chờ: nhấp nhô nhẹ như thở (scaleY ±1.5%).
  * `strike` thường: lùi lấy đà (dùng `nvXX_windup` nếu có, không thì dịch lùi 20px) → lao tới mục tiêu → đổi sang `nvXX_attack` đúng lúc va chạm (không có thì giữ idle) + tia sáng + khựng 80ms → về chỗ.
  * `skill`: banner tên skill ở giữa màn, đổi sang `nvXX_skill`, hiệu ứng phát sáng, rồi các `strike`/`heal`/`shield` kèm theo.
  * Bị đánh: đổi `nvXX_hit` ~350ms, rung, nháy trắng, số sát thương bay lên (trắng; **chí mạng** cam, to, có "!"; **NÉ** chữ xám; phần khiên hấp thụ chữ xanh dương; hồi máu chữ xanh lá).
  * `die`: đổi `nvXX_dead`, mờ dần, rồi mờ hẳn (quái: ngã, xoay, mờ).
  * `status`: icon trạng thái; Đóng băng phủ `fx_bang`, Khiêu khích hiện `fx_khieukich`, Điên tiết phủ `fx_dientiet`, hồi sinh `fx_hoisinh`. Không có ảnh fx thì vẽ bằng code (sao quay cho Choáng, "Zzz" cho Ru ngủ, bong bóng cho khiên). Dùng `mix-blend-mode: screen` cho ảnh fx nền đen đã đổi alpha.
  * `skip` (mất lượt): chữ "Mất lượt" nhỏ trên đầu.
* (*) **Main cổ vũ** (đổi theo sự kiện, mỗi pose giữ ~1.2s rồi về `idle`): đầu trận `shout`; tướng mình xả skill `cheer`; tướng mình gục `cry` rồi `worry`; tướng mình còn dưới 30% máu `worry`; skill của boss `scared`; thắng `win`; thua `cry`. Thiếu pose thì dùng `idle`; thiếu hết ảnh main thì hiện nhãn "Main" đơn giản.
* (*) **Kết thúc:** `win` hiện "Chiến thắng", thưởng lượt quay (chỉ lần đầu), nút Tiếp tục/Màn kế; `lose` hiện "Thất bại" (hết 15 lượt cũng là thua) kèm gợi ý "Rút thêm tướng hoặc nâng đội", nút Thử lại.

### 5.8 Bộ sưu tập
Lưới 10 tướng, tướng chưa có hiện bóng xám. Bấm vào xem: ảnh `card`, tiểu sử `bio`, vai trò, chỉ số ở bậc đang có, **mô tả skill và nội tại theo bậc** (`skill.desc[0..2]`, `passive.desc[2]` từ data; nội tại mở từ Xanh dương).

### 5.9 Lưu tiến trình
`localStorage` khóa `goma_save_v1`: giới tính main, tên, `owned` (mã tướng → bậc cao nhất), `pulls`, `firstPullDone`, `cleared` (danh sách màn đã qua + đã nhận thưởng), tùy chọn tốc độ. Có nút xóa tiến trình.

## 6. Cách dùng engine (đã kiểm, đừng viết lại)

```js
const data = window.GOMA_DATA;                                  // từ data.js
const level = data.levels.find(l => l.map === 1 && l.man === 1);
const team = GomaLevels.placeHeroes(
  [['NV01', 0], ['NV03', 1]].map(([code, tier]) => GomaEngine.heroDef(data.heroes.find(h => h.code === code), tier)));
const enemies = GomaLevels.buildEnemies(data, level);           // dùng hpMul, atkMul của màn
const battle = GomaEngine.createBattle({ heroes: team, enemies, seed: Date.now() % 1e9, knobs: GOMA_CONFIG.knobs });
const initial = battle.units.map(u => ({ id: u.id, hp: u.hp, maxHp: battle.maxHp(u), rage: u.rage })); // trạng thái đầu
const { result, turns } = battle.runAll();                      // 'win' | 'lose'
// battle.events: danh sách sự kiện để phát lại; mỗi sự kiện có .t (lượt), .type, .snap
```
* (*) Đơn vị: `battle.units[i]` có `id` (`hero0`, `enemy1`...), `side`, `code`, `name`, `row` (`front`|`back`), `slot` (0-2), `tier`.
* (*) Sự kiện (`type`): `turn{n}`, `order{ids}`, `tie{units}`, `strike{actor,target,dmg,absorbed,crit,dodged,skill}`, `skill{actor,name}`, `heal{target,amount,by}`, `shield{target,v}`, `status{target,status,n}`, `buff{target,atk,n}`, `reflect{actor,target,dmg}`, `die{target,by}`, `revive{actor,target,hp}`, `skip{actor}`, `timeout`.
* (*) `snap[id] = {hp, maxHp, rage, shield, alive, statuses:[tên...]}`.
* (*) `knobs` (núm chỉnh toàn cục, mặc định không đổi): `healMul`, `enemyDmgMul`, `heroDmgMul`, `healCapPct`.
* (*) Cấu hình giao diện để trong một object `GOMA_CONFIG` ở đầu mã để dễ chỉnh: `enableMap23`, `rewardWin` (3), `rewardBoss` (5), `monsterScale`, `knobs`, tốc độ.

## 7. Ràng buộc quan trọng

* (*) **Không đổi luật trong `engine.js`** và **không sửa số trong Excel** nếu chưa hỏi anh Hiếu. Nếu thấy lỗi engine: viết bài kiểm tái hiện lỗi vào `test_engine.js` trước, sửa, rồi chạy lại cả 25 bài.
* (*) Số liệu đổi ở Excel thì chạy `python export_data.py` để cập nhật `data.json` và `data.js`. Không sửa tay hai file này.
* (*) Tên tướng trong data có tiền tố chi nhánh ("HCM-", "HN-"): hiển thị gọn (bỏ tiền tố, hiện nhỏ ở dưới nếu muốn). Đây là **người thật trong công ty**, đừng thêm câu chữ giễu cợt ngoại hình hay khuyết điểm.
* (*) Dòng nhỏ ở màn chọn main hoặc menu: "Đây chỉ là game vui" (quyết định đã chốt, để tránh mích lòng).
* (*) Mọi giả định mới bạn tự đặt phải ghi vào `game/README.md` mục "GIẢ ĐỊNH".

## 8. Thứ tự cắt nếu không kịp hạn

1. Hoạt họa phụ (fx vẽ bằng code, rung, khựng) → giữ đổi pose và số sát thương.
2. Intro rút còn 1 màn hội thoại ngắn.
3. Bộ sưu tập, rút 10 lần.
4. Cài đặt (giữ nút xóa tiến trình).
Không cắt: luồng chọn main → rút lần đầu → trận → kết quả → lưu tiến trình, và tự kiểm.

## 9. Các điểm đã biết, cần báo lại hoặc xin ý

* (*) Chưa rõ "siêu đối tác dự án" (Q11) và "siêu giám đốc khó tính" (Q12) là một hay hai quái. Hiện tách hai, nhưng map 2/3 đang khóa nên chưa ảnh hưởng.
* (*) Pose skill của vài ảnh có thể còn mảng xám bóng đổ sót gần chân sau khi cắt; nếu thấy xấu, báo anh Hiếu nhờ Flow vẽ lại "không bóng đổ".
* (*) Hướng nhìn: tướng và main quay **phải**, quái quay **trái**. Ảnh nào ngược hướng thì lập danh sách, **không lật ngang** (chữ trên áo sẽ ngược).
* (*) Hệ số máu, công của map 1 là kết quả mô phỏng với giả định "người chơi xếp đội mạnh nhất", người thật sẽ thắng ít hơn. Nếu chơi thử thấy khó thì chỉnh bằng `knobs` hoặc hệ số ở sheet MAP_MÀN (rồi `export_data.py`).
* (*) Điên tiết kéo dài 2 lượt; khiêu khích và các hiệu ứng giảm chỉ số phủ thêm lượt kế (xem `game/README.md`, mục GIẢ ĐỊNH).

## 10. Cách làm việc với anh Hiếu

* (*) Ngắn gọn, thực tế, gạch đầu dòng, tiếng Việt thân mật. Ít khen. Thành thật khi lỗi hoặc chưa chắc.
* (*) Tự kiểm ít nhất một lần trước khi báo "xong"; đừng để lỗi lan.
* (*) Khi có quyết định kỹ thuật thật sự (không phải chi tiết nhỏ), nêu **ít nhất 3 phương án ngắn** để anh chọn. Thêm gì ngoài yêu cầu thì ghi rõ **"ngoài yêu cầu"** trước khi làm.
* (*) Hỏi **tối đa một câu mỗi lần**, và chỉ hỏi khi bị chặn thật sự.
