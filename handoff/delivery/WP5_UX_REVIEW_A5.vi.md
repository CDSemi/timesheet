# Review độc lập: thiết kế lại UI WP5, vùng A (kiểm lại sau WP5-UX-FIX6)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi giờ,
  đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09; task WP5-UX-AUDIT-A5 lần 1; model tự báo
  claude-opus-5-5, không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN, T02,
  T04 và FIX5; FIX2, FIX3, FIX4 và FIX6 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  5e104e14dad71268a9185920c04ed0ee2a4b31c2, digest
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 file, không tính `handoff/`), ghi đầu
  tiên và ghi lại lúc kết thúc. HEAD = origin/main = 5e104e1; không có commit chưa push. Bản export sạch bằng
  `git archive` của 5e104e1 có đúng 790 đường dẫn và blob của cây (danh sách bằng nhau, diff exit 0) và không đổi
  sau mọi kiểm tra.
- Quyết định: **PASS**
- Phạm vi thật đã xem/chạy: (1) chứng minh delta `edaaa85..5e104e1` (c24d634 và 49a3ff0 không đổi gì ngoài
  `handoff/`; FIX6 đổi 8 file): so sánh tĩnh hàm định dạng của ghi chú múi giờ, quét đơn vị 20316 phép kiểm
  instant/múi giờ qua mọi lần đổi DST 2025-2027 ở 17 múi giờ dưới 7 múi giờ thiết bị, chạy trình duyệt ghi chú
  múi giờ qua 8 múi giờ và 7 kỳ trên bản build 5e104e1 và edaaa85, diff CSS theo từng khai báo, probe focus bằng
  bàn phím cho mọi điều khiển vùng A ở ba bố cục và hai giao diện trên cả hai bản build, kiểm dòng test và so
  sánh từng byte server đã build; (2) các kiểm tra bắt buộc vùng A trên export sạch của 5e104e1: ranh giới, chỗ gọi
  ghi và hàm dựng body so với 014bd47 và edaaa85, body lúc chạy của mọi đường sửa so với bản build 014bd47, phép
  tính phía client, A-01, R-07 bằng probe đổi múi giờ thiết bị và giờ hạn trong ghi chú múi giờ, AC-04,
  AC-16/AC-01, riêng tư, PDF/AC-06/07/10, `npm test`, tám spec e2e trên cả hai project và AC-13 một lần. Probe của
  A4 được dùng lại làm phương pháp và điều chỉnh; không lấy tóm tắt cũ nào làm bằng chứng.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A5/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của 5e104e1 và HEAD, `npm run digest`, export sạch) và lúc kết thúc (băm lại export, ls-tree của HEAD, `npm run digest`) | luôn là 07c3ca00, 790 file; export không đổi; repository không đổi ngoài `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, cache trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1821 test đạt | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual, focus-ring trên cả hai project | exit 0; 124 test: 109 đạt, 15 bỏ qua theo điều kiện project của spec, 0 lỗi (desktop 54 + 8 bỏ qua, mobile 55 + 7 bỏ qua; focus-ring 2 + 2) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức high (`source-map-js`, chỉ dev) | `06-npm-audit.txt` |
| delta edaaa85..5e104e1, ranh giới từ 014bd47 và edaaa85, server/domain đã build | FIX6 đổi 8 file; `src/server`, `src/domain` (từ edaaa85), `api.ts`, PDF, package, cấu hình, scripts, fixtures không đổi; `dist/server` giống từng byte ở 014bd47, edaaa85 và 5e104e1, `dist/domain` giống nhau ở edaaa85 và 5e104e1 | `10-delta.txt`, `11-boundary.txt`, `11b-dist-server.txt`, `12-delta-proof.txt` |
| diff CSS theo khai báo | bỏ 3 khai báo, thêm 3: `--focus-ring`, `--focus-ring-inset`, một `box-shadow`; không thuộc tính bố cục/hiển thị/hit-test nào | `12a-css-rules.txt` |
| quét đơn vị giờ hạn | 20316 phép kiểm x 7 múi giờ thiết bị, 0 lỗi | `12b-due-zone-probe.txt` |
| chỗ gọi; hàm dựng body; phép tính client | 66 khóa gọi ở mọi commit; 0 chỗ gọi ghi đổi từ edaaa85; 12/12 hàm dựng giống hệt từ edaaa85 | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt` |
| probe riêng trên 5e104e1 (1280, 1024, 390) | body 3 đạt; A-01, AC-04, AC-16/AC-01, R-07, riêng tư 15 đạt; ghi chú múi giờ 3 đạt; focus 6 đạt | `30-…`, `31-…`, `33-…`, `34-…`, `37-summary.txt` |
| cùng luồng trên 014bd47; ghi chú múi giờ và focus trên edaaa85 | 2 + 2 đạt; 3 + 6 đạt | `32-…`, `32b-…`, `35-…`, `33b-…` |
| so sánh | body so với 014bd47 và ghi chú múi giờ so với edaaa85: mismatches=0; dữ kiện focus so với edaaa85: mismatches=0 | `36-compare.txt`, `36b-focus-compare.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **không có.**
- Chứng minh delta (phạm vi 1): FIX6 chỉ đổi định dạng chữ của ghi chú múi giờ và nét vẽ vòng focus.
  1. Ghi chú múi giờ, cùng instant và múi giờ. `PeriodBar.tsx:73` đổi từ `instantText(period.due_at_utc, zone)`
     sang `dueInZoneText(period.due_at_utc, zone)`; `period` và prop `zone` không đổi (`:18-31`). Cả hai hàm gọi
     cùng `formatInZone(zone, parseUtcInstant(…))` và lấy cùng ngày (ký tự 0-9) và giờ (11-15) của chuỗi đó
     (`format.ts:38-40`, `periodBarModel.ts:28-32`); chữ mới thêm thứ của ngày đang hiện và dạng ngày Mỹ mà thanh
     kỳ đã dùng. Không dùng `Date` theo múi giờ thiết bị. Dòng hạn bằng chữ của thanh kỳ (`dueInWords`, các trường
     múi giờ báo cáo của server) không đổi.
  2. R-07, kể cả DST. Quét đơn vị: mọi lần đổi độ lệch UTC 2025-2027 ở 17 múi giờ (59 khoảng nhảy và khoảng lặp,
     kể cả độ lệch 30 và 45 phút) theo bước 15 phút trong cộng/trừ 3 giờ và cộng/trừ 1 phút, cộng giờ hạn 17:00 Los
     Angeles của 1095 ngày ở mọi múi giờ: chữ mới bằng một oracle Intl độc lập (kể cả thứ) và mang đúng ngày, giờ
     của chữ cũ; 20316 phép kiểm, 0 lỗi, giống nhau dưới 7 múi giờ thiết bị. Trình duyệt: 8 múi giờ x 7 kỳ x 3 bố
     cục trên cả hai bản build: 168/168 dòng cùng `due_at_utc`, ngày trả lương, dòng hạn bằng chữ và ngày giờ địa
     phương; 42 dòng nằm ở phía bên kia một lần đổi DST so với hôm nay (Europe/London và America/New_York sau lần
     đổi mùa thu, ví dụ `2026-11-11T01:00:00Z` hiện "Tue 11/10/2026, 20:00" ở New York và "2026-11-10 20:00" trước
     FIX6; Australia/Sydney, Lord_Howe, Pacific/Chatham và America/Santiago trước lần đổi mùa xuân) và đúng trên cả
     hai. Lần đổi DST của chính múi giờ báo cáo cũng được bao phủ (hạn 17:00 PDT = 00:00Z, 17:00 PST = 01:00Z).
  3. Không đổi request, body, phép tính hay giá trị lưu: không chỗ gọi ghi hay hàm dựng body nào đổi từ edaaa85;
     server và domain đã build giống từng byte với edaaa85; `dueInZoneText` trả chữ hiển thị và chỉ có một nơi gọi.
     Lúc chạy, các lần ghi bằng bàn phím của probe focus (clock in/out, trường ngày, commit xung đột, commit có lý
     do) giống hệt nhau trên bản build edaaa85 và 5e104e1, và body của mọi đường sửa bằng 014bd47 (bên dưới).
  4. CSS không thể che hay chặn điều khiển: chỉ `--focus-ring` (nay là `0 0 0 1px var(--card), 0 0 0 3px
     var(--accent)`), override tối bị bỏ, `--focus-ring-inset` mới và `box-shadow` của tab điện thoại đổi
     (`styles.css:42-43`, `:333-335`). Các token chỉ được dùng làm `box-shadow` trong bốn rule `:focus-visible`
     (`:220-224`, `:333-335`, `:506-508`, `:1336-1338`); box-shadow không chiếm chỗ bố cục và không được hit-test,
     bóng inset vẽ dưới nội dung. Ở 1280, 1024 và 390 px, sáng và tối, 25 (29 trên điện thoại) điều khiển clock, Open
     a day, kỳ, Edit, chọn nhãn, trường của trình sửa, Save, Add session, Close, hộp thoại Clock out, Review
     conflicts, ô xác nhận, Confirm and commit, lý do và Commit đều nhận focus bàn phím (`:focus-visible`) và vẫn
     hiện, không trong suốt, nằm trong khung nhìn và hit-test được ở tâm; mọi điều khiển khác trong danh sách cho
     cùng kết quả hit-test khi có và không có vòng (170 hoặc 218 cặp mỗi lần chạy, 0 khác); các luồng được hoàn tất
     bằng Enter/Space trên điều khiển đang có vòng. Cùng probe trên edaaa85 cho cùng dữ kiện.
  5. Test: chỉ hai dòng test bị bỏ và được thay bằng import rộng hơn và kiểu response rộng hơn; test ghi chú múi
     giờ thêm một assertion theo oracle; `focus-ring.spec.ts` là file mới; `fixtures.ts` không đổi. Không assertion
     vùng A nào bị bỏ hay làm yếu.
- Đạt ở vùng A trên 5e104e1 (tự tái hiện, ngoài các kiểm tra bắt buộc; `36-compare.txt`, `37-summary.txt`):
  1. Endpoint và body so với 014bd47: cùng 66 khóa gọi, chỗ gọi thêm vẫn chỉ là preview/commit một dòng của ô
     chọn nhãn và `PUT /sessions/:id` một chạm. Lúc chạy ở 1280 (panel bên không modal), 1024 (trình sửa modal) và
     390 (sheet dưới) so với bản build 014bd47: clock in và out, ký xác nhận (`POST /api/timesheets/:p/signoff`, gắn
     với `payload_hash` và `expected_version` đã xem, 201), sửa hàng loạt kỳ cũ có lý do, PUT trường ngày và POST
     phiên mới của trình sửa, và đổi nhãn một ngày (ô chọn nhãn so với thanh hàng loạt một ngày của 014bd47) gửi
     cùng đường dẫn và body; body nghỉ phép cho 0, 45, 150, 240, 480 và 1440 phút như nhau.
  2. Client không tính phút nghiệp vụ: quét 25 file client đổi từ 014bd47 thấy 35 chỗ, trùng từng dòng với danh
     sách đã ghi ở edaaa85; các chỗ có phép tính là đơn vị nhập nghỉ phép (`leaveInputModel.ts:37-38,55,65`), đếm
     dòng nghỉ (`sheetModel.ts:160`) và hiệu OT-leave có từ 014bd47 (`sessionModel.ts:390`), còn lại là chữ thuộc
     tính JSX; Overtime Total là `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:288`).
  3. A-01 vẫn đóng: ở cả ba bố cục 12 lần nhập nghỉ phép sai dạng hoặc ngoài khoảng bị từ chối với thông báo và
     `aria-invalid` chỉ trên ô sai, không PUT và không lưu gì (36 lần từ chối, 0 PUT); 014bd47 từ chối các dạng sai
     bằng kiểm tra gốc của trình duyệt.
  4. R-07: ba phiên LA (23:00-23:50, 00:20-01:10, 22:00-02:00+1) xem ở America/Los_Angeles, Asia/Tokyo,
     Pacific/Kiritimati, Pacific/Pago_Pago và Asia/Ho_Chi_Minh: mỗi phiên ở yên ngày kế toán đã lưu, giờ và dấu ngày
     bắt đầu bằng oracle, 14 ngày, ô OT và tổng giống nhau, thanh kỳ ghi "Times in <zone>", dòng hạn bằng chữ vẫn là
     "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)", giờ hạn trong ghi chú múi giờ bằng oracle của `due_at_utc`
     ở múi giờ đang xem (ví dụ "Wed 10/14/2026, 09:00" ở Tokyo, "Tue 10/13/2026, 13:00" ở Pago Pago), và trang
     Review hiện cùng giờ theo múi giờ báo cáo.
  5. AC-04 ở từng bố cục: ô chọn nhãn kỳ cũ chỉ preview, cần lý do và commit kèm lý do; Save của trình sửa chờ lý
     do và PUT mang lý do; cả hai lý do có trong `/api/history`; ô chọn nhãn dừng khi phiên bản cũ; trường ngày mở
     qua "Open a day" từ chối lưu phiên bản cũ; xác nhận nghỉ một chạm gửi phiên bản đã tải và bị từ chối vì cũ;
     Delete rồi Escape không xóa gì; xung đột cần xác nhận và gửi `confirm_conflicts`. Hỏi DST fold/gap và qua đêm
     đạt trong e2e bắt buộc.
  6. AC-16/AC-01 ở từng bố cục: người được chia sẻ chỉ xem không có Open a day, Change several days, clock, ô chọn
     nhãn, checkbox, Edit, dải chữ ký, liên kết review hay ảnh, có 14 nút "View", trình sửa chỉ đọc không có ô nhập
     và không có request ngoài `/api/shared/<owner>/` (cộng share và auth); người được chia sẻ quyền sửa chỉ ghi qua
     `/api/shared/<owner>/` (ô chọn nhãn, trình sửa, Open a day ở 320 px trên điện thoại) và lịch sử của chủ ghi tên
     người đó; người dùng thứ ba không thấy gì và nhận 404 cho timesheet, ngày, PUT ngày và PUT phiên được chia sẻ.
  7. Riêng tư và PDF: trang Timesheet trước và sau khi ký có 0 ảnh, 0 nền CSS url và 0 request `/api/signatures`,
     ngày ký ở dải chữ ký bằng oracle theo múi giờ báo cáo; trang Review có đúng một ảnh chữ ký ngoài bảng. Mã PDF và
     `pdf-visual.spec.ts` không đổi từ 014bd47 và server đã build giống từng byte; pdf-visual (2, desktop), review
     và submission e2e đạt (AC-06, AC-07, AC-10).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Info, không đổi) GHSA-68fv-2mgg-jv7q trong
  `source-map-js` chỉ dùng cho dev (vite -> postcss); `--omit=dev` sạch; file lock không đổi từ 014bd47. (R5, Info,
  không đổi, không ảnh hưởng vùng A) Trên điện thoại 390x844, thanh chủ sở hữu của người chỉ xem nằm ở 122.8-323.7 px
  và dòng ngày đầu kết thúc ở 849.7 px, dưới đỉnh thanh tab (788 px), như ở edaaa85. (N3, Info, vùng B, không do
  FIX6) Khi con trỏ nằm trên một điều khiển đang focus, nét hover thay vòng focus vì selector hover cụ thể hơn:
  `button:hover:not(:disabled)` (`styles.css:496-500`) thắng `button:focus-visible` (`:506-508`),
  `.sheet .label-trigger:hover:not(:disabled)` (`:2216-2220`) thắng `.sheet .label-trigger:focus-visible`
  (`:2222-2225`); thấy trên điện thoại với Commit changes (hover true) ở cả hai bản build (`36b-focus-compare.txt`);
  FIX6 không đổi rule hover nào; điều khiển vẫn hiện và dùng được. Nút nhãn trong ô giữ nét focus inset 2px màu nhấn
  riêng, không dùng token chung. Vùng B có thể xét cả hai. (N4, Info, hình thức)
  `tests/client/periodBarModel.test.ts:3` thiếu dấu cách sau một dấu phẩy trong danh sách import; lint vẫn đạt.
- Gate chưa chạy/bị chặn và lý do: không có cho vùng A.
- Xử lý phát hiện trước: WP5-UX-A-01 vẫn đóng (mục 3). Rủi ro của A4: R1 không đổi; R5 không đổi (Info, không ảnh
  hưởng vùng A). WP5-UX-AUDIT-A2, -A3, -A4 và WP5-RECHECK được audit này thay thế cho vùng A.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chấp nhận 5e104e1; WP5 chỉ được nghiệm thu lại nếu lần
  kiểm lại vùng B song song (WP5-UX-AUDIT-B5) cũng đạt. Không liên quan phép của chủ, gửi thật hay pilot.
- Một bước/prompt tiếp: coordinator ghi nhận PASS này (cùng WP5-UX-AUDIT-B5) và, nếu cả hai đạt, nghiệm thu lại
  WP5 ở 5e104e1 qua committer.

Ghi chú khi chạy: chỉ dùng Git Bash; không pipe vào head hay tail và không đưa script qua stdin; mọi file đều ghi
trong thư mục task hoặc thư mục bằng chứng. Một sơ suất: một vòng chờ của tôi dùng `2>/dev/null` cho lệnh grep một
file trong thư mục task (không ghi file nào). Hai lần chạy đầu của probe focus thất bại do thiết kế probe (nút bị
vô hiệu không nhận focus được; điều khiển nằm dưới header dính bị tính là bị che) và đã được sửa trước lần chạy được
ghi lại. Fixture e2e tự chọn cổng loopback trống; tôi không khởi động server riêng; không còn gì đang chạy.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A5.md](WP5_UX_REVIEW_A5.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A5 lần 1; agent reviewer
  ac1e9366098766ce1 (board); tác giả WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02 aa193ddfa339be714,
  T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06 a0db965135fda0d4e, FIX1
  ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4 afb8ef164774cd30d, FIX5 abe661ea7cfd0b8f0,
  FIX6 aa20021a02e3399e7.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer này không viết gì trong vòng thiết kế lại và
  không chạy gate hay audit nào trước đó của vòng; chỉ viết review này, bản dịch, phần Results của task và
  `evidence/WP5-UX-AUDIT-A5/`; các export và bản build của 5e104e1, edaaa85 và 014bd47 cùng mọi probe chạy trong thư
  mục task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: 07c3ca00 trước và sau; WP5-UX-REGATE4 PASS trên cùng freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A5.md` (mới); `WP5_UX_REVIEW_A.md`,
  `WP5_UX_REVIEW_A2.md`, `WP5_UX_REVIEW_A3.md` và `WP5_UX_REVIEW_A4.md` giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không có phát hiện; vùng A không cần task sửa.
