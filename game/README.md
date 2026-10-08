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
- Vòng 18: điện thoại: sửa khung bị lệch/phóng to (stage position:fixed, đo bằng visualViewport), tự hiện màn "Xoay ngang điện thoại để chơi" khi để dọc, thêm nút toàn màn hình (⛶, Android/Chrome; thử khóa xoay ngang), khóa zoom, thêm manifest.webmanifest + icon để "Thêm vào màn hình chính" mở toàn màn hình ngang. iPhone Safari không hỗ trợ Fullscreen API: dùng Thêm vào Màn hình chính.

## Vòng 19 – sửa điện thoại (ngoài yêu cầu gốc, theo yêu cầu người dùng)
- Nguyên nhân lỗi: class `body.portrait` trùng với class `.portrait` (khung ảnh nhân vật) nên giao diện méo. Đổi thành `body.vport`.
- Điện thoại để dọc: game tự xoay 90° để chiếm đầy màn hình (không cần xoay máy). Muốn đẹp nhất: bật tự xoay + xoay máy ngang.
- Nút ⛶: thử toàn màn hình + khóa ngang (chủ yếu Android Chrome). iPhone Safari không hỗ trợ.
- Thêm `?v=19` vào link css/js để tránh cache cũ.

## Vòng 20 – sửa gacha (theo yêu cầu người dùng)
- Rút trúng tướng đã có: bậc rút CAO hơn bản đang có → thay thẳng bằng bậc cao, bản cũ quy đổi thành mảnh theo bậc cũ (Trắng=1, Xanh lá=5, Xanh dương=10, Tím=20). Bằng/thấp hơn → quy đổi mảnh theo bậc vừa rút.
- Màn rút hiện rõ: "Nâng bậc! A → B · bản cũ đổi thành +N mảnh" hoặc "Trùng · +N mảnh" (cả rút 1 và rút 10).
- GIẢ ĐỊNH: "bản cũ quy đổi" lấy đúng bảng mảnh theo bậc cũ (ví dụ Trắng cũ = 1 mảnh).

## Vòng 21 – tên rõ hơn, bảng tỉ lệ gacha, nhạc/âm thanh tạm (theo yêu cầu người dùng)
- Tên nhân vật/quái: chữ to hơn, nền tối bán trong suốt + viền nhạt.
- Màn gacha: bảng tỉ lệ lấy từ config (trước/sau màn 2.6) + quy tắc nâng bậc/mảnh mới.
- ui/audio.js (ngoài yêu cầu gốc): nhạc nền menu/trận + âm thanh (click, đánh, chí mạng, né, skill, hồi máu, chết, thắng/thua, rút thẻ, ghép) tự tổng hợp bằng WebAudio, không cần file. Nút 🔊 góc phải bật/tắt, nhớ trong localStorage. Sau này thay bằng file nhạc thật.
- GIẢ ĐỊNH: trình duyệt chỉ cho phát âm sau lần chạm đầu tiên.

## Vòng 22
- Nút ⛶ và 🔊 chuyển sang góc trái (không che nút ở góc phải). Màn dọc: góc trên-trái của màn hình.

## Vòng 23
- Màn bản đồ: nhãn 'Rớt thẻ X%' trên từng màn đã qua (xanh = 20%), 'Thắng lần đầu +1 lượt' cho màn chưa thắng, và dòng mẹo cày lượt quay (liệt kê các màn 20% của mọi map).

## Vòng 24
- Màn kết quả khi thắng: thêm nút 'Đánh lại' (cùng đội hình) để cày huy hiệu gacha.

## Vòng 25
- Tỉ lệ rớt lượt quay khi đánh lại: 2 màn gần tiền tuyến 30% (trước 20%), các màn xa hơn 10% (trước 5%). Sửa ở ui/config.js: dropRateNear, dropRateFar.

## Vòng 26 – cân bằng lại Map 2 (theo yêu cầu người dùng)
- Mục tiêu người dùng: 4 xanh lá + 1 trắng thắng ~75%, 3 xanh lá + 2 trắng ~50% (2-1, 2-2). Chỉ giảm 7% máu quái + tăng 7% công tướng chỉ đạt 36–43% và 18–20% → cần mạnh tay hơn.
- Đã đặt: `knobs.heroDmgMul` 1.1 → 1.25 (toàn tướng), `enemyHpMul` 0.95 → 0.80 (toàn quái). Mô phỏng (250 trận/ô, đội ngẫu nhiên): 4X+1T = 76%/77%/62% (2-1/2-2/2-3); 3X+2T = 56%/58%/37%; 5 xanh lá cao hơn. Map 1 dễ hơn (1.10 vẫn ≥99%).
- GIẢ ĐỊNH: tỉ lệ mục tiêu tính trên đội ngẫu nhiên trong 10 tướng.

## Vòng 27 – 3 mốc rớt thẻ gacha khi đánh lại (theo yêu cầu người dùng)
- Gọi d = (màn xa nhất đã mở) − (chỉ số màn). Màn tiền tuyến thắng lần đầu = +1 lượt (100%). d ≤ 2: 30%. d từ 3 đến 12: 10%. d ≥ 13: 3,5% (quái yếu, thông nhanh). Chặn lạm phát lượt quay khi về cày Map 1.
- Sửa ở ui/config.js: dropRateNear 0.30, dropMidRange 12, dropRateMid 0.10, dropRateFar 0.035. Hàm U.dropChance (core.js), U.pct hiển thị '3,5%'.
- Nhãn trên màn bản đồ và dòng mẹo cày hiện đủ 3 mốc, quét mọi map đã bật. Đã kiểm tra d=0..19 bằng Playwright (d=2→30%, 3→10%, 12→10%, 13→3,5%); test_engine 25/25, test_ui đạt.
- GIẢ ĐỊNH: 'map max' = màn xa nhất đã mở khóa; màn cuối đã thắng (d=0) tính 30%.

## Vòng 28 — dữ liệu v9: 10 tướng mới, Q13–Q37, Map 4–8
* Nguồn dữ liệu: `data/Goma_Game_Data_v9.xlsx` (thêm NV12–NV21, quái Q13–Q37, 50 màn Map 4–8, sheet GHI_CHÚ_V9). `export_data.py` mặc định đọc v9 → 20 tướng, 37 quái, 80 màn.
* NV20–NV21 là VIP (ghi chú cột H có "VIP"): **không** nằm trong gacha; cách có VIP chờ chốt (xem tài liệu thiết kế).
* Map 4–8 mở mặc định (`maxMap: 8` trong config.js; `?maxmap=N` để xem trước/giới hạn). Map 3 giữ nguyên.
* Mini-boss (màn 4-5, 5-3, 6-3, 7-3...): quái Tinh anh phóng to ×1,3 + đổi màu (tạm, thay bằng ảnh riêng sau).
* GIẢ ĐỊNH cân bằng: hệ số máu từng màn Map 4–8 (`mapBalance[m].hpByMan`) được mô phỏng 400 trận/màn với đội 5 tướng bậc Xanh lá, công quái cố định ×1 (`atkFixed`); mục tiêu thắng 80% ở màn 1 giảm còn ~35% ở boss. Hệ số này nằm trong config, chưa ghi vào cột hệ số của sheet MAP_MÀN.
* 3 passive thay thế tạm cho tướng mới vì engine chưa hỗ trợ trigger đúng ý (xem GHI_CHÚ_V9 trong Excel).
* Ảnh tướng/quái/nền mới chưa có → tự dùng placeholder (chữ tên trên nền kem) cho tới khi bạn thêm ảnh.
* Đây chỉ là game vui.

## Vòng 30 — công thức độ khó chung (Map 2 đến 8), thước đo mới
* THƯỚC ĐO (theo yêu cầu): thắng ~25-30% mỗi lượt = "vừa đủ qua" (người chơi đánh lại không giới hạn lượt); 50-60% = "dư sức". Trước đó (Vòng 29) tôi đo 50% = vừa đủ nên quái quá dễ.
* Một công thức `U.difficultyF(level)` (ui/core.js), tham số ở `GOMA_CONFIG.difficulty` (config.js). Map 1 không đổi. F = sức mạnh quái, đơn vị "đội 5 Xanh lá thắng 50%".
* Mốc neo (`difficulty.anchors`): mỗi map có 1 đội TỐI THIỂU phải thắng ~30% ở màn 10: 2-7 = 5 Lá; 2-10 = 1 Dương + 4 Lá; 3-10 = 4 Dương + 1 Lá; 4-10 = 1 Tím + 4 Dương; 5-10 = 3 Tím + 2 Dương; 6-10 = 5 Tím; 7-10 = 3 Đỏ + 2 Tím; 8-10 = 5 Đỏ. (Đội tối thiểu từng map là GIẢ ĐỊNH của tôi, trừ Map 2 và 3-1 do bạn quy định; sửa ở `anchors`.)
* Giữa các mốc: màn 1 của map sau = màn 10 của map trước (`startBump` 1,0); màn 1..7 chỉ chiếm 30% mức tăng (`earlyShare`), 70% dồn vào màn 8, 9, 10 (`wallShare`); boss màn 5 +4%; 2-1 = F 0,78.
* `ui/difficulty_base.js` TỰ SINH bằng `python3 calibrate_difficulty.py 300` (hệ số nền từng màn + F tại mốc neo). Chạy lại mỗi khi đổi engine / chỉ số / quái / tướng / thêm buff, đồ, hiệu ứng. Không sửa tay.
* Núm toàn cục: `difficulty.mul` (hoặc `?diff=1.1` trên URL). Tăng = khó hơn cho Map 2 đến 8.
* Kết quả đo (100 đội ngẫu nhiên mỗi ô, hạt giống khác bộ hiệu chỉnh): 2-7: 5 Lá 36%; 2-8: 5 Lá 9%; 2-8: 1 Dương 38% / 2 Dương 65%; 2-9: 35% / 56%; 2-10: 28% / 40%; 3-1: 3 Dương 65%; đội tối thiểu ở x-10: 3-10 22%, 4-10 25%, 5-10 25%, 6-10 25%, 7-10 22%, 8-10 26%.
* HẠN CHẾ: (1) Ở 2-10 khoảng cách thắng giữa 1 và 2 Dương chỉ ~12 điểm (1 Dương +10% sức mạnh), nên không đạt đồng thời 30% và 50-60%. (2) Đội đo là đội NGẪU NHIÊN cùng bậc, không có tướng VIP; người chơi chọn đội mạnh nhất nên dễ hơn. (3) Dao động +-8 điểm mỗi màn. (4) Map 7-8 chỉ có đội gần tối đa mới qua được (5 Đỏ 23-28%).

## Vòng 31 — shop huân công, đổi mảnh 5 giờ, gacha Tím/Đỏ/VIP
* Mỗi lượt quay gacha (kể cả lượt miễn phí đầu) trả về 1 thẻ bài danh dự = 1 huân công (`honorPerPull`). Hiện ở góc phải màn bản đồ / gacha / shop.
* Gacha sau khi thắng 3-10 (mở 4-1): Trắng 60 / Lá 24 / Dương 10 / Tím 5 / Đỏ 1. Ra Tím: 20% là VIP bản Xanh dương; ra Đỏ: 20% là VIP bản Tím (`vipShare` 0,20; VIP thực tế ~1,0% bản Dương và ~0,2% bản Tím mỗi lượt). Trước 3-10 giữ như cũ, không có VIP.
* Shop huân công (nút "Shop huân công" ở bản đồ và gacha): bảng 5 ô Trắng/Lá/Dương/Tím/Đỏ, giá 5/30/70/120/500 huân công. Ô Tím: 20% là VIP Xanh dương (giá ô Tím), 80% Tím không VIP. Ô Đỏ: 20% là VIP Tím (giá ô Đỏ), 80% Đỏ không VIP. Ô Trắng/Lá/Dương không có VIP. Mua = nhận 1 thẻ như rút gacha (tướng mới -> có tướng ở bậc đó; bậc cao hơn -> nâng; bằng/thấp hơn -> mảnh).
* Làm mới mỗi 5 giờ theo đồng hồ thật (mốc cố định theo giờ UTC, `shop.resetHours`). Bảng của mỗi khung cố định theo hạt giống người chơi: tải lại trang không đổi được bảng. Tham số thử `?now=<ms>` để giả giờ.
* Đổi mảnh (cùng khung 5 giờ): có 1 tướng chỉ định ngẫu nhiên (không VIP). 2 mảnh tướng đó = 1 mảnh tướng thường tự chọn (khác tướng chỉ định); 3 mảnh tướng đó = 1 mảnh tướng VIP tự chọn (phải đang có ít nhất 1 tướng VIP). Đổi bao nhiêu lần cũng được miễn còn mảnh của tướng chỉ định (Vòng 32: có nút đổi 1 / 5 lần / tối đa); sang khung mới thì đổi tướng chỉ định.
* GIẢ ĐỊNH (bạn chưa nói rõ, sửa nếu sai): (1) 1 thẻ bài danh dự = 1 huân công. (2) Mỗi ô trong bảng chỉ mua được 1 lần mỗi khung. (3) Không giới hạn số lần đổi trong khung, miễn còn mảnh (Vòng 32). (4) Shop mở ngay từ đầu, không chờ thắng 3-10 (nên người chơi có thể mua Tím/Đỏ sớm nếu đủ huân công). (5) Mảnh nhận về cho tướng chưa sở hữu vẫn lưu, dùng khi có tướng. (6) Hai tướng VIP đều chọn được khi có ít nhất 1 VIP.
* Sửa lỗi: thanh chọn map chỉ hiện Map 1-3 (không vào được Map 4-8); nay hiện Map 1-8. Bộ sưu tập 20 tướng bị cắt dưới màn hình; nay cuộn được.

## Vòng 33 — công cụ kiểm ảnh + ảnh Tím/Đỏ riêng
* `cong_cu_anh.html` (mở trực tiếp bằng file://, nằm cạnh index.html): bảng ảnh còn thiếu theo tướng/quái/nền/FX, bấm ô để xem prompt ghép sẵn (khối phong cách + prompt riêng + tư thế + khối kỹ thuật) và nút sao chép. Tab "Kiểm thư mục ảnh": chọn thư mục hoặc thả ảnh vào để đối chiếu tên file, gợi ý tên đúng, cảnh báo kích thước / tỉ lệ / nền không phẳng / nhân vật chạm mép. Trang chỉ đọc, không ghi hay đổi tên file.
* `cong_cu_anh_data.js`: toàn bộ prompt (lấy từ tài liệu thiết kế). Sửa prompt ở đây.
* Ảnh Tím/Đỏ (tùy chọn): đặt tên `nvXX_card_t3`, `nvXX_idle_t3`, `nvXX_skill_t3` (Tím) và `..._t4` (Đỏ), chạy xu_ly_anh.py. Game tự dùng khi tướng ở bậc Tím/Đỏ (thẻ, đứng, skill); các tư thế khác (lấy đà, đánh, trúng đòn, gục) vẫn dùng ảnh gốc. Thiếu thì dùng ảnh gốc kèm viền màu như cũ. (ngoài yêu cầu nhỏ: sửa U.Sprite / U.heroCard để nhận ảnh _t3/_t4)
* `xu_ly_anh.py`: danh sách ảnh cần có đã cập nhật (20 tướng, quái Q01–Q37, 5 nền mới, FX mới, ảnh Tím/Đỏ tùy chọn).
* Hạn chế: trang kiểm ảnh dò file chưa vào manifest bằng cách thử tải ảnh nên console của trình duyệt báo nhiều dòng 404, bình thường. Kiểm tra chất lượng chỉ là ước lượng nhanh, `xu_ly_anh.py` mới là bước kiểm kỹ.


## Vòng 34 — Icon trạng thái to hơn, xác nằm lại
* Icon buff/debuff dưới thanh máu: 17px → 32px (xếp nhiều hàng nếu nhiều trạng thái); sao choáng, Zzz, dấu khiêu khích, chữ nổi trạng thái to hơn ~50%.
* Tướng/quái chết không biến mất nữa: nằm lại tại chỗ đến hết trận (tướng giữ pose 'dead', quái nằm nghiêng 75°).
* GIẢ ĐỊNH (ngoài yêu cầu): xác bị làm tối/xám và mờ nhẹ (85%), ẩn thanh máu/hiệu ứng; tên quái chết ẩn đi cho khỏi nằm ngang. Hồi sinh xóa các hiệu ứng này. Chưa có ảnh xác riêng cho quái — dùng ảnh thường xoay nghiêng.

### Vòng 34b (index ?v=35) — chỉnh lại xác
* Quái chết thì biến mất như cũ (không có ảnh xác nên nhìn xấu); chỉ tướng chết mới nằm lại (pose 'dead', tối/xám, mờ nhẹ). Icon trạng thái to giữ nguyên.

## Vòng 35 — Tăng công quái +10 điểm %
* `knobs.enemyDmgMul` 1,2 → 1,3 (quái đánh 120% → 130% so với gốc; áp cho mọi quái, cả Map 1). Hệ số theo màn của công thức độ khó vẫn nhân thêm bên trên.
* GIẢ ĐỊNH: hiểu "+10%" là cộng 10 điểm (1,2 → 1,3), không phải nhân 1,1 (=1,32). Không chạy lại `calibrate_difficulty.py` nên hệ số nền cũ (đo ở 1,2) giữ nguyên → mốc neo thực tế thấp đi (5G ở 2-7 ~34% → ~15%). Muốn đưa neo về 30% thì chạy lại calibrate (khi đó +10% sẽ bị công thức bù lại cho Map 2+, chỉ còn tác dụng ở Map 1).
* Đo 100 đội ngẫu nhiên/ô (thắng %), trước → sau: 5G 2-7 34→15, 2-10 16→11, 3-1 13→6; 4 Lá+1 Trắng 3-1 2→1; 1 Dương+4 Lá 3-1 35→24, 2-10 29→23; 3 Dương+2 Lá 3-1 68→61.

* Vòng 35 — ĐO LẠI có tank: đội thử phải có ≥1 Tank hàng trước (NV01/02/09/12/13/19), phần còn lại ngẫu nhiên (100 đội/ô). Thắng %, công quái 1,2 → 1,3: 5G 2-7 40→20, 3-1 10→2; 4 Lá+1 Trắng 3-1 5→0; 1 Dương+4 Lá 2-7 65→46, 3-1 33→19, 2-10 27→26; 3 Dương+2 Lá 3-1 71→63. Số đo ở phần trên (không ép tank) bị thấp hơn thực tế.
* Lưu ý: `calibrate_difficulty.py` và các mốc neo Vòng 29-30 đo bằng đội ngẫu nhiên KHÔNG ép tank → nếu chạy lại hiệu chỉnh nên thêm quy tắc ≥1 Tank.

## Vòng 36 — Thu nhỏ ảnh tướng chết
* Ảnh `_dead` (nằm ngang, rộng gấp 4–5 lần ảnh đứng) giờ được ép vào khung chung: tối đa rộng 0,9 × chiều cao tướng, cao 0,55 × chiều cao tướng; mọi tướng chết đều cùng cỡ. Chân/giữa thân vẫn neo đúng chỗ tướng ngã. (ảnh gốc không đổi)

## Vòng 37 – Dàn đội rộng hơn (cache ?v=38)
- Ảnh tướng/quái mới (Tím/Đỏ có cánh, lửa) rộng hơn nên che nhau: `heroBodyPx` 205→175, `lanesY` [710,865,1020], `heroX` front 880/back 420, `enemyX` front 1150/back 1620.
- Làn giữa (slot lẻ) lệch về phía SAU của mỗi bên 110px (trước là lệch về phía trước 50px) → so le zigzag, tên và thanh máu không bị đè.
- Đã cắt 234 ảnh mới vào assets (manifest 340 mục); bản gốc ở `assets/_goc_truoc_khi_cat/`; `nv12_idle` đã thu ×0.5 cho khớp tỉ lệ.
- Thu hẹp khoảng cách hàng trước–sau ~20% (460→368px): heroX back 512, enemyX back 1526.

## Vòng 38 – Giới hạn thắng mỗi màn 30 lần/ngày (cache ?v=39)
- `config.js`: `dailyWinLimit: 30`. Mỗi màn (1-1, 1-2, …) tối đa 30 lần THẮNG/ngày, tính theo giờ máy, qua 0h tự reset. Đủ 30 lần: bấm "Vào trận/Đánh lại/Thử lại" sẽ báo "Mai quay lại nhé" và không vào trận.
- Lưu trong save: `dailyWins: { day, n: { '1-1': số lần } }`. Màn team hiện "Hôm nay còn x/30 lượt thắng màn này"; màn kết quả hiện "Hôm nay: x/30".
- Lưu ý: dựa vào đồng hồ máy nên chỉnh giờ máy hoặc xóa dữ liệu trình duyệt là lách được (game chạy offline, không có server).

## Vòng 39 – Thẻ đặc quyền, quà hằng ngày, giá ô Tím (cache ?v=40)
- **Thẻ đặc quyền**: `config.js` `ticketMinutes: 10`, `ticketMax: 20`, `quickChoices: [1,5,10,20]`. Cứ 10 phút +1 thẻ (cộng dồn cả khi tắt game, tối đa 20; đầy thì đồng hồ dừng). Ở màn chọn đội của màn ĐÃ THẮNG có nút "⚡ Đánh nhanh": chọn 1/5/10/20 lần (hoặc "Tối đa"); mỗi lần tốn 1 thẻ, tính là 1 lần thắng (trừ vào giới hạn 30 thắng/màn/ngày) và roll rớt huy hiệu như đánh lại bình thường. Không mô phỏng trận (coi như thắng chắc). Nút vượt quá số thẻ hoặc số lượt thắng còn lại bị khóa.
- **Quà hằng ngày**: lần mở bản đồ đầu tiên trong ngày (giờ máy) +10 lượt quay (`dailyGiftPulls`), hiện popup "Quà hằng ngày". Chế độ `?debug=1` không tặng.
- **Shop**: ô Tím giá 170 huân công (trước 120). Giá luôn lấy theo config nên có hiệu lực ngay cả khi bảng 5 giờ đã sinh.
- Save mới: `tickets {n,t}`, `giftDay`. Test nhanh giờ: thêm `?now=<epoch_ms>` vào URL.

## Vòng 40 – Bỏ chặn Xanh dương, mở Tím/Đỏ từ 2-6 (cache ?v=41)
- Gacha: ngay từ đầu đã ra Xanh dương: Trắng 62 / Lá 28 / Dương 10 (`gachaWeightsEarly`). Tím/Đỏ vẫn bị chặn đến khi thắng màn 2-6 (`topUnlockLevel` đổi 3-10 → 2-6); sau đó bảng bình thường 60/24/10/5/1. Đã xóa bảng `gachaWeightsLate` và `blueUnlockLevel` (không còn dùng).
