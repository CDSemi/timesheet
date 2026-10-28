# Vòng thay đổi UI 5 của WP5, kiểm lại khu vực A trên be2afa2 (WP5-UX5-RECHECK-A2)

Bản dịch của [WP5_UX5_RECHECK_A2.md](WP5_UX5_RECHECK_A2.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI 5 do chủ sở hữu yêu cầu của WP5, khu vực A (giao diện, khung
  ứng dụng, Timesheet, Day editor, giao diện Review, trợ năng, và các fixture e2e dùng chung); task WP5-UX5-RECHECK-A2, lần 1, 2026-10-28 từ
  20:49Z đến khoảng 21:50Z. Task này kiểm lại WP5-UX5-RECHECK-A (FIX REQUIRED trên a5533b5, `WP5_UX5_RECHECK_A.md`: lỗi F-UX5A2-1, rủi ro
  R-A2-1..5) sau FIX11 đến FIX15. Model reviewer tự báo `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát
  được từ bên trong). Model tác giả mạnh nhất trên bảng cho snapshot này là `claude-opus-5-5` (WP5-UX5-DIAG7 và các planner UX4, UX5 trước
  đó); FIX11 đến FIX15, DIAG5, DIAG6, DIAG8, DIAG9, REGATE7 đến REGATE10 và committer của chúng là `claude-sonnet-5-5`, nên reviewer không yếu
  hơn. Tôi không viết task WP5-UX4 hay WP5-UX5 nào. WP5-UX5-RECHECK-B2 chạy cùng lúc trên cùng máy.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `be2afa2e3c43514581ed62fd145c15eeef13b534` (WP5-UX5-FIX15-FREEZE, đã push; WP5-UX5-REGATE10 PASS cùng Addendum 1 của nó). HEAD = origin/main =
  commit đó trước và sau; không có dòng status nào ngoài `handoff/` trước và sau. Digest
  `ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f`, 882 file, không tính `handoff/`, bằng nhau ở ba dạng lúc 20:49:34Z và lúc
  21:45:28Z: bản xuất `git archive` sạch băm bằng `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp giống từng byte với
  của bản xuất) và `npm run digest`. Source đủ: `npm ci` exit 0 trong ba bản xuất (`export` cho các kiểm tra bắt buộc, `export-probe` cho probe
  của tôi, `export-mut` cho mutant của tôi); ba bản build giống nhau (250 file, entry `index-qNP6kTPW.js`).
- **Quyết định: PASS.** F-UX5A2-1 đã được sửa: vòng của thẻ tuần chỉ đọc được vẽ trên cả bốn cạnh ở mọi trạng thái theme, ở mọi độ rộng mà
  thẻ tràn và ở mọi vị trí cuộn, và tài liệu cùng các chú thích nói đúng điều build vẽ. Không có lỗi mới. Hai thay đổi sản phẩm (layout effect
  của `DayFieldsForm.tsx` và bộ theo dõi theme của tab khác) đều đứng vững dưới probe của tôi trên cả hai project; các thay đổi helper e2e chứng
  minh đúng điều các test cũ chứng minh, không assertion nào bị nới và không case nào bị bỏ; hàng rào nửa đêm là một lần giữ không có tác dụng
  phụ. Kiểm tra bắt buộc: typecheck, lint, `npm test` (101 file, 2.389 test), build (không cảnh báo chunk) và AC-13 exit 0; FULL e2e đồng hồ
  thật 876 passed, 132 skipped, 0 failed (desktop 469/35, mobile 407/97); lượt bảy file ở 2026-10-27T06:58:30Z 384 passed, 84 skipped, 0 failed
  (desktop 219/15, mobile 165/69; test vượt nửa đêm trên desktop 58,6 s); không chạy lại. Các khe hở về độ mạnh của test và giới hạn của hàng rào
  được ghi thành rủi ro R-A3-1..3.

## Phạm vi thật đã xem và chạy

1. Đọc như các tuyên bố: brief; AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"); `WP5_UX5_RECHECK_A.md`; bản ghi task FIX11,
   REGATE7, DIAG5, FIX12, DIAG6, FIX13, REGATE8, DIAG7, DIAG8, FIX14, REGATE9, DIAG9 (cùng Addendum 1), FIX15 và REGATE10 (cùng Addendum 1)
   và bằng chứng chúng dẫn; model của các tác giả trên bảng; diff source và test `a5533b5..be2afa2` ngoài `handoff/` (27 file; khu vực A:
   `App.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`, `TimesheetSheet.tsx`, `styles.css`, chín file e2e và test tích hợp ranh giới mới);
   docs/04 và docs/12, EN và VI; các bản ghi UX2 và UX3 đã chấp nhận mà các thay đổi khôi phục hoặc giữ.
2. Kiểm tra bắt buộc trong bản xuất sạch, lần lượt từng cái; FULL e2e đồng hồ thật và lượt bảy file chạy riêng so với công việc khác của tôi
   (RECHECK-B2 chạy công việc của nó cùng lúc). Brief gọi thư mục wrapper đồng hồ là `WP-UX-FIX10`; file thật là
   `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`, giống từng byte với bản của REGATE10, dùng nguyên vẹn.
3. Probe của tôi trong `export-probe` (`zz-rc-*.spec.ts` cục bộ của task qua harness của repository, Edge headless, hàm chọn cổng trỏ vào
   51282-51309): vòng của thẻ tuần theo từng điểm ảnh, focus bằng chuột, màu cưỡng bức và đổi cỡ khi có focus; sửa trong cùng task trong Day
   editor; theme theo tab khác; axe-core 4.14.0 (đóng gói vào thư mục task, không thêm dependency); duyệt bằng bàn phím; cuộn ngang ở mọi độ
   rộng; hàng rào nửa đêm; hai báo cáo `target-size` của axe.
4. Mười sáu mutant của riêng tôi trong 18 lần chạy, cùng 3 lần đối chứng, trong `export-mut` (định nghĩa `53-mutant-*.json.txt`), mỗi cái áp
   dụng riêng, build lại client khi mutant nằm trong `src/`, chạy các test được nêu, khôi phục file và so từng byte, build lại client.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX5-RECHECK-A2/` cùng 4 ảnh `-synthetic.png`; mã nguồn probe và
script được giữ dưới tên `90-src-*.txt` và `91-*.txt`; các lần lỡ quy tắc của tôi ở `99-slips.txt`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, status ngoài `handoff/`, digest ở ba dạng, đầu và cuối | HEAD be2afa2 = origin/main; không dòng nào; `ff73565b…686f`, 882 file, lúc 20:49:34Z và 21:45:28Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (ba bản xuất), so các build | 0, 0, 0; ba cây `dist/` giống nhau (250 file, `index-qNP6kTPW.js`), cả sau các mutant | `02-*` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không dòng deprecation | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 file, 2.389 test (51 s) | `03-npmtest.txt` |
| `npm run build` | 0; `index-qNP6kTPW.js` 492,09 kB, không cảnh báo kích thước chunk | `03-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `03-ac13.txt` |
| FULL e2e, đồng hồ thật, cả hai project, 2 worker (20:52:43-21:13:31Z) | exit 0: 876 passed, 132 skipped, 0 failed; desktop 469/35/0, mobile 407/97/0; không chạy lại | `06-e2e-full-run1.txt`, `06-e2e-counts.txt` |
| Lượt bảy file ở 2026-10-27T06:58:30Z, wrapper FIX10, 6 worker (21:13:38-21:21:46Z) | exit 0: 384 passed, 84 skipped, 0 failed; desktop 219/15/0, mobile 165/69/0; test vượt nửa đêm trên desktop 58,6 s; không chạy lại | `08-seven-1026.txt`, `08-seven-counts.txt` |
| Probe vòng focus (F-UX5A2-1) | 96 trạng thái, cả bốn cạnh 100%, khe 100%, khi không focus 0%, không dịch cuộn | `40-obs-ring.txt`, `42-sum-ring.txt` |
| Probe Day editor (FIX13) | mọi trường hợp cùng task, lưu, bỏ và trả về đều như kỳ vọng, cả hai project | `40-obs-dirty.txt` |
| Probe theme (FIX14) | trang đăng nhập, xóa storage, key khác, menu mở, tab phía sau, storage bị chặn đều như kỳ vọng, cả hai project | `40-obs-theme.txt` |
| axe-core 4.14.0 | 90 lần quét; chỉ có mục menu đã chấp nhận của UX3 ở 1440px và một hiện tượng do vị trí cuộn | `42-sum-axe-v2.txt`, `40-obs-axe-*.txt`, `40-obs-target.txt` |
| Duyệt bằng bàn phím | 14 lượt; mọi điểm dừng có chỉ báo focus; 0 điểm bị che hoàn toàn | `40-obs-walk.txt` |
| Cuộn ngang 320-1440px | 0 độ rộng bị tràn (Timesheet, và Review đã ký rồi tải lại) | `40-obs-scroll.txt` |
| Mutant và đối chứng | 16 mutant của riêng tôi: 11 bị bộ test bắt đúng lý do; MB3, MB5, MB8, MB11, MB12 thì không (MB11 và MB12 bị probe hàng rào của tôi thấy) | `52-mut-*.txt`, `50-mut-summary.txt`, `53-mutant-*.json.txt` |

## F-UX5A2-1: vòng focus của thẻ tuần chỉ đọc

**Đã sửa.** Đo theo từng điểm ảnh (`40-obs-ring.txt`, `42-sum-ring.txt`): Review ở 480, 600, 767, 768, 900 và 913px (mọi độ rộng mà các thẻ
tràn trên project desktop), cả hai thẻ tuần, trong bốn trạng thái theme (sáng theo thiết bị, tối theo thiết bị, tối chọn tay trên thiết bị
sáng, sáng chọn tay trên thiết bị tối), thẻ 1 ở vị trí cuộn đầu, giữa và cuối và thẻ 2 ở cuối: 96 trạng thái. Ở mọi trạng thái, mọi điểm ảnh
nguyên của dải 2px là `--accent` trên cả bốn cạnh (trên, dưới, trái và phải 100%; một cạnh lẻ pixel để lại một hàng điểm ảnh nguyên trong dải
và một hàng khử răng cưa, đúng như phải thế), khe 1px bên trong nó là `--card` (100% điểm ảnh của khe), dải không có điểm accent nào khi thẻ
không có focus, focus không bao giờ đổi vị trí cuộn của thẻ, và focus là `:focus-visible`. Lớp vẽ là `.sheet-week-ring::after` ở z-index 1 với
`inset 0 0 0 2px accent, inset 0 0 0 3px card`; bản thân thẻ vẽ `outline: none` và `box-shadow: none`. Độ tương phản của vòng: 6,09:1 trên
card và 4,80:1 trên thanh WEEK ở theme sáng, 6,79:1 và 5,00:1 ở theme tối; sáng chọn tay trên thiết bị tối vẽ giống từng byte với sáng theo
thiết bị (`rc-ring-768-mid-*-synthetic.png`; tối, cuộn tới cuối: `rc-ring-768-end-device-dark-synthetic.png`). Một phím Tab thật từ điều khiển
đứng trước tới được thẻ và vẽ vòng ở cả bốn cạnh; một lần bấm chuột cho thẻ focus nhưng không `:focus-visible` và không vẽ vòng, như mọi điều
khiển khác. Chế độ màu cưỡng bức (Chromium `forcedColors: 'active'`): box shadow bị bỏ và outline trong suốt của lớp trở thành màu chữ hệ thống
trên cả bốn cạnh (`rc-ring-768-forced-colours-synthetic.png`). Tài liệu nay nói đúng điều build làm: docs/04:50 và vi:51 (vòng inset dùng
chung, 2px accent và khe 1px màu card, trên cả bốn cạnh của khung nhìn thấy, do một lớp bọc không cuộn vẽ phía trên các cột ngày, không dịch
khi cuộn ngang), các chú thích style sheet ở `styles.css:2909-2932` và `:2982-2997`, và chú thích của hook và lớp bọc ở
`TimesheetSheet.tsx:155-158` và `:212`. Kiểm tra e2e mới bắt được MA8 của RECHECK-A (vòng vô hình, chuyển sang lớp mới: MA8n) và MA9 (đúng chữ
cũ), xem phần mutant.

## FIX13: `DayFieldsForm.tsx` báo `dirty` trong một layout effect (sản phẩm)

**Đóng khe hở Escape nhanh, không thấy lỗi mới.** Ô Notes và ô chọn loại ngày của form là input có kiểm soát; việc báo nay chạy trong commit
của chính lần sửa (`useLayoutEffect`, `DayFieldsForm.tsx:55-59`), nên `setFieldsDirty` của `DayEditor` và lần báo bị động của chính nó (một
commit lane đồng bộ) tới ref `editorDirty` của `TimesheetScreen` trước khi task của sự kiện input kết thúc; với `useEffect` việc báo là một cập
nhật độ ưu tiên mặc định và tới ref chậm một task (vết của DIAG6; mutant MB1 của tôi xác nhận tác dụng của đúng một chữ đó). Không có vòng lặp:
`onDirtyChange` là setter `useState` của `DayEditor` (ổn định), phụ thuộc là `[dirty, onDirtyChange]`, đặt cùng giá trị thì React bỏ qua, và
effect không có clean-up, như trước. Không có SSR (chỉ `createRoot`) và không unit test nào render component này, nên cảnh báo phía server của
layout effect không thể xảy ra.
Probe trên cả hai project (`40-obs-dirty.txt`): nhập Notes và Escape trong cùng một task thì hỏi "Discard your changes?"; trả về đúng chữ đã lưu
trong cùng task rồi Escape thì đóng ngay (không còn true cũ); Save rồi Escape ngay thì đóng ngay (không còn true cũ sau khi lưu); Discard, rồi mở
lại cùng ngày và một ngày khác, Escape đóng ngay (sạch); đổi loại ngày trong cùng task rồi Escape thì hỏi; nhập Notes trong cùng task rồi bấm
nút của ngày khác thì hỏi thay vì chuyển; gõ phím thật rồi Escape ngay thì hỏi; ô lý do của một kỳ đã ký (cờ riêng của `DayEditor`, không bị
đụng, một textarea có kiểm soát) hỏi sau khi nhập lý do và Escape trong cùng task, và đóng ngay sau khi trả về trong cùng task. Không có lỗi
console hay lỗi trang trong lần chạy nào. Test cùng task mới là tất định (một `evaluate`, không có lượt task nào giữa input và phím, nên không
có yếu tố thời gian), nó hỏng trên hook cũ ở cả hai project tại "Discard your changes?" (MB1), và nó chứng minh cơ chế chặn: có câu hỏi, Keep
editing có focus, ghi chú được giữ. U4-05 được giữ.

## FIX14: theme theo tab khác (sản phẩm: `ThemeToggle.tsx`, `App.tsx`)

**Khôi phục quy tắc đã chấp nhận, không thấy lỗi.** `followThemeOfOtherTabs` (`ThemeToggle.tsx:46-56`) áp dụng lựa chọn đã lưu khi có sự kiện
`storage` với key null (storage bị xóa) hoặc `timesheet.theme`, và `App` gắn nó một lần trước mọi nhánh (`App.tsx:26-27`), nên trang đăng nhập
cũng theo. Probe trên cả hai project (`40-obs-theme.txt`): tab thứ hai ở trang đăng nhập theo Dark, rồi theo Light chọn tay trái với thiết bị
tối của nó (và vẫn ở form đăng nhập); xóa storage ở tab thứ nhất thì tab thứ hai bỏ lựa chọn và lại theo thiết bị tối của nó; một key khác gây 0
lần đổi `data-theme`; khi menu mở ở tab thứ hai, cả hai listener đặt cùng một giá trị (`["dark","light","light"]` sau khi mở; ổn định, không
lặp) và radio Light của nó được chọn; khi storage bị chặn ở tab thứ hai (getter `localStorage` ném lỗi) thì không có lỗi trang, nó theo thiết bị
của chính nó sau lựa chọn của tab kia, và một lựa chọn của riêng nó (giữ cho trang) vẫn còn sau khi tab kia đổi (thứ tự ưu tiên `pageChoice`).
Hàm xử lý không ghi gì, nên không thể tạo vòng sự kiện. `App` không bao giờ unmount; effect trả về clean-up. docs/04:114 (vi:115) không nêu quy
tắc theo tab và không có gì mâu thuẫn; chú thích của module nêu quy tắc.
**`bringToFront` không che độ trễ nào của sản phẩm:** khi tab thứ hai bị để phía sau, `data-theme` của nó đã là `dark` 3-4 ms sau khi cú bấm
của tab thứ nhất trả về và nền tính toán của nó đã tối (`behind` trong `40-obs-theme.txt`). Lần kẹt mà DIAG8 ghi lại là harness vẽ một tab không
ở phía trước; đưa tab đang được điều khiển hay được đọc lên trước là điều một người vẫn làm, và các bước và kiểm tra của test cũ không đổi.
**Các test:** test cũ vẫn chứng minh việc đồng bộ từng bước với cả hai menu mở; test mới chứng minh một menu đóng vẫn theo. Không test nào ghim
trang đăng nhập, việc xóa storage hay bộ lọc key: MB5 và MB3 của tôi sống (rủi ro R-A3-1).

## Các thay đổi helper e2e (chỉ test)

- **`expectLayoutAt` và `expectSheetAt`** (`fixtures.ts:718-736`): sau `setViewportSize` chúng chờ độ rộng cửa sổ, rồi chờ DOM mà độ rộng đó
  đòi (`.bar-clock` chỉ dưới 768px; bảng điện thoại chỉ dưới 480px). Chỗ gọi: `review.spec.ts` 406, 643, 737 và 779, `timesheet.spec.ts` 2541
  và 2671, `controls.spec.ts` 49 và 68, và `expectSheetAt` trong `sweepRange` của `logo.spec.ts`. Mỗi lần chờ đứng trước các phép đo, mọi
  assertion sau nó không đổi, và FIX11 thêm độ rộng 600px cùng chiều cao dòng chưa ký vào test chữ ký (chặt hơn). Một lần chờ một trạng thái mà
  trang phải đạt không thể cho qua một trang không bao giờ đạt nó. Thứ mà các lần chờ thôi đo chỉ là trạng thái thoáng qua một khung hình của
  DIAG5 (backlog). Dưới mô hình 90 ms của DIAG5 các chỗ gọi đạt khi có helper (CTL10) và hỏng khi không có nó (MB10); một ngưỡng lệch một đơn
  vị hỏng ở 480px (MB13).
- **Các lần chờ hàng tiêu đề của controls:** cùng helper trong vòng lặp của `:49` và `:68`; `:95` không đổi.
- **`stepPeriod`** (`timesheet.spec.ts:2593-2604`): nó đọc `data-period-due`, bấm, chờ thuộc tính đổi, rồi chờ 14 ngày, nên `check()` đọc đúng
  kỳ vừa chuyển tới (DIAG8: trước đó 17% lần đọc là cũ). Không bước, loại khoảng hay phép đo nào bị bỏ.
- **`toBeEnabled` của test bàn phím:** nó chờ trạng thái bật đã được mô tả ("Checking your status" cho tới lần tra đầu tiên); các assertion
  focus, Tab và Shift+Tab không đổi.
- **Kiểm tra ngày của `clockIn`** (`day-editor.spec.ts:139-168`): nó dò ngày đã đọc và ngày kế tiếp, rồi khẳng định ngày tìm thấy là ngày địa
  phương của chính `start_utc` của phiên trong múi giờ báo cáo, đọc bằng `zoneOracle` độc lập; các lần đọc sau dùng ngày đó. Nó chặt hơn về
  ngày ghi sổ (mutant B của REGATE10 hỏng ở đúng dòng đó) và chỉ chấp nhận ngày kế tiếp khi kèm một thời điểm bắt đầu thuộc ngày đó.
- **Hàng rào nửa đêm** (`fixtures.ts:760-785`, `:839-845`): một fixture test tự động không phụ thuộc gì, nên nó không đăng nhập, không gửi
  request và không truy cập cơ sở dữ liệu; nó đọc `Date.now()` và hằng `SEED_REPORTING_ZONE`, chỉ giữ lại khi nửa đêm kế tiếp của múi giờ còn
  không quá 45 s, dò đồng hồ mỗi 100 ms tới nửa đêm + 0,5 s (giới hạn dò 60 s, timeout fixture 75 s, không phải của test), và test cố ý vượt nửa
  đêm được miễn bằng annotation của nó. Probe hàng rào của tôi qua wrapper FIX10 ở 06:59:30Z: test có annotation bắt đầu ngay, 27,9 s trước nửa
  đêm, còn test thường bắt đầu 0,58 s sau nửa đêm (CTLF). Trong lượt bảy file ở 06:58:30Z, test vượt nửa đêm trên desktop mất 58,6 s, và 38,6 s
  khi chạy riêng ở 06:59:20Z (CTL11), nên nó vẫn vượt.
  Nhận định: giữ một test tránh nửa đêm không bỏ case hay assertion nào (mọi test vẫn chạy đủ, trên ngày mới); thứ bị bỏ là độ phủ ngẫu nhiên
  của một nửa đêm rơi vào giữa các test bất kỳ, mà trong thống kê của DIAG9 chỉ tìm ra 31 giả định của test và không lỗi sản phẩm nào. Hành vi
  nửa đêm của sản phẩm vẫn được phủ bởi test vượt nửa đêm (nút Today và lần làm mới khi focus qua nửa đêm), bởi test tích hợp mới (một lần
  check-in được ghi theo ngày bắt đầu ở hai phía của 07:00:00Z, check-out qua nửa đêm, một check-in sau đó; nó hỏng với mutant ngày UTC,
  REGATE10) và bởi probe sản phẩm của DIAG9 (bằng chứng, không nằm trong bộ test). Như vậy là đủ cho quy tắc (docs/02, D-05). Hằng múi giờ hiện
  an toàn: nhân viên được seed và lịch công ty là `America/Los_Angeles`, các spec khẳng định điều đó, và không spec nào chuyển nhân viên dùng
  chung sang múi giờ khác. Giới hạn của nó là rủi ro R-A3-2.

## Hồi quy trong khu vực A (FIX11 đến FIX15)

- **axe-core 4.14.0**, tag WCAG 2.0-2.2 A/AA, sáng và tối (`42-sum-axe-v2.txt`, `40-obs-axe-*.txt`): Timesheet với Day editor mở và Notes đã gõ
  (chưa lưu), menu tài khoản (1440, 900, 768) hoặc bảng More (480, 390, 320), và Review chưa ký, đã ký và đã ký rồi tải lại với một thẻ tuần
  đang cuộn có focus, ở 1440, 900, 768, 480, 390 và 320px trên project desktop và 480, 390 và 320px trên project mobile: 90 lần quét. Hai mục
  `target-size`, không mục nào mới hay là hồi quy:
  - menu tài khoản mở ở 1440px để lộ 12,2px của "Review & sign off" (sáng và tối; 900 và 768px sạch): đúng mục WP5-UX3-FIX1 đã giải trình và
    WP5-UX3-AUDIT-A đã chấp nhận với cùng phép đo (rủi ro R2 của `WP5_UX3_REVIEW_A.md`; menu do người dùng mở, không modal và thoáng qua);
    probe target của tôi tái hiện nó trên trang mới, trước và sau một cửa sổ 320px và sau khi tải lại (`40-obs-target.txt`);
  - Review đã ký ở theme tối tại 1440, 900 và 768px báo "Back to the timesheet": trang đang cuộn 197-219px, nên liên kết nằm một nửa dưới thanh
    trên cùng dính (lộ 9,9px, `40-obs-axe-review3.txt`); ở đầu trang nó sạch trước và sau một cửa sổ 320px (`40-obs-target.txt`). Đó là một vị
    trí cuộn, không phải một trạng thái bố cục.
  `incomplete` chỉ có `color-contrast` và `label-content-name-mismatch` (các nút ký hiệu "<" và ">"), như trước.
- **Duyệt bằng bàn phím**, sáng và tối (`40-obs-walk.txt`): Timesheet desktop ở 1280 (42 điểm dừng), với Day editor mở (50), Review ở 900 và 768
  (mỗi lần 16, cả hai thẻ tuần có vòng của chúng); Timesheet điện thoại (41), bottom sheet (7, focus được giữ bên trong) và Review (15) ở 390.
  Mọi điểm dừng đều đổi kiểu focus được vẽ khi có focus, và không điểm nào bị che hoàn toàn sau một thanh cố định hay dính.
- **Không trang nào cuộn ngang** ở mọi độ rộng nguyên từ 320 tới 1440px: Timesheet và Review đã ký rồi tải lại với các lớp bọc thẻ tuần, theme
  sáng ở từng pixel và theme tối mỗi 8px (`40-obs-scroll.txt`).

## Các rủi ro đã ghi

Không rủi ro nào đã thành lỗi. `git diff a5533b5..be2afa2` trong `src/client` chỉ đụng `App.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`,
`TimesheetSheet.tsx` và `styles.css` (`20-src-namestatus.txt`); `TimesheetScreen.tsx`, `DayEditor.tsx`, `ReviewScreen.tsx`, `AppShell.tsx`,
`BarClock.tsx`, `SignoffDialog.tsx`, `useBlockSize.ts` và `useMedia.ts` không đổi (`20-risk-files-diffstat.txt`, rỗng).
- R-A2-1 (cảm ứng trên thiết bị thật): code cảm ứng không đổi; vẫn là một mục của gói pilot.
- R-A2-2 (thanh cuộn overlay): không đổi và vẫn chưa kiểm được (Edge headless không có thanh cuộn overlay bấm được).
- R-A2-3 (đổi cỡ khi đang có focus): với lớp bọc, mở rộng 900 lên 1100px khi thẻ có focus sẽ bỏ điểm dừng Tab của nó và đưa focus về `body`; Tab
  kế tiếp tới "Sign off" (`40-obs-ring.txt`). Không đổi, chấp nhận được.
- R-A2-4 (độ mạnh của test): MA1, MA8 và MA9 nay đã bị bắt (các lần chạy của tôi, bên dưới); MA5 vẫn không bị bắt, như FIX11 đã ghi.
- R-A2-5 (các lượt quét logo): 41,3-50,7 s trên giới hạn 240 s trong lượt FULL của tôi với 2 worker cạnh RECHECK-B2 (`06-e2e-logo-durations.txt`).
- Cú nhảy 8px trong một khung hình ở 768px (DIAG5, backlog): `useMedia`, `BarClock` và khung ứng dụng không đổi; các lần chờ mới đo sau nó.
- Ảnh Sign off dịch 23px: `SignoffDialog.tsx` không đổi; backlog.
- `useBlockSize`: không đổi.
- Định dạng ngày trong hộp thoại lý do: không đổi (dạng `instantText` dùng cho cả ứng dụng).

## Độ mạnh của test: mutant của riêng tôi

Mỗi mutant được áp dụng riêng trong `export-mut` (chữ cũ và chữ mới chính xác trong `53-mutant-*.json.txt`), build lại client khi mutant nằm
trong `src/`, chạy các test được nêu, rồi khôi phục file giống từng byte với bản sao lưu và với bản xuất sạch (hoặc, với `fixtures.ts`, với bản
gốc của mutant: file sạch cộng hàm chọn cổng của probe và mô hình trễ không hoạt động của DIAG5, `51-mutbase-fixtures.diff.txt`) và build lại
client (`52-mut-*.txt`, `50-mut-summary.txt`); sau mutant cuối cùng `dist/` bằng bản build sạch. Không mutant nào lặp lại mutant của FIX11 đến
FIX15, các DIAG hay REGATE10, trừ MA1 và MA9, là chữ chính xác của RECHECK-A, cố ý chạy lại.

| Mutant | Thay đổi | Kết quả |
|---|---|---|
| MB1 | FIX13: việc báo dirty lại trong `useEffect` | bị bắt: test cùng task hỏng trên cả hai project tại "Discard your changes?" (không có câu hỏi); test Escape cũ hơn đạt, vì thời gian của nó cho phép |
| MB2 | FIX13: layout effect chỉ báo `true` | bị bắt: "a saved day asks nothing" (chuyển ngày ở 1280 và 1440px) và U5-25 "the unsaved-edit guard sees the draft" (cả hai project): cờ cũ sau khi lưu hay hủy |
| MB3 | FIX14: bộ theo dõi bỏ qua key `null` (storage bị xóa) | không bị bắt (82 test theme đạt); R-A3-1 |
| MB4 | FIX14: bộ lọc key bị đảo | bị bắt: test mới, cả hai project, "the page is painted dark"; test cũ đạt vì listener riêng của menu đang mở áp dụng |
| MB5 | FIX14: bộ theo dõi chỉ gắn khi đã đăng nhập | không bị bắt (82 đạt); trang đăng nhập sẽ không theo; R-A3-1 |
| MB6 | FIX11: thẻ trả về không có lớp bọc | bị bắt: test vòng focus, "light, scrolled 0px: the ring is painted on every edge" |
| MB7 | FIX11: lớp vẽ `--focus-ring` dạng ngoài | bị bắt: cùng assertion |
| MB8 | FIX11: lớp dùng `:focus` thay cho `:focus-visible` | không bị bắt (46 đạt); R-A3-3 |
| MB9 | FIX11: lớp bọc `position: static` | bị bắt: cùng assertion |
| MA8n | MA8 của RECHECK-A trên lớp mới: vòng accent trong suốt | bị bắt: cùng assertion (spec focus-ring và bàn phím đạt, nên test vòng là test thấy nó) |
| MA9 | MA9 của RECHECK-A, đúng chữ: `revealFocused` tác động lên chính thẻ | bị bắt: "light, scrolled 60px: taking focus does not move the card" |
| MA1 | MA1 của RECHECK-A, đúng chữ: `.rsig-content:empty` được hiện | bị bắt: "the unsigned employee line is 52px high at 600px (measured 57)" |
| CTL10 | đối chứng: mô hình 90 ms của DIAG5 trên các chỗ gọi helper, không mutant, `--repeat-each=2` | 44 passed, 0 failed |
| MB10 | FIX12: `expectLayoutAt` trả về ngay, cùng mô hình | bị bắt: 8 failed (thẻ kiểm tra trên cả hai project, "vertically centred at 767px" và "page width"; thẻ kỳ hẹp, "430px: no sideways scroll"; hàng chữ ký và một cột trên mobile), nên chính helper giữ chúng |
| MB13 | FIX12: ngưỡng `expectSheetAt` là `<= 480` | bị bắt: "480px: the week sheet is the phone table below 480px only" (thẻ kiểm tra, thẻ kỳ hẹp) |
| CTL11 | đối chứng: test vượt nửa đêm ở 2026-10-27T06:59:20Z, wrapper FIX10 | đạt trong 38,6 s: nó chờ nửa đêm và khẳng định cả hai tab |
| MB11 | FIX15: quyền miễn bị bỏ qua (mọi test bị giữ) | bộ test không bắt: test vượt nửa đêm bị giữ khoảng 40 s, chạy nhánh đồng hồ thật trong 2,0 s và đạt; probe hàng rào của tôi thấy test có annotation bắt đầu 0,58 s sau nửa đêm thay vì trước đó (MB11F); R-A3-2 |
| CTLF | đối chứng: probe hàng rào của tôi ở 06:59:30Z | test có annotation bắt đầu lúc 06:59:32,13Z (không bị giữ), test thường lúc 07:00:00,58Z (bị giữ tới nửa đêm + 0,5 s) |
| MB12 | FIX15: hằng múi giờ là `UTC` | bộ test không bắt: cả hai test check-in bắt đầu ở 06:59:40Z đều đạt (chúng xong trước nửa đêm); probe hàng rào của tôi thấy test thường bắt đầu 27,9 s trước nửa đêm (không bị giữ); R-A3-2 |

Mười một trên mười sáu bị bộ test bắt, mỗi cái đúng lý do mà thay đổi nhắm tới. Năm cái sống được ghi bên dưới; không cái nào che một lỗi sản
phẩm (probe của tôi cho thấy hành vi sản phẩm mà các mutant làm hỏng).

## Lỗi

Không có lỗi mới. Không có phát hiện F-UX5A3 nào: mọi tuyên bố về sản phẩm của FIX11, FIX13 và FIX14 mà tôi đo đều đúng, và không thấy hồi quy
nào trong khu vực A.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- R-A3-1 (độ mạnh của test, theme theo tab khác): không test nào ghim việc trang đăng nhập theo tab khác (gắn ở cấp `App`), việc xóa storage ở
  tab khác bỏ lựa chọn, hay việc bộ theo dõi bỏ qua key khác; MB5 và MB3 sống qua toàn bộ `theme.spec.ts`. Sản phẩm làm cả ba điều (probe của
  tôi). Tùy chọn: một bước của test mới với tab thứ hai ở trang đăng nhập, và một `localStorage.clear()` ở tab thứ nhất.
- R-A3-2 (hàng rào nửa đêm): (a) múi giờ là một hằng, nên một spec sau này chuyển nhân viên dùng chung sang múi giờ khác, hay một người thuộc lịch
  khác (DIAG9 nêu spec chia sẻ ở Pacific/Auckland và một test day-editor ở múi giờ giữa trưa), sẽ không được giữ lại ở nửa đêm của chính nó;
  hiện không thời điểm gate nào vượt các nửa đêm đó; (b) một test dài hơn 45 s bắt đầu ngay ngoài hàng rào và đọc ngày muộn vẫn có thể vắt qua
  (DIAG9 đọc code và không thấy test nào như vậy); (c) quyền miễn không có test riêng: khi nó bị bỏ qua (MB11), test vượt nửa đêm bị giữ lại, chạy
  nhánh đồng hồ thật trong khoảng 2 s và đạt, nên chỉ một gate ghi lại thời gian của test vượt nửa đêm (như REGATE10 và lần kiểm lại này) mới
  nhận ra; với hằng múi giờ sai (MB12), không gì trong bộ test hỏng ở vị trí đã đo. Tùy chọn: để test vượt nửa đêm hỏng khi nó bắt đầu trong vòng
  90 s trước nửa đêm dưới wrapper mà vẫn không thấy ngày đổi.
- R-A3-3 (độ mạnh của test, vòng focus): vòng hiện cả khi focus bằng chuột (`:focus` thay cho `:focus-visible`, MB8) vẫn sống; quy ước dùng chung
  ở nơi khác là `:focus-visible`, và probe của tôi cho thấy build không vẽ vòng khi bấm chuột.
- Mục `target-size` của menu tài khoản ở 1440px (và 1280px theo UX3) vẫn là mục R2 đã chấp nhận của UX3, không đổi.

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ, và không kiểm tra nào phải chạy lại. Harness của repository tự chọn cổng loopback trống cho lượt FULL bắt buộc
và lượt bảy file trong bản xuất sạch (tôi không đổi code đang được kiểm); probe và mutant của tôi dùng 51282-51309 qua một hàm chọn cổng trong
các bản sao của chúng (`51-*-fixtures*.diff.txt`). Bốn probe của tôi có lỗi của chính probe ở lần chạy đầu và đã được sửa rồi chạy lại; các lần
đầu được giữ dưới tên `*-v1` / `*-v2` (cách đo vòng đã đọc hàng thứ hai, bị khử răng cưa, của một cạnh lẻ pixel; bottom sheet modal của điện thoại
khiến cú bấm Playwright phía sau nó không thể xảy ra; hai cú bấm vào radio đã được chọn và một lần điều hướng chỉ đổi hash không tải lại; các
assertion axe cứng dừng một lượt ở mục đầu tiên). Không kết luận nào về sản phẩm dựa trên một lần chạy đầu. Các mục NAS và production nằm ngoài
khu vực A.

## Xử lý phát hiện trước

F-UX5A2-1: đã sửa (ở trên). R-A2-1..5: như ở trên. Các lỗi đã đóng của RECHECK-A, F-UX5A-1..4, và các lỗi vòng 4 vẫn đã sửa (các test của chúng
đạt trong lượt FULL của tôi).

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

Lần kiểm lại này chấp nhận khu vực A trên be2afa2 (PASS). Review này không nói gì về phép của chủ sở hữu hay kết quả pilot; không đụng tới việc
gửi thật hay triển khai production (chỉ capture cục bộ).

## Một bước tiếp

Coordinator ghi nhận PASS này của khu vực A trên be2afa2 và tiếp tục với kết quả của WP5-UX5-RECHECK-B2 và bước WP5 kế tiếp trên bảng; R-A3-1..3
có thể vào backlog tùy chọn của WP5 như các mục về độ mạnh của test.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX5-RECHECK-A2 lần 1; agent reviewer `ac4e1fc487e2170bb` (bảng); tác giả của các
  thay đổi được kiểm gồm FIX11 `ad20b5d60d23b40b3`, DIAG5 `a4b3d773a6c773cc3`, FIX12 `a4d0a2d06582c033b`, DIAG6 `aa5b47c77e20ee0d8`, FIX13
  `ae88157dbd8cfbaf3`, DIAG7 `a2f9710356f00cfc2`, DIAG8 `a2d866ee4d98d8fc8`, FIX14 `a1c4234a6f1e1ba0b`, DIAG9 `a3f238d09db3d0559`, FIX15
  `a95d2f3d7fd1cf6e5` và các committer `ab548c09464afc4b4`, `ad74ddf24fe9fa54e`, `ac3b5ae5d6aa244dc` và `af240aefa6e644b8a`.
- Context mới; tôi không viết thay đổi nào được kiểm. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng chứng.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE10 PASS (Addendum 1).
- Path report mới: `handoff/delivery/WP5_UX5_RECHECK_A2.md` (+ `.vi.md`); `WP5_UX5_RECHECK_A.md` và các review trước không bị đụng.
- Xử lý phát hiện và task tiếp của coordinator: F-UX5A2-1 đóng; không có lỗi mới; R-A3-1..3 được ghi.
