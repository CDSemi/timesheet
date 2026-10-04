# Bàn giao WP2 — Không gian làm việc, sổ cái OT và quản trị

Hoàn thành theo [HANDOFF](../templates/HANDOFF.vi.md) với bằng chứng thực tế. Bản dịch của [WP2_HANDOFF.md](WP2_HANDOFF.md); tiếng Anh là nguồn chuẩn. Mọi con số dưới đây được chép từ một bản ghi tác vụ hoặc một file bằng chứng nêu bên cạnh. Số liệu chưa chạy hoặc chưa kiểm được đều ghi rõ. Các mục cho đến các bảng kiểm chứng mô tả trạng thái WP2-T13 (commit `8fae685`) như lúc viết; các vòng sửa đã đổi một phần, và các dòng được thêm, các dòng đã chỉnh và bản ghi chấp nhận ở cuối cho biết trạng thái hiện tại. Bản ghi chấp nhận là căn cứ cho định danh gói và các kết luận của gate và audit.

- **Gói/phạm vi, ngày và tác giả:** chỉ WP2, theo [WP2-PLAN](tasks/WP2-PLAN.md), [WP2_IMPLEMENT](../prompts/WP2_IMPLEMENT.vi.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md): xem hai tuần và mobile, sửa giờ thực/nhập tay/giờ nghỉ, nghỉ một phần và đổi nhãn hàng loạt, cài đặt, nhập CSV ngày lễ, quản trị người dùng, lịch sử và audit, CSV bằng chứng OT, sổ cái OT giao dịch với đặt trước nghỉ, và các test trình duyệt. 03/10/2026 → 04/10/2026 (mốc thời gian trong bằng chứng là UTC). Tác giả: các subagent Claude Code của mission điều phối timesheet (mỗi lúc một người ghi source); bản bàn giao này và các thay đổi T13 do một `timesheet-worker` (sonnet) viết. Chưa bắt đầu WP3: chưa có chốt revision, PDF hay email.
- **Model/effort/speed thực tế, hoặc không quan sát được:** tự khai trong các bản ghi tác vụ. T02 và T03 chạy trên `claude-opus-5-5` (lý do override `novelty`, docs/08); T01, T05–T13 và các tác vụ CALFIX/ADVFIX chạy trên `claude-sonnet-5-5`; kế hoạch, review tư vấn và điều phối viên chạy trên `claude-opus-5-5`. Effort và speed không quan sát được từ bên trong phiên; hãy xác nhận trong client.
- **Commit SHA, digest source và commit chưa push, hoặc bản source đầy đủ:** định danh được chấp nhận `5fafeaee72509c6110a907458643bf7582dad81a` (đã push, bản ghi WP2-GATE4) với digest source `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` trên 613 file (loại `handoff/`); xem bản ghi chấp nhận. Lịch sử: các thay đổi T13 được viết khi chưa commit trên baseline `da0ffc492b608f1108e3c455e55aa01cca118b45` (digest `8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2`, 611 file, [evidence/WP2-T13/digest.txt](evidence/WP2-T13/digest.txt)) và được freeze thành `8fae685949adb525ec137e5972202f58b408ac24` (bản ghi WP2-GATE). Lịch sử freeze nằm trong bảng bên dưới.
- **Trạng thái triển khai; trạng thái review độc lập:** cả mười ba tác vụ triển khai (T01–T13, T09 tách làm hai) đã triển khai, và bốn vòng sửa theo sau các audit độc lập (WP2-FIXA, WP2-FIXB kèm phụ lục, WP2-FIXB2, WP2-FIXB3). Review độc lập: **WP2-GATE4 PASS, WP2-AUDIT-A2 lần 3 PASS và WP2-AUDIT-B4 PASS, tất cả trên `5fafeae`** (bản ghi chấp nhận bên dưới). Review sổ cái tư vấn (WP2-ADV-REVIEW) chỉ bao phủ freeze T04 và không phải quyết định của gói.
- **Hành vi đã triển khai và file đã đổi:** xem "Phạm vi đã giao" và "File đã đổi theo khu vực" bên dưới.
- **Migration/tương thích schema:** ba migration, đều chỉ thêm và có checksum; migration 0001 chưa từng bị sửa (một test ghim checksum của nó). `0002_ot_ledger` thêm `ot_ledger` (chỉ thêm, delta nguyên có dấu, `source_key` duy nhất theo người dùng, `source_ref` mờ, khóa ngoại tự tham chiếu `corrects_entry_id`) và `ot_leave_requests` (bộ đếm có phiên bản, chỉ tiến, dữ kiện quyền cho phép bất biến). `0003_day_entry_source` thêm `day_entries.category_source` (default | explicit; dòng WP1 được backfill `explicit`) và `day_entries.leave_kind` (NULL | vacation | sick | ot) cùng trigger, bằng `ALTER TABLE ADD COLUMN` (không dựng lại bảng). Kế hoạch gọi migration thứ hai là `0004`; registry đòi các phiên bản liên tục nên nó là `0003` (sai lệch 1 của T05). Nâng cấp từ CSDL WP1 đã có dữ liệu và từ CSDL v2 có dòng sổ cái đều giữ nguyên mọi dòng (`integrity_check` ok, `foreign_key_check` rỗng): test trong `tests/integration/migrations.test.ts` (T02, T05) và probe riêng của reviewer tư vấn trên mã `f32978f` (WP2-ADV-REVIEW, 12 bảng WP1 giống hệt từng byte).
- **Hợp đồng chuẩn đã đổi và lý do, hoặc không:** có, đều ghi bằng tiếng Anh và tiếng Việt. Xem "Quyết định" bên dưới: quyết định chủ sở hữu E-2, E-3 và E-8 đổi docs 02, 03, 04, 10 và trường fixture LG-10 (WP2-DEC); việc điều phối viên áp dụng R-05 của ADV-A-02 đổi mỗi chỗ một câu trong docs 02 R-05/R-06 và docs 10 (WP2-ADVFIX); việc CALFIX từ chối thêm một câu vào docs 03 và một mục vào docs 10 (WP2-CALFIX). Quy tắc tính R-01…R-04 và các số của fixture không đổi. `.gitattributes` thêm `handoff/delivery/evidence/** -whitespace` (WP2-INFRA1, quyết định của điều phối viên, nằm ngoài danh sách đường dẫn quản trị của docs/08; audit gói nên xem xét).
- **Bảng kiểm chứng:** bên dưới. Mọi lệnh chạy bằng runtime Node 24 portable (`v24.21.0`) gọi bằng đường dẫn đầy đủ hoặc đặt đầu `PATH` cho mọi lần chạy ghi bằng chứng. Các lần chạy thăm dò đầu với `PATH` sai (Node 26) trong T01 và WP2-ADV-GATE đã bị bỏ và làm lại, như các bản ghi đó nêu.
- **AC đã bao phủ; đường chưa chạy/bị chặn thật sự:** bên dưới.
- **Ảnh chụp/PDF/bằng chứng mail-capture tổng hợp:** ảnh `*-synthetic.png` của các luồng trình duyệt nằm trong các thư mục bằng chứng T09A, T09B, T10, T11 và T12 (chỉ mục bên dưới); CSV bằng chứng mẫu là `evidence/WP2-T04/evidence-export-synthetic.csv.txt` và `evidence/WP2-T11/ot-evidence-desktop-synthetic.csv.txt`. Bộ của gate cuối nằm trong `evidence/WP2-GATE4/`: 25 ảnh desktop `*-synthetic.png` cùng `evidence-export-synthetic.csv.txt` có 0 ký tự `@` (bản ghi WP2-GATE4, bước 6). Không có PDF và không có mail: thuộc WP3.
- **Phát hiện đã xử lý, lỗi còn lại và backlog tùy chọn:** bên dưới ("Phát hiện", "Giới hạn đã biết và ghi chú chuyển tiếp").
- **Đầu vào cài đặt cần từ chủ sở hữu, không gồm bí mật:** không có cho WP2. Tùy chọn: phủ quyết hoặc đổi bất kỳ quyết định có thể đảo ngược nào của điều phối viên bên dưới; quyết định các lựa chọn của chủ sở hữu ghi trong "Ghi chú chuyển tiếp". WP3 sẽ cần các đầu vào SMTP và chữ ký của lộ trình.
- **Hành động production và ủy quyền tường minh, thường là không:** không có. Không triển khai, không mở host ra ngoài (chỉ loopback), không email, không dữ liệu thật. Mọi dữ liệu là tài khoản tổng hợp `example.invalid`.
- **Usage/credit chỉ khi quan sát được thật:** không quan sát được trong các phiên này.
- **Một hành động tiếp theo và prompt tương ứng:** điều phối viên ghi nhận chấp nhận WP2 trên bảng bằng bản ghi chấp nhận bên dưới, rồi lập kế hoạch WP3 (kế hoạch gói trước, theo lộ trình); xem phần chuyển tiếp sang WP3 trong bản ghi chấp nhận.

## Nguồn gốc điều phối

- **ID mission/tác vụ và bảng/checkpoint:** mission `timesheet-software-readiness`, gói WP2, các tác vụ WP2-PLAN, WP2-T01 … WP2-T13 (T09 tách thành WP2-T09A và WP2-T09B sau WP2-T09-PREP), WP2-ADV-GATE, WP2-ADV-REVIEW, WP2-ADVFIX, WP2-CALFIX, WP2-DEC, WP2-INFRA1 và một FREEZE cho mỗi tác vụ triển khai. Bảng: [ORCHESTRATION.json](ORCHESTRATION.json); brief và kết quả: `handoff/delivery/tasks/`; checkpoint: [WORKFLOW_REVISION_CHECKPOINT.vi.md](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- **Danh tính bên triển khai và auditor độc lập; ngữ cảnh tách biệt:** mỗi tác vụ chạy trong ngữ cảnh subagent riêng; mỗi lúc một người ghi source. WP2-ADV-REVIEW tư vấn là auditor `claude-opus-5-5` mới, chỉ trên freeze T04. Các audit gói dùng auditor mới không phải worker T01–T13 hay worker sửa nào (tự khai `claude-opus-5-5` trong bản ghi audit); các worker sửa tự khai `claude-sonnet-5-5` (bản ghi WP2-FIXA, FIXB, FIXB2 và FIXB3).
- **Digest đã kiểm/đã review hiện tại; báo cáo và quyết định review:** digest được chấp nhận `e61fa914…14df` trên `5fafeae` (giá trị đầy đủ trong bản ghi chấp nhận), do WP2-GATE4 kiểm chứng và các audit cuối review; báo cáo: [WP2_RECHECK_A4.vi.md](WP2_RECHECK_A4.vi.md) (PASS) và [WP2_RECHECK_B4.vi.md](WP2_RECHECK_B4.vi.md) (PASS). Các digest và kết luận trước đó nằm trong bản ghi chấp nhận. Báo cáo tư vấn: [WP2_ADV_LEDGER_REVIEW.vi.md](WP2_ADV_LEDGER_REVIEW.vi.md), kết luận FINDINGS (không phải quyết định gói), cả bốn phát hiện cần xử lý đã sửa trong WP2-ADVFIX.
- **Tác vụ/phụ thuộc còn lại; một hành động tiếp theo của điều phối viên:** WP2-ACCREC (bản ghi này), rồi bước chấp nhận trên bảng. Hành động tiếp theo của điều phối viên: ghi nhận chấp nhận WP2 và bắt đầu kế hoạch WP3.
- **Mức sẵn sàng phần mềm và việc chờ chủ sở hữu cho phép pilot, tách riêng:** mức sẵn sàng phần mềm của WP2: đã triển khai, đã qua gate và được audit độc lập (PASS trên `5fafeae`); bước chấp nhận trên bảng thuộc điều phối viên. Chủ sở hữu cho phép pilot: chưa yêu cầu và chưa cho; không có gì được triển khai.

## Phạm vi đã giao theo ID của kế hoạch

ID lấy từ mục A của [WP2-PLAN](tasks/WP2-PLAN.md). "Tác vụ" là tác vụ triển khai; test được nêu trong bản ghi tác vụ.

| ID | Giao bởi | Hành vi |
|---|---|---|
| FR-01 quản trị người dùng, vô hiệu hóa | T07 (API), T12 (UI) | Router chỉ cho admin: liệt kê tài khoản (chỉ trường tài khoản), tạo với mật khẩu do admin đặt và không bao giờ trả lại (E-11), sửa tên/vai trò/lịch, vô hiệu hóa/kích hoạt lại. Vô hiệu hóa thu hồi mọi phiên; từ chối admin hoạt động cuối cùng và tự vô hiệu hóa; mọi thay đổi đều audit. CALFIX từ chối đổi lịch của người đã có dữ liệu. |
| FR-03, FR-04 nhãn, hàng loạt, WFH | T05, T09A/B | `category_source` default/explicit, nhãn mặc định đọc lúc xem, `POST /api/days/batch` preview/commit với `expected_version` theo từng ngày, xác nhận xung đột, lý do cho kỳ cũ, một transaction, một sự kiện audit cho mỗi mục đổi; lưới, danh sách mobile, hộp thoại hàng loạt trên UI. |
| FR-05 cài đặt và giờ nghỉ | T01, T06, T10, T12 | Hợp đồng giờ nghỉ E-1; xem trước chính sách `POST /api/policies/preview` (không ghi); UI cài đặt với xem trước rồi tạo. |
| FR-06 chỉnh sửa | T01, T10 | Clock out bắt buộc `expected_version`; trình sửa ngày với múi giờ nhập tường minh, xử lý DST fold/gap, ngày kết thúc qua đêm, kết quả giờ nghỉ, hỏi lý do, tải lại khi lệch phiên bản. |
| FR-08 service thiếu số dư | T02, T03, ADVFIX | `postDeficitDebit` và phần tăng của bản hiệu chỉnh trả kết quả pending khi số dư khả dụng không đủ (R-05); đặt trước trả 409 `insufficient_balance` (E-5). Ghi các khoản thiếu đã chốt là WP3. |
| FR-09 sổ cái OT, nghỉ | T02, T03, T04, T11 | Sổ cái chỉ thêm, ghi idempotent, quyền cho phép đã ghi, đặt trước, ghi nhận sử dụng (một phần), hủy, đảo, phút 1:1, số dư truy vết thô/tạm tính/đã ghi/đã đặt/khả dụng. |
| FR-13 nhập ngày lễ | T08, T12, FIXA | Xem trước CSV (lỗi, diff ngày suy ra từ lịch kèm nhãn trước và sau, xung đột kỳ đã chốt chỉ ở dạng ngày; không có số đếm hay danh tính suy ra từ nhân viên, WP2-FIXA), commit kèm preview hash, phiên bản bất biến, commit lại idempotent; ngoại lệ kỳ lương; cảnh báo năm sau (E-12). Màn hình nêu rằng nhãn tường minh và ngày thêm tay được giữ và chỉ nhãn mặc định đi theo lịch. |
| FR-14 lịch sử, bằng chứng | T04, T11 | `GET /api/history` (sự kiện audit của chính mình cùng phiên bản chính sách và lịch của mình, con trỏ theo người dùng), `GET /api/ot/evidence.csv` (chia mục, vô hiệu hóa công thức, chỉ chủ sở hữu). |
| R-01, R-02 giờ nghỉ | T01, T10 | Ngữ nghĩa thay thế tập, chưa xác nhận thì còn chờ, từ chối giờ nghỉ tương lai (+5 phút), kết quả có kiểu cho dòng cũ `saved_break_after_clock_out`. |
| R-03 làm ngày lễ giữ phân loại | T08 | Nhập chỉ đổi phiên bản về sau; phân loại cả năm của các ngày đã qua giống hệt trước và sau commit (test). |
| R-05 phút nghỉ L, kết quả ghi nợ | T02, T05, ADVFIX | L = số phút nghỉ của ngày do nhân viên nhập (E-2); service ghi nợ với kết quả pending; áp dụng cho hiệu chỉnh (ADV-A-02). |
| R-06 sổ cái, đặt trước, hiệu chỉnh | T02, T03 | Hiệu chỉnh ghi phần chênh lệch liên kết với bản gốc; số dư âm được giữ và gắn cờ (LG-08); đổi nhãn không tiêu. |
| R-07 phiên bản về sau, lý do, audit, múi giờ | T05, T06, T08, T10, T12 | Lý do cho kỳ cũ, audit trước/sau, ranh giới về sau cho phiên bản chính sách/lịch và ngoại lệ, ngày kế toán không bao giờ bị múi giờ thiết bị gom lại. |
| AC-01 quyền sở hữu | T04, T07, T12 | ID-swap 404 trên mọi route cá nhân (nhân viên với nhân viên, admin với nhân viên), không route admin nào trả dữ liệu riêng của người khác, test kiểm kê route. |
| AC-03 idempotent khi ghi và nghỉ, đồng thời | T02, T03 | Cùng khóa → một dòng; đua nhiều kết nối `worker_threads` trên một file WAL (LG-07). |
| AC-04 (phần WP2) lý do, audit, lịch sử | T04, T05 | Bắt buộc lý do, audit, lịch sử theo người dùng. Lưu PDF là WP3. |
| AC-05 nhập ngày lễ | T08, T12 | Trùng lặp và ngày, ghi đè tường minh và thêm tay được giữ, phân loại quá khứ không đổi, commit idempotent. |
| LG-01…LG-08, LG-10; LG-09 delta bằng 0 | T02 (LG-01, 02, 08, 09), T03 (LG-03…07, 10), T05 (LG-10 với `leave_kind`) | Trên service production và SQLite thật. LG-09 chỉ ở dạng "hiệu chỉnh không đổi ghi delta bằng 0"; review muộn và gửi lại là WP3. |
| DF-01…DF-16 | WP1 | Không đổi và xanh (`tests/domain/deficit.fixtures.test.ts`, 17/17). |

### File đã đổi theo khu vực

- Miền (thuần, một engine): `src/domain/ledger.ts` (mới), `src/domain/holidayCsv.ts` (mới), `src/domain/attendance.ts`, `src/domain/index.ts`.
- Migration: `src/server/db/migrations/0002_ot_ledger.ts`, `0003_day_entry_source.ts`, `src/server/db/migrations.ts`.
- Service: `ledger.ts`, `otLeave.ts`, `otEvidence.ts`, `history.ts`, `dayEntries.ts`, `holidayImport.ts` (mới); `timesheetCommands.ts`, `timesheets.ts`, `policies.ts`, `calendars.ts`, `periods.ts`, `users.ts` (sửa).
- HTTP: router `ot.ts`, `history.ts`, `admin.ts` (mới); `api.ts`, `app.ts`, `schemas.ts`, `auth.ts` (`requireAdmin`), `auth/sessions.ts` (sửa).
- Client: khung điều hướng, lưới, danh sách, hộp thoại hàng loạt, trình sửa ngày, các màn OT, lịch sử, cài đặt và quản trị, `components/`, token `styles.css` (E-8).
- Test: `tests/domain/`, `tests/integration/`, `tests/client/` (mới), `tests/e2e/` (harness Playwright mới và các spec), `tests/support/concurrency.ts`.
- T13: `src/server/seed.ts`, `src/server/cli.ts`, `scripts/smoke-built-server.mjs`, `DEVELOPMENT(.vi).md`, `README(.vi).md`, `package.json` (chỉ phần mô tả), bản bàn giao này.

### Route thêm trong WP2 (đều dưới `/api`)

`GET /ot/summary`, `GET /ot/ledger`, `GET|POST /ot/leave`, `POST /ot/leave/{id}/consume|cancel|reverse` (mỗi route kèm `expected_version`), `GET /ot/evidence.csv?from&to`, `GET /history`, `POST /days/batch`, `POST /policies/preview`, `GET|POST /admin/users`, `PATCH /admin/users/{id}`, `POST /admin/users/{id}/deactivate|reactivate`, `POST /admin/calendar/import/preview|commit`, `POST /admin/payroll-exceptions`; `GET /calendar` có thêm `warnings`; `POST /clock/out` bắt buộc `expected_version`. Không route nào ghi tín dụng hay ghi nợ; một test kiểm kê route liệt kê mọi route thay đổi dữ liệu và quét các router tìm các hàm ghi sổ.

## T13: seed tổng hợp, smoke và tài liệu

- **Seed** (`npm run seed`, `src/server/seed.ts`, `src/server/cli.ts`): ba tài khoản `admin@example.invalid`, `employee@example.invalid` và `employee2@example.invalid`; mật khẩu lấy từ `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD`, `SEED_EMPLOYEE2_PASSWORD`, hoặc sinh lúc chạy và in một lần; không có mật khẩu nguyên văn trong source. `employee2` chỉ nhận dữ liệu mẫu qua các service production: ba phiên làm việc ngày thường gần đây (09:00–17:30, 08:30–19:00 và 09:00–17:30 với 30 phút nghỉ đã xác nhận, ngày tính theo đồng hồ), một yêu cầu nghỉ OT (240 phút, quyền cho phép do "Example Manager", đã đặt trước) và một khoản tín dụng khởi tạo 600 phút ghi bằng `postCredit` với khóa khởi tạo tường minh `seed-setup-credit-employee2`, nguồn `system` và lý do bằng chữ. Không suy ra số dư đầu kỳ từ bất kỳ timesheet nào. Tài khoản thứ hai và dữ liệu của nó chỉ được tạo khi CLI yêu cầu bộ dữ liệu phát triển (`sampleData`), nên `createTestContext` và các test tích hợp vẫn thấy hai tài khoản, và `employee@example.invalid` vẫn để trống như các spec e2e cần.
- **Smoke** (`scripts/smoke-built-server.mjs`, 28 kiểm tra, trước là 13): thêm đầu ra seed CLI cho employee2 và dữ liệu mẫu; nhân viên bị 403 ở vùng admin (GET và POST) và người ẩn danh 401; admin liệt kê ba tài khoản chỉ với trường tài khoản; employee2 đăng nhập; tổng hợp OT của employee2 (đã ghi 600, đã đặt 240, khả dụng 360, không âm) và tổng hợp riêng của employee (0/0); một yêu cầu nghỉ đã seed của employee2, admin không thấy yêu cầu nào; nhân viên khác và admin nhận 404 với yêu cầu nghỉ của employee2 theo id và các lần hủy bị từ chối không đổi gì; header CSV bằng chứng (content type `text/csv`, `no-store`, tên file đính kèm an toàn, `from,to,reporting_zone,generated_at_utc,days`, bảy mục theo thứ tự, khóa tín dụng đã seed và quyền cho phép chỉ có ở employee2, không có trong CSV của employee, liệt kê ba phiên mẫu); nhân viên nhận 404 với phiên của employee2 theo id. Kết quả: [evidence/WP2-T13/verify.txt](evidence/WP2-T13/verify.txt).
- **Tài liệu:** DEVELOPMENT và bản dịch (yêu cầu Node 24, `npm run test:e2e`, `E2E_CHANNEL`, tài khoản seed, các dòng cấu trúc, dòng trạng thái); README và bản dịch (các dòng trạng thái và hai bước bắt đầu từng nêu hành động F-01 đã lỗi thời); `package.json` chỉ phần mô tả.
- **Chưa có unit test riêng:** dữ liệu mẫu của seed chỉ được kiểm bằng smoke và lần chạy e2e (seed qua CLI); không có test tích hợp cho chính `seedSampleData`.

## Lịch sử freeze (T01 đến T13)

Tất cả trên `main`, đã push trừ khi ghi khác. Freeze do `timesheet-committer` thực hiện trừ khi ghi khác. SHA là SHA do bản ghi tác vụ freeze và bảng điều phối ghi lại.

| Tác vụ | Commit freeze | Ghi chú |
|---|---|---|
| WP2-T01 | `396b399b2d58ccc7ea90dc78be9e7c2f9a832be2` | |
| WP2-T02 | `8930efee064ac84256b3f82b87005717a489d1b7` | |
| (bản ghi) | `f7b9f8e3f07b68e636da54ba589b286fa59561b8` | Checkpoint WP2-CKPT1 trước các quyết định của chủ sở hữu; `393779d` mã hóa E-2/E-3/E-8 (WP2-DEC); `30be0b1` chấp nhận thay đổi quản trị E-8 (GOV-E8). Không phải source WP2. |
| WP2-T03 | `67c7e7a6e10779163647f88b84ebd91fcea390d6` | Lần 1 bị chặn vì khoảng trắng cuối dòng trong một log bằng chứng; lần 2 đã commit. |
| WP2-T04 | `e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96` | Cùng lỗi khoảng trắng, sau đó WP2-INFRA1 (`.gitattributes`). |
| WP2-ADVFIX và WP2-T05 | `e768b71c2a5e522bdfece8617599992f8f4a0abc` cộng `a8a5890a75361c44ff7730d54bbaadab56c40f3a` | **Chủ sở hữu commit thủ công** sau hai lần bộ phân loại từ chối; `e768b71` là commit của chủ sở hữu và chứa các file đã sửa, `a8a5890` thêm các file mới (được WP2-T05-RECON và WP2-T05-RECON2 kiểm). WP2-ADVFIX không có freeze riêng; thay đổi của nó nằm trong hai commit này. |
| WP2-T06 | `197053699d9b5c125fa0c3e8ccb8acf0f421011f` | |
| WP2-T07 | `a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6` | |
| WP2-T08 | `869bc8e5786e827144ef1d2d806725576351c720` | |
| WP2-CALFIX | `24f192dddbe658246dab020c5bc87c74a02a4310` | |
| WP2-T09A | `717db3ee30057089298a8852438f16d46aa4dc89` | |
| WP2-T09B | `9c36a7ec7e9355afbd7bb9161e24ceed4f99ab8d` | |
| WP2-T10 | `26fa7c9f5a2dda1c2b9ab73122934ede04cf186f` | |
| WP2-T11 | `55d3bb808836a0217de45470f5b743f9e5b9a667` | **Chủ sở hữu commit thủ công** từ IDE sau một lần bộ phân loại từ chối (được WP2-T11-RECON kiểm). |
| WP2-T12 | `da0ffc492b608f1108e3c455e55aa01cca118b45` | Baseline của T13. |
| WP2-T13 | `8fae685949adb525ec137e5972202f58b408ac24` | Freeze cuối gói trước các audit; gate đã cho qua và các audit đầu trả FIX REQUIRED (bản ghi chấp nhận). |
| WP2-FIXA và WP2-FIXB (kèm phụ lục) | `f79413b77e7f745e1eff383f1ad748e7667533da` | Một freeze gộp ([WP2-FIX-FREEZE](tasks/WP2-FIX-FREEZE.md)). |
| WP2-FIXB2 | `a3d1b6555c352afa68b3d61ddc67f0c596742698` | [WP2-FIXB2-FREEZE](tasks/WP2-FIXB2-FREEZE.md). |
| WP2-FIXB3 | `5fafeaee72509c6110a907458643bf7582dad81a` | [WP2-FIXB3-FREEZE](tasks/WP2-FIXB3-FREEZE.md); định danh gói được chấp nhận. |

Ba commit freeze do chủ sở hữu thực hiện (T05 là `e768b71` cộng `a8a5890`, T11 là `55d3bb8`) sau khi bộ phân loại từ chối committer; phần còn lại do `timesheet-committer` commit.

## Kiểm chứng

### Lệnh T13 (bản xuất sạch ngoài Dropbox)

"Bản xuất sạch" = các file của cây làm việc từ `git ls-files -co --exclude-standard` chép sang một thư mục dưới thư mục tạm của hệ điều hành, ngoài Dropbox, rồi `npm ci`. Node `v24.21.0`, npm 11.18.0, Windows 11 x64, Microsoft Edge đã cài qua Playwright 1.63.0.

| Lệnh | Môi trường | Exit | Kết quả quan sát | Bằng chứng |
|---|---|---:|---|---|
| `npm ci --no-audit --no-fund` | bản xuất sạch | 0 | thêm 144 gói | [npm-ci.txt](evidence/WP2-T13/npm-ci.txt) |
| `npm run verify` với `NODE_OPTIONS=--trace-deprecation --pending-deprecation` | bản xuất sạch | 0 | typecheck và lint (`no-deprecated`) sạch; 31 file, **599/599 test**; build; smoke **SMOKE PASSED, 28 dòng PASS, không có FAIL**; không có đầu ra deprecation | [verify.txt](evidence/WP2-T13/verify.txt) |
| `vitest run --reporter=json` (số theo file) | bản xuất sạch | 0 | 31 file, 599 đạt, 0 lỗi | [vitest-per-file.txt](evidence/WP2-T13/vitest-per-file.txt) |
| `npm run test:e2e` (build rồi Playwright, project `desktop` 1280x800 và `mobile` 390x844) | bản xuất sạch | 0 | **66 đạt, 2 bỏ qua** (hai test chỉ dành cho mobile trên project desktop) | [e2e.txt](evidence/WP2-T13/e2e.txt) |
| `npm run digest` | thư mục dự án | 0 | `8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2` (611 file, loại `handoff/`) | [digest.txt](evidence/WP2-T13/digest.txt) |
| `validate_package.py --preflight` (Python của workflow) | thư mục dự án | 0 | PASS: 50 cặp bản dịch, 874 liên kết cục bộ, 91 kịch bản tham chiếu (33 OT, 32 thời gian, 16 thiếu giờ, 10 sổ cái); validator này không chạy test ứng dụng | [preflight.txt](evidence/WP2-T13/preflight.txt) |

Lần `npm run verify` đầu tiên trên bản xuất sạch trong tác vụ này đã lỗi 2 test (`tests/integration/user-admin.test.ts`: kỳ vọng 2 người dùng, thấy 3) vì employee2 được tạo mặc định; nay seed chỉ tạo nó cho bộ dữ liệu phát triển của CLI. Lần chạy đó đã bị bỏ và không nằm trong bằng chứng; các log trên là các lần chạy lại trên source cuối.

### Bằng chứng tác vụ theo từng bước (do tác giả chạy, chưa được tái lập độc lập)

Số test là số toàn bộ bộ test trong `npm run verify` của từng tác vụ (typecheck, lint với `no-deprecated`, vitest, build, smoke). Smoke là 13 kiểm tra cho đến T13. Số e2e là số Playwright đạt/bỏ qua trên cả hai project.

| Tác vụ | Unit test (file) | E2E | Digest (file) | Bằng chứng |
|---|---|---|---|---|
| T01 | 194 (12) | không | `b25a4ab7…fcfa` (534) | [WP2-T01](evidence/WP2-T01/verify.txt) |
| T02 | 229 (14) | không | `56ee04d5…b358` (539) | [WP2-T02](evidence/WP2-T02/verify.txt) |
| T03 | 281 (16) | không | `1bd57c51…df6b` (543) | [WP2-T03](evidence/WP2-T03/05-verify.log) |
| T04 | 335 (19) | không | `05f9486f…f565` (550) | [WP2-T04](evidence/WP2-T04/04-verify.log) |
| ADVFIX | 344 (19) | không | `fac640f1…db2ec` (550) | [WP2-ADVFIX](evidence/WP2-ADVFIX/02-verify.txt) |
| T05 | 387 (21) | không | `80921558…4ac0` (554) | [WP2-T05](evidence/WP2-T05/02-verify.txt) |
| T06 | 414 (22) | không | `155bafeb…2b84a` (555) | [WP2-T06](evidence/WP2-T06/03-verify.txt) |
| T07 | 448 (23) | không | `705d78fd…f954c5` (557) | [WP2-T07](evidence/WP2-T07/04-verify.log) |
| T08 | 514 (26) | không | `95b5291b…b061` (562) | [WP2-T08](evidence/WP2-T08/05-verify.log) |
| CALFIX | 524 (26) | không | `b18c6768…baf3` (562) | [WP2-CALFIX](evidence/WP2-CALFIX/04-verify.log) |
| T09A | 524 (26) | 7 đạt, 1 bỏ qua | `6c1947e3…4133` (566) | [WP2-T09A](evidence/WP2-T09A/commands.txt) |
| T09B | 541 (27) | 15 đạt, 1 bỏ qua | `4d242ea9…159b` (577) | [WP2-T09B](evidence/WP2-T09B/commands.txt) |
| T10 | 571 (28) | 42 đạt, 2 bỏ qua | `84355bd3…155e` (590) | [WP2-T10](evidence/WP2-T10/verify.txt) |
| T11 | 582 (29) | 50 đạt, 2 bỏ qua | `afe8e004…e8ba` (598) | [WP2-T11](evidence/WP2-T11/verify.log.txt) |
| T12 | 599 (31) | 66 đạt, 2 bỏ qua | `321d2a53…e54` (611) | [WP2-T12](evidence/WP2-T12/verify.log.txt) |
| T13 (bản xuất sạch) | 599 (31) | 66 đạt, 2 bỏ qua | `8ebce5fe…24a2` (611) | [WP2-T13](evidence/WP2-T13/verify.txt) |
| FIXA | 600 (31) | 66 đạt, 2 bỏ qua | `73db9c0a…7d79` (611) | [WP2-FIXA](evidence/WP2-FIXA/03-verify.txt) |
| FIXB (kèm phụ lục) | 606 (31) | 74 đạt, 2 bỏ qua | `4c2bd7ef…3528` (611) | [WP2-FIXB](evidence/WP2-FIXB/11-verify.txt) |
| FIXB2 | 611 (32) | 74 đạt, 2 bỏ qua | `5b370621…8581` (613) | [WP2-FIXB2](tasks/WP2-FIXB2.md) |
| FIXB3 | 613 (32) | 74 đạt, 2 bỏ qua | `e61fa914…14df` (613) | [WP2-FIXB3](tasks/WP2-FIXB3.md) |
| GATE4 trên `5fafeae` (lần chạy của gate, không phải tác giả) | 613 (32) | 74 đạt, 2 bỏ qua | `e61fa914…14df` (613) | [WP2-GATE4](tasks/WP2-GATE4.md) |

Các dòng FIXA đến FIXB3 lấy từ phần Results của bản ghi tác vụ tương ứng (FIXB: lần chạy lại của phụ lục với 606 test và 74 e2e đạt; lần chạy trước đó với 603 test và 68 đạt đã bị thay thế). Digest đầy đủ nằm trong các bản ghi tác vụ. Tác vụ tài liệu WP2-DEC đã chạy `npm run verify` và `validate_package.py --preflight` (cả hai exit 0, 91 kịch bản tham chiếu; `evidence/WP2-DEC/`), WP2-ADVFIX chạy preflight (exit 0, [04-preflight.txt](evidence/WP2-ADVFIX/04-preflight.txt)), và WP2-CALFIX ghi preflight exit 1 do một liên kết trong `tasks/WP2-T08.md` trỏ tới thư mục (không do thay đổi đó gây ra; [06-preflight.log](evidence/WP2-CALFIX/06-preflight.log)); kết quả của tác vụ này nằm ở bảng trên.

Bằng chứng red-first và mutation (do tác giả chạy): T01 red 18 lỗi/2 đạt, sau đó 20/20 xanh, với một mutation bỏ guard zero-row làm lỗi đúng test hồi quy zero-row; T02 red 35 lỗi/10 đạt rồi 45/45 trên ba file đích, hai mutation bị bắt; T03 red 13 lỗi/11 đạt rồi 63 đạt, một mutation bị bắt, tự kiểm harness đồng thời đặt trùng 5/5 khi thiếu transaction; T04 red 34 lỗi/8 đạt rồi 62 đạt, ba mutation bị bắt; T07 red 32 lỗi/38 đạt rồi 70 đạt, năm mutation bị bắt; T08 red 37 trên 40 lỗi rồi 107 đạt, 11 mutation bị bắt; CALFIX red 7 lỗi/32 đạt rồi 39 đạt, ba trên năm mutation bị bắt (hai cái còn lại là phòng thủ chiều sâu sau khóa ngoại của schema, ghi trong tác vụ).

### Đồng thời và migration (do tác giả chạy; gate chạy lại)

- LG-07 và các cuộc đua khác chạy trên các kết nối `worker_threads` riêng tới một file WAL qua service production (`tests/integration/ot-leave-concurrency.test.ts`, 8 test trong `npm test`). Một lần chạy đã ghi: LG-07 25/25 vòng đúng một người thắng và một 409 `insufficient_balance`; bốn đối thủ 80 với số dư 200: 20/20 đúng hai người thắng; cùng khóa yêu cầu 20/20 một `reserved` cộng một `duplicate`; dùng 80 so với 80 trong 120: 20/20; cùng khóa dùng 20/20 một lần ghi; hủy so với dùng 20/20; đảo so với đảo 20/20 ([03-concurrency-verbose.log](evidence/WP2-T03/03-concurrency-verbose.log)). Năm lần chạy nữa đều đạt ([06-concurrency-repeat-5-runs.log](evidence/WP2-T03/06-concurrency-repeat-5-runs.log)); verifier tư vấn chạy năm lần trên freeze T04, đều 8/8 (`evidence/WP2-ADV-GATE/`). Auditor tư vấn chạy các cuộc đua tiến trình tách biệt của riêng mình (LG-07 30/30 và 20/20, bốn đối thủ 20/20, dùng/đảo kép và hủy so với dùng 20/20; đối chứng không an toàn đặt trùng 10/10).
- Các bước "lặp ít nhất 20 lần trong một lần chạy" và "nâng cấp CSDL tạo ở `f32978f` qua mọi migration WP2" của gate (mục D của kế hoạch, bước 3 và 4) đã được gate chạy trên mỗi freeze sau đó: trên `5fafeae` file đồng thời chạy 20 lần, mỗi lần exit 0 và đạt 8/8, và CSDL `f32978f` được nâng cấp bằng migration [2,3] với số dòng bảng WP1 không đổi, `integrity_check` ok và `foreign_key_check` 0 dòng ([WP2-GATE4](tasks/WP2-GATE4.md) bước 3 và 4; bằng chứng `evidence/WP2-GATE4/`). Câu thời T13 nói chưa gate nào chạy các bước này đã bị thay thế.

## AC đã bao phủ; đường chưa chạy/bị chặn thật sự

- Được test và luồng trình duyệt bao phủ (do tác giả chạy): AC-01 cho các vùng sổ cái, nghỉ, bản xuất, lịch sử và quản trị của WP2; AC-03 idempotent khi ghi và nghỉ và đồng thời; phần WP2 của AC-04; AC-05; các fixture sổ cái nêu trên; các luồng trình duyệt cốt lõi ở bước 5 mục D của kế hoạch trong phạm vi các spec ghi trong bản ghi tác vụ: đăng nhập và xem hai tuần, nhập tay có giờ nghỉ (R 480 / credit 0), Clock in và out kèm phiên bản, đổi nhãn hàng loạt có xung đột, nghỉ một phần 240 và WFH, quyền cho phép, đặt trước 480, dùng một phần, hủy và đảo, thiếu số dư, tải CSV bằng chứng, xem trước CSV ngày lễ có dòng lỗi và commit, vô hiệu hóa người dùng thu hồi phiên, nhân viên thứ hai đổi ID/URL, admin không mở được dữ liệu nhân viên.
- **Đã được gate và audit riêng chạy:** gate (bản xuất sạch, đồng thời lặp 20 lần, nâng cấp WP1→WP2, bộ ảnh) đã đạt trên `5fafeae` (WP2-GATE4) và các audit cuối đã đạt trên cùng commit; các số T01–T13 trong các bảng trên vẫn do tác giả chạy. Xem bản ghi chấp nhận.
- **Không chạy theo thiết kế:** chốt revision, snapshot, PDF, chữ ký, email, review muộn và gửi lại (LG-09 ngoài kiểm tra delta bằng 0): WP3; Docker, Linux/NAS, sao lưu/khôi phục, nhập workbook: WP4; pilot thật: WP5. CSDL test chỉ chạy trên Windows; binary dựng sẵn cho Linux x64/arm64 có kèm nhưng chưa được thử. Lần chạy e2e dùng Edge đã cài; các đường Chrome và Chromium (`E2E_CHANNEL`) chưa được các tác vụ này thử.
- Bố cục mobile được kiểm bằng kiểm tra tràn ngang và mục tiêu chạm 44 px; ảnh chụp do tác giả và committer xem, chưa có reviewer độc lập xem.

## Quyết định

Mọi quyết định dưới đây đã được mã hóa trong tài liệu chuẩn (tiếng Anh và tiếng Việt) hoặc trên bảng điều phối.

### Quyết định của chủ sở hữu (03/10/2026, trả lời "dùng đề xuất"; do WP2-DEC mã hóa)

- **E-2:** nghỉ bằng OT không phải loại nhãn ngày. Mục ngày mang số phút nghỉ kèm `leave_kind` (vacation | sick | ot); L cho phần thiếu giờ (R-05) là số phút nghỉ nhân viên đã nhập; UI cảnh báo khi số phút loại OT của ngày khác với số phút đã dùng của yêu cầu (chỉ thông tin, trong T10/T11); không bao giờ tự động tiêu. Docs 02, 03, 04, 10; trường fixture LG-10 được đổi tên (`change_category` → `change_leave_label`, category → `leave_kind` `ot`), không đổi ID, số lượng hay số kỳ vọng.
- **E-3:** nghỉ OT chỉ được tiêu bằng hành động "ghi nhận sử dụng" tường minh, idempotent của nhân viên vào hoặc sau ngày nghỉ (cho phép dùng một phần); khoản đặt trước chưa dùng vẫn bị giữ cho đến khi dùng hoặc hủy, và review WP3 gắn cờ. WP2 không có job runner.
- **E-8:** chuẩn hình ảnh là CSS custom property thuần trong `src/client/styles.css`, bo góc 4 px, chuyển tiếp 300 ms ease-out qua một custom property, bố cục mật độ cao ưu tiên mobile. docs/04 ghi lại (WP2-DEC). Mục UI của AGENTS.md do tác vụ quản trị riêng GOV-E8 thay đổi (được chấp nhận ở `30be0b1`).

### Quyết định của điều phối viên (thường lệ, trong hợp đồng; chủ sở hữu đều có thể đảo ngược)

- **E-1** danh sách giờ nghỉ ở Clock out: bỏ qua thì giữ các dòng đã lưu (chỉ với clock-out chưa xác nhận); danh sách có mặt là tập đầy đủ và thay các dòng đã lưu, dù đã xác nhận hay chưa (T01; bỏ qua cộng đã xác nhận là 422 `breaks_required`).
- **E-4** nhập ngày lễ giữ nhãn tường minh cá nhân và ngày lịch thêm tay; một ngày chỉ bị xóa khi được chọn trong bản xem trước (T08).
- **E-5** thiếu số dư khi đặt trước: 409 `insufficient_balance`, không tạo khoản đặt trước (T03).
- **E-6** tín chỉ tạm tính: số phút credit của các ngày đủ trong kỳ chưa chốt, hiển thị theo kỳ (T04).
- **E-7** bằng chứng quyền cho phép là tham chiếu dạng chữ trong WP2; file đính kèm chờ kho file riêng của WP3 (T02, T03).
- **E-9** `@playwright/test` 1.63.0 ghim chính xác ở devDependency, script `test:e2e` riêng, không nằm trong `verify`; mặc định dùng Edge đã cài (T09A).
- **E-10** ngoại lệ kỳ lương làm mới dòng kỳ chưa chốt đã lưu trong cùng transaction và bị từ chối (409 `period_finalized`) nếu timesheet đã chốt tham chiếu tới nó (T08).
- **E-11** người dùng do admin tạo nhận mật khẩu tạm do admin đặt ngoài kênh; không có route đặt lại và không có email trong WP2 (T07).
- **E-12** cảnh báo từ ngày 1 tháng 10 khi lịch hiệu lực không có ngày nào của năm sau (T08).
- **E-13** lịch sử WP2 = nhật ký audit của chính người dùng cộng phiên bản chính sách và lịch (T04, T11).
- **ADV-A-02, R-05 áp dụng cho hiệu chỉnh** (03/10/2026, WP2-ADVFIX): phần tăng của hiệu chỉnh khoản ghi nợ thiếu giờ được kiểm bằng `canDebit` và thành `pending` khi số dư khả dụng không đủ; hiệu chỉnh làm giảm một khoản credit đã tiêu vẫn có thể âm và bị gắn cờ (LG-08). Ghi trong docs 02 và 10. ADV-A-01, A-03 và A-04 đã sửa; ADV-A-05 (đường ghi trùng lặp) là backlog.
- **CALFIX từ chối** (03/10/2026, WP2-CALFIX): không thể đổi lịch của người dùng khi họ đã có bất kỳ timesheet, mục ngày, phiên, dòng sổ cái hay yêu cầu nghỉ nào (409), vì gán lại sẽ gom lại các ngày nháp, đổi nhãn và tính lại chúng, và làm mồ côi các timesheet hiện có (probe T08: `calendar-reassignment-probe*.txt`). Ghi trong docs 03 và 10. Gán lại về sau theo ngày hiệu lực được ghi nhận là lựa chọn của chủ sở hữu.
- **Tách T09** (03/10/2026, WP2-T09-PREP): T09 thành T09A (harness, token E-8, khung điều hướng, kiểu `api.ts`) và T09B (lưới, danh sách mobile, sửa hàng loạt), mỗi bên có freeze riêng; `tsconfig.test.json` và một file unit `tests/client/` được thêm vào đường dẫn sở hữu. Client chỉ ánh xạ trường của server sang trạng thái hiển thị và không tính phút nghiệp vụ.
- **WP2-INFRA1:** dòng `.gitattributes` `handoff/delivery/evidence/** -whitespace`, vì log nguyên văn của `git diff --check` lỗi đã chặn bốn commit; quét riêng tư vẫn bao phủ bằng chứng; audit gói sẽ xem xét.

### Lựa chọn triển khai của T13 (tác vụ này)

- Employee2 và dữ liệu mẫu chỉ được tạo qua bộ dữ liệu phát triển của CLI, nên các test tích hợp hiện có vẫn thấy hai tài khoản.
- `src/server/cli.ts` được sửa để truyền `SEED_EMPLOYEE2_PASSWORD` và bật bộ dữ liệu (sai lệch bên dưới).
- Khoảng bằng chứng của smoke chạy từ 30 ngày trước đến 30 ngày sau để ngày nghỉ đã seed (khoảng hai tuần sau) nằm trong đó.

## Phát hiện

- **Đã xử lý trong WP2 (do tác giả báo):** ADV-A-01 (thử lại hiệu chỉnh với giá trị khác nay 409 `source_key_conflict`), ADV-A-02 (xem trên), ADV-A-03 (`expected_version` cũ khi hủy là 409 kể cả khi không còn gì đặt trước), ADV-A-04 (con trỏ lịch sử là số thứ tự theo người dùng, không rò rowid audit toàn cục) — mỗi cái có test hồi quy và các probe của reviewer chạy lại ([05-reviewer-probes-rerun.txt](evidence/WP2-ADVFIX/05-reviewer-probes-rerun.txt)); lỗi gán lại lịch ở T08 (CALFIX); các rủi ro WP1 mang sang (ngữ nghĩa danh sách giờ nghỉ, dòng nghỉ tương lai, Clock out không có `expected_version`, rollback sau lệnh xóa và nhánh zero-row: T01; ngoại lệ kỳ lương so với dòng kỳ đã lưu: T08).
- **Lỗi tìm thấy và sửa trong lúc làm:** bộ e2e bắt một lỗi chuẩn hóa hash route (T09A); phiên độ dài bằng 0 khi Clock out theo sau Clock in trong vòng một giây (các spec chờ 1,5 giây; server trả `end_not_after_start`, T10).
- **Phát hiện độc lập (sau T13):** WP2-A-01, WP2-B-01 và WP2-B-02 (các audit đầu), WP2-B2-01 và WP2-B2-02 (B2), WP2-B3-01 và WP2-B3-02 (B3) đã được sửa và kiểm chứng; audit A2 và B4 không có phát hiện chặn. Danh sách và các mục không chặn được chuyển tiếp nằm trong bản ghi chấp nhận.

## Giới hạn đã biết và ghi chú chuyển tiếp

1. **WP3 phải xử lý biến thể pending của `CorrectionResult`** (`status: pending`, `reason: insufficient_balance`, `entry: null`, `deltaMinutes: 0`, `debitIncreaseMinutes`, `availableMinutes`). Bên gọi chỉ chờ `posted | duplicate` sẽ hỏng (ADVFIX). Tương tự, khoản ghi nợ thiếu giờ pending được trả về nhưng **không được lưu** (ghi chú 2 của T02): WP3 phải lưu đề xuất trong revision. Cờ cần đối soát được tính từ số dư và chưa có quy trình xác nhận/xóa; `postCredit` từ chối 0 phút nên bên gọi bỏ qua các ngày credit bằng 0.
2. **Số tạm tính phải biến mất khi chốt.** Bản tổng hợp bỏ qua các kỳ đã chốt, nhưng hiện chưa có gì chốt, nên WP3 phải chốt kỳ khi ghi credit; nếu không số phút tạm tính sẽ bị đếm đôi (ghi chú T04). Các kỳ tạm tính được suy ra từ các ngày có phiên; kỳ chỉ có mục ngày không được liệt kê.
3. **Gán lại lịch về sau là lựa chọn của chủ sở hữu.** Hiện nay lịch của người dùng không đổi được khi đã có dữ liệu (CALFIX). Đổi về sau với ngày hiệu lực, có migration được ghi lại cho kỳ nháp và múi giờ báo cáo, chưa được thiết kế hay xây; hỏi chủ sở hữu nếu cần.
4. **Hàm miền chỉ để hiển thị trong client.** Trình sửa ngày gọi các hàm thuần dùng chung `suggestBreaks`, `expectedFinishUtc` và `resolveLocalDateTimeCompatible` để điền sẵn, giờ kết thúc dự kiến và phím tắt cho DST gap, với chính sách từ `GET /api/policies` (khoảng trống 1 của T10). Server vẫn kiểm mọi body và tính mọi phút. Nếu chủ sở hữu muốn giờ kết thúc dự kiến hoàn toàn do server cung cấp, cần thêm một trường ở day view (WP3 hoặc bản sửa sau). Client cũng tính các trạng thái hoàn thiện từ trường của server (`dayModel.ts`) và không tính phút nghiệp vụ nào.
5. **Vòng import giữa `policies.ts` và `timesheets.ts`** (T06): chỉ ở mức hàm (`listPolicyVersions` một chiều; `calculateDay` và các hàm tải chiều kia). Chạy được dưới Node 24 ESM; sau này có thể refactor bằng cách chuyển các hàm dùng chung sang module thứ ba.
6. **Ngày tương lai và trạng thái attendance-expected.** Server báo `attendance_expected` và `no_records` cho ngày tương lai; client ánh xạ một ngày được kỳ vọng mà không có phiên sau `today_local` (từ `/api/periods/current`, không bao giờ dùng đồng hồ thiết bị) thành `upcoming`, và ngày quá khứ thành `missing record` (quan sát T09B, T10). Một trường server với quan hệ của từng ngày so với hôm nay sẽ gọn hơn (WP3 hoặc bản sửa kiểu T10). Trạng thái review/chuyển phát (docs/04) chưa có nguồn cho đến WP3; lưới chỉ hiển thị `Draft` từ `timesheet.finalized`.
7. **Các giới hạn khác do các tác vụ ghi lại:** không có `GET /api/ot/leave/{id}` (hợp đồng 404 khi đổi ID được test trên ba hành động POST); tính idempotent của đặt trước so sánh ngày, số phút và dữ kiện quyền cho phép, không so ghi chú tự do; service không đòi actor = chủ sở hữu (router truyền người dùng của phiên cho cả hai); CSV ngày lễ đi trong chuỗi JSON trong giới hạn body 64 KB (tối đa 500 dòng); commit ngày lễ giống hệt được thử lại sau khi ranh giới về sau đã dịch nhận `retroactive_change` thay vì no-op (T08); ngoại lệ kỳ lương không có dòng kỳ đã lưu chỉ được ghi nhận; lịch không có phiên bản bị từ chối; dữ liệu mẫu của seed không có unit test riêng; ADV-A-05 (một hàm ghi nội bộ duy nhất) là backlog.
8. **Kế thừa từ WP1:** bộ giới hạn đăng nhập theo từng tiến trình và khóa theo địa chỉ socket; phiên có hạn tuyệt đối 7 ngày, không có hết hạn do rảnh; người dùng chỉ được tạo bằng seed/CLI và route admin mới; `npm ci` trong thư mục Dropbox có thể lỗi `EBUSY`. Bộ kiểm tra gói dừng ở liên kết trỏ tới thư mục như ở `tasks/WP2-T08.md` (liên kết tới thư mục làm nó lỗi; các liên kết trong bản bàn giao này chỉ trỏ tới file, và preflight ở trên đạt); đó là sửa bản ghi ngoài digest source.
9. **Môi trường:** harness e2e cần Node 24 ở đầu `PATH`, Edge đã cài (hoặc Chrome với `E2E_CHANNEL=chrome`) và dung lượng trống trong thư mục tạm của hệ điều hành; trên máy này ổ tạm `B:` từng đầy một lần trong T13 và bản xuất sạch được chuyển sang thư mục tạm của người dùng trên `C:`.

## Chỉ mục bằng chứng

Mọi thư mục nằm dưới `handoff/delivery/evidence/`. Log đã được che, LF, không có khoảng trắng cuối dòng; ảnh là tổng hợp (`*-synthetic.png`); mẫu CSV là `*-synthetic.csv.txt`.

| Thư mục | Nội dung |
|---|---|
| `WP2-PLAN/` | Baseline của kế hoạch |
| `WP2-T01/` … `WP2-T08/` | Mỗi tác vụ: lần chạy red và green, kiểm tra mutation, `verify`, `digest`; T03 thêm các lần chạy đồng thời; T04 mẫu CSV bằng chứng; T08 mã nguồn và đầu ra của probe gán lại lịch |
| `WP2-ADV-GATE/`, `WP2-ADV-REVIEW/` | Lần chạy verifier tư vấn và các probe của auditor tư vấn trên freeze T04 (00-commands.txt lập chỉ mục mọi lệnh và exit) |
| `WP2-ADVFIX/`, `WP2-CALFIX/`, `WP2-DEC/`, `WP2-INFRA1/` | Các tác vụ sửa, quyết định và hạ tầng |
| `WP2-T05-PRIVSCAN/`, `WP2-T05-RECON/`, `WP2-T05-RECON2/`, `WP2-T11-RECON/` | Quét riêng tư và đối soát các freeze thủ công |
| `WP2-T09-PREP/` | Probe chỉ đọc cho harness trình duyệt và việc tách T09 |
| `WP2-T09A/`, `WP2-T09B/`, `WP2-T10/`, `WP2-T11/`, `WP2-T12/` | Bằng chứng trình duyệt: log và ảnh tổng hợp (4, 6, 19, 4 và 14 ảnh) |
| `WP2-T01-FREEZE/` … `WP2-T12-FREEZE/`, `WP2-CALFIX-FREEZE/`, `WP2-CKPT1/` | Kiểm tra của committer, thông điệp commit và log |
| `WP2-T13/` | Tác vụ này: `npm-ci.txt`, `verify.txt`, `vitest-per-file.txt`, `e2e.txt`, `digest.txt`, `preflight.txt`, `commands.txt` |
| `WP2-GATE/`, `WP2-GATE2/`, `WP2-GATE3/`, `WP2-GATE4/` | Các lần chạy gate trên freeze T13 và ba freeze sửa; `WP2-GATE4/` là bộ của commit được chấp nhận (25 ảnh tổng hợp, `evidence-export-synthetic.csv.txt`, `00-commands.txt`) |
| `WP2-FIXA/`, `WP2-FIXB/`, `WP2-FIXB2/`, `WP2-FIXB3/`, `WP2-FIX-FREEZE/`, `WP2-FIXB2-FREEZE/`, `WP2-FIXB3-FREEZE/` | Log, probe và kiểm tra freeze của các vòng sửa |
| `WP2-AUDIT-A/`, `WP2-AUDIT-A2/`, `WP2-AUDIT-A2-a2/`, `WP2-AUDIT-A2-a3/`, `WP2-AUDIT-B/`, `WP2-AUDIT-B2/`, `WP2-AUDIT-B3/`, `WP2-AUDIT-B4/` | Bằng chứng audit độc lập (probe, lần chạy so sánh, chỉ mục) |
| `WP2-ACCREC/` | Các kiểm tra của bản ghi chấp nhận này: preflight và đối chiếu EN/VI |

Bản ghi tác vụ: `handoff/delivery/tasks/` (`WP2-PLAN.md`, `WP2-T01.md` … `WP2-T13.md`, các bản ghi FREEZE, sửa lỗi và quyết định). Review tư vấn: [WP2_ADV_LEDGER_REVIEW.vi.md](WP2_ADV_LEDGER_REVIEW.vi.md).

## Sai lệch (T13)

Ngoài các đường dẫn sở hữu của brief: `src/server/cli.ts` (mười hai dòng: truyền `SEED_EMPLOYEE2_PASSWORD`, bật bộ dữ liệu phát triển, in dòng dữ liệu mẫu). Bước 3 và bước 4 của README và đoạn kết được cập nhật cùng dòng trạng thái, vì văn bản cũ nêu hành động tiếp theo F-01 đã lỗi thời. `tests/e2e/fixtures.ts` không bị sửa. Không có sai lệch nào khác.

## Bản ghi chấp nhận (WP2-ACCEPT)

Do WP2-ACCREC chuẩn bị (chỉ bản ghi, không sửa source). Nguồn: các tác vụ trên bảng WP2-GATE đến WP2-GATE4, WP2-AUDIT-A đến WP2-AUDIT-B4 và WP2-FIXA đến WP2-FIXB3, cùng các báo cáo [WP2_REVIEW_A](WP2_REVIEW_A.vi.md), [WP2_REVIEW_B](WP2_REVIEW_B.vi.md), [WP2_RECHECK_A](WP2_RECHECK_A.vi.md), [WP2_RECHECK_A3](WP2_RECHECK_A3.vi.md), [WP2_RECHECK_A4](WP2_RECHECK_A4.vi.md), [WP2_RECHECK_B](WP2_RECHECK_B.vi.md), [WP2_RECHECK_B3](WP2_RECHECK_B3.vi.md) và [WP2_RECHECK_B4](WP2_RECHECK_B4.vi.md) (mỗi báo cáo có bản tiếng Anh). Bước chấp nhận trên bảng thuộc điều phối viên.

- **Commit được chấp nhận và định danh:** `5fafeaee72509c6110a907458643bf7582dad81a` (đã push), digest source `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` trên 613 file (loại `handoff/`); đối chiếu chéo `git ls-tree` cho cùng giá trị ([WP2-GATE4](tasks/WP2-GATE4.md), [WP2-AUDIT-B4](tasks/WP2-AUDIT-B4.md)). Chênh lệch so với freeze T13 `8fae685`: ba commit sửa (`f79413b`, `a3d1b65`, `5fafeae`; bảng freeze ở trên).
- **Chuỗi gate** (verifier, bản xuất `git archive` sạch ngoài Dropbox, Node v24.21.0):

| Gate | Commit | Digest (file) | Unit test | E2E | Kết luận |
|---|---|---|---:|---|---|
| WP2-GATE | `8fae685` | `8ebce5fe…24a2` (611) | 599 | 66 đạt, 2 bỏ qua | PASS, ghi nhận F1 |
| WP2-GATE2 | `f79413b` | `4c2bd7ef…3528` (611) | 606 | 74 đạt, 2 bỏ qua | PASS |
| WP2-GATE3 | `a3d1b65` | `5b370621…8581` (613) | 611 | 74 đạt, 2 bỏ qua | PASS |
| WP2-GATE4 | `5fafeae` | `e61fa914…14df` (613) | 613 | 74 đạt, 2 bỏ qua | **PASS** |

  Mỗi gate còn chạy: `npm ci` exit 0; `verify` với `--trace-deprecation --pending-deprecation` exit 0 và không có dòng deprecation; file đồng thời 20 lần (mỗi lần 8/8); CSDL mới và nâng cấp `f32978f` qua migration [2,3]; LG-01…LG-10 và DF-01…DF-16 đều có mặt và đạt; `validate_orchestration`, `check_recovery` và `--preflight` exit 0 với Python của workflow. Số liệu lấy từ các bản ghi tác vụ GATE.
- **Chuỗi audit:**

| Tác vụ | Commit | Kết luận | Phát hiện |
|---|---|---|---|
| WP2-AUDIT-A | `8fae685` | FIX REQUIRED | WP2-A-01 (Medium, riêng tư): bản xem trước nhập ngày lễ trả số đếm theo ngày của các mục ngày của nhân viên. R1–R4 không chặn. |
| WP2-AUDIT-B | `8fae685` | FIX REQUIRED | WP2-B-01 (Medium): múi giờ nhập của nhập tay mặc định là múi giờ báo cáo, không phải múi giờ hiển thị (R-07). WP2-B-02 (Low): cỡ chữ và độ rộng nguyên văn trong `styles.css`. |
| WP2-AUDIT-A2 lần 1 | `f79413b` | PASS | WP2-A-01 đã xử lý; mới có WP2-A2-01 (Info) và WP2-A2-02 (Low). |
| WP2-AUDIT-B2 | `f79413b` | FIX REQUIRED | WP2-B2-01 (Medium): e2e R-07 gán cứng độ lệch PDT. WP2-B2-02 (Low): còn các giá trị CSS nguyên văn. B-01 và B-02 được xác nhận đã sửa. |
| WP2-AUDIT-A2 lần 2 | `a3d1b65` | PASS | WP2-A2-02 đã xử lý; mới có WP2-A3-01 (Info). |
| WP2-AUDIT-B3 | `a3d1b65` | FIX REQUIRED | WP2-B3-01 (Low): giá trị `font-weight` và `letter-spacing` nguyên văn. WP2-B3-02 (Low): chú thích của oracle múi giờ nói DST fold gây throw nhưng thực tế không. |
| WP2-AUDIT-A2 lần 3 | `5fafeae` | **PASS** | Không có phát hiện chặn; mới có WP2-A4-01 (Info, công cụ). |
| WP2-AUDIT-B4 | `5fafeae` | **PASS** | Không có phát hiện; các mục tùy chọn bên dưới. |

  Khu vực A và khu vực B đều kết thúc bằng PASS trên `5fafeae`. A2 lần 1 và lần 2 là PASS ở digest của chính chúng (`4c2bd7ef…`, `5b370621…`); các thay đổi source sau đó (WP2-FIXB2, WP2-FIXB3) làm chúng mất hiệu lực với tư cách kết luận cuối, nên chỉ lần 3 ([WP2_RECHECK_A4](WP2_RECHECK_A4.vi.md)) được tính. Khu vực B chạy B → B2 → B3 → B4. Mọi auditor là ngữ cảnh mới và không viết gì trong WP2 (bản ghi audit).
- **Các vòng sửa và việc mỗi vòng đã đóng:**
  - **WP2-FIXA** (digest `73db9c0a…`): WP2-A-01. Bỏ `default_labelled_entries`, `explicit_overrides_preserved` và truy vấn nhân viên khỏi bản xem trước ngày lễ; `finalized_conflicts` chỉ còn `{date}`; test hồi quy rằng bản xem trước giống hệt khi có và không có mục của nhân viên; màn hình nêu quy tắc giữ nhãn bằng chữ. Không đổi văn bản chuẩn.
  - **WP2-FIXB** (kèm phụ lục; digest `4c2bd7ef…`): WP2-B-01, mặc định theo múi giờ hiển thị qua `inputZoneChoices` và giờ kết thúc dự kiến suy ra theo múi giờ hiển thị; trong phụ lục, `changeZone`, để đổi múi giờ nhập của phiên đã lưu thì đọc lại giờ tường đã gõ (quy tắc 7 của AGENTS, R-07). WP2-B-02: mười giá trị CSS nguyên văn thành custom property với giá trị tính ra giống hệt. Kiểm tra quy tắc 8: R-07 đã đòi mặc định theo múi giờ hiển thị.
  - **WP2-FIXB2** (digest `5b370621…`): WP2-B2-01, e2e R-07 không phụ thuộc mùa với `tests/client/zoneOracle.ts` chỉ dùng Intl và unit test của nó; WP2-B2-02, thêm bốn token CSS; WP2-A2-02, mã 201 của ngoại lệ kỳ lương chỉ trả `{payroll_exception}` (cờ làm mới nằm trong sự kiện audit; từ chối 409 `period_finalized` không đổi); WP2-A2-01, chú thích lỗi thời trong `admin.ts` và `isolation.test.ts`.
  - **WP2-FIXB3** (digest `e61fa914…14df`): WP2-B3-01 và cả lớp lỗi, từ 60 khai báo có giá trị nguyên văn xuống 0 (sáu điều kiện `@media` vẫn nguyên văn); WP2-B3-02, `instantOfWallTime` throw với DST fold như với gap, kèm sáu unit test.
- **Mục không chặn được chuyển tiếp (không mục nào chặn việc chấp nhận):**
  - **R1** (Info): nhánh duplicate của `postCorrection` không so `sourceRef`, nên thử lại cùng khóa với `sourceRef` khác là `duplicate` trong khi `postCredit` và `postDeficitDebit` trả `source_key_conflict`. WP3 nên làm khóa hiệu chỉnh riêng theo revision hoặc thêm `sourceRef` vào phép so.
  - **R2** (Info): ghi chú chính sách có dấu cách đứng trước `=` được xuất nguyên văn trong CSV bằng chứng (ngoài danh sách ký tự kích hoạt đã định).
  - **R3** (Info): `PATCH /api/admin/users/:id` có đổi lịch trả 409 `calendar_in_use`, cho admin biết tài khoản có dữ liệu hay không (quyết định CALFIX, đã chấp nhận).
  - **R4** (chuyển tiếp): WP3 phải xử lý và lưu biến thể `pending` của `CorrectionResult`/`DeficitDebitResult` và bỏ số phút tạm tính khi chốt; một khoản ghi do hệ thống tạo hiện trong lịch sử là "bởi người khác", và `ot_ledger.correction` được gắn nhãn "OT credit corrected" cả với hiệu chỉnh khoản ghi nợ (chỉ là hình thức).
  - **ADV-A-05** (Info): đường ghi nội bộ trùng lặp; backlog.
  - **WP2-A2-01** (Info): **đã đóng**. Chú thích mã đã sửa trong WP2-FIXB2, và câu lỗi thời của bản bàn giao được sửa trong tác vụ này (dòng FR-13; trước là dòng 41, vẫn mô tả số đếm theo ngày suy ra từ nhân viên mà WP2-FIXA đã bỏ).
  - **WP2-A3-01** (Info, hướng về sau): payload audit `payroll_exception.create` (`calendars.ts:335-344`) giữ `refreshed_pay_period` và dòng đã lưu. Sự kiện không có chủ và hiện không được lịch sử của admin hay nhân viên liệt kê (`history.ts:66` lọc theo `owner_user_id = ?`); mọi màn audit cho admin sau này phải ẩn nó.
  - **WP2-A4-01** (Info, công cụ tùy chọn): `scripts/smoke-built-server.mjs:11,102-112` chấp nhận phản hồi health của tiến trình khác khi cổng mặc định 3100 đã bị chiếm, rồi thoát với exit 13 mà không có dòng FAIL; có thể chọn cổng trống hoặc dừng nhanh. Cách tạm: đặt `SMOKE_PORT`. Không cần đổi gì cho WP2.
  - **F1** (ghi chú chỉ về bằng chứng): spec thiếu số dư không ghi ảnh chụp trong các lần chạy gate; test đạt trên cả hai project, và WP2-AUDIT-B đã chụp `insufficient-balance-{desktop,mobile}-synthetic.png`, nên không cần sửa mã.
  - **Mục tùy chọn của B4** ([WP2_RECHECK_B4](WP2_RECHECK_B4.vi.md), không phải lỗi): (1) `--space-6` được định nghĩa nhưng không dùng; (2) các token cùng giá trị nhưng khác nghĩa (`--space-0` và `--rule`, `--hairline` và `--press-offset`), và các token cấu trúc `--track`, `--cols-2/3/4`, `--order-first`, chi tiết hơn mức chuẩn UI cần; (3) phần đầu stylesheet nêu giá trị 768 px nhưng các truy vấn còn dùng 767 px; (4) oracle lấy độ lệch ứng viên từ ±1 ngày, nên một múi giờ có hai lần chuyển trong 48 giờ sẽ lọt (không có trong 2026–2027); (5) chuyển từ B3, `legacyPdtWallTime` vẫn được export cho unit test của nó, và không test nào đã commit ghim giá trị style tính ra.
- **Chuyển tiếp sang WP3:**
  - Xử lý và lưu biến thể `pending` của `CorrectionResult`/`DeficitDebitResult` (giới hạn 1 ở trên).
  - Bỏ số phút tạm tính khi chốt để không đếm cạnh credit đã ghi (giới hạn 2).
  - Gán lại lịch về sau theo ngày hiệu lực vẫn là lựa chọn của chủ sở hữu; hiện lịch không đổi được khi đã có dữ liệu (giới hạn 3).
  - Khóa hiệu chỉnh riêng theo revision (R1).
  - Cũng từ các mục trên: ẩn cờ làm mới kỳ lương trong mọi màn audit cho admin (A3-01), việc củng cố cổng smoke tùy chọn (A4-01) và các mục tùy chọn của B4.
- **Kiểm chứng bản ghi này:** `validate_package.py --preflight` và kiểm tra đối chiếu EN/VI nằm trong [preflight.txt](evidence/WP2-ACCREC/preflight.txt) and [parity.txt](evidence/WP2-ACCREC/parity.txt).
- **Trạng thái:** WP2 đã triển khai, đã qua gate (GATE4 PASS) và được audit độc lập (A2 lần 3 PASS, B4 PASS) trên `5fafeae`. Không có hành động production và không cần chủ sở hữu cho phép. Hành động tiếp theo: điều phối viên ghi nhận chấp nhận WP2 và bắt đầu kế hoạch WP3.
