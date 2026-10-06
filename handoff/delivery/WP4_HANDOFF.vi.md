# Bàn giao WP4 — Triển khai, phục hồi và nhập workbook

Hoàn thành từ [HANDOFF](../templates/HANDOFF.vi.md) với bằng chứng thực. Bản gốc tiếng Anh: [WP4_HANDOFF.md](WP4_HANDOFF.md). Mọi con số dưới đây được chép từ bản ghi tác vụ trong `handoff/delivery/tasks/` hoặc thư mục bằng chứng nêu bên cạnh; không chạy lại gì để tạo ra số liệu. Số liệu chưa chạy hoặc chưa kiểm chứng được ghi rõ như vậy. Đây là bản đóng băng gói của WP4-T13: nó nêu những gì bên triển khai đã báo cáo và những gì gate cùng các audit còn phải đánh giá. Kết quả được báo cáo không phải bằng chứng độc lập.

## Bản ghi bàn giao

- **Gói/phạm vi, ngày và tác giả:** chỉ WP4, theo [WP4-PLAN](tasks/WP4-PLAN.md), [WP4_IMPLEMENT](../prompts/WP4_IMPLEMENT.vi.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md): cấu hình sẵn sàng cho container, image không root đã ghim, bootstrap production, backup và restore nhất quán với tạm dừng gửi ra ngoài, đối soát, nâng cấp và rollback, nhập workbook chỉ dành cho chủ sở hữu kèm số dư OT mở đầu tường minh, trạng thái vận hành cho quản trị viên, drill vận hành và sổ tay vận hành. Viết ngày 2026-10-06 bởi worker WP4-T13.
- **Model/effort/tốc độ thực tế, hoặc không quan sát được:** do các bản ghi tác vụ tự báo cáo. T05, T06 (cả hai lần), T09 và T10 chạy trên `claude-opus-5-5` (profile `timesheet-worker-high`, override `opus`, lý do `novelty`); T01 đến T04, T05B, T07, T07B, T08, T09B, T11, T12, T12A và WP4-DEC chạy trên `claude-sonnet-5-5`, tác vụ này cũng vậy. Effort và tốc độ không quan sát được.
- **Commit SHA, digest source và commit chưa push, hoặc bản lưu source đầy đủ:** bản đóng băng triển khai cuối cùng là WP4-T12-FREEZE, commit `0f6abdf77c313f2dcb45bf624ee56294e5976c78`, digest source `de0e215be7594852bf0c26b22438ead5afcacb529187100549047b1ab408f41b` trên 772 file (loại trừ `handoff/`). WP4-T13 chỉ đổi tài liệu (`docs/11_OPERATIONS_RUNBOOK`, một câu ở `docs/03`, `DEVELOPMENT`, `README`, bản bàn giao này), nên digest của nó khác; digest chính thức là digest mà gate tính trên bản export sạch của WP4-T13-FREEZE. Commit chưa push: không có theo như biết tại mốc nền.
- **Trạng thái triển khai; trạng thái review độc lập:** mọi tác vụ triển khai WP4 (T01 đến T12, cùng T05B, T07B, T09B và T12A, và WP4-DEC) đã được triển khai và đóng băng theo bảng điều phối; T13 (tác vụ này) là tác vụ tài liệu cuối gói. Review độc lập phần mềm: **chưa chạy** (WP4-GATE, rồi AUDIT-A và AUDIT-B). Chưa tác vụ WP4 nào có audit độc lập; mỗi bản ghi tác vụ là bằng chứng của chính bên triển khai.
- **Hành vi đã triển khai và file đã đổi:** xem "Phạm vi bàn giao theo tác vụ" bên dưới.
- **Migration/tương thích schema:** bảy migration, 0007 đến 0013, đều có checksum bảo vệ (xem "Migration 0007 đến 0013"). Schema mới nhất là 13; bản build cũ từ chối CSDL của schema mới hơn.
- **Hợp đồng chuẩn đã đổi và lý do, hoặc không:** có, được WP4-DEC (`e5576de`) ghi bằng tiếng Anh và tiếng Việt cho các quyết định F-1 đến F-6 của chủ sở hữu ngày 2026-10-05: `docs/03` (một mục mới về nhập, số dư mở đầu và giữ lại; danh sách route API), `docs/07` (không session secret, giữ lại 7/4/6, lần gửi bị giữ và `JOB_RUNNER=off`, quy tắc nhập) và `docs/10` (các quyết định). WP4-T13 thêm một câu vào `docs/03` (và bản dịch) nêu các route nhập và số dư mở đầu; đây là đồng bộ tài liệu, không phải đổi quy tắc. Quy tắc tính toán và fixture không đổi. WP4 không đổi đường dẫn quản trị nào (`.claude/`, `AGENTS.md`, `handoff/prompts/`).
- **Bảng kiểm chứng:** bên dưới.
- **ID AC đã bao phủ; đường dẫn thực sự chưa chạy/bị chặn:** bên dưới.
- **Bằng chứng ảnh chụp/PDF/mail capture tổng hợp:** ảnh `*-synthetic.png` nằm trong thư mục bằng chứng của T03 (`setup`), T07 (`admin-status`), T07B (`admin-users-not-set-up`) và T11 (`import-preview`, `opening-balance`). Mail capture được drill (stage 3 và 5) và các test tích hợp thực thi; không có `.eml`, PDF, workbook hay backup nào được lưu trong repo.
- **Phát hiện đã xử lý, lỗi còn lại và backlog tùy chọn:** bên dưới ("Giới hạn đã biết" và "Hạng mục audit phải đánh giá").
- **Đầu vào cài đặt cần từ chủ sở hữu, không gồm bí mật:** model NAS, phiên bản DSM và `uname -m`; một đường dẫn dữ liệu cục bộ trên máy chủ và một đường dẫn backup riêng; UID/GID và quyền thư mục; tên máy chủ reverse proxy, chứng chỉ HTTPS và địa chỉ proxy cho `TRUSTED_PROXY_ADDRESSES`; NTP; một thiết bị riêng cho bản sao backup; chạy sổ tay trên NAS. Không yêu cầu bí mật trong chat; thông tin đăng nhập SMTP vẫn chưa dùng trong WP4 và thuộc gói pilot WP5.
- **Hành động production và sự cho phép tường minh, thường là không có:** không có. Không triển khai, không mở ra máy chủ (chỉ loopback), không email thật, không dữ liệu thật. `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt; chế độ gửi ra ngoài là capture xuyên suốt; thời điểm kích hoạt để trống.
- **Usage/credit chỉ khi thực sự quan sát được:** không quan sát được trong các phiên này.
- **Một hành động tiếp theo và prompt tương ứng:** chạy WP4-GATE (verifier) trên commit WP4-T13-FREEZE như mục E của WP4-PLAN, rồi hai audit độc lập mới ([WP4_REVIEW](../prompts/WP4_REVIEW.vi.md)); không bắt đầu WP5 trước khi các bước đó đạt.

## Nguồn gốc điều phối

- **ID nhiệm vụ/tác vụ và bảng điều phối/checkpoint:** nhiệm vụ `timesheet-software-readiness`, gói WP4, các tác vụ WP4-PLAN, WP4-T01 đến WP4-T13 (cùng WP4-T05B, WP4-T07B, WP4-T09B và WP4-T12A), WP4-DEC và một FREEZE cho mỗi tác vụ triển khai. Bảng điều phối: [ORCHESTRATION.json](ORCHESTRATION.json); brief và kết quả: `handoff/delivery/tasks/WP4-*.md`; bằng chứng: `handoff/delivery/evidence/WP4-*/`.
- **Danh tính bên triển khai và auditor độc lập; ngữ cảnh tách biệt:** mỗi tác vụ chạy trong ngữ cảnh subagent riêng. Chưa có audit gói WP4; gate và các audit phải dùng ngữ cảnh mới, chưa từng tạo ra thay đổi WP4 nào.
- **Digest đã kiểm chứng/review hiện tại; báo cáo và quyết định review:** chưa có. Gate tính digest chính thức trên bản export sạch của WP4-T13-FREEZE.
- **Tác vụ còn lại/phụ thuộc; một hành động điều phối tiếp theo:** WP4-T13-FREEZE, WP4-GATE, AUDIT-A, AUDIT-B, WP4-ACCREC, WP4-ACCEPT. Hành động điều phối tiếp theo: giao WP4-T13-FREEZE sau các kiểm tra của tác vụ này, rồi WP4-GATE.
- **Mức sẵn sàng phần mềm và việc chủ sở hữu cho phép pilot, tách riêng:** mức sẵn sàng phần mềm của WP4: đã triển khai, chưa qua gate hay audit, và đích NAS CHƯA ĐƯỢC KIỂM CHỨNG. Việc chủ sở hữu cho phép pilot: chưa yêu cầu và chưa được cấp; chưa triển khai gì và chưa gửi mail thật.

## Quyết định của chủ sở hữu và của coordinator

Nguồn: [docs/10](../../docs/10_DECISIONS_AND_SOURCES.vi.md), `owner_decisions` và `coordinator_decisions` của bảng điều phối, và [WP4-DEC](tasks/WP4-DEC.md).

| Quyết định | Ghi nhận điều gì | Do tác vụ nào thực hiện |
|---|---|---|
| F-1 (a) | Mỗi người chỉ nhập workbook của chính mình; quản trị viên không thể nhập cho ai khác | T09 (route chỉ dành cho chủ sở hữu, người dùng khác và quản trị viên nhận 404), T11 |
| F-2 (a) | Kỳ đã nhập không ghi sự kiện sổ cái, không thể ký hay nộp (409 `imported_period`) và là lịch sử chỉ đọc | T09, T10 (từ chối dùng phép OT), T11 |
| F-3 (a) | Số dư mở đầu là số phút có dấu khác không, mỗi người một khoản, chỉ đổi bằng điều chỉnh có lý do, một loại bút toán sổ cái mới; tài khoản chưa từng cấu hình có cờ "not set up" cho quản trị viên | T10, T07B, T11 |
| F-4 (a) | Chỉ xóa các dòng `deadline_scan` và `reminder_scan` đã thành công và cũ hơn 30 ngày, qua ngoại lệ trigger giới hạn trong migration | T07B (migration 0011) |
| F-5 | Prune backup giữ 7 ngày, 4 tuần và 6 tháng chỉ trên thư mục do công cụ tạo; bản sao trên thiết bị riêng là bước của chủ sở hữu | T05B, mục 4 và 5 của sổ tay |
| F-6 | docs/07 nói không có session secret của ứng dụng; chỉ có thông tin đăng nhập SMTP | WP4-DEC |
| Lần gửi bị giữ sau restore (coordinator, 2026-10-05) | Mọi job gửi và nhắc đang xếp hàng hoặc đang được thuê của backup đều bị giữ; việc giải phóng hoặc bỏ có ghi nhật ký kiểm toán quyết định; không gì từ backup tự động đi ra | T06 lần 2 |
| Restore rollback và `JOB_RUNNER=off` (coordinator, 2026-10-05) | Restore giữ schema cũ thì giữ các lần gửi trong backup và bản build cũ chạy với bộ chạy tắt cho đến khi đối soát | T12A, docs/07 |
| Tách T12 (coordinator, 2026-10-05) | T12A chạy sớm các stage nâng cấp và rollback; T12 thêm stage 6 và chạy lại mọi stage | T12A, T12 |

## Câu hỏi mở cho chủ sở hữu (I-1 đến I-4)

Được hỏi ngày 2026-10-06 từ kết quả T09 và T10. Không có gì bị chặn: mặc định an toàn vẫn giữ, mỗi mục đều đảo ngược được, và câu trả lời khác mặc định sẽ thành một việc bổ sung nhỏ trước WP4-GATE.

| Câu hỏi | Lựa chọn | Mặc định an toàn hiện tại |
|---|---|---|
| I-1 Kỳ nháp của ứng dụng có được nhận ngày nhập không? | (a) không bao giờ; (b) chỉ gộp vào những ngày chưa có bản ghi ứng dụng, kỳ vẫn ký được và không gắn cờ; (c) gắn cờ cả kỳ nháp là `imported_unverified` và chỉ đọc | (a), được khuyến nghị và hiện hành |
| I-2 "Off day (overtime used)" được nhập thế nào? | (a) chỉ bỏ qua; (b) nhập thành Off, nhãn giữ trong nguồn riêng tư và nhật ký kiểm toán, không ảnh hưởng sổ cái; (c) Worked kèm số phút phép loại OT | (a) là hiện hành; (b) được khuyến nghị |
| I-3 Kỳ chưa kết thúc có được nhập không? | (a) không; (b) có | (a), được khuyến nghị và hiện hành |
| I-4 Số dư mở đầu nhập nhầm có được điều chỉnh về ròng bằng không không? | (a) có, bằng điều chỉnh có lý do kèm bằng chứng bù trừ (bút toán gốc vẫn còn); (b) không, điều chỉnh phải để lại số dư khác không | (b) là hiện hành; (a) được khuyến nghị |

## Phạm vi bàn giao theo tác vụ

Mỗi dòng nêu commit đóng băng của bảng điều phối (SHA rút gọn) và số file test cùng số test của `npm run verify` mà bản ghi tác vụ báo cáo.

| Tác vụ | Đóng băng | Hành vi | Verify (file / test) |
|---|---|---|---|
| WP4-T01 | `a1dc01b` | Cấu hình production (`DATA_DIR` và `DATABASE_PATH` tuyệt đối), `TRUSTED_PROXY_ADDRESSES` cho bộ giới hạn đăng nhập, `GET /api/ready` với danh sách khóa chính xác, `.env.example` | 63 / 1449 |
| WP4-T02 | `37f1be2` | Migration 0007: `via_share_id` được ghi trên dòng audit; History và gợi ý Review đọc dấu này; `HEAD` trên PDF được chia sẻ không ghi audit | 64 / 1469 |
| WP4-T03 | `199e792` | Migration 0008; `bootstrap --config` và `--new-token`; `POST /api/auth/bootstrap` với token dùng một lần 60 phút; màn hình Setup | 65 / 1494 |
| WP4-T04 | `3b2ddf2` | `Dockerfile` nhiều tầng đã ghim (không root UID/GID 10001, volume `/data`, health check), `.dockerignore`, `compose.example.yaml`, drill stage 1 | 65 / 1494 |
| WP4-T05 | `0c58130` | Migration 0009; `backup --to <dir>` (online backup, manifest có hash, không cần tạm dừng), trạng thái backup | 66 / 1503 |
| WP4-T06 | `72ab2ed` | Migration 0010; tạm dừng gửi ra ngoài, `restore` cô lập, lần gửi bị giữ, `outbound resume|release|drop` (lần 2 thực hiện quyết định của coordinator) | 67 / 1525 |
| WP4-T07 | `e1d97bd` | Trạng thái quản trị: các khối backup, đĩa và gửi ra ngoài cùng biểu ngữ; lượt quét file mồ côi hằng ngày | 68 / 1545 |
| WP4-T08 | `dd1422f` | Bộ đọc workbook an toàn, mapping template v1, bộ tạo workbook tổng hợp; dependency `fflate` 0.8.3 và `fast-xml-parser` 5.11.2 | 69 / 1573 |
| WP4-T12A | `0f989e4` | Drill stage 4 và 5 (nâng cấp, rollback), `restore --keep-schema [--confirm]`, test nâng cấp | 70 / 1589 |
| WP4-DEC | `e5576de` | Các quyết định F-1 đến F-6 của chủ sở hữu được ghi vào docs 03, 07 và 10 (EN và VI) | không áp dụng |
| WP4-T07B | `641ca10` | Cờ "not set up" cho quản trị viên; migration 0011 và giữ lại dòng job 30 ngày | 71 / 1613 |
| WP4-T05B | `6fecd88` | `backup --prune` (7/4/6) và `backup prune --in <dir> --dry-run` | 72 / 1625 |
| WP4-T09 | `a679787` | Migration 0012; `/api/imports` chỉ dành cho chủ sở hữu: xem trước và commit idempotent với quyết định xung đột tường minh; các chốt chặn F-2 | 73 / 1646 |
| WP4-T09B | `1b4d817` | Nguồn nhập trong backup và restore với kiểm tra hash | 73 / 1655 |
| WP4-T10 | `aff904a` | Migration 0013 (dựng lại `ot_ledger`); `/api/ot/opening-balance`; từ chối dùng phép OT trong kỳ đã nhập | 74 / 1673 |
| WP4-T11 | `61bf524` | Màn hình nhập và số dư mở đầu; trạng thái "Imported, unverified"; `imported_unverified` trong mô hình đọc timesheet | 75 / 1707 |
| WP4-T12 | `0f6abdf` | Drill stage 6 (nhập không đổi gì, số dư mở đầu một lần, 409 `imported_period`, 404 cho người khác) và các stage đã mở rộng; drill đầy đủ đạt | 75 / 1710 |
| WP4-T13 | chưa đóng băng | Sổ tay vận hành, tài liệu phát triển, README, bản bàn giao này | không áp dụng (chỉ tài liệu) |

Drill container, lần chạy đầy đủ cuối cùng (WP4-T12, `npm run drill:container -- --work ... --project ts-wp4-t12 --wp3 ...`): mã thoát 0, `DRILL STAGES 1-6 PASSED`, stage 1: 31, stage 2: 31, stage 3: 56, stage 4: 35, stage 5: 27, stage 6: 23, tổng 205 PASS và 0 FAIL (`handoff/delivery/evidence/WP4-T12/02-drill-green.txt`). Docker Desktop, linux/amd64, chế độ capture, dữ liệu tổng hợp. Lần chạy đầu-cuối cuối cùng (WP4-T11): mã thoát 0, 145 đạt, 5 bỏ qua.

Migration 0007 đến 0013: `0007_audit_access` (một cột dấu có thể null và một trigger; không viết lại dòng bất biến), `0008_bootstrap`, `0009_operations_backup`, `0010_outbound_pause`, `0011_job_retention`, `0012_imports` và `0013_ot_opening_balance` (dựng lại `ot_ledger` theo quy trình 12 bước đã được tài liệu hóa). Mỗi migration đều được test chạy mới và nâng cấp từ schema cũ hơn đã có dữ liệu; drill nâng cấp một CSDL schema 6 thật từ bản build WP3 đã chấp nhận lên 13.

## Kiểm chứng

| Lệnh | Môi trường | Mã thoát | Kết quả quan sát | Đường dẫn bằng chứng |
|---|---|---|---|---|
| `npm run verify` (kèm `--trace-deprecation --pending-deprecation`) | Node 24.21.0, WP4-T12 | 0 | 75 file test, 1710 test, build và smoke đạt, không có dòng deprecation | `evidence/WP4-T12/04-verify.txt` |
| `npm run drill:container -- --work ... --wp3 ...` | Docker Desktop 28.5.1, amd64 | 0 | stage 1 đến 6, 205 PASS, 0 FAIL | `evidence/WP4-T12/02-drill-green.txt` |
| `npm run test:e2e` | Edge đã cài, desktop và mobile, WP4-T11 | 0 | 145 đạt, 5 bỏ qua | `evidence/WP4-T11/08-test-e2e-final.txt` |
| `npm run digest` | Node 24.21.0, WP4-T12 | 0 | `de0e215b…b41b`, 772 file | `evidence/WP4-T12/05-digest.txt` |
| `validate_package.py --preflight`, đối chiếu EN/VI, `precommit-check.mjs` | tác vụ này | xem `evidence/WP4-T13/` | ghi tại đó | `evidence/WP4-T13/` |

Tác vụ này không chạy: test, drill và bộ test đầu-cuối (chỉ tài liệu). Gate phải chạy chúng trên bản export sạch.

## Độ bao phủ

Bằng chứng của bên triển khai, không phải bằng chứng độc lập.

| ID | Được bao phủ bởi |
|---|---|
| FR-15 | T01, T04, T05, T05B, T06, T09B, T12A, T12; sổ tay vận hành |
| FR-16 | T08, T09, T09B, T10, T11, T12 |
| AC-11 | Drill stage 1 (cài sạch và khởi động lại), stage 2 (backup khi đang ghi, hash), stage 3 (restore cô lập với hash và số dư), stage 4 (nâng cấp); `backup.test.ts`, `restore.test.ts`, `upgrade.test.ts` |
| AC-12 | T08 (bản xem trước đánh dấu các lỗi của template), T09 và T12 stage 6 (nhập lại y hệt không thêm timesheet, ngày, phiên, bút toán sổ cái, revision, sign-off, job hay lần gửi); `workbook-reader.test.ts`, `workbook-import.test.ts` |
| AC-15 | T01 (`/api/ready`, health an toàn), T05 và T07 (trạng thái backup), T06 (instance đã restore bị tạm dừng), T12A và drill stage 5 (rollback) |
| AC-01 (hồi quy) | Danh sách khóa chính xác của `operations-status.test.ts`; nhập chỉ dành cho chủ sở hữu (404 cho người khác và cho quản trị viên); drill stage 6 |
| AC-03 (hồi quy) | `opening-balance.test.ts` và drill stage 6 (số dư mở đầu ghi một lần; nhập lại không ghi bút toán sổ cái) |
| AC-08 (hồi quy) | T06 (lần gửi bị giữ, điều chặn khi giải phóng, `jobs-restart.test.ts`), drill stage 3 và stage 5 (không gì từ backup được gửi khi chưa đối soát) |
| AC-16 (hồi quy) | T02 (dấu đã ghi, `sharing-matrix.test.ts`); các route nhập và số dư mở đầu không thuộc chia sẻ nào |

Thực sự chưa chạy hoặc bị chặn: đích NAS (xem bên dưới); một lần chạy arm64 gốc (image arm64 chỉ được build dưới giả lập); WP4-GATE và cả hai audit.

## Giới hạn đã biết

- **NAS CHƯA ĐƯỢC KIỂM CHỨNG.** Mọi thứ chạy trên máy trạm của nhà phát triển (Docker Desktop trên WSL2, linux/amd64). Hệ thống file của NAS, reverse proxy, `TRUSTED_PROXY_ADDRESSES`, Task Scheduler, Hyper Backup hoặc USB, và NTP chưa được kiểm chứng; [sổ tay vận hành](../../docs/11_OPERATIONS_RUNBOOK.vi.md) liệt kê các bước của chủ sở hữu và một danh sách kiểm tra. Tính nhất quán của backup được chứng minh trên Docker Desktop, không phải trên hệ thống file của NAS.
- **Giới hạn của rollback.** Restore giữ schema cũ hơn không có tạm dừng gửi ra ngoài, nên job tạo sau rollback không bị giữ. Bản build trước phải chạy với `JOB_RUNNER=off` cho đến khi đối soát xong; đó là quy tắc đã ghi, không phải bước của drill. Bản build trước không có lệnh `outbound`, nên đối soát cần nâng cấp lần hai. Thay đổi thực hiện sau backup ghép đôi không có trong bản đã restore.
- **Trạng thái prune không được ghi lại.** `backup --prune` in số lượng, nhưng kết quả prune gần nhất không được lưu trong `operations_state` hay hiển thị trong trạng thái quản trị; việc đó cần cột mới và một migration, mà WP4-T05B không thêm.
- **Cảnh báo npm.** `npm audit` báo một phát hiện mức cao ở `source-map-js` (bản ghi WP4-T08). Đó không phải gói nào WP4 thêm vào (`fflate`, `fast-xml-parser` và các dependency của chúng). Chưa được phân loại hay sửa.
- **Ngoài phạm vi WP4, chuyển sang WP5:** mật khẩu tạm không có route đổi mật khẩu, nhắc hạn tối đa một lần và lỗi chứng chỉ TLS trên SMTP thật, gói pilot, và các mục backlog WP3 trong bàn giao WP3.
- **Ghi chú nhỏ hơn:** các job gửi bị giữ có thể được giải phóng nhưng không thể bỏ (chỉ lời nhắc mới bỏ được); trạng thái giữ lại có trong JSON nhưng chưa hiển thị trên màn hình quản trị; form số dư mở đầu nằm ở màn hình Import, màn hình OT có liên kết tới đó; các cửa sổ prune là cửa sổ lịch tính từ đồng hồ.

## Hạng mục audit phải đánh giá

- **Thay đổi khóa ngoại của `migrate()` (WP4-T10).** `defer_foreign_keys` một mình không đủ cho việc dựng lại `ot_ledger`, vì lệnh xóa ngầm của DROP TABLE tính cả vi phạm bị hoãn. Giờ `migrate()` tắt `foreign_keys` trước `BEGIN EXCLUSIVE`, khôi phục trong `finally`, và chạy `foreign_key_check` trước COMMIT mỗi khi nó áp dụng gì đó. Điều này đổi đường đi của mọi migration và mọi lần nâng cấp; đánh giá rằng nó an toàn và một vi phạm thật sự được rollback.
- **Các điểm ghim số job được nới lỏng.** Thêm lượt quét hằng ngày (T07) và job giữ lại hằng ngày (T07B) làm tăng số job được nhận và thành công. Các điểm ghim trong `tests/e2e/automation.spec.ts` (trần từ 1 lên 2, và 2 lên 4), `tests/integration/delivery.test.ts` và `tests/integration/jobs-restart.test.ts` được nới thủ công. Đánh giá rằng chúng vẫn chứng minh một instance chưa kích hoạt không gửi và không xếp hàng gì.
- **Các thành phần client được sửa ngoài danh sách sở hữu.** WP4-T11 sửa `ReviewScreen.tsx`, `BatchBar.tsx`, `TimesheetGrid.tsx`, `DayList.tsx`, `OtScreen.tsx`, `SharingOt.tsx`, `PeriodHeader.tsx`, `TimesheetScreen.tsx` và `otModel.ts` (khóa kỳ đã nhập, nhãn sổ cái và tên thao tác); WP4-T07 và WP4-T07B sửa `api.ts`, và `adminModel.ts` nằm trong `src/client/components/`. Các chỉnh sửa khác ngoài danh sách sở hữu có trong bản ghi tác vụ: `http/auth.ts` và `routes/api.ts` (T02), `sweepJob.ts` và `timesheetCommands.ts` (T09), `timesheets.ts` (T11) và `automation.ts` (T07B).
- **Hằng số breakpoint 767px.** `styles.css` có thêm các quy tắc dưới media query `767px`, cùng hằng số với các media query hiện có, trong khi chuẩn UI yêu cầu chỉ dùng token (E-8). Đánh giá xem hằng số này chấp nhận được hay cần một custom property.

## Phạm vi còn lại

- WP4-T13-FREEZE, rồi WP4-GATE (verifier) trên bản export sạch ngoài Dropbox: `npm ci`, `npm run verify`, `npm run test:e2e`, drill với `--wp3`, gate workbook, kiểm tra sổ tay nâng cấp và rollback, `precommit-check`, các validator và `npm run digest` cuối cùng.
- AUDIT-A (vận hành: T01, T03 đến T07, T12) và AUDIT-B (dữ liệu: T02, T08 đến T11), mới và độc lập, rồi WP4-ACCREC và WP4-ACCEPT.
- Câu trả lời cho I-1 đến I-4 (một việc bổ sung nhỏ nếu câu trả lời khác mặc định), và các bước NAS của chủ sở hữu. WP5 chỉ bắt đầu sau khi WP4 được chấp nhận.

## Hành động tiếp theo

Chạy WP4-GATE trên commit WP4-T13-FREEZE như mục E của [WP4-PLAN](tasks/WP4-PLAN.md), rồi hai audit độc lập mới.

## Biên bản chấp nhận (WP4-ACCEPT)

Chưa điền. WP4-ACCREC ghi gate, quyết định của các audit và digest được chấp nhận tại đây sau khi chúng đạt.
