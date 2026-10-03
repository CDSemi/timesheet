# Bàn giao WP1 — Nền tảng và tính giờ

Điền theo [HANDOFF](../templates/HANDOFF.vi.md) bằng bằng chứng thật. Bản dịch của [WP1_HANDOFF.md](WP1_HANDOFF.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/phạm vi, ngày, người làm:** chỉ WP1, theo [WP1_IMPLEMENT](../prompts/WP1_IMPLEMENT.vi.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md): khung TypeScript strict/Hono/React, migration SQLite, đăng nhập cục bộ/quyền sở hữu phiên, bản ghi lịch/chính sách có phiên bản, bộ sinh kỳ lương, engine thuần tính giờ/OT, kiểm tra khoảng thời gian, tham chiếu chính sách lịch sử, bắt buộc lý do sửa cho kỳ cũ/hiện tại, seed tổng hợp và test. Ngày 2026-09-29 → 2026-09-30 (America/Los_Angeles; mốc thời gian trong bằng chứng là UTC). Người làm: Claude Code (desktop, phiên cục bộ) cho Huy. Chưa bắt đầu WP2.

- **Model/effort/tốc độ thật hoặc không quan sát được:** Claude Opus 5.5 (`claude-opus-5-5`). Prompt khuyến nghị Sonnet 5.5 / High; chủ dự án đã được hỏi và chọn tiếp tục với Opus 5.5. Ngữ cảnh phiên báo reasoning effort tối đa và không bật chế độ nhanh; hãy xác nhận trong client, nơi chứa các thiết lập này. Phần kiểm tra thay đổi bố cục (các dòng cuối bảng) được chạy lại ngày 2026-10-01 trong một phiên Claude Sonnet 5.5 (`claude-sonnet-5-5`; báo reasoning effort tối đa, tốc độ không quan sát được), xem `handoff/delivery/evidence/WP1-layout/environment.txt`.

- **Baseline và commit sau, hoặc source archive đủ:** không có commit baseline: chủ dự án đã xóa repo đầu tiên và khởi tạo lại git, nên các mã commit cũ không còn tồn tại. Commit đầu tiên của repo tạo lại, `32cddd99e6dec0f5e7893d2dec0ffcdb310b304e`, chứa WP1; bàn giao này được cập nhật trong commit tiếp theo ngay sau đó (quy tắc editor và line-ending, digest theo blob ID, skill agent `commit-message`), có mã hiển thị trong `git log` vì một commit không thể tự chứa mã của chính nó. Source đã kiểm của commit đó được xác định bằng `npm run digest` (`scripts/source-digest.mjs`, bỏ `delivery/`): `0dd3bc889ab247289a137ef5ff483b92258826e5a066e7474e90ecc605c62524` trên 541 file, với điều kiện mọi file không bị ignore đều được commit (`git add -A`). Script băm blob ID mà git lưu sau khi chuẩn hóa line-ending theo `.gitattributes`, nên không phụ thuộc nền tảng; sau khi commit, kết quả bằng `git ls-tree -r --format='%(path) %(objectname)' HEAD | grep -v '^delivery/' | LC_ALL=C sort | sha256sum` (đã đối chiếu trên một index tạm). Digest trong bàn giao của `32cddd9` (`194958c9…`, 344 file) được tính bằng cách cũ đã bỏ — nối `sha256sum` trong Git Bash, vốn thêm dấu `*` trước đường dẫn và băm file CRLF trong working tree nên khác Linux — trên tập file không gồm `.claude/skills/`, nên không định danh được commit đó; cây của commit đó cho `9541dd8551b6b7de8b240faf3cf9e83207de6dc4f93f2b945b8a32a67e6177fe` trên 538 file với lệnh trên. **Commit bố cục:** ngày 2026-09-30, theo yêu cầu của chủ dự án, một commit tiếp theo trên `bd3204a` (commit thêm báo cáo cross-check của Claude và các skill agent) đã chuyển file quy trình giữa các agent vào `handoff/` (NEXT_ACTION, `prompts/`, `templates/`, `delivery/`) và dữ liệu tham chiếu vào `reference/` (`fixtures/`, `examples/`, `inputs/`), đồng thời cập nhật mọi đường dẫn và bắt đầu theo dõi profile inspection JetBrains dùng chung trong `.idea/inspectionProfiles/`; hành vi không đổi. Digest của commit này bỏ toàn bộ `handoff/`: `63524bd4ee25fb7cf0318a0b0eabc6c46a135f68ecfa1ccc609e6bd91c2a745a` trên 521 file, bằng `git ls-tree -r --format='%(path) %(objectname)' HEAD | grep -v '^handoff/' | LC_ALL=C sort | sha256sum` sau commit đó (đã đối chiếu trên một index tạm). Các digest ở trên thuộc các commit trước với bố cục `delivery/` cũ.

- **Trạng thái triển khai; trạng thái review độc lập:** đã triển khai; mọi lệnh của cổng WP1 bên dưới đã chạy với exit status 0 sau thay đổi code cuối cùng (sau đó chỉ thêm skill agent `commit-message` và sửa bàn giao này). Commit bố cục chỉ đổi code ở đường dẫn file (bộ đọc fixture, seed, script digest và validator); sau đó `npm ci` và `npm run verify` lại đạt trên bản xuất sạch của cây mới (các dòng cuối bảng). Review độc lập: **chưa bắt đầu** — bàn giao này không phải là review.

- **Hành vi đã làm và file đổi:**
  - `src/domain/` — engine thuần dùng chung cho API và UI (không I/O): ngày kế toán; instant UTC chính xác đến giây (từ chối đầu vào dưới giây); tính toán múi giờ IANA dựa trên dữ liệu tz của runtime, từ chối giờ rơi vào khoảng trống DST, dùng fold/offset cho giờ lặp và tách tại nửa đêm; quy tắc khoảng thời gian R-01 (kết thúc sau bắt đầu, giờ nghỉ nằm trong phiên và không chồng nhau, không chồng lấn giữa các phiên của cùng người dùng qua mọi ngày làm việc, phiên mở = không giới hạn); kiểm tra chính sách R-02 (khoảng giá trị B/N/M và phút nguyên, thời lượng tham chiếu = B + giờ nghỉ bị trừ), gợi ý giờ nghỉ dời theo giờ đến và giờ về dự kiến; phân loại R-03 theo từng ngày của đoạn với phiên bản lịch hiệu lực vào đúng ngày đó; công thức ngày R-04 với N kích hoạt chặt và làm tròn M ở điểm giữa xuống, một lần mỗi ngày làm việc; cộng giây trước rồi mới làm tròn xuống một lần cho mỗi loại; số phút thiếu R-05 và các chế độ quyết định (thuần; không ghi sổ gì); kỳ lương P−18…P−5, hạn P−3 lúc 17:00 theo múi giờ báo cáo, ngoại lệ ngày lương tường minh, kỳ "hiện tại" R-07 và yêu cầu lý do sửa.
  - `src/server/` — app Hono với một đường tính toán production duy nhất (`services/timesheets.ts` → `computeWorkDay`). SQLite qua better-sqlite3 (WAL, khóa ngoại, busy timeout, synchronous FULL, giao dịch IMMEDIATE ngắn). Mật khẩu scrypt, token phiên ngẫu nhiên 256 bit chỉ lưu dạng SHA-256, cookie HttpOnly SameSite=Strict (Secure + HSTS khi cấu hình), kiểm tra Origin chính xác và chỉ nhận body JSON cho thay đổi trạng thái, giới hạn đăng nhập, schema request strict, mặc định chỉ lắng nghe loopback. Mọi truy vấn bị giới hạn theo người dùng của phiên; bản ghi của người khác trả 404; vai trò admin không có quyền xem dữ liệu riêng tư. Mục ngày, phiên nhập tay (UTC hoặc giờ địa phương + múi giờ nhập), chấm công vào/ra trực tiếp giữ giây, `expected_version` lạc quan, tăng phiên bản timesheet, bắt buộc lý do và audit chỉ-ghi-thêm (người thực hiện, giờ UTC, thao tác, trước/sau, lý do). Phiên bản chính sách và lịch theo ngày hiệu lực, chỉ thêm; phiên bản mới phải bắt đầu từ ngày đầu kỳ hiện tại trở về sau (trừ phiên bản đầu tiên của người dùng hoặc của lịch); kết quả tính ghi rõ ID phiên bản chính sách và lịch đã dùng. CLI `migrate`/`seed`; seed tổng hợp từ `reference/examples/`.
  - `src/client/` — khung React/Vite: đăng nhập, xem hai tuần chỉ đọc, dùng engine chung để định dạng theo múi giờ hiển thị và giờ/phút, chấm công vào/ra. Hàm xử lý đăng nhập dùng `SubmitEvent` của React thay cho `FormEvent` đã deprecated. Giao diện chỉnh sửa thuộc WP2.
  - Test: `tests/domain/` (đủ 33 kịch bản OT, 32 kịch bản giờ và 16 kịch bản thiếu giờ, đọc trực tiếp từ `reference/fixtures/*.json`, cùng các ca biên của engine), `tests/integration/` (migration mới, bất biến schema, xác thực/CSRF, cô lập hai người dùng, quy tắc API, phục vụ file tĩnh), `scripts/smoke-built-server.mjs`.
  - Repo/công cụ: `package.json`, `package-lock.json` (phiên bản chính xác), `.npmrc` (`engine-strict`), `.nvmrc` (24.21.0), `tsconfig*.json` (strict), TypeScript 6.0.3, `eslint.config.js` (ESLint 10 + typescript-eslint 8, `no-deprecated` ở mức lỗi), `vite.config.ts`, `vitest.config.ts`, `scripts/source-digest.mjs`, `.gitignore` (bản hiện tại của chủ dự án loại `node_modules/`, `dist/`, `coverage/`, CSDL, `.env*`, `.idea/` trừ `inspectionProfiles/` dùng chung, và `**/.claude/settings.local.json`, và theo dõi `.claude/skills/`), `.gitattributes` (LF; CRLF chỉ cho `.bat`/`.cmd`/`.ps1` của Windows; cố định LF cho shell, YAML, Python và Dockerfile; file binary), `.editorconfig` (UTF-8, LF, thụt lề 2 dấu cách, Python 4, giữ khoảng trắng cuối dòng của Markdown). Các script `lint`, `verify` và `digest`. Tài liệu: [DEVELOPMENT.md](../../DEVELOPMENT.md) + bản dịch. Bằng chứng: `handoff/delivery/evidence/WP1/`.

- **Migration/tương thích schema:** CSDL mới; migration 0001 `initial` tạo 12 bảng `STRICT` cùng `schema_migrations`. Migration chạy một lần dưới `BEGIN EXCLUSIVE` trong một giao dịch, ghi checksum SHA-256 và `user_version`, từ chối migration đã áp dụng bị sửa và từ chối CSDL mới hơn binary. Trigger giữ bất biến cho phiên bản chính sách/lịch, sự kiện audit và múi giờ/nhịp kỳ lương của từng lịch, từ chối phiên chồng lấn của một người dùng, giữ giờ nghỉ nằm trong phiên và chặn đổi chủ sở hữu; khóa ngoại kép gắn mục ngày, phiên và giờ nghỉ với một chủ sở hữu. `timesheets.finalized_revision_no` dành cho bước chốt ở WP3.

- **Hợp đồng chuẩn đổi và lý do, hoặc không:** quy tắc nghiệp vụ và tính toán không đổi. Các quyết định của chủ dự án ngày 2026-09-30 đã thay đổi quy tắc dự án, ghi bằng tiếng Anh và tiếng Việt:
  1. Workbook: chủ dự án đã xóa mọi dữ liệu cá nhân và công khai `reference/inputs/Timesheet_Rev8_2026.xlsx` làm mẫu đã làm sạch; không giữ bản gốc cá nhân. Đã cập nhật AGENTS mục 4, README, [reference/inputs/README](../../reference/inputs/README.vi.md), tài liệu 01, 06 (AC-12 nay preview mẫu điền các sheet có ngày giả), 07, 09 và 10, prompt WP4, ghi chú ví dụ và hash nguồn của ví dụ, cùng hash workbook trong validator.
  2. API deprecated: AGENTS mục 11 mới cấm API, kiểu, tùy chọn và gói đã deprecated; `npm run lint` bắt buộc quy tắc này. TypeScript được ghim ở 6.0.3 vì typescript-eslint chưa hỗ trợ TypeScript 7.
  3. Tài liệu trạng thái từ patch rà soát tài liệu của chủ dự án, đã điều chỉnh cho repo tạo lại: NEXT_ACTION (bước tiếp là review WP1; mục 1–4 là lịch sử), trạng thái README, VALIDATION đánh dấu là lịch sử kèm hướng dẫn cho repo hiện tại, `artifact_kind`/`recommended_settings_role` trong STATE, dấu `scope` ở cả hai manifest r1.1, mục skill agent còn thiếu trong bản tiếng Việt, và validator bỏ qua các thư mục công cụ/dependency/skill agent.
  4. Bố cục repo (theo yêu cầu của chủ dự án, ngày 2026-09-30): file quy trình giữa các agent nằm trong `handoff/`, dữ liệu tham chiếu nằm trong `reference/`. Đã cập nhật đường dẫn trong AGENTS mục 1, 4 và 9, CLAUDE, README (thêm bảng thư mục), DEVELOPMENT, tài liệu 01, 02, 06, 08, 09 và 10, các prompt, NEXT_ACTION, STATE, VALIDATION, validator, seed, bộ đọc fixture và script digest; script này nay bỏ toàn bộ `handoff/`, nên sửa trạng thái, prompt hay mẫu không còn làm đổi digest source. Log bằng chứng đã ghi và manifest r1.1 giữ nguyên đường dẫn gốc.
  5. Profile inspection JetBrains dùng chung (quyết định của chủ dự án, ngày 2026-10-01): `.gitignore` nay bỏ qua `.idea/*` trừ `.idea/inspectionProfiles/`; profile của dự án tắt "Import can be shortened" vì cách sửa thành import thư mục làm typecheck NodeNext lỗi (TS2834). DEVELOPMENT có ghi chú.

  Các lựa chọn triển khai trong phạm vi hợp đồng, để review:
  1. Ngày làm việc đã lưu có thể lệch tối đa một ngày so với ngày của giờ bắt đầu theo múi giờ báo cáo (`work_date_mismatch`); chấm công vào luôn dùng ngày theo múi giờ báo cáo.
  2. Phiên nhập tay không được kết thúc quá năm phút trong tương lai (`future_time`): chỉ ghi công việc thật.
  3. Ngày công ty đóng cửa mặc định nhãn Shutdown; FR-03 chỉ nêu ngày lễ.
  4. Phiên bản chính sách/lịch hồi tố trả `retroactive_change`; quy trình hồi tố có tài liệu là việc tương lai (R-07).
  5. Múi giờ báo cáo và nhịp kỳ lương của một lịch không đổi được trong WP1; ngoại lệ ngày lương có trong engine và schema nhưng chưa có API (cài đặt WP2).
  6. Xác nhận giờ nghỉ lưu theo từng phiên (`breaks_confirmed`), không phải cột cấp ngày.
  7. B, N và M bị giới hạn trong một ngày (≤ 1440 phút), ngoài điều kiện B>0, N≥0, M≥1.

- **Bảng kiểm:** các lệnh chạy bằng Node v24.21.0 (bản chính thức dạng portable qua gói npm `node@24.21.0`, đặt đầu PATH; không dùng Node 25.0.0 của hệ thống), npm 11.18.0, TypeScript 6.0.3, ESLint 10.11.0, Windows 11 x64, SQLite 3.53.4, ICU 78.3 / tzdata 2026c. "Bản xuất sạch" = các file của working tree (`git ls-files -co --exclude-standard`) chép ra ngoài Dropbox sau thay đổi cuối cùng.

  | Lệnh | Môi trường | Exit | Kết quả quan sát | Bằng chứng |
  |---|---|---:|---|---|
  | `npm ci` | bản xuất sạch | 0 | 141 gói từ lockfile, không có cảnh báo deprecated | `handoff/delivery/evidence/WP1/npm-ci.txt` |
  | `npm run typecheck` | bản xuất sạch | 0 | tsc strict cho server, client và test: không lỗi | `…/typecheck.txt` |
  | `npm run lint` | bản xuất sạch | 0 | 65 file, không dùng API deprecated | `…/lint.txt` |
  | `npm run digest` so với `git ls-tree` của cây từ index tạm | thư mục dự án | 0 | SHA-256 giống hệt trên cùng 541 file | bảng này (chạy tay) |
  | `npx vitest run --reporter=verbose` | bản xuất sạch | 0 | 10 file, **174/174 test đạt**: 34 fixture OT, 33 fixture giờ, 17 fixture thiếu giờ, 31 engine, 10 migration/schema, 14 xác thực/CSRF, 8 cô lập, 14 API, 9 quy tắc sửa, 4 file tĩnh/giới hạn | `…/test.txt` |
  | `npm run build` | bản xuất sạch | 0 | `dist/domain`, `dist/server`; client Vite 228.5 kB JS | `…/build.txt` |
  | `npm run smoke` | bản xuất sạch, server đã build tại 127.0.0.1:3100 | 0 | 13/13 kiểm tra: migrate mới, migrate lại không đổi, seed, health, client có CSP + SPA fallback, thuộc tính cookie, kỳ hiện tại, 09:00–18:00 = R 480 / tín chỉ 0, admin nhận 404 với phiên của nhân viên, 403 khi thiếu Origin, đăng xuất thu hồi phiên | `…/smoke.txt` |
  | test, build và smoke với `NODE_OPTIONS=--trace-deprecation --pending-deprecation` | thư mục dự án | 0 | 174/174, build và SMOKE PASSED, không có cảnh báo deprecated lúc chạy | bảng này (chạy tay) |
  | `node src/server/index.ts`; `npx vite` | thư mục dự án, trước khi ghim TypeScript 6 | n/a | API dev hoạt động; Vite phục vụ và chuyển tiếp `/api`; origin 5173 được chấp nhận | `…/dev-servers.txt` |
  | `python delivery/validate_package.py --preflight` | thư mục dự án | 1 | kiểm tài liệu và `overtime()` đạt; `times()` dừng vì Python trên Windows này không có CSDL múi giờ IANA | `…/package-validator.txt` |
  | gọi trực tiếp `files(preflight)` và `overtime()` của validator | thư mục dự án | 0 | 35 cặp Anh/Việt có cùng bộ ID quy tắc, 345 link nội bộ, JSON và hash mẫu đạt, 33 kịch bản OT | `…/package-validator.txt` |
  | `npm ci --no-audit --no-fund` | bản xuất sạch của cây bố cục mới (`git archive` từ cây của index tạm), ngoài Dropbox | 0 | 141 gói từ lockfile, không có cảnh báo deprecated | `handoff/delivery/evidence/WP1-layout/npm-ci.txt` |
  | `npm run verify` | cùng bản xuất | 0 | typecheck và lint sạch; 10 file, 174/174 test với fixture đọc từ `reference/fixtures/`; build; smoke 13/13 với seed đọc từ `reference/examples/` | `…/WP1-layout/verify.txt` |
  | `npm run digest` so với `git ls-tree` của cây từ index tạm | thư mục dự án | 0 | cả hai cho `63524bd4…` trên cùng 521 file | `…/WP1-layout/digest.txt` |
  | `python handoff/delivery/validate_package.py --preflight` | thư mục dự án | 1 | `times()` vẫn dừng vì thiếu dữ liệu múi giờ IANA, như trên | `…/WP1-layout/package-validator.txt` |
  | gọi trực tiếp `files(True)`, `overtime()` và `ledger()` của validator | thư mục dự án, sau lần sửa tài liệu cuối | 0 | 36 cặp Anh/Việt có cùng bộ ID quy tắc, 379 link nội bộ, JSON và hash mẫu đạt, 33 kịch bản OT, 16 thiếu giờ và 10 sổ | `…/WP1-layout/package-validator.txt` |

  Các điểm cổng phải kiểm rõ: 09:00–18:00 (TM-01, API, smoke); biên N/M 30/31, 45/46, 75/76 và ghi đè (OT-01…OT-28, API 75→60/76→90); phút ngày nghỉ 15/16/120 (OT-13…OT-19, TM-04, TM-05, TM-31, API); DST khoảng trống/fold/thời gian trôi (TM-16…TM-21, API, engine ngày 23/25 giờ, khoảng trống nửa đêm Santiago); cộng giây (TM-10; engine và chấm công trực tiếp: 8h31m10s → 511, không phải 510); ca qua đêm hỗn hợp (TM-06, TM-07, TM-08, TM-31; phiên ngày + đêm thứ Sáu, ngày thường→ngày lễ, cả hai đêm DST); khoảng thời gian không hợp lệ (TM-12…TM-15 và API); không cộng dồn theo tuần (OT-29); lý do sửa (TM-25…TM-28 và API); kỳ lương (TM-23, TM-24); múi giờ hiển thị (TM-22).

- **ID AC bao phủ; phần chưa chạy/bị chặn thật:** AC-01 cho mọi endpoint WP1 (phiên theo ID, mục ngày, timesheet, chính sách, chấm công; chặn chèn `user_id`; admin không có đặc quyền); sổ OT, PDF, chữ ký và token chưa tồn tại (WP2/WP3). AC-02 đầy đủ (81 trong 91 kịch bản fixture: toàn bộ ca OT, giờ và thiếu giờ). Phần WP1 của AC-04: không cần lý do cho bản nháp hiện tại/tương lai, cần lý do cho kỳ cũ/đã chốt, audit và lịch sử chính sách bất biến; lưu PDF thuộc WP3. Chưa chạy theo thiết kế: kịch bản sổ LG-01…LG-10 và đồng thời AC-03 (WP2); chốt/snapshot (WP3); Docker, Linux/NAS, sao lưu và nhập workbook (WP4); luồng trình duyệt tự động (cổng WP2). CSDL test chỉ chạy trên Windows; binary dựng sẵn cho Linux x64/arm64 có trong gói nhưng chưa được chạy ở đây.

- **Ảnh/PDF/capture giả:** `handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg` — ứng dụng đã build trong trình duyệt của Claude desktop với `employee@example.invalid` và các phiên tổng hợp (tín chỉ 0/30/120/30 phút, tổng 3h 00m, khớp tính tay). WP1 chưa có PDF hay email.

- **Lỗi đã sửa, lỗi còn và backlog tùy chọn:** đã sửa: snapshot audit lưu chuỗi JSON `"null"` thay vì SQL NULL khi không có trạng thái trước/sau (test phát hiện, đã sửa); bộ giới hạn đăng nhập trong bộ nhớ tự dọn cửa sổ hết hạn; cảnh báo Dropbox không còn báo nhầm với tên thư mục chỉ chứa chữ "Dropbox"; client từng dùng `FormEvent` đã deprecated của React (TS6385, nay là `SubmitEvent<HTMLFormElement>`); digest trong bàn giao từng phụ thuộc nền tảng và line-ending của working tree (nay dùng blob ID git đã chuẩn hóa qua `scripts/source-digest.mjs`); validator tài liệu từng quét cả thư mục dependency và skill agent. Không còn lỗi đã biết. Giới hạn/backlog: bộ giới hạn đăng nhập theo tiến trình và theo địa chỉ socket (sau reverse proxy mọi client dùng chung một địa chỉ cho tới khi WP4 cấu hình proxy tin cậy); phiên có thời hạn tuyệt đối 7 ngày, chưa có timeout khi rảnh; người dùng chỉ được tạo qua seed/CLI (quản trị người dùng là WP2); UI là khung chỉ đọc; ngoại lệ ngày lương thêm sau khi dòng kỳ đã tồn tại sẽ không cập nhật dòng đó (WP2 phải xử lý); `npm ci` trong thư mục Dropbox có thể lỗi `EBUSY` khi Dropbox giữ `node_modules`.

- **Đầu vào setup cần chủ cung cấp, không secret:** WP1 không cần. Commit thay đổi bố cục với mọi file không bị ignore (`git add -A`) để digest đã ghi khớp. `32cddd9` đã theo dõi `.claude/skills/`: Git for Windows (`core.symlinks=false`) ghi 40 skill dạng symlink thành bản sao thường của các file trong `.agents/skills/`, nên người dùng Claude Code nhận được chúng khi clone. Khuyến nghị: loại `node_modules/` và `dist/` khỏi đồng bộ Dropbox; cài Node 24 LTS (hoặc dùng `.nvmrc` với trình quản lý phiên bản), vì Node 25.0.0 của hệ thống bị `engine-strict` từ chối. Node portable dùng ở đây nằm tại `%LOCALAPPDATA%\timesheet-dev\node-24.21.0` và có thể xóa bất cứ lúc nào.

- **Thao tác production và phép rõ, thường không:** không có. Không triển khai, không mở host (chỉ loopback), không email hay thông báo, không dữ liệu thật. Workbook được theo dõi là mẫu đã làm sạch được chủ dự án chấp thuận; các bản sao tạm và bản sao lưu tạo ra khi làm sạch đã bị xóa.

- **Usage/credits chỉ khi quan sát thật:** không quan sát được trong phiên này.

- **Một bước tiếp và prompt tương ứng:** sau khi push commit bố cục, đưa ChatGPT Work/Codex repo tại commit đó (hoặc source archive không gồm `node_modules/`, `dist/` và CSDL) cùng bàn giao này, rồi chạy [WP1_REVIEW](../prompts/WP1_REVIEW.vi.md) như mô tả ở mục 5 của [NEXT_ACTION](../NEXT_ACTION.vi.md).

## Phần sửa lỗi: F-01 (WP1-F01-FIX, lần 1)

Thêm sau bản bàn giao gốc ở trên (giữ nguyên). Chỉ sửa phát hiện F-01 trong [WP1_REVIEW](WP1_REVIEW.md); không đụng phát hiện nào khác, quy tắc nghiệp vụ hay engine OT. Chưa được chấp nhận độc lập: reviewer phải kiểm tra lại.

- **Xử lý phát hiện:** F-01 (R-01 giờ nghỉ loại trừ đã xác nhận, R-02 xác nhận thực tế/không có giờ nghỉ khi Clock out, R-04 OT ngày, FR-06, AC-02) đã tái hiện và sửa. Nguyên nhân: `clockOut` chèn giờ nghỉ gửi lên mà không xóa giờ nghỉ đã lưu. Xác nhận lại giờ nghỉ đã lưu bị nhân đôi và lỗi 422 `overlapping_breaks` (F-01A); xác nhận không có giờ nghỉ vẫn giữ dòng cũ và trừ nó (F-01B: R 541 / credit 60 thay vì R 556 / credit 90).
- **Tái hiện trước:** `tests/integration/clock-out-breaks.test.ts` trên SQLite synthetic migrate mới thất bại trước khi sửa: 5 fail / 1 pass. Log: `handoff/delivery/evidence/WP1-F01-FIX/red-before-fix.txt`.
- **File thay đổi:** `src/server/services/timesheetCommands.ts` (chỉ `clockOut`); thêm `tests/integration/clock-out-breaks.test.ts`; bàn giao này và bản dịch; báo cáo task `handoff/delivery/tasks/WP1-F01-FIX.md`; bằng chứng trong `handoff/delivery/evidence/WP1-F01-FIX/`. Worker sửa lỗi không commit.
- **Cách sửa:** trong transaction IMMEDIATE có phạm vi chủ sở hữu hiện có, khi `breaks_confirmed` là true, các dòng `session_breaks` đã lưu của phiên đang mở bị xóa sau bước validate và trước khi cập nhật phiên, rồi chèn tập gửi lên (có thể rỗng), giống `updateSession`. UPDATE phiên nay còn kiểm tra `changes === 1`, nếu không thì ném lỗi stale-version. Một sự kiện audit `work_session.clock_out` có before/after và rollback khi validate lỗi giữ nguyên. Clock out chưa xác nhận (`breaks_confirmed:false`) vẫn giữ các dòng đã lưu và ở `incomplete_breaks` như trước.
- **Test hồi quy (6):** F-01A (200, đóng phiên, một giờ nghỉ, R 541, E 61, credit 60); F-01B (tập rỗng tường minh: xóa giờ nghỉ, R 556, E 76, credit 90, đọc lại ngày khớp); giờ nghỉ khác thay thế chứ không nối thêm (R 526); một sự kiện audit `clock_out` với giờ nghỉ cũ ở `before` và tập mới ở `after`; Clock out chưa xác nhận giữ giờ nghỉ đã lưu và `incomplete_breaks`; tập gửi lên không hợp lệ (`break_outside_session`, `overlapping_breaks`) trả 422, phiên vẫn mở, giờ nghỉ đã lưu, version, version timesheet và số audit không đổi, và Clock out đúng sau đó thành công.
- **Lệnh (Node v24.21.0, thư mục dự án):**

  | Lệnh | Exit | Kết quả | Bằng chứng |
  |---|---:|---|---|
  | `npm exec -- vitest run tests/integration/clock-out-breaks.test.ts` trước khi sửa | 1 | 5 fail, 1 pass | `…/WP1-F01-FIX/red-before-fix.txt` |
  | cùng lệnh sau khi sửa | 0 | 6/6 pass | `…/green-after-fix.txt` |
  | `npm run verify` (typecheck, lint có `no-deprecated`, test, build, smoke) | 0 | 11 file, 180/180 test (174 trước + 6 mới); build sạch; smoke 13/13 | `…/verify.txt` |
  | `npm run digest` | 0 | `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59` (533 file, loại trừ `handoff/`; gồm bản sửa và test chưa commit) | `…/digest.txt` |

- **Chưa kiểm chứng/rủi ro còn lại:** lần chạy này ở thư mục dự án, không phải clean export. Clock out chưa xác nhận mà gửi giờ nghỉ khác rỗng vẫn nối thêm mà không đối chiếu với các dòng đã lưu (không thuộc F-01; review chỉ xét giờ nghỉ đã xác nhận). Kiểm tra lại độc lập, cổng WP1 và WP2 vẫn mở.
- **Một bước review tiếp theo:** đưa kết quả đã commit cho auditor độc lập mới cùng F-01 trong [WP1_REVIEW](WP1_REVIEW.md) và chạy cổng kiểm tra lại WP1 (tài liệu 08) trước WP2.

## Ghi nhận nghiệm thu (coordinator, 2026-10-03)

- **Commit đóng băng và định danh:** `68bbb31435543329b6c51f29703d9e2e7a4290bf` (đã push),
  source digest `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59`.
- **Gate WP1 riêng (WP1-F01-GATE): PASS.** Các kiểm tra chạy trên bản export sạch ngoài
  Dropbox bằng Node 24:
  - `npm ci` exit 0;
  - `npm run verify` exit 0, 180/180 test và smoke 13/13;
  - fixture 115/115;
  - migration và cô lập dữ liệu 18/18;
  - probe F-01A–D riêng của verifier đạt.

  Bằng chứng ở [WP1-F01-GATE](evidence/WP1-F01-GATE/verify.txt).
- **Kiểm tra lại độc lập mới (WP1-F01-AUDIT, Opus): PASS.** F-01 đã được giải quyết.
  Probe riêng của auditor đạt 68/68 trên commit đóng băng và fail 20 trên baseline trước
  khi sửa. Export sạch và `npm run verify` exit 0; digest không đổi trước và sau. Xem
  [WP1_RECHECK](WP1_RECHECK.vi.md).
- **Phần còn lại của Clock out chưa xác nhận:** chấp nhận được, không vi phạm hợp đồng.
  Các dòng chưa xác nhận không bao giờ đi vào OT (R-01, R-02).
- **Rủi ro chuyển sang WP2:**
  - ngữ nghĩa của danh sách giờ nghỉ chưa xác nhận một phần;
  - phiên đang mở nhận giờ nghỉ ở tương lai;
  - Clock out chưa có `expected_version`.

  Test hồi quy tùy chọn: rollback sau bước xóa, và nhánh update không đổi dòng nào.
- **Trạng thái:** WP1 đã implement và được nghiệm thu độc lập. Tiếp theo là WP2, bắt đầu
  bằng plan package.
