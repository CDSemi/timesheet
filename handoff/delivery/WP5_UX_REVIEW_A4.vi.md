# Review độc lập: thiết kế lại UI WP5, vùng A (kiểm lại sau WP5-UX-FIX5)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi
  giờ, đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09; task WP5-UX-AUDIT-A4 lần 1; model tự báo
  claude-opus-5-5, không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN,
  T02, T04 và FIX5; FIX2, FIX3 và FIX4 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  edaaa852370128ca9bdf206d730f3849346ba994, digest
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873 (789 file, không tính `handoff/`),
  ghi đầu tiên và ghi lại lúc kết thúc. HEAD = origin/main = edaaa85; không có commit chưa push. Bản
  export sạch bằng `git archive` của edaaa85 có đúng 789 đường dẫn và blob của cây (danh sách bằng nhau,
  diff exit 0) và không đổi sau mọi kiểm tra.
- Quyết định: **PASS**
- Phạm vi thật đã xem/chạy: (1) chứng minh delta `a2ea7a4..edaaa85` (FIX5): so sánh tĩnh `DayEditor.tsx`,
  diff CSS theo từng rule, kiểm dòng test được giữ nguyên, và probe lúc chạy với mười hai kịch bản (cộng
  R2) lưu, commit, clock out, xác nhận nghỉ và xóa sau một lần chuyển modal/không modal bị hoãn, trong đó
  `MutationObserver` của trình sửa được theo dõi, mọi request được ghi lại và so với bản đối chứng không
  chuyển và với bản build 014bd47; (2) các kiểm tra bắt buộc vùng A trên export sạch của edaaa85: ranh giới
  nghiệp vụ, chỗ gọi ghi và hàm dựng body so với 014bd47, body lúc chạy so với bản build 014bd47, phép
  tính phía client, A-01, R-07 bằng probe đổi múi giờ thiết bị, AC-04, AC-16/AC-01, riêng tư,
  PDF/AC-06/07/10, `npm test`, bảy spec e2e trên cả hai project và AC-13 một lần; (3) xét lại rủi ro R2 và
  R5 của A2 bằng tái hiện. Probe của A2/A3 được dùng lại làm phương pháp và viết lại; không lấy tóm tắt cũ
  nào làm bằng chứng.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A4/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của edaaa85, `npm run digest`, export sạch) và lúc kết thúc (băm lại export, ls-tree của HEAD, `scripts/source-digest.mjs`) | luôn là b7bbcbc0, 789 file; export không đổi; repository không đổi ngoài `handoff/` | `00-digest.txt` |
| `npm ci` (Node v24.21.0, cache trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, xem R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1820 test đạt | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0 | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual trên cả hai project | exit 0; 120 test: 105 đạt, 15 bỏ qua theo điều kiện project của spec, 0 lỗi (desktop 52 + 8 bỏ qua, mobile 53 + 7 bỏ qua; hai test B3-01 của FIX5 đạt trên desktop) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức cao (`source-map-js`, chỉ dev); file package không đổi từ 014bd47 | `06-npm-audit.txt`, `11-boundary.txt` |
| delta a2ea7a4..edaaa85 và chứng minh tĩnh | 6 file (+191/-13); `DayEditor.tsx` giống hệt ngoài effect chuyển chế độ và hàm phụ mới; `apply()` = thân effect cũ; CSS hai giá trị token; dòng spec được giữ; problems=0 | `10-delta.txt`, `12-delta-proof.txt` |
| ranh giới từ 014bd47; chỗ gọi; hàm dựng body | `src/server`, PDF, `api.ts`, package, cấu hình, scripts không đổi; `src/domain` chỉ thêm `formatHoursMinutes`; 66 khóa gọi ở cả hai commit; từ a2ea7a4 không chỗ gọi hay hàm dựng nào đổi | `11-boundary.txt`, `13-callsites.txt`, `14-body-builders.txt` |
| quét phép tính 25 file client đổi từ 014bd47 | chỉ có đổi đơn vị nhập giờ/phút nghỉ, đếm dòng nghỉ và hiệu OT-nghỉ đã có ở 014bd47; tổng lấy từ payload | `15-client-files.txt`, `16-client-arith.txt` |
| probe hoãn chuyển của tôi (desktop, theo dõi MutationObserver), hai lần | 13 đạt cả hai lần | `30-deferred-run1.txt`, `30-deferred-run2.txt`, `deferred-*.json.txt`, `r2-desktop.json.txt` |
| probe vùng A của tôi trên edaaa85 ở 1280, 1024 và 390 | 31 đạt, 26 bỏ qua theo thiết kế (các test hoãn chuyển chỉ cho desktop trong hai project kia) | `31-probe-edaaa85-run1.txt`, `*.json.txt`, `37-summary.txt` |
| cùng luồng trên bản build 014bd47 | 4 đạt | `20-export014-build.txt`, `32-probe-014bd47-run1.txt` |
| so sánh mọi body và chuỗi request | mismatches=0 | `36-compare.txt` |
| control điện thoại với token FIX5 ở 390/375/360/320 | 1 đạt (15 control mỗi bề ngang, 0 lỗi) | `33-probe-phone.txt`, `phone-controls-mobile.json.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **không có.**
- Chứng minh delta (phạm vi 1): việc hoãn của FIX5 chỉ đổi lúc trình sửa chuyển giữa dạng modal và không
  modal, không bao giờ đổi thứ được lưu.
  1. Chỉ sáu file đổi ngoài `handoff/`: `src/client/DayEditor.tsx` (+27/-6), `src/client/styles.css` (hai
     giá trị token), `tests/e2e/day-editor.spec.ts` (+120), `tests/e2e/timesheet.spec.ts` (+43/-3),
     `docs/04_UX_AND_SETTINGS.md` và bản `.vi.md` (dòng 55 mỗi file, chỉ câu chữ). Không gì trong
     `src/server`, `src/domain`, `src/client/api.ts`, `src/client/components`, PDF, `package*.json`, cấu
     hình hay `scripts/` thay đổi (`11-boundary.txt`).
  2. Tĩnh (`12-delta-proof.txt`): bỏ khối effect và hàm phụ mới `otherModalOpen` (`DayEditor.tsx:18-21`)
     thì hai file giống hệt (19268 ký tự). `apply()` (`DayEditor.tsx:96-104`) chạy đúng các câu lệnh của
     thân effect cũ. Nó chạy ngay khi trình sửa chưa mở hoặc không có `dialog:modal` nào khác
     (`:105-108`), nên lần mở đầu và mọi lần chuyển khi không có hộp thoại modal khác vẫn như trước (đối
     chứng A0 và A1 không tạo observer nào). Chỉ khi trình sửa đang mở và có hộp thoại modal khác thì nó
     mới chờ (`:109-115`). Mã thêm vào không gọi request, hàm set state, callback prop (`onChanged`,
     `onClose`, `onSaved`, `onStale`), submit, click, load, lý do hay timer; danh sách phụ thuộc vẫn là
     `[modal]`. Observer tự ngắt trước `apply()` và phần dọn của effect ngắt nó khi `modal` đổi lại hoặc
     trình sửa bị gỡ (`:111`, `:115`). `element.close()` chỉ phát sự kiện `close` của chính trình sửa, mà
     trình sửa không có handler cho sự kiện đó (chỉ có `onCancel`, `:244-247`); đóng rồi hiện lại một
     dialog giữ nguyên DOM và state React; không form nào của trình sửa lưu khi mất focus (`onBlur` duy nhất
     là danh sách nhãn, `SheetWeekTable.tsx:145-147`, chỉ đóng danh sách).
  3. Lúc chạy (trình duyệt desktop; ghi mọi lệnh ghi, mọi request `/api`, lỗi trang và từng lần observe và
     disconnect của observer; `36-compare.txt`, `deferred-*.json.txt`):
     - A (1280 sang 1024 khi hộp review nhãn đang mở, Escape, Save): trong lúc hoãn và sau khi chuyển, Label,
       WFH, nghỉ 2 h 30 m vacation và ghi chú đã gõ không đổi; đúng một observer, bị ngắt khi review đóng;
       việc chuyển không gửi gì; Save gửi một `PUT /api/days/<date>` có đường dẫn và body bằng đối chứng A0
       (không đổi kích thước), đối chứng A1 (trình sửa modal ngay từ đầu) và, trừ nội dung ghi chú, bằng body
       của 014bd47 cho cùng ngày và cùng số nghỉ. Cả 17 request `/api` của A bằng A0 theo đúng thứ tự.
     - F (1280 sang 1024 rồi về 1280): observer thứ nhất bị phần dọn ngắt, observer thứ hai bị ngắt khi
       review đóng; trình sửa vẫn không modal; cùng PUT; chuỗi request bằng A0.
     - B (kỳ cũ, review cần lý do được commit trong lúc hoãn): Commit bị khóa đến khi có lý do riêng của
       review; commit mang `reason`; trình sửa giữ lý do và ghi chú riêng của nó; PUT của nó mang lý do của
       nó; cả hai lý do có trong `/api/history`.
     - C (ngày bị đổi ở nơi khác trong lúc hoãn): Save gửi `expected_version` đã tải (null); server từ
       chối, hiện "This day changed since it was loaded", version và ghi chú vẫn là của server, Reload day
       hiện chúng.
     - D (bước xung đột trong lúc hoãn): Confirm and commit bị khóa đến khi xác nhận; commit mang
       `confirm_conflicts: true`; phiên được giữ; phiên lưu sau đó bằng đối chứng D0 và 014bd47 (che ngày).
     - E (hộp clock-out là hộp modal khác): body clock-out (`breaks: []`, `breaks_confirmed: true`,
       `expected_version`) có khóa và giá trị như 014bd47; trình sửa giữ ghi chú.
     - G (trình sửa bị gỡ do đổi route trong lúc hoãn): observer đã bị ngắt; một dialog mở, đóng và bị gỡ
       sau đó không kích hoạt gì; một ngày khác mở ở 1024 không tạo observer và lưu một PUT; ghi chú đã gõ ở
       ngày đầu không bao giờ được ghi.
     - H so với H0: xác nhận nghỉ một chạm (`PUT /api/sessions/:id`, version đã tải) và một lần xóa sau khi
       hoãn chuyển gửi cùng body như khi không hoãn; 22 = 22 request theo đúng thứ tự.
     - 0 lỗi trang không bắt được trong cả mười hai kịch bản.
  4. CSS: chỉ `--date-field-min` 9.5rem thành 8.5rem và `--open-day-label-min` 15.25rem thành 14.25rem
     (`styles.css:62-63`), chỉ dùng làm `flex-basis` và `min-width` của `.tools .open-day label` và
     `min-width` của `.tools .open-day input` trong `@media (max-width: 767px)` (`styles.css:1091-1103`):
     không có display, visibility, opacity, position, overflow, clip, height, z-index, pointer-events,
     order hay transform. Các selector chỉ khớp form `OpenDay` (`components/OpenDay.tsx:13`), chỉ render khi
     có quyền sửa (`TimesheetScreen.tsx:378`). Ở 390, 375, 360 và 320 px, clock, ô và nút Open a day,
     Review & sign off, nút chuyển kỳ, Show details, Change several days, nút Edit của một ngày, bộ chọn
     nhãn, Save và Close của trình sửa, Review conflicts, ô xác nhận và Confirm and commit đều có, hiển thị,
     nằm trong bề ngang và không bị che; không cuộn ngang; Open day mở trình sửa modal cho ngày đã nhập và
     không ghi gì. Thay đổi này không thể ẩn hay gỡ control sửa, clock, lý do hay xác nhận nào.
  5. Test: cả 1252 dòng của `day-editor.spec.ts` ở a2ea7a4 được giữ đúng thứ tự (+120: hai test B3-01 cho
     desktop). Trong `timesheet.spec.ts` ba dòng đổi, đều trong test bề rộng ô ngày "Open a day" trên điện
     thoại (vòng bề ngang thêm 375; mức sàn cố định `>= 135` của token và kiểm `scrollWidth <= clientWidth`
     được thay bằng kiểm theo nhu cầu đo được), là assertion bố cục của vùng B. Không assertion nào của vùng
     A bị bỏ hay làm yếu.
- Đạt ở vùng A trên edaaa85 (tôi tự tái hiện, ngoài các kiểm tra bắt buộc; `37-summary.txt`):
  1. Endpoint và body so với 014bd47: không có endpoint mới; mọi lời gọi ghi của 014bd47 giữ nguyên văn bản;
     chỗ gọi duy nhất thêm trong vòng này là preview `POST /days/batch` một mục của bộ chọn nhãn
     (`TimesheetScreen.tsx:302`) và `PUT /sessions/:id` một chạm (`DayEditor.tsx:214`, dựng bằng
     `quickBreaksRequest`); `buildSessionRequest`, `buildClockOutRequest`, `batchEntries`, `modeEndpoint`,
     `buildSubmitBody`, `isStaleVersion` và `api` giống hệt, `buildDayEntryRequest` chỉ khác ở phần đọc giờ
     nghỉ. Lúc chạy so với bản build 014bd47 (desktop, 1024 và điện thoại): body nghỉ cho 0, 45, 150, 240,
     480 và 1440 phút, clock in và out, lệnh ký (`POST /api/timesheets/:p/signoff`, gắn với `payload_hash`
     và `expected_version` đã review, 201), batch kỳ cũ có lý do, PUT trường ngày và POST phiên mới của
     trình sửa đều giống; các lần lưu sau khi hoãn chuyển cũng vậy (mục 3 ở trên).
  2. Client không tính phút nghiệp vụ: lần quét chỉ thấy `leaveInputModel.ts:37-38,55,65` (đơn vị nhập),
     đếm dòng nghỉ (`sheetModel.ts:160`) và hiệu OT-nghỉ đã có ở 014bd47 (`sessionModel.ts:390`); Overtime
     Total là `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:288`) và tổng ở Review là
     `payload.totals.credited_minutes` (`ReviewDays.tsx:44`).
  3. A-01 vẫn đóng: ở cả ba bố cục, 12 mục nhập sai dạng hoặc ngoài khoảng bị từ chối với thông báo
     `role="alert"` và `aria-invalid` chỉ trên ô sai, không có PUT và không lưu gì (36 lần từ chối, 0 PUT);
     014bd47 từ chối các mục sai dạng bằng kiểm tra gốc của trình duyệt.
  4. R-07: ba phiên LA (23:00-23:50, 00:20-01:10, 22:00-02:00+1) xem ở America/Los_Angeles, Asia/Tokyo,
     Pacific/Kiritimati, Pacific/Pago_Pago và Asia/Ho_Chi_Minh ở 1280, 1024 và 390: mọi phiên ở yên ngày kế
     toán đã lưu, giờ và dấu ngày bắt đầu khớp oracle Intl, 14 ngày, ô OT và Overtime Total giống hệt, thanh
     kỳ ghi "Times in <zone>" và chỉ hiện ghi chú múi giờ khi hai múi khác nhau, và Review hiện cùng giờ
     theo múi báo cáo.
  5. AC-04 ở mỗi bố cục: chọn nhãn ở kỳ cũ chỉ preview, cần lý do và commit kèm lý do; Save của trình sửa
     bị khóa đến khi có lý do và PUT mang lý do; cả hai lý do có trong `/api/history`; bộ chọn nhãn dừng khi
     version cũ; form trường ngày mở qua "Open a day" từ chối lưu khi version cũ; xác nhận một chạm gửi
     version đã tải và bị từ chối vì cũ; Delete rồi Escape không xóa gì; xung đột cần xác nhận và gửi
     `confirm_conflicts`. Các nhắc DST fold/gap và qua đêm đạt trong e2e day-editor bắt buộc.
  6. AC-16/AC-01 ở mỗi bố cục: người được chia sẻ chỉ xem không có Open a day, Change several days, clock,
     bộ chọn nhãn, checkbox, Edit, dải chữ ký, liên kết review hay ảnh; có 14 nút "View", trình sửa chỉ đọc
     không có ô nhập, và không có request nào ngoài `/api/shared/<owner>/` (cộng share và auth). Người được
     chia sẻ quyền sửa chỉ ghi qua `/api/shared/<owner>/` (preview và commit của bộ chọn nhãn, PUT ngày của
     trình sửa, và một PUT ngày thứ hai qua hàng "Open a day", trên điện thoại 320 px với token FIX5); lịch
     sử của chủ ghi tên người được chia sẻ. Người dùng thứ ba không thấy gì và nhận 404 cho timesheet chia
     sẻ, ngày, PUT ngày và PUT phiên của chủ.
  7. Riêng tư và PDF: trang Timesheet trước và sau khi ký có 0 ảnh, 0 nền CSS url và 0 request
     `/api/signatures`; dải chữ ký hiện "Signed by ..." và ngày ký theo múi báo cáo khớp oracle; Review có
     đúng một ảnh chữ ký (`/api/signatures/<id>`) ngoài bảng. Mã PDF và `pdf-visual.spec.ts` không đổi từ
     014bd47 và pdf-visual đạt (2 test, desktop; project điện thoại bỏ qua theo thiết kế); e2e review và
     submission đạt (AC-06/AC-07; hàm dựng body ký và server không đổi).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Info) không đổi: cảnh báo `source-map-js`
  GHSA-68fv-2mgg-jv7q chỉ ở dev (vite -> postcss), `--omit=dev` sạch, lock không đổi từ 014bd47. (R2, xét
  lại: FIX5 đã đóng) Đã tái hiện ở 1280 -> 1024 với hộp review của bộ chọn nhãn kỳ cũ mở trên trình sửa
  không modal (`r2-desktop.json.txt`): review vẫn modal, ở trên cùng và giữ focus, ô lý do nhận focus và
  Commit bị khóa khi chưa có lý do; Escape đầu tiên chỉ đóng review, trình sửa thành modal với focus ở tiêu
  đề và ghi chú chưa lưu vẫn còn; Escape thứ hai đóng trình sửa (Escape không bao giờ lưu, nên ghi chú bị bỏ
  như mọi lần Escape); chỉ có preview được gửi và ngày kỳ cũ không đổi. (R5, Info, không đổi, không ảnh
  hưởng vùng A) Trên điện thoại 390x844, thanh chủ sở hữu của người chỉ xem (122.8-323.7 px) nằm trọn
  trong màn hình đầu và dòng ngày đầu kết thúc ở 849.7 px, dưới mép trên thanh tab (788 px), giống a2ea7a4;
  màn đó không có gì ghi được và token FIX5 chỉ định dạng form Open a day, thứ người chỉ xem không có. (N1,
  Info, ngoài vùng A, không do FIX5) Sau khi lưu trường ngày trong trình sửa modal ở 1024 px, focus nằm ở
  BODY (`deferred-G.json.txt`, mục "later"), có lẽ vì nút Save đang giữ focus bị khóa trong lúc lưu
  (`DayFieldsForm.tsx:177`, không đổi từ a2ea7a4); vùng B có thể kiểm focus sau khi lưu. (N2, Info, ngoài
  vùng A) Thay đổi O-5 trong `timesheet.spec.ts` thay mức sàn bề rộng cố định bằng nhu cầu đo được; độ mạnh
  của nó do vùng B đánh giá. Một lần chuyển bị hoãn, như mọi lần chuyển, đưa focus về tiêu đề trình sửa
  (quan sát của chính FIX5); giá trị đã gõ vẫn còn và không gì bị ghi.
- Gate chưa chạy/bị chặn và lý do: không có cho vùng A.
- Xử lý phát hiện trước: WP5-UX-A-01 vẫn đóng (mục 3). Rủi ro của A2/A3: R1 không đổi; R2 đã được FIX5 đóng;
  R5 không đổi (Info, không ảnh hưởng vùng A). WP5-UX-AUDIT-A2 (589bcff), WP5-UX-AUDIT-A3 (a2ea7a4) và
  WP5-RECHECK (014bd47) được audit này thay thế cho vùng A.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chấp nhận edaaa85; WP5 chỉ được chấp nhận lại
  nếu lần kiểm lại vùng B song song (WP5-UX-AUDIT-B4) cũng đạt. Không liên quan phép của chủ, gửi thật hay
  pilot.
- Một bước/prompt tiếp: coordinator ghi PASS này (cùng WP5-UX-AUDIT-B4) và, nếu cả hai đạt, chấp nhận lại
  WP5 tại edaaa85 qua committer.

Ghi chú lúc chạy: chỉ dùng Git Bash; không pipe vào head hay tail, không script đưa qua stdin, không
`/dev/null`; mọi file đều ghi trong thư mục task hoặc thư mục bằng chứng. Fixture e2e tự chọn cổng
loopback trống; tôi không khởi động server nào của riêng mình. Mỗi thư mục làm việc của harness đã bị xóa
sau khi server của nó thoát; không để lại gì đang chạy.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A4.md](WP5_UX_REVIEW_A4.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A4 lần 1; agent reviewer
  a093657a860461489 (board); tác giả WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2, FIX2 a4890095edaa146dc, FIX3 a5af4bec2893ab938, FIX4
  afb8ef164774cd30d, FIX5 abe661ea7cfd0b8f0.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer này không viết gì trong vòng thiết kế
  lại và không chạy gate hay audit trước nào của vòng này; chỉ viết review này, bản dịch, phần Results của
  task và `evidence/WP5-UX-AUDIT-A4/`; các export và bản build của edaaa85, a2ea7a4 và 014bd47 cùng mọi
  probe chạy trong thư mục task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: b7bbcbc0 trước và sau; WP5-UX-REGATE3 PASS trên cùng
  freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A4.md` (mới);
  `WP5_UX_REVIEW_A.md`, `WP5_UX_REVIEW_A2.md` và `WP5_UX_REVIEW_A3.md` giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không có phát hiện; vùng A không cần task sửa.
