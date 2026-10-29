# Audit tích hợp của vòng thay đổi UI 4 và 5 trên a5cbc91 (WP5-UX5-AUDIT-INT)

Bản dịch của [WP5_UX5_REVIEW_INT.md](WP5_UX5_REVIEW_INT.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/người review và model/effort quan sát được:** WP5, vòng thay đổi UI 4 và 5 do chủ sở hữu yêu cầu (một snapshot cuối gói,
  quyết định Q0 a của chủ sở hữu), lượt tích hợp mà PASS của nó sẽ chấp nhận lại WP5; task WP5-UX5-AUDIT-INT, lần 1, ngày 2026-10-29 từ
  07:55Z đến khoảng 09:20Z (00:55 đến khoảng 02:20 thứ Năm theo America/Los_Angeles; kỳ đang hiển thị 10/12-10/25 đã kết thúc và
  được hiện đến ngày trả lương 10/30, nên đồng hồ thật đang là một ngày cửa sổ). Model tự báo của người review là `claude-opus-5-5`
  (agent `abc262afcf62ce6a7` trên board), profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model tác
  giả mạnh nhất của snapshot trên board là `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN, WP5-UX5-T01B, WP5-UX5-DIAG7); mọi
  tác giả khác là `claude-sonnet-5-5` hoặc không ghi model với yêu cầu sonnet (`01-author-models.txt`), nên người review không yếu hơn.
  ID agent của tôi chỉ xuất hiện trên board ở task này: tôi không viết task WP5-UX4 hay WP5-UX5 nào và không audit nào của chúng.
- **SHA commit được review và source digest; commit chưa push; độ đầy đủ của mã nguồn:** `reviewed_commit`
  `a5cbc91e6965633a0f9d1dd7e912577321cc71e3` (WP5-UX5-FIX17-FREEZE, đã push; `freeze_commit` của WP5-UX5-REGATE12). HEAD = origin/main =
  commit đó trước và sau; không có dòng trạng thái nào ngoài `handoff/` trước và sau. Digest
  `69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf`, 882 file, không gồm `handoff/`, bằng nhau ở ba dạng lúc 07:55:37Z và
  lúc 09:08:47Z: một bản export `git archive` sạch được hash bằng `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp
  giống từng byte với danh sách của bản export) và `npm run digest` trong repository. Không có commit chưa push. Mã nguồn đầy đủ: `npm ci`
  exit 0 trong ba bản export. Snapshot được chấp nhận gần nhất là 8e557100d16b6b6eb86a48e00276835761aabfdf (digest 507de97c); 223 đường
  dẫn khác nhau ngoài `handoff/` giữa nó và target.
- **Quyết định: FIX REQUIRED.** Một phát hiện mới mức Low, F-UX5I-1: từ khi vòng 4 làm Day editor trên desktop không modal ở mọi chiều
  rộng, một lần Check in hay Check out bấm trên trang khi trình sửa đang mở để trình sửa vẫn hiện ngày như cũ (không có ca đang chạy sau
  Check in, không có ca đã kết thúc sau Check out) trong khi bảng phía sau cập nhật, và một ghi chú gõ trong trình sửa trước thao tác đồng
  hồ sau đó bị từ chối khi lưu ("This day changed since it was loaded"); tái hiện ở 1440px và 1280px. Không gì bị lưu sai hay mất một cách
  âm thầm, nhưng ngăn kéo nêu sai sự thật và một luồng hằng ngày buộc phải gõ lại ghi chú. Mọi phần khác trong phạm vi đều đứng vững:
  - Tích hợp (mục 1): mọi phát hiện của các vòng đã được một lượt kiểm lại có tên đóng lại; mọi mục U4-01..U4-15 và U5-01..U5-34 của chủ
    sở hữu và mọi câu trả lời đều gắn với bài review đã đánh giá nó; mọi lý do FAIL của gate đều có kết luận; mọi rủi ro đã ghi đều có
    trạng thái; quy tắc tải áp dụng sau REGATE11 là hợp lý và nghiêng về FAIL; độ nhạy với tải của sweep logo là rủi ro backlog được chấp
    nhận.
  - Các vùng (mục 2): PASS vùng A của RECHECK-A2 vẫn giữ (không file client nào đổi; hai file e2e của FIX17 chứng minh đúng điều các file cũ
    đã chứng minh); PASS vùng B của RECHECK-B3 được xác nhận.
  - Probe (mục 3): khôi phục với một bản sửa hoạt động như docs/05:72, docs/11 mục 7 và docs/12:114 nói, từng bước trên trang Review và
    trong History; chốt chặn của Day editor giữ qua nửa đêm trên desktop và điện thoại (bước cuối của lượt desktop gặp rủi ro 1 của
    UX4-A, ngăn kéo nổi che nút Check out của trang ở 1280px; lượt điện thoại lưu ghi chú và kết thúc ca dưới ngày 10/26); theme theo qua
    các tab khi trình sửa và menu tài khoản đang mở, giữ ghi chú và không hỏi gì; chế độ xem được chia sẻ (xem và sửa) giữ phần đầu, bảng
    và các hộp thoại của vòng 5, chỉ dùng đường chia sẻ và qua axe-core 4.14.0 ở sáng và tối.
  - Thiết kế test (mục 4): đủ cho bản phát hành này; các khoảng trống là mục độ mạnh test tùy chọn.
  - AC-13 dưới ba múi giờ thiết bị, tài liệu EN và VI, và mọi kiểm tra bắt buộc đều đạt: typecheck, lint, build, `npm test` (101 file,
    2.397 test), e2e FULL đồng hồ thật (desktop 469/35/0, mobile 407/97/0) và lượt bảy file lúc 2026-10-27T06:58:30Z (384 đạt, 0 thất bại).
  - Rủi ro tùy chọn mới R-UX5I-1..4; backlog tùy chọn cho bàn giao WP5 được liệt kê riêng.

## Phạm vi thực tế đã kiểm tra và đã chạy

1. Đọc như các tuyên bố, không phải bằng chứng: brief; AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"); docs/08 "Gates and
   independent audit"; `owner_decisions` trên board từ 2026-10-20 đến 2026-10-23 nguyên văn (yêu cầu vòng 4 cùng các câu trả lời F-1..F-5
   và D, R2-R5, yêu cầu vòng 5, F-1..F-10 cùng các điều chỉnh mockup, ghi chú mockup 2, điều chỉnh 3 và bản đính chính, G-1, "1 a, 2 a",
   "A.a, B.A, C.b", việc bỏ giữ push, "D.a, E.a", yêu cầu ff-only) và mọi bản ghi câu hỏi đã được trả lời của vòng 4 và 5;
   `coordinator_decisions` từ 2026-10-20 đến 2026-10-22 và các quyết định ghi trong pause note của board và các bản ghi task (quy tắc tải,
   hàng rào nửa đêm, phương án A, bản sửa theme giữa các tab); WP5-UX4-PLAN và WP5-UX5-PLAN (danh sách mục, mục F), PLAN-FIX7 và
   PLAN-FIX7A; mọi bài review của các vòng (WP5_UX4_REVIEW_A/B, WP5_UX5_REVIEW_A/B, WP5_UX5_RECHECK_A, _B, _A2, _B2, _B3); mọi bản ghi gate
   (WP5-UX4-GATE, -REGATE, -REGATE2, WP5-UX5-GATE, -REGATE đến -REGATE12); mọi bản ghi chẩn đoán và sửa (WP5-UX4-FIX1..3,
   WP5-UX5-DIAG1..10, DEPS1, FIX1..FIX17) trên board và đọc đầy đủ những bản mà đánh giá của tôi dựa vào (DIAG9, DIAG10, REGATE12, wrapper
   của FIX10); docs/04, 05, 10, 11 và 12, EN và VI, như đã đóng băng.
2. Diff và code: `git diff be2afa2..a5cbc91` (phần mang sang của vùng A, `20-*`, `21-*`, `22-*`), và từ mỗi commit đã được review trước
   đó đến target (0ddfead, 57c41e8, f4049aa, a5533b5, be2afa2; `23-diffs-earlier-pass-areas.txt`); `blockerOf` của `restore.ts` và các nơi
   ghi trạng thái job; `TimesheetScreen.tsx` (các listener làm mới, việc tải lại sau thao tác đồng hồ, việc bấm ra ngoài),
   `DayEditor.tsx` (các lần tải của nó), `SendCard.tsx`, `deliveryModel.ts`, `DayFieldsForm.tsx`, `LeaveDialog.tsx`, `AccountMenu.tsx`,
   `OperationsStatus.tsx`, `fixtures.ts` (hàng rào), `today.spec.ts:627` và `:764-783`, `timesheet-api.test.ts:125-148`.
3. Các kiểm tra bắt buộc trong một bản export `git archive` sạch của target có `npm ci` riêng (`export`), lần lượt từng lệnh và một mình
   trên máy, đo tải trước và sau mỗi lượt e2e.
4. Các probe liên vùng của riêng tôi trong một bản export thứ hai (`export-probe`: cùng archive, `npm ci` và build riêng; chỉ thêm các
   file `zz-int-*.spec.ts` của tôi và một helper cổng giữ harness trên cổng 51470-51489; các server khôi phục của tôi dùng 51460-51462):
   khôi phục với một bản sửa, chốt chặn của Day editor qua nửa đêm (đồng hồ FIX10), theme giữa các tab khi trình sửa và menu tài khoản đang
   mở, chế độ xem được chia sẻ (xem và sửa) với axe-core 4.14.0 từ thư mục task, và Day editor đang mở qua một lần check in và check out
   từ trang (thêm vào khi probe nửa đêm chỉ tới nó).
5. Một mutant thiết kế test trong bản export thứ ba (`export-mut`): bỏ việc làm mới khi trang lấy lại tiêu điểm và khi hiện lại, chạy với
   test vượt nửa đêm ở thời điểm của gate và ở một thời điểm có cả hai ngày, và với các test đếm lần làm mới; khôi phục giống từng byte và
   build lại.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che thông tin trong `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/` (mục lục `00-README.txt`). Mã nguồn
của probe, mutant và script được giữ dưới dạng `90-*.txt`; trích xuất board với model của các tác giả là `01-author-models.txt`; các lần sai
quy tắc của tôi ở `99-slips.txt`.

| Lệnh hoặc probe | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, trạng thái ngoài `handoff/`, digest ở ba dạng, đầu và cuối | HEAD a5cbc91 = origin/main; không dòng nào; `69c6daff…e6bf`, 882 file, lúc 07:55:37Z và 09:08:47Z | `00-*`, `01-digest-*.txt` |
| các kiểm tra bắt buộc (mục 7) | tất cả exit 0; FULL 469/35/0 và 407/97/0; bảy file 384/84/0 | `03-*`, `04-*`, `08-*` |
| diff từ mỗi commit đã review đến target | liệt kê ở mục 1.2 và 2 | `20-*` đến `23-*` |
| khôi phục với một bản sửa (lượt 2; lượt 1 được giữ lại như một lỗi của probe) | exit 0; mọi bước đúng như tài liệu (mục 3.1) | `40-obs-restore.txt`, `41-log-probe-restore-run2.txt`, `*-run1-probe-defect.txt` |
| chốt chặn của Day editor qua nửa đêm (đồng hồ FIX10, 06:58:00Z), desktop và điện thoại | chốt chặn giữ; lượt desktop dừng ở một cú bấm vào Check out của trang mà ngăn kéo nổi che (rủi ro 1 của UX4-A); desktop exit 1 ở bước đó, mọi bước chốt chặn trước nó đều đạt; lượt điện thoại exit 0, ghi chú được lưu và ca kết thúc dưới ngày 10/26 | `41-obs-midnight.txt`, `41-log-probe-midnight-*.txt` |
| theme giữa các tab khi trình sửa và menu tài khoản đang mở, 1280, 1440 và điện thoại | exit 0; theo cả hai chiều, ghi chú được giữ, không hỏi gì | `42-obs-theme.txt`, `41-log-probe-theme.txt` |
| chế độ xem được chia sẻ, xem và sửa, 320-1440px, sáng và tối, axe-core 4.14.0 | lượt 2 (điện thoại) và lượt 6 (desktop) đạt; 0 vi phạm ở mọi lần quét sau khi lắng | `43-obs-shared-run2.txt`, `43-obs-shared-run6.txt`, `41-log-probe-shared-*.txt` |
| Day editor đang mở qua một lần check in và check out từ trang, 1440 và 1280px | trình sửa không cập nhật; lần lưu sau đó bị từ chối (F-UX5I-1) | `44-obs-clock-editor.txt`, `41-log-probe-clock-editor-run2.txt` |
| mutant thiết kế test: bỏ việc làm mới khi lấy lại tiêu điểm và khi hiện lại | mutant qua test vượt nửa đêm ở thời điểm của gate 2026-10-27T06:58:30Z trên cả hai project (exit 0) và làm nó thất bại lúc 2026-11-04T07:58:50Z (desktop và mobile exit 1; bản đối chứng không mutant exit 0); các test đếm lần làm mới `:764`, `:769` bắt được nó trên cả hai project (mỗi project 2 trên 2 thất bại); khôi phục giống từng byte, `dist/` giống hệt bản export sạch | `50-mut-exits.txt`, `51-log-*.txt` |
| tương đương EN/VI của bảy cặp tài liệu | cấu trúc giống nhau; đoạn code chỉ khác ở các từ giữ chỗ được dịch | `60-docs-parity.txt` |
| đo tải trước và sau mỗi lượt | 1,5-2,3 lõi bận quanh mọi lượt bắt buộc; 1,33-2,58 trước mỗi probe; 1,64 ở cuối (09:07:33Z) | `10-census-*.txt` |

## 1. Tích hợp các bản ghi của các vòng

### 1.1 Mọi phát hiện của các vòng

| Phát hiện (bài review, snapshot) | Mức độ | Bản sửa | Được đóng bởi (bằng chứng riêng của bài review đóng nó) | Trạng thái ở target |
|---|---|---|---|---|
| F-UX4A-1 nhấp nháy với thanh cuộn chiếm chỗ (WP5-UX4-AUDIT-A, 0ddfead) | Medium | FIX2, rồi R5 b của chủ sở hữu trong FIX3 | WP5-UX5-AUDIT-A (0 lần đổi bố cục trong 3 s, cạnh bảng từ 1345px) | đã đóng; `classic-scrollbar.spec.ts` đạt trong lượt FULL của tôi |
| F-UX4A-2 Escape trên một điều khiển của bảng | Low | FIX2 | WP5-UX5-AUDIT-A | đã đóng |
| F-UX4A-3 tiêu điểm sau Current period | Low | FIX2 | WP5-UX5-AUDIT-A | đã đóng |
| F-UX4A-4 hai câu trong docs/04 | Low | FIX2 | WP5-UX5-AUDIT-A | đã đóng |
| F-UX4B-1 đăng nhập làm đầy bucket đổi mật khẩu (WP5-UX4-AUDIT-B) | Low | FIX2 (không gian khóa `login:`) | WP5-UX5-AUDIT-B (sáu lần đăng nhập dựng sẵn vẫn để lần đổi mật khẩu trả 200) | đã đóng; `routes/auth.ts` không đổi từ 57c41e8 |
| F-UX5A-1 chân ký đã ký trên trang Review hẹp (WP5-UX5-AUDIT-A, f4049aa) | Medium | FIX8 | WP5-UX5-RECHECK-A (36 lần đo) | đã đóng |
| F-UX5A-2 SC 2.5.3 "Change days" | Low | FIX8 | WP5-UX5-RECHECK-A | đã đóng |
| F-UX5A-3 thao tác cuộn đóng Day editor | Low | FIX8 | WP5-UX5-RECHECK-A (chỉ Chromium; R-A2-1, R-A2-2) | đã đóng |
| F-UX5A-4 độ đúng của tài liệu (vùng A) | Low | FIX8 | WP5-UX5-RECHECK-A | đã đóng |
| F-UX5B-1, -2, -4 độ đúng của tài liệu (WP5-UX5-AUDIT-B) | Low | FIX7 | WP5-UX5-RECHECK-B | đã đóng |
| F-UX5B-3 dòng nghỉ trên PDF khi có nhãn ngày lễ dài | Low | FIX7 (hướng sửa code) | WP5-UX5-RECHECK-B (2.304 bản render) | đã đóng |
| F-UX5B-5 hai test không thể thất bại | Low | FIX7 | WP5-UX5-RECHECK-B (M12b, M11 bị bắt) | đã đóng |
| F-UX5A2-1 vòng focus của thẻ tuần chỉ đọc (WP5-UX5-RECHECK-A, a5533b5) | Low | FIX11 | WP5-UX5-RECHECK-A2 (96 trạng thái) | đã đóng |
| F-UX5B2-1 giải phóng một lần gửi đã bị thay thế sau khôi phục (WP5-UX5-RECHECK-B) | Low | FIX11 (nối theo kỳ) | một phần; WP5-UX5-RECHECK-B2 tìm ra F-UX5B3-1 | đóng qua F-UX5B3-1 |
| F-UX5B3-1 lần gửi muộn hơn ở `intervention` (WP5-UX5-RECHECK-B2, be2afa2) | Low | FIX16 | WP5-UX5-RECHECK-B3 (12/12, A-D 13 PASS, X1-X6) | đã đóng; probe khôi phục của tôi (mục 3.1) |

Các lỗi do gate và chẩn đoán tìm ra (không phải audit) cũng được sửa và kiểm lại theo cùng cách: lượt đi phím SC 2.4.11 (FIX1, vòng 4),
vùng cuộn của History (FIX1, vòng 5), truy cập bàn phím của thẻ tuần chỉ đọc (FIX9, RECHECK-A), việc báo dirty muộn (FIX13, RECHECK-A2) và
theme giữa các tab (FIX14, RECHECK-A2).

### 1.2 Các kết luận trước đó, chỉ mang sang khi các diff sau đó vẫn để chúng đúng

Các diff đã kiểm (`23-diffs-earlier-pass-areas.txt`, `20-diff-a2-target.txt`), từ mỗi commit đã được review đến target, ngoài `handoff/`:

| Kết luận trước đó | Commit được review | Những gì đã đổi kể từ đó trong vùng của nó | Có mang sang không? |
|---|---|---|---|
| Các mục đạt của WP5-UX4-AUDIT-A/-B (vòng 4) | 0ddfead | vòng 5 dựng lại thẻ kỳ, thanh công cụ, Day editor, Review và PDF (82 file nguồn); các file server của vòng 4 (`auth.ts`, `timesheetCommands.ts`, nhập ngày lễ, sổ cái, nhập workbook) đổi lần cuối ở FIX2/FIX3 (57c41e8) và không đổi từ đó | chỉ qua các bài review vòng 5: UX5-AUDIT-A kiểm lại F-UX4A-1..4 và các hành vi vòng 4 mà các mục của nó chạm tới; UX5-AUDIT-B kiểm lại F-UX4B-1 và các thay đổi server vòng 4 (`git diff 57c41e8..` rỗng với chúng); mọi test vòng 4 đạt trong lượt FULL của tôi |
| Các mục đạt của WP5-UX5-AUDIT-A | f4049aa | client: `TimesheetScreen.tsx` (chạm và thanh cuộn của FIX8), `ReviewScreen.tsx`, `SignoffDialog.tsx`, `styles.css` (FIX8, FIX9, FIX11), `TimesheetSheet.tsx` (FIX9, FIX11), `DayFieldsForm.tsx` (FIX13), `App.tsx`, `ThemeToggle.tsx` (FIX14), hai chuỗi của `deliveryModel.ts` (FIX7) | có: mỗi thay đổi được RECHECK-A (FIX8, FIX9) hoặc RECHECK-A2 (FIX11, FIX13, FIX14) kiểm lại |
| Các mục đạt của WP5-UX5-AUDIT-B | f4049aa | server: `deliveries.ts` (phương án A), `timesheetPdf.ts` (`drawCategory`), `restore.ts` (FIX11, FIX16); header fetch của drill | có: RECHECK-B (FIX7), RECHECK-B2 (FIX11), RECHECK-B3 (FIX16) |
| PASS của WP5-UX5-RECHECK-A2 (vùng A) | be2afa2 | không file client nào; hai file e2e của FIX17 | có (mục 2) |
| PASS của WP5-UX5-RECHECK-B3 (vùng B) | a5cbc91 | không gì (chính là target) | có |

### 1.3 Mục và câu trả lời của chủ sở hữu, mỗi mục với bài review đã đánh giá nó

Vòng 4 (yêu cầu của chủ sở hữu ngày 2026-10-20, 15 mục U4-01..U4-15, và các câu trả lời):

| Mục hoặc câu trả lời | Được đánh giá bởi | Kết luận ở đó | Thay đổi sau đó và người đánh giá |
|---|---|---|---|
| U4-01 xuất và nhập thiết lập (F-3 a, F-4 a) | WP5-UX4-AUDIT-B mục 8; WP5-UX4-AUDIT-A (các thẻ, hộp thoại xem trước) | đạt | vòng 5 chỉ thêm khóa `show_time_on_pdf` (WP5-UX5-AUDIT-B mục 8) |
| U4-02 khoảng cách tiêu đề 32px (F-5) | WP5-UX4-AUDIT-A | đạt | không đổi; `controls.spec.ts:49` đạt ở target (chờ của FIX14) |
| U4-03 tờ giấy trên Timesheet và Review (F-5: thanh công cụ, các tuần, chân trang giữ nguyên; chữ ký hai hàng) | WP5-UX4-AUDIT-A | đạt | phần Review được thiết kế lại bởi U5-27..U5-32 (WP5-UX5-AUDIT-A, RECHECK-A) |
| U4-04 công tắc tròn | WP5-UX4-AUDIT-A | đạt | không đổi |
| U4-05 ngăn kéo không modal, chuyển, bỏ chọn | WP5-UX4-AUDIT-A | đạt trừ F-UX4A-2/-3 | đã sửa (UX5-AUDIT-A); báo dirty trong cùng tác vụ của FIX13 (RECHECK-A2) |
| U4-06 bo góc | WP5-UX4-AUDIT-A | đạt | bị thay bởi U5-23 của chủ sở hữu (góc vuông), WP5-UX5-AUDIT-A |
| U4-07 chỉ nổi khi các cột sẽ chồng lên nhau | WP5-UX4-AUDIT-A | F-UX4A-1 | FIX2, R5 b của chủ sở hữu, FIX3; WP5-UX5-AUDIT-A |
| U4-08 mũi tên của select | WP5-UX4-AUDIT-A | đạt | sửa vệt nối U5-03, WP5-UX5-AUDIT-A |
| U4-09 căn giữa checkbox | WP5-UX4-AUDIT-A | đạt | không đổi |
| U4-10 "Show worked hours" (coordinator trả lời câu hỏi đổi tên) | WP5-UX4-AUDIT-A | đạt | bị thay bởi U5-18 "Worked hours" của chủ sở hữu, WP5-UX5-AUDIT-A |
| U4-11 sửa giờ bắt đầu của ca đang chạy | WP5-UX4-AUDIT-A (UI), WP5-UX4-AUDIT-B mục 2 (số liệu, chốt chặn chia sẻ) | đạt | R2 a của chủ sở hữu (từ chối xóa qua chia sẻ) trong FIX3, WP5-UX5-AUDIT-B mục 9 |
| U4-12 múi giờ ở trên các giờ | WP5-UX4-AUDIT-A | đạt | không đổi |
| U4-13 liên kết Today và Now, canh phải (F-5) | WP5-UX4-AUDIT-A; WP5-UX4-AUDIT-B mục 3 (múi giờ) | đạt | không đổi |
| U4-14 các hàng nghỉ thẳng hàng | WP5-UX4-AUDIT-A | đạt | không đổi |
| U4-15 hộp cảnh báo lỗi lưu (cả trong Check out, quyết định của coordinator) | WP5-UX4-AUDIT-A | đạt | không đổi |
| F-1 (i) số dư đầu kỳ; D-5 a; D-10 theo F-1 | WP5-UX4-AUDIT-B mục 5 | đạt | không đổi từ 57c41e8 (UX5-AUDIT-B mục 9) |
| F-2 (b) số đếm xem trước ngày lễ kèm sự kiện audit (D-15 b) | WP5-UX4-AUDIT-B mục 7 | đạt, trong giới hạn ngoại lệ được duyệt | không đổi |
| F-5 mockup với các thay đổi được nêu | bảng mục của WP5-UX4-AUDIT-A | đạt | vòng 5 đổi chính các màn hình đó theo yêu cầu của chủ sở hữu |
| D-1..D-15 (các câu trả lời về tài liệu, code của D-6 a, D-8 a, D-9 b) | WP5-UX4-AUDIT-B mục 4, 6, 9, 11 | đạt (F-UX4B-1 cho D-9 b, đã sửa) | không đổi |
| R2 a, R3 b, R4 a, R5 b (câu trả lời ngày 2026-10-21) | R2 a và R5 b: FIX3, WP5-UX5-AUDIT-A/-B; R4 a: không cần đổi; R3 b: bỏ vì đã bị thiết kế lại trang Review của vòng 5 thay thế (quyết định của coordinator ngày 2026-10-21, đã báo chủ sở hữu) | đạt | trang Review hai cột của R3 b không còn tồn tại (danh sách kiểm tra đã vào hộp thoại Sign off) |
| FREEZE1-Q a, FREEZE2-Q a (quyền commit) | quy trình; WP5-UX4-T01-FREEZE và lượt đối chiếu của nó | xong | - |

Vòng 5 (yêu cầu và câu trả lời của chủ sở hữu ngày 2026-10-21 và 2026-10-22):

| Mục hoặc câu trả lời | Được đánh giá bởi | Kết luận ở đó | Thay đổi sau đó và người đánh giá |
|---|---|---|---|
| U5-01..U5-32 (các mục UI) | bảng mục của WP5-UX5-AUDIT-A | đạt trừ U5-17b (F-UX5A-2), U5-24 (F-UX5A-3), U5-30 (F-UX5A-1) | FIX8, RECHECK-A; FIX9/FIX11 (truy cập bàn phím và vòng focus của thẻ tuần), RECHECK-A/A2; FIX13, FIX14, RECHECK-A2 |
| U5-33 tách ký và gửi (server) | WP5-UX5-AUDIT-B mục 1-4 | đạt | phương án A của FIX7, FIX11, FIX16 (RECHECK-B, B2, B3) |
| U5-34 PDF | WP5-UX5-AUDIT-B mục 5-7; hình học của T02 và `pdf-layout.test.ts` "matches plan Addendum 2 within 1 pt" | đạt trừ F-UX5B-3 | FIX7, RECHECK-B |
| F-1 a 36px với vùng chạm 44px | WP5-UX5-AUDIT-A U5-05 | đạt | không đổi |
| F-2 a "đã nộp" = đã gửi | WP5-UX5-AUDIT-B mục 3 | đạt (F-UX5B-4 tài liệu) | RECHECK-B |
| F-3 b công tắc theo từng lần gửi, mặc định ở Settings | WP5-UX5-AUDIT-B mục 2, 5, 8 | đạt (F-UX5B-5 test) | RECHECK-B |
| F-4 phong bì theo từng lần gửi và quy tắc lý do | WP5-UX5-AUDIT-B mục 2 | đạt (F-UX5B-5 test) | RECHECK-B |
| F-5 b ảnh chữ ký không bắt buộc | WP5-UX5-AUDIT-B mục 1 | đạt | không đổi |
| F-6 a dạng gọn chỉ dưới 480px | WP5-UX5-AUDIT-A U5-01 | đạt | không đổi |
| F-7 a bấm ra ngoài thì đóng | WP5-UX5-AUDIT-A U5-24 | F-UX5A-3 | FIX8, RECHECK-A |
| F-8 a bỏ phần hướng dẫn; F-9 b Indie Flower (G-1); F-10 a Revision n kèm mã | WP5-UX5-AUDIT-B mục 6, 7 | đạt | không đổi từ FIX7 (chỉ `drawCategory`) |
| Điều chỉnh mockup B1, B2, B5, B7/B9 | WP5-UX5-AUDIT-A U5-09, U5-17, U5-25, U5-30 | đạt (mở lại B7/B9: F-UX5A-1) | RECHECK-A |
| B11 (PDF) và ghi chú mockup 2 (các trường b11 thụt 1,5 tab, chữ WEEK căn giữa, tên thứ) | hình học của T02, `pdf-layout.test.ts` (trường thụt 54 pt, nhãn xoay căn giữa, khối chữ ký), WP5-UX5-AUDIT-B mục 6 (nội dung) | đạt | chủ sở hữu tự xem các mẫu vẫn còn chờ (gói pilot) |
| Ghi chú mockup 2: b2 "Change days", b7/b9 nút Sign off ở cuối đường kẻ | WP5-UX5-AUDIT-A U5-17b, U5-30 | đạt trừ F-UX5A-2 | RECHECK-A |
| Điều chỉnh 3 và bản đính chính (hai hàng chữ ký thụt như b11) | WP5-UX5-AUDIT-A U5-30, WP5-UX5-RECHECK-A (tỉ lệ 0,0352 / 0,2741 / 0,4445 / 0,1370 / 0,1092) | đạt | không đổi |
| H-1 a ("1 a, 2 a") | WP5-UX5-AUDIT-B mục 3 (probe H-1, mutant M6) | đạt (F-UX5B-4 tài liệu) | RECHECK-B |
| FREEZE-T01B-Q a ("1 a, 2 a") | quy trình; WP5-UX5-T01B-FREEZE lần 2 | xong | - |
| Q0 a (gộp vòng 4), Q1 (ảnh tham chiếu không lưu), Q2 (chữ ở chân trang) | Q0: mọi bài review của vòng 5 bao cả hai vòng; Q1: không có ảnh nào được track mà thiếu "synthetic" (tôi kiểm, 979 trên 979); Q2: WP5-UX5-AUDIT-B mục 6 và `timesheetPdf.ts:104/:556` | đạt | - |
| "A.a, B.A, C.b", "Từ giờ ... push", "D.a, E.a", yêu cầu ff-only | quy trình (REMOTE-RECON, REMOTE-RECON2, các lần freeze); các file Ingat được kiểm không gây ảnh hưởng bởi REGATE2, REGATE3 và WP5-UX5-AUDIT-B mục 10 | xong | `git.unpushed` rỗng; HEAD = origin/main |

### 1.4 Mọi lý do FAIL của gate, kèm kết luận

| Gate (snapshot) | Lý do FAIL hoặc NOT VERIFIED | Chẩn đoán và bản sửa | Kết luận của tôi ở target |
|---|---|---|---|
| WP5-UX4-GATE (a3042dd) | SC 2.4.11: một điều khiển nằm hẳn dưới ngăn kéo đặt bên trái ở 1280x800 (sản phẩm) | FIX1: `whollyCovered` cắt theo cửa sổ với dung sai 1px; các lượt đi phím | đã đóng (các lượt đi phím của WP5-UX4-REGATE, 96 lượt của UX4-AUDIT-A; code không đổi từ đó, các lượt đi phím trong bộ test đạt) |
| như trên | lỗi test của sweep: `sharing.spec.ts:399` ngày cửa sổ, U4-11 Chủ nhật, U4-05 tầm với, đọc tương phản trước khi theme ổn định, seed lúc 23:58:30 | FIX1 (test) | đã đóng: lỗi test, sản phẩm đúng (oracle của UX4-AUDIT-B cho số liệu Chủ nhật) |
| như trên | `keyboard-access.spec.ts:227` mobile: thẻ nạp muộn đẩy "Import from Excel" đi | FIX1 chờ thẻ; giảm thiểu ở sản phẩm để lại thành rủi ro 3 của UX4-AUDIT-A | đã đóng như lỗi test; dịch chuyển bố cục là rủi ro tùy chọn được chấp nhận |
| WP5-UX4-REGATE2 (178f1cf) NOT VERIFIED | dừng sớm; `hover.spec.ts:125` mobile hết thời gian chờ style ổn định | FIX3 `settledStyle` theo sự kiện | bị các gate vòng 5 thay thế; test đạt trong mọi lượt FULL sau đó |
| WP5-UX5-GATE (e2bf1aa) | drill `--wp3`: bản build trước cần `signer_name` | FIX1 (chỉ drill) | đã đóng: drill 209/0 từ REGATE |
| như trên | bốn lỗi test theo ngày hoặc DST trong sweep | FIX1 (test) | đã đóng |
| như trên | axe `scrollable-region-focusable` trên History (có từ trước) | FIX1 `TableWrap` | đã đóng (axe 0 trong các gate và audit sau) |
| WP5-UX5-REGATE (2bce0ab) | `theme.spec.ts:605` đọc kích thước thanh trễ một khung hình | DIAG1 (test), FIX2 poll; gia cố border-box để lại thành rủi ro R1 | đã đóng; R1 còn mở, tùy chọn |
| WP5-UX5-REGATE2 (7aafa21) | `settings-routes.spec.ts:16` và `controls.spec.ts:640` | FIX3: chờ biểu mẫu đăng nhập; `settledSelect` | đã đóng (tranh chấp trong test) |
| WP5-UX5-REGATE3 (5b8b718) | `npm audit --omit=dev`: cảnh báo của nodemailer và zod | DEPS1, FIX4 ghim chính xác 10.1.4 và 4.6.6 | đã đóng (audit 0 ở REGATE4 và REGATE11; dist giống hệt từ đó) |
| như trên | `timesheet.spec.ts:1216` qua nửa đêm; `review.spec.ts:616` ảnh đến muộn; ECONNRESET | DIAG2, FIX5 (poll, chờ ảnh, `connection: close`) | đã đóng; dịch chuyển vì ảnh đến muộn là rủi ro R2 |
| như trên | timeout khi verify trong repository dưới tải | DIAG3, FIX6 vitest `maxWorkers: '50%'`, gia cố smoke và drill | đã đóng như vấn đề của harness (R-UX5B-4 ghi cơ sở bằng chứng) |
| WP5-UX5-REGATE5 (94accda) | timeout của logo: `logo.spec.ts:508` 240 s dưới tải | DIAG4, FIX10 (bốn context, tách test, bề mặt đã giải mã, một evaluate) | đã đóng: 46,7 s trên 240 s trong lượt FULL desktop của tôi; độ nhạy với tải vẫn là rủi ro backlog (mục 1.5) |
| WP5-UX5-REGATE7 (0f52300) | tranh chấp khi đo: `review.spec.ts:406` đọc lệch tâm 8 px ở 767px | DIAG5, FIX12 `expectLayoutAt` / `expectSheetAt` (và ca khôi phục R3) | đã đóng; MB10/CTL10 của RECHECK-A2 chứng minh chính helper giữ chúng |
| WP5-UX5-REGATE8 (bb8d340) | cùng loại trên mobile: `controls.spec.ts:49` 74,8 px | DIAG7 (chuyên gia, nâng cấp), FIX14 chờ trong controls | đã đóng; giới hạn số lần không bị kích hoạt lại |
| như trên (đợt kiểm đầy đủ của DIAG7) | thang khoảng ngày `timesheet.spec.ts:2596`; tab bị bỏ đói `theme.spec.ts:376` | DIAG8, FIX14 `stepPeriod`, `bringToFront`, và bản sửa sản phẩm cho theme giữa các tab | đã đóng; probe theme của tôi (mục 3.3) |
| như trên (đợt kiểm đầy đủ của FIX12) | `keyboard-access.spec.ts:267` và `day-editor.spec.ts:5304` | DIAG6, FIX13 (`toBeEnabled`; báo dirty bằng `useLayoutEffect`, sản phẩm) | đã đóng; RECHECK-A2 và probe nửa đêm của tôi |
| WP5-UX5-REGATE9 (bd9c275) | đọc ngày quanh nửa đêm: `day-editor.spec.ts:2340` chờ theo ngày trước nửa đêm | DIAG9, FIX15 (clockIn theo ngày của chính lúc bắt đầu, hàng rào, test biên) | đã đóng: 0 thất bại trong lượt bảy file của tôi lúc 06:58:30Z; độ phủ được đánh giá ở mục 4 |
| WP5-UX5-REGATE11 (1fe5ad3) | lại tab bị bỏ đói: `import.spec.ts:102` timeout 30 s ở 6-7 lõi tải ngoài mission | DIAG10, FIX17 (`bringToFront`; cửa sổ thứ hai của test vượt nửa đêm ở context riêng) | đã đóng: lớp lỗi không còn thành viên nào khác (tôi grep mọi `newPage(`/`newContext(` ở target) |

### 1.5 Quy tắc tải của gate áp dụng sau REGATE11, và sweep của logo

Quy tắc (brief của REGATE12, "The load rule", cùng Addendum 1): dừng ở lần đo tải đầu vào khi tải ngoài mission vượt khoảng 8 lõi bận
(lúc đầu là 4); đo tải sau mỗi sweep và ngay sau mọi thất bại; phân loại mọi thất bại từ trace của nó; một timeout mà trace cho thấy máy
bị bỏ đói (server trả lời nhanh, một bước của trình duyệt chậm hoặc đứng) trong khi lần đo ngay sau đó vượt giới hạn thì lượt chạy đó là
NOT VERIFIED, và được chạy lại một lần sau khi tải trở lại trong giới hạn (ghi cả hai lượt, lượt lặp phải đạt); lỗi mạng hoặc bộ đệm được
chạy lại một lần; mọi thất bại khác làm gate FAIL; không lượt chạy lại nào biến một lỗi assertion thành đạt.

Đánh giá: hợp lý, và nó không bỏ qua một lỗi sản phẩm.
- Nó không bao giờ gắn nhãn lại cho một server chậm: loại này cần một trace có server trả lời nhanh, và trace của DIAG10 cho thất bại ở
  REGATE11 cho thấy đúng như vậy (36 request được trả lời, chậm nhất 245 ms; request commit chưa bao giờ được gửi; tab phía sau bị bỏ đói
  8,8 s và hơn).
- Ngưỡng dựa trên số đo, không dựa trên con số tình cờ gây lỗi: 0 thất bại ở 3-8 lõi ngoài mission trong 198 lượt chạy, 0 trong một lượt
  hỗn hợp 1.068 test ở 10-14 lõi, chỉ thất bại khi tổng nhu cầu vượt 32 lõi logic (bảng liều của DIAG10). 8 là mức thận trọng cho máy này
  với 6 worker.
- Nó nghiêng về phía FAIL: một đợt tăng tải kết thúc trước lần đo thì thất bại vẫn là FAIL, tốn một vòng chẩn đoán, không bao giờ thành
  một lần chấp nhận.
- Các lượt chạy của tôi: tải đầu vào 1,73 lõi bận, 1,5-2,3 quanh mỗi lượt FULL (`10-census-*.txt`), nên không lượt nào gần giới hạn.
- Hai giới hạn nên ghi lại (tùy chọn, quy trình): quy tắc nằm trong một brief của gate và bản ghi DIAG10, không ở docs/08 hay một mẫu,
  nên gate sau phụ thuộc vào việc coordinator chép lại (muốn thành vĩnh viễn là một thay đổi GOV); và "a timeout" không nói rõ một
  timeout của expect trong Playwright (một assertion hết thời gian trên tab bị bỏ đói, dạng của theme.spec.ts:392) có được tính không.
  Theo câu chữ hiện tại, thất bại như vậy làm gate FAIL, đó là cách hiểu an toàn.

Sweep của logo (R-A2-5, backlog của DIAG10): bị giới hạn bởi khung hình, không bởi tab. Máy rảnh: test `logo.spec.ts` dài nhất trong lượt
FULL desktop của tôi là 46,7 s trên 240 s (`12-logo-durations.txt`); các sweep 6 worker của REGATE12 là 53-96 s. Máy bão hòa (burner 48
luồng): trung vị 168-192 s, tệ nhất 228 s (DIAG10 Addendum 1). Không có thất bại nào từ FIX10, và không ảnh hưởng sản phẩm (quy tắc
wordmark là CSS và một ngưỡng đo được). Được chấp nhận là rủi ro backlog tùy chọn: theo quy tắc tải, một timeout do bỏ đói của test này
trên máy bão hòa là NOT VERIFIED và được chạy lại, còn cách khắc phục (thêm context hoặc ít chiều rộng hơn cho mỗi cửa sổ, kiểu thay đổi
của DIAG4) là lựa chọn thiết kế test cho sau này.

### 1.6 Mọi rủi ro đã ghi, với trạng thái ở target

| Rủi ro (nguồn) | Trạng thái hiện tại |
|---|---|
| UX4-A 1 ngăn kéo nổi đè lên đầu phải của thanh kỳ | mở, chấp nhận (một lớp phủ; một lần bấm là đóng) |
| UX4-A 2 tải lại sau thay đổi nhãn hoặc theo lô làm mất các trường đã gõ | mở, đã ghi trong tài liệu (docs/04:69, docs/12:106) |
| UX4-A 3 thẻ xuất/nhập nạp muộn đẩy trang một lần | mở, tùy chọn (giữ chỗ chiều cao của thẻ) |
| UX4-A 4 thông báo của đổi mật khẩu, không có `aria-invalid` | mở, tùy chọn |
| UX4-A 5 thụt lề của `ol.review-steps.plain` | không còn áp dụng: trang Review vòng 5 không có danh sách bước (`review-steps` không còn trong `src/client`) |
| UX4-A 6 chú thích `--elev` cũ, `--scrim-side` không dùng | đóng bởi FIX2 (`--scrim-side` không còn) |
| UX4-A 7 giá trị cứng `width: 30%` | đóng bởi FIX2 (`--transfer-row-head-width`) |
| UX4-A 8 forced colours của nút gạt trên phần cứng thật | mở, NOT VERIFIED (kiểm trên thiết bị khi pilot) |
| UX4-A 9 mã server trong chữ của hộp cảnh báo | mở, tùy chọn |
| UX4-A 10 ô chọn file gốc của trình duyệt thay cho nút trong mockup | mở, chấp nhận (đã ghi trong docs/04) |
| R-UX4B-1 chấp nhận `end: null` kèm `breaks_confirmed: true` | mở, tùy chọn (client không bao giờ gửi) |
| R-UX4B-2 người được chia sẻ xóa ca đang chạy | đóng bởi R2 a của chủ sở hữu, FIX3 (409 `shared_clock_action`) |
| R-UX4B-3 Now trong giờ lặp lại của DST hỏi chọn lần nào | mở, chấp nhận (đúng R-07) |
| R-UX4B-4 giữ token phiên khi đổi mật khẩu | mở, tùy chọn |
| R-UX4B-5 bucket theo địa chỉ dùng chung với đăng nhập | mở, chấp nhận (không thêm khả năng mới) |
| R-UX4B-6 crash implicit-TLS trong một tiến trình (harness test) | mở, chỉ là rủi ro của harness |
| R-UX4B-7 file lịch công ty ghi sự kiện audit cho mỗi lần đổi | mở, chấp nhận (hành vi đã duyệt) |
| R-UX4B-8 file thiết lập có BOM UTF-8 bị từ chối | mở, tùy chọn |
| R1 `useBlockSize` theo content box (DIAG1) | mở, gia cố tùy chọn |
| R2 ảnh trong hộp thoại Sign off làm dịch bố cục (DIAG2 B) | mở, tùy chọn (giữ chỗ khung ảnh) |
| R3 các dạng thang và chiều rộng phân số trong trình duyệt | đóng một phần (test trình duyệt cho thang của FIX8); chiều rộng phân số vẫn chứng minh trên style sheet (docs/12:117) |
| R4 `aria-label` trên một div chung chung | đóng bởi FIX8 |
| R5 mũi tên "->"; định dạng ngày trong hộp thoại lý do | mũi tên đóng bởi FIX8; định dạng ngày được chấp nhận (`instantText` dùng toàn ứng dụng) |
| R6 `reviewLinkLabel` không dùng ngoài test của nó | mở, tùy chọn (`reviewModel.ts:220` vẫn chỉ được `tests/client/reviewModel.test.ts` dùng) |
| R7 lấy ngày trả lương làm "Today" khi `/periods/current` lỗi | mở, tùy chọn |
| R8 wordmark hiện, ẩn, rồi hiện khi có bộ chuyển | mở, chấp nhận (quy tắc không thêm hàng đã ghi) |
| R-UX5B-1 các lần gửi đang chạy khác revision | đóng: phương án A (FIX7), đường khôi phục FIX11 và FIX16; probe khôi phục của tôi |
| R-UX5B-2 cảnh báo chỉ ở phụ thuộc dev | mở, cho một đợt cập nhật phụ thuộc tùy chọn |
| R-UX5B-3 các điểm fetch của drill | đóng bởi FIX7 |
| R-UX5B-4 cơ sở bằng chứng của giới hạn worker; import PDF lười (FIX6b) | mở, tùy chọn (FIX6b được hoãn) |
| R-UX5B-5 vị trí của bước kiểm lý do (M3) | mở, test tùy chọn |
| R-UX5B-6 ký tự định dạng trong lý do và nội dung | mở, tùy chọn |
| R-UX5B-7 một GET render một biến thể | mở, chấp nhận theo thiết kế |
| R-A2-1 chạm trên máy tính bảng thật | mở, kiểm trên thiết bị khi pilot |
| R-A2-2 thanh cuộn dạng phủ | mở, NOT VERIFIED |
| R-A2-3 đổi kích thước khi thẻ đang có tiêu điểm | mở, chấp nhận |
| R-A2-4 độ mạnh test MA1, MA5, MA8, MA9 | MA1, MA8, MA9 đã đóng (test của FIX11, RECHECK-A2); MA5 còn mở |
| R-A2-5 các sweep của logo nhạy với tải | mở, backlog (mục 1.5) |
| R-UX5B2-1 phút thử lại của lần gửi được nhận trước khi có PDF (ghi chú của DIAG4) | mở, đã ghi trong tài liệu (docs/12:79); backlog |
| R-UX5B2-2 nút Resend chỉ thấy revision hiện tại | mở, tùy chọn |
| R-UX5B2-3 phương án A có thể chặn bao lâu | giới hạn đã biết có trong tài liệu (docs/12:114) |
| R-UX5B2-4 G2 và P4 sống sót | đóng bởi test của FIX11 |
| R-A3-1 các trường hợp biên của bộ theo dõi theme chưa có test (MB3, MB5) | mở, test tùy chọn |
| R-A3-2 hàng rào: múi giờ cố định, quyền miễn chưa có test (MB11, MB12) | mở, tùy chọn (mục 4) |
| R-A3-3 vòng focus khi focus bằng chuột (MB8) | mở, test tùy chọn |
| R-UX5B3-1 giây nửa đêm, múi giờ nhập Tokyo, nửa đêm DST trong test biên | giây nửa đêm đã đóng (FIX16, T4); phần thêm vẫn mở thành R-UX5B4-2 |
| R-UX5B3-2 thứ tự "muộn hơn" | đóng (ca E1 của FIX16, N5) |
| R-UX5B4-1..5 (hết lượt thử lại; giây trước nửa đêm; bất biến của trạng thái cancelled; một chú thích test cũ; docs/11:178 lần gửi lặp cùng revision) | mở, tùy chọn (RECHECK-B3) |
| DIAG5 cú nhảy 8 px trong một khung hình ở 768px | mở, tùy chọn |
| DIAG9 bộ test giữ các test tránh nửa đêm | lựa chọn thiết kế test đã ghi, đưa vào bàn giao WP5 (mục 4) |
| DIAG10 độ nhạy với tải của sweep logo | mở, backlog (mục 1.5) |
| UX3 R2 mục target-size của menu tài khoản ở 1440px | đã chấp nhận ở vòng 3, không đổi (RECHECK-A2) |

## 2. Thay đổi kể từ các lượt kiểm lại theo vùng

`git diff --name-status be2afa2..a5cbc91` ngoài `handoff/` (`20-diff-a2-target.txt`): `src/server/ops/restore.ts`, hai test tích hợp,
docs/05 EN và VI (FIX16), và `tests/e2e/import.spec.ts`, `tests/e2e/today.spec.ts` (FIX17). Không có file nào dưới `src/client`, không
style, không `tests/e2e/fixtures.ts`, không package hay lockfile, không tài liệu nào khác. Bản build target của tôi có entry
`index-qNP6kTPW.js`, đúng tên RECHECK-A2 và RECHECK-B3 đã ghi, và REGATE12 thấy cả 250 file `dist/` giống hệt bản build 1fe5ad3.

**Vùng A (PASS của RECHECK-A2 trên be2afa2 / ff73565b): vẫn giữ.** FIX16 không chạm file client nào. FIX17 (`21-diff-e2e-a2-target.txt`,
+26/-2):
- `import.spec.ts` chỉ thêm `bringToFront()` trước các bước điều khiển hoặc đọc một tab có thể đang ở phía sau (sáu lời gọi, hai chú
  thích). Không bước, assertion, ngân sách hay poll nào đổi; nó chứng minh đúng điều nó đã chứng minh, và việc tab phía sau bị bỏ đói
  (trace của DIAG10) không còn biến một bước 3 s thành timeout.
- `today.spec.ts:627` mở cửa sổ thứ hai thành một browser context riêng với storage state, viewport, locale, múi giờ và tùy chọn thiết bị
  của trang đầu, thay vì một tab thứ hai trong cùng context, và đóng nó trên cả hai nhánh. Phiên làm việc là một (cookie nằm trong storage
  state); test chỉ khẳng định các điều theo từng cửa sổ (nhãn Today, trạng thái không hoạt động, cú nhảy, số lần đọc), không điều nào phụ
  thuộc `localStorage` dùng chung, và mỗi cửa sổ ở phía trước trong context của nó, nên lần làm mới mà cửa sổ thứ hai cho thấy chính là
  lần do test phát ra. Tương đương; không bước hay assertion nào bị nới. Một giới hạn của test mà FIX17 không thêm cũng không bớt nằm ở
  mục 4.
- Lượt FULL của tôi trên cả hai project (469/35/0 và 407/97/0) và lượt bảy file lúc 06:58:30Z đều qua cả hai file.

**Vùng B (PASS của RECHECK-B3 trên a5cbc91 / 69c6daff): được xác nhận.** Cùng commit và digest. Tôi đọc lại `blockerOf`
(`restore.ts:536-564`): một send job muộn hơn của cùng kỳ (`held.timesheet_id`, `j.rowid > held.rowid`) ở bất kỳ trạng thái nào trừ
`cancelled` đều chặn; nơi duy nhất ghi `state = 'cancelled'` trong `src/server` là `dropHeldReminder` (`restore.ts:646`), hàm này từ chối
mọi loại trừ lời nhắc (`:643`), nên một send job không thể rơi vào ngoại lệ đó (`33-cancelled-writers.txt`). Probe khôi phục của tôi
(mục 3.1) đi qua việc giải phóng, từ chối và gửi bằng UI và CLI, và thấy đúng kết quả đã ghi trong tài liệu ở từng bước.

## 3. Các probe liên vùng

### 3.1 Khôi phục với một bản sửa (`zz-int-restore.spec.ts`; `40-obs-restore.txt`)

Một nguồn đã build trên cổng 51460 (`migrate`, `seed`; JOB_RUNNER tắt, chế độ capture); tài khoản seed `employee2@example.invalid` (đã lưu
người nhận To payroll, Cc manager, và một ảnh chữ ký tổng hợp) làm kỳ đang hiển thị 10/12-10/25 qua trang Review trên Edge; job chỉ chạy qua
`cli.js run-jobs`; sao lưu, khôi phục cô lập, `outbound resume --confirm` và `outbound release` qua CLI. Điều người dùng thấy, từng bước
(chip của Review và thẻ Send; trạng thái Timesheet hiện cùng chữ; History):

| Bước | Trang Review | History và người vận hành |
|---|---|---|
| S0 trước khi ký | "current", "Draft"; Send bị tắt, "Sign off first" | - |
| S1 đã ký qua hộp thoại Sign off | "Signed", "Not sent yet"; chân ký hiện ảnh, tên và "Signed"; Send bật | - |
| S2 Send | thông báo "Send 1 is queued for payroll@example.invalid"; "Submitted manually", "Email queued" | revision 1, "PDF is being prepared", "Email queued", Resend tắt "The PDF is not ready yet."; audit "Revision sent", không lý do |
| S3 `run-jobs` | "Email accepted by the mail server"; nút đổi thành "Send another copy..." | lượt 1 được chấp nhận, người nhận To và Cc |
| S4/S5 một ngày được đổi kèm lý do; "Sign correction" kèm lý do | "Corrected (revision 2)", "Not sent yet" | revision 2 đã ký; revision 1 "Superseded" với lượt gửi đã được chấp nhận của nó |
| S6 "Send another copy..." | hộp thoại nêu bản trước (người nhận, thời điểm, "accepted by the mail server"); ô lý do bắt đầu bằng lý do của bản sửa; rồi "Email queued" | audit "Revision sent", lý do "Synthetic correction of one day" |
| sao lưu khi lần gửi của revision 2 đang chờ; hai lần khôi phục cô lập từ bản đó | - | `restore` exit 0 mỗi lần: outbound tạm dừng `restored`, `send_jobs_held` 1 |
| A1 bản đã khôi phục, đang tạm dừng | "Corrected (revision 2)", **"Email needs attention"**; "Send another copy..." bật | revision 2 "Email needs attention", chưa có lượt gửi; trạng thái quản trị: "Outbound delivery is paused ... Held for reconciliation 1"; xem trước: 1 bị giữ, giải phóng được |
| A2 `outbound resume --confirm` | không đổi ("Email needs attention") | đã tiếp tục, `held_send_jobs` 1; không còn banner, một job "Needs attention" |
| A3 `outbound release --job --confirm` | "Email queued" | `released` |
| A4 `run-jobs` | "Email accepted by the mail server" | PDF và lần gửi đã chạy; một thư mục capture trên bản khôi phục (lần giải phóng đi đúng một lần); không còn gì bị giữ |
| B1 bản khôi phục thứ hai, đã tiếp tục; chủ sở hữu bấm "Send another copy..." | hộp thoại nêu bản đã được chấp nhận của revision 1; "Send 2 is queued"; "Email queued" | - |
| B3 xem trước và giải phóng theo id | - | job bị giữ bị chặn `superseded_by_later_send`; việc giải phóng exit 1 `refused superseded_by_later_send` |
| B4 `run-jobs` | "Email accepted by the mail server" | revision 2 lượt 1 được chấp nhận (lần gửi của chủ sở hữu); một thư mục capture; job bị giữ không bao giờ chạy |
| B5 `outbound release --all --confirm`, `run-jobs` | không đổi | giải phóng 0, từ chối 1 (`superseded_by_later_send`); `run-jobs` không nhận gì; vẫn một thư mục capture |

Đánh giá: bản build làm đúng như docs/05:72, docs/11 mục 7 và docs/12:114 nói, từ đầu đến cuối và từ phía người dùng: ký không gửi gì; một
lần gửi được xếp hàng và ghi lại; sau một bản đã được chấp nhận, mọi lần gửi thêm đều hỏi lý do, hộp thoại nêu bản trước, lý do được giữ
trong History và không có trong thư; bản sao lưu lấy lúc một lần gửi đang chờ được khôi phục với lần gửi đó bị giữ và outbound tạm dừng;
sau khi tiếp tục, người vận hành giải phóng lần gửi bị giữ và nó đi đúng một lần; và khi chủ sở hữu đã gửi lại trên bản khôi phục, lần gửi
bị giữ ở lại mãi và chỉ lần gửi của chủ sở hữu đi (trường hợp biên R-UX5B4-5 của RECHECK-B3, vô hại). Điều người dùng thấy về một lần gửi
bị giữ là "Email needs attention" (đúng sự thật: job ở `intervention`), không có chữ nào nói người vận hành đang giữ nó sau khôi phục hay
việc giải phóng vẫn có thể gửi nó, trong khi "Send another copy..." vẫn bật. Bấm nó là an toàn (việc giải phóng khi đó bị từ chối, không
gửi trùng), nhưng người dùng không phân biệt được hai tình huống; không tài liệu nào mô tả màn hình này (tùy chọn R-UX5I-1). Lượt 1 của
probe này có hai lỗi của probe (JSON của CLI bị đọc chung với một cảnh báo của Node, nên lần giải phóng in ra cách dùng; một `stop()` chờ
một lần thoát đã xảy ra rồi); các bước đến A2 và B3 của nó khớp với lượt 2 và nó được giữ lại dưới tên `*-run1-probe-defect.txt`.

### 3.2 Chốt chặn của Day editor khi một lần check in chạy qua nửa đêm (`zz-int-midnight.spec.ts`; `41-obs-midnight.txt`)

Đồng hồ FIX10, mỗi lượt bắt đầu lúc 2026-10-27T06:58:00Z (thứ Hai 10/26 23:58 ở Los Angeles, 118 s trước nửa đêm); test probe mang annotation
`CROSSES_MIDNIGHT`, nên hàng rào không giữ nó; desktop ở 1280px (ngăn kéo nổi) và project điện thoại (bottom sheet).

| Bước (desktop) | Quan sát |
|---|---|
| Today, rồi Check in lúc 23:58:03 | ca được ghi dưới 2026-10-26 (bắt đầu 06:58:03Z); trình sửa của 10/26 liệt kê "23:58 Running, Checked in" |
| gõ một ghi chú, chưa lưu; Escape | "Discard your changes?"; Keep editing giữ ghi chú |
| server qua nửa đêm (07:00:00.2Z), trang để nguyên | trình sửa vẫn mở trên 10/26 với ghi chú; nhãn Today vẫn ở 10/26 (không có bộ đếm giờ, như docs/04:58 nói); không có gì hỏi |
| lần làm mới khi lấy lại tiêu điểm như tài liệu ghi | một lần đọc `/api/periods/current`; nhãn Today dời sang 10/27; trình sửa vẫn ở 10/26 với ghi chú; không có gì hỏi |
| server | ca đang chạy nằm ở 10/26, không có ca nào ở 10/27; trang ghi "Checked in since 23:58 Mon 10/26, session running" |
| Escape sau nửa đêm | câu hỏi; Keep editing giữ ghi chú |
| Today (giờ là 10/27) khi có ghi chú | câu hỏi; Keep editing để trình sửa ở 10/26 với ghi chú |
| Check out từ trang | không tới được trong lượt này: ở 1280px khi mở thứ Hai, ngăn kéo nổi đặt bên phải và che nút Check out của trang (rủi ro 1 đã chấp nhận của UX4-A), và cú bấm của probe chờ đến hết thời gian của test; cùng bước đó với một ghi chú chưa lưu sau đó được làm ở 1440px trong probe clock-editor (F-UX5I-1) |

Lượt trên điện thoại (bottom sheet) đi qua mọi bước đến nửa đêm theo cùng cách, rồi: sau nửa đêm sheet để nguyên vẫn giữ ghi chú và nhãn
Today vẫn ở 10/26; lần làm mới khi lấy lại tiêu điểm dời nhãn sang 10/27 trong khi sheet và ghi chú ở lại và không có gì hỏi; Escape hỏi và
Keep editing giữ ghi chú; "Save day fields" từ phần chân cố định sau nửa đêm lưu ghi chú dưới 10/26 (10/27 không có bản ghi nào); Check out từ
thanh trên cùng sau nửa đêm kết thúc ca 23:58 - 00:00 ở 10/26 (10/27 không có ca nào).

Đánh giá: chốt chặn giữ qua nửa đêm; một lần đổi ngày ở nền không bao giờ làm mất hay hỏi về các trường chưa lưu; ca đang chạy ở lại ngày bắt
đầu của nó (docs/02, D-05) và lần bấm Today sau nửa đêm được chặn như mọi thao tác khác. Lỗi duy nhất gặp trên đường là F-UX5I-1 (các thao
tác đồng hồ của trang không làm mới trình sửa đang mở).

### 3.3 Theme qua hai tab khi Day editor và menu tài khoản đang mở (`zz-int-theme.spec.ts`; `42-obs-theme.txt`)

Một browser context (bộ nhớ dùng chung), hai tab; tab thứ hai giữ Day editor trên một ngày đã qua (10/23) với một ghi chú đã gõ, chưa lưu;
mỗi tab được đưa lên trước trước khi bị điều khiển hoặc đọc. Ở 1280px (nổi) và 1440px (cạnh bảng):
- menu tài khoản của tab thứ hai được mở khi ghi chú chưa lưu: menu mở, trình sửa ở lại, không có gì hỏi (một điều khiển giữ hành động
  riêng của nó, docs/04:69);
- chọn Dark ở tab thứ nhất: tab thứ hai được vẽ tối (`data-theme` dark, nền `rgb(14, 18, 23)`), menu đang mở của nó hiện Dark được chọn,
  trình sửa và ghi chú ở lại, không có gì hỏi; menu của nó vẫn mở khi nó trở lại phía trước;
- chọn Light trong chính menu của tab thứ hai: áp dụng ở đó, trình sửa và ghi chú ở lại, không có gì hỏi; tab thứ nhất theo;
- Escape khi menu mở: menu đóng và tiêu điểm về nút tài khoản, trình sửa ở lại và không có gì hỏi; Escape thứ hai hỏi "Discard your
  changes?"; Keep editing giữ ghi chú.
Điện thoại (bottom sheet, modal; bảng More không thể mở đè lên nó): chọn Dark ở tab thứ nhất làm tab thứ hai tối, sheet và ghi chú ở lại;
Escape hỏi; Keep editing giữ ghi chú. Exit 0. Đánh giá: bộ theo dõi của FIX14 và chốt chặn U4-05/U5-24 hoạt động cùng nhau.

### 3.4 Chế độ xem được chia sẻ, chỉ xem và sửa, với phần đầu, bảng và các hộp thoại của vòng 5 (`zz-int-shared.spec.ts`; `43-obs-shared-run2.txt`, `-run6.txt`)

Một chủ sở hữu tổng hợp chia sẻ timesheet (xem, rồi sửa; bật mục OT và PDF) với một người được chia sẻ tổng hợp; mọi request của trang
người được chia sẻ đều được ghi lại.
- Phần đầu và bảng ở 1440, 1280, 1024, 768, 767, 600, 480, 479, 390, 360 và 320px (project desktop) và 390, 360, 320px (điện thoại): thanh
  chia sẻ nêu chủ sở hữu và quyền; thẻ kỳ hiện khoảng ngày (dạng thang "10/12 /2026 → 10/25/2026" ở 320px), các nhãn và chỉ "<", ">" và
  Today; không có liên kết review và không có check in/out ở mọi chiều rộng; thanh công cụ chỉ có "Worked hours" khi chỉ xem và "Open a
  day, Open day, Worked hours, Change several days" khi có quyền sửa ("Change days" ở 320px); không chiều rộng nào cuộn ngang.
- Day editor: chỉ xem hiện chip "View only" và không có Edit, Delete, Add hay Save day fields; có quyền sửa thì hộp thoại "Partial leave"
  (1:30 vacation) không ghi gì cho đến "Save day fields", lệnh này gửi một `PUT /api/shared/:ownerId/days/<date>` (lưu 90 phút, vacation);
  bấm ra ngoài khi phần nghỉ chưa lưu thì hỏi và Keep editing giữ nó (desktop; khi không có gì chưa lưu thì đóng); không request nào ra
  khỏi đường chia sẻ (chỉ `/api/shared/:ownerId/...`, `/api/shares`, `/api/auth/me`).
- axe-core 4.14.0 (tag WCAG 2.0-2.2 A/AA), sau khi các chuyển động lắng xuống: 0 vi phạm trên bảng ở sáng và tối tại 1440 và 768px
  (desktop) và 390 và 320px (điện thoại), trên trình sửa đang mở và trên hộp thoại Partial leave, cho cả hai quyền.
Lịch sử probe (giữ lại tất cả): lượt 1 đọc axe ngay sau khi đổi chế độ màu (13 nút color-contrast tạm thời ở tối tại 1440px, mất đi khi
chuyển động lắng xuống) và bấm vào tiêu đề trang nơi ngăn kéo nổi che nó; lượt 2-5 sửa việc chờ lắng và tìm một điểm trống bên ngoài (lượt 3
và 4 thấy tiêu đề đã cuộn ra khỏi khung nhìn; lượt 5 gặp lỗi strict mode của chính assertion của tôi); lượt 6 hoàn tất project desktop (exit
0), lượt 2 project điện thoại. Đánh giá: phần đầu, bảng và các hộp thoại của vòng 5 đứng vững trong chế độ xem được chia sẻ, và ranh giới
chia sẻ được giữ.

## 4. Thiết kế test

**Bộ test như hiện nay.** 101 file vitest, 2.397 test; 504 test e2e mỗi project (chạy 469 và 407, phần còn lại là bỏ qua theo
project). Từ vòng 4, các vòng sửa đổi test theo ba cách, và không cách nào nới lỏng một phép kiểm: chờ theo trạng thái thay cho các lần
đọc tranh chấp với một khung hình hay một tab (`expectLayoutAt`, `expectSheetAt`, `stepPeriod`, `settledSelect`, `bringToFront`, chờ
ảnh), các cách chứng minh rẻ hơn cho cùng sự thật (DIAG4/FIX10: bốn context, một bề mặt đã giải mã, một evaluate, mỗi cách có bằng chứng
tương đương), và hàng rào nửa đêm. Mỗi bản sửa đi kèm các mutant mà test đã đổi bắt được (REGATE5-REGATE12, RECHECK-A/A2/B/B2/B3); các
mutant sống sót được liệt kê thành rủi ro tùy chọn (R-A3-1..3, R-UX5B4-1/-2, MA5, G6).

**Hàng rào nửa đêm (FIX15) và hành vi quanh nửa đêm có được phủ đủ không.** Hàng rào giữ một test sắp bắt đầu trong vòng 45 s trước nửa
đêm của múi giờ seed cho đến 0,5 s sau đó, không request, không đăng nhập, không truy cập cơ sở dữ liệu; một test được miễn bằng
annotation. Nó không bỏ ca hay assertion nào; nó bỏ cái nửa đêm ngẫu nhiên rơi vào giữa các test bất kỳ, mà DIAG9 đã cho thấy là 31 giả
định của test và không có lỗi sản phẩm. Những gì phủ nửa đêm hiện nay:
1. Việc server ghi ngày ở ranh giới được ghim trong bộ test: `timesheet-api.test.ts:125-148` (06:59:58Z, 07:00:00Z, 07:00:31Z, lần check out
   qua ranh giới); T1, T2 và T4 làm nó thất bại (RECHECK-B2, RECHECK-B3). Giây trước nửa đêm (T6) và các đêm DST chỉ được chứng minh bằng
   probe (probe 11 ca của RECHECK-B2, được RECHECK-B3 chạy lại), tùy chọn R-UX5B4-2.
2. Trang qua nửa đêm: test vượt nửa đêm `today.spec.ts:627` chạy nhánh vượt nửa đêm trong sweep bảy file của gate chỉ trên project desktop
   (59,5 s trong lượt của tôi; bản mobile bắt đầu sau nửa đêm và chạy nhánh đồng hồ thật trong 2,5 s, như REGATE12). Lúc
   2026-10-27T06:58:30Z kỳ đang hiển thị (10/12-10/25) không chứa ngày nào trong hai ngày đó, nên nhánh được chạy là "hôm nay ở kỳ khác":
   lần bấm Today phải đọc lại và nhảy (có phân biệt được), còn nửa "lần làm mới khi focus dời nhãn Today" chờ không có nhãn trước và sau và
   không thể thất bại. Mutant thiết kế test của tôi xác nhận điều đó (`50-mut-exits.txt`): khi bỏ việc làm mới lúc trang lấy lại tiêu
   điểm và lúc hiện lại (`TimesheetScreen.tsx`), test vượt nửa đêm vẫn đạt ở thời điểm đó trên cả hai project và thất bại lúc
   2026-11-04T07:58:50Z, khi kỳ đang hiển thị chứa cả hai ngày (bản đối chứng không mutant đạt ở đó); các test đếm lần làm mới với đồng hồ
   thật (`:764`, `:769`) thất bại với cùng mutant trên cả hai project. Vậy việc làm mới khi focus được ghim bởi các test đó, không phải bởi
   lượt vượt nửa đêm của gate (tùy chọn R-UX5I-2).
3. Day editor qua nửa đêm: không có test trong bộ test; probe của tôi (mục 3.2) và probe sản phẩm của DIAG9 là bằng chứng, không phải test
   hồi quy.

Đánh giá: đủ cho bản phát hành này. Quy tắc có thể làm mất dữ liệu hoặc ghi sai giờ (ngày ghi của một lần check in) được ghim ở ranh giới
bằng một test tích hợp thất bại khi sai ngày; việc trang tự xử lý ngày được ghim bằng lần bấm Today trong lượt vượt nửa đêm của gate và bằng
các test đếm lần làm mới; các khoảng trống còn lại là mục độ mạnh test trong khi sản phẩm đúng ở mọi probe, nên chúng là backlog tùy chọn,
không phải một vòng sửa.

**Các sweep đồng hồ mô phỏng so với thiết kế của FIX10.** WP5-UX-FIX10 làm bộ test không phụ thuộc ngày và chạy nó ở các vị trí lịch chọn
sẵn (một ngày cửa sổ, ngày đến hạn sau giờ đến hạn, ngày trả lương, DST, năm mới, một thứ Ba đến hạn của 2027) dưới `shiftclock.mjs`, thứ
dời mọi tiến trình Node đi một hằng số và để nguyên trình duyệt, dựa trên tiền đề "the client code never reads the browser clock". Sáu sweep
của gate vẫn làm đúng như vậy: cùng wrapper (giống từng byte với file của FIX10), ba lượt FULL lúc 2026-10-26T16:00Z, 2026-11-01T08:45Z và
2027-03-14T10:30Z và ba lượt bảy file quanh nửa đêm và năm mới. Có hai điều đã thay đổi từ FIX10:
- Tiền đề không còn đúng theo nghĩa đen: liên kết Today và Now của vòng 4 đọc đồng hồ thiết bị (`LocalTimeField.tsx:7`), và file thiết lập
  ghi `exported_at` từ nó (`SettingsTransferFile.ts:10`). Hai test bấm các liên kết đó đóng băng đồng hồ trình duyệt ở một thời điểm lấy
  từ server trước (`day-editor.spec.ts:5741`, `:5795`), test duy nhất đặt sai đồng hồ thiết bị làm vậy có chủ ý để chứng minh các gợi ý
  bỏ qua nó (`:828`), và không test nào so `exported_at` với đồng hồ server, nên các sweep vẫn có giá trị; chú thích của wrapper đã cũ
  (tùy chọn).
- Lượt bảy file lúc 06:58:30Z không còn đặt nửa đêm vào giữa các test bất kỳ; với hàng rào, nó chạy chúng ngay sau nửa đêm, và chỉ test vượt
  nửa đêm trải qua nó. Đó là lựa chọn thiết kế đã được chấp nhận của DIAG9, và năm sweep còn lại không bị ảnh hưởng (hàng rào không làm gì
  khi xa nửa đêm).

## 5. AC-13 dưới ba múi giờ thiết bị

`vitest run tests/integration/ac13-two-week.test.ts` trong bản export sạch, múi giờ được đặt trong môi trường của tiến trình con bằng
`run-tz.mjs` và được chứng minh bằng dòng `TZPROBE` của nó (`03-ac13-*.txt`): America/Los_Angeles (offset 420, test bắt đầu 01:00:21 giờ
địa phương) 1/1, exit 0; Asia/Tokyo (offset -540, 17:00:24) 1/1, exit 0; America/New_York (offset 240, 04:00:28) 1/1, exit 0. Múi giờ thiết
bị không gom lại kịch bản hai tuần (quy tắc 7 của AGENTS).

## 6. Tài liệu, EN và VI, so với hành vi đã đóng băng

- Cấu trúc (`60-docs-parity.txt`, script của tôi): docs 02, 03, 04, 05, 10, 11 và 12 có cùng các tiêu đề theo cùng thứ tự, cùng số gạch
  đầu dòng, mục đánh số, hàng bảng và khối code ở EN và VI. Các đoạn code nội dòng khớp theo từng mục, trừ chỗ file VI dịch các từ giữ chỗ
  bên trong một đoạn code (`<thư mục rỗng>`, `t<dòng giờ>o<dòng OT>`, ghi chú "(một thời điểm UTC)" và hai phác thảo bố cục ở docs/04 mục
  5): đó là bản dịch, không phải lệch nội dung. Số dòng chênh 1-3 ở docs 02, 03, 04, 05 và 10, như trước vòng này.
- Các điểm của audit này:
  - Khôi phục với một bản sửa: docs/05:72 ("refused (`superseded_by_later_send`) while any later send of the period exists, whatever
    state it is in or ended in (a cancelled one excepted)"), docs/11 mục 6 và 7 (giữ, tiếp tục, giải phóng, bản xem trước `outbound
    release`) và docs/12:114 và :130 khớp với code và probe của tôi (mục 3.1); các dòng VI nói cùng nội dung với cùng mã trên cùng dòng.
    docs/11:178 vẫn chưa nhắc lần gửi lặp cùng revision mà không gửi được gì (R-UX5B4-5 của RECHECK-B3), điều mà phần B của tôi cho thấy
    từ phía chủ sở hữu.
  - Chốt chặn của Day editor: docs/04:69 (EN) / :70 (VI) liệt kê các đường được chặn, quy tắc bấm ra ngoài và hai đường không chặn;
    docs/04:58 nói các kỳ được đọc lại khi cửa sổ lấy lại tiêu điểm và khi tab hiện lại; quy tắc ghi ngày của docs/02 (một ca qua đêm
    thuộc về ngày bắt đầu của nó) và D-05 khớp với server trong probe nửa đêm của tôi (mục 3.2).
  - Theme: docs/04:114 (VI :115) nói lựa chọn chỉ được lưu trên thiết bị đó và được áp dụng trước khi trang được vẽ; nó không nêu quy tắc
    giữa các tab. Bản build theo một tab khác (FIX14 khôi phục quy tắc của WP5-UX2 từ các bản ghi của nó). Không phải mâu thuẫn; dòng chuẩn
    có thể nói điều đó (tùy chọn).
  - Chế độ xem được chia sẻ: docs/04 dòng 14, 53, 60 ("a shared view has no link"), 62 (không có check in/out trong mọi chế độ xem được
    chia sẻ), 63 (các điều khiển sửa của thanh công cụ vắng mặt khi không có quyền sửa) và 72 (thẻ ca đang chạy trong chế độ sửa được chia
    sẻ có Edit và không có Delete) khớp với probe chia sẻ của tôi (mục 3.4).
  - docs/10 ghi H-1 a (2026-10-22) nguyên văn; docs/12 giữ danh tính bản phát hành được đánh dấu sẽ làm mới khi chấp nhận lại (dòng 7),
    đó là việc của ACCEPT-DOCS sau audit này.

## 7. Các kiểm tra bắt buộc (bản export sạch, lần lượt từng lệnh, một mình trên máy)

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, trạng thái ngoài `handoff/`, digest ở ba dạng, đầu và cuối | HEAD a5cbc91 = origin/main; không dòng nào; `69c6daff…e6bf`, 882 file, lúc 07:55:37Z và 09:08:47Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (ba bản export) | 0, 0, 0 (162 gói mỗi bản) | `02-ci-*.txt`, `50-mut-ci.txt` |
| đo tải đầu vào | 1,73 lõi bận trên 32 (không lượt nào của tôi gần giới hạn 8 lõi; 1,5-2,3 trước và sau mỗi lượt e2e) | `10-census-*.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không có dòng deprecation (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `03-typecheck.txt`, `03-lint.txt` |
| `npm run build` | 0; entry `index-qNP6kTPW.js` 492,09 kB, `ReviewScreen` 25,75 kB, CSS 96,06 kB; không có cảnh báo kích thước chunk | `03-build.txt` |
| `npm test` | 0: 101 file, 2.397 test (50,9 s) | `03-npmtest.txt` |
| AC-13 dưới America/Los_Angeles, Asia/Tokyo, America/New_York | 0, 0, 0: 1/1 mỗi lượt (offset `TZPROBE` 420, -540, 240) | `03-ac13-*.txt` |
| e2e FULL, đồng hồ thật, desktop (07:59-08:12Z) | exit 0: 469 đạt, 35 bỏ qua, 0 thất bại (11,4 phút); test logo dài nhất 46,7 s trên 240 s | `04-e2e-desktop.txt`, `04-e2e-counts.txt`, `12-logo-durations.txt` |
| e2e FULL, đồng hồ thật, mobile (08:12-08:20Z) | exit 0: 407 đạt, 97 bỏ qua, 0 thất bại (7,5 phút) | `04-e2e-mobile.txt` |
| lượt bảy file lúc 2026-10-27T06:58:30Z, wrapper FIX10, 6 worker (08:20:25-08:27:35Z giờ thật) | exit 0: 384 đạt, 84 bỏ qua, 0 thất bại (desktop 219/15, mobile 165/69); test vượt nửa đêm trên desktop 59,5 s (đã vượt), mobile 2,5 s (bắt đầu sau nửa đêm) | `08-seven-1026.txt`, `08-seven-counts.txt`, `13-crossing-durations.txt` |

Không lượt nào thất bại, nên không cần chạy lại vì lỗi mạng hay bộ đệm. Các dòng cảnh báo duy nhất trong log e2e là thông báo của Node rằng
`NO_COLOR` bị bỏ qua vì `FORCE_COLOR` được đặt (môi trường của tôi đặt cả hai), không phải deprecation.

## Phát hiện

1. **F-UX5I-1, Low - Day editor đang mở không theo một lần Check in hay Check out bấm trên trang** (`src/client/TimesheetScreen.tsx:305-312`,
   `:820-830`; `src/client/DayEditor.tsx:176-192`, `:207-212`, `:228-236`, `:250-257`).
   - Nguyên nhân: một thao tác đồng hồ tăng phiên bản của đồng hồ và màn hình tải lại kỳ (`load()`), nên bảng phía sau ngăn kéo cập nhật;
     trình sửa đang mở chỉ đọc ngày của nó (`GET /days/<date>`) khi được mount, sau các lần ghi của chính nó, và khi `refresh` được nâng,
     điều chỉ một thay đổi nhãn hoặc theo lô làm. Không có gì đọc lại nó sau một thao tác đồng hồ.
   - Tái hiện (`zz-int-clock-editor.spec.ts`, `44-obs-clock-editor.txt`; đồng hồ thật, project desktop, ở 1440px cạnh bảng và ở 1280px
     nổi): mở Day editor của hôm nay (chưa có ca); bấm Check in trên trang: server có ca đang chạy và trang hiện "Check out", trình sửa vẫn
     không có thẻ ca nào; bấm Check out và xác nhận không nghỉ: ca trên server đã kết thúc và ô ngày của bảng ghi "Time: 01:51 - 01:51 no
     breaks ... Status: Complete", trình sửa vẫn không có ca nào; đóng và mở lại: thẻ "01:51 - 01:51 No breaks taken, Checked in and out"
     xuất hiện (lượt 1, `44-obs-clock-editor-run1.txt`, giống vậy lúc 01:45). Khi gõ một ghi chú vào trình sửa trước (cùng file, trường hợp
     "unsaved note" ở 1440px): ghi chú vẫn còn và không có gì hỏi trong lúc Check in và Check out, nhưng "Save day fields" sau đó bị từ
     chối, "This day changed since it was loaded. Nothing was saved. Reload the day to see the latest data, then repeat your edit." kèm
     "Reload day", và server không giữ ghi chú nào (`41-log-probe-clock-editor-run2.txt`, `44-error-context-clock-editor-note.txt`). Theo
     code, "Reload day" khởi động lại các biểu mẫu từ ngày trên server (`DayEditor.tsx:250-257`, một `generation` mới), nên ghi chú đã gõ
     mất và phải gõ lại.
   - Mong đợi: docs/04 "Day editor": ngăn kéo không modal nên trang vẫn dùng được, và "Times" hiện một thẻ cho mỗi ca với khoảng giờ và một
     nhãn trạng thái ("Running" với một chấm tĩnh khi đang chạy); sau một thao tác của chính trang trên ngày đang mở, ngăn kéo hiện ngày như
     server đang giữ, như bảng phía sau nó. Vòng 4 (U4-05) làm ngăn kéo không modal ở mọi chiều rộng desktop, nên Check in và Check out của
     trang giờ bấm được khi ngăn kéo đang mở từ 768px (vòng 3 chỉ có điều này khi ở cạnh bảng, từ 1360px, nơi nó chưa được phát hiện); bottom
     sheet của điện thoại là modal và chế độ xem được chia sẻ không có đồng hồ, nên cả hai không bị ảnh hưởng.
   - Ảnh hưởng: ngăn kéo nêu sai sự thật (thiếu ca đang chạy hoặc một ca đã cũ, số liệu đã cũ), và một luồng desktop hằng ngày (gõ ghi chú
     cho hôm nay, rồi Check out cuối ngày) kết thúc bằng một lần lưu bị từ chối và một ghi chú phải gõ lại. Không gì bị lưu sai và không gì
     mất một cách âm thầm: kiểm tra phiên bản của server từ chối lần lưu đã cũ và nói rõ điều đó.
   - Sửa có giới hạn: khi phiên bản đồng hồ đổi lúc trình sửa đang mở, đọc lại ngày của nó mà không khởi động lại các biểu mẫu (đường mà
     `saved()` dùng: `setDay` từ `GET /days/<date>`, không đổi `generation`, nên các trường đã gõ và lý do vẫn còn); một test e2e ở 1440px và
     1280px: trình sửa của hôm nay đang mở với một ghi chú chưa lưu, Check in từ trang hiện một thẻ "Running" và giữ ghi chú, Check out hiện
     ca đã kết thúc và giữ ghi chú, và sau đó "Save day fields" lưu được nó; docs/04 một mệnh đề ở EN và VI nếu câu chữ cần.

## Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

Mới, từ audit này:
- **R-UX5I-1, điều chủ sở hữu thấy về một lần gửi bị giữ sau khôi phục.** Chip của Review, trạng thái Timesheet và History ghi "Email
  needs attention" cho lần gửi bị giữ, không có chữ nào nói người vận hành đang giữ nó hoặc có thể giải phóng nó, và "Send another copy..."
  vẫn bật. An toàn (một lần gửi muộn hơn làm việc giải phóng bị từ chối, nên không gửi trùng), nhưng người dùng không phân biệt được "đang
  bị giữ, vẫn có thể đi" với "đã thất bại". Tùy chọn: một câu trong docs/05 hoặc docs/12, hoặc một chữ trạng thái riêng cho lần gửi bị giữ.
- **R-UX5I-2, nửa "focus" của test vượt nửa đêm trong các gate.** Ở thời điểm sweep của gate 2026-10-27T06:58:30Z, kỳ đang hiển thị
  (10/12-10/25) không chứa ngày cũ lẫn ngày mới, nên test vượt nửa đêm (`today.spec.ts:627`) đi nhánh "hôm nay ở kỳ khác", nơi nửa làm mới
  khi focus chờ không có nhãn Today trước và sau. Mutant của tôi bỏ việc làm mới khi trang lấy lại tiêu điểm và khi hiện lại
  (`TimesheetScreen.tsx`) qua test đó ở thời điểm này trên cả hai project (exit 0; lượt desktop đã vượt nửa đêm, 1,5 phút) và làm nó thất
  bại lúc 2026-11-04T07:58:50Z, khi kỳ đang hiển thị chứa cả hai ngày (desktop và mobile exit 1, "the refreshed tab tags the new date", chờ
  2026-11-04, nhận 2026-11-03; bản đối chứng không mutant đạt ở đó). Các test đếm lần làm mới với đồng hồ thật (`today.spec.ts:764`,
  `:769`) bắt được cùng mutant đó trên cả hai project (mỗi test chờ lần đọc kỳ sau một sự kiện focus và hết thời gian). Vậy việc làm mới
  hiện vẫn được canh giữ, nhưng lượt vượt nửa đêm của gate chỉ chứng minh lần bấm Today. Tùy chọn: một thời điểm sweep (hoặc một lượt vượt
  nửa đêm thứ hai) có kỳ đang hiển thị chứa cả hai ngày, ví dụ 2026-11-04T07:58:50Z.
- **R-UX5I-3, quy tắc tải chưa thành chuẩn, và "timeout" chưa được định nghĩa.** Quy tắc nằm trong brief của REGATE12 và DIAG10; ghi nó
  vào bàn giao WP5 (và vào docs/08 hoặc mẫu gate qua một task GOV nếu muốn giữ lâu dài), và nói rõ một timeout của expect trong Playwright
  trên tab bị bỏ đói có tính là timeout không. Theo câu chữ hiện tại, thất bại như vậy làm gate FAIL (an toàn).
- **R-UX5I-4, các mục câu chữ nhỏ.** Chú thích của wrapper FIX10 "the client code never reads the browser clock" không còn đúng
  (`LocalTimeField.tsx:7`, `SettingsTransferFile.ts:10`; không sweep nào bị ảnh hưởng, xem mục 4); docs/04:114 không nêu quy tắc theme giữa
  các tab mà bản build tuân theo (FIX14 khôi phục nó từ các bản ghi WP5-UX2); docs/12:106 liệt kê các đường được chặn của vòng 4 mà thiếu
  việc bấm ra ngoài của vòng 5 (docs/04:69 có); banner tạm dừng của quản trị viên ghi "Release or drop the held sends, then resume" trong
  khi docs/11 mục 7 tiếp tục trước rồi giải phóng sau (cả hai thứ tự đều chạy; chữ có từ WP4, không thuộc vòng 4-5).

Gặp lại, không đổi: rủi ro 1 của UX4-A (ở 768-1329px ngăn kéo nổi đặt bên phải che nút Check out của trang với con trỏ; probe nửa đêm của
tôi gặp nó ở 1280px khi mở thứ Hai). Mang sang (trạng thái ở mục 1.6): các mục tùy chọn còn mở được liệt kê ở đó.

## Backlog tùy chọn cho bàn giao WP5 (không mục nào trong đây chặn việc chấp nhận lại; F-UX5I-1 thì có)

1. Độ mạnh test, vùng A: R-A3-1 (trường hợp biên của bộ theo dõi theme), R-A3-2 (hàng rào: múi giờ cố định, quyền miễn chưa có test),
   R-A3-3 (vòng focus khi focus bằng chuột), MA5 (thời gian sống của listener `touchend`), R-UX5I-2.
2. Độ mạnh test, vùng B: R-UX5B4-1 (hết lượt thử lại), R-UX5B4-2 (giây trước nửa đêm; múi giờ nhập Tokyo và nửa đêm DST trong test biên),
   R-UX5B-5 (vị trí của bước kiểm lý do), G6 (chữ của 409).
3. Tài liệu và chú thích: R-UX5B4-3, R-UX5B4-4, R-UX5B4-5, R-UX5I-1, R-UX5I-4.
4. Gia cố sản phẩm tùy chọn: R1 (border box của `useBlockSize`), R2 (khung ảnh Sign off), cú nhảy 8 px một khung hình của DIAG5,
   R-UX5B2-1 (nhận PDF trước lần gửi của nó khi cùng thời điểm, hoặc không tính `pdf_not_ready`), R-UX5B2-2 (cờ chờ theo cả kỳ cho
   Resend), R-UX5B-6, R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3, 4, 9.
5. Kiểm trên thiết bị khi pilot (NOT VERIFIED ở đây): R-A2-1 (chạm trên iPad và máy tính bảng Android thật), R-A2-2 (thanh cuộn dạng phủ),
   UX4-A 8 (forced colours), thanh cuộn chiếm chỗ trên các trình duyệt khác (docs/12:108); chủ sở hữu tự xem các mẫu PDF so với B11.
6. Quy trình và harness: độ nhạy với tải của sweep logo (R-A2-5, DIAG10), R-UX5I-3, R-UX5B-2 (cảnh báo chỉ ở phụ thuộc dev: vite, vitest,
   smtp-server), R-UX5B-4 (FIX6b được hoãn), R-UX4B-6 (crash của test implicit-TLS); nhánh mobile của test vượt nửa đêm chỉ thật sự vượt
   trong các lượt stress, không trong sweep của gate (mục 4).
7. Các quyết định của coordinator mà chủ sở hữu được báo, không được hỏi (đáng một dòng mỗi mục trong bàn giao để chủ sở hữu tự xem): R3 b
   bị bỏ vì trang Review vòng 5 không còn cột danh sách kiểm tra (2026-10-21); nút "Sign correction" của chân ký đã ký xuống dưới nội dung
   đã ký khi hẹp hơn khoảng 1150px (PLAN-FIX7A, RECHECK-A); phương án A, nên lần gửi của bản sửa có thể chờ sau một lần gửi cũ hơn của kỳ
   đến khoảng 81 phút (PLAN-FIX7, docs/12:114); quy tắc theme giữa các tab được khôi phục từ WP5-UX2 (DIAG8).

## Các gate bắt buộc chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ qua, và không cần chạy lại kiểm tra nào. Tôi không chạy, theo phạm vi của brief: container drill,
`npm audit` và lượt quét axe đầy đủ (REGATE12 mang chúng sang từ REGATE11 và REGATE9 với `dist/` giống hệt; các lượt axe của tôi chỉ trên chế
độ xem được chia sẻ), năm sweep còn lại (REGATE12 đã chạy cả sáu). Các mục NAS vẫn NOT VERIFIED. Các lượt probe có lỗi của chính tôi được giữ
lại và nêu tên ở mục 3; không kết luận nào dựa vào chúng.

## Xử lý các phát hiện trước

Mọi phát hiện của các vòng đã đóng (mục 1.1). PASS vùng A của RECHECK-A2 vẫn giữ ở target và PASS vùng B của RECHECK-B3 được xác nhận
(mục 2). Audit này không chấp nhận lại WP5: F-UX5I-1 còn mở, nên RECHECK-A2 và RECHECK-B3 vẫn là các kết luận vùng mới nhất cho đến khi có
bản sửa và lượt kiểm lại của nó.

## Sẵn sàng phần mềm, sự cho phép của chủ sở hữu và kết quả pilot

Sự sẵn sàng phần mềm chưa được thiết lập lại cho vòng 4 và 5: audit tích hợp này là FIX REQUIRED (một phát hiện Low, một thay đổi client).
Sự cho phép của chủ sở hữu: chưa được xin hay cấp. Kết quả pilot: chưa có; NAS vẫn NOT VERIFIED. Không đụng tới việc gửi thật hay triển khai
(chỉ capture cục bộ, người dùng tổng hợp `example.invalid`).

## Một hành động tiếp theo

Một bản sửa client có giới hạn cho F-UX5I-1 (loại fix, `addresses_audit` WP5-UX5-AUDIT-INT; `TimesheetScreen.tsx` và `DayEditor.tsx`, một
test e2e, docs/04 EN và VI chỉ khi câu chữ cần), lần freeze của nó, một regate cho thay đổi client (danh tính, so sánh `dist/`, các kiểm tra
lõi, e2e FULL đồng hồ thật, sáu sweep, axe trên Timesheet khi ngăn kéo đang mở; drill và `npm audit` được mang sang nếu `dist/server` và các
file package không đổi), và một lượt kiểm lại mới cho F-UX5I-1 cùng các điểm tích hợp của bài review này trên digest mới, trước khi chấp
nhận lại WP5 và ACCEPT-DOCS.

## Nguồn gốc subagent độc lập

- Task/lần review, ID người review và ID tác giả được review: WP5-UX5-AUDIT-INT lần 1; agent review `abc262afcf62ce6a7` (board); tác giả
  của snapshot là các planner, worker, người sửa và người chẩn đoán của WP5-UX4 và WP5-UX5 trên board (`01-author-models.txt`; ví dụ
  WP5-UX4-PLAN `a3f294195d4f4c99f`, WP5-UX4-T04 `ac40529a094d001dc`, WP5-UX5-PLAN `a2066720d8bdcb583`, WP5-UX5-T01B `a084c1bdda1d1e1cf`,
  WP5-UX5-DIAG7 `a2f9710356f00cfc2`, WP5-UX5-FIX16 `aaa0458d71ba78d3a`, WP5-UX5-DIAG10 `a06798c4c71075da3`, WP5-UX5-FIX17
  `a4b1c3c982a5be9ee`).
- Ngữ cảnh mới; tôi không viết thay đổi nào được review. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng
  chứng.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE12 PASS (lần 2).
- Đường dẫn báo cáo mới: `handoff/delivery/WP5_UX5_REVIEW_INT.md` (+ `.vi.md`); mọi bài review trước đều không bị đụng tới.
- Xử lý phát hiện và task tiếp theo của coordinator: F-UX5I-1 còn mở (Low), hành động tiếp theo ở trên; R-UX5I-1..4 tùy chọn.
