/* GOMA_CONFIG: mọi số tạm của giao diện để ở đây cho dễ chỉnh. */
window.GOMA_CONFIG = {
  enableMap23: false,            // true thì mở cả Map 3 (chưa hiệu chỉnh cân bằng)
  enableMap2: true,              // GIẢ ĐỊNH: mở Map 2 vì anh nhắc "màn 2.x" (xem README)
  pullFirstClear: 1,             // thắng lần đầu một màn: +1 lượt quay
  dropNearRange: 2,              // đánh lại các màn cách tiền tuyến (màn xa nhất đã mở) tối đa 2 màn: tỉ lệ rớt huy hiệu cao
  dropRateNear: 0.20,            // 20% rớt huy hiệu (= 1 lượt quay) ở các màn gần tiền tuyến
  dropRateFar: 0.05,             // 5% ở các màn cũ hơn
  shardsByTier: [1, 5, 10, 20],  // mảnh nhận được khi rút trúng tướng ĐÃ CÓ: Trắng 1, Xanh lá 5, Xanh dương 10, Tím 20
  mergeCost: [12, 35, 80, 200],  // mảnh cần để lên bậc kế (Trắng->Lá, Lá->Dương, Dương->Tím, Tím->Đỏ), cần thêm chính tướng ở bậc hiện tại
  gachaWeightsEarly: [70, 30, 0],   // trước khi thắng màn 2.6: chỉ ra Trắng/Xanh lá
  gachaWeightsLate: [66, 29, 5],    // sau khi thắng màn 2.6: Xanh dương xuất hiện (5%)
  blueUnlockLevel: { map: 2, man: 6 },
  enemyHpMul: 0.95,               // máu quái nhân 0,9 (nhân thêm vào hpMul của từng màn; không sửa Excel/engine)
  knobs: { enemyDmgMul: 1.2, heroDmgMul: 1.1 },   // núm cân bằng của engine (không đổi luật): quái x1,1 sát thương theo yêu cầu
  maxTurns: 20,                  // số lượt tối đa mỗi trận (engine mặc định 15, UI ghi đè lên E.K.MAX_TURNS; không sửa engine.js)
  mapBalance: {                  // GIẢ ĐỊNH (xem README): Map 2, 3 luôn 5 quái; hệ số máu/công tăng dần từ màn 1 -> 10 của map
    2: { monsters: 5, hpByMan: [1.35, 1.55, 1.33, 1.52, 0.83, 1.35, 1.29, 1.59, 0.81, 0.52] },   // hiệu chỉnh: đội 5 tướng bậc Xanh lá thắng ~80% ở 2.1 giảm dần còn ~30% ở boss 2.10
    3: { monsters: 5, hp: [1.4, 1.8], atk: [1.3, 1.6] },
  },
  speeds: [1, 2, 4],
  defaultSpeed: 1,
  heroBodyPx: 205,               // chiều cao thân tướng trong trận (px, khung 1920x1080)
  monsterScale: { Q01: 0.45, Q02: 0.65, Q03: 0.8, Q04: 1.3, Q05: 1.2, Q06: 1.0, Q07: 1.0, Q08: 0.75, Q09: 1.35, Q10: 1.1, Q11: 1.35, Q12: 1.5 },
  lanesY: [770, 880, 990],       // đường đáy (chân) 3 làn, đã hạ xuống để đứng trên nền sàn (spec cũ 640/760/880 làm nhân vật lơ lửng)
  heroX: { front: 690, back: 430 },
  enemyX: { front: 1230, back: 1490 },
  main: { x: 150, footY: 1050, h: 300 },
  teamMax: 5,
  mainPoseMs: 1200,              // mỗi pose cổ vũ của main giữ bao lâu rồi về idle
  maxTierDebug: 2,
  maxTier: 4,                    // 0 Trắng, 1 Xanh lá, 2 Xanh dương, 3 Tím, 4 Đỏ
};
