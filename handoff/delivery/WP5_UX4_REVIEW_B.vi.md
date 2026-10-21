# Vòng đổi giao diện 4 của WP5, audit độc lập vùng B (dữ liệu, bảo mật, file cài đặt, phiên giờ và tài liệu) trên 0ddfead (WP5-UX4-AUDIT-B)

Bản dịch của [WP5_UX4_REVIEW_B.md](WP5_UX4_REVIEW_B.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng đổi giao diện 4 do chủ sở hữu yêu cầu của WP5, kèm các
  thay đổi theo quyết định pilot, sau gate thất bại, vòng sửa WP5-UX4-FIX1 và regate WP5-UX4-REGATE đã đạt; task
  WP5-UX4-AUDIT-B, attempt 1, chỉ vùng B, ngày 2026-10-21 từ 15:00Z đến khoảng 15:50Z (08:00 đến khoảng 08:50 giờ
  America/Los_Angeles). Reviewer tự báo model `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan
  sát được từ bên trong). Model mạnh nhất trong các tác giả của snapshot cũng là `claude-opus-5-5` (WP5-UX4-PLAN và
  WP5-UX4-T04; T01-T03, T05, T06, FIX1 và mọi freeze là sonnet), nên reviewer không yếu hơn. Auditor vùng A chạy toàn bộ e2e
  cùng máy, cùng lúc.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `0ddfeada1b66c82b066b179e901184ca5d857793` (commit đóng băng WP5-UX4-FIX1, là `freeze_commit` của WP5-UX4-REGATE); gốc của
  vòng là `8e557100d16b6b6eb86a48e00276835761aabfdf`. HEAD = 0ddfead trước và sau; `git status` ngoài `handoff/` rỗng trước và
  sau. Digest `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda`, 849 file, không tính `handoff/`, ghi đầu tiên
  và cuối cùng theo ba dạng bằng nhau: `npm run digest` trong repository, dạng `git ls-tree`, và export `git archive` sạch băm
  bằng `git hash-object --no-filters` (danh sách đã sắp xếp giống từng byte danh sách `ls-tree`). Công việc chạy trong một bản
  clone nháp tại SHA đó (`npm ci` exit 0); probe của auditor chỉ nằm trong bản clone đó.
- **Quyết định: FIX REQUIRED** (một lỗi mức Low, F-UX4B-1; không có lỗi Medium hay cao hơn).
  - Tác động nghiệp vụ của U4-11 đạt: body phía client là `end: null`, `breaks_confirmed: false`, `expected_version`; oracle
    riêng của tôi theo docs/02 cho đúng số liệu đã lưu sau một lần Check out về sau, trên một ngày làm việc (R 555, eligible 75,
    credit 60, điểm giữa làm tròn xuống) và một ngày thứ Bảy (O 136, credit 150); E-1 không bị ảnh hưởng; các từ chối giờ tương
    lai, chồng lấn và phiên bản cũ vẫn đúng (mục 2). Chốt chặn chấm công qua chia sẻ từ chối check in, check out và mở lại qua
    chia sẻ bằng 409 `shared_clock_action`, cả khi phiên bản đã cũ; "Set an end instead" không có trong màn hình chia sẻ (mục 2).
  - Múi giờ (AGENTS quy tắc 7): Today và Now đọc múi giờ nhập của hộp thoại, không bao giờ đọc múi giờ thiết bị, ở nửa đêm và
    cả hai mép DST, dưới hai múi giờ thiết bị (mục 3).
  - D-9 b được làm đúng đặc tả, nhưng route đăng nhập có thể làm đầy ngăn giới hạn đổi mật khẩu của một người dùng khác
    (F-UX4B-1, mục 4).
  - D-5 a và D-10 theo F-1 (i), D-6 a và D-15 b theo F-2 (b) khớp câu trả lời của chủ sở hữu; ngoại lệ quyền riêng tư nằm trong
    phạm vi chủ đã duyệt và không có gì khác mới lộ ra cho quản trị viên (mục 5-7).
  - File cài đặt chỉ chứa các khóa trong danh sách cho phép, chỉ ghi qua các route có sẵn gắn với chủ sau đúng một lần xác
    nhận, và 41 file độc hại đều không ghi, không treo, không làm ô nhiễm prototype (mục 8).
  - D-8: cách phân loại và test ghim đều đạt (21 lần chạy `delivery.test.ts`, không crash). Lỗi crash 0xC0000005 được tái hiện
    10 trên 10 khi bỏ lần gửi tin cậy phía sau và chưa được đóng trong mã; nó cần một server TLS ngầm định trong cùng tiến trình,
    nên tôi đánh giá đây là rủi ro của bộ test, không có bằng chứng ảnh hưởng production (mục 9, R-UX4B-6).
  - Biên server: đúng tám file server của T04, không migration, một route mới (mục 10).
  - Tài liệu và gói pilot khớp mã và câu trả lời của chủ sở hữu; đã kiểm 24 dòng claim-check; tương đương EN/VI đạt; danh tính
    phát hành là bản đã chấp nhận 8e55710 kèm câu "round 4 in progress" (mục 11).
  - Các kiểm tra bắt buộc đạt (mục 12). Cả 19 mutant của tôi đều bị bắt; ràng buộc `expected_seq` chỉ bị test e2e nhập file
    bắt, không có unit test nào bắt (mục 13).

## 1. Phạm vi thật đã xem và chạy

1. Đọc như tuyên bố, không như bằng chứng: `owner_decisions` ngày 2026-10-20 trên board, nguyên văn (yêu cầu vòng 4, D-1..D-15
   với câu D-10 "OT đầu kỳ mặc định là 0, cho phép sửa bất cứ lúc nào, không cần bằng chứng", F-1..F-5) và
   `coordinator_decisions` ngày 2026-10-20 (chốt chặn chấm công qua chia sẻ, cảnh báo của Check out, cách chia slice);
   WP5-UX4-PLAN phần Results B và C; bản ghi T03, T04 (kèm Addendum 1), T05, T06 (kèm Addendum 1), D8-DIAG, gate, FIX1 và
   regate; docs/01, 02, 03, 05, 07, 10, 11, 12 và gói pilot, EN và VI; docs/08 mục "Gates and independent audit".
2. Mã đọc trọn: mọi hunk của tám file server đổi từ 8e55710 (`sessions.ts`, `schemas.ts`, `routes/admin.ts`,
   `routes/auth.ts`, `holidayImport.ts`, `ledger.ts`, `timesheetCommands.ts`, `workbookImport.ts`), thêm `rateLimit.ts`,
   `passwords.ts`, `clientAddress.ts`, `validation.ts`, `shares.ts` (SHARED_ROUTES), các service số dư đầu kỳ và điều chỉnh,
   `previewImport`, kế hoạch nhập ngày lễ, `smtpAdapter.ts`, `jobStore.ts`; phía client `settingsFileModel.ts`,
   `SettingsTransfer*.tsx/.ts`, `CompanyCalendarFile.tsx`, `ProfileScreen.tsx`, `OpeningBalanceForm.tsx`,
   `OpeningBalancePanel.tsx`, `importModel.ts`, `ImportScreen.tsx`, `HolidayImport.tsx`, `AdminScreen.tsx`,
   `LocalTimeField.tsx`, `sessionModel.ts`, `SessionDialog.tsx`, request của phiên đang chạy trong `breakRowsModel.ts`,
   `dayEditorModel.ts`; các thay đổi test vòng 4 của các file integration vùng B.
3. Probe riêng (trong clone nháp, người dùng giả lập ở `example.invalid`; bản sao trong evidence dạng `*.ts.txt` và
   `*.mjs.txt`): `area-b-server.test.ts` (9 test: oracle U4-11 trên ngày làm việc và thứ Bảy, E-1, các từ chối khi sửa phiên
   đang chạy, thêm trường hợp cho chốt chặn chia sẻ, sổ cái, audit của bản xem trước ngày lễ, khóa của bộ giới hạn),
   `area-b-client.test.ts` (41 test: file cài đặt độc hại, dấu tick và các khóa của request, nhóm bằng nhau, Now/Today dưới múi
   giờ thiết bị Los Angeles và Tokyo), các probe crash của D-8, 20 mutant.
4. Các kiểm tra bắt buộc trong clone nháp của target (mục 12).

## 2. Sửa phiên đang chạy (U4-11) và chốt chặn chấm công qua chia sẻ

- Body: `buildRunningRequest` (`breakRowsModel.ts:426-445`) gửi `start`, `end: null`, `input_zone`, các dòng nghỉ đã liệt kê,
  `breaks_confirmed: false` và `expected_version` tới `PUT /api/sessions/:id` không đổi; mutant M18 (xác nhận true) bị 3 unit
  test bắt.
- Oracle riêng (docs/02 R-03, R-04; B=480, N=30, M=30; `40-probe-server.txt`):
  - Ngày làm việc thứ Ba 2026-09-29: mở lúc 09:00, dời giờ bắt đầu sang 07:30 khi đang chạy (200, `end_utc` null, ngày
    `incomplete`, credit null), Check out lúc 17:45 với ba giờ nghỉ mặc định đã xác nhận: gộp 615, loại trừ 60, R 555, E 75 > N,
    T 75, q 2, r 15, 2r = M nên điểm giữa làm tròn xuống: credit 60. Đã lưu: `regular_minutes` 555, `eligible_minutes` 75,
    `credited_minutes` 60.
  - Thứ Bảy 2026-10-03: Check in lúc 10:30, dời giờ bắt đầu sang 09:10, Check out lúc 11:26 với xác nhận không nghỉ: O 136,
    T 136, q 4, r 16, 2r > M: credit 150. Đã lưu: R 0, `nonworking_minutes` 136, eligible 136, credit 150 (`day_class`
    `nonworking`, `unscheduled_weekday`). Điều này cũng xác nhận cách đọc của FIX1 về lỗi ngày Chủ nhật ở gate: sản phẩm tính
    số phút của ngày không làm việc vào O.
  - E-1: sau một lần sửa phiên đang chạy có lưu một dòng nghỉ chưa xác nhận, Check out không kèm danh sách vẫn giữ dòng đó và
    ngày vẫn là `incomplete_breaks`.
  - Từ chối khi sửa phiên đang chạy: giờ bắt đầu sau lúc này + 5 phút là 422 `future_time`, chồng lấn là 422
    `overlapping_user_intervals`, sai phiên bản là 409 `stale_version`; sau đó phiên không đổi.
- Chốt chặn chia sẻ (`timesheetCommands.ts:450-459`, gọi ở `:464` trước transaction và ở `:502` bên trong, trước khi kiểm
  phiên bản): `sharing.test.ts` (30 passed) bao phủ tạo phiên mở qua chia sẻ, đặt giờ kết thúc cho phiên đang chạy qua chia
  sẻ, mở lại qua chia sẻ (409 `shared_clock_action`, không ghi gì), cùng các route đó của chủ và các sửa đổi qua chia sẻ vẫn
  giữ phiên đã kết thúc hay đang chạy. Probe của tôi thêm: mở lại qua chia sẻ với phiên bản cũ vẫn là 409
  `shared_clock_action`; Clock in/out không được gắn dưới `/api/shared` (404); chủ được phép mở lại; chia sẻ chỉ xem không ghi
  được (403 `grant_scope`). Mutant M01 (bỏ chốt chặn) và M02 (cho mở lại) bị bắt.
- Cách đọc F-Q5 cho trường hợp mở lại là đúng: `end: null` qua chia sẻ trên một phiên đã kết thúc tạo ra một phiên đang chạy,
  tức là Check in theo đường khác. Người được chia sẻ vẫn có thể xóa phiên đang chạy của chủ (R-UX4B-2).
- Client: "Set an end instead" chỉ hiện khi `!shared` (`SessionDialog.tsx:669`, `shared={request !== ownRequest}` trong
  `DayEditor.tsx`); `sharing.spec.ts:399` khẳng định nó vắng mặt với người được chia sẻ quyền sửa (đạt trên cả hai project),
  và mutant E19 (hiện nút trong màn hình chia sẻ) làm test đó thất bại.

## 3. Múi giờ (AGENTS quy tắc 7)

- `LocalTimeField` nhận `zone = draft.zone.trim()` (`SessionDialog.tsx:331, :661, :684`), tức múi giờ nhập của hộp thoại;
  các link bị vô hiệu khi múi giờ chưa phải tên IANA hợp lệ. `nowField` (`sessionModel.ts:85-89`) định dạng thời điểm của thiết
  bị theo múi giờ đó (`formatInZone`), dạng `HH:MM` bỏ giây (R-01 nhập theo phút), không fold, không offset.
- Probe dưới múi giờ thiết bị America/Los_Angeles rồi Asia/Tokyo (dòng `TZPROBE` chứng minh múi giờ của mỗi lần chạy,
  `41-probe-client.txt`): nửa đêm ở Tokyo (14:59:59Z cho 10/20 23:59, 15:00:00Z cho 10/21 00:00); New York lùi giờ (cả hai thời
  điểm 01:30 đều cho 01:30 không fold, rồi domain hỏi chọn fold, đúng như R-07 yêu cầu); New York tiến giờ (01:59 rồi 03:00,
  không bao giờ là giờ trong khoảng trống); thời điểm lưu từ Now bằng thời điểm thiết bị làm tròn xuống phút ở Tokyo, Los
  Angeles, Lord Howe, Kathmandu và UTC. Mutant M17 (Now theo múi giờ thiết bị) bị 4 unit test bắt.
- Thời điểm đã lưu và ngày kế toán: server giải giá trị local theo múi giờ nhập đã lưu và kiểm giờ bắt đầu với ngày kế toán theo
  múi giờ báo cáo (`resolveSession`); e2e của T03 (thiết bị Los Angeles, múi giờ nhập Tokyo, đồng hồ đóng băng) nằm trong
  `day-editor.spec.ts` và đạt trong lần chạy của tôi (mục 12).

## 4. D-9 b, `POST /api/auth/password`

Đã kiểm (mã và `password-change.test.ts` 6 passed, probe của tôi, mutant M03-M07 bị bắt): `requireUser`, không có mount dưới
`/api/shared` (404), kiểm origin (origin lạ và thiếu origin là 403); mật khẩu hiện tại sai là 403 `current_password_incorrect`,
và client giữ phiên, hiện "The current password is not correct. Nothing was changed." (`ProfileScreen.tsx:12-26`); 5 lần sai
cho mỗi (địa chỉ client, `password:<user id>`) trong cửa sổ cố định 15 phút, rồi 429 kèm `Retry-After`; 12-256 ký tự (422
`weak_password`; trên 256 thì hợp đồng zod trả 422 `validation_error`); mật khẩu mới bằng NFKC với mật khẩu cũ là 422
`password_unchanged`; một transaction IMMEDIATE với lệnh cập nhật hash có điều kiện, `revokeOtherAuthSessions` giữ phiên này,
và `auth.password_change` chỉ với `{ sessions_revoked }`; không có ghi log request, và spy console của test không thấy mật khẩu
hay hash nào; đường mật khẩu tạm của quản trị viên (E-11, `users.ts:130`) không đổi.

Khóa giới hạn tần suất và việc khóa người khác (`43-limiter.txt`):
- Người dùng đã đăng nhập khác không chạm được khóa này: phần tài khoản là id của người dùng trong phiên.
- Route đăng nhập thì chạm được: nó dùng email gõ vào, chỉ trim và chuyển chữ thường, làm phần tài khoản của cùng bộ giới hạn
  (`auth.ts:39-41`), nên năm lần đăng nhập sai với email là chuỗi `password:<victim id>` từ cùng địa chỉ client của nạn nhân làm
  đầy ngăn đổi mật khẩu của nạn nhân. Đã tái hiện: lần đổi mật khẩu đúng của nạn nhân sau đó trả 429 `rate_limited` với
  `Retry-After: 900`. Mọi người được chia sẻ đều biết id của người dùng (đó là đường dẫn `/api/shared/:ownerId`), và quản trị
  viên cũng thấy. Đây là F-UX4B-1.
- Ngăn theo địa chỉ (30 lần mỗi cửa sổ) dùng chung với đăng nhập theo thiết kế: 30 lần sai mật khẩu hiện tại (một lần đúng mật
  khẩu hiện tại với mật khẩu mới quá ngắn chỉ xóa ngăn tài khoản) đã chặn đăng nhập của quản trị viên từ cùng địa chỉ bằng 429.
  Các lần đăng nhập không cần phiên hôm nay đã làm được điều tương tự, nên không thêm khả năng mới (R-UX4B-5).

## 5. D-5 a và D-10 theo F-1 (i) (sổ cái)

`opening-balance.test.ts` 15 passed; probe riêng; mutant M08 bị bắt. Không có bút toán nghĩa là 0 (`opening_balance` null,
posted 0); giá trị đầu tiên là 0 bị 422 `invalid_minutes`; giá trị đầu tiên không có bằng chứng được lưu với `evidence_ref`
"not provided"; một lần điều chỉnh về 0 ghi đúng một `correction` bằng âm giá trị hiện tại với `evidence_ref` null; lần điều
chỉnh thứ hai về 0 là `unchanged` và không ghi thêm (các dòng sổ cái: `opening_balance` 95, `correction` -95). Chỉ chủ sở hữu:
các route là `ownerOnly` và không chia sẻ (đọc qua chia sẻ là 403/404); quản trị viên đọc của chính mình là null và
`GET /api/admin/users` không có khóa số dư nào. Sổ cái vẫn chỉ ghi thêm: `UPDATE` và `DELETE` trên `ot_ledger` bị database từ
chối. Giai đoạn 6 của drill gửi một số dư đầu kỳ đầy đủ mà F-1 (i) vẫn chấp nhận, và script của nó không đổi từ 8e55710; lần
chạy của gate (23 PASS ở giai đoạn 6) là tuyên bố mà tôi không chạy lại (Docker). docs/03 dòng 48 viết lại F-3 theo AGENTS quy
tắc 8, kèm dòng VI.

## 6. D-6 a (giới hạn bản xem trước)

`assertPreviewQuota` (`workbookImport.ts:496-503`) chạy sau lần tra cứu idempotency (`:521`) và lần nữa bên trong transaction
ghi sau lần tra cứu tranh chấp (`:542`); khi nó thất bại, file đã lưu bị bỏ (`:570-572`). `workbook-import.test.ts` (30 passed)
bao phủ 20 bản xem trước rồi 409 `import_preview_limit` không lưu gì (dòng, file, sự kiện audit), file trùng trả 200, người
khác không bị ảnh hưởng, một lần commit giải phóng một chỗ, và tranh chấp trong transaction. Mutant M09 (`>` thay cho `>=`) và
M10 (bỏ kiểm tra trong transaction) bị bắt. Cách duy nhất để dọn một bản xem trước (commit nó, mọi ngày có thể bỏ qua) có trong
docs/07, docs/10, docs/11 mục 10 bước 2, docs/12 và thông báo của màn hình Import.

## 7. D-15 b theo F-2 (b) (ngoại lệ quyền riêng tư)

- Mã được khôi phục là nghịch đảo chính xác của WP2-FIXA (`f79413b`): `default_labelled_entries` và
  `explicit_overrides_preserved` theo từng ngày bị đổi, từ các timesheet chưa chốt của người dùng thuộc lịch đó, và
  `finalized_conflicts[].finalized_timesheets`; không có trường nào khác, không có danh tính (khóa của `affected_days` trong
  probe: `date`, `label_before`, `label_after` và hai số đếm).
- Mỗi bản xem trước ghi một sự kiện `calendar.holiday_preview` trong một transaction IMMEDIATE (người thực hiện,
  `owner_user_id` null, after: lịch, năm, ngày hiệu lực, khoảng ngày, số ngày bị ảnh hưởng, số ngày có số đếm; không tên, không
  CSV). Một lần từ chối có ném lỗi (404 lịch, 422 ngày, 403 với nhân viên) không ghi gì; một bản xem trước có lỗi CSV vẫn hiện số
  đếm và được audit, điều này đúng. Mutant M11 (bỏ sự kiện) và M12 (đếm cả bút toán đã chốt) bị bắt.
- Ngoại lệ đã viết: docs/03 dòng 34 và đoạn mở đầu của AdminScreen (`AdminScreen.tsx:89-92`), tài liệu EN và VI.
- Không có gì khác mới lộ ra cho quản trị viên: thay đổi server duy nhất họ thấy là bản xem trước này; thẻ file lịch công ty
  đọc `GET /api/calendar` và `GET /api/periods/current` của chính quản trị viên.
- Đánh giá: nằm trong điều chủ sở hữu đã duyệt ở F-2 (b) ("khôi phục số đếm chính xác với ngoại lệ thành văn và sự kiện audit").

## 8. Xuất và nhập cài đặt (U4-01; F-3 a, F-4 a)

- Nội dung file: `ALLOWED_KEYS` cho từng đối tượng (`settingsFileModel.ts:37-57`); các hàm dựng chép từng khóa một; không có
  chữ ký, quyền dùng ảnh, thông tin đăng nhập, token, dữ liệu timesheet hay `apply_to_overdue_drafts` (test unit về danh sách
  cho phép, test e2e xuất file, mutant M13 và M14 bị bắt).
- Quyền sở hữu: ghi cá nhân đi qua `POST /api/policies` và `POST /api/settings/submission`, body chặt chẽ không có trường chủ
  sở hữu; thẻ công ty chỉ hiện trên màn hình quản trị và server từ chối nhân viên (e2e `settings-transfer.spec.ts:498`); không
  route cài đặt nào nằm trong SHARED_ROUTES.
- Ghi: trước lần xác nhận, file cá nhân chỉ gửi các lần đọc và bản xem trước chính sách (không ghi gì); file công ty còn gửi
  bản xem trước ngày lễ, mỗi lần ghi sự kiện audit theo F-2 (b) (R-UX4B-7). Tự động nộp chỉ bật khi có dấu tick riêng
  (`resolveAutoSubmit`; mutant M15 bị bắt); `expected_seq` là phiên bản đã hiện; "áp dụng từ" mặc định là ngày sau kỳ đang chạy,
  giá trị nhỏ nhất của ô ngày là ngày đầu kỳ current, và biên hướng tới của server (R-07) từ chối mọi ngày sớm hơn, nên các
  ngày trước đó giữ chính sách cũ; nhóm bằng nhau không ghi gì (probe
  và test unit); khác múi giờ, lịch lương hay ngày làm việc thì file công ty bị từ chối; lần commit ngày lễ và từng ngoại lệ
  lương là các lần ghi riêng, và khi lỗi giữa chừng sẽ báo "Already written: ...".
- File độc hại (`41-probe-client.txt`): `__proto__` ở cấp đầu và trong `data`, `constructor.prototype`, `prototype`, khóa cấm,
  lồng sâu 99.000 cấp, 30.000 đối tượng lồng nhau, chuỗi 190.000 ký tự, file trên 200.000 ký tự, sai kiểu, 1e400, số lẻ,
  24:00 và 7:5, `exported_at` không có Z, có offset hoặc ngày không tồn tại, format hay schema khác, sai scope, không phải
  JSON, có byte-order mark, cấp đầu là mảng hay null, ký tự điều khiển trong khóa, và chín file công ty độc hại: tất cả đều bị
  từ chối trong tối đa 11 ms, `Object.prototype` không bị ô nhiễm. Khóa trùng: giá trị sau cùng thắng và tự động nộp vẫn cần
  dấu tick.

## 9. D-8 (gửi thư) và crash 0xC0000005

- Phân loại (`smtpAdapter.ts:40-61`, `jobStore.ts:28-30, :294`): `ESOCKET` rơi vào failed_temporary `smtp_unavailable`; năm lần
  thử (thử lại sau 1, 5, 15, 60 phút), rồi cần can thiệp; `smtp_tls_failed` chỉ cho `ETLS` và `EREQUIRETLS`. Test mới
  (`delivery.test.ts:430-447`) ghim cả hai chế độ. `delivery.test.ts` chạy 21 lần (một lần cộng 20 lần lặp): 27 trên 27 mỗi lần,
  exit 0, không crash worker (`30-integration.txt`).
- Đánh giá crash (`50-crash.txt`):
  - Thân test bỏ lần gửi tin cậy phía sau (bản sao của auditor): TLS ngầm định làm worker vitest crash với exit code
    3221225477 (0xC0000005) trong 10 trên 10 lần; STARTTLS 0 trên 10.
  - Node thuần, không vitest, với adapter production và sink của test trong cùng một tiến trình: TLS ngầm định kết thúc bằng
    segmentation fault (exit 139) trong 5 trên 5 lần khi sink đóng, kể cả khi tiến trình vẫn đang chạy (trong lúc chờ 3 giây);
    để sink mở và thoát tường minh thì 0 trên 5; STARTTLS 0 trên 15.
  - Sink và client ở hai tiến trình riêng: 0 trên 6 lần crash ở cả hai phía.
  - Vậy crash cần server TLS ngầm định và client thất bại trong cùng một tiến trình Node trên máy Windows này. Ở production
    server ở xa và chỉ có phía client chạy, nên tôi không thấy ảnh hưởng production; test được giao chỉ tránh crash nhờ lần gửi
    phía sau. Rủi ro tiềm ẩn của bộ test, chưa được đóng trong mã (R-UX4B-6).

## 10. Biên server

`git diff 8e55710..0ddfead -- src/server src/domain migrations scripts`: đúng tám file của T04; không migration, không đổi
`src/domain` hay script. Đăng ký route: một `app.post('/password', requireUser(...))` mới trong `routes/auth.ts`;
`routes/admin.ts` chỉ đổi thân handler của bản xem trước; `shares.ts` (SHARED_ROUTES) không đổi. Mọi hunk server đã được đọc
(mục 1).

## 11. Tài liệu và gói pilot

- Các phát biểu vòng 4 trong docs/01, 03, 05, 07, 10, 11 và 12 và bảng D-1..D-15 của gói pilot khớp mã và lời của chủ sở hữu
  (D1.a D2.a D3.a D4.a D5.a D6.a D7.a D8.a D9.b D10.a kèm câu chữ của nó D11.a D12.a D13.a D14.b D15.b; các lựa chọn D-14 (b)
  và D-8 đã đối chiếu trong WP5-PLAN mục D).
- Các dòng claim-check của T06 đã kiểm tại target (`60-claim-check.txt`): 1-7, 9, 10, 12-16, 18-20, 30, 31, 34-38 (24 dòng),
  tất cả đúng. Số dòng của các dòng server vẫn khớp, vì sau T05 chỉ có file client thay đổi.
- Tương đương EN/VI (`61-parity.txt`): cả chín cặp đã chạm có số heading, bullet, mục đánh số, dòng bảng và fence bằng nhau;
  các dòng đổi mang cùng code span và mã quyết định; khác biệt số duy nhất là dấu phân cách hàng nghìn và số thứ tự tiếng Việt.
- Danh tính phát hành: docs/12 giữ danh tính trước khi có ghi chú và thêm "UI change round 4 is in progress; the identity is
  refreshed at re-acceptance"; mục 0 và mục 6 của gói pilot ghi bản đã chấp nhận 8e55710 / 507de97c (833 file), do commit
  chấp nhận vòng 3 1b96e9d đặt, không phải T06, kèm đoạn "UI change round 4 (WP5-UX4), in progress".

## 12. Các kiểm tra bắt buộc (clone nháp của target; Node v24.21.0)

| Lệnh | Kết quả | Evidence |
|---|---|---|
| `npm ci` | exit 0 | `10-checks.txt` |
| `npm run typecheck` | exit 0 | `10-checks.txt` |
| `npm run lint` | exit 0, không có dòng deprecation | `10-checks.txt` |
| `npm test` (hai lần) | 97 file, 2226 passed, exit 0 mỗi lần | `10-checks.txt` |
| `npm run build` | exit 0, chunk chính 489.31 kB, không cảnh báo | `10-checks.txt` |
| integration: password-change, opening-balance, workbook-import, holiday-import, sharing, sharing-matrix, clock-out-breaks, ot-api, delivery | 6, 15, 30, 30, 30, 26, 15, 25, 27 passed; exit 0 | `30-integration.txt` |
| `delivery.test.ts` x20 | 27 passed mỗi lần, exit 0, không crash | `30-integration.txt` |
| AC-13 dưới Asia/Tokyo (`TZPROBE zone=Asia/Tokyo offsetMin=-540`) | 1 passed, exit 0 | `31-ac13-tokyo.txt` |
| e2e `settings-transfer`, `profile`, `import`, `admin`, `sharing`, `day-editor`, cả hai project, đồng hồ thật (15:28Z-15:36Z, 2026-10-21; kỳ hiển thị 10/12-10/25) | 284 test: 239 passed, 45 skipped, 0 failed (desktop 138/4/0, mobile 101/41/0); exit 0; không chạy lại | `32-e2e.txt` |
| probe riêng | server 9 passed; client 41 passed dưới mỗi múi giờ thiết bị | `40-*.txt`, `41-*.txt` |

## 13. Độ mạnh của test: mutant riêng

Mỗi mutant áp dụng riêng trong clone nháp, chạy các test được nêu, rồi khôi phục bằng `git checkout` (`70-mutants.txt`):

| ID | Mutant | Kết quả |
|---|---|---|
| M01 | bỏ chốt chặn chấm công qua chia sẻ | bị bắt (sharing.test.ts) |
| M02 | cho mở lại qua chia sẻ | bị bắt (sharing.test.ts) |
| M03 | khóa giới hạn đổi mật khẩu không theo người dùng | bị bắt (password-change) |
| M04 | không ghi nhận mật khẩu hiện tại sai | bị bắt |
| M05 | thu hồi cả phiên này | bị bắt (2 test) |
| M06 | không thu hồi phiên khác | bị bắt |
| M07 | "unchanged" không dùng NFKC | bị bắt |
| M08 | lại từ chối điều chỉnh về 0 | bị bắt (opening-balance) |
| M09 | hạn mức dùng `>` thay `>=` | bị bắt (2 test) |
| M10 | bỏ kiểm hạn mức trong transaction | bị bắt |
| M11 | bỏ sự kiện audit của bản xem trước ngày lễ | bị bắt (4 test) |
| M12 | đếm bút toán đã chốt như còn mở | bị bắt |
| M13 | cho `apply_to_overdue_drafts` vào danh sách cho phép | bị bắt (settingsFileModel) |
| M14 | hàm dựng chép thêm một khóa | bị bắt (4 test) |
| M15 | bỏ qua dấu tick tự động nộp | bị bắt (2 test) |
| M16 | `expected_seq` luôn bằng 0 | sống sót qua bộ unit (32 passed); bị e2e `settings-transfer.spec.ts:157` bắt (E16) |
| M17 | Now theo múi giờ thiết bị | bị bắt (4 test) |
| M18 | sửa phiên đang chạy mà xác nhận giờ nghỉ | bị bắt (3 test) |
| E19 | "Set an end instead" trong màn hình chia sẻ | bị e2e `sharing.spec.ts:399` bắt |

M16/E16 và E19 mỗi cái là một điểm mutant được kiểm ở hai mức, nên tổng là 19 mutant. Hai lần kiểm e2e build lại client cho mỗi
mutant, chạy spec trên project desktop rồi build lại client của target (hash `dist/client` bằng bản build của target). Ghi chú về
độ mạnh test: không unit test nào ràng buộc `expected_seq` với phiên bản đã hiện; chỉ có test e2e nhập file vào một tài khoản đã
lưu cài đặt làm việc đó.

## Phát hiện

1. **F-UX4B-1, Low (D-9 b): các lần đăng nhập sai có thể khóa một người dùng khác khỏi việc đổi mật khẩu.**
   `src/server/routes/auth.ts:138` (`password:${user.id}` làm phần tài khoản), `src/server/routes/auth.ts:39-41` (phần tài khoản
   của đăng nhập là email gõ vào, chỉ trim và chuyển chữ thường) và `src/server/auth/rateLimit.ts:36-41` (một không gian khóa
   `account:<address>:<account>` cho cả hai).
   - Tái hiện (`43-limiter.txt`, probe "REPRO" trong `area-b-server.test.ts.txt`): nạn nhân đang đăng nhập; từ cùng địa chỉ
     client, không có phiên nào, năm lần `POST /api/auth/login` với email `password:<victim id>` và mật khẩu sai (mỗi lần 401);
     sau đó `POST /api/auth/password` của nạn nhân với đúng mật khẩu hiện tại và mật khẩu mới hợp lệ trả 429 `rate_limited`,
     `Retry-After: 900`. Lặp lại mỗi 15 phút thì nạn nhân bị khóa mãi. Id của nạn nhân là đường dẫn `/api/shared/:ownerId` mà
     mọi người được chia sẻ dùng, và quản trị viên thấy nó.
   - Kỳ vọng: yêu cầu của brief là bộ giới hạn không thể dùng để khóa người khác; docs/03 và docs/10 nói việc đổi mật khẩu bị
     giới hạn "theo người dùng và địa chỉ client". Một lần đăng nhập không được chạm tới ngăn đổi mật khẩu.
   - Phạm vi: kẻ tấn công dùng chung địa chỉ client với nạn nhân (NAT văn phòng, hoặc mọi client khi reverse proxy không có
     trong `TRUSTED_PROXY_ADDRESSES`). Tác động: chỉ việc đổi mật khẩu; đăng nhập không bị ảnh hưởng.
   - Sửa có giới hạn: tách không gian khóa (ví dụ `login:<email>` cho đăng nhập, hoặc một instance `LoginRateLimiter` thứ hai
     cho đổi mật khẩu), một integration test với bước tái hiện ở trên, và nếu ngăn theo địa chỉ vẫn dùng chung thì một câu trong
     docs/03 (EN và VI).

## Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

- **R-UX4B-1** `PUT /api/sessions/:id` chấp nhận `end: null` với `breaks_confirmed: true` (hợp đồng có từ trước; client không
  bao giờ gửi; Check out đặt lại giá trị, nên không số liệu nào đổi).
- **R-UX4B-2** Người được chia sẻ quyền sửa có thể `DELETE` phiên đang chạy của chủ (200). Đó không phải Check in hay out, nên
  F-Q5 không bị vi phạm theo nghĩa đen, nhưng nó xóa lần check in của chủ; chủ có thể muốn chốt chặn bao phủ cả việc này.
- **R-UX4B-3** Now trong giờ lặp lại của DST điền giờ không có fold, nên hộp thoại hỏi 01:30 nào (đúng R-07); Now có thể gửi
  luôn offset đã biết.
- **R-UX4B-4** Đổi mật khẩu giữ nguyên token của phiên này (các phiên khác bị thu hồi); xoay token sẽ theo lời khuyên phổ biến
  chống session fixation.
- **R-UX4B-5** Lần sai khi đổi mật khẩu được tính vào ngăn theo địa chỉ dùng chung với đăng nhập (30 lần mỗi cửa sổ): một
  người đã đăng nhập có thể chặn đăng nhập từ chính địa chỉ client của họ trong 15 phút, như các lần đăng nhập không phiên vốn
  đã làm được.
- **R-UX4B-6** Crash của D-8: lỗi chứng chỉ TLS ngầm định khi sink của test ở cùng tiến trình làm Node crash trên máy Windows
  này (10/10 với vitest, 5/5 với Node thuần); test được giao chỉ tránh nó nhờ lần gửi phía sau, và một test tương lai cùng dạng
  sẽ làm worker crash (thấy được dưới dạng unhandled error, exit 1). Không có bằng chứng ảnh hưởng production (0/6 khi server ở
  tiến trình khác).
- **R-UX4B-7** Hộp thoại file công ty xem trước lại mỗi khi đổi năm hay ngày hiệu lực, nên người chọn ngày ghi một sự kiện
  `calendar.holiday_preview` cho mỗi lần đổi (hành vi đã duyệt, gây nhiễu audit); chú thích "Nothing is written before the one
  confirmation" của nó nói về cài đặt, không về sự kiện audit.
- **R-UX4B-8** File cài đặt được trình soạn thảo lưu kèm byte-order mark UTF-8 bị từ chối là "not valid JSON".

## Các gate bắt buộc chưa chạy hoặc bị chặn

Không có kiểm tra bắt buộc nào của vùng B. Audit này không chạy lại: drill `--wp3` (Docker; gate đã chạy trên a3042dd, mà
regate thấy `dist/server` giống từng byte target), toàn bộ e2e (vùng A), NAS (NOT VERIFIED theo thiết kế).

## Xử lý các phát hiện trước

Các mục vùng B của WP5-UX4-GATE: test U4-11 ngày Chủ nhật (FIX1 mục 3) đã đóng, và oracle riêng của tôi xác nhận phía sản phẩm
(mục 2); lỗi ngày cửa sổ của `sharing.spec.ts:399` (FIX1 mục 2) đã đóng: nó đạt trong lần chạy đồng hồ thật của tôi. Chưa có
review vùng B nào trước đó của vòng 4.

## Mức sẵn sàng phần mềm, quyền của chủ sở hữu và pilot

Mức sẵn sàng phần mềm của vòng 4 chờ bản sửa F-UX4B-1 (hoặc một quyết định có ghi lại của coordinator hay chủ sở hữu), một
regate và một lần kiểm lại vùng B mới. Quyền của chủ sở hữu cho pilot và kết quả pilot là chuyện riêng và không bị ảnh hưởng.

## Một hành động tiếp theo

Coordinator: giao một bản sửa server có giới hạn cho F-UX4B-1 (`addresses_audit` WP5-UX4-AUDIT-B: tách khóa giới hạn của đăng
nhập và đổi mật khẩu, thêm một integration test), freeze của nó, một regate có mục tiêu và một lần kiểm lại vùng B mới.

Không bịa phát hiện hay kết quả đạt chưa quan sát. Một review từng phần không phải là chấp nhận trọn vẹn.

## Nguồn gốc subagent độc lập

- Task/attempt review, ID reviewer và ID tác giả được review: WP5-UX4-AUDIT-B attempt 1 (agent a58de82b7707ceff6 trên board);
  tác giả của snapshot: PLAN a3f294195d4f4c99f, T01 a92d8e4a467bd6b4e, T02 af66795ab39964860, T03 abd3f154777315616, T04
  ac40529a094d001dc, T05 ac50555628a30054f, T06 aeb02a4427bbe14e5, FIX1 aaf0f2fdc628d8f2c và các committer freeze ghi trên board.
- Context mới; reviewer không viết thay đổi nào của snapshot này và không sửa file source, test, docs, board hay STATE nào.
- Source digest trước và sau: `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda` (849 file), ba dạng
  (`00-digest-before.txt`, `90-digest-after.txt`); PASS của regate nằm trên cùng snapshot.
- Đường dẫn báo cáo mới; chưa có review vùng B nào của vòng 4; mọi file review trước đó không đổi.
- Cách xử lý phát hiện và task tiếp theo của coordinator: ở trên.
- Vi phạm quy tắc (không ảnh hưởng sản phẩm; `99-runtime.txt`): một lệnh sed kết thúc bằng `cat > /dev/null < /dev/null` không
  làm gì; một lệnh chỉ đọc `grep ... | head -8` trên bản nháp evidence của tôi; và lượt chạy crash độc lập đầu tiên của tôi
  (background task `bu6bo8uxa`) để lại một tiến trình giả lập `node crash-standalone.mjs ... tls keep-sink` đang chờ trên sink
  loopback còn mở. Tôi không được kill tiến trình, nên nó vẫn chạy lúc bàn giao: **coordinator cần dừng background task
  `bu6bo8uxa`**. Các chỉnh sửa probe (không phải phát hiện về sản phẩm) được liệt kê trong cùng file. Không đưa gì vào interpreter
  qua stdin, không xóa đệ quy, không kill tiến trình nào.
