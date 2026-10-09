# Review độc lập: thiết kế lại UI WP5, vùng A (kiểm lại sau WP5-UX-FIX4)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi
  giờ, đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09; task WP5-UX-AUDIT-A3 lần 1; model tự báo
  claude-opus-5-5, không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN,
  T02, T04; FIX2, FIX3 và FIX4 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb, digest
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 file, không tính `handoff/`).
  HEAD = origin/main = a2ea7a4; không có commit chưa push. Bản export sạch bằng `git archive` của
  a2ea7a4 có đúng 789 đường dẫn và blob của cây (danh sách đường dẫn và blob bằng nhau, diff exit 0).
- Quyết định: **PASS**
- Phạm vi thật đã xem/chạy: (1) delta `589bcff..a2ea7a4` (FIX4) từng dòng, kèm so sánh biên dịch và
  token của `DayEditor.tsx`, diff CSS theo từng rule, kiểm dòng test được giữ nguyên và probe điện thoại
  trước/sau trên bản build của 589bcff và a2ea7a4; (2) các kiểm tra bắt buộc vùng A trên export sạch của
  a2ea7a4: ranh giới nghiệp vụ, mọi chỗ gọi ghi phía client và hàm dựng body so với 014bd47, body request
  lúc chạy so với bản build 014bd47 (trường ngày, clock in/out, batch, ký), quét phép tính phía client,
  A-01, R-07 bằng probe đổi múi giờ thiết bị, AC-04, AC-16/AC-01, riêng tư, PDF/AC-06/07/10, `npm test`,
  bảy spec e2e trên cả hai project và AC-13 một lần; (3) rủi ro Info R2 và R5 của A2, đã tái hiện. Probe
  của A2 được dùng lại làm phương pháp và viết lại cho snapshot này; không lấy tóm tắt cũ nào làm bằng
  chứng.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A3/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của a2ea7a4 và của HEAD) và lúc kết thúc (export sạch, ls-tree, `scripts/source-digest.mjs`) | luôn là 0b8428fd, 789 file; repository không đổi ngoài `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, cache trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, xem rủi ro) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1820 test đạt | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual trên cả hai project | exit 0; 114 test: 102 đạt, 12 bỏ qua theo spec, 0 lỗi (desktop 50 + 7 bỏ qua: 2 test chỉ cho mobile và 5 test màn hình đầu điện thoại, trong đó ba test của FIX4; mobile 52 + 5 bỏ qua: 2 test pdf-visual và 3 test B-02 chỉ cho desktop) | `04-e2e.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức cao (`source-map-js`, chỉ dev); file package không đổi từ 014bd47 | `06-npm-audit.txt` |
| delta 589bcff..a2ea7a4 và chứng minh | 5 file (+39/-12); `DayEditor.tsx` chỉ đổi chú thích (JS sinh ra giống hệt, 1033 token không phải chú thích giống hệt); CSS: 2 token mới và 3 rule điện thoại, không thuộc tính nào ẩn/dời/cắt/chặn; spec: chỉ chèn thêm; không đổi server, domain, API, package hay cấu hình | `10-delta.txt`, `11-boundary.txt`, `12-delta-proof.txt` |
| ranh giới từ 014bd47; chỗ gọi; hàm dựng body | `src/server` và PDF không đổi; `src/domain` chỉ thêm `formatHoursMinutes`; `api.ts` không đổi; 65 endpoint ở cả hai; chỉ hai chỗ gọi mới trên endpoint có sẵn; các hàm dựng giống hệt trừ phần đọc giờ nghỉ | `11-boundary.txt`, `13-callsites.txt`, `14-body-builders.txt`, `14-variable-calls.txt` |
| quét phép tính 25 file client đổi từ 014bd47 | chỉ có đổi đơn vị nhập giờ/phút nghỉ, đếm dòng nghỉ và hiệu OT-nghỉ đã có ở 014bd47 | `15-client-files.txt`, `16-client-arith.txt` |
| probe của tôi trên a2ea7a4 (1280, 1024, 390) | 24 test: 19 đạt, 4 bỏ qua theo thiết kế, 1 lỗi do cách đo; chạy lại probe điện thoại với cách đo ở giữa màn hình: 1 đạt | `30-probe-a2ea7a4-run2.txt`, `32-probe-phone-run3.txt`, `*.json.txt` |
| cùng luồng trên bản build 014bd47 và so sánh | 4 + 2 đạt; body nghỉ 12/12 GIỐNG, body clock, ký và batch GIỐNG; mismatches 0 | `31-probe-014bd47-run2.txt`, `38-probe-bodies-014bd47.txt`, `36-compare-014bd47.txt` |
| probe điện thoại trên bản build 589bcff so với a2ea7a4 | 0 hồi quy ở 390x844, 360x844, 320x844, 360x740, 320x640 | `33-probe-phone-589bcff.txt`, `34-phone-compare.txt`, `35-sticky-bar-artefact.txt` |
| ảnh chụp tổng hợp | 2 | `a3-phone-grantee-view-only-390-synthetic.png`, `a3-phone-grantee-edit-open-day-320-synthetic.png` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **không có.**
- Chứng minh delta (phạm vi 1), FIX4 không đổi hành vi nào của vùng A:
  1. Chỉ năm file đổi ngoài `handoff/`: `src/client/styles.css`, `src/client/DayEditor.tsx`,
     `tests/e2e/timesheet.spec.ts`, `docs/04_UX_AND_SETTINGS.md` và bản `.vi.md` (mỗi file dòng 9). Không
     file nào trong `src/server`, `src/domain`, `src/client/api.ts`, PDF, `package*.json`, các tsconfig,
     cấu hình vite, vitest, playwright, eslint hay `scripts/` thay đổi.
  2. `DayEditor.tsx:84` là dòng duy nhất đổi và cả hai phiên bản đều là chú thích `//` ("768px" thành
     "1200px"); TypeScript 6.0.3 sinh JavaScript giống hệt từng byte cho cả hai file khi bỏ chú thích, và
     chuỗi token không phải chú thích (1033 token) giống hệt.
  3. CSS: `:root` thêm `--date-field-min: 9.5rem` và `--open-day-label-min: 15.25rem`
     (`styles.css:62-63`); trong `@media (max-width: 767px)` các rule `.tools .open-day` (nowrap ->
     wrap, gộp `align-items: center` vốn tách riêng), `.tools .open-day label` (flex và min-width theo
     token) và `.tools .open-day input` (min-width theo token) thay đổi (`styles.css:1083-1103`). Không
     khai báo nào đã đổi có thể ẩn, đẩy ra ngoài màn hình, cắt hoặc chặn một control (không có display,
     visibility, opacity, position, overflow, clip, height, z-index, pointer-events, order hay
     transform). Các selector chỉ khớp form `OpenDay` (`components/OpenDay.tsx:13`), form này chỉ được
     render khi `canEdit` (`TimesheetScreen.tsx:378`); CSS không thể thêm nó cho người được chia sẻ chỉ
     xem. Trên bản build của 589bcff và a2ea7a4, cùng một probe điện thoại thấy mọi control cần thiết
     (clock, ô và nút Open a day, Review & sign off, nút chuyển kỳ, Show details, Change several days, nút
     Edit của một ngày, bộ chọn nhãn) đều có, hiển thị, nằm trong bề ngang và không bị che ở cả năm kích
     thước được kiểm (0 hồi quy). Ô ngày nay giữ đủ một ngày (146.2, 220 và 180 px ở bề ngang 390, 360 và
     320 px) và nút xuống dòng dưới ô ở 360 và 320 px; Open day vẫn mở trình sửa modal cho ngày đã nhập
     và không ghi gì; không cuộn ngang.
  4. `tests/e2e/timesheet.spec.ts`: cả 361 dòng của file ở 589bcff được giữ đúng thứ tự (chỉ chèn 27
     dòng: ba test điện thoại ở 390, 360 và 320 px); số dòng `expect(` 107 -> 114; không test nào bị bỏ,
     skip hay làm yếu.
- Đạt ở vùng A trên a2ea7a4 (tôi tự tái hiện, ngoài các kiểm tra bắt buộc):
  1. Endpoint và body so với 014bd47: 65 endpoint ở cả hai commit; mọi lời gọi ghi của 014bd47 giữ nguyên
     văn bản; chỗ gọi mới duy nhất là preview `POST /days/batch` một mục của bộ chọn nhãn
     (`TimesheetScreen.tsx:302`, mục từ `labelEntry`) và `PUT /sessions/:id` một chạm
     (`DayEditor.tsx:193`, dựng bằng `buildSessionRequest`). `buildSessionRequest`,
     `buildClockOutRequest`, `batchEntries`, `modeEndpoint`, `buildSubmitBody` và `api` giống hệt;
     `buildDayEntryRequest` chỉ khác ở phần đọc giờ nghỉ. Lúc chạy so với bản build 014bd47: body trường
     ngày cho 0, 45, 150, 240, 480 và 1440 phút giống nhau trên desktop và điện thoại (12/12); clock in
     (`input_zone`), clock out (`breaks`, `breaks_confirmed`, `expected_version`), preview và commit batch
     có lý do (hai ngày ở kỳ cũ) và lệnh ký (`POST /api/timesheets/:p/signoff`, cùng khóa và giá trị) đều
     giống. Panel bên (1280), trình sửa modal (1024) và bottom sheet điện thoại gửi cùng body trường ngày.
  2. Client không tính phút nghiệp vụ: lần quét chỉ thấy `leaveInputModel.ts:51-56` (giờ x 60 + phút, đơn
     vị nhập), đếm dòng nghỉ (`sheetModel.ts:160`) và hiệu OT-nghỉ đã có ở 014bd47
     (`sessionModel.ts:390`); Overtime Total là `view.totals.provisional_credited_minutes`
     (`TimesheetSheet.tsx:288`) và tổng ở Review là `payload.totals.credited_minutes`
     (`ReviewDays.tsx:44`).
  3. A-01 vẫn đóng: ở cả ba bố cục, 12 mục nhập sai dạng hoặc ngoài khoảng ("2-", "3-", "e", "1.5", "-1"
     ở một trong hai ô, 60 phút, 25 giờ, 24 h 01 m) bị từ chối với thông báo `role="alert"`,
     `aria-invalid` chỉ trên ô sai, không có `PUT /api/days/:date` và không lưu gì (36 lần từ chối, 0
     PUT); mục hợp lệ gửi một PUT với body như 014bd47; chính 014bd47 cũng từ chối các mục sai dạng bằng
     kiểm tra gốc của trình duyệt.
  4. R-07: ba phiên LA (23:00-23:50, 00:20-01:10, 22:00-02:00+1) xem ở America/Los_Angeles, Asia/Tokyo,
     Pacific/Kiritimati, Pacific/Pago_Pago và Asia/Ho_Chi_Minh ở 1280, 1024 và 390: mọi phiên ở yên ngày
     kế toán đã lưu, giờ và dấu ngày bắt đầu khớp oracle Intl, 14 ngày, ô OT và Overtime Total giống hệt,
     thanh kỳ ghi "Times in <zone>" và chỉ hiện ghi chú múi giờ khi hai múi khác nhau, và Review hiện cùng
     giờ theo múi báo cáo.
  5. AC-04 ở mỗi bố cục: chọn nhãn ở kỳ cũ chỉ preview, cần lý do và commit kèm lý do; nút Save của trình
     sửa bị khóa đến khi có lý do và PUT mang lý do; cả hai lý do có trong `/api/history`; bộ chọn nhãn
     dừng khi version cũ (Commit bị khóa); form trường ngày mở qua "Open a day" từ chối lưu khi version cũ
     ("This day changed since it was loaded", server không đổi, Reload day); xác nhận nghỉ một chạm gửi
     version đã tải và bị từ chối vì cũ; Delete rồi Escape không xóa gì; xung đột cần xác nhận rõ và gửi
     `confirm_conflicts`. Các nhắc DST fold/gap và qua đêm đạt trong e2e day-editor bắt buộc.
  6. AC-16/AC-01 ở mỗi bố cục: người được chia sẻ chỉ xem không có form Open a day, Change several days,
     clock, bộ chọn nhãn, checkbox, Edit, dải chữ ký, liên kết review hay ảnh; có 14 nút "View", trình sửa
     chỉ đọc không có ô nhập, không ghi gì và không gọi gì ngoài `/api/shared/<owner>/` (cộng share và
     auth). Người được chia sẻ quyền sửa chỉ ghi qua `/api/shared/<owner>/` (preview và commit batch của bộ
     chọn nhãn, PUT ngày của trình sửa và, trên điện thoại 320 px qua hàng "Open a day" đã xuống dòng, một
     PUT ngày thứ hai); lịch sử của chủ ghi tên người được chia sẻ. Người dùng thứ ba không thấy gì và nhận
     404 cho timesheet chia sẻ, ngày, PUT ngày và PUT phiên của chủ.
  7. Riêng tư và PDF: trang Timesheet trước và sau khi ký có 0 ảnh, 0 nền CSS url và 0 request
     `/api/signatures`; dải chữ ký hiện "Signed by ..." và ngày ký theo múi báo cáo khớp oracle; Review có
     đúng một ảnh chữ ký (`/api/signatures/<id>`) ngoài bảng. Mã PDF và `pdf-visual.spec.ts` không đổi từ
     014bd47 và pdf-visual đạt; body ký gắn với `payload_hash` và `expected_version` đã review và được
     nhận (201); e2e review và submission đạt (AC-06/AC-07; `ReviewSignoff`, `ReviewEnvelope`, các hàm
     gửi của `reviewModel` và server không đổi).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Info) không đổi: cảnh báo `source-map-js`
  GHSA-68fv-2mgg-jv7q chỉ ở dev (vite -> postcss), `--omit=dev` sạch, lock không đổi từ 014bd47. (R2,
  Info, xét lại: không ảnh hưởng vùng A) Đã tái hiện ở 1280 -> 1024: trình sửa được mở lại dạng modal
  phía trên hộp review của bộ chọn nhãn; Escape đầu tiên đóng trình sửa và hộp review còn lại (docs/04
  dòng 59 nói hộp thoại lồng nhận Escape trước). Khi trình sửa ở trên, ô lý do của review không nhận
  focus và Commit vẫn bị khóa; không ghi gì ngoài preview; Escape thứ hai đóng review và không commit gì;
  khi có lý do thì commit mang lý do và `/api/history` ghi lại. Ghi chú chưa lưu trong trình sửa bị bỏ,
  không bị ghi (sắc thái UX cho vùng B). (R5, Info, xét lại: không ảnh hưởng vùng A) Đã tái hiện: trên
  điện thoại 390x844, thanh chủ sở hữu của người chỉ xem ("Viewing Synthetic Owner A's timesheets - view
  only", 122.8-323.7 px) nằm trọn trong màn hình đầu và dòng ngày đầu tiên kết thúc ở 849.7 px, dưới mép
  trên thanh tab (788 px). Màn đó không có gì ghi được, và thanh trên cùng dính vẫn hiện "Shared with me:
  Synthetic Owner A" khi cuộn, nên người dùng luôn biết đang xem timesheet của ai; chỉ là chuyện bố cục
  cho vùng B. (R6, Info, mới, ngoài vùng A, không do FIX4) Khi một control nằm trên vùng nhìn được cuộn
  vào với căn mép trên (kiểu cuộn gần nhất của trình duyệt), thanh ứng dụng dính đè lên nó (thấy với nút
  Open day ở 320x640 và 280x653); 589bcff cũng vậy, và nút cuộn vào giữa vẫn dùng được
  (`35-sticky-bar-artefact.txt`); vùng B có thể kiểm focus-not-obscured (WCAG 2.4.11).
- Gate chưa chạy/bị chặn và lý do: không có cho vùng A.
- Xử lý phát hiện trước: WP5-UX-A-01 vẫn đóng (mục 3). Rủi ro của A2: R1 không đổi; R2 và R5 xét lại như
  trên (Info, không ảnh hưởng vùng A). WP5-UX-AUDIT-A2 (PASS trên 589bcff) và WP5-RECHECK (014bd47) được
  audit này thay thế cho vùng A.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chấp nhận a2ea7a4; WP5 chỉ được chấp nhận
  lại nếu lần kiểm lại vùng B song song (WP5-UX-AUDIT-B3) cũng đạt. Không liên quan phép của chủ, gửi
  thật hay pilot.
- Một bước/prompt tiếp: coordinator ghi PASS này (cùng WP5-UX-AUDIT-B3) và, nếu cả hai đạt, chấp nhận
  lại WP5 tại a2ea7a4 qua committer; chủ có thể xóa file lạc `D:\canedit.txt` (sơ suất lúc chạy bên
  dưới).

Ghi chú lúc chạy: hai sơ suất của tôi, ghi trong `90-slips.txt`: một lệnh liệt kê chỉ đọc có pipe vào
`head`, và một lệnh chuyển hướng trong shell chưa nạp môi trường task đã tạo `D:\canedit.txt` (30 dòng mã
nguồn công khai, không có dữ liệu cá nhân) ngoài thư mục task; theo chỉ dẫn trước đây của coordinator cho
cùng loại sơ suất, tôi không thử xóa nó. Fixture e2e tự chọn cổng loopback trống; tôi không khởi động
server nào khác. Không để lại gì đang chạy.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A3.md](WP5_UX_REVIEW_A3.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A3 lần 1; agent reviewer
  ad6212962664d60ea (board); tác giả WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4
  afb8ef164774cd30d.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer này không viết gì trong vòng thiết
  kế lại và không chạy gate hay audit trước nào của vòng này; chỉ viết review này, bản dịch, phần Results
  của task và `evidence/WP5-UX-AUDIT-A3/`; các bản build a2ea7a4, 589bcff, 014bd47 và mọi probe chạy trong
  thư mục task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: 0b8428fd trước và sau; WP5-UX-REGATE2 PASS trên cùng
  freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A3.md` (mới);
  `WP5_UX_REVIEW_A.md` và `WP5_UX_REVIEW_A2.md` giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không có phát hiện; vùng A không cần task sửa.
