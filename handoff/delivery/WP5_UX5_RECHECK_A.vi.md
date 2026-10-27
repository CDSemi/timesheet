# Vòng thay đổi UI 5 của WP5, kiểm lại khu vực A trên a5533b5 (WP5-UX5-RECHECK-A)

Bản dịch của [WP5_UX5_RECHECK_A.md](WP5_UX5_RECHECK_A.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI 5 do chủ sở hữu yêu cầu của WP5, khu vực A (giao diện,
  khung ứng dụng, Timesheet, Day editor, giao diện Review, trợ năng); task WP5-UX5-RECHECK-A, lần 1, 2026-10-27 từ 16:18Z đến khoảng
  17:30Z. Task này kiểm lại WP5-UX5-AUDIT-A (FIX REQUIRED trên f4049aa, `WP5_UX5_REVIEW_A.md`, lỗi F-UX5A-1..4, rủi ro R1-R8) sau FIX8,
  FIX9 và FIX10. Model reviewer tự báo `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên
  trong). Model tác giả mạnh nhất trên bảng cho snapshot này là `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN, WP5-UX5-T01B);
  FIX8, FIX9, FIX10 cùng planner và committer của chúng là `claude-sonnet-5-5`, nên reviewer không yếu hơn. Tôi không viết task WP5-UX4
  hay WP5-UX5 nào. WP5-UX5-RECHECK-B chạy cùng lúc trên cùng máy.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5` (WP5-UX5-FIX10-FREEZE, đã push; WP5-UX5-REGATE6 PASS trên nó). HEAD = origin/main = commit đó
  trước và sau; không có dòng status nào ngoài `handoff/` trước và sau. Digest
  `4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f`, 882 file, không tính `handoff/`, bằng nhau ở ba dạng lúc 16:18:19Z
  và lúc 17:24:40Z: bản xuất `git archive` sạch băm bằng `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp giống
  từng byte với của bản xuất) và `npm run digest`. Source đủ: `npm ci` exit 0 trong ba bản xuất (`export` cho các kiểm tra bắt buộc,
  `export-probe` cho probe của tôi, `export-mut` cho mutant của tôi).
- **Quyết định: FIX REQUIRED.** F-UX5A-1, F-UX5A-2, F-UX5A-3 và F-UX5A-4 đã được sửa (mỗi lỗi được chính phép đo của tôi xác nhận, bên
  dưới). Một lỗi mới mức Low, trong thay đổi của FIX9: **F-UX5A2-1**, chỉ báo focus của thẻ tuần chỉ đọc trên Review chỉ được vẽ ở cạnh
  trên và cạnh trái (các cột ngày che nó ở cạnh phải và cạnh dưới, và cả cạnh trái khi thẻ đã cuộn), nó không phải vòng focus dùng chung,
  còn tài liệu 04 (EN và VI) và hai chú thích trong code nói điều ngược lại; không test nào kiểm chỉ báo này. Mọi thứ khác trong phạm vi
  đạt. Kiểm tra bắt buộc: typecheck, lint, `npm test` (101 file, 2384 test), build (không có cảnh báo chunk) và AC-13 exit 0; FULL e2e
  đồng hồ thật 871 passed, 131 skipped, 0 failed (desktop 466/35, mobile 405/96), không chạy lại.

## Phạm vi thật đã xem và chạy

1. Đọc như các tuyên bố: brief; AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"); `WP5_UX5_REVIEW_A.md`; `owner_decisions` trên
   bảng ngày 2026-10-21 và 2026-10-22 (yêu cầu vòng 5, F-1..F-10, điều chỉnh mockup 2 với B7/B9, điều chỉnh 3 và phần đính chính "hai hàng
   chữ ký ... thụt vào giống như bản vẽ b11-pdf", "1 a, 2 a"); bản ghi task PLAN-FIX7A, FIX8, FIX9, DIAG4, FIX10, REGATE5 và REGATE6 cùng
   bằng chứng; diff source và test `f4049aa..94accda` (FIX7-FIX9) và `94accda..a5533b5` (FIX10); docs/04 và docs/12, EN và VI.
2. Các kiểm tra bắt buộc trong bản xuất sạch, lần lượt từng cái (phần lõi) và chạy riêng (FULL e2e; RECHECK-B chạy việc của nó cùng lúc).
3. Probe riêng trong `export-probe` (các `zz-ra-*.spec.ts` cục bộ qua harness của repository, Edge headless, hàm chọn cổng trỏ vào
   49862-49889): Review đã ký và tải lại ở chín độ rộng, cả hai theme và cả hai project, kèm quét ngưỡng từng 1px và thanh cuộn cổ điển; tên
   của "Change days" ở mọi độ rộng 320-1440 qua cây trợ năng của Chromium; vuốt, chạm, nhấn giữ bằng cảm ứng, bấm bằng bút và chuột, bấm vào
   thanh cuộn cổ điển và thanh cuộn overlay khi Day editor đang mở; các thẻ tuần của FIX9 (quét từng 1px 470-1110 có và không có thanh cuộn
   cổ điển, Tab, tên, phím mũi tên, `revealFocused`, đổi cỡ khi đang có focus, vòng focus được vẽ theo từng cạnh trong bốn trạng thái theme);
   axe-core 4.14.0 (nạp từ thư mục task; không thêm dependency) và đi phím; cuộn ngang của trang ở mọi độ rộng 320-1440; bộ giải mã PNG của
   FIX10 so với bộ giải mã của chính trình duyệt; các dòng tài liệu đã thay so với bản build.
4. Mười bảy mutant của chính tôi trong `export-mut`, mỗi cái áp riêng, build lại client, chạy các test được nêu, khôi phục file và so từng
   byte với bản xuất sạch, build lại client.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX5-RECHECK-A/` cùng 9 ảnh `-synthetic.png`; mã nguồn probe và script
được giữ dưới dạng `90-src-*.txt` và `91-*.txt`; `00-README.txt` là mục lục.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, status ngoài `handoff/`, digest ba dạng, đầu và cuối | HEAD a5533b5 = origin/main; không có dòng nào; `41477510…69f`, 882 file, lúc 16:18:19Z và 17:24:40Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (ba bản xuất) | 0, 0, 0 | `02-ci-*.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không có dòng deprecation | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 file, 2384 test (48,3 s) | `03-npmtest.txt` |
| `npm run build` | 0; `index-BNsJjgBK.js` 491,83 kB (tên asset của FIX10 và REGATE6), `ReviewScreen` 25,75 kB, không có cảnh báo kích thước chunk | `03-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `03-ac13.txt` |
| FULL e2e, đồng hồ thật, hai project, 2 worker (16:21:18-16:50:07Z) | exit 0: 871 passed, 131 skipped, 0 failed; desktop 466/35/0, mobile 405/96/0; không chạy lại | `06-e2e-full-run1.txt`, `06-e2e-counts.txt` |
| Probe chân ký (F-UX5A-1) | xem bên dưới | `40-obs-review.txt`, `40-obs-review-mobile.txt`, `40-obs-classic.txt` |
| Probe tên (F-UX5A-2) | xem bên dưới | `40-obs-sheet.txt` |
| Probe cảm ứng, bút, thanh cuộn (F-UX5A-3) | xem bên dưới | `40-obs-sheet.txt`, `40-obs-tap2.txt`, `40-obs-classic.txt`, `40-obs-overlay.txt` |
| Probe FIX9 | xem bên dưới | `40-obs-review.txt`, `40-obs-ring.txt`, `40-obs-classic.txt` |
| axe-core 4.14.0 | 104 lần quét, 0 vi phạm | `40-obs-axe.txt`, `40-sum-axe.txt`, `40-obs-walk2.txt` |
| Đi phím | 12 lượt, 1.558 điểm dừng; điểm dừng nào cũng có chỉ báo focus; 0 điểm bị che hoàn toàn khi đã ổn định | `40-sum-axe.txt`, `40-obs-walk2.txt` |
| Probe bộ giải mã của FIX10 | 0 trên 65.600 điểm ảnh khác với bộ giải mã của trình duyệt | `40-obs-surface3.txt`, `40-obs-surface.txt` |
| Mutant | 17 của tôi: 11 bị bắt; MA1, MA5, MA8, MA9 không bị bắt; MF3 tương đương ở đây, MF3b nằm trong dung sai | `50-mut-*.txt`, `50-mut-summary.txt` |
| `npm audit --omit=dev` (thông tin cho khu vực B) | 0 lỗ hổng; toàn cây báo 6 cảnh báo chỉ ở dev | `07-npm-audit-*.txt` |

## Xử lý các lỗi của AUDIT-A

1. **F-UX5A-1 (Medium, chân ký trên Review hẹp): đã sửa.** Ký trong UI, tải lại, ở 1440, 1200, 1100, 900, 768, 600, 480, 390 và 320px,
   sáng và tối, project desktop và mobile (36 phép đo, `40-obs-review*.txt`): "Sign correction" không chồng lên ảnh, tên hay dấu "Signed" ở
   độ rộng nào; nút kết thúc cách cuối dòng của nó đúng 8,00px và đứng trên dòng (đáy nút cách mép ngoài của dòng 5px: 4px padding và đường
   kẻ 1px) ở mọi độ rộng; bốn dòng thẳng hàng theo hàng (0,00px) và theo cột (x và độ rộng 0,00px); tỷ lệ từ 768px trở lên là 0,0352 /
   0,2741 / 0,4445 / 0,1370 / 0,1092, đúng giá trị của B11 và PDF; ảnh giữ 160x48px từ 768px và 135-138px khi hẹp hơn; tên nằm trên một dòng
   (một tên dài không có ảnh xuống dòng theo từ thành 2-3 dòng và vẫn nằm trong dòng ký); không trang nào cuộn ngang. Nút nằm cạnh nội dung
   từ 1150px và tụt xuống dưới nội dung ở 1149px trở xuống (1164px với thanh cuộn cổ điển 15px), đúng thiết kế đã báo chủ sở hữu: các quy
   tắc của chủ sở hữu (Addendum 2: nút ở cuối dòng của nó, thụt vào một chút, các dòng thẳng hàng; B7/B9: hai hàng; Addendum 3b: các khoảng
   thụt của B11) đều giữ, và trạng thái "đã ký, mở lại" chưa từng có trong mockup. Dưới 1150px nội dung đã ký đứng cao hơn dòng một chiều cao
   nút thay vì nằm trên dòng (`ra-sig-*-synthetic.png`); tôi đánh giá điều này chấp nhận được và để chủ sở hữu xem lại khi đã được báo. Hình
   học của PDF không đổi: `src/server/pdf/layout.ts` và phần vẽ chữ ký không bị đụng (`20-pdf-diffstat.txt`: chỉ `drawCategory` đổi, do FIX7,
   khu vực B), các tỷ lệ `--sig-*` không đổi và các test tỷ lệ PDF của review.spec đạt trong lượt FULL của tôi.
2. **F-UX5A-2 (Low, SC 2.5.3): đã sửa.** Ở mọi độ rộng cửa sổ từ 320 đến 1440px, tên truy cập của nút trong cây trợ năng của Chromium bằng
   đúng chữ đang hiện: "Change days" ở 320-343px, "Change several days" ở 344-1440px; khi đang nhấn (chế độ nhiều ngày) ở 320px tên vẫn là
   "Change days" với `aria-pressed="true"` (`40-obs-sheet.txt`). Tên không bao giờ bị nhân đôi (dạng bị ẩn là `display: none`). Dạng ngắn là
   chữ thật, nên axe không thấy `button-name`; các mục `label-content-name-mismatch` (incomplete) còn lại của axe chỉ là hai nút ký hiệu "<" và
   ">" chuyển kỳ, là ký hiệu chứ không phải nhãn chữ.
3. **F-UX5A-3 (Low, cuộn làm đóng Day editor): đã sửa trong Chromium.** Trên màn hình cảm ứng 1024x768 với ngăn kéo nổi và chỉnh sửa chưa
   lưu: vuốt lên, xuống, ngang và chéo từ vùng trang trống đều bị trình duyệt hủy (`pointerdown`, `pointercancel`) và ngăn kéo vẫn mở, không
   hỏi gì (`40-obs-sheet.txt`); một lần chạm thì hỏi, Keep editing trả focus về trường, chạm rồi Discard thì đóng và focus về nút ngày; chạm
   sau một lần vuốt thì đóng; chạm vào cột ngày khác thì đổi ngày; nhấn giữ không di chuyển được tính như một lần bấm; một điều khiển được chạm
   ngay sau lần chạm đóng vẫn có tác dụng ngay và listener `touchend` một lần đã biến mất (`40-obs-tap2.txt`, đọc qua
   `DOMDebugger.getEventListeners`). Bút và chuột vẫn đóng ở `pointerdown` như trước, focus về nút ngày. Với thanh cuộn cổ điển 15px ở 900 và
   800px, bấm vào con trượt, rãnh và nút mũi tên của thanh cuộn thẻ tuần và vào thanh cuộn cửa sổ đều để ngăn kéo mở; vùng trang trống thì
   đóng nó (`40-obs-classic.txt`). Các test U5-23..U5-26, test cảm ứng mới và test thanh cuộn đạt trong lượt FULL của tôi
   (`06-e2e-area-a-lines.txt`), và test lớp nền trên điện thoại đạt trên project mobile. Rủi ro còn lại (ở đây chỉ có giả lập Chromium): xem
   R-A2-1 và R-A2-2.
4. **F-UX5A-4 (Low, tài liệu): đã sửa.** Mỗi dòng đã thay được kiểm so với bản build, EN và VI cùng nội dung: docs/04:10 (nút tụt xuống dưới
   nội dung khi dòng hẹp hơn khoảng 290px, cửa sổ dưới khoảng 1150px: đo được 1149/1150px); :49 / vi:50 (khoảng "22:00-06:00+1": một dòng từ
   1100px trở lên, dạng sát ở 930px, hai dòng trong ô 107px ở 900-480px và trong ô điện thoại 80px ở 320px, một dòng ở 390px;
   `40-obs-sheet.txt`); :63 (đặt tên theo chữ đang hiện); :69 (quy tắc thanh cuộn và cảm ứng, như đo ở trên); :103 (góc 12px ở mọi độ rộng,
   cách mép 8px dưới 480px); :105 (`--select-arrow-w` 12px, `-h` 6px, `-inset` 12px, `--select-pad-end` 34px ở `styles.css:171-174`); :111
   (36px trong biểu mẫu của ngăn kéo, 44px toàn chiều rộng ở chân sheet điện thoại, đã đo); :124 và docs/12:54 (chữ của FIX7: "Signer" kèm
   "(you)", "your name only" kèm liên kết Settings, "your saved image and your name", đúng như `SignoffDialog.tsx:136-160` và
   `reviewModel.ts:514-515` hiển thị); docs/12:116 (bộ test chứng minh độ rộng lẻ trên style sheet; probe của kiểm toán được mô tả đúng như
   vậy). Các chú thích style sheet ở `:153-158`, `:344-347`, `:2704`, `:2821-2828`, `:3854-3858` và `:4090-4097` nay khớp bản build. Câu mới
   duy nhất không đúng (của FIX9, docs/04:50 / vi:51) là lỗi F-UX5A2-1.

## FIX9: các thẻ tuần chỉ đọc trên Review

- **Là điểm dừng đúng khi nó cuộn:** quét từng 1px 470-1110px (`40-obs-review.txt`): `tabindex="0"` trên cả hai thẻ ở 480-913px, nơi chúng
  tràn (`overflow-x: auto`, scroll width 850 > client width); không có tabindex ở 914-929px (vẫn là vùng cuộn nhưng lưới vừa) và từ 930px
  (`overflow: visible`); 0 chỗ sai. Với thanh cuộn cổ điển: là điểm dừng ở 480-928px, không phải từ 929px trở lên, 0 chỗ sai
  (`40-obs-classic.txt`). Các thẻ có thể sửa của Timesheet không bao giờ nhận tabindex ở 900, 768, 600 và 480px; ở 1280 và 1440px một lượt
  đi 60 điểm dừng trên Review không gặp thẻ nào.
- **Tên và phím:** Chromium đặt tên vùng của thẻ là "Week 1, 10/12/2026 to 10/18/2026", focus được; Tab tới được; ArrowRight cuộn nó 40px;
  Home và End không cuộn nó theo chiều ngang (đó là phím dọc của trình duyệt; docs/04 chỉ hứa phím mũi tên).
- **`revealFocused`:** thẻ đang cuộn ở 60px vẫn giữ 60px khi Tab focus vào nó (không nhảy) ở 768, 600 và 480px.
- **Đổi cỡ khi đang có focus:** focus ở 900px, mở rộng tới 1100px: tabindex mất, focus rơi về `body`, và Tab kế tiếp tới "Sign off", điều
  khiển nằm sau các thẻ (rủi ro R-A2-3).
- **Vòng focus:** quy tắc riêng của thẻ vẽ một `outline` lõm 2px màu `--accent` (tương phản 6,09:1 trên tờ giấy và 4,80:1 trên thanh WEEK ở
  theme sáng, 6,79:1 và 5,00:1 ở theme tối, giống nhau ở cả hai chế độ chọn tay). Nhưng nó chỉ được vẽ ở hai cạnh: bảy cột `.sheet-day` có
  `position: relative`, nên chúng vẽ đè lên outline của phần tử cha. Tỷ lệ điểm ảnh của dải 2px (`40-obs-ring.txt`, mọi điểm ảnh của từng
  cạnh): cạnh trên 100%; cạnh trái 100% ở đầu và 50% khi đã cuộn hết ở 768px; cạnh phải 8,5% (phần thanh WEEK), 100% chỉ khi cuộn hết;
  cạnh dưới 0-13%; giống nhau ở cả hai theme. `box-shadow: var(--elev-2)` của chính quy tắc đó không bao giờ có hiệu lực
  (`.review-preview .sheet-week { box-shadow: none }` đứng sau với cùng độ ưu tiên). Đây là lỗi F-UX5A2-1.

## Hồi quy trong khu vực A, trợ năng và bố cục

- axe-core 4.14.0, các tag WCAG 2.0-2.2 A/AA, sáng và tối: Timesheet (1440, 900, 768, 480, 390, 320; bật worked hours ở 1440 và 390; mở
  Day editor ở 1280, 900 và 390), Review chưa ký, hộp thoại Sign off, Review đã ký và Review đã ký rồi tải lại ở sáu độ rộng trên project
  desktop, và ở 480, 390 và 320px trên project mobile: 104 lần quét, 0 vi phạm (`40-sum-axe.txt`).
- Đi phím, sáng và tối: Timesheet 1280 (157 điểm dừng), Timesheet 1280 với ngăn kéo nổi (157), Review 900 (76), điện thoại 390 Timesheet
  (157) và Review (75), cộng thêm lượt đi ngăn kéo lần nữa với hai frame sau mỗi Tab (157). Điểm dừng nào cũng có chỉ báo focus (vòng outline
  hoặc box-shadow tính được); 0 điểm dừng bị che hoàn toàn (SC 2.4.11) ở mọi lượt khi đã ổn định (`40-obs-walk2.txt`; đọc ngay lập tức, trước
  khi ngăn kéo đổi bên, có tới 24 điểm dừng của lượt ngăn kéo trông như bị che, đó là việc đổi bên đã được mô tả, không phải lỗi).
- Không trang nào cuộn ngang ở mọi độ rộng 320-1440px: Timesheet (tắt và bật worked hours) và Review đã ký rồi tải lại (sáng và tối), và
  Review với thanh cuộn cổ điển.
- Không gì khác trong diff của FIX8 và FIX9 đổi bố cục ngoài các dòng chữ ký và các thẻ; mũi tên "→" trong mô tả Review và phụ đề hộp thoại
  Sign off vẫn đọc "to" cho trình đọc màn hình; việc bỏ `aria-label` trên `div` xem trước của hộp thoại để lại tên nhóm "Signatures" bên trong.

## Thay đổi test của FIX10 (chỉ test; dist không đổi)

- **Logo (bốn context, test chế độ chia sẻ tách riêng):** mỗi cửa sổ thêm là một context của cùng trình duyệt với storage state, locale,
  múi giờ, bảng màu và reduced motion của trang; các hàng được xếp lại theo độ rộng và một kiểm tra mới chứng minh mỗi độ rộng 320-1440 được đo
  đúng một lần. Lượt quét chế độ chia sẻ là một test riêng với cùng các khẳng định và vòng theme. Mutant MF1 của tôi (quy tắc chế độ chia sẻ
  từ khoảng 512px thay vì 492px) làm test tách riêng thất bại ("493px: the wordmark is hidden but fits"); MF1b (mỗi cửa sổ bỏ độ rộng cuối)
  làm kiểm tra đầy đủ mới thất bại. Thời gian: 59,5-78 s mỗi test quét trong lượt FULL của tôi khi RECHECK-B đang chạy; 78-84 s trong các
  lượt quét 6 worker của REGATE6; tới 204 s trên 240 s trong lượt stress chỉ có logo với 10 worker của REGATE6 (40 cửa sổ quét cùng lúc). Với
  lượt quét của gate ở 6 worker, biên (dùng khoảng 35% giới hạn) là chấp nhận được; con số stress cho thấy test nhạy với tải, nên một lượt
  gate chạy cạnh một lượt nặng khác có thể dùng gần hết giới hạn (rủi ro R-A2-5).
- **Bề mặt ảnh chụp đã giải mã (`paintedSurface`):** ảnh chụp viewport của Playwright ở đây là RGB 8-bit (colour type 2), không xen kẽ,
  trong 28 chunk IDAT, với các loại filter 1, 2, 4 và (theme tối) 3 (`40-obs-surface.txt`). Bộ giải mã cho kết quả bằng bộ giải mã PNG của
  chính trình duyệt trên 32.800 điểm ảnh mỗi theme, 0 khác biệt (`40-obs-surface3.txt`). So với ảnh chụp từng điểm ảnh, 1 và 2 trên 690 điểm
  ảnh lệch một đơn vị ở một kênh (hai lần chụp riêng), nằm trong dung sai 3 của test. PNG bảng màu, 16-bit và xen kẽ thất bại rõ ràng. Các
  mutant MF3 (Paeth khi hòa thì ưu tiên "up") và MF3b (Average làm tròn lên) của tôi không làm test khung thất bại: MF3 không đổi điểm ảnh nào
  được giải mã của các ảnh chụp này và MF3b đổi 801 trên 32.800 điểm ảnh của theme tối một đơn vị, nằm trong dung sai của test; bộ giải mã
  được giao là chính xác. MF4 (khung đang sửa chỉ ở cạnh trái) làm nó thất bại ("light: right frame over d-day"). Test đọc đúng các điểm ảnh
  như trước, một bề mặt cho mỗi trạng thái trang không đổi và một bề mặt mới sau khi cuộn tới ngày bên cạnh.
- **Lần evaluate gộp cho tương phản:** cùng bộ chọn lá, cùng quy tắc hiển thị (`visibility` visible và hộp không rỗng, như `isVisible`),
  cùng phép thử `innerText` và cùng phép tính màu trong Node. MF5 (nền xám vừa trên phần đầu hộp thoại ca, một tổ tiên của chữ tiêu đề) làm
  "U4-12, U4-13 at 1440" thất bại ("text contrast of the session dialog (light)"), nên nền của các tổ tiên có được đọc.
- **admin-status:** việc chờ PDF dựa trên trạng thái (`expect.poll`, mỗi 1 s, tối đa 60 s) trước `sendSigned`, mọi khẳng định sau đó không
  đổi; MF2 (đổi nhãn "PDF ready") làm "the admin sees pipeline states" thất bại.
- Vì vậy năm file đã đổi chứng minh đúng điều mà các test cũ chứng minh: không khẳng định nào lỏng hơn, không độ rộng, theme hay trường hợp
  nào bị bỏ, và timeout duy nhất được thêm là giới hạn của lần poll PDF.

## Độ mạnh của test: mutant của chính tôi

Mỗi mutant được áp riêng trong `export-mut` (định nghĩa trong `91-mkmutants.mjs.txt`), build lại client khi mutant nằm trong `src/`, chạy các
test được nêu trên project desktop (và cả hai project khi test là test điện thoại), rồi khôi phục file giống từng byte với bản xuất sạch và
build lại client (`50-mut-*.txt`, `50-mut-summary.txt`). Không cái nào lặp lại mutant của DIAG4, FIX8, FIX9, REGATE5 hay REGATE6.

| Mutant | Thay đổi | Kết quả |
|---|---|---|
| MA1 | FIX8: `.rsig-content:empty` hiện lại | không bị bắt (4 test review đạt); dòng ký và dòng ngày của nhân viên khi chưa ký cao từ 52 lên 57px dưới 768px, vẫn thẳng hàng (`40-obs-empty.txt`) |
| MA2 | FIX8: `--sig-content-min` 10rem thành 3rem | bị bắt: "the saved image keeps its width at 768px" (45,4 < 100) |
| MA3 | nút đã xuống dòng mất `margin-inline-start: auto` | bị bắt: "Sign off sits 8px inside the end of its line" ở 1440 và 768px (hai test) |
| MA4 | FIX8: `onOwnScrollbar` không có điều kiện "phần tử đích cuộn được" | bị bắt: U5-24 ở 1280 và 1440px, "a press on the legend / the period card text closes the drawer" |
| MA5 | FIX8: listener hủy `touchend` không có `once` | không bị bắt (12 test day-editor đạt); với nó mọi lần chạm sau đều bị hủy: công tắc và "Next period" không phản hồi (`40-obs-MA5-impact.txt`) |
| MA6 | FIX8: listener hủy không gọi `preventDefault` | bị bắt: "the mouse events after the tap do not move the focus" |
| MA7 | FIX9: `scrollWidth >= clientWidth` | bị bắt: "1100px: week 1 fits, so it takes no tab stop" |
| MA8 | FIX9: outline của thẻ trong suốt | không bị bắt (spec review, focus-ring và keyboard-access: 45 đạt) |
| MA9 | FIX9: `revealFocused` tác động lên chính thẻ | không bị bắt (2 đạt); tác dụng là nhảy một khoảng scroll padding khi focus |
| MA10 | FIX8: dạng ngắn lại `aria-hidden` | bị bắt: bốn test, cả hai project ("288px: the name is the visible words", các lần tìm tên ở 320px) |
| MF1 | FIX10 logo: quy tắc chế độ chia sẻ từ khoảng 512px | bị test chế độ chia sẻ tách riêng bắt: "493px: the wordmark is hidden but fits" |
| MF1b | FIX10 logo: mỗi cửa sổ bỏ độ rộng cuối | bị kiểm tra mới bắt: "every width from 320 to 1440px was measured once, in order" |
| MF2 | FIX10 admin-status: đổi nhãn "PDF ready" | bị bắt: "the admin sees pipeline states" (`toHaveText`) |
| MF3 | FIX10 contrast.ts: Paeth khi hòa ưu tiên "up" | không bị bắt; tương đương trên các ảnh chụp này (0 trên 65.600 điểm ảnh đổi, `40-obs-MF3-impact.txt`) |
| MF3b | FIX10 contrast.ts: Average làm tròn lên | không bị bắt; 801 trên 32.800 điểm ảnh tối lệch một đơn vị, nằm trong dung sai 3 của test (`40-obs-MF3b-impact.txt`) |
| MF4 | FIX10 timesheet.spec: khung đang sửa chỉ ở cạnh trái | bị bắt: "light: right frame over d-day" |
| MF5 | FIX10 day-editor.spec: nền xám vừa trên phần đầu hộp thoại ca | bị bắt: "text contrast of the session dialog (light)" (nền tổ tiên có được đọc) |

Mười một trên mười bảy bị bắt. MA8 thuộc về F-UX5A2-1; MA5, MA9 và MA1 được ghi là R-A2-4; MF3 và MF3b cho thấy bộ test không tự kiểm bộ
giải mã, còn probe của tôi cho thấy bộ giải mã được giao là chính xác.

## Rủi ro R1-R8 đã ghi của AUDIT-A và backlog

Không cái nào trở thành lỗi. R1 (`useBlockSize.ts` theo dõi content box): không đổi, không có thay đổi chỉ padding hay border nào của thanh.
R2 (ảnh tới muộn làm dịch hộp thoại Sign off): không đổi, backlog. R3: hai dạng cuối của thang rút gọn nay có test trình duyệt (M2 của
REGATE6 và việc đọc của tôi); độ rộng lẻ vẫn được chứng minh trên chữ của style sheet (docs/12:116 nói vậy). R4: đã sửa (không còn
`aria-label` trên `div` chung). R5: mũi tên là "→"; "2026-10-26 20:55" trong hộp thoại lý do là định dạng `instantText` dùng cho cả ứng dụng,
nhất quán, vẫn để ghi lại. R6 (`reviewLinkLabel` không dùng ngoài test của nó), R7 (ngày payroll làm "Today" khi `/api/periods/current` lỗi)
và R8 (wordmark hiện, ẩn, hiện khi có bộ chuyển) không đổi. `deliveryModel.ts:251` "A delivery of this revision is in progress." vẫn đúng:
nó chỉ hiện khi lần gửi của chính revision hiện tại đang chạy hoặc đang chờ; lần gửi của một revision khác trong kỳ bị server từ chối với "A
delivery of this period is already in progress." (chữ của FIX7), nên nút trong History có thể trông như dùng được rồi bị từ chối (một chi
tiết của khu vực B, ghi lại cho RECHECK-B, không phải lỗi của khu vực A).

## Lỗi

1. **F-UX5A2-1, Low - chỉ báo focus của thẻ tuần chỉ đọc bị che ở hai cạnh, và tài liệu nói đó là vòng dùng chung**
   (`src/client/styles.css:2962-2967`, `src/client/components/TimesheetSheet.tsx:154-158` và `:184`, docs/04:50 / vi:51).
   Tái hiện: mở Review của một kỳ ở 768 hoặc 900px (theme nào cũng được), nhấn Tab cho tới khi "Week 1, ..." có focus. Thực tế: một đường
   accent 2px chỉ ở cạnh trên và cạnh trái; bảy cột `.sheet-day` (`position: relative`) vẽ đè lên outline ở cạnh phải và cạnh dưới (cạnh phải
   8,5% trừ khi cuộn hết, cạnh dưới 0-13%) và, khi thẻ đã cuộn qua cột nhãn, cả cạnh trái (`40-obs-ring.txt`, `ra-fix9-*-synthetic.png`).
   `box-shadow: var(--elev-2)` của quy tắc không bao giờ có hiệu lực. Kỳ vọng: mục UI của AGENTS.md, ý 3, yêu cầu vòng focus dùng chung cho mọi
   trạng thái focus-visible và docs/04 nói thẻ này "hiện vòng focus dùng chung"; chú thích CSS nói "an inset outline the WEEK bar and cells
   cannot cover", và chú thích của hook nói nó "takes the shared focus ring". Bản thân WCAG 2.2 AA vẫn đạt (SC 2.4.7: đường cạnh trên luôn thấy
   được với 4,80:1 trở lên; SC 2.4.13 là AAA), nên lỗi nằm ở chuẩn và tài liệu. Sửa có phạm vi: vẽ chỉ báo phía trên các cột ngày có position
   (ví dụ một pseudo-element không tương tác phủ hộp đang thấy của thẻ mang `--focus-ring-inset`, hoặc đặt vòng trên một lớp bọc không cuộn),
   bỏ `box-shadow` không có tác dụng, sửa hai chú thích và docs/04:50 / vi:51 cho đúng điều được vẽ, và thêm một kiểm tra e2e rằng chỉ báo được
   vẽ ở cả bốn cạnh ở 768px trong cả hai theme (mutant MA8 của tôi, outline vô hình, vẫn sống qua bộ test hiện nay).

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- R-A2-1 (thiết bị thật): xử lý cảm ứng chỉ được chứng minh trong giả lập Chromium. Chromium gửi `pointerup` trước `touchend`, nên listener
  `touchend` một lần được đăng ký ở `pointerup` hủy chính touch-end của lần chạm đóng rồi biến mất (đã kiểm). Nếu một trình duyệt (ví dụ
  WebKit trên iOS) gửi `touchend` trước `pointerup`, listener sẽ chờ lần chạm kế tiếp và hủy click của lần đó, nên điều khiển kế tiếp cần
  chạm hai lần; và bộ test sẽ không nhận ra (mutant MA5 của tôi, listener không bao giờ bị gỡ, vẫn sống). Kiểm trên iPad và máy tính bảng
  Android thật trong pilot, hoặc đăng ký việc hủy ở `pointerdown` với thời gian sống có giới hạn.
- R-A2-2 (thanh cuộn overlay): `onOwnScrollbar` dựa vào client box, mà thanh cuộn overlay (macOS, một số laptop cảm ứng) nằm bên trong nó.
  Tính năng thanh cuộn overlay của Chromium trong Edge headless không cho tôi một thanh cuộn bấm được, nên trường hợp này chưa kiểm được.
- R-A2-3: mở rộng cửa sổ khi một thẻ tuần đang có focus sẽ bỏ tabindex của nó và đẩy focus về `body`; Tab kế tiếp đi tiếp sau các thẻ. Chấp
  nhận được, ghi lại.
- R-A2-4 (độ mạnh của test): bộ test không bắt MA1 (dòng chưa ký cao từ 52 lên 57px dưới 768px khi không có `.rsig-content:empty`), MA5 (xem
  R-A2-1), MA8 (xem F-UX5A2-1) hay MA9 (focus vào thẻ đang cuộn sẽ nhảy một khoảng scroll padding).
- R-A2-5: các test quét logo phụ thuộc frame và nhạy với tải (ở trên); hãy giữ lượt quét của gate chạy riêng.
- Thông tin cho khu vực B: `npm audit --omit=dev` báo 0 lỗ hổng; toàn cây báo 6 cảnh báo chỉ ở dev (vite 8.3.1, source-map-js,
  @vitest/mocker, nodemailer chỉ dùng cho test nằm dưới smtp-server).

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ. Harness của repository tự chọn cổng loopback trống cho lượt FULL bắt buộc trong bản xuất sạch (tôi không
đổi code đang được kiểm); probe và mutant của tôi dùng 49862-49889 qua hàm chọn cổng của bản sao probe. Các mục NAS và production nằm ngoài
khu vực A. Một probe của tôi chạy sai: `zz-ra-surface2.spec.ts` so từng điểm ảnh của viewport qua `paintedSurface().at()`, mỗi điểm ảnh một
bước expect của Playwright, và worker của nó bị kẹt trong vòng lặp đồng bộ đó quá cả timeout của chính nó (khoảng 3 GB, chỉ trong thư mục
nháp của tôi); tôi đã thay nó bằng `zz-ra-surface3.spec.ts` lấy mẫu. Tôi không được kill tiến trình theo PID, nên nếu nó vẫn chạy khi bàn
giao, coordinator dừng nó qua background task của nó (báo cáo của tôi nêu task đó); nó không đụng gì trong repository và không kết quả nào ở
đây phụ thuộc vào nó.

## Xử lý phát hiện trước

F-UX5A-1, F-UX5A-2, F-UX5A-3 và F-UX5A-4: đã sửa (ở trên). R1-R8: như ở trên. Các lỗi vòng 4 F-UX4A-1..4 vẫn đã sửa (các test thanh cuộn cổ
điển, Escape, focus và tài liệu đạt trong lượt FULL của tôi).

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

Khu vực A chưa được nghiệm thu trên a5533b5 (FIX REQUIRED, một lỗi Low). Review này không nói gì về phép của chủ sở hữu hay kết quả pilot;
không đụng tới việc gửi thật hay triển khai production (chỉ capture cục bộ).

## Một bước tiếp

Một task sửa của coordinator cho F-UX5A2-1 (một quy tắc CSS hoặc pseudo-element, hai chú thích, docs/04 EN và VI, một kiểm tra e2e), rồi một
regate có phạm vi và một lần kiểm lại khu vực A trên digest mới.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX5-RECHECK-A lần 1; agent reviewer `af318528ad22bcca0` (bảng); tác giả của
  các thay đổi được kiểm gồm PLAN-FIX7A `a456a2ba415c54275`, FIX8 `a4349a3f47d95bc39`, FIX9 `a61a88f6109035605`, DIAG4 `a6bfd56e473a84c2a`,
  FIX10 `a86722480f1aa3aee` và committer của FIX9 và FIX10 `ae47074d02a6381cd` và `ab2c334d3cecf95ca`.
- Context mới; tôi không viết thay đổi nào được kiểm. Tôi không đổi gì ngoài cặp review này, phần Results của brief và thư mục bằng chứng.
- Digest trước và sau: bằng nhau (ở trên); bằng chứng gate cho snapshot này: WP5-UX5-REGATE6 PASS.
- Path report mới: `handoff/delivery/WP5_UX5_RECHECK_A.md` (+ `.vi.md`); `WP5_UX5_REVIEW_A.md` và các review trước không bị đụng.
- Xử lý phát hiện và task tiếp của coordinator: F-UX5A-1..4 đóng; F-UX5A2-1 mở; sửa, regate, kiểm lại.
