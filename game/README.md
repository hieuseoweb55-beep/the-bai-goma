# GOMA – game thẻ bài: engine trận đấu

Thư mục này gồm phần "bộ não" của game (giao diện do Cowork dựng, xem ../00_HUONG_DAN_COWORK.md):

* (*) `engine.js` – luật trận, chạy được trong trình duyệt và Node. Đọc số liệu từ `data.json`.
* (*) `data.json` – số liệu 10 tướng, xuất từ `data/Goma_Game_Data_v8.xlsx` bằng `python export_data.py`. **Sửa Excel xong thì chạy lại lệnh này.**
* (*) `waves.js` – quái và 3 trận demo (chuột, mèo hoang, thảm mốc, trùm Khách khó tính). Số quái đã hiệu chỉnh bằng mô phỏng.
* (*) `test_engine.js` – 25 bài kiểm luật. Chạy: `node test_engine.js`.
* (*) `sim_balance.js`, `calibrate.js` – mô phỏng cân bằng và dò số quái. Kết quả gần nhất ở `sim_report.txt`.

## Núm chỉnh toàn cục (cân bằng nhanh, mặc định không đổi)
`knobs` khi tạo trận: `healMul` (nhân mọi lượng hồi), `enemyDmgMul`, `heroDmgMul`, `healCapPct` (trần hồi mỗi lượt theo % máu tối đa, `null` = không trần).

## GIẢ ĐỊNH của engine (anh sửa nếu khác ý)
1. Khiêu khích và các hiệu ứng giảm chỉ số (Đóng băng, Ru ngủ, Làm chậm) **phủ thêm lượt kế** (thời lượng N + 1), vì tướng chậm hay ra đòn sau nên nếu không thì gần như vô dụng.
2. Người bị mất lượt (Choáng, Đóng băng, Ru ngủ) **không được hồi máu/lượt** ở lượt đó.
3. Điên tiết: ×1,02 mọi chỉ số kể cả máu tối đa; máu hiện tại không tự tăng theo.
4. Hồi sinh: người được hồi sinh có nộ 0, xóa hết trạng thái, hành động từ lượt kế.
5. Buff công: làm mới theo nguồn, nhiều nguồn khác nhau nhân với nhau.
6. Skill 1 mục tiêu (cả skill nhắm hàng sau của Sát thủ) vẫn bị khiêu khích chi phối; skill nhiều mục tiêu thì không.
7. Phản sát thương tính trên sát thương **trước khi** trừ khiên.
8. Buff của main (mini-game) là SỐ TẠM: Căn lực +10/20/35% công, Câu hỏi hồi 6/12/20% máu, Ghép chữ +10/20/35 nộ, Tập trung khiên 5/10/18%. Trượt: debuff tốc độ cả đội 5% → 7,5% → 10% theo chuỗi.
9. Quái: số tạm, đã dò bằng mô phỏng cho độ khó (xem `sim_report.txt`).

## Bổ sung (quái, boss, map)
* (*) Số liệu quái và màn nằm ở Excel sheet `QUÁI_BOSS`, `QUÁI_THÀNH_PHẦN`, `MAP_MÀN`. Chạy `python export_data.py` để cập nhật `data.json`.
* (*) `level_builder.js` – dựng đội quái cho một màn (hệ số máu, công lấy từ `MAP_MÀN`).
* (*) `calibrate_map1.js` – hiệu chỉnh hệ số 10 màn map 1 theo giả định: thắng 1 màn thưởng 3 lượt quay, người chơi xếp đội mạnh nhất có thể; ghi `map1_calib.json`.
* (*) `smoke_levels.js` – chạy thử cả 30 màn để chắc skill quái hợp lệ. Map 2, 3 chưa hiệu chỉnh nên tỷ lệ thắng chỉ để tham khảo.
* (*) `sim_start.js`, `sim_solo.js` – kiểm đội khởi đầu (Hiếu + tướng rút đầu) và trường hợp chỉ có Hiếu.

## Thêm
* (*) `xu_ly_anh.py` – kiểm và cắt nền ảnh hàng loạt, ghi `assets/` và `manifest.js`.
* (*) `make_md.py` – sinh lại `../docs/Goma_Game_Thiet_Ke_v6.md` từ Excel.
* (*) `data.js` – bản `data.json` dạng script, để `index.html` mở bằng file:// vẫn đọc được. Mỗi sự kiện của engine có `snap` (ảnh chụp trạng thái) để giao diện phát lại trận.

---
# Giao diện (Cowork dựng, 07/10/2026)

## Cách mở
* (*) Mở thẳng `game/index.html` bằng Chrome/Edge (file://, không cần cài gì, không tải gì từ mạng).
* (*) `index.html?debug=1` : bỏ qua intro, đủ 10 tướng ở Xanh dương (đổi bậc trong màn chọn đội bằng nhãn "bậc ..." ở góc thẻ), 99 lượt quay, mở hết 10 màn Map 1, bảng liệt kê ảnh thiếu ở góc trái dưới. Dùng khóa lưu riêng `goma_save_v1_debug`, không đụng tiến trình thật.
* (*) `index.html?seed=123` : cố định seed (trận và gacha) để tái hiện lỗi.
* (*) Muốn mở Map 2, 3: `ui/config.js` → `enableMap23: true` (chưa hiệu chỉnh, boss gần như không thắng được).

## File giao diện
* (*) `ui/config.js` – GOMA_CONFIG (thưởng lượt quay, hệ số quái, tọa độ, knobs, tốc độ).
* (*) `ui/intro_script.js` – TOÀN BỘ chữ intro, sửa ở đây.
* (*) `ui/core.js` (ảnh, lưu, gacha), `ui/screens.js` (các màn), `ui/battle.js` (màn trận + phát lại sự kiện), `ui/main.js` (khởi động), `ui/style.css`.
* (*) `thu_nho_anh.py` – thu nhỏ ảnh trong `assets/` (sprite cao tối đa 640px) và cập nhật manifest; chạy SAU `xu_ly_anh.py`. Ảnh gốc 2K làm thư mục assets nặng ~120MB, sau khi thu nhỏ (`python thu_nho_anh.py 480`, bản gửi anh dùng 480px) còn ~26MB.
* (*) `test_ui.py` – kiểm tự động bằng Playwright (cần `pip install playwright` + Chromium): chạy 10 màn Map 1, so kết quả với engine không giao diện cùng seed.
* (*) `assets/kiem_tra/anh_map_ten_goc.txt` – bảng đổi tên: file gốc của Flow → tên chuẩn.

## GIẢ ĐỊNH (do Cowork tự đặt, anh sửa nếu khác ý)
1. Ảnh gốc ở `F:\game the bai` là tên mặc định của Flow, KHÔNG theo chuẩn `nvXX_idle`. Cowork xem từng ảnh và đổi tên bản sao theo nội dung (dashing backwards = windup, swinging/attacking = attack, special ability/casting = skill, recoiling = hit, collapsed/defeated = dead, standing/holding = idle, portrait = card). Ảnh gốc không bị sửa.
2. Khi một thư mục có 2 ảnh cùng nội dung (quái, nền, main) thì chọn 1 ảnh, ảnh còn lại không dùng (xem bảng đổi tên).
3. `nv11_idle` (Bích Thích Chan) không có ảnh đứng riêng: cắt từ cột trái của ảnh turnaround. `nv03_attack` không có ảnh: đòn thường của Vũ giữ pose idle.
4. Tướng không có ảnh `card` (NV04–NV09): thẻ dùng ảnh idle trên nền kem.
5. Thưởng: thắng màn thường lần đầu = 3 lượt quay, boss (màn 10) = 5 lượt (`GOMA_CONFIG`). Đã qua màn rồi thì không thưởng.
6. Rút gacha: lần đầu miễn phí, 100% Trắng, 1 trong 9 tướng khác Hiếu. Các lần sau tốn 1 lượt. Trùng hoặc thấp hơn: hoàn 1 lượt (rút 10 lần cũng vậy, nên rút 10 lần toàn trùng thì mất 0 lượt).
7. Sau intro, trận 1.1 tự dùng Hiếu + tướng vừa rút (không qua màn chọn đội).
8. Màn chọn đội mặc định tự chọn đội mạnh nhất, tối đa bằng số tướng đề nghị của màn (người chơi chỉnh được lên 5).
9. Thanh khiên vẽ chồng lên thanh máu; icon trạng thái là ô chữ nhỏ (★ Choáng, ❄ Đóng băng, Z Ngủ, ↓ Làm chậm, ! Khiêu khích, ▲ Điên tiết, ↑ buff công).
10. Chưa có ảnh `fx_*` nên hiệu ứng băng, điên tiết, khiêu khích, hồi sinh, khiên, sao choáng, Zzz đều vẽ bằng code. Có ảnh `fx_*.png` trong assets (và manifest) thì game tự dùng.
11. Main không có pose `joy`/`sad`/`sleepy` được dùng trong trận (chỉ dùng ở màn gacha: `joy`).
12. Ảnh nền: bg_kho = ảnh "Carpet_flooring_warehouse_interior", bg_phongkhach = "Showroom_meeting_lounge_design", bg_congtykhach = "Luxury_corporate_office_lobby", bg_phonghop = "Empty_company_meeting_room_backg…". Đổi ảnh nền khác bằng cách sửa bảng trong `assets/kiem_tra/anh_map_ten_goc.txt` rồi chạy lại xử lý ảnh.
13. Trong trận, sát thương hiển thị = `dmg − absorbed` (engine ghi `dmg` là tổng trước khi trừ khiên); phần khiên hấp thụ hiện chữ xanh dương.


### Cập nhật vòng 3
- Đã thêm `nv03_attack` (ảnh người dùng gửi; tự bỏ bóng sàn, chỉnh tỉ lệ cho thân cao bằng `nv03_idle`) → GIẢ ĐỊNH về thiếu `nv03_attack` không còn.
- Đã thêm 4 ảnh hiệu ứng từ `hieu ung`: fx_bang (ice block, bản 1), fx_hoisinh (cột sáng vàng, bản 2), fx_dientiet (xoáy lửa nền đen), fx_khieukich (dấu chấm than đỏ, bản 2). Bản còn lại không dùng. Hiệu ứng vẽ bằng code chỉ còn là dự phòng khi thiếu ảnh. (ngoài yêu cầu: độ mờ .78 cho ảnh hiệu ứng).
- Thu nhỏ nhân vật (heroBodyPx 240→205), thanh máu/nộ/tên nhỏ hơn, giãn cột X (heroX 690/430, enemyX 1230/1490) để bớt sát nhau.

- Vòng 4: đòn đánh thường chỉ lao tới tối đa 110px (trước đó lao sát mục tiêu, có khi sang cả làn khác nên đội hình bị loạn) và luôn reset vị trí sau đòn. Đây là chỉnh hiển thị, không đổi luật engine.

- Vòng 5: màn xếp đội hình kéo thả (pointer: chuột + cảm ứng): kéo tướng từ danh sách vào ô, kéo ô sang ô để đổi chỗ, kéo ra danh sách để bỏ; bấm vẫn thêm/bỏ nhanh. Nút "Đổi hàng" bỏ. Vị trí ô (hàng + làn) truyền thẳng vào engine qua heroDef({row,slot}), không đổi luật. GIẢ ĐỊNH: ô trống ở giữa cho phép (vd làn 0 trống, làn 2 có tướng). Ngoài yêu cầu: gợi ý chữ hướng dẫn kéo thả, ghi chú "Hàng trước (chịu đòn)".

- Vòng 6: đòn đánh thường không còn lao tới mục tiêu; chỉ nhún tới trước 45px rồi về chỗ cũ (tránh nhìn như bị đổi vị trí). Chỉ là hiển thị.

### Vòng 7 – kinh tế gacha / ghép bậc / độ khó (theo yêu cầu của anh)
- Lượt quay: mỗi màn thắng lần đầu cộng 4/10 lượt → 2,5 màn mới được 1 lượt (`pullProgPerClear`, `pullProgNeed` trong `ui/config.js`). Lượt rút đầu tiên sau intro vẫn miễn phí.
- Rút trúng tướng ĐÃ CÓ → nhận mảnh theo bậc của lần rút: Trắng 1, Xanh lá 5, Xanh dương 10, Tím 20 (không còn hoàn lượt, không còn "nâng bậc" bằng rút).
- Ghép bậc ở màn Bộ sưu tập (bấm thẻ tướng): Trắng→Lá 12 mảnh, Lá→Dương 35, Dương→Tím 80, Tím→Đỏ 200, kèm tướng đang ở bậc đó.
- Tỉ lệ rút: trước khi thắng màn 2.6 chỉ ra Trắng 70% / Xanh lá 30%; sau 2.6 là 66 / 29 / 5 (Xanh dương). Tím/Đỏ chỉ có qua ghép.
- Quái: `knobs.enemyDmgMul = 1.1` (ban đầu 2 → 1,6 → 1,3 → 1,1 theo yêu cầu) (núm có sẵn của engine, không sửa luật, không sửa Excel).
- GIẢ ĐỊNH mới: (a) chỉ số bậc Tím/Đỏ không có trong Excel → ngoại suy tuyến tính (Dương + 1 hoặc 2 × (Dương − Lá)); skill/nội tại dùng dữ liệu bậc Xanh dương; (b) mở Map 2 (`enableMap2`) vì mốc "2.6"; Map 3 vẫn khóa; (c) tỉ lệ 5% Xanh dương sau 2.6 là số tôi đặt; (d) mọi màn (kể cả boss) cộng như nhau 4/10 lượt.
- Cảnh báo cân bằng (mô phỏng 30 seed, đội 5 tướng cùng bậc, quái ×2): Map 2 chưa hiệu chỉnh — màn 2.5 thắng 0% với bậc Lá, 63% với bậc Tím; 2.9 và 2.10 gần như không thắng được. Vì 2.6 nằm sau 2.5 nên muốn có Xanh dương từ rút thì phải qua 2.5 trước.
- Vòng 8: hạ sát thương quái từ x2 xuống x1,6. Màn 1.1 (Hiếu + 1 tướng bậc Trắng, 40 seed): thắng 53–55% nếu bạn đồng hành là Hưng/Thu, còn lại 93–100%; Hiếu đi một mình 0%.
- Vòng 9: hạ sát thương quái xuống x1,3.
- Vòng 10: hạ sát thương quái xuống x1,1.
- Vòng 10: thêm nút "Xóa tài khoản" ngay trên màn bản đồ (hỏi xác nhận, xóa hết tướng/mảnh/lượt/tiến trình rồi về màn chọn main). Nút cũ trong Cài đặt vẫn còn.
- Vòng 11: giới hạn 20 lượt/trận (`maxTurns` trong `ui/config.js`, ghi đè `E.K.MAX_TURNS` lúc chạy; KHÔNG sửa engine.js — engine mặc định vẫn 15, nên `smoke_levels.js` chạy riêng vẫn dùng 15). Bỏ nút "Bỏ qua" trong trận (còn x1/x2/x4); hàm bỏ qua giữ lại cho test tự động.
- Vòng 12: tướng gây sát thương x1,1 (`knobs.heroDmgMul`, áp cho mọi đòn đánh/skill sát thương của tướng; hồi máu/khiên không đổi) và máu quái x0,9 (`enemyHpMul`, nhân thêm vào hpMul từng màn). Không sửa Excel/engine.
- Vòng 13: đổi cách nhận lượt quay (thay luật 2,5 màn/lượt): thắng lần đầu mỗi màn +1 lượt. Đánh lại (thắng) các màn đã qua có tỉ lệ rớt huy hiệu = +1 lượt quay: màn cách tiền tuyến (màn xa nhất đã mở) tối đa 2 màn → 20%, xa hơn → 5% (`pullFirstClear`, `dropNearRange`, `dropRateNear`, `dropRateFar` trong `ui/config.js`). Ví dụ tiền tuyến 2.5: đánh lại 2.4/2.3 = 20%, 2.2 trở về trước = 5%. GIẢ ĐỊNH: 'max màn' = màn xa nhất đang mở khóa; 'huy hiệu' = 1 lượt quay; chỉ tính khi thắng. Thua không rớt gì.
- Vòng 14: sát thương quái x1,2 (`enemyDmgMul`), máu quái x0,95 (`enemyHpMul`).
- Vòng 15: LUẬT MỚI trong engine.js (theo yêu cầu, đây là lần duy nhất sửa engine): khiêu khích hút MỌI chiêu nhắm vào phe địch. Chiêu 1 mục tiêu -> đánh người khiêu khích; chiêu từ 2 mục tiêu trở lên -> người khiêu khích nhận đòn ĐẦU TIÊN (nếu chưa nằm trong danh sách thì thế chỗ mục tiêu đầu), các mục tiêu còn lại giữ nguyên. Áp dụng cho cả hai phe (Hưng NV02 và quái Q10). Kiểm bằng mô phỏng 60 seed x 5 loại chiêu: 100% chiêu đầu nhóm trúng người khiêu khích. test_engine.js 25/25 đạt.
- Vòng 16: nhớ đội hình lần trước (`lastTeam` trong save, lưu mỗi lần kéo thả / bấm Vào trận); mở màn chọn đội ở bất kỳ màn nào cũng dùng lại đội đó, tướng không còn thì bỏ. Nút "Tự chọn đội mạnh nhất" vẫn đặt lại đội tự động.
- Vòng 17: Map 2, 3 luôn 5 quái từ màn đầu (bù thêm quái cùng loại có trong màn, boss giữ nguyên) + hệ số máu/công riêng (`mapBalance` trong `ui/config.js`; áp lên D.levels lúc chạy, KHÔNG sửa Excel/data.js). Map 2 dùng bảng hệ số máu theo màn đã hiệu chỉnh bằng mô phỏng (công = 1 + 0,8 x (máu - 1)): đội 5 tướng bậc Xanh lá thắng ~83% ở 2.1, 2.2 75%, 2.3 63%, 2.4 54%, boss 2.5 46%, 2.6 54%, 2.7 63%, 2.8 54%, 2.9 42%, boss 2.10 ~17-25%; đội 5 tướng bậc Xanh dương thắng hết. Boss 2.5/2.9/2.10 có hệ số <1 vì chỉ số gốc của boss trong Excel đã rất cao (với hệ số 1 thì thắng 0%). Map 3 dùng hệ số tuyến tính chưa hiệu chỉnh (vẫn khóa). Sửa lỗi hiển thị "Đề nghị: null tướng" ở Map 2/3 (nay = 5).
