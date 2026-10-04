# Hướng dẫn phát triển

Trạng thái: **WP1 đã được chấp nhận độc lập; WP2 đã triển khai (T01–T13), đang chờ gate cuối gói và các audit độc lập; chưa được chấp nhận.** Xem [bàn giao WP2](handoff/delivery/WP2_HANDOFF.vi.md) và [bước tiếp theo](handoff/NEXT_ACTION.vi.md). Tiếng Anh là nguồn chuẩn; đây là bản dịch của [DEVELOPMENT.md](DEVELOPMENT.md). Quy tắc nghiệp vụ nằm ở [02 Giờ và OT](docs/02_TIME_AND_OT_RULES.vi.md) và [03 Kiến trúc](docs/03_ARCHITECTURE_AND_DATA.vi.md); tài liệu này chỉ giải thích cách chạy mã.

## Điều kiện cần

- **Bắt buộc Node.js 24 LTS.** Được ghim bằng `.nvmrc` (24.21.0) và `engines` (`^24.11.0`); `.npmrc` bật `engine-strict` nên npm từ chối bản chính khác như Node 25 hoặc 26. Đặt Node 24 lên đầu `PATH` (kiểm `node --version`): bước build, script smoke, harness e2e và mọi tiến trình con đều dùng runtime đó.
- **Trình duyệt cho test e2e:** Microsoft Edge đã cài (`channel: msedge`, mặc định). `E2E_CHANNEL=chrome` dùng Chrome đã cài; `E2E_CHANNEL=chromium` cần `npx playwright install chromium` (tải ngoài repo). Mặc định không tải gì.
- **TypeScript 6.0.3**, không phải 7: bộ lint có thông tin kiểu dùng để bắt buộc quy tắc không dùng API deprecated (typescript-eslint) chưa hỗ trợ trình biên dịch native của TypeScript 7. Hai phiên bản kiểm cùng một ngôn ngữ.
- npm 11. `allowScripts` từ chối bước dự phòng `node-gyp` của `better-sqlite3`, vì gói đã kèm binary N-API cho Windows, Linux (glibc/musl) và macOS trên x64/arm64.
- Không cần máy chủ CSDL: một file SQLite cục bộ. Giữ CSDL đang chạy **ngoài Dropbox** (xem [07 Vận hành](docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md)); đường dẫn mặc định là `%LOCALAPPDATA%\timesheet-dev\timesheet.db` (hoặc `~/.local/share/timesheet-dev/` trên hệ khác).
- Khuyến nghị khi thư mục dự án được đồng bộ: loại `node_modules/` và `dist/` khỏi Dropbox, vì khóa đồng bộ có thể làm `npm ci` lỗi `EBUSY`.

## Lệnh

~~~bash
npm ci                 # cài đúng dependency theo package-lock.json
npm run typecheck      # tsc strict cho server, client và test
npm run lint           # ESLint + typescript-eslint: không dùng API deprecated (AGENTS.md mục 11)
npm test               # mọi bộ Vitest (fixture, engine, tích hợp SQLite/HTTP)
npm run test:fixtures  # chỉ test miền và fixture
npm run test:e2e       # build rồi chạy luồng trình duyệt Playwright (desktop 1280x800 và mobile 390x844); không nằm trong verify
npm run build          # tsc → dist/domain + dist/server; Vite → dist/client
npm run smoke          # server đã build qua HTTP thật với CSDL dùng một lần
npm run verify         # typecheck, lint, test, build và smoke trong một lần chạy
npm run digest         # digest source không phụ thuộc nền tảng (bỏ handoff/) cho bàn giao
npm run migrate        # áp migration còn thiếu vào DATABASE_PATH
npm run seed           # người dùng tổng hợp example.invalid và dữ liệu mẫu; bị từ chối khi NODE_ENV=production
npm start              # ứng dụng đã build (API + client) tại http://127.0.0.1:3000
~~~

Server phát triển: `npm run dev:server` (API cổng 3000, dùng type stripping của Node) và `npm run dev:client` (Vite cổng 5173, chuyển tiếp `/api`).

Seed (`npm run seed`) tạo ba tài khoản: `admin@example.invalid`, `employee@example.invalid` và `employee2@example.invalid`. Cung cấp `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD` và `SEED_EMPLOYEE2_PASSWORD` (mỗi biến từ 12 ký tự) hoặc để seed in mật khẩu phát triển ngẫu nhiên một lần; không có mật khẩu nào nằm trong source. `employee2` còn có dữ liệu mẫu, đều ghi qua các service production: ba phiên làm việc ngày thường gần đây, một yêu cầu nghỉ OT (240 phút, đã ghi quyền cho phép) và một khoản tín dụng khởi tạo 600 phút ghi qua service sổ cái nội bộ với khóa khởi tạo tường minh `seed-setup-credit-employee2` và lý do. Seed không bao giờ suy ra số dư đầu kỳ từ timesheet. `employee@example.invalid` để trống, các test e2e dựa vào điều này. Vai trò admin chỉ quản lý tài khoản và cấu hình: không có quyền xem timesheet, sổ cái, nghỉ OT, lịch sử hay bản xuất của người khác.

## Cấu hình

| Biến | Mặc định | Mục đích |
|---|---|---|
| `HOST` | `127.0.0.1` | Địa chỉ lắng nghe; chỉ loopback, không mở ra mạng |
| `PORT` | `3000` | Cổng HTTP |
| `DATABASE_PATH` | đường dẫn app-data cục bộ ở trên | File SQLite (WAL, khóa ngoại, busy timeout, synchronous FULL) |
| `APP_ORIGINS` | localhost/127.0.0.1 trên `PORT` và 5173 | Các origin chính xác được phép thay đổi dữ liệu; **bắt buộc** khi `NODE_ENV=production` |
| `COOKIE_SECURE` | `true` khi production | Thêm `Secure` cho cookie phiên và gửi HSTS |
| `SESSION_TTL_HOURS` | `168` | Thời hạn tuyệt đối của phiên server |
| `STATIC_DIR` | `dist/client` cạnh server đã build | Thư mục client đã build |

## Cấu trúc

| Đường dẫn | Trách nhiệm |
|---|---|
| `src/domain/` | Engine thuần dùng chung cho API và UI: ngày, instant UTC, múi giờ IANA/DST, khoảng thời gian, lịch, chính sách, OT R-04, thiếu giờ R-05, kỳ lương, lý do sửa |
| `src/server/db/` | Kết nối SQLite và migration có phiên bản, có checksum (bảng `STRICT`, khóa sở hữu, trigger bất biến và chống chồng lấn) |
| `src/server/auth/` | Mật khẩu scrypt, phiên thu hồi được lưu dạng băm, giới hạn đăng nhập |
| `src/server/services/` | Lịch, chính sách, kỳ lương, truy vấn và lệnh timesheet, audit |
| `src/server/routes/`, `http/` | Route Hono, schema, origin/CSRF và xử lý lỗi |
| `src/client/` | Client React: khung điều hướng, lưới hai tuần và danh sách ngày trên mobile, trình sửa ngày, màn OT, lịch sử, cài đặt và quản trị |
| `tests/domain/` | Mọi kịch bản trong `reference/fixtures/overtime_cases.json`, `time_cases.json` và các ca thiếu giờ của `ledger_cases.json`, cùng các ca biên của engine |
| `tests/integration/` | Migration mới và nâng cấp, bất biến schema, xác thực, cô lập hai người dùng, quy tắc API, service sổ cái và nghỉ OT, đồng thời nhiều kết nối |
| `tests/client/`, `tests/e2e/` | Unit test logic hiển thị thuần; luồng trình duyệt Playwright trên server đã build, CSDL tạm và seed tổng hợp |
| `reference/` | Dữ liệu tham chiếu: fixture do `tests/domain/` đọc, ví dụ do seed giả đọc, workbook mẫu đã làm sạch |
| `handoff/` | Quy trình giữa các agent (trạng thái, prompt, mẫu, bàn giao, review, bằng chứng); không tính vào `npm run digest` |
| `scripts/smoke-built-server.mjs` | Kiểm tra đầu-cuối server đã build, gồm 403/404 chéo vùng, tổng hợp OT và header CSV bằng chứng |
| `scripts/source-digest.mjs` | Digest source ghi trong bàn giao |
| `eslint.config.js` | Gate lint: `@typescript-eslint/no-deprecated` |
| `.editorconfig`, `.gitattributes` | UTF-8, LF, thụt lề 2 dấu cách (Python 4); CRLF chỉ cho `.bat`/`.cmd`/`.ps1` của Windows; file binary |
| `.idea/inspectionProfiles/` | Profile inspection JetBrains dùng chung (phần còn lại của `.idea/` chỉ ở máy cục bộ): tắt "Import can be shortened", vì cách sửa thành import thư mục làm typecheck NodeNext lỗi (TS2834) |

## API (lõi WP1)

Mọi route nằm dưới `/api`, trả JSON và chỉ lấy chủ sở hữu từ cookie phiên; đối tượng request là strict nên các trường như `user_id` bị từ chối. Request thay đổi trạng thái cần `Origin` được phép và body JSON.

| Phương thức và đường dẫn | Mục đích |
|---|---|
| `GET /health` | Kiểm tra sống, không có dữ liệu cá nhân |
| `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Đăng nhập cục bộ và phiên |
| `GET /calendar` | Lịch công ty của người gọi, các phiên bản và quy tắc kỳ lương |
| `GET /periods/current`, `GET /periods?from=&to=` | Kỳ hiện tại (đến hạn), kỳ đang diễn ra, danh sách kỳ |
| `GET /timesheets/{payrollDate}` | Mười bốn ngày với phân loại, phiên làm việc và kết quả tính tạm |
| `GET /days/{date}`, `PUT /days/{date}` | Xem ngày; nhãn, số phút nghỉ một phần, WFH và ghi chú |
| `POST /days/{date}/sessions` | Phiên nhập tay: chuỗi UTC `…Z` hoặc `{local, zone, fold?, offset?}` |
| `GET`, `PUT`, `DELETE /sessions/{id}` | Phiên của chính mình; sửa và xóa cần `expected_version` |
| `POST /clock/in`, `POST /clock/out` | Chấm công trực tiếp theo giờ server (giữ giây); khi ra xác nhận giờ nghỉ hoặc để chưa biết |
| `GET /policies`, `POST /policies` | Phiên bản chính sách theo ngày hiệu lực của chính mình (chỉ thêm, áp dụng về sau) |

Lỗi có dạng `{ "error": { "code", "message", "details?" } }`: 401 xác thực, 403 origin, 404 không tìm thấy (kể cả bản ghi của người khác), 409 `stale_version`/bất biến/xung đột, 415 kiểu dữ liệu, 422 kiểm tra hợp lệ (mã miền như `overlapping_user_intervals`, `nonexistent_local_time`, `reason_required`, `retroactive_change`), 429 giới hạn tần suất.

Các vùng WP2 (`/api/ot/*`, `/api/history`, `/api/days/batch`, `/api/policies/preview`, `/api/admin/*`) và hợp đồng của chúng được liệt kê trong [bàn giao WP2](handoff/delivery/WP2_HANDOFF.vi.md). Không có route công khai nào ghi tín dụng hay ghi nợ. Chốt revision, PDF và email thuộc WP3; tín chỉ trong phản hồi là tạm tính cho đến lúc đó.
