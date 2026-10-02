# Review độc lập WP1 — Nền tảng và tính giờ

Theo mẫu [REVIEW](../templates/REVIEW.md). Bản tiếng Anh có thẩm quyền: [WP1_REVIEW.md](WP1_REVIEW.md).

- **Gói/ngày/người review và model/effort quan sát được:** Chỉ WP1; ngày 2026-10-02, America/Los_Angeles. Codex review độc lập tại máy local. Công cụ trong phiên không cho biết chính xác model, effort hay tốc độ của client; không đổi thiết lập, billing hay subscription. Không khởi chạy agent song song, theo AGENTS.md.
- **Baseline/commit chính xác; độ đầy đủ của source:** `70e225711331783452b1cba7e8de7851bc041c4e`, working tree ban đầu sạch. Có đầy đủ source ứng dụng, manifest/lockfile, migration, test, fixture, đặc tả tiếng Anh và handoff triển khai tại máy local. WP1 đã nằm trong commit đầu tiên nên không có commit cha trước WP1 để so sánh: review snapshot được cung cấp, không tạo diff giả. Digest source chạy lại và digest cây HEAD tính riêng cùng bằng `63524bd4ee25fb7cf0318a0b0eabc6c46a135f68ecfa1ccc609e6bd91c2a745a` trên 521 file, loại `handoff/`. Xem [bằng chứng baseline](evidence/WP1-review-codex/baseline.txt).
- **Kết luận: FIX REQUIRED.** Các lệnh kiểm tra bắt buộc hiện có đều qua, nhưng F-01 tái hiện lỗi API đã triển khai, có thể tính sai OT và ngăn Clock out hợp lệ. Chưa chấp nhận WP1; chưa được bắt đầu WP2 trước khi sửa có giới hạn và review độc lập lại đạt.

## Phạm vi thực sự đã đọc/chạy

Đã đọc tài liệu có thẩm quyền: AGENTS.md; [prompt WP1_REVIEW](../prompts/WP1_REVIEW.md) đang active; [handoff WP1](WP1_HANDOFF.md); các tài liệu tiếng Anh [01](../../docs/01_PRODUCT_REQUIREMENTS.md), [02](../../docs/02_TIME_AND_OT_RULES.md), [03](../../docs/03_ARCHITECTURE_AND_DATA.md), [06](../../docs/06_TEST_AND_ACCEPTANCE.md) và [09](../../docs/09_IMPLEMENTATION_ROADMAP.md). NEXT_ACTION, STATE, DEVELOPMENT, WP1_IMPLEMENT và mẫu REVIEW xác định phạm vi/ngữ cảnh bàn giao. Báo cáo cross-check trước của Claude được đọc sau lượt truy vết source ban đầu; không dùng kết quả PASS của báo cáo đó làm bằng chứng chạy mới.

Source quan trọng đã kiểm tra: tính toán domain, đơn vị/ngày/múi giờ, validation phiên/break, attendance/deficit, kỳ lương, chọn phiên bản policy/calendar; route/schema/security/auth API; migration và constraint SQLite; service đọc/ghi timesheet, policy/calendar, period, user, audit; seed/config/entry point; skeleton React đăng nhập/timesheet; adapter fixture, test migration/isolation/history và cấu hình build/test/lint. Không sửa source production. Chỉ thêm báo cáo và bằng chứng chạy dưới `handoff/delivery/`; `dist/` sinh ra được ignore.

Đường gọi production: API đọc ngày/timesheet → `buildDayView` trong `src/server/services/timesheets.ts` → `computeWorkDay` → `computeDailyOvertime` → `roundToStepMidpointDown`. UI định dạng kết quả trả về, không tạo engine OT thứ hai. Engine trừ break đã xác nhận; F-01 nằm ở lệnh ghi dữ liệu trước khi gọi engine.

## Bảng bằng chứng

Mọi kết quả dưới đây được chạy trong review này. [Môi trường](evidence/WP1-review-codex/environment.txt): Windows x64; Node bundled v24.19.0 (đáp ứng `engines: ^24.11.0`), npm v11.19.1, dùng dependency local có sẵn. Node mặc định v26.10.0 nằm ngoài contract; `npm --version` mặc định lỗi `MODULE_NOT_FOUND`; không dùng chúng cho gate. `run-gates.ps1` đặt thư mục Node 24 lên đầu PATH của tiến trình và gọi trực tiếp npm CLI có sẵn. Script bật `NODE_OPTIONS=--trace-deprecation --pending-deprecation`. Không quan sát thấy cảnh báo deprecated trong log.

Chạy lại từ gốc repo bằng `& ./handoff/delivery/evidence/WP1-review-codex/run-gates.ps1` và `& ./handoff/delivery/evidence/WP1-review-codex/run-probes.ps1`. Script ghi lệnh và exit chính xác. `node npm-cli.js` dưới đây dùng đường dẫn tuyệt đối Node/npm trong runner, không phải npm mặc định đang lỗi.

| Lệnh đã chạy | Kết quả / exit | Bằng chứng |
|---|---|---|
| `node npm-cli.js ls --depth=0` | 0; 16 dependency trực tiếp có phiên bản đúng manifest; không báo dependency trực tiếp thiếu/sai | [dependencies.txt](evidence/WP1-review-codex/dependencies.txt) |
| `node npm-cli.js run typecheck` | 0; type check strict server, client và test đạt | [typecheck.txt](evidence/WP1-review-codex/typecheck.txt) |
| `node npm-cli.js run lint` | 0; gate `@typescript-eslint/no-deprecated` đạt | [lint.txt](evidence/WP1-review-codex/lint.txt) |
| `node npm-cli.js test -- --reporter=verbose` | 0; 10 file test, **174/174 đạt**, gồm migration/schema SQLite mới, fixture time/OT/deficit, auth, isolation hai user, API và edit/history | [test.txt](evidence/WP1-review-codex/test.txt) |
| `node npm-cli.js run build:server` | 0; build TypeScript server/domain đạt | [build-server.txt](evidence/WP1-review-codex/build-server.txt) |
| `node npm-cli.js run build:client` | 0; build Vite đạt; JS client 228.53 kB | [build-client.txt](evidence/WP1-review-codex/build-client.txt) |
| `node npm-cli.js run smoke` | 0; **13/13 đạt**, server đã build trên loopback, migration mới/lặp, seed giả lập, ngày 480 phút, admin isolation, từ chối Origin, thu hồi session khi logout | [smoke.txt](evidence/WP1-review-codex/smoke.txt) |
| `node npm-cli.js run digest`; tính SHA-256 cây HEAD riêng | 0; cả hai digest khớp baseline đang review | [digest.txt](evidence/WP1-review-codex/digest.txt), [baseline.txt](evidence/WP1-review-codex/baseline.txt) |
| `& ./handoff/delivery/evidence/WP1-review-codex/run-probes.ps1` | **1**; 144.180 so sánh oracle khoảng cách độc lập và 17 check engine cụ thể đạt; **tái hiện hai biểu hiện F-01** trên SQLite mới đã migrate. Exit 1 biểu thị lỗi contract tái hiện được, không phải lỗi môi trường | [probe.txt](evidence/WP1-review-codex/probe.txt), [source](evidence/WP1-review-codex/probe.mjs.txt) |
| Python bundled `handoff/delivery/validate_package.py --preflight` | 0; 36 cặp dịch, 379 link local và đủ 91 scenario tham chiếu đạt. Đây là kiểm tra tài liệu/số học tham chiếu; `application_tests_executed` bằng false | [package-validator.txt](evidence/WP1-review-codex/package-validator.txt) |
| Cùng preflight Python sau khi hoàn tất review song ngữ và link bằng chứng | 0; 37 cặp dịch, 433 link local, đủ 91 scenario tham chiếu đạt | [package-validator-final.txt](evidence/WP1-review-codex/package-validator-final.txt) |

Chạy lại kiểm tra cây HEAD cuối bằng [run-baseline.ps1](evidence/WP1-review-codex/run-baseline.ps1). Lượt thử hash bằng pipeline PowerShell trước đó cho digest serialization khác, `608f3dfa…`; giữ phép so sánh chưa thành công đó trong [baseline-powershell-attempt.txt](evidence/WP1-review-codex/baseline-powershell-attempt.txt). Check Node độc lập với serialization sắp xếp/LF đã quy định xác nhận digest source; không trích lượt thử trước làm bằng chứng khớp.

Đã chạy gate build bằng hai script thành phần thực tế; không gọi wrapper tổng hợp `npm run build` hay `npm run verify`. Các check WP1 cấu thành vẫn được chạy đầy đủ. Không chạy lại `npm ci`: review này chưa xác minh cài mới dependency/tính tái lập từ cài mới. Không mượn kết quả nghiệm thu từ log triển khai.

## Tính lại độc lập và coverage gate

Oracle bổ sung tìm các bội số theo khoảng cách, giữ bội số thấp hơn nếu hòa. Không dùng chung implementation rounding production. Kỳ vọng khoảng thời gian dùng UTC cố định và số giây elapsed tính riêng; script gọi domain production vừa build. Probe lỗi API chỉ dùng harness có sẵn để tạo DB/seed mới, điều khiển giờ và gửi request HTTP; assertion kiểm tra cả row thực sự lưu.

| Scenario | Kỳ vọng độc lập = quan sát |
|---|---|
| Excess ngày thường 30 / 31 / 45 / 46 / 75 / 76, B=480 N=30 M=30 | Credit **0 / 30 / 30 / 60 / 60 / 90** |
| Ngày nghỉ 15 / 16 / 120 | Credit **0 / 30 / 120** |
| 09:00–18:00, break dịch theo giờ đến tổng 60 phút | R=480, O=0, eligible=0, credit=0 |
| Hai phiên, mỗi phiên 4h15m40s | Tổng 30.680 giây regular → floor một lần R=511; eligible=31, credit=30 |
| Thứ Sáu 08:00–12:00 cộng thứ Sáu 22:00–thứ Bảy 02:00 | R=360, O=120, eligible=120, credit=120; cùng một B ngày |
| DST mùa xuân thứ Bảy 22:00–Chủ nhật 04:00 | Elapsed 5 giờ, O=300, credit=300 |
| DST mùa thu thứ Bảy 22:00–Chủ nhật 03:00 | Elapsed 6 giờ, O=360, credit=360 |
| LA 2026-03-08 02:30; LA 2026-11-01 01:30 | Từ chối gap; từ chối giờ lặp khi thiếu fold; fold cho 08:30Z / 09:30Z |

AC-02: đủ 33 scenario OT, 32 time và 16 deficit chạy với hàm production trong Vitest (81 scenario; số test còn gồm kiểm tra metadata suite và edge bổ sung). Có flexible arrival, nhiều phiên, break chưa biết/đã xác nhận, khoảng thời gian sai, ranh giới holiday/qua đêm và phiên bản calendar. Số học ledger tham chiếu thuần trong Python không chứng minh service ledger tương lai.

AC-01, endpoint WP1: test isolation đã chạy từ chối GET/PUT/DELETE session của người khác ở cả hai chiều, kể cả admin; xác nhận dữ liệu day/timesheet/policy riêng; từ chối owner từ client; scope overlap và live Clock out theo chủ session đăng nhập; kiểm tra actor/owner audit. Test auth có yêu cầu đăng nhập endpoint riêng tư, token hash, thu hồi, hết hạn và deactivation. PDF/signature/ledger ngoài WP1.

R-07 / history WP1: test đã chạy xác nhận draft current/future không cần reason, kỳ cũ chưa gửi và timesheet mô phỏng finalized phải có reason, audit before/after, stale write, thay đổi version timesheet và history policy/calendar bất biến. Policy theo work date; calendar version theo ngày segment. Reporting zone đã lưu quyết định nhóm dữ liệu và logic kỳ current. Snapshot finalization/PDF bất biến thuộc WP3, chưa được chứng nhận ở đây.

## Findings

**Trục Standards:** không tìm thêm vi phạm chuẩn implementation đã được chứng minh trong phạm vi kiểm tra; type/lint strict đạt. **Trục Spec:** một finding được chứng minh, F-01. Không thêm nhận xét code smell tùy chọn để lấp mẫu.

| ID / mức độ | File / hàm | Kỳ vọng / thực tế | Rule / AC | Sửa có giới hạn |
|---|---|---|---|---|
| **F-01 / P2, chặn nghiệm thu vì làm sai OT** | `src/server/services/timesheetCommands.ts`, `clockOut`, dòng 425–450, đặc biệt dòng 450 | Break thực tế gửi lên phải trở thành bộ break thực tế của phiên. Hiện giữ row cũ rồi nối row mới. Xác nhận break đã lưu lỗi 422 `overlapping_breaks`; xác nhận không có break thành công nhưng vẫn trừ break cũ, làm credit giảm từ **90 xuống 60 phút** trong reproduction | R-01 break loại trừ đã xác nhận; R-02 sửa actual / xác nhận không có break lúc Clock out; R-04 OT ngày; FR-06; AC-02 và validation khoảng thời gian WP1 | Trong transaction IMMEDIATE scope theo owner có sẵn, thay bộ row break cũ bằng bộ gửi lên đã validate, như `updateSession`. Xóa row cũ trước khi update biên phiên, sau đó insert break gửi lên; giữ audit before/after và rollback khi lỗi. Thêm regression integration cho hai reproduction, xác nhận rỗng/chưa biết và rollback lỗi; chạy lại gate WP1 |

**Reproduction chính xác (dữ liệu giả lập, không cần UI/editor):**

1. Migration/seed mới, đăng nhập employee, clock server `2026-09-29T20:00:00Z` (13:00 LA).
2. `POST /api/days/2026-09-29/sessions` với start `{local:"2026-09-29T09:00",zone:"America/Los_Angeles"}`, `end:null`, `input_zone:"America/Los_Angeles"`, `breaks_confirmed:false`, một break loại trừ 11:00–11:15 tại zone đó. Endpoint đã triển khai chấp nhận (201), lưu break.
3. Chuyển clock server đến `2026-09-30T01:16:00Z` (18:16 LA). Chạy riêng từ trạng thái mới giống hệt nhau:
   - **F-01A:** `POST /api/clock/out` gửi lại break 11:00–11:15 đó, `breaks_confirmed:true`. Kỳ vọng 200, phiên đóng, một break, R=541 và credit=60. Thực tế 422 `overlapping_breaks`; transaction rollback, phiên còn mở.
   - **F-01B:** `POST /api/clock/out` với `breaks:[]`, `breaks_confirmed:true`. Kỳ vọng xác nhận rõ không có break, R=556, E=76 và credit=90. Thực tế 200, break cũ còn lưu: R=541, E=61 và credit=60. Audit phản ánh bộ break cũ bị giữ ngoài ý định này.

Cả hai request hợp lệ theo schema WP1 công khai. Test hiện có bắt đầu Clock out từ phiên chưa có row break lưu trước nên không bao phủ tổ hợp này. Chưa áp dụng sửa trong review.

## Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh

- **Ngữ nghĩa ranh giới lịch sử:** dung sai ±1 ngày cho manual work date và mốc đầu kỳ current cho phiên bản policy/calendar mới là lựa chọn đã ghi trong handoff. Source cho thấy vẫn có các nhánh đó. Làm rõ cách xử lý ranh giới finalized trước WP3, sau đó test snapshot/correction bất biến. Không chạy lại độc lập reproduction RISK-1/RISK-2 của Claude trong phiên này; chúng không phải finding đã xác minh bổ sung.
- **Payroll exception và kỳ đã lưu:** settings cần validate thứ tự exception và đồng bộ row period đã materialize. Đây là rủi ro cross-check/handoff trước dành cho WP2 khi có exception API; WP1 chưa có API này. Ngoài test engine hiện có, chưa chạy thêm kiểm tra độc lập.
- **Giới hạn vận hành:** login limiter theo socket trong một tiến trình và thời hạn session tuyệt đối cần review khi triển khai sau proxy ở WP4. Chạy Windows không xác minh Linux/NAS. Hiện không cần hỏi quyền production hay secret theo giả định.
- **DB defense tùy chọn:** invariant UPDATE break bằng SQL trực tiếp yếu hơn INSERT, nhưng API sửa đã triển khai dùng delete/insert. Đây không phải lỗi API thứ hai đã chứng minh.

## Gate bắt buộc chưa chạy/bị chặn và lý do

Không có lệnh WP1 bắt buộc bị chặn: type check, lint, hai build, migration mới, đủ fixture time/OT bắt buộc và isolation endpoint đã triển khai đều đã chạy. **F-01** chặn nghiệm thu, không phải thiếu quyền chạy. Lỗi timezone Python ghi trong các handoff trước không tái diễn với runtime Python bundled; full preflight đạt trong phiên này.

Chưa chạy: `npm ci` mới; tương tác browser/visual audit (gate browser WP2); ledger posting/concurrency/reservation production (WP2/WP3); finalization, sign-off, PDF, file và delivery (WP3); Docker/Linux/NAS/backup/import (WP4); triển khai/gửi thật/pilot (WP5). Smoke HTML/static không phải bằng chứng browser flow. Không tuyên bố các gói đó sẵn sàng từ những phần chưa chạy.

## Xử lý finding trước

Handoff triển khai ghi không còn lỗi đã biết. Các self-fix SQL NULL audit snapshot, limiter hết hạn và React type deprecated được kiểm tra bởi test/lint vừa chạy. Digest source và đường dẫn layout reference đã được tái lập độc lập. Review Claude trước chỉ là cross-check; PASS của nó không giải quyết F-01 mới tái hiện. Ba rủi ro trước vẫn là rủi ro, không tự nâng thành lỗi hay đánh dấu đã sửa.

## Readiness, quyền và bước tiếp theo

- **Software readiness:** WP1 FIX REQUIRED; giữ nguyên source ứng dụng, F-01 chưa sửa, WP2 chưa bắt đầu.
- **Quyền owner:** không cho phép hay thực hiện triển khai/gửi thật; chỉ test local dữ liệu giả lập và smoke loopback. Không thay credential, billing hay Git commit/push.
- **Kết quả pilot:** chưa có; pilot WP5 còn chờ, không tuyên bố kết quả provider/recipient.
- **Một hành động/prompt tiếp theo:** đưa Claude review này cùng [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), chỉ sửa **F-01** với regression có giới hạn, lưu handoff WP1 song ngữ cập nhật, rồi review độc lập lại WP1 trước WP2. Giữ nguyên handoff triển khai gốc; review này là quyết định gate hiện tại.

Các deliverable review ban đầu sau đó được ghi trong commit `c9eb8b9e055a25893fb3c80e3cdde5c2d8271bf4`. Không triển khai production code, thay quy tắc nghiệp vụ canonical hay làm gói tiếp theo.

**Cập nhật điều phối, 2026-10-02:** lượt review ban đầu bỏ sót cập nhật trạng thái. NEXT_ACTION (hai ngôn ngữ), STATE, README và DEVELOPMENT hiện ghi FIX REQUIRED, F-01 chưa sửa và trình tự sửa có giới hạn → review độc lập lại. Prompt active là FIX_FINDINGS; WP2 chưa bắt đầu. Lượt cập nhật này chỉ đổi tài liệu, không thay ứng dụng đã review hay đánh dấu F-01 đã sửa. Xem [checkpoint trạng thái](WP1_STATUS_CHECKPOINT.vi.md) và bằng chứng validation được ghi tại đó. Thay đổi follow-up chưa commit.
