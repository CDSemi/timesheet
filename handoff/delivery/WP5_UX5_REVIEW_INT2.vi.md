# WP5 vòng thay đổi UI 4 và 5, kiểm tích hợp lại sau FIX18 trên d96df5d (WP5-UX5-AUDIT-INT2)

Bản dịch của [WP5_UX5_REVIEW_INT2.md](WP5_UX5_REVIEW_INT2.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP5, vòng thay đổi UI 4 và 5 theo yêu cầu của chủ sở hữu, lần kiểm tích hợp
  lại mà nếu PASS sẽ nghiệm thu lại WP5 và thay RECHECK-A2 cùng RECHECK-B3 làm nghiệm thu hiện hành; task WP5-UX5-AUDIT-INT2, attempt 1,
  2026-10-29 từ 11:49:52Z đến khoảng 13:10Z. Model reviewer tự báo `claude-opus-5-5` (agent trên board `aec1aeea85222dbd9`), profile
  timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model tác giả mạnh nhất của gói trên board là
  `claude-opus-5-5` (18 task tác giả); bản thân FIX18 là `claude-sonnet-5-5`, nên reviewer không yếu hơn. Agent id của tôi chỉ có trên
  board ở task này: tôi không viết task WP5-UX4 hay WP5-UX5 nào và không audit nào của chúng.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `d96df5daa25b44b156354bc96605e13e94e44396` (WP5-UX5-FIX18-FREEZE, đã push; là `freeze_commit` của WP5-UX5-REGATE13). HEAD = origin/main =
  commit đó trước và sau; không có dòng trạng thái nào ngoài `handoff/` trước hay sau. Digest
  `6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb`, 882 file, không gồm `handoff/`, bằng nhau lúc 11:51:40Z và 13:01:39Z
  theo ba dạng: bản export `git archive` sạch băm bằng `git hash-object --no-filters`, dạng `git ls-tree` trên đích (hai danh sách đã sắp
  xếp giống nhau từng byte) và một bản sao `scripts/source-digest.mjs` của đích có bộ đệm rộng, chạy trong một bản clone nháp và trong
  repository. Chính `npm run digest` của đích thất bại với `spawnSync git ENOBUFS` trong repository và cả trong một bản clone sạch không có
  file chưa theo dõi nào (phát hiện F-UX5I2-2). Không có commit chưa push. Source đủ: `npm ci` exit 0 trong bốn bản export. Snapshot được
  nghiệm thu gần nhất là 8e557100d16b6b6eb86a48e00276835761aabfdf (digest 507de97c); 223 đường dẫn ngoài `handoff/` khác nhau giữa nó và đích.
- **Quyết định: FIX REQUIRED.** F-UX5I-1 đã đóng: trên máy tính, trình sửa ngày đang mở nay theo Check in và Check out của trang ở 1440px
  (cạnh bảng) và 1280px (nổi), giữ ghi chú đã gõ và lưu được nó; một thay đổi ở nơi khác đối với các trường của ngày vẫn bị từ chối (thiết
  bị khác, tab khác, phiên của người được cấp quyền, thay đổi lịch của quản trị viên). Thiết kế của FIX18 hợp lý và việc đọc lại khi tab
  quay lại là đúng theo docs/03. Nhưng khi kiểm lại "không trường cũ nào ghi đè", tôi tìm thấy một lỗi Medium có từ trước vòng 4, 5 và FIX18:
  - **F-UX5I2-1 (Medium):** sau một lần lưu ca, một "Confirm breaks" hoặc một lần xóa trong trình sửa đang mở, trình sửa nhận ngày của máy
    chủ, gồm cả các trường của ngày đã đổi ở nơi khác và phiên bản entry mới hơn của chúng, trong khi biểu mẫu các trường của ngày vẫn giữ
    giá trị cũ; lần "Save day fields" tiếp theo khi đó ghi đè lặng lẽ thay đổi ở nơi khác. Tái hiện trên đích và trên a5cbc91; theo code
    nó có từ WP2-T10. Đây là đường `saved()` mà AUDIT-INT nêu làm mẫu cho FIX18; chính FIX18 thêm một chốt chặn mà đường này thiếu.
  - **F-UX5I2-2 (Low):** từ commit này trở đi, `npm run digest` thất bại ở mọi bản checkout (riêng danh sách file đã theo dõi đã là
    1.063.240 byte, vượt bộ đệm mặc định 1 MiB của Node), và mục "Release identity" của docs/12 dùng đúng lệnh đó cho digest phát hành.

  Mọi thứ khác trong phạm vi đều đứng vững: hồi quy của thay đổi client (mục 3), việc mang tiếp các phán quyết của AUDIT-INT qua diff
  FIX18 (mục 4), và mọi kiểm tra bắt buộc (mục 6). Tám đột biến tự viết: hai bị bộ test bắt, năm chỉ bị probe của tôi bắt, một tương đương
  (mục 5).

## Phạm vi thật đã xem và chạy

1. Đọc như lời khẳng định, không như bằng chứng: brief; AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"); docs/08 "Gates and
   independent audit"; WP5_REVIEW; toàn bộ `WP5_UX5_REVIEW_INT.md` (+ VI); brief và Results của FIX18 và REGATE13 cùng bằng chứng
   (`22-fix18-*`, `32-mutants.txt`, `62-m6-run.txt`); `WP5_UX5_RECHECK_A2.md` và `WP5_UX5_RECHECK_B3.md`; docs/04 và docs/12, EN và VI;
   docs/03 (các quy tắc phiên bản); các mục board của task này, REGATE13, FIX18, FIX18-FREEZE, AUDIT-INT, RECHECK-A2, RECHECK-B3 và model
   tác giả của WP5.
2. Code: diff FIX18 (`git diff a5cbc91..d96df5d`, năm đường dẫn, +271/-3); toàn bộ `DayEditor.tsx`; `TimesheetScreen.tsx` (effect đồng hồ,
   bộ nghe focus và visibility, làm mới sau nhãn và lô, chỗ gắn trình sửa); `ClockProvider.tsx` (một bộ đếm `version` duy nhất:
   `afterAction` :99-102, `onVisible` :111-115); `DayFieldsForm.tsx` (bản nháp khởi tạo một lần mỗi lần gắn :51-53, phiên bản đọc lúc lưu
   :85); `SessionDialog.tsx:549`; `timesheetCommands.ts` phía máy chủ (`ensureDayEntry` :149-176, `applyDayEntryChange` :328-420,
   `createSession`, `updateSession`, `deleteSession`, `clockIn` :557-584, `clockOut` :592-) và `buildDayView` của `timesheets.ts` :356-400;
   `scripts/source-digest.mjs`; lịch sử khóa của biểu mẫu các trường của ngày (`git log -S`).
3. Kiểm tra bắt buộc trong một bản export `git archive` sạch của đích có `npm ci` riêng (`export`), lần lượt từng cái và một mình trên máy,
   có điều tra tải trước và sau mỗi lần chạy e2e.
4. Probe riêng trong bản export thứ hai của đích (`export-probe`, `npm ci` và build riêng; chỉ thêm các file `zz-int2-*.spec.ts` của tôi và
   probe của AUDIT-INT), và cùng các probe đó trong một bản export của a5cbc91 (`export-prev-probe`) để tách hành vi của FIX18 khỏi những gì
   đã có trước.
5. Tám đột biến tự viết cho thay đổi của FIX18 trong bản export thứ ba (`export-mut`), mỗi cái được khôi phục đúng từng byte; bản build sau
   khôi phục bằng bản build của đích.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX5-AUDIT-INT2/` (mục lục `00-README.txt`); mã nguồn probe, đột
biến và script được giữ dưới dạng `90-*.txt`; các lần lỡ quy tắc của tôi ở `99-slips.txt`.

| Lệnh hoặc probe | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, trạng thái ngoài `handoff/`, digest (export, ls-tree, script bộ đệm rộng), đầu và cuối | d96df5d = origin/main; không dòng nào; `6937d79c…61cb`, 882 file, lúc 11:51:40Z và 13:01:39Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm run digest` của đích, repository và clone sạch | exit 1, `spawnSync git ENOBUFS` ở cả hai | `01-digest-*.txt`, `31-digest-script-enobufs.txt` |
| diff và phạm vi FIX18 | đúng năm đường dẫn của FIX18; không có gì giữa đích và HEAD | `20-*`, `22-fix18-src-diff.txt`, `22-fix18-docs-diff.txt` |
| build sạch của a5cbc91 và của đích | `dist/server` và `dist/domain` giống hệt (232 file); `dist/client`: chunk vào, `index.html` và tên năm chunk tải lười | `41-dist-compare.txt` |
| kiểm tra bắt buộc (mục 6) | đều exit 0; FULL 473/36/0 và 408/101/0; chạy bảy file 389 đạt, 0 lỗi; AC-13 1/1 | `03-*`, `04-*`, `05-*`, `08-*` |
| probe của AUDIT-INT, đích và a5cbc91 | đích đạt 3/3 (trình sửa theo kịp; ghi chú lưu được); a5cbc91 ca có ghi chú hỏng ở bước lưu (tái hiện F-UX5I-1 trên bản gốc) | `44-auditint-probe-*.txt`, `48-log-auditint-*.txt` |
| probe riêng A-P (theo kịp, kiểm phiên bản, tab quay lại, đường saved(), hồi quy), đích | 19 test, đều exit 0 (G1 và G2 ghi lại việc ghi đè); kết quả ở mục 1-3 | `45-obs-follow-target*.txt`, `48-log-follow-target*.txt` |
| probe riêng E (quản trị viên nhập ngày lễ), đích | E1 bị từ chối; E2 được nhận (mục 2) | `46-obs-admin-target-2.txt` |
| cùng các probe trên a5cbc91 (`INT2_NO_FOLLOW=1`) | A, B, C, D, F1, F2, G1, G2, N, E như ghi lại; O không áp dụng (không có lần đọc theo kịp) | `45-obs-follow-prev-run1.txt`, `45-obs-follow-prev-2.txt`, `46-obs-admin-prev-2.txt` |
| axe-core 4.14.0 (từ npm registry vào thư mục task; cùng SHA-256 với bản của REGATE13) | 16 lần quét, 0 vi phạm | `47-axe-lines.txt`, `48-log-axe-target.txt` |
| tám đột biến tự viết | MX1, MX8 bị bộ test bắt; MX3-MX7 chỉ bị probe của tôi bắt; MX2 tương đương; đều khôi phục đúng từng byte | `50-*`, `51-*`, `52-log-mut-*.txt` |
| điều tra tải trước và sau mỗi lần chạy | 0,64-1,02 lõi bận trên 32 quanh các lần chạy bắt buộc, 0,61-1,53 qua cả 19 lần điều tra; 0,73 lúc kết thúc | `10-census-*.txt` |

## 1. F-UX5I-1: trình sửa ngày đang mở trên máy tính và Check in, Check out của trang

**Đã đóng.** FIX18 tăng `editorFollow` theo mỗi lần phiên bản đồng hồ đổi (`TimesheetScreen.tsx:309-316`, `:833`); ngăn kéo đọc
`GET /days/<date>` và nhận kết quả bằng `setDay` không tăng `generation` (`DayEditor.tsx:250-263`), nên các biểu mẫu và những gì đã gõ vẫn còn.

- **Probe của AUDIT-INT** (`90-zz-int-clock-editor.spec.ts.txt`, chạy nguyên): trên đích cả ba ca đều đạt: ở 1440px và 1280px trình sửa
  hiện thẻ Running sau Check in của trang và thẻ đã kết thúc sau Check out, và khi gõ ghi chú trước thì "Save day fields" lưu được nó
  (`44-auditint-probe-target.txt`). Trên a5cbc91 trình sửa không hiện thẻ nào và ca có ghi chú hỏng ở bước lưu (tái hiện F-UX5I-1,
  `44-auditint-probe-prev.txt`). Một dòng "reopened" của probe đó đọc các thẻ trước khi lần đọc của trình sửa mở lại trả lời (mỗi commit
  một lần); đó là lỗi thời điểm của probe, không phải tác động của sản phẩm.
- **Probe A của tôi** (một ngày đã có trường lưu sẵn: WFH bật và một ghi chú; 1440px cạnh bảng và 1280px nổi, ngăn kéo nổi neo bên trái;
  Check in bằng bàn phím): mỗi thao tác đồng hồ một lần đọc ngày; thẻ Running, rồi thẻ đã kết thúc ("Checked in and out"); ghi chú đã gõ và
  WFH vẫn còn; không hỏi gì; tiêu điểm ở lại nút đồng hồ của trang ("Check out", rồi "Check in"), không bao giờ về body; trình sửa không thêm
  alert, status hay vùng live nào; Escape sau lần theo kịp vẫn hỏi "Discard your changes?" và Keep editing giữ ghi chú; các số liệu được cập
  nhật (complete, giờ kết thúc dự kiến); "Save day fields" được nhận và máy chủ giữ ghi chú đã gõ, WFH bật và một ca đã kết thúc
  (`45-obs-follow-target.txt`). Trên a5cbc91 cùng ngày đó không hiện thẻ và không có số liệu, và lần lưu ở đó cũng được nhận: trước FIX18
  chỉ ngày chưa có entry mới bị từ chối, vì Check in tạo ra entry.
- Các test của chính FIX18 (T1-T4 máy tính, T5 điện thoại) đạt trong các lần chạy FULL của tôi và trong lần chạy bảy file lúc
  2026-10-27T06:58:30Z.

## 2. Kiểm phiên bản, và thiết kế của FIX18

**Check in và Check out đổi những gì** (`timesheetCommands.ts`): các ca của ngày (thêm; giờ kết thúc, giờ nghỉ, phiên bản ca), dòng
timesheet và phiên bản của nó, các dòng audit và các số liệu suy ra; `ensureDayEntry` (:149-176) chỉ tạo entry của ngày với loại ngày mặc
định của lịch, nguồn `default`, nghỉ 0, WFH tắt và ghi chú rỗng khi ngày chưa có, và không bao giờ đổi một entry đã có. Một lần lưu các
trường của ngày chỉ ghi entry (`applyDayEntryChange` :328-420) theo phiên bản riêng của entry. Vì thế một lần lưu sau lần theo kịp không thể
ghi đè giá trị mà thao tác đồng hồ đã đổi: đã thử trong A, T1/T2 và probe của AUDIT-INT (ca vẫn đã kết thúc; chỉ các trường đã gõ đổi).

**Thay đổi ở nơi khác vẫn bị từ chối** (đều trên đích, 1440px):

| Thay đổi ở nơi khác | Điều kích hoạt lần theo kịp | Kết quả |
|---|---|---|
| thiết bị khác: chỉ ghi chú / chỉ WFH / chỉ nghỉ một phần / chỉ loại ngày (B) | tab quay lại tầm nhìn | lần nào cũng bị từ chối; giá trị kia được giữ; "Reload day" hiện nó |
| một tab khác của cùng trình duyệt lưu ghi chú qua trình sửa của nó (D) | Check in của tab đầu | bị từ chối; ghi chú của tab kia được giữ |
| một phiên khác: người được cấp quyền sửa lưu ghi chú của chủ qua chia sẻ (C) | Check in của chủ | bị từ chối; "Reload day" hiện ghi chú của người được cấp quyền và ca đang chạy |
| quản trị viên nhập một ngày lễ vào ngày đang mở, ngày chưa có entry (E1) | Check in của người dùng | bị từ chối (loại ngày đang giữ khác); "Reload day" hiện Holiday |
| thiết bị khác đổi ca phía sau một xác nhận xóa đang mở (N) | tab quay lại | lần xóa bị từ chối (409, phiên bản đã tải) |
| thiết bị khác đổi ca phía sau một hộp thoại ca đang mở (T4 của FIX18) | tab quay lại | hộp thoại giữ End time đã gõ; lần lưu của nó bị từ chối |

Cùng các kết quả B, C, D, E1 và N đúng trên a5cbc91, nơi không có gì theo kịp.

**Các lựa chọn thiết kế của FIX18:**
- `sameDayFields` (`DayEditor.tsx:33-42`): đúng. Phiên bản entry mới chỉ được nhận khi các trường của ngày trên máy chủ đúng là những gì
  biểu mẫu đã khởi tạo từ đó, nên phiên bản mà biểu mẫu gửi sau này thuộc về chính các trường nó gửi. Nó so đúng những gì biểu mẫu gửi
  (loại ngày, số phút và loại nghỉ, WFH, ghi chú, với `''` cho ngày chưa có entry, như `dayFieldsDraft` khởi tạo) cộng nguồn loại ngày, vốn
  chỉ để phòng thủ (MX2 sống sót mọi thứ, và tôi không tìm thấy ca nào nó quyết định). Tiền đề của nó, "các trường của ngày đang giữ là
  điểm khởi tạo của biểu mẫu", bị phá bởi một đường cũ hơn của trình sửa: F-UX5I2-1.
- Chốt chặn hộp thoại ca (`nestedOpen`, :140-141, gồm cả xác nhận xóa): đúng. Các hộp thoại đó mang phiên bản chúng đã tải (hộp thoại ca
  được khóa theo phiên bản ca), nên thay đổi ở nơi khác vẫn kết thúc bằng lời từ chối (T4, N). Hộp thoại Partial leave không nằm trong chốt
  chặn và không cần: nó chỉ sửa bản nháp của biểu mẫu.
- Bỏ lần đọc bị vượt (`dayStamp`, do `load()` và `saved()` tăng): đúng; một lần đọc theo kịp trả lời sau lần lưu của chính trình sửa thì bị
  bỏ (probe O: lần lưu thứ hai 200).
- **Lần đọc khi tab quay lại** (đột biến M6 của FIX18): trang không phân biệt được thao tác đồng hồ của chính nó với một lần tab quay lại, vì
  `ClockProvider` tăng cùng một `version` cho cả hai, nên ngăn kéo cũng đọc ngày của nó khi tab quay lại, đúng lúc bảng phía sau tải lại
  (focus cửa sổ không tải lại cái nào; nó chỉ đọc lại `/periods/current`). M6 tương đương về tác động, như REGATE13 đã thấy: chốt chặn dữ
  liệu quyết định.

  **Việc khi đó hiện các ca đổi ở nơi khác và lần lưu các trường không đổi thành công có đúng không? Đúng.** Quy tắc quyết định là mô hình
  dữ liệu của docs/03: `timesheets/day_entries` mang "optimistic version" riêng (docs/03:24, VI :24) và mỗi thao tác kiểm "phiên bản" của
  thứ nó đổi (docs/03:40, VI :40); các ca mang phiên bản riêng (hộp thoại ca và lần xóa gửi nó). Một lần lưu các trường của ngày chỉ đổi
  entry, nên một ca đổi ở nơi khác không xung đột với nó, và không tài liệu nào coi cả ngày là một đơn vị có phiên bản duy nhất. docs/04:58
  cho trang đọc lại khi focus và visibility, và việc ngăn kéo hiện những gì máy chủ giữ là kỳ vọng AUDIT-INT đã nêu cho F-UX5I-1. Các lần
  chạy so sánh của tôi xác nhận FIX18 không làm yếu việc kiểm: a5cbc91 vốn đã nhận lần lưu đó với ngày có entry (F1: được nhận, ngăn kéo
  cũ); kết quả duy nhất FIX18 đổi là một ngày chưa có entry rồi có entry ở nơi khác do một lần ghi ca (F2: trước đây bị từ chối, chỉ vì dòng
  entry xuất hiện; nay được nhận, với các giá trị mặc định của lịch mà biểu mẫu đang giữ, nên không có gì ghi ở nơi khác bị ghi đè). Điều
  còn lại là câu chữ: câu mới ở docs/04:69 chỉ nêu Check in và Check out của trang (R-UX5I2-2).

## 3. Hồi quy của thay đổi client

| Mục | Cách kiểm | Kết quả |
|---|---|---|
| chốt chặn U4-05 sau lần theo kịp: Escape, Close, bấm ra ngoài (tiêu đề), ngày khác, Next period | probe A và H ở 1440px | mỗi lần đều hỏi "Discard your changes?"; Keep editing giữ ngăn kéo ở ngày của nó và giữ ghi chú; sau đó ghi chú lưu được |
| bộ test U4-05 (chuyển ngày, bỏ chọn, Today, bước kỳ, Close, Escape, lý do) | e2e FULL | đạt (`day-editor.spec.ts:4994`, `:5052`, `:5079`, `:5115`, `:5189`, `:5485`, `:5608` và các test khác) |
| test Escape cùng tác vụ | e2e FULL, hai project | `day-editor.spec.ts:5608` đạt trên máy tính và điện thoại |
| đường làm mới sau nhãn và lô | probe P sau lần theo kịp; các test bộ chọn trong FULL | chọn nhãn trên ngày đang mở làm trình sửa tải lại và khởi động lại biểu mẫu, không hỏi gì (ghi chú đã gõ bị bỏ, như docs/04:69 nói); lần lưu sau đó thành công; `:4589` và các test review-ở-trên đạt |
| bottom sheet của điện thoại | probe K; T5 của FIX18 | không đọc ngày khi tab quay lại; ghi chú còn; Escape hỏi; lưu từ chân sheet thành công |
| khung nhìn chia sẻ | probe L; các spec chia sẻ trong FULL | khung nhìn chia sẻ có quyền sửa của người được cấp quyền không có vùng đồng hồ và không đọc ngày khi tab quay lại; ghi chú đã gõ còn |
| giao diện theo tab khác khi trình sửa đang mở | probe I sau lần theo kịp (1280px); các spec theme trong FULL | chọn Dark ở tab khác thì tab này đổi màu; trình sửa, ghi chú và thẻ Running vẫn còn; không hỏi gì |
| tiêu điểm bàn phím và đầu ra trình đọc màn hình sau lần làm mới | probe A | tiêu điểm ở lại nút đồng hồ của trang; trình sửa không thêm alert, status hay vùng live nào; thẻ Running và thẻ đã kết thúc là nội dung thường của mục Times |
| axe-core 4.14.0, WCAG 2.0-2.2 A/AA, sáng và tối | probe J: 1440px và 1280px có ghi chú đã gõ, trước Check in, sau Check in của trang, sau Check out; sheet 390px trước và sau | 16 lần quét, 0 vi phạm; chỉ chưa kết luận `color-contrast` (và `label-content-name-mismatch` trên máy tính), như các gate trước |

Không thấy hồi quy. Rủi ro UX4-A 1 được thấy lại trong suy luận, không trong lần chạy: ở 768-1329px, ngăn kéo nổi neo bên phải có thể che
Check in và Check out của trang với con trỏ (test của FIX18 và probe của tôi đặt tiêu điểm vào nút trước, làm ngăn kéo chuyển mép); FIX18
làm luồng đó hữu ích hơn, nên rủi ro đã chấp nhận này quan trọng hơn một chút.

## 4. Mang tiếp các phán quyết tích hợp của AUDIT-INT

Diff đã kiểm: `git diff --name-status a5cbc91..d96df5d -- . ':!handoff'` (`20-namestatus-prev-target.txt`): `docs/04_UX_AND_SETTINGS.md`
và `.vi.md` (mỗi file một câu, cùng nội dung), `src/client/DayEditor.tsx` (+52), `src/client/TimesheetScreen.tsx` (+6/-1),
`tests/e2e/day-editor.spec.ts` (+211, chỉ thêm); `git diff --name-status d96df5d..HEAD` ngoài `handoff/` rỗng. Không file máy chủ, không
package hay lockfile, không helper test, không style.

- **Mọi phát hiện đã đóng:** mục 1.1 của AUDIT-INT đứng vững; F-UX5I-1 nay đã đóng (mục 1). Phát hiện mới là F-UX5I2-1 và -2.
- **Mọi mục của chủ sở hữu và mọi lần gate FAIL đã được ánh xạ:** mục 1.3 và 1.4 đứng vững. Mục duy nhất FIX18 chạm là U4-05 (ngăn kéo
  không modal): chốt chặn của nó không đổi và đứng vững sau lần theo kịp (mục 3); docs/04:69 thêm một câu ở EN và VI với cùng nội dung.
  REGATE13 không có lỗi nào, nên mục 1.4 không thêm dòng.
- **Quy tắc tải:** không đổi; REGATE13 áp dụng nó (lúc vào 0,59 và 1,02 lõi, không lỗi) và 19 lần điều tra của tôi đọc 0,61-1,53 lõi.
- **RECHECK-A2 (vùng A):** các phán quyết của nó dựa trên các file FIX18 không chạm (`styles.css`, `TimesheetSheet.tsx`, `DayFieldsForm.tsx`,
  `ThemeToggle.tsx`, `App.tsx`, `fixtures.ts`); hai điểm FIX18 gặp chúng đã được kiểm lại: báo cáo dirty của FIX13 sau lần theo kịp (A, H)
  và giao diện theo tab khác của FIX14 sau lần theo kịp (I). Vẫn còn hiệu lực.
- **RECHECK-B3 (vùng B):** không file máy chủ nào đổi; các bản build sạch của tôi cho `dist/server` và `dist/domain` giống hệt nhau giữa
  a5cbc91 và đích (`41-dist-compare.txt`), nên drill và `npm audit` mang tiếp từ REGATE11. Vẫn còn hiệu lực.

## 5. Sức mạnh test: đột biến tự viết cho thay đổi của FIX18

Mỗi đột biến được áp vào `export-mut`, build lại client, chạy các test của FIX18 và hai test phiên bản cũ (máy tính); đột biến sống sót thì
được chạy tiếp với sáu file spec chạm cả đồng hồ lẫn trình sửa ngày (`day-editor`, `controls`, `focus-ring`, `keyboard-access`, `sharing`,
`today`; mỗi lần 201 đạt, 19 bỏ qua) và với các ca probe A, B, N và O của tôi; rồi khôi phục đúng từng byte.

| Đột biến | Bộ test | Probe của tôi | Đọc kết quả |
|---|---|---|---|
| MX1 `sameDayFields` bỏ so ghi chú | bị bắt: T3 ở thông báo cũ (`day-editor.spec.ts:2584`) | bị bắt: B chỉ ghi chú | đúng lý do, nhưng T3 bắt được chỉ vì T1/T2 chạy trước trong file để lại hôm nay với entry tường minh; chạy riêng, T3 còn khác cả ở nguồn loại ngày |
| MX2 bỏ so nguồn loại ngày | sống sót | sống sót | tương đương về tác động: khi chỉ nguồn khác, các trường biểu mẫu gửi bằng các trường của máy chủ, nên không gì ghi ở nơi khác có thể mất |
| MX3 bỏ so WFH | sống sót (201 đạt) | bị bắt: B chỉ WFH (được nhận, WFH bị ghi đè) | lỗ hổng test |
| MX4 bỏ so nghỉ một phần | sống sót | bị bắt: B chỉ nghỉ một phần | lỗ hổng test |
| MX5 xác nhận xóa đang mở không còn chặn lần theo kịp | sống sót | bị bắt: N (lần xóa ca đã đổi ở nơi khác không bị từ chối) | lỗ hổng test |
| MX6 lần đọc theo kịp bị vượt không còn bị bỏ | sống sót | bị bắt: O (lần lưu thứ hai bị từ chối) | lỗ hổng test |
| MX7 `saved()` không còn đánh dấu ngày mới hơn | sống sót | bị bắt: O | lỗ hổng test |
| MX8 chốt chặn đòi cả cùng phiên bản entry | bị bắt: T1 và T2 ở thẻ Running | - | đúng lý do (entry vừa tạo phải được nhận) |

Các test của FIX18 ghim chính lần theo kịp (M1, M2 của nó và MX8 của tôi), chốt chặn hộp thoại (M4), cổng điện thoại (M5) và chốt chặn
trường như một khối (M3); chúng không ghim phép so WFH và nghỉ, việc chặn khi xác nhận xóa đang mở hay việc bỏ lần đọc bị vượt. Sản phẩm
đúng trong mọi probe, nên đây là mục sức mạnh test tùy chọn (R-UX5I2-1), tốt nhất thêm trong vòng sửa F-UX5I2-1.

## 6. Kiểm tra bắt buộc (export sạch, lần lượt, một mình trên máy)

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `npm ci` | 0 (162 package; tóm tắt audit "6 vulnerabilities (4 moderate, 2 high)" bằng của REGATE13: các khuyến cáo chỉ ở dev R-UX5B-2) | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không dòng deprecation nào (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 file, 2.397 test (45,6 s) | `03-npmtest.txt` |
| `npm run build` | 0; chunk vào `index-D6YCEv6o.js` 492,70 kB, CSS 96,06 kB; không cảnh báo kích thước chunk | `03-build.txt` |
| e2e FULL, đồng hồ thật, máy tính (11:58-12:08Z) | exit 0: 473 đạt, 36 bỏ qua, 0 lỗi (10,6 phút) | `04-e2e-desktop.txt`, `04-e2e-counts.txt` |
| e2e FULL, đồng hồ thật, điện thoại (12:08-12:15Z) | exit 0: 408 đạt, 101 bỏ qua, 0 lỗi (6,3 phút) | `04-e2e-mobile.txt` |
| AC-13 theo Pacific/Auckland (`TZPROBE` offset -780) | 0: 1/1 | `05-ac13-pacific-auckland.txt` |
| chạy bảy file lúc 2026-10-27T06:58:30Z, wrapper FIX10 (`shiftclock.mjs` cùng SHA-256 với file FIX10), 6 worker | exit 0: 389 đạt, 0 lỗi (máy tính 223/16, điện thoại 166/73); test vượt nửa đêm trên máy tính 1,1 phút, điện thoại 2,5 s | `08-seven-1026.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

Không lần chạy nào lỗi, nên không cần chạy lại vì lỗi mạng hay bộ đệm. Các dòng cảnh báo duy nhất trong log e2e là thông báo của Node rằng
`NO_COLOR` bị bỏ qua vì `FORCE_COLOR` được đặt (worker của Playwright đặt nó), không phải deprecation.

## Phát hiện

1. **F-UX5I2-1, Medium - một lần ghi ca trong trình sửa ngày đang mở khiến lần "Save day fields" sau đó ghi đè các trường của ngày đã đổi ở
   nơi khác** (`src/client/DayEditor.tsx:279-288` `saved()`, được gọi sau một lần lưu ca, một "Confirm breaks" (`:563-566`, từ
   `SessionDialog.tsx:549`) và một lần xóa (`:326-328`); `src/client/components/DayFieldsForm.tsx:51-53` khởi tạo bản nháp một lần cho mỗi
   `generation`, `:85` gửi `day.entry.version` của ngày hiện giữ). Có từ trước: khóa `fields-${generation}` và bản nháp khởi tạo một lần có
   từ WP2-T10 (26fa7c9f), `saved()` đã là `setDay(next)` ở 8e557100; không do vòng 4, 5 hay FIX18 đưa vào.
   - Nguyên nhân: một lần ghi ca trả về cả ngày (`getDayView`), gồm mọi trường của ngày đã đổi ở nơi khác kể từ khi trình sửa tải và phiên
     bản entry mới hơn của chúng. `saved()` nhận nó mà không tăng `generation`, nên biểu mẫu giữ bản nháp cũ trong khi trình sửa nay giữ phiên
     bản mới hơn.
   - Tái hiện (`zz-int2-follow.spec.ts` G1, G2; đích và a5cbc91, `45-obs-follow-target.txt`, `45-obs-follow-prev-run1.txt`): một ngày làm việc
     đã qua có một ca và ghi chú đã lưu "Saved before the editor opened (synthetic)"; mở trình sửa của nó ở 1440px; một thiết bị khác lưu ghi
     chú "Changed on another device (synthetic)" và WFH bật (phiên bản entry +1); trong trình sửa, Edit ca, đổi giờ kết thúc và lưu
     ("Session saved."): biểu mẫu vẫn hiện ghi chú cũ và WFH tắt, không có thông báo cũ; bấm "Save day fields" mà không gõ gì: được nhận; máy
     chủ nay giữ ghi chú cũ và WFH tắt, thay đổi của thiết bị kia mất, và không ai được báo. G2, giống vậy với "Delete session" thay cho lần
     sửa: cùng một sự ghi đè. Theo code (không chạy), một ghi chú gõ trước lần ghi ca cũng được gửi với phiên bản mới hơn theo cùng cách.
   - Kỳ vọng: quy tắc FIX18 được giao ("không bao giờ gửi trường cũ với phiên bản mới") và câu mới ở docs/04:69 ("thay đổi ở nơi khác đối
     với các trường của ngày không được nhận theo cách này: lần lưu bị từ chối và "Reload day" mới đọc nó"); docs/03:40 (mỗi thao tác kiểm
     phiên bản). Lần lưu các trường của ngày phải bị từ chối, hoặc biểu mẫu phải hiện các trường của máy chủ, để thay đổi ở nơi khác không bao
     giờ bị bỏ lặng lẽ. Cùng thao tác sửa đó qua lần theo kịp thì bị từ chối (mục 2, B).
   - Sửa có phạm vi: trong trình sửa, kết quả của một lần ghi ca chỉ được thay các trường của ngày và phiên bản entry đang giữ khi
     `sameDayFields(held, next)` đúng; nếu không, giữ entry và các trường đang giữ cho biểu mẫu các trường của ngày (để lần lưu của nó mang
     phiên bản cũ, bị từ chối và "Reload day" đọc thay đổi) và hiện thông báo cũ, hoặc khởi động lại biểu mẫu từ kết quả khi nó không giữ
     chỉnh sửa chưa lưu nào. Một test e2e cho mỗi loại ghi (lưu ca, xóa) trong `day-editor.spec.ts` (dạng G1/G2); docs/04 thêm một mệnh đề ở
     EN và VI chỉ khi câu chữ cần.
2. **F-UX5I2-2, Low - `npm run digest` thất bại ở mọi bản checkout từ d96df5d** (`scripts/source-digest.mjs:13-15`).
   - Nguyên nhân: lần `execFileSync` đầu (`git ls-files --cached --others --exclude-standard -z`) không có `maxBuffer`, nên áp mặc định
     1.048.576 byte của Node; danh sách đã theo dõi là 1.027.260 byte ở a5cbc91 và 1.063.240 byte ở d96df5d (535 file bằng chứng được
     commit trong lần đóng băng FIX18).
   - Tái hiện (`31-digest-script-enobufs.txt`, `01-digest-before.txt`): một bản clone nháp của đích với 0 file chưa theo dõi: `npm run digest`
     exit 1 với `spawnSync git ENOBUFS`; cùng script chỉ thêm `maxBuffer: 64 * 1024 * 1024` in ra đúng `6937d79c…61cb (882 files)`.
   - Kỳ vọng: docs/12:7 (VI :7) "Release identity" ghi source digest của bản phát hành bằng `npm run digest`; lệnh đó phải chạy được trong
     một bản checkout sạch của ứng viên phát hành. Tiền đề của brief ("khi nhiều file handoff chưa được theo dõi") không đúng: lỗi là vĩnh
     viễn từ commit này, và dạng ls-tree (hoặc một bản script đã vá) hiện là đường duy nhất chạy được.
   - Sửa có phạm vi: thêm `maxBuffer: 64 * 1024 * 1024` vào lần `execFileSync` đầu (lần thứ hai đã có); chứng minh bằng `npm run digest`
     trong một bản clone sạch và trong repository.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

Mới, từ audit này:
- **R-UX5I2-1, các chốt chặn của FIX18 chỉ được ghim một phần** (mục 5): phép so WFH và nghỉ một phần, việc chặn khi xác nhận xóa đang mở
  và việc bỏ lần đọc bị vượt sống sót qua bộ test (MX3-MX7); MX1 chỉ bị bắt nhờ thứ tự các test. Tùy chọn: thêm các ca B, N và O của tôi
  (mã trong `90-zz-int2-follow.spec.ts.txt`) vào `day-editor.spec.ts`, tốt nhất trong vòng sửa F-UX5I2-1.
- **R-UX5I2-2, docs/04:69 chỉ nêu Check in và Check out của trang.** Ngăn kéo còn đọc ngày của nó khi tab quay lại tầm nhìn (một bộ đếm của
  đồng hồ), và không đọc khi cửa sổ nhận focus. Tùy chọn: một mệnh đề ở EN và VI.
- **R-UX5I2-3, ngày chưa có entry không có phiên bản để bảo vệ loại ngày mặc định của lịch** (có từ trước, giống trên a5cbc91): quản trị
  viên nhập một ngày lễ vào ngày đang mở, tab quay lại (không Check in), và "Save day fields" ghi mặc định cũ "Worked" thành lựa chọn tường
  minh của người dùng đè lên Holiday mới (E2); biểu mẫu hiện "Calendar default. Saving records it as your choice." Tùy chọn: chỉ gửi loại
  ngày khi người dùng đã đổi nó, hoặc từ chối khi mặc định đã đổi kể từ lúc tải.

Mang tiếp từ AUDIT-INT, trạng thái ở đích này:
- R-UX5I-1 (cách chủ sở hữu thấy một lần gửi bị giữ sau khôi phục): không đổi (không file nào trên đường đó đổi).
- R-UX5I-2 (nửa focus của test vượt nửa đêm ở thời điểm quét của gate): không đổi; lần chạy bảy file của tôi lúc 06:58:30Z đi cùng nhánh
  (test vượt nửa đêm trên máy tính 1,1 phút).
- R-UX5I-3 (quy tắc tải nằm trong brief gate và DIAG10; "timeout" chưa định nghĩa): không đổi; REGATE13 lại chép nó.
- R-UX5I-4 (các mục câu chữ: chú thích của wrapper FIX10, docs/04:114 giao diện theo tab khác, docs/12:106 bấm ra ngoài của vòng 5, thứ tự
  trong băng rôn tạm dừng): không đổi; R-UX5I2-2 thêm vào nhóm này.
- Các rủi ro ở mục 1.6 của AUDIT-INT giữ trạng thái đã ghi ở đó; rủi ro UX4-A 1 được thấy lại (mục 3).

## Backlog tùy chọn cho handoff WP5 (đã cập nhật; không mục nào chặn, hai phát hiện thì chặn)

1. Sức mạnh test, vùng A: R-A3-1, R-A3-2, R-A3-3, MA5, R-UX5I-2, **R-UX5I2-1**.
2. Sức mạnh test, vùng B: R-UX5B4-1, R-UX5B4-2, R-UX5B-5, G6.
3. Tài liệu và chú thích: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4, **R-UX5I2-2**.
4. Gia cố sản phẩm tùy chọn: R1, R2, cú nhảy 8 px một khung hình của DIAG5, R-UX5B2-1, R-UX5B2-2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8,
   UX4-A 1, 3, 4, 9, **R-UX5I2-3**.
5. Kiểm trên thiết bị khi pilot (NOT VERIFIED ở đây): R-A2-1, R-A2-2, UX4-A 8, thanh cuộn chiếm chỗ ở trình duyệt khác (docs/12:108); chủ
   sở hữu tự xem các mẫu PDF so với B11.
6. Quy trình và harness: độ nhạy tải của lượt quét logo (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (khuyến cáo chỉ ở dev, vẫn "6 vulnerabilities
   (4 moderate, 2 high)" trong `npm ci`), R-UX5B-4, R-UX4B-6, nhánh điện thoại của test vượt nửa đêm; script digest trở thành F-UX5I2-2.
7. Các quyết định của coordinator đã báo chủ sở hữu, không hỏi: như mục 7 của "Optional backlog" trong AUDIT-INT, cộng việc đọc lại khi tab
   quay lại của FIX18 (được đánh giá là đúng ở mục 2).

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ, và không cái nào cần chạy lại. Không do tôi chạy, theo phạm vi brief: container drill và `npm audit`
(mang tiếp từ REGATE11: `dist/server` và `dist/domain` giống hệt), năm lượt quét còn lại (REGATE13 đã chạy cả sáu), ảnh chụp màn hình. Các
mục NAS vẫn NOT VERIFIED. Các lỗi probe của chính tôi được giữ và nêu tên: lần chạy a5cbc91 đầu chờ một lần đọc theo kịp mà a5cbc91 không
có (`48-log-follow-prev-run1-probe-defect.txt`, `48-log-admin-prev-run1-probe-defect.txt`; chỉ dùng kết quả G1, G2 và L của nó); lần chạy
đích đầu đọc biểu mẫu ngay sau "Reload day" trước khi lần tải lại trả lời (các dòng reload của B và E; đã chạy lại có chờ, `-B2`, `-2`);
probe O không áp dụng cho a5cbc91. Không kết luận nào dựa vào một lần chạy lỗi.

## Xử lý các phát hiện trước

- **F-UX5I-1 (Low): đã đóng** (mục 1); tái hiện trên a5cbc91 bằng probe của AUDIT-INT, đã sửa trên đích.
- Các xử lý khác của AUDIT-INT đứng vững (mục 4). RECHECK-A2 và RECHECK-B3 vẫn hiệu lực cho vùng của chúng, nhưng lần kiểm lại này không
  nghiệm thu lại WP5: F-UX5I2-1 và F-UX5I2-2 còn mở, nên chúng chưa bị thay thế làm nghiệm thu hiện hành.

## Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot

Sẵn sàng phần mềm chưa được xác lập lại: lần kiểm tích hợp lại này là FIX REQUIRED (một phát hiện toàn vẹn Medium có từ trước trong trình
sửa ngày, một phát hiện công cụ Low mà định danh bản phát hành phụ thuộc vào). Phép của chủ sở hữu: chưa xin, chưa có. Kết quả pilot: không
có; NAS vẫn NOT VERIFIED. Không chạm gửi thật hay triển khai thật (chỉ capture cục bộ, người dùng tổng hợp `example.invalid`).

## Một bước tiếp theo

Một vòng sửa có phạm vi (kind fix, `addresses_audit` WP5-UX5-AUDIT-INT2): F-UX5I2-1 trong `src/client/DayEditor.tsx` (và
`DayFieldsForm.tsx` chỉ khi cần) với các test e2e G1/G2 và, tùy chọn, các ca B, N và O của R-UX5I2-1; F-UX5I2-2 trong
`scripts/source-digest.mjs`; rồi đóng băng, một regate cho thay đổi client (như REGATE13), và một lần kiểm tích hợp lại mới trên digest mới
trước khi nghiệm thu lại WP5 và ACCEPT-DOCS.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX5-AUDIT-INT2 attempt 1; agent reviewer `aec1aeea85222dbd9` (board); tác giả
  của snapshot là các planner, worker, fixer và diagnoser của WP5-UX4 và WP5-UX5 trên board, ví dụ WP5-UX5-FIX18 `a9afbdb91d41abb10`,
  WP5-UX5-FIX17 `a4b1c3c982a5be9ee`, WP5-UX5-PLAN `a2066720d8bdcb583`, WP5-UX5-T01B `a084c1bdda1d1e1cf`.
- Context mới; tôi không viết thay đổi nào được kiểm. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng chứng,
  và không stage hay commit gì.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE13 PASS.
- Đường dẫn report mới: `handoff/delivery/WP5_UX5_REVIEW_INT2.md` (+ `.vi.md`); mọi review trước không bị đụng tới.
- Xử lý phát hiện và task tiếp của coordinator: F-UX5I-1 đã đóng; F-UX5I2-1 (Medium) và F-UX5I2-2 (Low) còn mở, bước tiếp ở trên;
  R-UX5I2-1..3 tùy chọn.
