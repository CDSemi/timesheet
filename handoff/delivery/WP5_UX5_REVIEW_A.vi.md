# WP5 đợt đổi giao diện 5, audit vùng A trên f4049aa (WP5-UX5-AUDIT-A)

Bản dịch của [WP5_UX5_REVIEW_A.md](WP5_UX5_REVIEW_A.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP5, đợt đổi giao diện 5 theo yêu cầu chủ, gộp cả đợt 4 (WP5-UX5), vùng A
  (giao diện, khung ứng dụng, Timesheet, Day editor, giao diện Review, trợ năng); task WP5-UX5-AUDIT-A, attempt 1, 2026-10-27 từ 03:26Z
  đến khoảng 04:20Z (thứ Hai 2026-10-26, 20:26 đến khoảng 21:20 giờ America/Los_Angeles: một ngày cửa sổ; trang mở ở kỳ 10/12-10/25/2026,
  kỳ đã kết thúc và hạn nộp thứ Ba 10/27 17:00; hôm nay nằm trong kỳ đang diễn ra 10/26-11/08). Model reviewer tự báo `claude-opus-5-5`,
  profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model tác giả mạnh nhất của snapshot trên board
  là `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN, WP5-UX5-T01B); các tác giả khác là `claude-sonnet-5-5` (vài mục không ghi
  model), nên reviewer không yếu hơn. Tôi không viết task WP5-UX4 hay WP5-UX5 nào. WP5-UX5-AUDIT-B chạy cùng lúc trên cùng máy.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `f4049aa7905e22f1467dfcae4208675cb2fc8e80` (commit WP5-UX5-FIX6-FREEZE, đã push; WP5-UX5-REGATE4 PASS trên nó). HEAD = commit đó trước
  và sau; không có dòng trạng thái nào ngoài `handoff/` trước và sau. Digest
  `26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336`, 882 file, không tính `handoff/`, bằng nhau ở ba dạng lúc 03:26:44Z và
  lúc 04:12:21Z: bản export sạch `git archive` băm bằng `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp giống
  từng byte với danh sách của export) và `npm run digest`. Source đủ: `npm ci` exit 0 ở ba export (đích, bản probe, bản mutant).
- **Quyết định: FIX REQUIRED.** Bốn lỗi (một Medium, ba Low), chi tiết ở mục "Lỗi":
  1. Medium: trên trang Review của một kỳ đã ký (mọi lần mở lại sau khi ký, ví dụ để gửi), dòng Employee Signature chứa ảnh chữ ký, tên
     và "Signed" cùng nút "Sign correction". Từ 480px trở xuống phần nội dung bị ép còn khoảng 21px, tên bị ngắt hai ba chữ cái một dòng,
     nút che dấu "Signed" và dòng của nhân viên không còn thẳng hàng với dòng của quản lý (ở 768px phần nội dung rộng 45px).
  2. Low (WCAG 2.2 SC 2.5.3, mức A): khi cửa sổ hẹp hơn khoảng 344px, nút trên thanh công cụ hiện "Change days" trong khi tên truy cập vẫn
     là "Change several days", không chứa chữ đang hiện.
  3. Low: thao tác bấm ra ngoài trên desktop đóng Day editor khi lần nhấn xuống thực ra là cuộn: một lần vuốt cảm ứng bắt đầu ngoài cột
     ngày trên màn hình cảm ứng rộng từ 768px, và một lần nhấn hoặc kéo trên thanh cuộn ngang riêng của thẻ tuần (768 đến 929px).
  4. Low (tài liệu): docs/04, docs/12 (EN và VI) và ba chú thích trong style sheet nói những điều bản build không làm.

  Mọi thứ khác trong phạm vi đều đạt theo đo đạc của chính tôi (từng mục bên dưới). Kiểm tra bắt buộc: typecheck, lint, `npm test` hai lần,
  build (không có cảnh báo chunk) và AC-13 exit 0; FULL e2e đồng hồ thật 863 passed, 125 skipped, 0 failed. axe-core 4.14.0: 0 vi phạm
  trong 108 lần quét (tám tình huống giao diện và thiết bị). SC 2.4.11: 0 điều khiển có focus bị che hoàn toàn trong 1.440 lần dừng bàn
  phím. Mutant: 17 mutant của tôi, 15 bị bắt, một không bị bắt (M2), và mutant so ngày của FIX5 (M13) bị bắt lúc qua nửa đêm bởi
  `today.spec.ts:626`, không phải bởi vòng poll mới.

## Phạm vi thật đã xem và chạy

1. Đọc như tuyên bố: brief; AGENTS.md trên đĩa (mục UI "Frontend and UI/UX standards"); lời chủ trên board (yêu cầu đợt 5, câu trả lời
   F-1..F-10 và chỉnh mockup, ghi chú mockup 2, chỉnh 3 và đính chính, "1 a, 2 a", "A.a, B.A, C.b", câu trả lời đợt 4) và quyết định của
   coordinator 2026-10-20 đến 2026-10-22; WP5-UX5-PLAN (A, B3, D, E, Phụ lục 1, 2, 3b) và mười hai bản vẽ; hồ sơ slice T03, T04, T05A, T05B
   (và T06 cho tài liệu); GATE, FIX1, REGATE, DIAG1, FIX2, REGATE2, FIX3, REGATE3, DIAG2, FIX5, DIAG3, FIX6, REGATE4; WP5-UX4-AUDIT-A, FIX2,
   FIX3; docs/04, docs/10, docs/12 (EN và VI).
2. Code đã đọc cho vùng A: `styles.css` (token ở ba bộ màu, chuyển động, forced colours, mọi media và container query, thẻ kỳ, thanh công
   cụ, bảng, chữ ký, ngăn kéo, nút phụ), `layoutQueries.ts`, `useMedia.ts`, `useEditorLayout.ts`, `editorLayoutModel.ts`, `useBlockSize.ts`,
   `TimesheetScreen.tsx`, `PeriodBar.tsx`, `OpenDay.tsx`, `ReviewStatus.tsx`, `reviewModel.ts` (phần U5-14), `TimesheetSheet.tsx`,
   `SheetWeekTable.tsx`, `DayEditor.tsx`, `DayFieldsForm.tsx`, `LeaveDialog.tsx`, `ReviewScreen.tsx`, `ReviewDays.tsx`, `SignoffDialog.tsx`,
   `SendCard.tsx`, `deliveryModel.ts` (`sendCardState`), `SubmissionSettingsForm.tsx`; diff test của các đợt sửa (FIX2, FIX3, FIX5, FIX6).
3. Kiểm tra bắt buộc trong một export sạch (`export`).
4. Probe của tôi trong export thứ hai (`export-probe`; các `zz-a5-*.spec.ts` chỉ ở task folder, chạy qua harness của repository, Edge
   headless, không có gì trong repository): hình học trang Timesheet ở 13 độ rộng desktop và 7 độ rộng compact; độ rộng lẻ với hệ số tỉ lệ
   thiết bị ép buộc (đổi kích thước cửa sổ qua CDP và một frame about:blank); Day editor (ma trận bấm ra ngoài, mọi đường guard với Keep
   editing và Discard, vuốt cảm ứng, nhấn trên thanh cuộn cổ điển, bottom sheet điện thoại, hộp thoại Partial leave, lý do kỳ cũ); trang
   Review (tiêu đề, thẻ kiểm tra, Preview, hình học chữ ký ở 10 độ rộng, hộp thoại Sign off, chân đã ký, thẻ Send, lỗi trường, một lần gửi
   thật qua capture sink, hộp thoại lý do); axe và quét tương phản chữ; đi bàn phím; kích thước mục tiêu; kiểm lại đợt 4.
5. Mười bảy mutant trong export thứ ba (`export-mut`), mỗi mutant áp riêng, build lại client, chạy các test cần bắt, trả file về và so từng
   byte; M13 dưới đồng hồ mô phỏng FIX10 lúc qua nửa đêm America/Los_Angeles, kèm một lần đối chứng không mutant.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX5-AUDIT-A/` cùng 10 ảnh `-synthetic.png`; mã probe và script được
giữ dưới dạng `zz-src-*.txt`; `00-README.txt` là mục lục.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng, đầu và cuối; HEAD; trạng thái ngoài `handoff/` | `26b163a6…05336`, 882 file lúc 03:26:44Z và 04:12:21Z; danh sách export = danh sách `ls-tree`; HEAD f4049aa; không có dòng | `01-*-before.txt`, `01-*-after.txt`, `00-*` |
| `npm ci` (ba export) | 0, 0, 0 | `02-ci.txt`, `02-ci-extra.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không có dòng deprecation | `02-typecheck.txt`, `02-lint.txt` |
| `npm test` hai lần | 0 và 0: 101 file, mỗi lần 2374 test (50,8 s, 48,9 s); không worker nào crash | `03-npmtest-1.txt`, `03-npmtest-2.txt` |
| `npm run build` | 0; main `index-BeK5KvKY.js` 490,79 kB, `ReviewScreen` 25,68 kB, không có cảnh báo kích thước chunk | `04-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `05-ac13.txt` |
| FULL e2e, đồng hồ thật, hai project (03:29:54-03:53:37Z) | exit 0: 863 passed, 125 skipped, 0 failed (494 test mỗi project); không chạy lại | `06-e2e-full.txt`, `06-e2e-project-started.txt` |
| Probe hình học Timesheet | xem bảng U5 | `obs-sheet.txt` |
| Độ rộng lẻ | đạt 767,333 CSS px bằng đổi cửa sổ ở 150%; đạt 479,333 và 767,333 trong frame about:blank ở 150% | `obs-frac*.txt` |
| Probe Day editor | xem mục "Day editor" | `obs-editor*.txt`, `obs-classic*.txt` |
| Probe Review | xem mục "Giao diện Review" | `obs-review.txt` |
| axe-core 4.14.0 + quét tương phản chữ | 108 lần quét, 0 vi phạm; chữ thấp nhất 4,59:1 (sáng), 4,65:1 (tối), 0 dưới 4,5 | `obs-axe.txt` |
| Đi bàn phím | 8 lượt, 1.440 lần dừng, 0 bị che hoàn toàn, mọi lần dừng đều có vòng focus | `obs-walk.txt` |
| Kích thước mục tiêu (390 cảm ứng, 1280 con trỏ thô) | chỉ các nút phụ 36px dưới 44px, mỗi nút có vùng chạm ở trên và dưới | `obs-targets.txt` |
| Mutant | 17: bắt 15, M2 không bị bắt, M13 chỉ bị `today.spec.ts:626` bắt | `61-mutants-summary.txt`, `log-mut-*.txt` |

## Đúng ý chủ, đợt 5 (mỗi mục một kết luận; U5-33 và U5-34 thuộc vùng B)

| Mục | Kết luận | Bằng chứng của tôi |
|---|---|---|
| U5-01 compact dưới 480 (F-6 a) | Đạt | 479px: thẻ và tờ giấy cách mỗi mép 8px, góc thẻ 12px, bảng 447px; 480-929px: lưới 7 cột cuộn trong thẻ, trang không cuộn ngang ở mọi độ rộng |
| U5-02 wordmark | Đạt (sai lệch chấp nhận được) | hiện ở 600 (thanh điện thoại) và 1440, ẩn ở 390/320 (cần 414px); quét `logo.spec` đạt trong lần chạy của tôi |
| U5-03 mũi tên select | Đạt | một lớp conic, ô 12x6, forced colours trả lại mũi tên gốc; test vệt sáng đạt trong e2e của tôi |
| U5-04 biểu tượng | Đạt | SVG nội tuyến trên Edit, Delete (tông nguy hiểm), Add session, Add (nghỉ phép) trong ảnh và code |
| U5-05 36px + vùng chạm 44px (F-1 a) | Đạt | khung 36,0px; vùng chạm 3px trên và dưới ở 390 cảm ứng và 1280 con trỏ thô (`obs-targets.txt`); M5 bị bắt |
| U5-06 nút đổi giao diện | Đạt | 32px với con trỏ tinh từ 768, 44px trong các trường hợp khác (CSS; `theme.spec` đạt trong lần chạy của tôi) |
| U5-07 khoảng giờ có dấu cách | Đạt, có khoảng trống tài liệu (lỗi 4) | "07:30 - 11:45" ở 1440; dạng sát theo từng bảng khi cần; một ca qua đêm "22:00-06:00+1" xuống hai dòng trên bảng 7 cột ở 480 đến 900px và hơn, không chỉ "trong ô hẹp nhất của điện thoại" |
| U5-08 Current period | Đạt | hiện sau Next trong ngày cửa sổ này; Keep editing giữ focus trên nó |
| U5-09 ">" và Today bên trái | Đạt | khoảng cách 20,0px / 20,0px quanh khoảng ngày, Today cách ">" 8,0px ở 1440..632 |
| U5-10 chip dưới khoảng ngày | Đạt | đỉnh khoảng ngày = đỉnh nút (0,00), đáy chip cuối = đáy nút (0,00) |
| U5-11 giữ đường phân cách | Đạt | 1px liền, rộng: trên 10px / dưới 8px, hẹp: 8 / 6 |
| U5-12 nút xuống dòng chỉ khi cần | Đạt | rộng ở 632, hẹp ở 631; hẹp: ">" sát mép phải (0,0), khoảng ngày ở giữa (0,0) |
| U5-13 bậc rút gọn khoảng ngày | Đạt | dạng đầy đủ đến 360px, "10/12 → 10/25/2026" ở 340/320, "10/26 → 11/08/2026" khi qua tháng; chữ truy cập "10/12/2026 to 10/25/2026" |
| U5-14 nút Review dạng chính (H-1 a) | Đạt | dạng chính cho bản nháp đã hết kỳ; dạng nhẹ cho kỳ đang diễn ra (ảnh 320); M3 bị bắt |
| U5-15 767/768 | Đạt | đạt 767,333 CSS px: `max-width: 767px` và `min-width: 768px` cũ đều sai, mọi quy tắc dạng range đều ở phía khung điện thoại |
| U5-16 xuống dòng tiêu đề bảng | Đạt | một hàng từ 1100; khối trường xuống dưới tiêu đề ở 900/768; Period xuống trước ở 700; tiêu đề một dòng |
| U5-17 "Open" | Đạt | "Open" ở 340/320, chữ nhãn ẩn ở 320, ô ngày giãn hết hàng |
| U5-17b "Change days" | Hành vi đạt; SC 2.5.3 không đạt (lỗi 2) | canh phải (0px) ở mọi độ rộng compact, "Change days" ở 340/320 |
| U5-18 "Worked hours" | Đạt | tên và nhãn công tắc |
| U5-19 khoảng cách Today | Đạt | nút cách thanh 3px là 8,5px ở 390 và 320 |
| U5-20 dòng giờ làm | Đạt | mỗi ngày một tbody, không kẻ dưới dòng ngày, kẻ 2px đóng nhóm, nền `--worked-line`, thụt 27px |
| U5-21 thanh WEEK | Đạt | rộng thanh = rộng lưới (850px) trước và sau khi cuộn ngang hết ở 900..480 |
| U5-22 lề compact | Đạt | 8,0px hai bên ở 479..320; bảng 358px ở 390 |
| U5-23 ngăn kéo góc vuông | Đạt | cả bốn góc 0px, sáng và tối, neo phải; bottom sheet điện thoại 12/12/0/0 |
| U5-24 bấm ra ngoài (F-7 a) | Đạt, trừ lỗi 3 | 8 vị trí ở 1280 và 1440 đóng ngăn kéo với focus về nút ngày; điều khiển giữ hành động của nó (Today chuyển editor sang hôm nay); khi có sửa đổi thì hỏi và Keep editing trả focus về ô đang sửa |
| U5-25 hộp thoại Partial leave (B5 Notes ở lại) | Đạt | Done chỉ ghi bản nháp (0 PUT), Cancel và Escape khôi phục và chỉ đóng hộp thoại, focus về Change/Add, 25h bị từ chối trong hộp thoại với `aria-invalid`, Remove, Close sau Done thì hỏi, kỳ cũ cần lý do, Notes không ở trong hộp thoại |
| U5-26 chân điện thoại, không Figures | Đạt | sheet modal, 0 figures, Save 358x44 ở chân (ngoài form, dùng `form=`), cùng vị trí y sau khi cuộn thân |
| U5-27 tiêu đề và chip | Đạt | không có mã submission; chip dưới dòng mô tả, canh trái |
| U5-28 thẻ kiểm tra | Đạt | đệm 16px (12px dưới 480), chữ canh giữa theo nút (0,0), khoảng cách 16px, "Back" dưới 480 |
| U5-29 thẻ Preview | Đạt | dòng tên công ty ẩn (cao 0) ở 340/320, không bao giờ xuống dòng; tiêu đề xuống dòng theo từ từ 390 trở xuống |
| U5-30 hộp thoại Sign off và chữ ký | Không đạt khi mở lại ở độ rộng hẹp (lỗi 1) | nội dung hộp thoại, từ chối ngay trong hộp thoại với focus về ô xác nhận, Escape về Sign off, chân đã ký và focus về thẻ Send đều đạt; thụt 3,518 / 27,406 / 13,703 / 10,925% ở 1440..768, các hàng thẳng, nút cách 8,00px |
| U5-31 thẻ Send (F-3 b, F-4) | Đạt (sai lệch chấp nhận được) | Send bị tắt "Sign off first" trước khi ký; lỗi trường có focus và không POST; công tắc điều khiển liên kết PDF; một lần gửi thật qua capture; "Send another copy..." với hộp thoại lý do: lý do rỗng và 1 ký tự bị từ chối, Cancel không POST |
| U5-32 ghi chú múi giờ | Đạt | một ghi chú chữ nhạt ở cuối trang |

Người được chia sẻ không thấy gì trong số đó: chế độ chia sẻ không có Sign off, Send, PDF Preview hay Save PDF và mount chia sẻ trả 404 cho
send, send-draft và pdf-preview (`sharing.spec.ts:370-378`, đạt trong lần e2e của tôi); `#/review/<date>` chỉ hiện review của chính người
đang đăng nhập (`App.tsx:173`).

**Các sai lệch đã ghi, đánh giá:** T03 "From" trước khi có revision (chấp nhận được; hàng From có mặt và địa chỉ hiện sau khi ký); T03 "PDF
Preview" ở tab mới (chấp nhận được: CSP cấm nhúng frame); T04 wordmark chế độ chia sẻ từ 492px và ngưỡng thẻ đo được 600 / +138px (chấp nhận
được; tôi đo điểm lật ở 631/632); T05A ngưỡng thanh công cụ (chấp nhận được; đo ở 340/320); T05A cho phép xuống dòng với "+1" muộn (hành vi
chấp nhận được, mô tả sai, lỗi 4); T05A tiêu đề Review `nowrap` (chấp nhận được: đó là một cột, các trường vẫn xuống dòng theo cụm); T05B
không dùng lại `LeaveRow.tsx` (chấp nhận được: đó là dòng yêu cầu nghỉ bằng OT); `preventDefault` khi bấm ra ngoài (chấp nhận được: tôi
thấy focus về nút ngày hoặc ô đang sửa); thông báo "saved" khuất sau khi lưu ở chân (chấp nhận được như giới hạn đã ghi, docs/12:117; được
đọc qua `role=status`); bấm vào phần trống của thanh trên đóng ngăn kéo (chấp nhận được: đó là bấm ra ngoài).

**Rủi ro tùy chọn từ DIAG1 (`useBlockSize.ts`):** là rủi ro đã ghi, chưa cần làm. Observer theo dõi content box trong khi thuộc tính là border
box, nhưng thay đổi duy nhất của thanh tại một breakpoint là `min-height` 52 sang 56px, làm đổi content box với `box-sizing: border-box`, và
padding của thanh không đổi; nơi đọc giá trị là scroll padding và độ lệch.

**DIAG2 B (ảnh chữ ký đến muộn làm hộp thoại Sign off dịch chuyển):** chấp nhận được như việc tồn đọng. WCAG 2.2 AA không có tiêu chí ổn
định bố cục và docs/04 cũng không nêu; sự dịch chuyển xảy ra một lần khi hộp thoại mở, lúc focus ở tiêu đề. Dành sẵn ô cho ảnh vẫn là một
gia cố tùy chọn rẻ.

## Hệ thống style, breakpoint, trợ năng

- Token: `--compact-edge`, `--period-step-gap`, `--period-current-room`, `--subbtn-h`, `--subbtn-hit-extra`, `--theme-seg-h`,
  `--select-arrow-w/-h/-inset`, `--send-*`, `--signoff-*`, bộ `--sig-*` (trong phạm vi `.review-signatures`) đều có; màu mới duy nhất,
  `--worked-line`, có ở bộ sáng và cả hai bộ tối với cùng giá trị. Một `--transition` trên mọi phần tử, không bao giờ `all`; reduced motion
  đặt thời lượng 0,01 ms; forced colours trả lại mũi tên select gốc. docs/04 "Visual standard" có các dòng cũ (lỗi 4).
- Breakpoint: mọi media query đều là cú pháp range; `SHELL_QUERY` và `SHEET_QUERY` khớp với CSS. Cách của tôi đạt được độ rộng lẻ trong
  trình duyệt: Edge với `--force-device-scale-factor=1.5` và không giả lập viewport, đổi kích thước qua CDP, cho 767,333 CSS px (cửa sổ nhỏ
  nhất dừng ở 485,33), và một frame about:blank rộng 479,333px hoặc 767,333px ở tỉ lệ đó cho layout viewport 479,333 / 767,333 CSS px. Ở cả
  hai, cặp `max-width`/`min-width` cũ đều sai (lỗ hổng đợt 4) trong khi mỗi quy tắc range rơi đúng về một phía (lề compact, tràn thẻ tuần,
  tiêu đề trang, thanh tab). Không có độ rộng nào thiếu bố cục.
- Kiểm lại đợt 4: F-UX4A-1 đã sửa (0 lần đổi bố cục trong 3 s ở 1335x1430, 1340x1400, 1344x1370 và bốn kích thước khác với thanh cuộn cổ
  điển 15px; beside từ 1345px); F-UX4A-2 đã sửa (Escape trên một điều khiển của bảng khi có sửa đổi mở câu hỏi và câu hỏi ở lại; Keep
  editing trả focus về điều khiển đó); F-UX4A-3 đã sửa (Keep editing giữ focus trên "Current period"); F-UX4A-4 đã sửa (docs/04:69 nêu hai
  đường không hỏi, :110 nêu hover trong suốt của các nút link dạng quiet). Không cái nào bị đợt 5 làm hỏng lại.
- WCAG 2.2 AA: axe 0 vi phạm trong 108 lần quét (Timesheet, thẻ hẹp 600px, ngăn kéo và sheet điện thoại, hộp thoại Partial leave có lời từ
  chối, câu hỏi discard, Review chưa ký, đã ký và đã gửi, hộp thoại Sign off có lỗi, thẻ Send có lỗi trường, hộp thoại lý do có lỗi,
  Settings) ở sáng, tối, tối chọn tay và sáng chọn tay, desktop và điện thoại; các mục "incomplete" của axe được kiểm bằng tay (lỗi 2; rủi ro
  R4). Tương phản chữ: thấp nhất 4,59:1 sáng và 4,65:1 tối, không có mục nào dưới ngưỡng. Bàn phím: 8 lượt (1280 và 900 nổi, 1440 bên cạnh,
  sheet điện thoại 390; sáng và tối), 1.440 lần dừng, 0 bị che hoàn toàn, mọi lần dừng có chỉ báo focus. Mục tiêu: dưới 768px và với con
  trỏ thô, mọi điều khiển cao 44px hoặc là nút phụ có vùng chạm. SC 2.5.3: "Back", "Open", "Send", "Sign off", "Current" và "Review" nằm
  trong tên của chúng; "Change days" thì không (lỗi 2). Không có cuộn ngang cấp trang từ 320 đến 1440 (Timesheet và Review).

## Độ mạnh của test và các thay đổi e2e của các đợt sửa

- 17 mutant (`61-mutants-summary.txt`): bị bắt M1 (chỉ bởi test văn bản vitest), M3-M12, M14-M17. Không bị bắt: **M2**, tắt bậc "chỉ ngày
  cuối" của khoảng ngày (`width < 7.3em` thành `0.1em`): không test trình duyệt nào đạt hộp khoảng ngày dưới 7,3em, nên hai dạng cuối chỉ
  được chứng minh ở dạng văn bản (rủi ro R3).
- FIX2 (poll kích thước thanh, cùng dung sai 0,05px, test CSSOM tất định), FIX3 (`settledSelect`: không còn placeholder và sáu frame đứng
  yên; form đăng nhập hiện trước khi điền), FIX5 (poll `showToday` với sự kiện focus và một lần đọc mới từ server; ảnh chữ ký tải xong
  trước khi đo; `connection: close` cho seed client) và FIX6 (`connection: close` cho poll health; vitest `maxWorkers: '50%'`): mọi lần chờ
  dựa trên trạng thái, không ngủ cố định, không tăng timeout, không nới assertion, không bỏ kiểm tra nào (phép so ngày chuyển vào poll), và
  mỗi test vẫn chứng minh hành vi nó mang tên.
- **Today qua nửa đêm (FIX5 A):** mutant M13 của tôi giữ kỳ cũ khi lần làm mới lúc cửa sổ lấy lại focus mang về ngày mới. Ở
  2026-11-04T07:59:20Z (LA 23:59:20, một ngày mà kỳ đang mở chứa cả hai ngày) với wrapper FIX10, `--repeat-each=3`, `--workers=6`: 4 failed,
  đều là `today.spec.ts:626` "the refreshed tab tags the new date" (Expected 2026-11-04, Received 2026-11-03); 12 lần chạy `showToday` đều
  đạt. Đối chứng không mutant cùng thời điểm: 18 passed. Vậy bộ test bắt được M13, nhưng qua test qua-nửa-đêm có sẵn; phép so ngày của poll
  mới không bắt được gì ở đây, vì thời điểm qua nửa đêm phải rơi giữa lúc tải trang và lần đọc đầu tiên của poll.

## Lỗi

1. **F-UX5A-1, Medium - chân đã ký trên trang Review hẹp** (`src/client/ReviewScreen.tsx:242`, `src/client/components/ReviewDays.tsx:68-81`,
   `src/client/components/TimesheetSheet.tsx:453-469`, `src/client/styles.css:5714-5762` và `:5791-5794`).
   Tái hiện: ký một kỳ (người tổng hợp có ảnh đã lưu), tải lại `#/review/<payrollDate>`, đặt cửa sổ 480, 390 hoặc 320px. Thực tế: `canSign`
   lại đúng (`justSigned === null`), nên dòng nhân viên chứa dấu đã ký và nút "Sign correction"; dòng dài khoảng 160px, ô nội dung 21,4px,
   tên bị ngắt hai ba chữ cái một dòng, dòng cao 232px, nút (trái 69,2px) che dấu "Signed" (phải 91,8px) và dòng nhân viên hẹp hơn dòng
   quản lý 25,16px (`obs-review.txt` dòng 46-53; `a5-review-390-signed-reloaded-light-synthetic.png`); ở 768px nội dung rộng 45,4px. Kỳ
   vọng (B7/B9 và Phụ lục 3b của chủ, mục UI của AGENTS): tên, ảnh và "Signed" luôn đọc được, không bị che, và bốn dòng thẳng hàng ở mọi độ
   rộng. Sửa có phạm vi: với kỳ đã ký, đưa nút sửa ra khỏi dòng chữ ký (ví dụ vào thẻ kiểm tra, hoặc xuống dưới dòng), hoặc cho phần hành
   động xuống dưới nội dung; thêm một kiểm tra e2e cho trang Review đã ký và tải lại ở 390 và 320px.
2. **F-UX5A-2, Low - SC 2.5.3 Label in Name cho "Change days"** (`src/client/TimesheetScreen.tsx:687-703`, `src/client/styles.css:2777-2809`).
   Tái hiện: cửa sổ 340 hoặc 320px (hàng công cụ dưới 20,8rem): nút hiện "Change days" (cả "Change / days"); tên của nó là `aria-label`
   "Change several days" (`obs-sheet.txt` dòng 99 và 104; axe báo `label-content-name-mismatch` là incomplete). Kỳ vọng: tên chứa chữ đang hiện
   (WCAG 2.2 SC 2.5.3, mức A; lỗi F96); khẳng định trong kế hoạch "chứa mọi dạng hiển thị" đúng với "Open" và "Send" nhưng không đúng ở đây.
   Sửa có phạm vi: bỏ `aria-label` để span đang hiện thành tên (dạng bị ẩn là `display: none`), hoặc dùng dạng ngắn nằm trong tên; chỉnh e2e
   đang khẳng định tên ở mọi độ rộng.
3. **F-UX5A-3, Low - cuộn làm đóng Day editor** (`src/client/TimesheetScreen.tsx:596-609`). Tái hiện: (a) context 1024x768 có `hasTouch`, ngăn kéo mở
   (nổi), vuốt lên bắt đầu từ tiêu đề bảng: trang cuộn từ 0 đến 606px và ngăn kéo đóng (`obs-editor-run1.txt` dòng 16); (b) thanh cuộn cổ
   điển, 900x900, ngăn kéo mở: nhấn và kéo trên thanh cuộn ngang riêng của thẻ tuần làm thẻ cuộn và ngăn kéo đóng (`obs-classic.txt`). Khi
   có sửa đổi chưa lưu, câu hỏi discard cắt ngang lần cuộn. Kỳ vọng: F-7 a của chủ và docs/04:69 nói về bấm hoặc click ra ngoài; docs/04 đã
   loại trừ thanh cuộn của cửa sổ, và một cử chỉ cuộn hay thanh cuộn của phần tử không phải là bấm trên trang. Sửa có phạm vi: với con trỏ
   cảm ứng thì xử lý ở `click` (hoặc ở pointer-up không di chuyển), và bỏ qua lần nhấn có điểm nằm ngoài client box của phần tử đích (thanh
   cuộn riêng của nó); thêm hai trường hợp này vào test U5-24.
4. **F-UX5A-4, Low - độ chính xác của tài liệu** (EN và VI): docs/04:103 / vi:104 nói tờ giấy vuông và tràn mép trên điện thoại (từ U5-22 nó có góc
   12px và cách mép 8px); docs/04:105 / vi:106 liệt kê `--select-arrow-size` 7px, token này không còn (nay là `--select-arrow-w/-h`);
   docs/04:111 / vi:112 nói Save day fields có khung 36px trên mọi thiết bị, trong khi :71 và bản build cho chân điện thoại một nút rộng hết
   hàng cao 44px; docs/04:124 / vi:125 và docs/12:54 (EN và VI) trích "You sign as" và "Signed with your name only.", client không còn hiện
   các chữ này (hộp thoại hiện "Signer ... (you)" và "your name only" kèm liên kết Settings); docs/04:49 / vi:50 giới hạn việc "+1" xuống dòng
   ở "ô hẹp nhất của điện thoại", nhưng nó còn xảy ra trên bảng 7 cột ở 480 đến 900px và hơn (`obs-sheet.txt` dòng 68-69); docs/12:116 (EN
   và VI) nói một lần chạy trình duyệt không đặt được 479,33 / 767,33px, trong khi probe của tôi đã làm được. Chú thích style sheet cũ:
   `styles.css:154-156` (tờ giấy tràn mép trên điện thoại), `:345` (wordmark từ 1024px), `:2826` (lưới từ 768px). Sửa có phạm vi: sửa các dòng
   đó ở cả hai ngôn ngữ và ba chú thích.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- R1: `useBlockSize.ts` content box so với border box (đã ghi; gia cố bằng `{ box: 'border-box' }` lần tới khi chạm vào file).
- R2: hộp thoại Sign off dịch chuyển khi ảnh đến muộn (dành sẵn ô ảnh).
- R3: độ mạnh test: hai dạng cuối của bậc khoảng ngày không có kiểm tra trình duyệt (M2); lỗ hổng độ rộng lẻ chỉ được test văn bản vitest
  bắt, dù trình duyệt nay đã đạt được 479,33 / 767,33px (frame ở 150%); poll `showToday` không bắt được M13.
- R4: `SignoffDialog.tsx:164` đặt `aria-label` trên một `div` không có vai trò (axe "aria-prohibited-attr", incomplete): nhãn bị bỏ qua.
- R5: dòng mô tả Review và phụ đề hộp thoại in "->" ASCII trong khi thẻ kỳ và mockup dùng "→"; hộp thoại lý do ghi thời điểm bản trước là
  "2026-10-26 20:55" trong khi các ngày khác là MM/DD/YYYY.
- R6: `reviewLinkLabel` (`reviewModel.ts:220`) không còn được dùng ngoài unit test của nó.
- R7: `ReviewScreen.tsx:360` lấy ngày trả lương làm "Today" trong hộp thoại khi `/api/periods/current` lỗi.
- R8: wordmark khi có công tắc "Shared with me" hiện ở 414-494px, ẩn ở 495-665px rồi hiện lại từ 666px (theo quy tắc không thêm hàng đã
  ghi).

## Gate chưa chạy hoặc bị chặn

Không bỏ kiểm tra bắt buộc nào. Harness Playwright tự chọn cổng loopback trống (ngoài 49860-49889); script smoke không bắt buộc và không
chạy. Các mục NAS và production nằm ngoài vùng A.

## Xử lý các phát hiện trước

F-UX4A-1, F-UX4A-2, F-UX4A-3 và F-UX4A-4: đã sửa, không cái nào bị đợt 5 làm hỏng lại (xem "Hệ thống style, breakpoint, trợ năng").

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

Vùng A chưa được chấp nhận trên f4049aa (FIX REQUIRED). Review này không nói gì về phép của chủ hay kết quả pilot; không đụng tới gửi
production hay triển khai (chỉ capture cục bộ).

## Một bước tiếp

Một task sửa của coordinator cho lỗi 1-4 (chỉ client và tài liệu), rồi regate và kiểm lại vùng A trên digest mới.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX5-AUDIT-A attempt 1; agent reviewer `aaddbc8e28007ef07` (board); tác giả
  của snapshot là các planner, worker, fixer và committer WP5-UX4 và WP5-UX5 trên board (ví dụ T03 `a1e70b03fd49b67f6`, T04
  `ae9b4b07ad11134d2`, T05A `a5b0f9fde2966c43a`, T05B `a85bee422bff60911`, FIX5 `a292049dae7aa2fac`, FIX6 `acb61957f41e06689`).
- Context mới; tôi không viết thay đổi nào đang được kiểm. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng
  chứng.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE4 PASS.
- Path report mới: `handoff/delivery/WP5_UX5_REVIEW_A.md` (+ `.vi.md`); các review trước không bị đụng.
- Xử lý phát hiện và task tiếp của coordinator: còn mở; đợt sửa cho F-UX5A-1..4, rồi kiểm lại.
