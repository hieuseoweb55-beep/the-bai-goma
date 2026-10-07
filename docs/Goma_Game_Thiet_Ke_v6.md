# Game thẻ bài GOMA – Tổng hợp thiết kế (v6)

Tạo tự động từ `data/Goma_Game_Data_v8.xlsx` bằng `game/make_md.py`.

## Đọc nhanh

* (*) Bản thô chơi được: **10 tướng** × 3 phẩm chất, Thủ kho Hiếu có sẵn, lần rút đầu ra tướng Trắng khác Hiếu. Không có mini-game ở đợt này. 3 map × 10 màn (map 1 đã hiệu chỉnh, map 2 và 3 chưa).
* (*) Trạng thái quyết định: 48 đã chốt, 26 tạm, 7 chưa chốt, 3 đang treo.
* (*) Mọi con số (chỉ số, skill, quái, hệ số màn) là SỐ NHÁP để hỗ trợ, chưa cân. Cân bằng thật dựa vào chơi thử và núm chỉnh toàn cục của engine.

## 1. Dự án và time-box

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Mục đích | Game thẻ bài gacha đánh theo lượt, tướng là đồng nghiệp công ty, làm cho vui, khoảng 20 người chơi. Anh coi đây là thử thách và case study. | Đã chốt |  |
| Hạn | Bản thô chơi được đến tối 07/10/2026, chỉ khoảng 3-4 giờ làm thật. Anh tự tạo áp lực để xem mình làm được gì. | Đã chốt |  |
| Mở rộng | Thêm tối đa 24 giờ nếu bản thô đạt kỳ vọng người chơi. | Đã chốt |  |
| Tiêu chí đạt | Trong 24 giờ có ít nhất 8/20 người thử, ít nhất 50% chơi xong trận đầu, ít nhất 3 người chơi lại lần 2. Đạt thì mở thêm 24 giờ, không đạt thì đóng băng và ghi bài học. | Tạm | Mặc định của Claude, anh chưa xác nhận số. Người chơi lại lần 2 là thước thật vì lần đầu bị ảo do tò mò khi thấy mặt mình, sếp trong game. |
| Thứ tự cắt nếu trễ | Mini-game thứ hai, rồi trùm, rồi giảm số tướng từ 8 xuống 6. Không kéo dài hạn, không cắt giờ ngủ để bù. | Tạm | Đề xuất của Claude. |
| Dòng 'game vui' | Màn vào game có một dòng nói đây chỉ là game vui, để tránh mích lòng. | Đã chốt |  |
| Báo người trong game | Cho những người xuất hiện (nhất là nhân vật sếp) xem trước khi phát cho cả nhóm. | Tạm | Đề xuất của Claude. |
| Không xếp theo chức vụ | Sếp hay nhân viên đều có đủ 5 phẩm chất, độ mạnh không theo chức vụ. | Đã chốt |  |
| Xác suất quay như nhau | Mọi người có cùng xác suất ra, độ hiếm nằm ở phẩm chất. | Tạm | Đề xuất của Claude. |

## 2. Phạm vi bản demo

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Tướng và phẩm chất | 8 tướng × 3 phẩm chất (Trắng, Xanh lá, Xanh dương). Tím và Đỏ để bản sau, vì vào game đã thấy Đỏ thì mất vui. | Đã chốt |  |
| Vai trò 8 tướng | 2 Tank, 2 Vật lý, 1 Phép, 2 Hỗ trợ, 1 Sát thủ. Tank A là Thủ kho Hiếu. | Tạm | Claude gán, anh đổi được. |
| Nội dung chặng | 1 chặng vài trận, 3 loại quái và 1 trùm. | Tạm | Quái và trùm là ai chưa chốt (gợi ý: chuột, mèo hoang, thảm mốc, trùm Khách khó tính). |
| Mini-game | 2 mini-game đơn giản, 1 mini-game nếu thiếu giờ. Mini-game đầu ở lượt 1. | Tạm |  |
| Gacha demo | Ra thẳng phẩm chất: Trắng 65%, Xanh lá 27%, Xanh dương 8%. Tặng khoảng 10 lượt quay và 3 tướng Trắng khởi đầu. Quay trùng đổi thành 1 lượt quay. Không có mảnh, bảo hiểm. | Tạm | Số tạm để chạy được. |
| Kỹ thuật | HTML 1 file, lưu tiến trình bằng localStorage. | Tạm |  |
| Nền tảng | Chơi trên điện thoại (màn dọc) hay máy tính. | Chưa chốt | Quyết định tỷ lệ nền và cách xếp 2 hàng tướng. |
| Không làm ở demo | Cơ chế mảnh nâng cấp, nâng cấp auto, PvP, phẩm chất Tím và Đỏ. | Tạm |  |
| Thêm 2 nhân vật | Anh thêm HCM-PHỤ KHO ANH LÂM (NV09, Tank-Vật lý, hàng trước) và HCM- BÍCH THÍCH CHAN (NV11, Phép-Buff, hàng sau). Tổng 10 tướng. Mã NV10 đã bị xóa. | Đã chốt | Nhiều hơn 8 tướng demo ban đầu: thêm ảnh và nội dung, cần tính lại giờ. |
| Cốt truyện mở đầu | Người chơi là nhân viên mới, bắt đầu với Thủ kho Hiếu (Trắng) đón tiếp và hướng dẫn. Lần rút đầu 100% ra tướng Trắng khác Hiếu, nên vào game có 2 tướng Trắng. Cần thiết kế intro dẫn truyện. | Đã chốt |  |
| Bối cảnh | Gacha: cảnh họp và đề xuất nhân viên. Đi cảnh, đánh quái: kho thảm trải sàn (map 1). | Đã chốt |  |
| Cấu trúc màn | 3 map × 10 màn. Map 1 (1.1-1.10): xử lý kho thảm với chuột, mèo. Map 2 (2.1-2.10): phòng khách bàn hợp tác, gặp khách hàng (khách khó tính, trợ lý nam ác và nữ ác, chó dữ...). Map 3 (3.1-3.10): bàn dự án tại công ty khách (siêu giám đốc khó tính, trợ lý, bảo vệ...). | Đã chốt | Phạm vi làm tối nay chưa chốt (map 1 trước hay cả 3). |
| Trận đầu và thưởng | Trận đầu 2 chuột (Hiếu + 1 tướng, mô phỏng thắng 100% với cả 9 tướng rút ra). Thắng trận thưởng 3 lượt quay (số tạm). | Tạm | Claude đề xuất. |
| Quái và boss (bản nháp) | 12 quái ở sheet QUÁI_BOSS và QUÁI_THÀNH_PHẦN: Q01 Chuột, Q02 Mèo hoang, Q03 Thảm mốc, Q04 Đại ca mèo (boss 1.10), Q05 Khách khó tính (2.5), Q06 Trợ lý nam ác, Q07 Trợ lý nữ ác, Q08 Chó dữ, Q09 Đối tác dự án lớn (boss 2.10), Q10 Bảo vệ, Q11 Siêu đối tác dự án (3.5), Q12 Siêu giám đốc khó tính (boss 3.10). | Tạm | Claude đề xuất, anh xem và sửa. Chưa rõ 'siêu đối tác dự án' và 'siêu giám đốc khó tính' là một hay hai quái. |

## 3. Luật trận (PvE)

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Số lượt | Tối đa 15 lượt. | Đã chốt |  |
| Thắng thua | Toàn đội tướng chết thì thua. Hết 15 lượt chưa diệt hết quái cũng thua. | Đã chốt |  |
| PvP | Để trống. Dự kiến hết lượt thì so tổng máu, hòa thì đội có tướng ra đòn đầu ở lượt 1 thắng. | Chưa chốt | Anh bảo còn xa. |
| Đội hình | 2 hàng × 3 ô = 6 vị trí, tối đa 5 tướng. | Đã chốt |  |
| Thứ tự ra đòn | Tốc độ cao ra trước, tính lại mỗi lượt (đã cộng buff/debuff), so số lẻ không làm tròn. | Đã chốt |  |
| Gacha ẩn | Chỉ khi hai đơn vị bằng nhau chính xác mới quay ngẫu nhiên. Mỗi lượt quay lại, người chơi không thấy. | Đã chốt | Nên ghi log kết quả quay để phát lại khi test (đề xuất của Claude). |
| Chọn mục tiêu đòn thường | Hàng trước trước, random trong hàng, hết hàng trước mới tới hàng sau. | Đã chốt |  |
| Skill nhắm hàng đã hết người | Random 1 đối tượng còn sống khác của đội địch. | Đã chốt |  |
| Nộ khởi đầu | 50 nộ mỗi trận, cả tướng lẫn quái. | Đã chốt |  |
| Cộng và dùng nộ | Đánh trúng +30 cho người đánh. Bị đánh +10 (kể cả bị né, bị skill). Đủ 100 thì xả skill, xả xong về 0 (phần dư mất). | Đã chốt |  |
| Né | Né thành công: người né +10 nộ, người đánh không được +30, không mất máu. | Đã chốt |  |
| Skill | Không chí mạng, có thể bị né. Skill nhiều mục tiêu: mỗi mục tiêu tự xét né và +10 nộ riêng, người xả về 0 một lần. | Đã chốt |  |
| Hồi máu | Hồi/lượt là số cố định, hồi ngay sau khi chính đơn vị đó ra đòn xong, đơn vị chết không hồi. Hồi theo %: tính trên máu tối đa của người được hồi. | Đã chốt |  |
| Khiên | Mỗi lần xả skill tạo 1 khiên (% máu tối đa của người xả). Sát thương trừ khiên trước. Vỡ khi bị đánh vượt giá trị khiên hoặc sau 2 lượt. | Đã chốt | Xả lại khi khiên cũ còn: làm mới, không cộng dồn (mặc định tạm, anh chưa xác nhận). |
| 'Chậm 1 lượt' | Nếu lượt đó chưa ra đòn thì mất đòn. Đã ra đòn rồi thì chỉ chịu hiệu ứng phụ (trừ nộ, giảm tốc). | Đã chốt |  |
| Cách đếm thời lượng | Hiệu ứng N lượt: lượt hiện tại tính là lượt thứ nhất. Nếu người nhận đã ra đòn rồi thì coi như mất 1 lượt, chưa ra đòn thì được lượt này cộng lượt kế (với hiệu ứng 2 lượt). | Đã chốt | Anh nêu cho Điên tiết. Claude áp dụng chung cho mọi hiệu ứng N lượt (khớp với khiên hết sau 2 lượt), anh sửa nếu khác. |
| 10 chỉ số | Máu, Công, Thủ, Tốc độ, Hồi máu/lượt, Né, Chính xác, Tỷ lệ chí mạng, Sát thương chí mạng, Kháng chí mạng. Né và tỷ lệ chí mạng giữ dưới 10%. | Đã chốt |  |
| Công thức né, chí mạng | Né hiệu dụng = Né − Chính xác (sàn 0%, trần 60%). Chí mạng hiệu dụng = Tỷ lệ chí mạng − Kháng chí mạng (sàn 0%, trần 75%). Sát thương chí mạng mặc định 150%. | Tạm | Anh đồng ý tạm, sẽ chỉnh khi mất cân bằng. |
| Công thức sát thương | Công × 100 / (100 + Thủ). Skill Trắng gây 200% công lên 1 mục tiêu. | Tạm |  |
| Khiêu khích | Địch buộc đánh người khiêu khích (đòn thường và skill 1 mục tiêu), 1 lượt. Skill nhiều mục tiêu không bị ảnh hưởng. Nhiều người khiêu khích: địch random giữa họ. Choáng hoặc đóng băng người khiêu khích thì mất tác dụng. | Tạm | Anh đã chốt là có hiệu ứng này; quy tắc chi tiết là đề xuất của Claude. |

## 4. Main và mini-game

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Vai trò main | Main không tham chiến, đứng góc, chỉ cổ vũ và buff. | Đã chốt |  |
| Nhịp mini-game | Ở lượt 1, 4, 7, 10, 13. Loại mini-game do gacha quyết định, người chơi không chọn. Mỗi game gắn một loại buff/debuff riêng. Kết quả hoàn toàn do tay người chơi. | Đã chốt | Ví dụ: căn lực, trả lời câu hỏi, ghép chữ. |
| 4 mức kết quả | Trượt (không buff, còn bị debuff), đạt, hay, tuyệt vời. Game khó thì buff tuyệt vời mạnh hơn. Buff tồn tại 1-3 lượt. | Đã chốt | Tỷ lệ anh tính lại khi chạy thật. |
| Chuỗi trượt | Trượt liên tiếp thì debuff tăng tầng (ví dụ giảm tốc độ toàn đội 5% rồi 7,5%). Trần 3 tầng, lần trượt thứ 4, 5 giữ tầng 3. Đạt thì về 0. Auto tính chung chuỗi với chơi tay. | Đã chốt |  |
| Đổi game | Mỗi mini-game được đổi 1 lần. | Đã chốt | Chưa chốt: đổi có tốn gì không, auto có được tự đổi không. |
| Auto | Tỷ lệ luôn thấp hơn chơi tay (trượt nhiều hơn đạt), nâng cấp được để tăng tỷ lệ. | Đã chốt |  |
| Còn mở | Tỷ lệ 4 mức, bảng mini-game × buff/debuff, debuff tồn tại mấy lượt, chuỗi trượt có giữ qua trận mới không. | Chưa chốt |  |
| Mini-game để đợt sau | Đợt này không có mini-game. Main đứng góc cổ vũ (chỉ là hình), có thể thêm khoảng 10 pose cho main nam và nữ (cổ vũ, khóc, hô hào...). | Đã chốt | Mini-game và buff của main chuyển sang đợt sau. |

## 5. Phẩm chất và skill

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 5 phẩm chất | Trắng, Xanh lá, Xanh dương, Tím, Đỏ. Mỗi người đều có đủ 5, vai trò đi theo người. | Đã chốt |  |
| Tăng theo bậc | Xanh lá: tăng chỉ số và độ lớn skill. Xanh dương: thêm nội tại. Tím: tăng chỉ số, skill, nội tại. Đỏ: tăng tất cả và đổi skill gốc thành skill hoành tráng, nội tại giữ loại hiệu ứng chỉ tăng độ lớn. | Đã chốt |  |
| Biểu diễn skill | Mỗi skill gồm nhiều thành phần (sát thương, khiên, hồi, trạng thái...), phẩm chất cao tăng dame và thêm hiệu ứng. Skill là phần gia vị anh đầu tư. | Đã chốt | Sheet SKILL_THÀNH_PHẦN. |
| Phép và Vật lý | Vật lý: 1 mục tiêu, dame lớn. Phép: nhiều mục tiêu, dame nhỏ kèm hiệu ứng nhẹ. Phép từ 2 mục tiêu đến toàn bộ (toàn bộ ở Đỏ). | Đã chốt | Không thêm chỉ số riêng, đây là phong cách skill. |
| Bậc thang mục tiêu của Phép | Demo: Trắng 2, Xanh lá 2, Xanh dương 3 mục tiêu; sát thương mỗi mục tiêu ×1,10 / ×1,2 / ×1,3 (số của anh). | Tạm | Xanh dương tổng 3,9 công (3 × 1,3), cao hơn khoảng 35% so với bậc thang đề xuất (khoảng 2,9). Phép toàn bộ đẩy nhanh nộ hàng sau của địch. |
| Hệ số theo phẩm chất | Máu, Công, Thủ, Hồi máu nhân 1,00 / 1,15 / 1,30 / 1,50 / 1,75. Tốc độ cộng 0 đến 4, các tỷ lệ cộng 0 đến 2 điểm. | Tạm | SỐ GIẢ. Anh từng nghĩ Đỏ có thể gấp rất nhiều lần; sửa ở HỆ_SỐ_PHẨM_CHẤT. |
| Số skill theo anh | Anh tự chỉnh số trong SKILL_MÔ_TẢ: khiên Tank A 10/12/15%, Tank B 7/9/11%, hồi Hỗ trợ A 18/22/22%, Vật lý ×2,0 đến ×2,4, Sát thủ ×1,70/1,8/1,85, Phép ×1,10/1,2/1,3. Game đọc số từ SKILL_THÀNH_PHẦN, phải khớp với SKILL_MÔ_TẢ. | Đã chốt | Thay cho số ngân sách của Claude (khiên 12%, hồi 18-22%) và ví dụ 5%. |
| Xác suất hiệu ứng phụ | Anh dùng 10% cho choáng, đóng băng, làm chậm, Điên tiết (Hít Sâu 20%, trừ nộ của Sát thủ 50%). Hiệu ứng phụ thường mở từ Xanh dương. | Đã chốt | Anh dùng 10% thay vì 5% ví dụ, Claude coi như đã chốt. |
| Chi tiết skill đã xác nhận | Hít Sâu (Phép A): tung xác suất 20% ở cuối lượt, sau khi ra đòn. Chốt Hạ (Sát thủ): hồi 50 nộ chỉ khi SKILL NỘ (Mũi Dao Sau Lưng, 1 mục tiêu) hạ gục địch, đòn thường thì không. Vật lý A (Nhát Cắt Dứt Điểm): ×2,0 / 2,2 / 2,4. | Đã chốt | Anh xác nhận. Vật lý A trước đó gõ nhầm ×2,2 ở Xanh dương. |
| Điểm còn hiểu theo mô tả | Chốt Hạ: +20% sát thương lên mục tiêu máu dưới 30% áp dụng cho cả đòn thường lẫn skill. Phép Xanh dương: đóng băng thay cho làm chậm (làm chậm chỉ ở Xanh lá). | Tạm | Claude hiểu theo mô tả của anh, chưa hỏi lại. Sửa trong SKILL_THÀNH_PHẦN nếu khác. |
| Skill Anh Lâm (NV09) | Gây ×2,0 / 2,2 / 2,4 công lên 1 địch hàng trước bất kỳ và 1 địch ngay sau (nếu có), Xanh dương thêm 10% choáng. Nội tại: 30% có Điên tiết (2 lượt) sau khi xả skill. | Đã chốt | Anh xác nhận ×2,0 / 2,2 / 2,4 áp cho MỖI mục tiêu (tổng 200 điểm ngân sách, cao hơn khung 120). |
| Skill Bích Thích Chan (NV11) | Gây ×1,0 / 1,2 / 1,5 công lên 2 địch ngẫu nhiên, có 20% / 22% / 25% Ru ngủ mục tiêu trúng. Nội tại (Xanh dương): 20% hồi sinh 1 đồng đội đã gục (còn 20% máu tối đa), chỉ 1 lần mỗi trận. | Đã chốt | Anh xác nhận: 'kill 2 kẻ địch' là gây sát thương; hồi sinh tung ở cuối lượt sau khi ra đòn. |

## 6. Khung vai trò

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Chuẩn Trắng | Máu 1000, Công 100, Thủ 40, Tốc độ 100, Hồi máu 15. | Đã chốt |  |
| 5 vai và khoảng chỉ số | Tank, Vật lý, Phép, Hỗ trợ, Sát thủ. Khoảng hệ số từng vai xem sheet KHUNG_VAI_TRÒ. | Đã chốt |  |
| Cách làm | Cách lai: anh chốt khung vai trò, Claude điền số trong khung, anh sửa. | Đã chốt |  |
| Ngân sách skill | 100 điểm = ×2,0 công lên 1 mục tiêu = 20% máu chuẩn. Tank 60, Vật lý 100, Phép 110 (tối đa 120 ở 3 mục tiêu), Hỗ trợ 100, Sát thủ 90. | Tạm | Giả định sát thương = hồi = khiên ngang giá, chưa kiểm. Hiệu ứng trạng thái và buff chưa quy được ra điểm. |
| Hai vai kết hợp | Tank-Vật lý: máu 1,1-1,3, công 0,8-1,0, thủ 1,1-1,4, tốc độ 0,8-0,95, ngân sách 120. Phép-Buff: máu 0,8-1,0, công 0,75-1,0, thủ 0,8-1,1, tốc độ 1,1-1,2, ngân sách 110. | Đã chốt | Anh xác nhận (khung do Claude đề xuất, sửa ở KHUNG_VAI_TRÒ nếu cần). |

## 7. Hiệu ứng trạng thái

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Ví dụ của anh | Choáng (mất đòn, −20 nộ), Đóng băng (mất đòn, −10% tốc độ lượt sau), Điên tiết (+2% mọi chỉ số, thay cho 'nộ'). | Chưa chốt | Anh bảo bàn kỹ sau khi xong mô tả nhân vật. |
| Do Claude thêm | Khiêu khích, Làm chậm (−10% tốc độ, 1 lượt), Ngủ (mất đòn, tỉnh khi bị đánh). | Tạm | Ngủ chưa dùng ở demo. |
| Thước đo quy đổi | Quy theo % máu. Hướng đang nghiêng: quy ra % máu của một đơn vị chuẩn cùng phẩm chất, rồi kiểm lại bằng mô phỏng. | Tạm |  |
| Còn mở | Điên tiết (kéo dài 2 lượt, xác suất 10% ở skill Tính Tiền Hồi Phục Xanh dương): có cộng dồn không, máu hiện tại có tăng theo máu tối đa không. Thời lượng các hiệu ứng khác. | Chưa chốt |  |
| Ru ngủ | Mất 1 lượt đánh, giảm 5% tốc độ và giảm 5% tấn công của đối thủ (hiệu ứng bất lợi). | Đã chốt | Anh xác nhận: phần giảm 5% kéo dài 1 lượt. Hiệu ứng 'Ngủ' đề xuất cũ giữ lại, chưa dùng ở demo. |

## 8. Hình ảnh và chuyển động

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Người làm | Anh tự làm hình song song với việc dựng game. Hình và hiệu ứng skill chỉnh sau được. | Đã chốt |  |
| Pose cần | Chỉ chính diện, 1 bộ pose dùng chung cho cả 3 phẩm chất: đứng, ra skill, bị đánh, gục, cộng 1 ảnh thẻ. Không cần góc nghiêng, góc lưng. | Tạm |  |
| Quy cách | PNG nền trong suốt 512×512, nhân vật khoảng 80% khung, chân chạm cùng một đường đáy ở mọi pose, không vẽ dính bóng, chữ, sao. Tạo cả dải pose trong một lần. | Tạm | Nếu không có nền trong suốt thì dùng nền phẳng một màu, tách nền bằng code chưa chắc đẹp. |
| Mức khối lượng ảnh | Mức 1 tối thiểu (khoảng 21 ảnh), mức 2 (khoảng 55), mức 3 (khoảng 90). | Chưa chốt | Mặc định mức 1. |
| Chuyển động | Chuyển động bằng code kèm hiệu ứng che chỗ đổi ảnh (lùi lấy đà, lao tới, đổi ảnh lúc va chạm, rung khi bị đánh). Không phải hoạt hình thật. | Tạm | Cắt cứng giữa hai ảnh sẽ trông như robot. |
| Hiệu ứng | Ánh sáng, tia va chạm, số sát thương, sao choáng, Zzz, khiên dựng bằng code. Anh chỉ cần làm khối băng và biểu tượng khiêu khích nếu muốn đẹp hơn. | Tạm |  |
| Lưu ý chữ trên áo | Nhân vật nữ đã tạo bị ra chữ GAMA thay vì GOMA ở cả 3 pose. | Tạm | Sửa tay hoặc tạo áo trơn rồi ghép logo bằng code. |

## 9. Vấn đề đang treo

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| Chồng buff nhỏ thành rất mạnh | Đo thử: Thủ kho Xanh dương bị 5 địch công 100 tập trung đánh (có khiêu khích), có khiên + nội tại hồi 1% mỗi đòn + Hỗ trợ hồi 22% thì sống hết 15 lượt, còn 78% máu. Địch công 140 thì chết ở lượt 15, nhưng thêm buff +20% mọi chỉ số thì còn 74%. | Treo | Nguyên nhân: vòng phản hồi (bị đánh nhiều thì hồi nhiều, nộ nhiều), khiêu khích dồn hết đòn về một người. Mô hình đơn giản (đòn nào cũng trúng, không chí mạng, địch không có choáng hay xuyên giáp). |
| Hướng sửa chồng buff | A: nội tại hồi theo đòn tối đa 2 lần mỗi lượt (còn 51%). B: trần hồi tổng mọi nguồn mỗi lượt (10% thì còn 52%, nhưng kẹp cả hồi skill). C: phản đòn từ địch (debuff giảm hồi, xuyên giáp, trùm). Kèm: buff % chỉ số chỉ áp lên công, tốc độ hoặc tối đa 5%. | Treo | Anh chưa chọn. Claude nghiêng A cộng giới hạn buff, C cho trùm. |
| Cách cân bằng | Các con số trong file chỉ là HỖ TRỢ, chưa cân. Cách 1: script kiểm chồng buff. Cách 2: nâng mô phỏng đọc skill, chạy 5v5. Cách 3: cho người chơi thử, kèm vài núm chỉnh toàn cục (hệ số hồi, sát thương địch, trần hồi, trần buff). | Treo | Anh chưa chọn. Claude nghiêng cách 3 kèm cách 1, cách 2 để dành cho đợt 24 giờ. |
| Gacha đầy đủ | Tỷ lệ từng phẩm chất, mảnh nâng cấp, bảo hiểm, cùng một người ở nhiều phẩm chất có vào chung đội không. | Chưa chốt | Để ngồi tính riêng sau demo. |

## Mười tướng (chỉ số bản Trắng; tên skill là TẠM)

| Mã | Tên | Vai | Hàng | Máu | Công | Thủ | Tốc độ | Hồi/lượt | Skill nộ | Nội tại |
|---|---|---|---|---|---|---|---|---|---|---|
| NV01 | HCM-THỦ KHO HIẾU | Tank | Hàng trước | 1500 | 65 | 64 | 88 | 24 | Khiên Kho | Hồi Sức Kho |
| NV02 | HN-PHỤ KHO HƯNG | Tank | Hàng trước | 1350 | 75 | 56 | 92 | 20 | Tiếng Gọi Cửa Kho | Gai Thép |
| NV03 | HCM-PHỤ KHO VŨ | Vật lý | Hàng sau | 820 | 140 | 36 | 97 | 10 | Nhát Cắt Dứt Điểm | Máu Chiến |
| NV04 | HCM-SALE THẢO | Vật lý | Hàng sau | 880 | 130 | 34 | 101 | 10 | Cú Đập Cuộn Thảm | Hứng Khởi |
| NV05 | HCM-SALE DƯƠNG | Phép | Hàng sau | 880 | 108 | 36 | 105 | 12 | Bão Bụi Thảm | Hít Sâu |
| NV06 | HCM-SALE DUYÊN | Hỗ trợ | Hàng sau | 1000 | 70 | 40 | 109 | 18 | Tính Tiền Hồi Phục | Tiếp Sức |
| NV07 | HCM-KẾ TOÁN THU | Hỗ trợ | Hàng sau | 950 | 75 | 44 | 113 | 16 | Lời Cổ Vũ Đầu Giờ | Đồng Cam |
| NV08 | HCM-SALE NHÂN | Sát thủ | Hàng sau | 760 | 130 | 28 | 121 | 8 | Mũi Dao Sau Lưng | Chốt Hạ |
| NV09 | HCM-PHỤ KHO ANH LÂM | TANK-VẬT LÝ | Hàng trước | 1200 | 90 | 50 | 85 | 20 | Xe Nâng Đến Rồi | Nóng Máu |
| NV11 | HCM- BÍCH THÍCH CHAN | Phép-BUFF | Hàng sau | 900 | 85 | 38 | 117 | 14 | Ru Bé Ngủ | Hồi Hồn |

## Khung vai trò (hệ số so với chuẩn Trắng: máu 1000, công 100, thủ 40, tốc độ 100)

| Vai trò | Máu | Công | Thủ | Tốc độ | Kiểu skill | Ngân sách |
|---|---|---|---|---|---|---|
| Tank | 1.3-1.5 | 0.6-0.8 | 1.3-1.7 | 0.85-0.95 | khiên, hồi, giảm sát thương, khiêu khích | 60 |
| Vật lý | 0.75-0.9 | 1.3-1.5 | 0.8-1 | 0.95-1.05 | 1 mục tiêu, dame lớn | 100 |
| Phép | 0.8-0.95 | 1-1.15 | 0.8-1 | 1-1.1 | 2 đến toàn bộ mục tiêu, dame nhỏ + hiệu ứng nhẹ | 110 |
| Hỗ trợ | 0.9-1.1 | 0.6-0.8 | 0.9-1.1 | 1.05-1.15 | hồi, buff, hồi nộ | 100 |
| Sát thủ | 0.7-0.85 | 1.2-1.4 | 0.6-0.8 | 1.15-1.3 | 1 mục tiêu hàng sau hoặc máu thấp | 90 |
| Tank-Vật lý | 1.1-1.3 | 0.8-1 | 1.1-1.4 | 0.8-0.95 | 2 mục tiêu liền nhau (hàng trước + ngay sau), dame vừa + choáng, tự buff Điên tiết | 120 |
| Phép-Buff | 0.8-1 | 0.75-1 | 0.8-1.1 | 1.1-1.2 | 2 mục tiêu, dame nhỏ + khống chế (Ru ngủ), nội tại hồi sinh | 110 |

## Quái và boss (BẢN NHÁP)

| Mã | Quái | Loại | Map | Hàng | Máu | Công | Thủ | Tốc độ | Skill | Nội tại |
|---|---|---|---|---|---|---|---|---|---|---|
| Q01 | Chuột | Thường | 1 | Hàng trước | 450 | 65 | 10 | 100 | Đủ 100 nộ: gây ×2,0 công lên 1 địch. |  |
| Q02 | Mèo hoang | Thường | 1 | Hàng trước | 1000 | 100 | 40 | 105 | Đủ 100 nộ: gây ×2,0 công lên 1 địch hàng sau ngẫu nhiên. |  |
| Q03 | Thảm mốc | Tinh anh | 1 | Hàng trước | 1500 | 70 | 80 | 80 | Đủ 100 nộ: gây ×0,8 công lên 2 địch ngẫu nhiên, mỗi mục tiêu 40% bị Làm chậm 1 lượt. |  |
| Q04 | Đại ca mèo | Boss | 1 | Hàng trước | 4000 | 110 | 45 | 110 | Đủ 100 nộ: gây ×1,3 công lên 3 địch ngẫu nhiên, mỗi mục tiêu 30% bị Làm chậm 1 lượt. | Khi đồng đội gục, cả đội +15 nộ. |
| Q05 | Khách khó tính | Boss | 2 | Hàng trước | 6000 | 120 | 60 | 108 | Đủ 100 nộ: gây ×1,4 công lên 2 địch ngẫu nhiên, 60% trừ thêm 25 nộ mỗi mục tiêu. | Cuối lượt: 20% hồi 5% máu tối đa cho bản thân. |
| Q06 | Trợ lý nam ác | Thường | 2 | Hàng sau | 900 | 110 | 40 | 112 | Đủ 100 nộ: gây ×1,8 công lên 1 địch hàng sau ngẫu nhiên, 15% Choáng. |  |
| Q07 | Trợ lý nữ ác | Thường | 2 | Hàng sau | 800 | 100 | 35 | 118 | Đủ 100 nộ: gây ×1,0 công lên 2 địch ngẫu nhiên và trừ 30 nộ mỗi mục tiêu. | Khi đồng đội gục, cả đội +20 nộ. |
| Q08 | Chó dữ | Thường | 2 | Hàng trước | 1100 | 120 | 30 | 115 | Đủ 100 nộ: gây ×2,2 công lên 1 địch, 40% Làm chậm 1 lượt. |  |
| Q09 | Đối tác dự án lớn | Boss | 2 | Hàng trước | 7000 | 100 | 55 | 105 | Đủ 100 nộ: gây ×1,5 công lên 3 địch ngẫu nhiên và trừ 20 nộ mỗi mục tiêu. | Khi xả skill: tạo khiên 12% máu tối đa (2 lượt). |
| Q10 | Bảo vệ | Thường | 3 | Hàng trước | 1800 | 90 | 90 | 85 | Đủ 100 nộ: Khiêu khích 1 lượt (địch buộc đánh người này) và tạo khiên 10% máu tối đa 2 lượt. | Khi bị đánh trúng, phản 10% sát thương nhận vào. |
| Q11 | Siêu đối tác dự án | Tinh anh | 3 | Hàng trước | 9000 | 115 | 65 | 108 | Đủ 100 nộ: gây ×1,3 công lên 3 địch ngẫu nhiên, mỗi mục tiêu 20% Ru ngủ. | Khi xả skill: tạo khiên 10% máu tối đa (2 lượt). |
| Q12 | Siêu giám đốc khó tính | Boss | 3 | Hàng trước | 12000 | 110 | 70 | 110 | Đủ 100 nộ: gây ×1,2 công lên 3 địch ngẫu nhiên, mỗi mục tiêu 25% Ru ngủ và trừ 20 nộ. | Khi đồng đội gục, cả đội +20 nộ. Khi xả skill: tạo khiên 10% máu tối đa (2 lượt). |

## 30 màn (hệ số map 1 do mô phỏng; map 2, 3 chưa hiệu chỉnh)

| Map | Màn | Tên | Quái | Loại | Hệ số máu | Hệ số công | Đội | Thắng MP | Lượt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | Chuột vào kho | Q01×2 | Thường | 1.46 | 1.28 | 2 | 0.97 | 10.8 |
| 1 | 2 | Đàn chuột | Q01×3 | Thường | 1.69 | 1.41 | 3 | 0.95 | 10.1 |
| 1 | 3 | Mèo hoang ghé thăm | Q02×1; Q01×2 | Thường | 1.28 | 1.17 | 3 | 0.92 | 11.1 |
| 1 | 4 | Hai mèo, một chuột | Q02×2; Q01×1 | Thường | 1.54 | 1.32 | 4 | 0.9 | 12.2 |
| 1 | 5 | Thảm mốc lộ diện | Q03×1; Q01×2 | Tinh anh | 1.27 | 1.16 | 4 | 0.88 | 12.2 |
| 1 | 6 | Mèo canh thảm mốc | Q02×2; Q03×1 | Thường | 1.29 | 1.17 | 5 | 0.85 | 13 |
| 1 | 7 | Ổ mốc | Q03×2; Q01×2 | Tinh anh | 1.04 | 1.02 | 5 | 0.85 | 12.7 |
| 1 | 8 | Băng mèo | Q02×3; Q01×1 | Thường | 1.65 | 1.39 | 5 | 0.81 | 13.3 |
| 1 | 9 | Kho thất thủ | Q03×2; Q02×2 | Tinh anh | 0.88 | 0.93 | 5 | 0.81 | 13.1 |
| 1 | 10 | Đại ca mèo | Q04×1; Q02×2; Q01×2 | Boss | 0.87 | 0.92 | 5 | 0.59 | 14.1 |
| 2 | 1 | Tiếp khách đầu tiên | Q06×1; Q08×1 | Thường |  |  |  |  |  |
| 2 | 2 | Trợ lý hai mặt | Q06×1; Q07×1 | Thường |  |  |  |  |  |
| 2 | 3 | Chó giữ cửa | Q08×2; Q07×1 | Thường |  |  |  |  |  |
| 2 | 4 | Trợ lý bắt tay chó | Q06×1; Q07×1; Q08×1 | Thường |  |  |  |  |  |
| 2 | 5 | Khách khó tính | Q05×1; Q06×1; Q07×1 | Boss |  |  |  |  |  |
| 2 | 6 | Bàn đàm phán | Q08×2; Q06×1; Q07×1 | Thường |  |  |  |  |  |
| 2 | 7 | Chó dữ nhà khách | Q08×3; Q07×1 | Thường |  |  |  |  |  |
| 2 | 8 | Trợ lý đồng lòng | Q06×2; Q07×2 | Thường |  |  |  |  |  |
| 2 | 9 | Chê giá | Q05×1; Q08×2; Q07×1 | Tinh anh |  |  |  |  |  |
| 2 | 10 | Đối tác dự án lớn | Q09×1; Q06×1; Q07×1; Q08×1 | Boss |  |  |  |  |  |
| 3 | 1 | Cổng công ty khách | Q10×2; Q06×1 | Thường |  |  |  |  |  |
| 3 | 2 | Bảo vệ và trợ lý | Q10×1; Q06×1; Q07×1 | Thường |  |  |  |  |  |
| 3 | 3 | Sảnh đá cẩm thạch | Q10×2; Q07×2 | Thường |  |  |  |  |  |
| 3 | 4 | Thang máy | Q10×2; Q06×2; Q08×1 | Thường |  |  |  |  |  |
| 3 | 5 | Siêu đối tác dự án | Q11×1; Q10×2 | Boss |  |  |  |  |  |
| 3 | 6 | Hành lang phòng ban | Q10×2; Q06×1; Q07×2 | Thường |  |  |  |  |  |
| 3 | 7 | Phòng chờ | Q08×2; Q10×1; Q07×2 | Thường |  |  |  |  |  |
| 3 | 8 | Trợ lý cấp cao | Q06×2; Q07×2; Q10×1 | Tinh anh |  |  |  |  |  |
| 3 | 9 | Trước cửa phòng giám đốc | Q11×1; Q10×2; Q07×1 | Tinh anh |  |  |  |  |  |
| 3 | 10 | Siêu giám đốc khó tính | Q12×1; Q11×1; Q10×1; Q07×1 | Boss |  |  |  |  |  |

## Số đo mô phỏng engine

```
=== Đội 5 tướng ngẫu nhiên, TẤT CẢ bậc Trắng (300 đội × 3 chặng) ===
Kho thảm – trận 1                    thắng 100.0% | lượt TB 7.3
Kho thảm – trận 2                    thắng 87.0% | lượt TB 12.8
Kho thảm – trùm: Khách khó tính      thắng 34.3% | lượt TB 14.7

=== Đội 5 tướng ngẫu nhiên, TẤT CẢ bậc Xanh lá (300 đội × 3 chặng) ===
Kho thảm – trận 1                    thắng 100.0% | lượt TB 6.2
Kho thảm – trận 2                    thắng 100.0% | lượt TB 9.9
Kho thảm – trùm: Khách khó tính      thắng 75.7% | lượt TB 13.5

=== Đội 5 tướng ngẫu nhiên, TẤT CẢ bậc Xanh dương (300 đội × 3 chặng) ===
Kho thảm – trận 1                    thắng 100.0% | lượt TB 5.2
Kho thảm – trận 2                    thắng 100.0% | lượt TB 8.0
Kho thảm – trùm: Khách khó tính      thắng 93.3% | lượt TB 11.5

=== Kịch bản chồng buff: tank + khiêu khích + hồi vs 5 địch tập trung ===
địch công 100: Thủ kho còn sống cuối trận 100% (máu còn TB 87%) | tướng gục TB 0.00/5
địch công 140: Thủ kho còn sống cuối trận 100% (máu còn TB 53%) | tướng gục TB 0.99/5
địch công 180: Thủ kho còn sống cuối trận 3% (máu còn TB 10%) | tướng gục TB 2.02/5
```
