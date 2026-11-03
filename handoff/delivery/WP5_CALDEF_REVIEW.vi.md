# Review độc lập: WP5-CALDEF-AUDIT (R-UX5I2-3, mặc định theo lịch đã đổi dưới một editor đang mở)

Bản dịch của [WP5_CALDEF_REVIEW.md](WP5_CALDEF_REVIEW.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn, ngày, reviewer, model.** WP5, 2026-11-03. timesheet-auditor trong context mới; model tự báo `claude-opus-5-5`, yêu cầu
  opus/xhigh (effort không quan sát được). Model tác giả mạnh nhất trên bảng là `claude-opus-5-5` (`01-author-models.txt`), nên auditor
  không yếu hơn tác giả nào.
- **Commit và digest đã kiểm.** `reviewed_commit` = b810ba942c608e058bd8c146de6f076734c48bf2, commit WP5-CALDEF-FIX2-FREEZE và
  `freeze_commit` của WP5-CALDEF-REGATE. Commit đã push: HEAD = origin/main = b810ba9 lúc đầu và lúc cuối, và không path nào ngoài
  `handoff/` khác giữa target và HEAD. Source digest `59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a` (885 file),
  bằng nhau trước và sau ở ba dạng: bản export sạch, `git ls-tree` (target và HEAD) và `npm run digest` trong repository. Mọi kiểm tra bắt
  buộc chạy trong một bản export `git archive` sạch của target; probe và mutant chạy trong các bản sao riêng. Source đầy đủ: `git status`
  ngoài `handoff/` trống trước và sau.
- **Quyết định: PASS.** Quy tắc của chủ cho R-UX5I2-3 đứng vững trên mọi đường trong phạm vi, hợp đồng server và client đứng vững trước
  probe và mutant của tôi, tài liệu khớp với bản build trừ hai sơ suất tài liệu mức Thấp (F-CALDEF-1, F-CALDEF-2), và mọi kiểm tra bắt
  buộc đều đạt trong một bản export sạch. Hai lỗi đó chỉ thuộc tài liệu: theo quy tắc 14 của AGENTS, chúng được sửa bằng một lần
  duyệt-và-sửa tài liệu, không cần gate hay audit, và chúng không đổi sản phẩm hay chặn lần nghiệm thu này. **R-UX5I2-3 đã đóng.** PASS
  này nghiệm thu lại WP5 trên b810ba9 / 59e2ec3f và thay WP5-UX5-RECHECK-RN (PASS trên a54061f / 690fd8fd) làm lần nghiệm thu hiện hành.

## Phạm vi đã thật sự xem và chạy

Đã đọc: brief, AGENTS.md (từ đĩa), tài liệu 08, rủi ro (INT2 R-UX5I2-3, INT3 "An administrator's calendar change"), kế hoạch và bản
duyệt kế hoạch, phần Results của các task FIX, DOCS, SMOKE, GATE, DIAG1, FIX2 và REGATE, và toàn bộ diff a54061f..b810ba9 ngoài
`handoff/`: 14 file mã nguồn, 8 file test, script smoke và 6 cặp tài liệu của vòng này (cùng các cặp AGENTS và tài liệu 08 của commit
chỉ chứa tài liệu 5b2f287). Mọi kế hoạch, báo cáo và kết quả gate đều được coi là lời khẳng định; mỗi khẳng định dùng dưới đây đều đã
được đối chiếu với mã hoặc chạy lại.

Tôi đã chạy: các kiểm tra bắt buộc (mục 9); 10 probe API trong một bản sao sạch dưới hai múi giờ tiến trình; 11 probe trình duyệt trên
server riêng (8 desktop, 3 điện thoại), trong đó có 24 lần quét axe-core 4.14.0; chính spec e2e của vòng này qua một nửa đêm LA và vào
ngày kết thúc DST; `classic-scrollbar.spec.ts` ở một thời điểm ngăn kéo neo trái và một thời điểm neo phải; một chứng minh độc lập cho
script smoke trên 70.080 thời điểm; so sánh `dist/` của bản build sạch với a54061f; và 12 mutant của riêng tôi (7 server, 5 client).

## 1. Quy tắc của chủ trên mọi đường đi

Quy tắc (docs/10, quyết định của chủ 2026-11-02): một lần lưu không bao giờ ghi một loại đè lên mặc định theo lịch đã đổi kể từ khi
người dùng thấy nó, trừ khi người dùng đã chọn "Save {category} anyway"; "Use {new default}" thật sự lấy mặc định mới.

| Đường đi | Bằng chứng (suite = test của vòng; E/A = probe của tôi) | Kết quả |
|---|---|---|
| Ngày chưa có entry, ngăn kéo desktop | W3 cả hai lựa chọn; E1 (dạng E2 của INT2: không gõ gì, tab quay lại, không Check in); E5 | bị từ chối kèm thông báo; "Use" để ngày tiếp tục theo lịch (không có dòng), "Save Worked anyway" ghi Worked; E1: sau khi tab quay lại, biểu mẫu đang giữ vẫn hiện Worked (FIX18 giữ ngày đang giữ), Save gửi `default_category: "Worked"` và bị từ chối |
| Entry theo mặc định (do Check in hoặc phiên tạo) | W1, W2, W2b, W2c, W12-W15; E6, E8 | bị từ chối; cả hai lựa chọn đều chạy; lần từ chối không chạm vào entry và phiên bản của nó (`dayOf` sau 409: version 1, ghi chú trống) |
| Entry explicit | W6, I4, I11b | không bao giờ bị từ chối, kể cả với `default_category` cũ |
| Sheet điện thoại | W8, W1-W3 và W7 trên project điện thoại; E7 | thông báo nằm trong sheet, có tiêu điểm và trong tầm nhìn; các nút 44px; sau "Use" tiêu điểm ở Category và dòng trạng thái trong tầm nhìn |
| Khung nhìn sửa được chia sẻ | W10 (Day editor, cả hai lựa chọn), I12 (PUT trên lịch thứ hai); A3 (batch chia sẻ, người được chia sẻ ở lịch thứ hai); E3 (bộ chọn chia sẻ) | lịch của chủ quyết định; "Reload period" được đề nghị trong khung nhìn chia sẻ và lần chọn tiếp theo lưu cho chủ |
| Bộ chọn nhãn | W9a; E2 (ngày có giờ đã ghi: chọn Vacation bị từ chối trong hộp xem lại, "Commit changes" bị khóa, Cancel đề nghị "Reload period", ô sau khi tải lại hiện Holiday, lần chọn tiếp mở bước xung đột và lưu Vacation) | bị từ chối, không ghi gì (ngày vẫn là Holiday theo mặc định); lần commit thứ hai nêu `default_category: "Holiday"` cùng `confirm_conflicts` và ghi Vacation |
| "Change several days" | W9b, W9c (một commit chạy đua với import) | bị từ chối, không ghi gì; thông báo của trang đề nghị "Reload period"; sau đó batch commit được |
| Mặc định đổi lần nữa giữa thông báo và "Save anyway" | W12; E6 (lần đổi sau "Use") | lại bị từ chối, thông báo nêu mặc định mới nhất (Holiday thành Shutdown) |
| Loại được lưu bằng mặc định mới (MF1) | W13, I14, I8 | được chấp nhận, không thông báo |
| Một import bị hoàn tác trước lần lưu | E5 (UI), A2 (API) | không thông báo, lần lưu được chấp nhận (không từ chối sai) |

**Các quyết định phạm vi của điều phối viên giữ đúng ý của chủ.** Thông báo hai nút nằm ở nơi loại và ghi chú đã gõ đang bị đe dọa (Day
editor: ngăn kéo, sheet điện thoại và khung nhìn sửa được chia sẻ là một thành phần, `DayFieldsForm`). Với bộ chọn và "Change several
days", người dùng được báo trong hộp xem lại ("calendar default changed: The calendar default is now Holiday (was Worked)") và không có
gì được ghi; "Reload period" là "dùng mặc định mới" và một lần chọn trên bảng đã tải lại là "lưu đè lên, lần này là đã thấy". Cả hai lựa
chọn của chủ đều tới được trong ứng dụng trên mọi đường tôi đã chạy (W9a/W9b, E2, E3), và không đường nào ghi một loại đè lên mặc định đã
đổi mà người dùng không thấy. Sự vòng vèo (Cancel, Reload period, chọn lại; batch phải chọn lại các ngày vì Reload xóa lựa chọn) là một
chi phí về tiện dụng, được ghi là quyết định mà chủ có thể phủ quyết trong docs/10; tôi không tính đó là lỗi. Trường tùy chọn là đường
duy nhất không có thông báo, theo quyết định của điều phối viên: bên gọi bỏ `default_category` thì không bị kiểm (A5: PUT và batch đều
200, audit là sự kiện tạo với before = null). Điều này được ghi trong docs/03, docs/10 và docs/12 là rủi ro còn lại đã chấp nhận.

## 2. Hợp đồng của server

- **Trường và thân.** `default_category` là `dayCategory.nullable().optional()` trong cả hai schema chặt (`schemas.ts:91`, `:102`,
  `:123`); giá trị lạ và khóa thừa là 422 (I8). Thân 409 của PUT là `{error: {code: "default_changed", message, details: {work_date,
  expected_default, current_default}}}` (`errors.ts:33-45`); đúng ba khóa này (phép kiểm khóa của I12 và phép so toàn bộ details
  của A1 đều bắt mutant S6 của tôi). Details của preview và commit batch chỉ mang `expected_default`/`current_default` và
  `work_dates`/`changes` (A3).
- **Quy tắc.** `defaultChangeOf` (`timesheetCommands.ts:302-313`): chỉ từ chối khi có trường này, ngày chưa có entry hoặc có entry theo
  mặc định, lịch phân loại được ngày đó, mặc định đã hiện khác mặc định hiện tại, và loại được lưu cũng khác nó. Đọc đúng: mặc định hiện
  tại của một entry theo mặc định là của lịch bây giờ, không phải bản chụp đã lưu (mutant S5 của tôi bị I2 bắt).
- **Thứ tự kiểm.** PUT (`applyDayEntryChange`, `:358-407`): 409 kỳ đã nhập và 422 lý do (`prepareEdit`), 422 nghỉ phép,
  `stale_version`, rồi `default_changed`, rồi ghi. Preview batch theo từng entry (`dayEntries.ts:121-137`): stale, invalid,
  default_changed, rồi create/update/unchanged; `can_commit` là false (mutant S4 của tôi bị I9 bắt). Commit batch (`:206-244`, một giao
  dịch IMMEDIATE): stale, invalid, lý do, default_changed (details `work_dates` và `changes`), xung đột, rồi ghi; tất cả hoặc không gì
  (I10, I15). Thứ tự theo từng entry "stale trước default_changed" không được test nào ghim (mutant S1 của tôi sống sót; hệ quả thấy
  được chỉ là mã 409 nào trả về, và trang xử lý hai mã như nhau).
- **Bên trong giao dịch ghi.** `upsertDayEntry` nạp phạm vi bên trong `writeTransaction` (`timesheetCommands.ts:451-452`) và commit batch
  bên trong giao dịch của nó (`dayEntries.ts:208-209`); `commitHolidayImport` cũng là IMMEDIATE. better-sqlite3 chạy mỗi giao dịch
  đồng bộ, nên trong một tiến trình server, một lần lưu và một lần import không thể đan xen: A7 gửi mỗi lần lưu cùng lúc với một import
  và mọi lần lưu được chấp nhận đều được audit trước phiên bản lịch. Đưa việc đọc phạm vi ra ngoài giao dịch (mutant S3 của tôi) không
  quan sát được trong một tiến trình; không đường chạy nào trong tiến trình thứ hai đổi mặc định (CLI chỉ khởi tạo lịch một lần).
- **Route chia sẻ và không rò rỉ.** Mount chia sẻ đặt `subject` là chủ (`routes/api.ts:59-68`); PUT và batch đọc phạm vi của chủ. A3:
  người được chia sẻ ở lịch thứ hai bị từ chối theo lịch của chủ qua chia sẻ, còn batch và PUT của chính người đó trên lịch của họ được
  chấp nhận; lần xác nhận là sự kiện tạo cho chủ, ghi người làm là người được chia sẻ. Người chỉ được xem nhận 403 `grant_scope` cho cả
  preview và commit (A4). Details chỉ chứa ngày và các mặc định của chính chủ.
- **Bên gọi bỏ trường này** (A5) ghi đè mặc định đã đổi, qua PUT và batch, audit là sự kiện tạo với before = null. Đây là rủi ro còn lại
  mà điều phối viên đã chấp nhận (docs/10 "Trường `default_category` là tùy chọn"); client đi kèm luôn gửi nó (`sessionModel.ts:477`,
  `labelPickerModel.ts:45`, `dayModel.ts:122`).

## 3. Client

- **Mặc định được ghi nhớ lúc mount** (`DayFieldsForm.tsx:70`, state, không bao giờ là prop hiện hành) trước mọi nhánh làm đổi ngày của
  editor: follow của FIX18 chỉ nhận lần đọc mới khi `sameDayFields` đúng, hàm này so loại, nên mặc định đã đổi (loại của ngày chưa có
  entry hoặc theo mặc định) không bao giờ được nhận dưới phiên bản mới (W5, E1); nhánh giữ của FIX19 giữ loại và entry cũ và biểu mẫu giữ
  mặc định cũ, nên lần lưu bị từ chối (W4a; M10 của vòng này bắt biến thể đọc prop hiện hành); nhánh khởi động lại của FIX19, "Reload
  day", làm mới sau nhãn hoặc batch và bước sang kỳ khác đều mount lại biểu mẫu trên một lần đọc mới, nên nó ghi nhớ mặc định đang hiện
  (W4b, W14). Tôi không tìm thấy chuỗi thao tác nào gửi mặc định cũ kèm phiên bản mới: mọi đường có thể đưa ngày đang giữ trở lại màn
  hình mà không đọc mới (một lần đọc lại thất bại) đều đi sau một lần đổi phiên bản, nên chốt phiên bản từ chối trước.
- **"Use {new}"** không gửi gì, đặt loại, dời đường cơ sở về các trường đã tải với loại mới (nên ghi chú đã gõ vẫn là chỉnh sửa chưa
  lưu: W7b, E1; mutant C1 của tôi bị bắt), làm mới trang và đọc ngày một lần, chỉ nhận khi nó hiện mặc định mới và các trường khác như
  cũ (W2, W14; mutant C2 của tôi bị phép kiểm số liệu của W2 bắt).
- **"Save {category} anyway"** lặp lại lần lưu với bản nháp hiện tại, phiên bản hiện hành, lý do và mặc định mới; nút bị khóa khi đang
  bận và khi thiếu lý do (W16); nhãn đi theo loại đang có trong biểu mẫu (mutant C4 của tôi bị W12 bắt).
- **Thứ tự ưu tiên của thông báo cũ.** Một `stale_version` đóng thông báo mặc định và hiện "Reload day" (W15).
- **Tiêu điểm và đọc lên.** Thông báo là `role="alert"`, nhận tiêu điểm và được cuộn vào tầm nhìn; Tab tới "Use Holiday", rồi "Save
  Worked anyway"; Enter lưu và tiêu điểm về Category (E8); sau "Use" tiêu điểm ở Category trên desktop và điện thoại (W2, E7).
- **Vùng chạm và giao diện.** 44px trên điện thoại (W8); chữ 4,5:1, nền nút chính 3:1 và vòng tiêu điểm 3:1 ở giao diện sáng và cả hai
  bộ tối (W11); các lần quét axe của tôi: 0 vi phạm (mục 7).
- **Thông báo của trang.** Đóng một hộp xem lại có ngày cũ hoặc ngày đổi mặc định thì đặt thông báo của trang kèm "Reload period" (W9a,
  W9b, E2, E3; mutant C6 của tôi bị W9b bắt).
- **Quan sát (tùy chọn, R-CALDEF-1).** Sau "Use" khi chưa gõ gì khác, dòng trạng thái lịch sự "Category set to Holiday, the calendar
  default now. Nothing needs saving." vẫn nằm trên màn hình sau khi người dùng gõ một ghi chú (E1); lúc đó biểu mẫu đã có chỉnh sửa và
  Escape vẫn hỏi "Discard your changes?", nên không mất gì.

## 4. Thời gian (quy tắc 7 của AGENTS)

Việc kiểm so các giá trị `work_date` dân sự trong lịch của chủ; không có múi giờ thiết bị hay múi giờ hiển thị nào tham gia
(`calendarDefaultOn`, `timesheets.ts:252-259`; client gửi `default_category` của chính ngày đó). Bằng chứng: W17 dưới múi giờ thiết bị
Pacific/Auckland; A6 lúc 2026-11-01T08:30Z và 09:30Z (01:30 PDT và PST vào ngày kết thúc DST) và lúc 2026-11-03T07:59:59Z và 08:00:01Z
(một giây trước và sau nửa đêm LA), mỗi lần đều bị từ chối rồi được xác nhận như nhau; cả file probe API chạy lại dưới múi giờ tiến
trình Pacific/Kiritimati (UTC+14) cho cùng các quan sát; A1, một import có hiệu lực từ một ngày sau, chỉ đổi các ngày từ ngày đó trở đi
(2026-09-21 lưu được, 2026-09-22 bị từ chối); toàn bộ spec của vòng qua wrapper FIX10 từ 2026-11-03T07:58:30Z (lần chạy đi qua nửa
đêm LA) và lúc 2026-11-01T08:50Z (ngày kết thúc DST), cả hai project: mỗi lần 45 đạt, 5 bỏ qua, 0 lỗi; và lần chạy bảy file lúc
2026-10-27T06:58:30Z (mục 9).

## 5. Tài liệu

Mọi câu mới trong docs/02 R-03, docs/03 "API and hosting boundary", docs/04 "Day editor" (gạch đầu dòng chuyển ngày và gạch đầu dòng mới
"Changed calendar default"), thanh công cụ và "Category in the cell" của docs/04, AC-05 của docs/06, docs/10 (quyết định của chủ, cách
hiểu phạm vi, MF1, trường tùy chọn, câu về audit) và docs/12 (mục ghi chú phát hành) đều khớp với bản build như tôi đã đọc và chạy, và
mỗi cặp VI nói cùng một điều. Câu về audit trong docs/10 chính xác: một lần ghi đè đã xác nhận trên entry theo mặc định là cập nhật với
before = mặc định hiệu lực (mới) (I3), và ghi đè lên ngày chưa có entry là sự kiện tạo với before = null (I3, A3, A5). Hai sơ suất tài
liệu (F-CALDEF-1, F-CALDEF-2 bên dưới).

## 6. Bản sửa smoke

`recentMonday(now)` nay lấy ngày LA của hôm nay và lùi theo từng ngày dương lịch về thứ Hai gần nhất trước hôm nay
(`scripts/smoke-built-server.mjs:104-113`); `git diff a54061f..b810ba9 -- scripts` không đổi gì khác. Chứng minh của tôi đọc chính văn
bản hàm từ script và so nó, cứ 15 phút từ 2026-01-01 tới 2028-01-01 (70.080 thời điểm, gồm cả hai lần đổi DST của 2026 và 2027), với
một hàm đối chiếu lùi từng giờ và đọc ngày LA và thứ trong tuần qua Intl: 0 sai khác. Hàm của a54061f ném "No Monday found" lúc
2026-11-03T07:49Z (23:49 thứ Hai ở LA, sau khi đổi DST), đúng như WP5-CALDEF-SMOKE báo.

## 7. Hồi quy của vòng 4 và 5, axe, và bản sửa chỉ ở test

- **Điều đã đổi trong bản build.** Bản build sạch của a54061f và của target: `dist/server` 184 file, 10 file khác (errors, schemas,
  dayEntries, timesheetCommands, timesheets và các map); `dist/domain` 48 giống hệt; `dist/client` chunk vào và năm chunk lười đổi tên,
  `index.html` nêu tên chúng, bốn asset giống hệt (một map khác ở đường dẫn nguồn). PDF, mail và các job gửi, import lễ (và số đếm
  preview, F-2 b) và chốt chia sẻ giống từng byte, nên hành vi đã nghiệm thu của chúng vẫn giữ.
- **Day editor, bộ chọn và batch, khung nhìn chia sẻ.** Lần chạy FULL theo giờ thật (cả hai project, 0 lỗi) gồm các test FIX18, FIX19,
  U4-05, phiên và giờ nghỉ, các test bộ chọn và batch, `sharing.spec.ts` và `calendar-default.spec.ts`.
- **axe-core 4.14.0** (SHA-256 của `axe.min.js` 20c09fe1…e878, cùng bản của các audit trước), WCAG 2.0-2.2 A và AA, sáng và tối: thông
  báo mở trong ngăn kéo cạnh bảng (1440) và nổi (1280) và trong sheet điện thoại (390), sau "Use", hộp xem lại hiện "calendar default
  changed" và thông báo của trang kèm "Reload period": 24 lần quét, 0 vi phạm; chưa kết luận chỉ có `color-contrast` (và
  `label-content-name-mismatch` khi bảng của trang nằm trong lần quét), như mọi gate trước; W11 đo trực tiếp độ tương phản. Các lần quét
  cũng ghi tiêu điểm: ở thông báo khi nó mở, ở Category sau "Use", ở Cancel trong hộp xem lại và ở bộ chọn của ngày sau khi hộp đóng.
- **WP5-CALDEF-FIX2 (chỉ test).** Tôi đồng ý với DIAG1: đó là một giả định của test. docs/04 neo ngăn kéo nổi tránh xa cột đang sửa, nên
  với `days[0]` là thứ Hai đến thứ Tư, ngăn kéo che đầu phải của thẻ và điểm bấm cũ (`box.right - 60`) rơi vào ô ghi chú của ngăn kéo;
  bấm bên trong ngăn kéo là bấm lên ngăn kéo, không phải lên thanh cuộn của thẻ, và không được cuộn thẻ. Bấm lên phần nhìn thấy của chính
  thanh cuộn của thẻ cạnh ngăn kéo được xử lý như bấm thanh cuộn (`onOwnScrollbar`, `TimesheetScreen.tsx:73`, `:635`); test đã sửa chứng
  minh điều đó ở cả hai phía neo: neo phải trong lần chạy FULL theo giờ thật của tôi (2026-11-03, `days[0]` là thứ Hai) và lúc
  2026-11-04T18:00Z, neo trái lúc 2026-11-06T18:00Z, cả spec 3 đạt mỗi lần. Diff (+11/-3) chỉ đổi điểm bấm và thêm một điều kiện trước
  (`elementFromPoint` rơi vào thẻ tuần); thao tác kéo, `scrolled() > 0`, ngăn kéo vẫn mở và lần bấm lên trang trống không đổi; không có
  sleep, timeout hay skip. Không test e2e nào khác tính điểm bấm trên bảng; mọi chỗ khác đọc `data-side` đều rẽ nhánh theo nó, và
  `day-editor.spec.ts:5390` mở cột đầu tiên (thứ Hai) một cách tường minh, nên không phụ thuộc ngày.

## 8. Độ mạnh của test: mutant của riêng tôi

Mỗi mutant được áp vào `export-mut` (mỗi phép thay khớp đúng một lần; `mutate.mjs.txt`), và được khôi phục giống từng byte với bản
export sạch sau các lần chạy của nó (`50-mut-apply.txt`). Mutant server chạy với toàn bộ `npm test` (103 file) và file probe API của tôi;
những mutant lọt qua suite unit và integration được build lại và chạy với `calendar-default.spec.ts` trên project desktop (S2 thêm
`sharing.spec.ts`; S7 thêm probe bộ chọn E2 của tôi). Mutant client được build lại và chạy với `calendar-default.spec.ts` trên cả hai
project. Sau lần khôi phục cuối, `src/`, `tests/` và `scripts/` của `export-mut` bằng bản export sạch và `dist/` build lại của nó bằng
bản build của target (`53-mut-restored.txt`).

| Mutant | Phá điều gì | Suite của vòng | Probe của tôi | Đánh giá |
|---|---|---|---|---|
| S1 | một entry batch bị kiểm mặc định đã đổi trước phiên bản của nó | sống sót (`npm test` 2.425 đạt; e2e 24 đạt) | sống sót | thiếu test cho một thứ tự đã ghi trong tài liệu; ảnh hưởng thấp (cả hai mã 409 đều dẫn tới "Reload period") |
| S2 | batch đọc phạm vi của người thao tác, nên batch chia sẻ kiểm lịch của người được chia sẻ | bị bắt, nhưng không vì mặc định: ba test chia sẻ (`actor-subject`, `history`, `sharing`) lỗi với 409 `conflict` từ việc tra timesheet của người thao tác; test của vòng và các spec e2e đều đạt | bị A3 bắt đúng lý do (`can_commit` là true trong khi lịch của chủ phải từ chối) | không test nào của vòng ghim batch chia sẻ trên lịch khác; nên thêm A3 |
| S3 | PUT đọc phạm vi trước giao dịch IMMEDIATE | sống sót mọi lần | sống sót (A7 không thấy được) | tương đương trong một tiến trình (handler đồng bộ); ghi lại, không cần làm gì |
| S4 | `can_commit` của preview bỏ qua default_changed | bị I9 bắt (`can_commit` phải là false) | bị A3 bắt | đúng lý do |
| S5 | mặc định hiện tại của entry theo mặc định là bản chụp đã lưu | bị I2 (không có 409) và I5 bắt | sống sót (probe của tôi dùng ngày chưa có entry) | đúng lý do |
| S6 | details của 409 PUT có thêm một khóa | bị I12 bắt (danh sách khóa chính xác) | bị A1 bắt (`toEqual` của details) | đúng lý do |
| S7 | entry batch đã có entry theo mặc định thì không bị kiểm | sống sót (`npm test` 2.425 đạt; e2e 24 đạt: I9, I10, I15, W9a và W9b đều dùng ngày chưa có entry) | sống sót qua probe API; bị E2 bắt đúng lý do (hộp xem lại hiện "Worked to Vacation, category change" với "Review conflicts", nên người dùng sẽ xác nhận xung đột và ghi Vacation đè lên Holiday mới mà không được báo) | thiếu test trên một đường thật: bộ chọn hoặc batch trên ngày có Check in hoặc phiên |
| C1 | "Use" dời đường cơ sở về toàn bộ bản nháp (ghi chú đã gõ không còn tính là chưa lưu) | bị W7b (không có "Discard your changes?") và W2 (dòng trạng thái nói không cần lưu gì) bắt, cả hai project | - | đúng lý do (U4-05 được ghim) |
| C2 | sau "Use" editor không bao giờ nhận ngày mới đọc | bị W2 bắt trên desktop (số liệu không đi theo ngày lễ); điện thoại không có số liệu nên W2 đạt ở đó | - | đúng lý do |
| C4 | nhãn "Save … anyway" nêu mặc định cũ | bị W12 bắt trên cả hai project (sau lần đổi thứ hai nút đọc là "Save Holiday anyway", nên không tìm thấy "Save Worked anyway" và test hết giờ) | - | đúng lý do, qua hết giờ chứ không qua một phép khẳng định trực tiếp |
| C5 | "Use {new}" vẫn bật khi một lần lưu đang chạy | sống sót (45 đạt, 5 bỏ qua) | - | thiếu test, ảnh hưởng thấp: bấm "Use" khi một "Save anyway" đang chạy khiến biểu mẫu hiện mặc định mới trên một loại đã lưu, biểu mẫu ở trạng thái có chỉnh sửa, nên không mất gì âm thầm |
| C6 | đóng hộp xem lại chỉ đề nghị "Reload period" cho một lần chọn nhãn | bị W9b bắt trên cả hai project (không có "Reload period" sau "Change several days") | - | đúng lý do |

## 9. Kiểm tra bắt buộc (bản export sạch của target, lần lượt từng lệnh, máy chỉ chạy việc này)

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `npm ci` | 0 | `03-ci.txt` |
| `npm run typecheck` / `npm run lint` (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | 0 / 0, không có dòng cảnh báo hay deprecation | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 103 file, 2.425 test (40,2 giây) | `03-npmtest.txt` |
| `npm run build` | 0, không có cảnh báo kích thước chunk | `03-build.txt` |
| FULL e2e theo giờ thật, cả hai project, `--workers=6` (2026-11-03, 12:59:38-13:08:40Z; `days[0]` là thứ Hai 2026-11-02, ngăn kéo nổi neo phải) | exit 0: desktop 508 đạt / 37 bỏ qua / 0 lỗi, mobile 429 / 116 / 0; không flaky; không có dòng deprecation | `04-e2e-full-real.txt`, `04-e2e-counts.txt` |
| AC-13 dưới Pacific/Chatham (`TZPROBE` offset -825, UTC+13:45) | 0: 1/1 | `05-ac13-pacific-chatham.txt` |
| bảy file lúc 2026-10-27T06:58:30Z, wrapper FIX10 (giống từng byte file của FIX10), `--workers=6` | exit 0: desktop 234 / 16 / 0, mobile 166 / 84 / 0 (400 đạt, 5,7 phút); test qua nửa đêm `today.spec.ts:627` trên desktop mất 1,2 phút (nó đã đi qua) | `08-seven-1027.txt`, `08-seven-counts.txt`, `30-shiftclock-identity.txt` |

Các con số bằng của regate. Không lần chạy nào lỗi, nên không cần chạy lại vì lỗi mạng hay buffer và không cần phân loại theo tải. Điều
tra tiến trình lúc vào là 1,00 và 1,09 lõi bận trên 32, sau FULL 0,56, sau bảy file 1,00 (`10-census-*.txt`). Các dòng cảnh báo duy
nhất trong log e2e là thông báo của Node rằng `NO_COLOR` bị bỏ qua vì `FORCE_COLOR` được đặt.

## Bảng bằng chứng

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| định danh: `git rev-parse HEAD origin/main`, `git status -- . ':!handoff'`, digest ở ba dạng, trước và sau | b810ba9 cả hai; trống; 59e2ec3f… 885 file ở mọi dạng | `00-*`, `01-digest-*` |
| `git diff --check a54061f..b810ba9 -- . ':!handoff'`; name-status | 0; 39 path (34 path của vòng và một của FIX2, cùng 4 tài liệu quy trình của 5b2f287) | `20-*`, `21-*`, `22-*` |
| build sạch của a54061f và target, `distcmp.mjs` | `dist/server` 10 trên 184 file khác (5 module và map), `dist/domain` 48 giống hệt, chunk vào và 5 chunk lười của client đổi tên | `45-*` |
| probe API (vitest, 10 test), múi giờ của máy và Pacific/Kiritimati | 0: 10/10 hai lần, cùng các quan sát | `40-*` |
| probe trình duyệt (11 chạy trên 18; server riêng) | lần đầu 8 đạt, 3 lỗi do probe của tôi sai (`99-slips.txt`); sau khi sửa, E2 và E4 desktop 3/3 | `41-*` |
| `classic-scrollbar.spec.ts` lúc 2026-11-06T18:00Z và 2026-11-04T18:00Z (desktop) | 3/3 và 3/3 | `42-*` |
| `calendar-default.spec.ts` từ 2026-11-03T07:58:30Z và lúc 2026-11-01T08:50Z (cả hai project) | mỗi lần 45 đạt / 5 bỏ qua / 0 lỗi | `43-*`, `44-probe-counts.txt` |
| chứng minh smoke (70.080 thời điểm) | target 0 sai khác; a54061f ném lỗi lúc 2026-11-03T07:49Z | `60-*` |
| 12 mutant | 7 bị suite của vòng bắt đúng lý do (S4, S5, S6, C1, C2, C4, C6); S2 bị bắt qua hiệu ứng phụ (đúng lý do chỉ ở A3); S7 chỉ bị E2 của tôi bắt; S1 và C5 sống sót; S3 tương đương; tất cả đã khôi phục | `50-*` đến `53-*` |

## Lỗi

- **F-CALDEF-1 (Thấp, tài liệu).** `docs/03_ARCHITECTURE_AND_DATA.md:24` và `docs/03_ARCHITECTURE_AND_DATA.vi.md:24`, dòng
  `timesheets/day_entries` của bảng dữ liệu. Tái hiện: `git diff a54061f..b810ba9 -- docs/03_ARCHITECTURE_AND_DATA.md` (hoặc đọc dòng
  24). Thực tế: WP5-CALDEF-DOCS đã thay phần cuối của dòng thay vì nối thêm; dòng mất "notes, confirmation, optimistic version" (VI "ghi
  chú, xác nhận, phiên bản chống sửa đè") và nay đọc là "(… no OT-leave day category), , category source (…)" (VI "…), , nguồn loại
  ngày (…)"). Kỳ vọng: giữ ba ý đó và thêm nguồn loại ngày sau chúng với một dấu phẩy, ở cả hai ngôn ngữ (vòng này không đổi ý nào trong
  đó; `day_entries` vẫn có `notes` và `version` chống sửa đè). Quy tắc: docs/03 là hợp đồng dữ liệu chuẩn; AGENTS "giữ các bản dịch khớp
  nhau". Sửa có phạm vi: một lần duyệt-và-sửa tài liệu cho hai dòng (quy tắc 14 của AGENTS: không cần gate hay audit); không đổi sản
  phẩm. Bước kiểm tài liệu của gate không bắt được lỗi này.
- **F-CALDEF-2 (Thấp, khớp bản dịch).** `docs/12_RELEASE_NOTES.vi.md:63`, trong mục ghi chú phát hành tiếng Việt của vòng này, liên kết
  chữ tiếng Anh "WP5 handoff" tới file tiếng Anh `WP5_HANDOFF.md`, trong khi dòng 7 và 19 của cùng file liên kết "bàn giao WP5" tới
  `WP5_HANDOFF.vi.md`. Liên kết vẫn mở được, nên preflight vẫn đạt. Kỳ vọng: chữ tiếng Việt và bàn giao tiếng Việt. Sửa có phạm vi: trong
  cùng task tài liệu đó.

Không chứng minh được lỗi sản phẩm nào: mọi đường của quy tắc của chủ chạy đúng như đặc tả, hợp đồng server và client đứng vững trước
các probe của tôi, và các kiểm tra bắt buộc đều đạt.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

Mới, từ audit này:
- **R-CALDEF-1, dòng trạng thái cũ sau "Use".** Sau "Use {new}" khi chưa gõ gì khác, "… Nothing needs saving." vẫn nằm trên màn hình
  khi người dùng gõ tiếp một ghi chú (E1); chốt chỉnh sửa chưa lưu vẫn hỏi. Tùy chọn: xóa dòng trạng thái ở lần sửa kế tiếp
  (`DayFieldsForm.tsx:157-161`, `:248-252`).
- **R-CALDEF-2, độ mạnh test của vòng này** (mục 8). Sản phẩm đúng trong mọi probe, nên đây chỉ là chỗ thiếu test: S7 (test của vòng
  không bao giờ kiểm bộ chọn hay batch trên ngày có Check in hoặc phiên khi mặc định đã đổi; E2 của tôi bắt được), S2 (batch chia sẻ với
  người được chia sẻ ở lịch khác; các test chia sẻ cũ chỉ bắt được qua một hiệu ứng phụ, A3 của tôi bắt đúng lý do), S1 (thứ tự theo
  từng entry "stale trước default_changed" chưa được ghim) và C5 (không test nào kiểm "Use" bị khóa khi một lần lưu đang chạy). Tùy chọn:
  thêm E2 và A3 (nguồn
  `zz-audit-caldef.spec.ts.txt`, `zz-audit-caldef.test.ts.txt`) vào `calendar-default.spec.ts` và `calendar-default-change.test.ts`, và
  một entry preview vừa stale vừa đổi mặc định.
- **R-CALDEF-3, bộ chọn và batch trả lời qua ba bước** (Cancel, "Reload period", chọn hoặc chọn lại các ngày). Theo quyết định mà chủ có
  thể phủ quyết (docs/10); một "Save anyway" một bước cho bộ chọn chỉ làm sau nếu chủ muốn.
- **R-CALDEF-4, trường tùy chọn** (rủi ro còn lại đã chấp nhận, docs/10): một tab cũ hoặc script bỏ `default_category` ghi đè mặc định đã
  đổi mà không có thông báo (A5). Sau này bắt buộc trường đó thì sẽ an toàn hơn (fail closed).
- **Đường viền của nút phụ** (điểm mở của WP5-CALDEF-FIX): nút "Use {new}", như mọi `button.secondary` của ứng dụng, vẽ đường viền 2,05:1
  trên nền sáng (dưới mức 3:1 mà AGENTS yêu cầu cho đường viền thành phần; chữ của nó 4,5:1 và vòng tiêu điểm dùng chung 3:1, W11). Đây
  là câu hỏi thiết kế toàn ứng dụng dành cho chủ, không do vòng này gây ra.
- **F2, tranh chấp cổng của harness, cập nhật.** `tests/e2e/fixtures.ts:60-69` `freePort()` đóng cổng thử trước khi migrate và seed chạy
  (`spawnSync`, `:72`) rồi server mới khởi động trên số cổng đó; `:76-88` `waitUntilHealthy` nhận bất kỳ `/api/health` khỏe nào trên
  origin đó, nên khi có nhiều worker, một test có thể đăng nhập vào server của test khác và nhận 401 ở bước seed sign-in. Đã thấy hai lần
  (WP5-UX5-DIAG2, stress của WP5-CALDEF-GATE), chưa tái hiện được; không lần chạy e2e nào của tôi gặp nó (lần chạy FULL, bảy file và
  16 lần chạy nhỏ hơn, phần lớn trên server riêng). Backlog: giữ chỗ cổng bằng file khóa trong `freePort()` (DIAG1 mục 6), kèm chứng
  minh va chạm cưỡng bức riêng.

Mang sang từ WP5_UX5_REVIEW_INT3 và WP5_UX5_RECHECK_RN, trạng thái ở target này:
- R-UX5I2-3: **đã đóng** bởi vòng này (đã xây đúng quyết định của chủ; xem "Xử lý phát hiện trước").
- R-UX5I3-1 (một quy tắc cho follow và ghi phiên khi chưa gõ gì), R-UX5I3-2 (nhánh giữ im lặng), R-UX5I3-3 (tiêu điểm sau "Save day
  fields" và "Reload day"; nút "Save anyway" mới đưa tiêu điểm về Category, nút Save cũ thì vẫn chưa), R-UX5I3-4 (độ mạnh test của FIX19):
  không đổi.
- R-UX5RN2-1 (docs/12:7 bỏ sót DEVELOPMENT): đã giải quyết bởi 5b2f287, commit viết lại docs/12:7 cho quy tắc phát hành và có nêu
  DEVELOPMENT. R-UX5RN2-2 và R-UX5RN2-3 (câu chữ ở docs/11:34 và docs/10): không đổi.
- Backlog tùy chọn của INT3 (mục 1 đến 7) ngoài ra không đổi: độ mạnh test vùng A và B, tài liệu và chú thích, gia cố sản phẩm (R1, R2,
  bước nhảy 8 px một khung hình của DIAG5, R-UX5B2-1, -2, R-UX5B-6, R6, R7, R-UX4B-1, -4, -8, UX4-A 1, 3, 4, 9, R-UX5I3-1, -2, -3), kiểm
  thiết bị pilot (NOT VERIFIED ở đây), quy trình và harness (R-A2-5, R-UX5I-3, R-UX5B-2, R-UX5B-4, R-UX4B-6, nhánh điện thoại của test qua
  nửa đêm, F2 ở trên), và các quyết định của điều phối viên mà chủ đã được báo (nay thêm cách hiểu phạm vi của R-UX5I2-3 và trường tùy
  chọn).

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ qua và không cái nào cần chạy lại. Tôi không chạy, theo phạm vi của brief (mang sang từ
WP5-CALDEF-GATE trên 300d61f với `dist/` giống hệt theo WP5-CALDEF-REGATE): container drill (209/0), `npm audit --omit=dev`, năm lần quét
khác, 36 mutant của vòng và các lần chạy stress. Các mục NAS vẫn NOT VERIFIED.

## Xử lý phát hiện trước

- **R-UX5I2-3: đã đóng.** Câu trả lời của chủ đã được xây đúng như quyết định: mặc định đã đổi được hiện ra và người dùng chọn trên các
  đường của Day editor; bộ chọn và batch từ chối và đề nghị "Reload period" (cách hiểu phạm vi của điều phối viên, ghi trong docs/10, chủ
  có thể phủ quyết); rủi ro còn lại của trường tùy chọn đã được ghi lại.
- F1 của WP5-CALDEF-GATE (`classic-scrollbar.spec.ts:143` ngày 2026-11-03): đã đóng bởi FIX2, là giả định của test (mục 7); F2: rủi ro
  harness trong backlog.
- Mọi cách xử lý của WP5_UX5_REVIEW_INT3 và WP5_UX5_RECHECK_RN vẫn giữ.
- PASS này nghiệm thu lại WP5 sau vòng R-UX5I2-3 và thay WP5-UX5-RECHECK-RN (PASS trên a54061f / 690fd8fd) làm lần nghiệm thu hiện
  hành, tại b810ba9 / 59e2ec3f.

## Tách sẵn sàng phần mềm, phép của chủ và kết quả pilot

Sẵn sàng phần mềm của WP1 đến WP5 được xác lập lại tại b810ba9 / 59e2ec3f (885 file) bởi audit này và WP5-CALDEF-REGATE (PASS, có phạm
vi, mang sang drill và các mục khác của WP5-CALDEF-GATE trên `dist/` giống hệt), với NAS NOT VERIFIED. Phép của chủ: chưa được yêu
cầu hay cấp. Kết quả pilot: chưa có; NAS là NOT VERIFIED. Không có gì được triển khai hay gửi đi: chỉ server riêng cục bộ và bắt thư cục
bộ, người dùng giả `example.invalid`.

## Một bước tiếp theo

Nghiệm thu lại WP5 trên b810ba9 / 59e2ec3f (PASS này trên bảng, với `superseded_by` trên WP5-UX5-RECHECK-RN), tiếp theo là một lần
duyệt-và-sửa tài liệu theo quy tắc 14 của AGENTS cho F-CALDEF-1 và F-CALDEF-2 (docs/03:24 EN và VI, docs/12.vi:63) cùng với mục bàn giao
WP5 cho vòng này mà docs/12:63 trỏ tới.

## Nguồn gốc subagent độc lập

- **Task review, reviewer và tác giả.** WP5-CALDEF-AUDIT, lần 1; agent reviewer `a4507aa2a7bba058d` (bảng). Tác giả của vòng được
  review (bảng): WP5-CALDEF-PLAN `a5afcd9de38696b00`, -PLAN-REVIEW `aa5a99f7dc14c0b64`, -FIX `a2000d9193fe2d52a`, -DOCS
  `af035e5d4c8a20bef`, -SMOKE `a521700b2f94d665b`, -EVID `a855720586ac3ace9`, -DIAG1 `ab3e2c406e060a4e0`, -FIX2 `a9debfeca228aed5a`;
  người commit -FREEZE `a92aef03b69a4f40e` và -FIX2-FREEZE `ae42fa75e6e1894da`; gate -GATE `ab46316f7e717fa2e` và -REGATE
  `adcebe049815453ba`; trên nền các tác giả WP5-UX4 và WP5-UX5 của sản phẩm.
- **Context mới.** Tôi không viết thay đổi nào được review và không viết task hay audit WP5-CALDEF nào. Tôi không đổi gì ngoài cặp review
  này, phần Results của brief và thư mục bằng chứng, và không stage hay commit gì.
- **Digest.** 59e2ec3f…0770a (885 file) trước và sau ở mọi dạng. Bằng chứng gate cho snapshot này: WP5-CALDEF-REGATE PASS.
- **Path report.** `handoff/delivery/WP5_CALDEF_REVIEW.md` (+ `.vi.md`); mọi review trước giữ nguyên.
- **Xử lý phát hiện và task tiếp theo của điều phối viên.** F-CALDEF-1 và F-CALDEF-2 là lỗi tài liệu còn mở (quy tắc 14, không cần gate
  hay audit); không cần sửa sản phẩm. Tiếp theo: nghiệm thu lại và task tài liệu ở "Một bước tiếp theo".
