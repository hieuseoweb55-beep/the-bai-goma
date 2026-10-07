/* Kịch bản intro (bản A: hội thoại chữ kèm chân dung). Anh Hiếu sửa chữ ở đây.
 * who: 'hieu' (chân dung intro_hieu_<pose>, không có thì nv01_idle) | 'main' (người chơi) | 'hero' (tướng vừa rút)
 * {name} = tên người chơi. Dòng {action:'firstPull'} = rút gacha lần đầu (miễn phí). */
window.GOMA_INTRO = {
  scenes: [
    { bg: 'bg_kho', lines: [
      { who: 'hieu', pose: 'chao', text: 'Chào em! Anh là Hiếu, thủ kho. Hôm nay anh dẫn em đi một vòng cho biết kho.' },
      { who: 'hieu', pose: 'gai_dau', text: 'Đây là kệ cuộn, đây là pallet hộp... à khoan, em tên gì ấy nhỉ?' },
      { who: 'main', text: 'Dạ, em là {name} ạ!' },
      { who: 'hieu', pose: 'gietminh', text: 'Chuột! Huynh đệ à, cứ bình tĩnh đi đó mà... Một mình anh không xuể.' },
      { who: 'hieu', pose: 'chao', text: 'Em lên phòng họp đề xuất công ty thêm người đi, anh giữ kho ở đây.' },
    ] },
    { bg: 'bg_phonghop', lines: [
      { who: 'narr', text: 'Công ty đồng ý cho đề xuất một nhân viên hỗ trợ kho.' },
      { action: 'firstPull' },
      { who: 'hero', text: '{quote}' },
    ] },
    { bg: 'bg_kho', lines: [
      { who: 'hieu', pose: 'chao', text: 'Có thêm người rồi! Em đứng đó cổ vũ, tụi anh lo.' },
    ] },
  ],
};
