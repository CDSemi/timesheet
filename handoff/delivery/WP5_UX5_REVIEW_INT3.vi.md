# WP5 vòng thay đổi UI 4 và 5, kiểm tích hợp lại sau FIX19 trên 0b45781 (WP5-UX5-AUDIT-INT3)

Bản dịch của [WP5_UX5_REVIEW_INT3.md](WP5_UX5_REVIEW_INT3.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP5, vòng thay đổi UI 4 và 5 theo yêu cầu của chủ sở hữu, lần kiểm tích hợp
  lại mà nếu PASS sẽ nghiệm thu lại WP5 và thay RECHECK-A2 cùng RECHECK-B3 làm nghiệm thu hiện hành; task WP5-UX5-AUDIT-INT3, attempt 1,
  2026-10-29 từ 16:15:33Z đến khoảng 17:35Z. Model reviewer tự báo `claude-opus-5-5` (agent trên board `a89b2f7f5fa303382`), profile
  timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Các model tác giả trên board là `claude-opus-5-5`,
  `claude-sonnet-5-5` và một `claude-haiku-4-5-20251001`; mạnh nhất là `claude-opus-5-5`, còn FIX18, FIX19, các lần đóng băng của chúng và
  REGATE13, REGATE14 là `claude-sonnet-5-5`, nên reviewer không yếu hơn. Agent id của tôi chỉ có trên board ở task này: tôi không viết task
  WP5-UX4 hay WP5-UX5 nào và không audit nào của chúng.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `0b457817ed29806a36fdd78cc22ac84a0cc2db9d` (WP5-UX5-FIX19-FREEZE, đã push; là `freeze_commit` của WP5-UX5-REGATE14). HEAD = origin/main =
  commit đó trước và sau; không có dòng trạng thái nào ngoài `handoff/` trước hay sau. Digest
  `67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b`, 882 file, không gồm `handoff/`, bằng nhau lúc 16:16:38Z và
  17:13:45Z ở mọi dạng: bản export `git archive` sạch băm bằng `git hash-object --no-filters`, dạng `git ls-tree` của đích và của HEAD
  (các danh sách đã sắp xếp giống nhau từng byte), và `npm run digest` cả trong repository lẫn trong một bản clone nháp sạch của đích. Không
  có commit chưa push. Source đủ: `npm ci` exit 0 trong bốn bản export. Snapshot được nghiệm thu gần nhất là
  8e557100d16b6b6eb86a48e00276835761aabfdf (digest 507de97c); 224 đường dẫn ngoài `handoff/` khác nhau giữa nó và đích.
- **Quyết định: PASS.** Cả hai phát hiện của AUDIT-INT2 đã đóng.
  - F-UX5I2-1: sau một lần lưu ca, một "Confirm breaks", một Add session hoặc một lần xóa trong trình sửa ngày đang mở, lần "Save day fields"
    sau đó không còn ghi đè các trường của ngày đã đổi ở nơi khác, trên ngăn kéo máy tính, bottom sheet điện thoại và khung nhìn chia sẻ có
    quyền sửa. Khi chưa gõ gì, biểu mẫu hiện các trường của máy chủ; khi có chỉnh sửa chưa lưu, lần lưu bị từ chối và "Reload day" đọc thay
    đổi (mục 1 và 3). G1 và G2 của AUDIT-INT2 nay giữ thay đổi của thiết bị kia, và 21 trong 27 ca riêng của tôi hỏng trên d96df5d và đạt trên
    đích.
  - F-UX5I2-2: `npm run digest` chạy được trong một bản clone sạch và trong repository, và khớp với dạng export và dạng `git ls-tree` (mục 2).

  Lần đọc theo kịp của FIX18 và đường ghi ca của FIX19 thống nhất trong mọi chuỗi thao tác tôi dựng được (mục 3). Không có hồi quy (mục 4;
  axe-core 4.14.0, 30 lần quét, 0 vi phạm). Các phán quyết tích hợp của AUDIT-INT và AUDIT-INT2 được mang tiếp qua diff FIX19 (mục 5).
  Trong mười hai đột biến của tôi, bộ test diệt bảy cái ở đúng assertion nêu quy tắc, bốn cái sống sót qua bộ test và chỉ hỏng ở probe của
  tôi, và đột biến script digest chỉ hỏng khi chạy script (mục 6). Mọi kiểm tra bắt buộc đều đạt (mục 7). Không có phát hiện mới. Rủi ro tùy chọn mới R-UX5I3-1..4, trong đó có việc mất tiêu
  điểm sau "Save day fields" và "Reload day" có từ trước vòng 4 và 5 (R-UX5I3-3); R-UX5I2-3 được cập nhật với ca đường ghi ca của nó.

## Phạm vi thật đã xem và chạy

1. Đọc như lời khẳng định, không như bằng chứng: brief; AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"); `WP5_UX5_REVIEW_INT.md` và
   `WP5_UX5_REVIEW_INT2.md` (+ VI), cùng probe và bằng chứng của AUDIT-INT2; brief, Results và bằng chứng của FIX19 và REGATE14 (bản ghi đột
   biến, `zz-fix19-mutants-recorded.txt`, `99-slips.txt`); `WP5_UX5_RECHECK_A2.md` và `WP5_UX5_RECHECK_B3.md`; docs/03 (các quy tắc phiên
   bản, :24 và :40), docs/04 (:69, :71, :75) và docs/12 (:7), EN và VI; các mục board của task này, FIX18, AUDIT-INT2, FIX19, FIX19-FREEZE và
   REGATE14, và các model tác giả.
2. Code: diff FIX19 (`git diff d96df5d..0b45781`, năm đường dẫn, +359/-4); toàn bộ `DayEditor.tsx`; `DayFieldsForm.tsx` (không đổi: bản nháp
   khởi tạo một lần mỗi lần gắn :51-53, báo bẩn bằng layout effect :57-59, phiên bản gửi đi :85, nút Save bị vô hiệu khi đang bận
   :104-108); `SessionDialog.tsx:543-553` (một đường ghi cho Add session, Edit và "Confirm breaks"); `SessionList.tsx` (tên nút);
   `ClockProvider.tsx:99-121` và `TimesheetScreen.tsx:307-316` (một phiên bản đồng hồ và bộ đếm theo kịp); `applyDayEntryChange` phía máy chủ
   (`timesheetCommands.ts:328-395`) và `resolveDayCategory` (`domain/attendance.ts:49-55`); `scripts/source-digest.mjs`; `git blame` của
   thông báo cũ, `reload()` và nút Save (`23-blame-*.txt`).
3. Kiểm tra bắt buộc trong một bản export `git archive` sạch của đích có `npm ci` riêng (`export`), lần lượt từng cái và một mình trên máy,
   có điều tra tải trước và sau mỗi lần chạy e2e.
4. Probe riêng trong bản export thứ hai của đích (`export-probe`, `npm ci` và build riêng; chỉ thêm các file `zz-int3-*.spec.ts` của tôi và
   `zz-int2-follow.spec.ts` của AUDIT-INT2) và cùng các probe đó trong một bản export của d96df5d (`export-prev-probe`), để tách hành vi của
   FIX19 khỏi của FIX18.
5. Đột biến riêng trong bản export thứ ba (`export-mut`), mỗi cái được khôi phục đúng từng byte; đột biến script digest trong bản clone sạch.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX5-AUDIT-INT3/` (mục lục `00-README.txt`); mã nguồn probe, đột biến
và script được giữ dưới dạng `90-*.txt`; các lần lỡ quy tắc của tôi ở `99-slips.txt`.

| Lệnh hoặc probe | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, trạng thái ngoài `handoff/`, digest (export, ls-tree, `npm run digest` trong repository và một bản clone sạch), đầu và cuối | 0b45781 = origin/main; không dòng nào; `67aa715c…c42b`, 882 file, lúc 16:16:38Z và 17:13:45Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt`, `01-digest-npm-*.txt` |
| diff và phạm vi FIX19 | đúng năm đường dẫn của FIX19; không gì trong `src/server`, `src/domain`, `src/client/components`, style, fixture hay file gói; không có gì giữa đích và HEAD | `20-*`, `22-fix19-*.txt` |
| build sạch của d96df5d và của đích | `dist/server` và `dist/domain` giống hệt (232 file); `dist/client`: `index.html`, chunk vào và năm chunk tải lười đổi tên (bằng nhau khi chuẩn hóa tên); CSS và `jsx-runtime` giống hệt | `41-dist-compare.txt`, `41-dist-client-normcmp.txt` |
| kiểm tra bắt buộc (mục 7) | đều exit 0; FULL 484/36/0 và 408/112/0; chạy bảy file 400 đạt, 0 lỗi; AC-13 1/1 | `03-*`, `04-*`, `05-*`, `08-*` |
| probe ghi ca của tôi (27 test), đích | 27 đạt (máy tính 25, điện thoại 2); kết quả ở mục 1 và 3 | `45-obs-int3-target.txt`, `48-log-int3-target.txt` |
| cùng probe đó trên d96df5d | 6 đạt, 21 lỗi: mọi ca mà FIX19 thay đổi đều hỏng ở đó, 6 ca còn lại đạt ở cả hai | `45-obs-int3-prev.txt`, `48-log-int3-prev.txt` |
| probe theo kịp của AUDIT-INT2 (A-P cùng G1 và G2), không sửa, đích | 19 đạt; G1 và G2 nay là "kept" | `44-obs-int2-follow-target.txt`, `48-log-int2-target.txt` |
| G1 và G2 của AUDIT-INT2 trên d96df5d | cả hai "OVERWRITTEN" (tái hiện F-UX5I2-1 trên bản gốc) | `44-obs-int2-follow-prev-G.txt`, `48-log-int2-prev-G.txt` |
| quản trị viên nhập ngày lễ vào một ngày có nguồn mặc định, rồi xóa ca trong trình sửa (E3 có gõ, E4 không gõ), đích và d96df5d | đích: E3 được nhận (ghi Worked đè lên mặc định Holiday mới), E4 khởi động lại với Holiday; d96df5d: cả hai ghi Worked | `46-obs-int3-admin-*.txt` |
| axe-core 4.14.0 (từ npm registry vào thư mục task; SHA-256 bằng bản của REGATE14 và AUDIT-INT2) | 30 lần quét, 0 vi phạm | `47-axe-source.txt`, `47-axe-lines.txt` |
| đột biến riêng MY1-MY12 | 7 trong 11 đột biến của `DayEditor.tsx` làm bộ test hỏng ở đúng assertion nêu quy tắc; MY2, MY3, MY5 và MY8 sống sót qua bộ test và sáu file spec (mỗi lần 212 đạt) và hỏng ở probe của tôi; MY10 chỉ bị bắt khi chạy script; đều khôi phục đúng từng byte, `dist/` build lại bằng bản build của đích | `50-*`, `52-*` |
| điều tra tải trước và sau mỗi lần chạy | 0,87-3,70 lõi bận trên 32 | `10-census-*.txt` |

## 1. F-UX5I2-1: một lần ghi ca trong trình sửa ngày đang mở và các trường của ngày đã đổi ở nơi khác

**Đã đóng.** FIX19 cho các lần ghi ca của trình sửa đi qua `sessionWritten()` (`DayEditor.tsx:321-331`): lần lưu của hộp thoại ca
(`:606-609`; `SessionDialog.tsx:545-549` là một đường ghi duy nhất cho Add session, Edit và "Confirm breaks") và lần xóa (`:369-371`). Nó
đánh giá kết quả trả về so với ngày đang giữ ở lần render gần nhất (`heldDay`, `:174-175`) và báo bẩn của chính biểu mẫu các trường của ngày
(`fieldsDirtyRef`, `:176`, `:294`):
- các trường của ngày trong kết quả bằng các trường đang giữ (`sameDayFields`, phép so của FIX18): nhận kết quả; biểu mẫu giữ những gì đã gõ;
- chúng khác nhau và chưa gõ gì: nhận kết quả và khởi động lại biểu mẫu (`generation` + 1);
- chúng khác nhau và một trường có chỉnh sửa chưa lưu: `withHeldDayFields()` (`:49-59`) nhận các ca và số liệu của kết quả nhưng giữ loại
  ngày, nguồn loại ngày, số phút và loại nghỉ, WFH và entry (ghi chú và phiên bản) đang giữ, nên lần lưu của biểu mẫu mang phiên bản đang
  giữ. Máy chủ từ chối nó (`timesheetCommands.ts:340-341` khi ngày đang giữ chưa có entry, `:380` trong các trường hợp khác), nên nhánh này
  chỉ có thể kết thúc ở thông báo cũ.

`DayFieldsForm.tsx`, lần theo kịp, `saved()`, `stale()` và `reload()` không đổi.

**G1 và G2 của AUDIT-INT2**, chạy không sửa: trên đích cả hai kết thúc "the elsewhere change kept"; biểu mẫu hiện ghi chú và WFH của thiết
bị kia sau lần lưu ca và lần xóa, và "Save day fields" được nhận mà không ghi đè (`44-obs-int2-follow-target.txt`). Trên d96df5d cả hai kết
thúc "OVERWRITTEN" (`44-obs-int2-follow-prev-G.txt`).

**Các ca của tôi** (`zz-int3-session.spec.ts`, mỗi test một người tổng hợp riêng, một ngày làm việc đã qua của kỳ đang hiển thị trừ khi ghi
"hôm nay"; thiết bị kia ghi qua API sau khi trình sửa đã tải ngày). Đích và d96df5d:

| Ca | Thao tác ghi và thứ đã đổi ở nơi khác | Đích | d96df5d |
|---|---|---|---|
| S1 | "Confirm breaks", không gõ gì; ghi chú và WFH | biểu mẫu khởi động lại với ghi chú và WFH của thiết bị kia; lưu được nhận, cả hai được giữ; tiêu điểm ở "Times" | hiện ghi chú cũ; lưu ghi đè |
| S2 (1280 nổi) | "Confirm breaks", có ghi chú đã gõ; ghi chú và WFH | ghi chú được giữ; chưa có thông báo; lưu bị từ chối ("Nothing was saved"), cả hai được giữ; "Reload day" hiện chúng và các giờ nghỉ đã xác nhận | lưu được nhận, ghi đè |
| S3 | xóa, có ghi chú đã gõ; nghỉ một phần 1:00 vacation | ghi chú được giữ; bị từ chối; giờ nghỉ được giữ; "Reload day" hiện "1:00 vacation" | giờ nghỉ bị ghi đè thành không có |
| S4 | lưu ca, đã tick WFH; ghi chú | WFH vẫn được tick; bị từ chối; ghi chú được giữ | ghi chú bị ghi đè |
| S5 | lưu ca, loại ngày đặt thành Vacation; WFH | Vacation vẫn giữ; bị từ chối; WFH được giữ, loại ngày vẫn là Worked | WFH bị ghi đè |
| S6 | lưu ca, ghi chú gõ rồi gõ lại như cũ (không có chỉnh sửa chưa lưu); ghi chú và WFH | biểu mẫu khởi động lại; lưu được nhận, cả hai được giữ | ghi chú cũ vẫn ở biểu mẫu (ca dừng ở đó) |
| S7 | Add session trên ngày chưa có entry, có ghi chú đã gõ; không gì | entry do lần ghi tạo ra được nhận (cùng trường); ghi chú lưu được | giống vậy (đạt ở cả hai) |
| S8a / S8b | Add session; thiết bị kia đã tạo entry với một ghi chú; có gõ / không gõ | S8a bị từ chối (entry đang giữ là không có, nên lần lưu không gửi phiên bản); S8b biểu mẫu hiện ghi chú, lưu giữ nó | cả hai ghi đè |
| S9 | lưu ca, có ghi chú đã gõ; chỉ nguồn loại ngày (cùng loại ngày được lưu tường minh) | bị từ chối, một cách thận trọng (phiên bản entry đã đổi) | được nhận |
| S10 | tự "Save day fields", rồi gõ ghi chú mới và lưu ca; không gì | ghi chú mới được giữ và lưu được (không từ chối nhầm) | giống vậy |
| P1 (bottom sheet điện thoại) | lưu ca, không gõ gì; ghi chú và WFH | khởi động lại; lưu từ chân sheet giữ cả hai | các trường cũ vẫn ở biểu mẫu (ca dừng ở đó) |
| P2 (bottom sheet điện thoại) | xóa, có ghi chú đã gõ; ghi chú và WFH | ghi chú được giữ; bị từ chối; "Reload day" hiện thay đổi | ghi đè |
| H1 / H2 (khung nhìn chia sẻ có quyền sửa) | người được cấp quyền lưu một ca; chủ sở hữu đã đổi ghi chú và WFH trên thiết bị khác; không gõ / có gõ | H1 khởi động lại, lưu giữ thay đổi của chủ sở hữu; H2 bị từ chối, "Reload day" hiện nó | cả hai ghi đè |

Cả hai nhánh mà brief nêu đều đúng: khi không có chỉnh sửa chưa lưu, biểu mẫu hiện các trường của máy chủ (S1, S6, S8b, P1, H1, G1, G2); khi
có chỉnh sửa chưa lưu, lần lưu bị từ chối và "Reload day" đọc thay đổi (S2, S3, S4, S5, S8a, P2, H2, G3 của FIX19).

**Thông báo cũ và tiêu điểm** (S2, P2 và probe axe, mọi chiều rộng và giao diện):
- Sau lần ghi ca, trình sửa hiện "Session saved." (trạng thái lịch sự) và tiêu điểm ở tiêu đề "Times" (docs/04:75); ở nhánh giữ chưa có
  thông báo cũ nào. FIX19 chọn vậy có chủ ý: thông báo nói "Nothing was saved", điều sẽ sai khi đứng cạnh "Session saved.", và docs/04:69
  (VI :70) nay nói lần lưu của chỉnh sửa đang giữ bị từ chối và "Reload day" đọc thay đổi. Không gì mất lặng lẽ; người dùng biết về thay
  đổi khi lưu (R-UX5I3-2).
- Lần lưu bị từ chối hiện thông báo cũ sẵn có (`role="alert"`, "This day changed since it was loaded. Nothing was saved. Reload the day
  ...", kèm "Reload day") và giữ các giá trị đã gõ trong biểu mẫu.
- Tiêu điểm sau lần lưu bị từ chối và sau "Reload day" nằm ở body của tài liệu, trên ngăn kéo và trên bottom sheet điện thoại. Nguyên nhân:
  nút Save bị vô hiệu khi đang lưu (`DayFieldsForm.tsx:105`), nên trình duyệt bỏ tiêu điểm khỏi nó, và "Reload day" gỡ chính nút của nó cùng
  thông báo. Cả hai có từ trước vòng 4, 5 và FIX19: nút bị vô hiệu khi bận và `reload()` có từ WP2-T10 (26fa7c9f, `23-blame-*.txt`), bản
  nghiệm thu 8e55710 có cùng nút và cùng ngăn kéo không modal, và tiêu điểm ở body như vậy cũng theo sau một lần lưu được nhận trên d96df5d
  (`45-obs-int3-prev.txt`, S2). Ghi thành R-UX5I3-3; bản thân thông báo vẫn được đọc lên.

## 2. F-UX5I2-2: `npm run digest`

**Đã đóng.** `scripts/source-digest.mjs:13-16` nay cho lần `execFileSync` đầu (`git ls-files --cached --others --exclude-standard -z`)
`maxBuffer` 64 MiB, như lần thứ hai; không gì khác trong script đổi (`22-fix19-src-scripts-diff.txt`).
- Trong một bản clone nháp sạch của đích (0 dòng trạng thái) `npm run digest` exit 0 và in `67aa715c…c42b  (882 files, handoff/ excluded)`;
  trong repository (đã theo dõi cộng chưa theo dõi, không gồm `handoff/`) cũng vậy, trước và sau. Cả hai bằng dạng export và dạng
  `git ls-tree` của đích và của HEAD, và danh sách export giống từng byte danh sách ls-tree (`01-digest-before.txt`, `01-digest-after.txt`).
- Danh sách script đọc nay là 1.092.799 byte trong bản clone sạch và 1.107.448 byte trong repository, vượt mặc định 1.048.576 byte của Node;
  64 MiB để lại khoảng 60 lần chừng đó.
- Đột biến MY10 của tôi (đặt `maxBuffer` đầu về lại 1 MiB trong bản clone sạch): exit 1, `spawnSync git ENOBUFS`; khôi phục đúng từng byte,
  exit 0 với cùng digest (`50-mut-MY10-digest.txt`). Không test hay cấu hình nào gọi script này, nên chỉ chạy nó mới chứng minh được nó;
  docs/12:7 (VI :7) biến lần chạy đó thành một bước phát hành.

## 3. FIX18 và FIX19 cùng nhau

**Lần theo kịp khi Check in và Check out của trang và khi tab quay lại** (FIX18, FIX19 không đổi): probe của AUDIT-INT2, chạy lại không sửa
trên đích, đạt như trên d96df5d: ở 1440px (cạnh bảng) và 1280px (nổi), ngăn kéo theo Check in (từ bàn phím) và Check out với mỗi lần một
lần đọc, giữ ghi chú và WFH đã gõ, không hỏi gì, để tiêu điểm ở nút đồng hồ của trang và lưu được ghi chú (A); chốt chặn vẫn hỏi sau một lần
theo kịp (A, H). Các chốt chặn đứng vững: chốt trường từ chối một thay đổi ở nơi khác của ghi chú, WFH, nghỉ một phần hay loại ngày trước
khi tab quay lại (B, và năm test B của FIX19); một tab khác (D) và phiên chia sẻ của người được cấp quyền (C) trước Check in của trang bị từ
chối; một hộp xác nhận xóa đang mở giữ phiên bản nó đã tải (N, 409); một lần đọc theo kịp bị vượt bởi lần lưu của chính trình sửa bị bỏ (O);
bottom sheet điện thoại không gửi lần đọc theo kịp nào (K); khung nhìn chia sẻ không có đồng hồ và không theo kịp (L). docs/04:69 nay nêu
việc tab quay lại.

**Thử làm hai đường bất đồng** (đích; d96df5d trong ngoặc vuông):

| Ca | Chuỗi thao tác | Đích |
|---|---|---|
| X1 | đổi ở nơi khác, không gõ gì; tab quay lại; lưu ca | lần theo kịp giữ ngày đang giữ (biểu mẫu không đổi); lần lưu ca khởi động lại biểu mẫu theo thay đổi; lưu giữ nó [các trường cũ vẫn còn sau lần lưu ca] |
| X2 | chỉ WFH đổi ở nơi khác; có ghi chú đã gõ; lưu ca (giữ); rồi tab quay lại, hoặc lưu ca lần hai | lần theo kịp và lần ghi thứ hai đều giữ các trường đang giữ (WFH và phiên bản); lưu bị từ chối, WFH được giữ [ghi đè] |
| X2L | chỉ số phút nghỉ, hoặc chỉ ghi chú, đổi ở nơi khác; có chỉnh sửa đã gõ; lưu ca; tab quay lại | bị từ chối; giá trị được giữ [ghi đè] |
| X3 | đổi ở nơi khác, không gõ gì; lưu ca (khởi động lại); rồi gõ ghi chú và tab quay lại | lần theo kịp nhận lần đọc mới (cùng trường); lưu được nhận với ghi chú đã gõ và WFH của thiết bị kia [WFH bị ghi đè] |
| X4 | một lần đọc theo kịp bị giữ ở route (nó đọc ngày trước thay đổi ở nơi khác); lần lưu ca trả lời trước (khởi động lại); lần đọc được thả | lần đọc muộn bị bỏ (dấu đếm); lưu giữ thay đổi [các trường cũ vẫn còn sau lần lưu ca] |
| X5 | đang giữ sau một lần lưu ca; ghi chú đã gõ được gõ lại như cũ; lưu ca lần hai | biểu mẫu khởi động lại; lưu giữ thay đổi [các trường cũ vẫn còn] |
| X6a / X6b | hôm nay: có ghi chú đã gõ; Check in và Check out của trang (đã theo kịp); X6b: ghi chú đổi ở nơi khác; xóa trong ngăn kéo | X6a ghi chú lưu được; X6b bị từ chối, ghi chú kia được giữ [X6a giống vậy; X6b ghi đè] |
| X8 (1280) | hôm nay: có ghi chú đã gõ; Check in; ghi chú đổi ở nơi khác; Check out | lần theo kịp giữ ngày đang giữ (thẻ Running vẫn còn); bị từ chối; "Reload day" hiện ca đã kết thúc và ghi chú [giống vậy: chốt chặn của FIX18] |
| X7 | ghi chú và ca thứ hai đổi ở nơi khác, không gõ gì; tab quay lại; rồi lưu ca | việc tab quay lại để nguyên cả ngày đang giữ trên màn hình (ghi chú cũ và giờ kết thúc ca cũ); lần lưu ca sau đó hiện cả hai (quan sát, R-UX5I3-1) |

Không chuỗi nào để một trường cũ đi kèm phiên bản mới. Hai đường khác nhau ở một điểm theo thiết kế: khi chưa gõ gì và các trường đã đổi ở
nơi khác, một lần ghi ca khởi động lại biểu mẫu từ kết quả, còn lần theo kịp giữ nguyên cả ngày đang giữ (trường, ca và số liệu) đến khi có
một lần ghi hoặc "Reload day" (X1, X7). Cả hai đều an toàn và đều đúng như docs/04:69 nói; R-UX5I3-1 gợi ý một quy tắc chung.

**Một thay đổi lịch của quản trị viên** (R-UX5I2-3; `zz-int3-admin.spec.ts`, máy chủ riêng): một ngày mà entry giữ mặc định của lịch (nguồn
"default", tạo bởi một Check in) hiện loại ngày của lịch, nên một ngày lễ được nhập làm đổi loại ngày hiển thị mà không có phiên bản entry
mới. E4 (không gõ gì, rồi xóa trong trình sửa): biểu mẫu khởi động lại với "Holiday" (d96df5d: vẫn "Worked" và ghi nó). E3 (có ghi chú đã
gõ): nhánh giữ giữ "Worked" với phiên bản entry không đổi, lần lưu được nhận và ghi "Worked" tường minh đè lên mặc định Holiday mới (trên
d96df5d cũng vậy). FIX19 không đưa vào cũng không làm nặng thêm (nó cải thiện E4); coordinator đã để R-UX5I2-3 ra ngoài FIX19 vì đó là một
lựa chọn hành vi. Cập nhật ở dưới.

## 4. Hồi quy của thay đổi

| Mục | Cách kiểm | Kết quả |
|---|---|---|
| chốt chặn chỉnh sửa chưa lưu (U4-05): Escape, Close, bấm ra ngoài, ngày khác, Next period | A và H của AUDIT-INT2 trên đích; các test U4-05 trong FULL | mỗi cái đều hỏi "Discard your changes?"; Keep editing giữ ngăn kéo, ngày của nó và ghi chú; các test đạt ở cả hai project |
| test Escape cùng task | `day-editor.spec.ts:5919` trong FULL (cả hai project) và trong lần chạy bảy file | đạt |
| đường làm mới sau nhãn và theo lô | P của AUDIT-INT2 sau một lần theo kịp; các test bộ chọn và theo lô trong FULL | chọn nhãn khởi động lại các biểu mẫu mà không hỏi (docs/04:69); một lần lưu sau đó thành công |
| ca và giờ nghỉ | FULL (các test hộp thoại ca, "Confirm breaks", hộp thoại Check out của `day-editor.spec.ts`); S1, S2 | đạt; "Confirm breaks" xác nhận ba giờ nghỉ gợi ý |
| khung nhìn chia sẻ | H1, H2, C và L của AUDIT-INT2; `sharing.spec.ts` trong FULL | khung nhìn chia sẻ có quyền sửa nhận cùng quy tắc qua route của chia sẻ; không đồng hồ, không theo kịp; các test đạt |
| tiêu điểm bàn phím và thông báo | S1, S2, P1, P2, A; nhật ký tiêu điểm của probe axe | tiêu điểm tới "Times" sau mọi lần ghi ca (cả hai nhánh, cả hai project) và ở lại nút đồng hồ của trang sau một lần theo kịp; "Session saved." và thông báo cũ được đọc lên; sau "Save day fields" và "Reload day" tiêu điểm ở body (có từ trước, R-UX5I3-3) |
| axe-core 4.14.0, WCAG 2.0-2.2 A/AA, sáng và tối | Timesheet có trình sửa mở trên một ngày làm việc đã qua có một ca ở 1440, 1280 và 390px: (a) có ghi chú đã gõ, (b) sau một lần lưu ca ở nhánh giữ, (c) thông báo cũ, (d) sau "Reload day", (e) sau một lần lưu ca khởi động lại biểu mẫu | 30 lần quét, 0 vi phạm; incomplete chỉ có `color-contrast` (và `label-content-name-mismatch` trên máy tính), như các gate trước |

Không tìm thấy hồi quy. Test của FIX19 thêm 311 dòng và không bỏ dòng nào; chúng không dùng sleep và không nâng timeout (hai
`timeout: 7_000` giới hạn `waitForResponse` của chính chúng thấp hơn timeout của test); mỗi test có một người riêng, nên không test nào phụ
thuộc thứ tự trong file.

## 5. Mang tiếp các phán quyết tích hợp của AUDIT-INT và AUDIT-INT2

Diff đã kiểm: `git diff --name-status d96df5d..0b45781 -- . ':!handoff'` (`20-namestatus-prev-target.txt`, `20-numstat-prev-target.txt`):
`docs/04_UX_AND_SETTINGS.md` và `.vi.md` (dòng 69, mỗi file một thay đổi), `scripts/source-digest.mjs` (+1), `src/client/DayEditor.tsx`
(+45/-2) và `tests/e2e/day-editor.spec.ts` (+311/-0). Không gì dưới `src/server`, `src/domain` hay `src/client/components` (nên
`DayFieldsForm.tsx` không đổi), và không đổi `TimesheetScreen.tsx`, `styles.css`, `tests/e2e/fixtures.ts`, `package.json` hay lockfile
(`20-namestatus-prev-target-areas.txt`, 0 dòng); `git diff 0b45781..HEAD` ngoài `handoff/` rỗng.

- **Mọi phát hiện đã đóng:** mục 1.1 của AUDIT-INT đứng vững; F-UX5I-1 vẫn đóng (lần theo kịp không bị đụng và probe A của AUDIT-INT2 đạt
  trên đích); F-UX5I2-1 và F-UX5I2-2 đóng ở đây. Không phát hiện nào của các vòng còn mở.
- **Mọi mục của chủ sở hữu và mọi lỗi gate đều được ánh xạ:** mục 1.3 và 1.4 của AUDIT-INT đứng vững. Mục duy nhất của chủ sở hữu mà FIX19
  chạm là U4-05 (ngăn kéo không modal và chốt chặn của nó): docs/04:69 có thêm mệnh đề tab quay lại và quy tắc ghi ca với cùng khẳng định ở
  EN và VI, và chốt chặn đứng vững (mục 4). REGATE13 và REGATE14 không có lỗi, nên mục 1.4 không thêm dòng.
- **Quy tắc tải:** không đổi và hợp lý (mục 1.5 của AUDIT-INT). REGATE14 đã áp dụng nó (vào 0,63 và 0,91 lõi bận, không lỗi); các lần điều
  tra của tôi đọc 0,87-3,70 lõi bận trên 32, nên không lần chạy nào của tôi tới gần giới hạn 8 lõi.
- **RECHECK-A2 (vùng A):** các phán quyết của nó dựa trên `styles.css`, `TimesheetSheet.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`,
  `App.tsx` và `fixtures.ts`, không file nào FIX19 chạm. FIX19 nay đọc báo bẩn bằng layout effect của FIX13 (`DayFieldsForm.tsx:57-59`) qua
  `fieldsDirtyRef`; một cập nhật state từ layout effect render lại trước khi trình duyệt nhả luồng, nên ref có báo cáo ngay trong task của lần
  gõ phím, và mọi ca giữ (ghi chú đã gõ, tick WFH, chọn loại ngày, giờ nghỉ) đều đi nhánh giữ. Vẫn hiệu lực.
- **RECHECK-B3 (vùng B):** không file máy chủ nào đổi; `dist/server` và `dist/domain` giống hệt giữa các bản build sạch của tôi cho d96df5d
  và đích (232 file), `package.json` và lockfile cũng vậy, nên container drill (209/0, REGATE11) và `npm audit` (0) được mang tiếp. Vẫn hiệu
  lực.
- **Phán quyết về việc tab quay lại (mục 2 của AUDIT-INT2):** vẫn đúng theo docs/03:24 và :40. FIX19 đã ghi nó vào docs/04:69 ("and so does
  the tab coming back into view"), khớp với `ClockProvider.tsx:111-118`: phiên bản tăng khi `visibilitychange` sang visible trên các màn hình
  của chính người dùng, không khi cửa sổ nhận focus và không trong khung nhìn chia sẻ. R-UX5I2-2 đã đóng.

## 6. Sức mạnh test: đột biến riêng cho thay đổi của FIX19

Mỗi đột biến được áp vào `export-mut` (đúng một lần xuất hiện của chuỗi cần tìm; `90-mutate.mjs.txt`), build lại client, và chạy các test
FIX18 và FIX19 của bộ test như bộ test vẫn chạy (`day-editor.spec.ts -g "WP5-UX5-FIX19|WP5-UX5-FIX18"`, máy tính: chạy 11 test FIX19 và 4
test FIX18, test điện thoại của FIX18 bị bỏ qua). Một đột biến sống sót sau đó chạy với sáu file spec chạm trình sửa ngày và đồng hồ (`day-editor`, `controls`, `focus-ring`,
`keyboard-access`, `sharing`, `today`; máy tính). Mọi đột biến cũng chạy với probe ghi ca của tôi (máy tính). Rồi file được khôi phục và so
từng byte (`50-mut-apply.txt`). MY10 chạy trong bản clone sạch.

| Đột biến (`DayEditor.tsx` trừ khi ghi khác) | Bộ test (test FIX18 + FIX19) | Sáu file spec | Probe của tôi | Đánh giá |
|---|---|---|---|---|
| MY1 nhánh giữ nhận entry của kết quả (và do đó phiên bản của nó) | bị diệt: G3 ở `day-editor.spec.ts:2805` (không có thông báo cũ; lần lưu được nhận) | - | 11 lỗi (S2-S5, S8a, X2 x2, X2L x2, X6b, H2) | đúng lý do |
| MY2 nhánh giữ nhận WFH của kết quả | sống sót (15 đạt) | sống sót (212 đạt) | bị diệt: X2 sau khi tab quay lại và sau lần ghi thứ hai (WFH bị ghi đè) | lỗ hổng test: G3 đổi ghi chú và WFH cùng lúc, nên riêng ghi chú đang giữ đã đủ tách một lần đọc sau |
| MY3 nhánh giữ nhận số phút nghỉ của kết quả | sống sót | sống sót | bị diệt: X2L số phút nghỉ (bị ghi đè) | lỗ hổng test, cùng dạng |
| MY4 không gõ gì: không khởi động lại | bị diệt: G1 `:2743`, G2 `:2774` (biểu mẫu giữ ghi chú cũ) | - | 8 lỗi | đúng lý do |
| MY5 `heldDay` chỉ đặt một lần, ở ngày tải đầu tiên | sống sót | sống sót | bị diệt: S10 (lần lưu của chính trình sửa, một ghi chú mới và một lần lưu ca kết thúc bằng một lần từ chối nhầm) | lỗ hổng test; từ chối nhầm, không mất dữ liệu |
| MY6 báo bẩn không bao giờ tới ref | bị diệt: G3 `:2801` (ghi chú đã gõ mất vì khởi động lại) | - | 12 lỗi | đúng lý do |
| MY7 lần xóa quay về `saved()` | bị diệt: G2 `:2774` | - | S3, X6b | đúng lý do |
| MY8 đánh giá theo phiên bản entry thay vì các trường | sống sót | sống sót | bị diệt: S7 (Add session trên ngày chưa có entry từ chối một ghi chú đã gõ) | lỗ hổng test; từ chối nhầm, không mất dữ liệu |
| MY9 khởi động lại cả khi các trường giống nhau | bị diệt: G4 `:2831` (ghi chú đã gõ bị mất) | - | S7, S10, X6a | đúng lý do |
| MY11 bỏ phép so WFH của FIX18 (chốt B của FIX19) | bị diệt: B (WFH) `:2884` | - | S5, X2 x2 | đúng lý do; R-UX5I2-1 đã đóng |
| MY12 bỏ việc chặn khi xác nhận xóa đang mở của FIX18 (chốt N của FIX19) | bị diệt: N `:2922` (lần xóa trả 200, không phải 409) | - | không (probe của tôi không có ca N) | đúng lý do; R-UX5I2-1 đã đóng |
| MY10 `scripts/source-digest.mjs`: `maxBuffer` đầu về lại 1 MiB (clone sạch) | không test nào chạy script | - | `npm run digest` exit 1, ENOBUFS | chỉ bị bắt khi chạy nó |

Bảy trong mười một đột biến của `DayEditor.tsx` làm bộ test hỏng, mỗi cái ở đúng assertion nêu quy tắc (`50-mut-suite-reasons.txt`). Bốn
cái sống sót qua bộ test và sáu file spec và chỉ hỏng ở probe của tôi (R-UX5I3-4). Mọi đột biến được khôi phục đúng từng byte; sau đó `src/`,
`tests/` và `scripts/` của `export-mut` bằng bản export sạch và `dist/` build lại bằng bản build của đích (`51-mut-restored.txt`). Mười đột
biến riêng của FIX19 đã được REGATE14 chạy lại và làm hỏng đúng test đã nêu; tôi không chạy lại chúng.

## 7. Kiểm tra bắt buộc (export sạch, lần lượt từng cái, một mình trên máy)

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `npm ci` | 0 (162 gói; "6 vulnerabilities (4 moderate, 2 high)", các khuyến cáo chỉ ở dev R-UX5B-2, như ở REGATE13 và REGATE14) | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không dòng cảnh báo hay deprecation nào (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 file, 2.397 test (45,8 s) | `03-npmtest.txt` |
| `npm run build` | 0; chunk vào `index-PcdqNPHg.js` 493,05 kB (đúng tên FIX19 và REGATE14 đã ghi), CSS 96,06 kB; không có khuyến cáo kích thước chunk | `03-build.txt` |
| FULL e2e, đồng hồ thật, máy tính (16:18:45-16:29:03Z) | exit 0: 484 đạt, 36 bỏ qua, 0 lỗi (10,3 phút) | `04-e2e-desktop.txt`, `04-e2e-counts.txt` |
| FULL e2e, đồng hồ thật, điện thoại (16:29:04-16:35:29Z) | exit 0: 408 đạt, 112 bỏ qua, 0 lỗi (6,4 phút) | `04-e2e-mobile.txt` |
| AC-13 theo Asia/Kathmandu (`TZPROBE` offset -345, UTC+05:45) | 0: 1/1 | `05-ac13-asia-kathmandu.txt` |
| chạy bảy file lúc 2026-10-27T06:58:30Z, wrapper FIX10 (`shiftclock.mjs` giống từng byte file FIX10), 6 worker (16:35:35-16:41:55Z) | exit 0: 400 đạt, 100 bỏ qua, 0 lỗi (máy tính 234/16, điện thoại 166/84; 6,3 phút); test vượt nửa đêm `today.spec.ts:627` trên máy tính 1,1 phút (đã vượt), điện thoại 2,6 s | `08-seven-1026.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

Các con số bằng của FIX19 và REGATE14: từ 473/36 và 408/101 của REGATE13, máy tính +11 đạt (mười một test mới của FIX19) và điện thoại +11
bỏ qua (cùng các test đó trên project điện thoại). Không lần chạy nào lỗi, nên không cần chạy lại vì lỗi mạng hay bộ đệm và không cần phân
loại tải. Các dòng cảnh báo duy nhất trong log e2e là thông báo của Node rằng `NO_COLOR` bị bỏ qua vì `FORCE_COLOR` được đặt (worker của
Playwright đặt nó), không phải deprecation.

## Phát hiện

Không có. Lần kiểm lại này không chứng minh được lỗi nào của snapshot; những gì tôi tìm thấy hoặc là theo thiết kế và đã ghi tài liệu, hoặc
có từ trước bên ngoài vòng 4 và 5, hoặc là một mục sức mạnh test (mục tiếp theo).

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

Mới, từ audit này:
- **R-UX5I3-1, một quy tắc chung cho lần theo kịp và lần ghi ca khi chưa gõ gì.** Sau một thay đổi ở nơi khác đối với các trường của ngày,
  việc tab quay lại hoặc thao tác đồng hồ của trang giữ nguyên cả ngày đang giữ trên màn hình, kể cả ca và số liệu, đến khi có một lần ghi
  hoặc "Reload day" (X7: thiết bị khác rút ngắn một ca và đổi ghi chú; ngăn kéo giữ cả hai giá trị cũ), trong khi một lần ghi ca ở cùng
  trạng thái khởi động lại biểu mẫu từ kết quả. An toàn (lần lưu bị từ chối) và đã ghi tài liệu (docs/04:69). Tùy chọn: để lần theo kịp nhận
  `withHeldDayFields(held, fresh)` khi các trường khác nhau (ca và số liệu theo kịp, trường và phiên bản giữ nguyên) và khởi động lại biểu
  mẫu từ lần đọc mới khi chưa gõ gì, đúng quy tắc FIX19 đã đặt cho lần ghi ca.
- **R-UX5I3-2, nhánh giữ im lặng đến khi lưu.** Sau một lần ghi ca ở nhánh giữ, trình sửa nói "Session saved." và không gì khác; số liệu là
  của kết quả, tính với các trường đã đổi ở nơi khác, trong khi biểu mẫu hiện các trường đang giữ; người dùng chỉ biết về thay đổi khi lần
  lưu bị từ chối và rồi gõ lại chỉnh sửa sau "Reload day". Lý do FIX19 không hiện thông báo cũ sớm là hợp lý (nó nói "Nothing was saved").
  Tùy chọn: một ghi chú lịch sự ngắn ở nhánh giữ, việc cần một thông điệp mới.
- **R-UX5I3-3, tiêu điểm sau "Save day fields" và "Reload day" (có từ trước, từ WP2-T10).** Nút Save bị vô hiệu khi đang bận
  (`DayFieldsForm.tsx:105`), nên tiêu điểm rơi về body sau mọi lần lưu các trường của ngày, được nhận hay bị từ chối; "Reload day" gỡ chính nút
  của nó, nên tiêu điểm lại rơi về body (ngăn kéo máy tính và bottom sheet điện thoại, sáng và tối; `47-axe-lines.txt`, S2, P2). Thông báo
  vẫn được đọc lên và axe không báo gì, nhưng phím Tab tiếp theo của người dùng bàn phím bắt đầu từ đầu trang. Ở 8e55710 cũng vậy. Tùy chọn,
  nhỏ: giữ nút có thể nhận tiêu điểm khi bận (`aria-disabled`) và chuyển tiêu điểm sau "Reload day" tới tiêu đề "Category and leave" hoặc
  trường đầu tiên.
- **R-UX5I3-4, sức mạnh test của thay đổi FIX19** (mục 6). MY2, MY3, MY5 và MY8 sống sót qua các test của FIX18 và FIX19 và sáu file spec
  chạm trình sửa, và chỉ hỏng ở probe của tôi. MY2 và MY3 sẽ đưa sự ghi đè lặng lẽ trở lại cho một thay đổi chỉ của WFH hoặc chỉ của giờ
  nghỉ, nếu sau đó có tab quay lại hoặc một lần ghi thứ hai (G3 của FIX19 đổi ghi chú và WFH cùng lúc). MY5 và MY8 sẽ gây một lần từ chối
  nhầm (sau lần lưu của chính trình sửa; sau Add session trên ngày chưa có entry). Sản phẩm đúng ở mọi probe, nên đây là mục tùy chọn: thêm
  X2 (chỉ WFH, cả hai bước sau), X2L (chỉ giờ nghỉ), S10 và S7 từ `90-zz-int3-session.spec.ts.txt` vào `day-editor.spec.ts`.

Cập nhật từ AUDIT-INT2:
- R-UX5I2-1 (các chốt chặn của FIX18 chỉ được ghim một phần): **đã đóng** bởi các test B (năm trường), N và O của FIX19; các đột biến của
  REGATE14 và MY11, MY12 của tôi làm chúng hỏng.
- R-UX5I2-2 (docs/04:69 chỉ nêu Check in và Check out): **đã đóng** bởi mệnh đề tab quay lại ở EN và VI.
- **R-UX5I2-3, mặc định của lịch không có phiên bản để bảo vệ nó** (có từ trước; để ra ngoài FIX19 vì là một lựa chọn hành vi): nay được thấy
  cả với một ngày mà entry giữ mặc định của lịch và trên đường ghi ca. Một lần quản trị viên nhập ngày lễ đổi loại ngày hiển thị mà không có
  phiên bản entry mới; khi có chỉnh sửa đã gõ, nhánh giữ giữ "Worked" và lần lưu ghi nó tường minh đè lên mặc định Holiday mới (E3, trên
  d96df5d cũng vậy); khi chưa gõ gì, FIX19 nay hiện Holiday (E4; d96df5d đã ghi Worked). Biểu mẫu hiện "Calendar default. Saving records it as
  your choice." dưới loại ngày cũ. Tùy chọn (quyết định của chủ sở hữu): chỉ gửi loại ngày khi người dùng đã đổi nó, hoặc từ chối khi mặc định
  đã đổi kể từ lúc tải. Nên quyết trước pilot, vì một ngày lễ bị ghi thành Worked làm đổi thời gian bắt buộc của ngày đó.

Mang tiếp từ AUDIT-INT và AUDIT-INT2, trạng thái ở đích này: R-UX5I-1 (cách chủ sở hữu thấy một lần gửi bị giữ), R-UX5I-2 (nửa focus của
test vượt nửa đêm ở thời điểm của gate; lần chạy bảy file của tôi đi cùng nhánh, máy tính 1,1 phút), R-UX5I-3 (quy tắc tải chưa thành chuẩn),
R-UX5I-4 (các mục câu chữ) không đổi; các rủi ro ở mục 1.6 của AUDIT-INT giữ trạng thái của chúng; rủi ro UX4-A 1 (ngăn kéo nổi đặt bên
phải có thể che Check out của trang với con trỏ) không đổi, và các ca 1280px của tôi đặt tiêu điểm vào nút trước như test của FIX18.

## Backlog tùy chọn cho handoff WP5 (đã cập nhật; không mục nào chặn)

1. Sức mạnh test, vùng A: R-A3-1, R-A3-2, R-A3-3, MA5, R-UX5I-2, **R-UX5I3-4** (R-UX5I2-1 đã đóng).
2. Sức mạnh test, vùng B: R-UX5B4-1, R-UX5B4-2, R-UX5B-5, G6.
3. Tài liệu và chú thích: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4 (R-UX5I2-2 đã đóng).
4. Gia cố sản phẩm tùy chọn: R1, R2, cú nhảy 8 px một khung hình của DIAG5, R-UX5B2-1, R-UX5B2-2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8,
   UX4-A 1, 3, 4, 9, **R-UX5I2-3 (đã cập nhật; quyết định của chủ sở hữu, nên trước pilot)**, **R-UX5I3-1**, **R-UX5I3-2**, **R-UX5I3-3**
   (khả năng tiếp cận).
5. Kiểm trên thiết bị khi pilot (NOT VERIFIED ở đây): R-A2-1, R-A2-2, UX4-A 8, thanh cuộn chiếm chỗ ở trình duyệt khác (docs/12:108); chủ sở
   hữu tự xem các mẫu PDF so với B11.
6. Quy trình và harness: độ nhạy tải của lượt quét logo (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (khuyến cáo chỉ ở dev, vẫn "6 vulnerabilities
   (4 moderate, 2 high)" trong `npm ci`), R-UX5B-4, R-UX4B-6, nhánh điện thoại của test vượt nửa đêm. Script digest chạy được trở lại
   (F-UX5I2-2 đã đóng); không test nào chạy nó, nên bước phát hành ở docs/12:7 là lần kiểm duy nhất của nó.
7. Các quyết định của coordinator đã báo chủ sở hữu, không hỏi: như mục 7 của AUDIT-INT, cộng việc đọc lại khi tab quay lại của FIX18 (được
   AUDIT-INT2 đánh giá là đúng), nhánh giữ im lặng của FIX19 (R-UX5I3-2) và việc hoãn R-UX5I2-3.

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ, và không cái nào cần chạy lại. Không do tôi chạy, theo phạm vi brief: container drill và `npm audit`
(mang tiếp từ REGATE11: `dist/server`, `dist/domain`, `package.json` và lockfile giống hệt), năm lượt quét còn lại (REGATE14 đã chạy cả sáu),
ảnh chụp màn hình. Các mục NAS vẫn NOT VERIFIED. Các lần chạy probe của tôi trên d96df5d hỏng đúng ở những chỗ FIX19 đổi hành vi, theo
thiết kế; không lần chạy probe nào của tôi có lỗi probe.

## Xử lý các phát hiện trước

- **F-UX5I2-1 (Medium): đã đóng** (mục 1 và 3); tái hiện trên d96df5d bằng G1 và G2 của AUDIT-INT2 và 21 ca của tôi, đã sửa trên đích.
- **F-UX5I2-2 (Low): đã đóng** (mục 2).
- F-UX5I-1 vẫn đóng; mọi xử lý khác của AUDIT-INT và AUDIT-INT2 đứng vững (mục 5).
- Lần PASS này nghiệm thu lại WP5 sau vòng thay đổi UI 4 và 5 và thay RECHECK-A2 (PASS trên ff73565b) và RECHECK-B3 (PASS trên 69c6daff)
  làm nghiệm thu hiện hành, ở 0b45781 / 67aa715c.

## Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot

Sẵn sàng phần mềm cho vòng 4 và 5 được xác lập lại ở 0b45781 / 67aa715c bởi lần kiểm lại này và REGATE14 (PASS); ACCEPT-DOCS (định danh
phát hành ở docs/12:7) vẫn còn phải làm. Phép của chủ sở hữu: chưa xin, chưa có. Kết quả pilot: không có; NAS vẫn NOT VERIFIED. Không chạm gửi
thật hay triển khai thật (chỉ capture cục bộ, người dùng tổng hợp `example.invalid`).

## Một bước tiếp theo

Nghiệm thu lại WP5 và ACCEPT-DOCS trên 0b45781 / 67aa715c (định danh phát hành của docs/12 với digest này, làm mới bằng `npm run digest`),
mang backlog tùy chọn ở trên, R-UX5I2-3 trước tiên, vào handoff WP5 cho chủ sở hữu.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX5-AUDIT-INT3 attempt 1; agent reviewer `a89b2f7f5fa303382` (board); tác giả
  của snapshot là các planner, worker, fixer và diagnoser của WP5-UX4 và WP5-UX5 trên board, ví dụ WP5-UX5-FIX19 `ab09a2f01997d2bf3`,
  WP5-UX5-FIX18 `a9afbdb91d41abb10`, WP5-UX5-FIX17 `a4b1c3c982a5be9ee`, WP5-UX5-PLAN `a2066720d8bdcb583`.
- Context mới; tôi không viết thay đổi nào được kiểm. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng chứng,
  và không stage hay commit gì.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE14 PASS.
- Đường dẫn report mới: `handoff/delivery/WP5_UX5_REVIEW_INT3.md` (+ `.vi.md`); mọi review trước không bị đụng tới.
- Xử lý phát hiện và task tiếp của coordinator: F-UX5I2-1 và F-UX5I2-2 đã đóng; không có phát hiện mới; R-UX5I3-1..4 tùy chọn; bước tiếp ở
  trên.
