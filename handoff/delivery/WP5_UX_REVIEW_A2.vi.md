# Review độc lập: thiết kế lại UI WP5, vùng A (audit lại sau vòng sửa)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi
  giờ, đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09; task WP5-UX-AUDIT-A2 lần 1; model tự báo
  claude-opus-5-5, không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN,
  T02, T04; FIX2 và FIX3 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  589bcff5541a603abad696a3303dbea11cccb4a7, digest
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e (789 file, không tính `handoff/`).
  HEAD = origin/main = 589bcff; không có commit chưa push. Bản export sạch bằng `git archive` của
  589bcff có đúng 789 file và blob của cây (danh sách đường dẫn và blob bằng nhau, diff exit 0).
- Quyết định: **PASS**
- Phạm vi thật đã xem/chạy: diff `014bd47..589bcff` của `src` và `tests`, nhất là `831f760..589bcff`
  (FIX2, FIX3); mọi chỗ gọi ghi phía client và body request của các màn hình đã đổi so với 014bd47; các
  model hiển thị phía client xem có phép tính nghiệp vụ không; A-01 bằng probe của tôi trên 589bcff
  (1280, 1024 và điện thoại) và trên bản build sạch của 014bd47, và bằng cách bỏ phần sửa FIX2 trong
  một bản sao nháp; các kiểm tra bắt buộc; probe của tôi cho R-07, AC-04 (gồm trình sửa modal mới dưới
  1200px), AC-16/AC-01 (gồm trình sửa modal và bố cục điện thoại gọn), riêng tư, và các rủi ro mới của
  vòng sửa; chạy lại toàn bộ e2e của export một lần ở 1024px (panel bên dạng modal).
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A2/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của 589bcff và của HEAD) và lúc kết thúc (export sạch, ls-tree, `scripts/source-digest.mjs` trong repository) | luôn là 8c07aac5, 789 file; repository không đổi ngoài `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, cache npm trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, xem rủi ro) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1820 test đạt | `02-npm-test.txt` |
| `npm run build` | exit 0 | `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual trên cả hai project | exit 0; 108 test: 99 đạt, 9 bỏ qua theo spec, 0 lỗi (desktop 50 + 4 bỏ qua: test chỉ cho mobile và màn hình đầu điện thoại; mobile 49 + 5 bỏ qua: pdf-visual và các test B-02 768-1280px) | `04-e2e-mandatory-both-projects.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức cao (`source-map-js`, chỉ dev) | `06-npm-audit.txt` |
| `npm run typecheck`; `npm run lint` | exit 0; exit 0 | `07-typecheck-lint.txt` |
| ranh giới nghiệp vụ từ 014bd47; chỗ gọi API client 014bd47 so với 831f760 so với 589bcff; hàm dựng body | `src/server` và PDF không đổi; `src/domain` chỉ thêm `formatHoursMinutes`; `api.ts` không đổi; cả hai có 65 endpoint; vòng sửa không thêm hay đổi chỗ gọi nào; body không đổi | `10-boundary.txt`, `11-callsites.txt`, `14-body-builders-diff.txt`, `15-write-bodies.txt` |
| probe A-01 của tôi trên 589bcff (1280, 1024 modal, điện thoại) | 3 đạt: 12 giá trị sai hoặc ngoài khoảng bị từ chối kèm alert và không có PUT; giá trị hợp lệ gửi đúng một PUT | `21-leave-589-run.txt`, `leave-589bcff-*.json.txt` |
| cùng các giá trị trên bản build sạch 014bd47 (desktop, điện thoại) và so sánh body | 2 đạt; body của các giá trị hợp lệ bằng nhau, mismatches=0 | `23-leave-014-run.txt`, `24-leave-compare.txt`, `leave-014bd47-*.json.txt` |
| test FIX2 khi bỏ phần sửa (chỉ trong bản sao nháp) | R0 đối chứng: unit 9/9, e2e 2/2; R1 cả hai file như 831f760: unit 2 lỗi, e2e 2 lỗi; R2 chỉ form như 831f760: unit 9/9, e2e 2 lỗi; R3 bỏ bước đọc lúc submit: unit 9/9, e2e 2 lỗi ở "e" | `30-fix2-scope.txt`, `32-variant-R*.txt`, `33-mutation-R3.diff.txt` |
| toàn bộ e2e ở 1024x800 (project tên desktop) | 87 test: 80 đạt, 5 bỏ qua, 2 lỗi theo thiết kế (hai test khẳng định panel không modal ở 1280px) | `41-e2e-full-1024.txt` (lần chạy đầu `40-e2e-1024-first-run.txt`) |
| probe của tôi cho AC-04 và rủi ro mới | 4 đạt, 2 bỏ qua (probe đổi kích thước chỉ chạy ở project desktop) | `42-ac04-run.txt`, `ac04-*.json.txt`, `risk-desktop.json.txt` |
| probe AC-16/AC-01 ở ba bố cục | 3 đạt | `43-sharing-run.txt`, `sharing-*.json.txt` |
| probe R-07 đổi múi giờ thiết bị và riêng tư ở ba bố cục | 6 đạt | `44-r07-privacy-run.txt`, `r07-*.json.txt`, `privacy-*.json.txt` |
| probe điều khiển trên điện thoại (390x844, 360x740, 320x640) | 1 đạt | `46-phone-run.txt`, `phone-controls-mobile.json.txt` |
| ảnh chụp tổng hợp | 2 | `a2-leave-refused-1024-modal-synthetic.png`, `a2-phone-grantee-view-only-synthetic.png` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **không có.**
- Đã đạt trong vùng A (tôi tự tái hiện, ngoài các kiểm tra bắt buộc):
  1. A-01 đã đóng (chi tiết ở "Xử lý phát hiện trước").
  2. Không đổi hành vi nghiệp vụ: `src/server` (kể cả `src/server/pdf`) không có diff từ 014bd47;
     `src/domain` chỉ thêm `formatHoursMinutes` (13 dòng), bằng hàm định dạng trong `layout.ts` của PDF
     với số phút nguyên không âm; `src/client/api.ts` không đổi. Client dùng cùng 65 endpoint; chỗ gọi
     mới duy nhất là `POST /days/batch` xem trước một mục của bộ chọn nhãn (`TimesheetScreen.tsx:302`,
     mục từ `labelEntry`, đúng dạng mục batch cộng trường tùy chọn `wfh` có sẵn) và `PUT /sessions/:id`
     một chạm (`DayEditor.tsx:193`, dựng bằng `buildSessionRequest`). Vòng sửa không đổi chỗ gọi nào.
     Body của chấm công vào, xem trước/commit batch, xóa, gửi review không đổi; body của trường ngày có
     cùng sáu khóa và, với cùng số nghỉ, cùng giá trị như 014bd47 (0, 45, 150, 240, 480, 1440, so trên
     desktop và điện thoại).
  3. Client không tự tính phút nghiệp vụ: rà các model sheet, thanh kỳ, trình sửa, bộ chọn nhãn, nghỉ và
     review chỉ thấy phép đếm số dòng nghỉ giữa giờ, phép đổi giờ sang phút của ô nhập nghỉ và phép trừ
     thông tin sẵn có về nghỉ OT (đã có ở 014bd47); ô OT và Overtime Total là trường của server, định
     dạng h:mm.
  4. R-07: ba session LA (23:00-23:50, 00:20-01:10, 22:00-02:00+1) xem ở America/Los_Angeles,
     Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago và Asia/Ho_Chi_Minh trên 1280, 1024 và điện thoại:
     mọi session ở nguyên ngày kế toán đã lưu, giờ và dấu ngày bắt đầu khớp oracle Intl, 14 ngày, ô OT và
     tổng giống hệt, thanh kỳ ghi "Times in <zone>" và chỉ hiện ghi chú múi giờ khi hai múi khác nhau,
     trang Review hiện cùng giờ theo múi báo cáo.
  5. AC-04 ở từng bố cục (panel không modal 1280, panel bên modal 1024, sheet modal trên điện thoại): chọn
     nhãn kỳ cũ cần lý do trước khi commit và gửi kèm lý do; nút Save của trình sửa bị khóa đến khi có lý
     do và PUT mang lý do (cả hai có trong `/api/history`); phiên bản cũ chặn bộ chọn nhãn (Commit bị
     khóa), việc lưu trường ngày và xác nhận nghỉ một chạm ("This day changed since it was loaded",
     phiên bản không đổi, Reload day); xung đột cần xác nhận rõ ràng và gửi `confirm_conflicts`; Delete
     rồi Escape không xóa gì. Các e2e DST fold, DST gap, qua đêm, lý do, phiên bản cũ, xóa và bộ chọn
     nhãn cũng đạt ở 1024 trong lượt chạy toàn bộ.
  6. AC-16/AC-01 ở từng bố cục: người được chia sẻ chỉ xem không có Open a day, Change several days,
     chấm công, bộ chọn nhãn, ô chọn, Edit, dải chữ ký, link review hay ảnh, có 14 nút "View" hiển thị,
     trình sửa chỉ đọc không có ô nhập nào, và chỉ gọi dữ liệu qua `/api/shared/<owner>/`; thanh chủ sở
     hữu ("Viewing Synthetic Owner A's timesheets - view only") vẫn hiện trên điện thoại, nơi tiêu đề
     trang chỉ còn cho trình đọc màn hình. Người được sửa ghi qua `/api/shared/<owner>/days/batch` và,
     qua trình sửa modal ở 1024 và trên điện thoại, `PUT /api/shared/<owner>/days/<date>`; lịch sử của
     chủ ghi tên người được chia sẻ. Người thứ ba không thấy gì và nhận 404 cho timesheet chia sẻ, ngày,
     PUT ngày và PUT session của chủ.
  7. Riêng tư và PDF: trên trang Timesheet trước và sau sign-off có 0 ảnh, 0 nền CSS url và 0 request
     `/api/signatures`; dải chữ ký ghi "Signed by ..." và ngày ký theo múi báo cáo; trang Review có đúng
     một ảnh chữ ký (`/api/signatures/<id>`) nằm ngoài sheet. Code PDF và `pdf-visual.spec.ts` không đổi
     từ 014bd47 và pdf-visual đạt; e2e review và submission đạt (đường AC-06/AC-07 không đổi:
     `buildSubmitBody`, `ReviewSignoff`, server không đổi).
  8. Vòng sửa không thêm rủi ro: dữ liệu đã gõ (ghi chú, 2 h 30 m) còn nguyên qua 1280 -> 1024 -> 700 ->
     1280 trong cùng trình sửa (không modal, modal bên, modal sheet, không modal) và không có lần ghi nào;
     Escape ở 1024 đóng mà không ghi và mở lại thì bắt đầu từ dữ liệu server; phía sau trình sửa modal,
     nút chấm công, bộ chọn nhãn, Open a day, Change several days và nút ngày không nhận focus và cú
     click chấm công bị chặn; ở 1280, Escape trong hộp review của bộ chọn nhãn chỉ đóng hộp review, trình
     sửa vẫn mở; sau khi thu cửa sổ dưới 1200px khi hộp review đó đang mở, không có gì được commit và
     Commit vẫn khóa đến khi có lý do. Trên điện thoại rộng 390, 360 và 320px, Clock in/out, Open a day,
     Open day, Review & sign off, Previous/Next, Show details, Change several days, nút Edit của một ngày
     và bộ chọn nhãn đều có, hiển thị, nằm trong bề ngang và không bị che; Clock in, hộp Clock out, Open a
     day, nút chuyển kỳ và link review hoạt động; không cuộn ngang; tiêu đề trang bị ẩn thị giác không
     chứa điều khiển nào. Màn hình người được chia sẻ vẫn không có điều khiển chỉ dành cho chủ (mục 6).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Thông tin) cảnh báo GHSA-68fv-2mgg-jv7q của
  `source-map-js` vẫn chỉ thuộc dev (vite -> postcss), `--omit=dev` sạch, lock không đổi từ 014bd47.
  (R2, Thông tin) Nếu thu cửa sổ dưới 1200px khi hộp review của bộ chọn nhãn đang mở trên trình sửa
  không modal, trình sửa được mở lại dạng modal nằm trên hộp review, nên Escape đầu tiên đóng trình sửa
  chứ không đóng hộp review (docs/04 dòng 59 nói hộp lồng nhận Escape trước). Không có gì được ghi hay
  bị bỏ qua (`risk-desktop.json.txt`, bước e); là chi tiết UX cho vùng B nếu cần. (R3, Thông tin)
  014bd47 nhận chuỗi số mũ như "1e2" phút (gửi 100); 589bcff từ chối chuỗi không phải chữ số kèm thông
  báo, chặt hơn và không bao giờ lưu giá trị khác. (R4, Thông tin) Unit test của FIX2 một mình không bắt
  được hồi quy ở form (R2 và R3 vẫn qua); e2e của FIX2 bắt được trên cả hai project, nên bộ test nói
  chung bảo vệ A-01. (R5, Thông tin, ngoài vùng A, không đánh giá) Trên điện thoại, thanh chủ sở hữu của
  người được chia sẻ đẩy dòng ngày đầu xuống dưới màn hình đầu; B-01 được đặt cho màn hình của chính
  nhân viên.
- Gate chưa chạy/bị chặn và lý do: không có với vùng A.
- Xử lý phát hiện trước: **WP5-UX-A-01 đã đóng.** Ở 589bcff, với dữ liệu nhập của audit đầu, giờ "2-" với
  30 phút, giờ 4 với phút "3-", giờ "2-" với 0 phút, và "e", "1.5", "-1" ở một trong hai ô, 60 phút, 25
  giờ và 24 h 01 m đều bị từ chối với thông báo `role="alert"` "Enter leave as whole hours (0 to 24) and
  minutes (0 to 59), at most 24h 00m." trong nhóm Partial leave, `aria-invalid` và `aria-describedby`
  chỉ trên ô sai, không có `PUT /api/days/:date`, không lưu gì (1280, 1024 modal và điện thoại). Giá
  trị hợp lệ gửi cùng body như 014bd47; hai ô trống vẫn lưu 0 như trước; một giá trị bị từ chối rồi sửa
  tại chỗ thì alert biến mất và gửi 150. Khi bỏ phần sửa (bản sao nháp), e2e của FIX2 lỗi trên cả hai
  project (R1, R2), và cũng lỗi khi chỉ bỏ bước đọc `validity.badInput` lúc submit (R3, lỗi ở "e"); unit
  test chỉ lỗi khi trả lại model cũ (R1). Rủi ro R1 (cảnh báo chỉ dev) và R2 (múi giờ của ngày ký) của
  WP5_UX_REVIEW_A: R1 không đổi (ở trên); bước kiểm ngày ký của probe riêng tư lại khớp oracle múi báo
  cáo. WP5-RECHECK (014bd47) vẫn bị thay thế.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chấp nhận 589bcff; WP5 chỉ được chấp nhận lại
  nếu audit lại vùng B chạy song song (WP5-UX-AUDIT-B2) cũng đạt. Không liên quan phép chủ, gửi thật hay
  pilot.
- Một bước/prompt tiếp: coordinator ghi nhận PASS này (cùng WP5-UX-AUDIT-B2) và, nếu cả hai đạt, chấp
  nhận lại WP5 ở 589bcff qua committer.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A2.md](WP5_UX_REVIEW_A2.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A2 lần 1; reviewer agent
  a3e5899e0a050c9d1 (board); tác giả WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer không viết gì trong vòng thiết kế
  lại này và không chạy gate hay audit trước nào của vòng; chỉ viết review này, bản dịch, Results của
  task và `evidence/WP5-UX-AUDIT-A2/`; probe, bản build 014bd47 và việc bỏ phần sửa FIX2 đều chạy trong
  thư mục task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: 8c07aac5 trước và sau; WP5-UX-REGATE PASS trên cùng
  freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A2.md` (mới);
  `WP5_UX_REVIEW_A.md` (FIX REQUIRED trên 831f760) giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: WP5-UX-A-01 đã đóng; không có phát hiện mới;
  vùng A không cần task sửa.
