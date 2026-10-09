/**
 * GOMA – máy chủ lưu game bằng Google Sheet (Apps Script Web App).
 * Cách cài: xem HUONG_DAN.md cùng thư mục.
 * Mỗi tài khoản = 1 dòng trong sheet "players". Save game lưu dạng JSON trong cột "save".
 * Mật khẩu KHÔNG lưu thô: game gửi lên bản băm SHA-256, server băm thêm lần nữa kèm "muối" riêng từng tài khoản.
 * Mỗi lần đăng nhập đổi token => chỉ 1 máy được lưu tại 1 thời điểm (máy cũ sẽ bị báo hết phiên, không ghi đè được save mới).
 */
var SHEET_NAME = 'players';
var HEAD = ['user', 'hash', 'salt', 'token', 'savedAt', 'createdAt', 'save'];
var MAX_SAVE = 45000;   // ô Google Sheet tối đa 50.000 ký tự

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function sha_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x < 0 ? x + 256 : x).toString(16)).slice(-2); }).join('');
}
function err_(code, msg) { return { ok: false, code: code, error: msg }; }

function findRow_(sh, user) {
  var n = sh.getLastRow(); if (n < 2) return 0;
  var names = sh.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) if (String(names[i][0]) === user) return i + 2;
  return 0;
}
function parseSave_(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }

function handle_(req) {
  var now = Date.now(), act = req.action;
  if (act === 'time') return { ok: true, now: now };
  var user = String(req.user || '').toLowerCase().trim();
  if (!/^[a-z0-9_]{3,20}$/.test(user)) return err_('invalid', 'Tên đăng nhập chỉ gồm a-z, 0-9, _ (3-20 ký tự)');
  var sh = getSheet_(), row = findRow_(sh, user);

  if (act === 'register') {
    if (!/^[0-9a-f]{64}$/.test(String(req.h || ''))) return err_('invalid', 'Mật khẩu không hợp lệ');
    if (row) return err_('exists', 'Tên này đã có người dùng');
    var saveStr = req.save ? JSON.stringify(req.save) : '';
    if (saveStr.length > MAX_SAVE) return err_('too_big', 'Save quá lớn');
    var salt = Utilities.getUuid(), token = Utilities.getUuid();
    sh.appendRow([user, sha_(req.h + salt), salt, token, saveStr ? now : '', now, saveStr]);
    return { ok: true, token: token, save: parseSave_(saveStr), now: now };
  }
  if (!row) return err_(act === 'login' ? 'bad_login' : 'token', act === 'login' ? 'Sai tên đăng nhập hoặc mật khẩu' : 'Phiên hết hạn');
  var r = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];   // user, hash, salt, token, savedAt, createdAt, save

  if (act === 'login') {
    if (sha_(String(req.h || '') + r[2]) !== String(r[1])) return err_('bad_login', 'Sai tên đăng nhập hoặc mật khẩu');
    var tk = Utilities.getUuid();
    sh.getRange(row, 4).setValue(tk);
    return { ok: true, token: tk, save: parseSave_(r[6]), savedAt: r[4] || 0, now: now };
  }
  if (String(req.token || '') !== String(r[3]) || !req.token) return err_('token', 'Phiên đăng nhập hết hạn (có thể tài khoản vừa đăng nhập ở máy khác)');
  if (act === 'load') return { ok: true, save: parseSave_(r[6]), savedAt: r[4] || 0, now: now };
  if (act === 'save') {
    var s = JSON.stringify(req.save || {});
    if (s.length > MAX_SAVE) return err_('too_big', 'Save quá lớn');
    sh.getRange(row, 5).setValue(now); sh.getRange(row, 7).setValue(s);
    return { ok: true, savedAt: now, now: now };
  }
  return err_('invalid', 'Lệnh không hợp lệ');
}

function doGet() { return out_({ ok: true, now: Date.now(), msg: 'GOMA cloud đang chạy' }); }
function doPost(e) {
  var lock = LockService.getScriptLock(), got = false;
  try {
    lock.waitLock(20000); got = true;
    return out_(handle_(JSON.parse(e.postData.contents)));
  } catch (ex) {
    return out_({ ok: false, code: 'server', error: 'Lỗi máy chủ: ' + ex });
  } finally { if (got) lock.releaseLock(); }
}
