/* GOMA_CONFIG: mọi số tạm của giao diện để ở đây cho dễ chỉnh. */
window.GOMA_CONFIG = {
  maxMap: 8,                     // map cao nhất đang mở (1..8). Map 3 đến 8 đã có dữ liệu; mở khi đã hiệu chỉnh. Xem trước: ?maxmap=8
  enableMap23: false,            // (cũ) true = mở tất cả map
  enableMap2: true,              // GIẢ ĐỊNH: mở Map 2 vì anh nhắc "màn 2.x" (xem README)
  ticketMinutes: 10, ticketMax: 20, quickChoices: [1, 5, 10, 20],   // Thẻ đặc quyền: 10 phút +1 thẻ, tối đa 20; 1 thẻ = đánh nhanh 1 trận đã thắng
  cloud: { url: 'https://script.google.com/macros/s/AKfycbz8zXhoOCCezFPLdavzSj0JMH6AtW20L9iZNLzYiPpbqwm7Jjm8cJmDZhrQ4JEnvGTx/exec', autosaveMinutes: 3 },   // lưu game lên Google Sheet: dán URL Web App (xem cloud/HUONG_DAN.md) vào url; để trống = tắt, game lưu trong trình duyệt như cũ
  dailyGiftPulls: 10,            // quà đăng nhập đầu tiên mỗi ngày: +10 lượt quay
  dailyWinLimit: 30,             // tối đa số lần THẮNG mỗi màn / ngày (chống cày gacha)
  pullFirstClear: 1,             // thắng lần đầu một màn: +1 lượt quay
  dropNearRange: 2,              // đánh lại các màn cách tiền tuyến (màn xa nhất đã mở) tối đa 2 màn: tỉ lệ rớt huy hiệu cao
  dropRateNear: 0.30,            // 30% rớt thẻ gacha (= 1 lượt quay) ở max-1, max-2
  dropMidRange: 12,              // max-3 .. max-12 dùng dropRateMid
  dropRateMid: 0.10,             // 10% ở max-12 .. max-3
  dropRateFar: 0.035,            // 3,5% ở max-13 trở về trước (quái yếu, thông map nhanh)
  shardsByTier: [1, 5, 10, 20],  // mảnh nhận được khi rút trúng tướng ĐÃ CÓ: Trắng 1, Xanh lá 5, Xanh dương 10, Tím 20
  mergeCost: [12, 35, 80, 200],  // mảnh cần để lên bậc kế (Trắng->Lá, Lá->Dương, Dương->Tím, Tím->Đỏ), cần thêm chính tướng ở bậc hiện tại
  gachaWeightsEarly: [62, 28, 10],  // trước khi thắng màn 2.6: Trắng/Xanh lá/Xanh dương (Xanh dương KHÔNG còn bị chặn); chưa ra Tím/Đỏ
  gachaWeightsTop: [60, 24, 10, 5, 1],   // sau khi thắng 2-6: Trắng 60 / Lá 24 / Dương 10 / Tím 5 / Đỏ 1 (tỉ lệ bình thường)
  topUnlockLevel: { map: 2, man: 6 },     // mốc mở Tím/Đỏ (trước đây 3-10)
  vipShare: 0.20,                // ra Tím: 20% là VIP bản Xanh dương; ra Đỏ: 20% là VIP bản Tím (cả gacha lẫn ô Tím/Đỏ trong shop)
  honorPerPull: 1,               // mỗi lượt quay trả về 1 thẻ bài danh dự = 1 huân công
  shop: { resetHours: 5, prices: [5, 30, 70, 170, 500], exchangeNormal: 2, exchangeVip: 3 },   // giá (huân công) ô Trắng/Lá/Dương/Tím/Đỏ; đổi mảnh 2 -> 1 tướng thường, 3 -> 1 tướng VIP
  enemyHpMul: 0.80,               // máu quái nhân 0,9 (nhân thêm vào hpMul của từng màn; không sửa Excel/engine)
  knobs: { enemyDmgMul: 1.4, heroDmgMul: 1.35 },   // núm cân bằng của engine (không đổi luật): sát thương quái x1,3 (Vòng 35: 1,2 → 1,3 theo yêu cầu)
  maxTurns: 20,                  // số lượt tối đa mỗi trận (engine mặc định 15, UI ghi đè lên E.K.MAX_TURNS; không sửa engine.js)
  difficulty: {                  // CÔNG THỨC ĐỘ KHÓ (Vòng 29-30), áp cho Map 2 trở đi. Hệ số nền + mốc neo: ui/difficulty_base.js (do calibrate_difficulty.py sinh ra).
    // THƯỚC ĐO: thắng ~25-30% = "vừa đủ qua" (người chơi đánh lại nhiều lần); 50-60% = "dư sức".
    passRate: 30,                // % thắng của ĐỘI TỐI THIỂU tại mỗi mốc neo
    anchors: { '2-7': '5G', '2-10': '1B4G', '3-10': '4B1G', '4-10': '1P4B', '5-10': '3P2B', '6-10': '5P', '7-10': '3R2P', '8-10': '5R' },   // mốc neo: màn -> đội TỐI THIỂU để qua (G Xanh lá, B Xanh dương, P Tím, R Đỏ)
    fallback: { '2-7': 1.1, '2-10': 1.2, '3-10': 1.55, '4-10': 1.8, '5-10': 2.05, '6-10': 2.25, '7-10': 2.5, '8-10': 2.8 },   // dùng khi chưa chạy công cụ đo
    f0: 0.78,                    // F của màn 2-1 (đội 5 xanh lá thắng ~80%)
    earlyShare: 0.30,            // Map 3 trở đi: màn 1..7 chỉ chiếm 30% mức tăng của map, 70% dồn vào màn 8, 9, 10 (bức tường)
    wallShare: [0.5, 0.3, 0.2],  // phần tăng còn lại chia cho màn 8, 9, 10
    startBump: 1.0,              // màn 1 của map sau = màn 10 của map trước x hệ số này (user: 4-1 bằng 3-10)
    bossBump: 0.04,              // boss giữa map (màn 5) khó hơn +4%
    split: 0.5,                  // hệ số quái chia cho máu / công: máu = m^split, công = m^(1-split)
    mul: 1,                      // NÚM TOÀN CỤC: nhân độ khó (sau này có buff/đồ/hiệu ứng thì chỉnh ở đây, hoặc ?diff=1.1 để thử)
  },
  mapBalance: {                  // Map 2 trở đi luôn đủ 5 quái (độn quái Thường). Hệ số máu/công do công thức difficulty tính
    2: { monsters: 5 }, 3: { monsters: 5 }, 4: { monsters: 5 }, 5: { monsters: 5 }, 6: { monsters: 5 }, 7: { monsters: 5 }, 8: { monsters: 5 },
  },
  speeds: [1, 2, 4],
  defaultSpeed: 1,
  heroBodyPx: 175,               // chiều cao thân tướng trong trận (px, khung 1920x1080)
  skillPoseScale: 1.2,   // ảnh tung skill to thêm 20% so với bình thường
  monsterScale: { Q13: 0.9, Q14: 0.7, Q15: 1.0, Q16: 1.4, Q17: 1.4, Q18: 1.0, Q19: 0.8, Q20: 0.9, Q21: 1.5, Q22: 1.45, Q23: 0.9, Q24: 1.0, Q25: 0.9, Q26: 1.5, Q27: 1.4, Q28: 1.1, Q29: 0.95, Q30: 1.0, Q31: 1.5, Q32: 1.4, Q33: 0.9, Q34: 1.1, Q35: 0.95, Q36: 1.5, Q37: 1.7, Q01: 0.45, Q02: 0.65, Q03: 0.8, Q04: 1.3, Q05: 1.2, Q06: 1.0, Q07: 1.0, Q08: 0.75, Q09: 1.35, Q10: 1.1, Q11: 1.35, Q12: 1.5 },
  lanesY: [710, 865, 1020],       // đường đáy (chân) 3 làn, đã hạ xuống để đứng trên nền sàn (spec cũ 640/760/880 làm nhân vật lơ lửng)
  heroX: { front: 880, back: 512 },
  enemyX: { front: 1150, back: 1526 },
  main: { x: 150, footY: 1050, h: 300 },
  teamMax: 5,
  mainPoseMs: 1200,              // mỗi pose cổ vũ của main giữ bao lâu rồi về idle
  maxTierDebug: 2,
  maxTier: 4,                    // 0 Trắng, 1 Xanh lá, 2 Xanh dương, 3 Tím, 4 Đỏ
};
