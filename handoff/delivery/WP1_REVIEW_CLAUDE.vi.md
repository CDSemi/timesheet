# Review WP1 do Claude thực hiện — Nền tảng và tính giờ

Điền theo [REVIEW](../templates/REVIEW.vi.md) bằng bằng chứng thật. Bản dịch của [WP1_REVIEW_CLAUDE.md](WP1_REVIEW_CLAUDE.md); tiếng Anh là nguồn chuẩn.

> **Không phải review độc lập.** [WP1_REVIEW](../prompts/WP1_REVIEW.vi.md) chỉ định ChatGPT Work/Codex (GPT-6.1 Sol, High, Standard) làm người review, còn [CLAUDE](../../CLAUDE.vi.md) cùng tài liệu [08](../../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md) và [09](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md) giao review độc lập cho ChatGPT. Huy yêu cầu Claude chạy prompt này trong chat. Claude Opus 5.5 cũng là bên triển khai WP1, nên đây là kiểm tra chéo trong một phiên riêng bởi cùng model và có thể chung điểm mù. Báo cáo này không đánh dấu WP1 đã được review độc lập: [STATE](STATE.json) và [NEXT_ACTION](../NEXT_ACTION.vi.md) giữ nguyên, và `delivery/WP1_REVIEW.md` vẫn để trống cho review của ChatGPT.

> **Ghi chú bố cục (ngày 30/09/2026, sau báo cáo này):** file quy trình giữa các agent đã chuyển vào `handoff/` và dữ liệu tham chiếu vào `reference/`. Link bên dưới đã theo vị trí mới; đường dẫn trong nội dung và trong bằng chứng là của commit đã review `d5de7b6`. [Bàn giao WP1](WP1_HANDOFF.vi.md) nêu commit cần review hiện nay.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP1 — Nền tảng và tính giờ. 2026-09-30 (America/Los_Angeles); mốc thời gian trong bằng chứng là UTC (2026-10-01). Reviewer: Claude Code desktop, phiên cục bộ, làm cho Huy. Model `claude-opus-5-5` (Claude Opus 5.5); ngữ cảnh phiên báo reasoning effort tối đa và không bật fast mode — hãy xác nhận trong client. Không chạy agent song song, không đổi billing hay model.

- **Baseline/commit đã kiểm chính xác; source đủ hay không:** commit `d5de7b6ceb6bb8eb9262faea0da1db91999188f3` trên `main` (cha là `32cddd9`, commit WP1 đầu tiên), lấy bằng một `git clone` mới ra ngoài Dropbox. `npm run digest` cho `0dd3bc889ab247289a137ef5ff483b92258826e5a066e7474e90ecc605c62524` trên 541 file, trùng với chuỗi lệnh `git ls-tree` và với bàn giao; cây của `32cddd9` cho `9541dd85…` trên 538 file, đúng như bàn giao nói. Source đầy đủ: mã, lockfile, migration, test, fixture, tài liệu, bàn giao và bằng chứng của nó. Thư mục làm việc của chủ dự án còn một thay đổi chưa commit nằm ngoài ứng dụng, `.claude/skills/commit-message/SKILL.md` (nội dung agent skill; digest thư mục làm việc `d04f6810…`), không thuộc phạm vi review.

- **Quyết định: PASS (kiểm tra chéo do Claude; không độc lập).** Không quan sát thấy lỗi nào so với gate WP1; các fixture AC-02 (81/91, toàn bộ ca thời gian/OT/thiếu giờ) đạt và khớp một oracle độc lập. Có ba rủi ro cần chủ dự án quyết (RISK-1…RISK-3 bên dưới). Theo quy tắc dự án, WP2 vẫn phải chờ review độc lập của ChatGPT, trừ khi Huy ghi nhận một ngoại lệ rõ ràng.

- **Phạm vi thật đã xem/chạy:**
  - Tài liệu: AGENTS, CLAUDE, NEXT_ACTION, STATE, DEVELOPMENT, bàn giao WP1, các prompt WP1_IMPLEMENT/WP1_REVIEW/FIX_FINDINGS, tài liệu 01, 02, 03, 06, 08 và 09, hướng dẫn fixture và cả ba file fixture.
  - Mã đã lần theo: toàn bộ `src/domain/`, `src/server/` (migration 0001 và bộ chạy migration, pragma cơ sở dữ liệu, xác thực, bảo mật/kiểm tra/lỗi HTTP, route, service, seed, cấu hình, điểm vào), `src/client/`, bộ khung test, cả 10 file test và hai script.
  - Đường gọi production: mọi phép tính API trả về đều đi qua `buildDayView` (`src/server/services/timesheets.ts`) → `computeWorkDay` → `computeDailyOvertime` → `roundToStepMidpointDown`. Không có mã OT hay làm tròn nào khác, client chỉ định dạng giá trị, và `src/domain` không làm I/O, không đọc đồng hồ.
  - Đã chạy: toàn bộ gate trên bản clone sạch, cùng bốn probe viết riêng cho review này từ tài liệu 01 và 02 chứ không từ mã (source trong [probes](evidence/WP1-review-claude/probes/oracle.mjs.txt)): một oracle độc lập, kịch bản API trên cơ sở dữ liệu vừa migrate, HTTP thô với server đã build, và các trường hợp biên của ngoại lệ ngày lương.
  - Chưa xem: thư mục agent skill, file workbook nhị phân, và bản dịch tiếng Việt ngoài phần kiểm cặp/ID/liên kết của validator.

- **Bảng bằng chứng** (Node 24.21.0, npm 11.18.0, Windows 11 x64, SQLite 3.53.4, ICU 78.3 / tzdata 2026c; log trong [evidence/WP1-review-claude](evidence/WP1-review-claude/environment.txt)):

  | Lệnh | Môi trường | Exit | Kết quả quan sát | Bằng chứng |
  |---|---|---:|---|---|
  | `git clone --no-hardlinks`, `git log -1`, `git status` | ổ scratch ngoài Dropbox | 0 | `d5de7b6`, cây sạch. Lần `git log` đầu exit 128 (ổ đĩa không ghi quyền sở hữu); sau đó git chạy với `safe.directory` ghi đè theo từng tiến trình, không đổi cấu hình global | `environment.txt` |
  | `npm ci --no-audit --no-fund` | clone sạch | 0 | 141 gói từ lockfile; không có dòng cảnh báo hay deprecation | `npm-ci.txt` |
  | `npm run typecheck` | clone sạch | 0 | không lỗi | `typecheck.txt` |
  | `npm run lint` | clone sạch | 0 | không có phát hiện (`no-deprecated` là lỗi) | `lint.txt` |
  | `npm test -- --reporter=verbose` với `NODE_OPTIONS="--trace-deprecation --pending-deprecation"` | clone sạch | 0 | 10 file, **174/174**: 34 fixture OT, 33 fixture thời gian, 17 fixture thiếu giờ, 31 engine, 10 migration, 14 xác thực, 8 cô lập, 14 API, 9 quy tắc sửa, 4 static; không có cảnh báo deprecation | `test.txt` |
  | `npm run build` (cùng tùy chọn) | clone sạch | 0 | `dist/domain`, `dist/server`; JS client 228.53 kB | `build.txt` |
  | `npm run smoke` với `SMOKE_PORT=3197` (cùng tùy chọn) | server đã build, 127.0.0.1 | 0 | 13/13 PASS: migrate mới và lặp lại, seed, 09:00–18:00 ngày 2026-09-28 = R 480 / ghi sổ 0, admin 404, 403 khi thiếu Origin, logout thu hồi phiên | `smoke.txt` |
  | `npm run digest`; `git ls-tree … \| sha256sum` | clone sạch; thư mục làm việc của chủ | 0 | cả hai `0dd3bc88…` (541 file) cho `d5de7b6`; thư mục làm việc `d04f6810…` | `digest.txt` |
  | `node probe-domain.mjs <clone>` | engine đã build `dist/domain` | 0 | **5.054.727 phép kiểm, 0 lỗi** (chi tiết bên dưới) | `probe-domain.txt` |
  | `node probe-api.mjs <clone>` | app chạy trong tiến trình, SQLite migrate mới cho mỗi kịch bản | 0 | **51 phép kiểm, 0 lỗi**, 3 ghi chú (RISK-1, RISK-2, OPT-1) | `probe-api.txt` |
  | `node probe-http.mjs <clone> <work>` | server đã build qua socket thật, 127.0.0.1:3198 | 0 | **37 phép kiểm, 0 lỗi** | `probe-http.txt` |
  | `node probe-exceptions.mjs <clone>` | engine đã build | 0 | quan sát cho RISK-3 | `probe-exceptions.txt` |
  | `python delivery/validate_package.py --preflight` | clone sạch, Python 3.14.6 | 1 | dừng ở `times()`: không có dữ liệu múi giờ IANA (thiếu module `tzdata`) — **bị chặn, không phải đạt** | `package-validator.txt` |
  | gọi trực tiếp `files(True)`, `overtime()`, `ledger()` của validator | clone sạch | 0 | 35 cặp Anh/Việt cùng ID, 345 liên kết nội bộ, 33 kịch bản OT, 16 + 10 ca kế toán sổ | `package-validator-direct.txt` |

- **Tính lại độc lập.** Oracle (`probes/oracle.mjs.txt`) dùng số học ngày dân sự của Hinnant, luật DST theo luật định của Mỹ cho America/Los_Angeles, gán ngày theo từng phút UTC và làm tròn theo khoảng cách; không dùng chung phần nào với `src/`.
  - R-04: mọi R 0…1440 × 17 giá trị O × 180 tổ hợp B/N/M (4.409.471 ca kể cả các ca có tên) đều bằng `computeDailyOvertime`. Các ngưỡng review với B 480 / N 30 / M 30:

    | Phút dư ngày thường E | 30 | 31 | 45 | 46 | 75 | 76 |
    |---|---:|---:|---:|---:|---:|---:|
    | Ghi sổ (oracle = engine = API) | 0 | 30 | 30 | 60 | 60 | 90 |

    | Phút ngoài lịch O | 15 | 16 | 120 |
    |---|---:|---:|---:|
    | Ghi sổ (oracle = engine = API) | 0 | 30 | 120 |

  - R-01/R-03: 12.000 ngày ghi sổ ngẫu nhiên trên tám cấu hình múi giờ/oracle (Los Angeles với cả luật định và ICU, Hồ Chí Minh, Santiago có DST lúc nửa đêm, Lord Howe đổi 30 phút, London, Kolkata, St John's): 1–3 phiên kết thúc lẻ giây, giờ nghỉ (có cái tính công, có cái vắt qua nửa đêm), phiên mở, nghỉ chưa xác nhận và một phiên bản lịch thứ hai có hiệu lực giữa ca. Giây và phút ngày thường/ngoài lịch, phút dư, đủ điều kiện, ghi sổ và phân loại từng đoạn đều khớp. Độ phủ: 6.026 ngày nhiều ngày lịch, 136 lần vượt DST Los Angeles, 6.714 ngày nhiều phiên, 367 giờ nghỉ qua nửa đêm, 2.957 ngày có đoạn được phân loại bằng phiên bản lịch sau. Probe sẽ bắt được lỗi làm tròn từng phiên ở 2.270 lượt và lỗi đúng giữa của `Math.round` ở 127 lượt.
  - R-07 giờ địa phương: mọi phút của tám ngày (các ngày chuyển giờ 2026 và 2027 cùng ngày đối chứng). Giờ rơi vào khoảng trống bị từ chối (`nonexistent_local_time`), giờ lặp cần fold hoặc offset (`ambiguous_local_time`), fold 0/1 và offset −07:00/−08:00 cho đúng thời điểm theo luật định, offset sai trả `offset_mismatch`.
  - FR-02/R-07 kỳ lương: mọi ngày 2024–2029 — kỳ P−18…P−5, payroll thứ Sáu, hạn thứ Ba 17:00 Los Angeles quy đổi đúng qua DST, hiện tại = payroll sớm nhất bằng/sau hôm nay, quan hệ cũ/hiện tại/tương lai và yêu cầu lý do (30.688 phép kiểm).
  - R-02 giờ vào linh hoạt: vào 07:00/08:00/09:00 cho gợi ý nghỉ 09:00/11:00/13:30, 10:00/12:00/14:30 và 11:00/13:00/15:30 cùng giờ ra 16:00/17:00/18:00. Gợi ý chưa xác nhận giữ ngày ở `incomplete_breaks`, ca 1 giờ giữ 60 phút, lịch tham chiếu không nhất quán bị từ chối.
  - R-05: lưới 6.480 ca thiếu giờ (chỉ yêu cầu hiện diện với Worked trên ngày làm theo lịch, phép tối đa B, chưa biết vẫn là null).
  - Oracle tái tạo 61 kết quả mong đợi của fixture: cả 28 ca OT, 17 ca thời gian dạng tính khoảng/chưa đủ và 16 ca thiếu giờ.
  - Các mục gate bắt buộc qua API (cơ sở dữ liệu mới, lịch và chính sách seed, kỳ vọng từ oracle; TM-01 09:00–18:00 đã có test và smoke):

    | Kịch bản (America/Los_Angeles) | R | O | Đủ điều kiện | Ghi sổ |
    |---|---:|---:|---:|---:|
    | T6 09:00–17:30 (nghỉ 45 phút) + T6 22:00–T7 02:30, cùng một ngày ghi sổ | 585 | 150 | 255 | 240 (đúng giữa làm tròn xuống) |
    | T4 20:00–T5 04:00 sang Lễ Tạ ơn, nghỉ 23:45–00:15 | 225 | 225 | 225 | 210 (đúng giữa làm tròn xuống) |
    | T7 22:00 PST–CN 06:00 PDT (vào giờ mùa hè, trôi qua 7 giờ) | 0 | 420 | 420 | 420 |
    | CN 23:00–T2 07:00 sau khi vào giờ mùa hè | 420 | 60 | 60 | 60 |
    | T7 22:00 PDT–CN 06:00 PST (ra giờ mùa hè, trôi qua 9 giờ) | 0 | 540 | 540 | 540 |
    | CN 20:00–T2 05:00 sau khi ra giờ mùa hè | 300 | 240 | 240 | 240 |
    | Ba phiên 180 + 240 + 136 trong một ngày thường | 556 | 0 | 76 | 90 |
    | Hai phiên UTC 4h15m40s mỗi phiên (dạng TM-10) | 511 | 0 | 31 | 30 |
    | 07:00–16:00 với giờ nghỉ dời sớm một tiếng | 480 | 0 | 0 | 0 (thiếu 0) |
    | Thứ Bảy 15 phút / Chủ nhật 16 phút / Ngày Lao động 120 phút | 0 | 15 / 16 / 120 | 15 / 16 / 120 | 0 / 30 / 120 |

  - AC-01 (`probe-api` mục B cùng test có sẵn): GET/PUT/DELETE phiên của user khác trả 404 giống hệt từng byte với một ID ngẫu nhiên không tồn tại, và bản ghi không đổi. Timesheet, màn hình ngày và tổng của admin không chứa gì của employee, và không ai clock out được phiên đang chạy của user khác. Tám lần thử trên cả bảy endpoint ghi có thêm `user_id`, `owner_user_id`, `work_date` hoặc `session_id` đều bị từ chối (422). Lỗi chồng lấn chỉ nêu phiên của chính người gọi, danh sách chính sách và người làm/chủ sở hữu trong audit đều theo từng user. SQL thô không chuyển được chủ của phiên hay timesheet có ngày ghi sổ sang user khác.
  - AC-04, phần WP1 (`probe-api` mục C và D cùng test): kỳ cũ cần lý do khi sửa ngày, phiên, xóa và clock out, kể cả phiên đang chạy mà kỳ đã thành cũ trước lúc clock out. Nháp hiện tại/tương lai không cần, timesheet đã chốt luôn cần. Audit giữ người làm, thời điểm UTC, thao tác, lý do và trước/sau chính xác kể cả giờ nghỉ. Phiên bản cũ trả 409. Phiên bản chính sách và lịch chỉ thêm, không sửa, và kết quả mang ID phiên bản chính sách và lịch đã dùng.
  - HTTP (`probe-http`): 15 đường dẫn traversal thô (dấu chấm mã hóa, gạch ngược, ký tự ổ đĩa, NUL) chỉ trả trang SPA. Cookie là `HttpOnly; SameSite=Strict; Path=/`, phản hồi API có no-store và CSP. Origin thiếu, `null`, sai cổng hoặc có gạch chéo cuối và `Sec-Fetch-Site: cross-site` cho 403; thân text/plain và form cho 415; thân 70 kB cho 413. Năm lần đăng nhập sai cho 429 kể cả khi sau đó nhập đúng mật khẩu (`Retry-After` 900), tài khoản khác không bị ảnh hưởng. Chế độ production từ chối khởi động nếu thiếu `APP_ORIGINS` và mặc định cookie Secure.

- **Phát hiện (lỗi quan sát được):** không có. Không mục nào bên dưới là vi phạm đã chứng minh của một quy tắc có trong tài liệu, và không thêm phát hiện nào cho đủ mẫu.

- **Rủi ro cần chủ dự án quyết (không phải lỗi):**

  | ID | Mức / thời điểm | Vị trí | Tái hiện | Quan sát so với quy tắc | Sửa có phạm vi |
  |---|---|---|---|---|---|
  | RISK-1 | Trung bình; quyết ngay (ngữ nghĩa lý do của WP1) | `resolveSession` (dung sai ±1 ngày của ngày ghi sổ, lựa chọn 1 trong bàn giao) cùng `prepareEdit`, `src/server/services/timesheetCommands.ts` | Đồng hồ 2026-10-03T20:00Z (kỳ hiện tại 2026-09-28…2026-10-11). `POST /api/days/2026-09-28/sessions` với 2026-09-27 22:00–23:30 Los Angeles, không có lý do | 201: giờ làm nằm trọn trong ngày 2026-09-27 thuộc kỳ cũ được lưu vào ngày hiện tại 2026-09-28 và ghi sổ 90 ở đó mà không cần lý do; cùng phiên đó với ngày ghi sổ 2026-09-27 thì cần (422 `reason_required`). R-03 nói phiên *thường* thuộc ngày ghi sổ lúc bắt đầu và R-07 yêu cầu lý do cho kỳ cũ và kỳ đã chốt; tài liệu không định nghĩa ngoại lệ này. Sau WP3, cùng đường này có thể chuyển giờ làm khỏi ngày cuối của kỳ đã chốt | Chỉ cho phép ngày bắt đầu = ngày ghi sổ hoặc ngày ghi sổ + 1 (phần tiếp sau nửa đêm), hoặc yêu cầu thêm lý do khi ngày bắt đầu của phiên theo múi giờ báo cáo thuộc kỳ cũ hay kỳ đã chốt; thêm test hồi quy API |
  | RISK-2 | Trung bình; trước WP3 | `prospectiveBoundary`/`assertProspective`, `src/server/services/calendars.ts` (chính sách và lịch) | Đồng hồ 2026-09-30T20:00Z, sau hạn 2026-09-29 17:00. `POST /api/policies` hiệu lực 2026-09-14 (N 0, M 15) | 201 không cần lý do; ngày 2026-09-15 (08:00–17:40, không nghỉ) đổi từ ghi sổ 90 thành 105. "Hiện tại" kéo dài tới payroll, ba ngày sau hạn, nên phiên bản tạo lúc đó vẫn đổi được một kỳ mà WP3 đã nộp. R-07 muốn thay đổi áp dụng về sau, snapshot đã chốt không bị âm thầm viết lại, và sửa cũ giữ quy tắc lịch sử. Không phải lỗi WP1 vì chưa có gì được chốt | Ở WP3, lấy ngày hiệu lực sớm nhất là ngày muộn hơn giữa đầu kỳ hiện tại và ngày sau kỳ đã chốt gần nhất (hoặc hôm nay); nếu không thì dùng quy trình hồi tố có ghi nhận. Test với một kỳ đã chốt |
  | RISK-3 | Thấp; cùng API cài đặt của WP2 | `validatePayrollExceptions`, `src/domain/periods.ts` | Engine: ngoại lệ dời payroll 2026-10-02 sang 2026-09-26 | Được chấp nhận; chỉ kiểm "trong nửa chu kỳ". Ngày 2026-09-27 payroll hiện tại thành 2026-10-16, nên kỳ đang chạy 2026-09-14…2026-09-27 bị coi là cũ và sửa ngày hôm nay cần lý do, còn hạn 2026-09-29 vẫn nằm sau payroll (FR-02, R-07). Ở WP1 không có API hay seed nào tạo ngoại lệ | Từ chối payroll bằng hoặc trước ngày cuối kỳ và hạn nộp sau payroll, hoặc ghi một quy tắc của chủ dự án; thêm test |

- **Quan sát và đề xuất tùy chọn:**
  - OBS-1: giờ vào linh hoạt mới chỉ có trong engine (`suggestBreaks`, `expectedFinishUtc`); chưa API hay UI nào dùng. WP2 nên gọi các hàm này thay vì viết lại.
  - OBS-2: mỗi phiên bản lịch là một bộ quy tắc đầy đủ. Phiên bản sau phải lặp lại mọi ngày lễ về sau, nếu không các ngày đó thành ngày thường kể từ ngày hiệu lực của nó (`edit-rules.test.ts` tạo đúng một phiên bản như vậy). Phần nhập ngày lễ của WP2 nên tạo phiên bản đầy đủ và cho xem trước khác biệt.
  - OBS-3: giới hạn đã nêu trong bàn giao, không nêu lại thành phát hiện: bộ giới hạn đăng nhập theo tiến trình, khóa theo địa chỉ socket (cấu hình proxy ở WP4), phiên tuyệt đối 7 ngày không có timeout khi rảnh, quản trị user ở WP2, cơ sở dữ liệu mới chỉ chạy trên Windows.
  - OPT-1: `session_breaks` chỉ có trigger khi INSERT; lệnh UPDATE bằng SQL thô dời giờ nghỉ ra ngoài phiên hoặc chồng lên giờ nghỉ khác vẫn được chấp nhận. API không bao giờ cập nhật dòng nghỉ (nó xóa rồi chèn), nên trigger BEFORE UPDATE chỉ là phòng thủ nhiều lớp.
  - OPT-2: `clockOut` bỏ qua `changes` của lệnh UPDATE có kiểm phiên bản, khác các hàm ghi còn lại. Hiện vẫn an toàn vì đọc và ghi cùng một transaction IMMEDIATE.
  - OPT-3: thân JSON không có `Content-Type` vẫn được nhận, vì `requireJsonContentType` chỉ từ chối khi có kiểu khác JSON. CSRF vẫn bị chặn bởi kiểm Origin chính xác và SameSite=Strict; bắt buộc `application/json` mỗi khi có thân sẽ khớp với chú thích của quy tắc.
  - OPT-4: `validate_package.py --preflight` cần gói Python `tzdata` trên máy này (`pip install tzdata`). Chưa cài ở đây vì việc tải về cần chủ dự án đồng ý.

- **Gate chưa chạy/bị chặn và lý do:** `times()` của validator Python (bị chặn: không có dữ liệu IANA; cùng các fixture đó đã chạy trong Vitest và oracle, nhưng không tính là validator đạt); Linux x64/arm64, Docker và NAS (WP4); kịch bản sổ LG-01…LG-10 và đồng thời AC-03 (WP2 theo thiết kế); luồng trình duyệt (ngoài gate WP1; client đã build mới chỉ được phục vụ và kiểm CSP cùng fallback); **chính review độc lập của ChatGPT**.

- **Xử lý phát hiện trước:** chưa có review nào trước đây. Đã kiểm lại các mục bàn giao tự sửa: trạng thái trước/sau vắng mặt trong audit là SQL NULL; bộ giới hạn dọn cửa sổ hết hạn (có test); cảnh báo Dropbox khớp nguyên một đoạn đường dẫn (`src/server/index.ts`); không còn `FormEvent` deprecated của React (lint sạch); digest không phụ thuộc nền tảng (đã tái hiện); validator bỏ qua thư mục công cụ (35 cặp).

- **Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:** phần mềm — nền tảng WP1 đạt gate trong lần kiểm tra chéo này, chưa có UI chỉnh sửa, sổ, PDF, email hay Docker, đúng phạm vi; phép chủ — không cần và không dùng (không triển khai, không gửi, không dữ liệu thật, không đổi billing); pilot — chưa áp dụng trước WP5.

- **Một bước/prompt tiếp:** giao commit `d5de7b6` cho ChatGPT Work/Codex làm [WP1_REVIEW](../prompts/WP1_REVIEW.vi.md) độc lập như mục 5 của [NEXT_ACTION](../NEXT_ACTION.vi.md), không kèm báo cáo này để kết luận giữ được tính độc lập. Sau đó gửi mọi mục được chấp nhận — phát hiện của ChatGPT và những mục trong RISK-1…RISK-3 mà Huy chấp nhận — cho Claude trong một vòng [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md).

Chạy lại probe: chép `evidence/WP1-review-claude/probes/` ra ngoài repository và bỏ đuôi `.txt` (đuôi này giữ chúng ngoài gate lint). Trong một bản clone của commit đã review, chạy `npm ci && npm run build`, rồi dùng Node 24: `node probe-domain.mjs <clone>`, `node probe-api.mjs <clone>`, `node probe-http.mjs <clone> <thư-mục-trống>` và `node probe-exceptions.mjs <clone>`. `probe-api` import trực tiếp bộ khung test TypeScript của repository nhờ type stripping của Node 24.
