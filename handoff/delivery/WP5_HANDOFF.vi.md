# Bàn giao WP5 — Nghiệm thu độc lập và chuẩn bị pilot

Hoàn thành từ [HANDOFF](../templates/HANDOFF.vi.md). Bản gốc: [WP5_HANDOFF.md](WP5_HANDOFF.md). Các mục tới "Nguồn gốc điều phối" là ảnh chụp WP5-REL trước cổng kiểm cuối gói; chỗ nào khác biên bản nghiệm thu ở cuối thì biên bản thắng. Biên bản nghiệm thu do WP5-ACCREC điền (chỉ ghi hồ sơ, không sửa mã nguồn) sau khi WP5-RECHECK đạt. Không số liệu nào được chạy lại để viết nó; mọi số liệu lấy từ bảng, ghi chú cổng kiểm và các file review.

## Biên bản bàn giao

- **Giai đoạn/phạm vi, ngày, người làm:** chỉ WP5, theo [WP5-PLAN](tasks/WP5-PLAN.md), [WP5_IMPLEMENT](../prompts/WP5_IMPLEMENT.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md). Ảnh chụp ngày 2026-10-06, do tác vụ WP5-REL viết ([brief](tasks/WP5-REL.md)).
- **Model/effort/tốc độ thật, hoặc không quan sát được:** WP5-REL: tự báo `claude-sonnet-5-5` (profile timesheet-worker); effort và tốc độ không quan sát được từ trong phiên. Các tác vụ khác tự báo trong brief của chúng.
- **Commit SHA, source digest và commit chưa push, hoặc source archive đủ:**
  - Cơ sở của WP5-REL: commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` (WP5-AC13-FREEZE), bằng `origin/main`, digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` trên 777 file (không tính `handoff/`).
  - WP5-REL đã được đóng băng thành `74d5bfec6700126da4105b5d97f5efe943f896f5` (digest `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 file). Nguồn được chấp nhận là bản sau: commit `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61`, 779 file (xem biên bản nghiệm thu).
  - Các commit của bản ứng viên đã chấp nhận: WP1 đến WP4 được chấp nhận tại `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 file); biên bản chấp nhận WP4 `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`.
- **Trạng thái triển khai; trạng thái review độc lập:**
  - Xong và đã đóng băng tại thời điểm ảnh chụp: đánh giá độc lập (khu vực A PASS, khu vực B FIX REQUIRED với B-01 Trung bình và B-02 Nhẹ, cả hai về tài liệu), bản sửa sổ tay WP5-FIXB (commit `85838b515a86b3cca40cfbba189ba290ec06de58`) và test AC-13 tích hợp WP5-AC13 (commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741`).
  - Sau đó: WP5-REL được đóng băng, qua cổng kiểm (WP5-GATE, WP5-REGATE, WP5-REGATE2 PASS), audit cuối và recheck (WP5-RECHECK PASS). Xem biên bản nghiệm thu.
- **Hành vi đã làm và file đổi:**
  - WP5-FIXB (`85838b5`): `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` (ràng buộc Compose, tag image theo release và bản sao file env), một chú thích trong `.env.example` và một trong `compose.example.yaml`.
  - WP5-AC13 (`8e99d2c`): `tests/integration/ac13-two-week.test.ts` và `tests/integration/ac13-support.ts`; không đổi mã nguồn ứng dụng.
  - WP5-REL (ảnh chụp này, chỉ tài liệu): `docs/12_RELEASE_NOTES.md` và `.vi.md` mới; `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` (mục 13 đến 16, các chỗ giữ chỗ mới, các dòng bảng ánh xạ lệnh); một dòng liên kết trong `README.md` và `README.vi.md`; cặp bàn giao này. Không đổi mã nguồn ứng dụng, test, hành vi Compose hay migration.
- **Migration/tương thích schema:** WP5 không đổi. Schema mới nhất là 13 (migration 0007 đến 0013 là của WP4; xem [bàn giao WP4](WP4_HANDOFF.vi.md)).
- **Hợp đồng chuẩn đổi và lý do, hoặc không:** không. `docs/11` có thêm mục 13 đến 16 làm phần sổ tay mà [11](../../docs/11_OPERATIONS_RUNBOOK.vi.md) đã hoãn cho pilot; không quy tắc nào của docs/01 đến 10 đổi.
- **Bảng kiểm:**

  | Lệnh | Môi trường | Exit status | Kết quả | Path bằng chứng |
  |---|---|---|---|---|
  | Đánh giá khu vực A: export sạch của `546cdda`, probe quy trình tích hợp | Node 24.21.0, chế độ capture, dữ liệu tổng hợp | không nhắc lại | PASS: 77 trên 77 kiểm tra, instance lỗi 12 trên 12 | `evidence/WP5-ASSESS-A/` |
  | Đánh giá khu vực B: phát hành tái lập được, drill stage 1 đến 6, restore độc lập | Docker Desktop, linux/amd64, dữ liệu tổng hợp | không nhắc lại | phát hiện WP5-B-01 (Trung bình) và WP5-B-02 (Nhẹ), cả hai về tài liệu | `evidence/WP5-ASSESS-B/` |
  | WP5-AC13 `npm run verify` | Node 24.21.0 | 0 | 77 file test, 1.759 test, smoke đạt | `evidence/WP5-AC13/verify.txt` |
  | Các kiểm tra WP5-REL | Node 24.21.0 | xem brief WP5-REL | đối chiếu EN/VI, kiểm tra khóa env, verify, precommit, preflight, digest | `evidence/WP5-REL/` |

  Số liệu chính xác nằm trong bằng chứng đã nêu. Số liệu cuối nằm trong biên bản nghiệm thu.
- **ID AC bao phủ; phần chưa chạy/bị chặn thật:**
  - AC-13 có test tích hợp (WP5-AC13) và probe độc lập (khu vực A). AC-14 và AC-15 được bao phủ ở chế độ capture, bằng drill WP4 và restore khu vực B.
  - Chưa chạy: SMTP thật (lời nhắc lặp lại, lỗi chứng chỉ, gửi trước khi có PDF), đích NAS (CHƯA ĐƯỢC KIỂM CHỨNG), kỳ pilot thật của chủ sở hữu, và các bước mục 13 đến 16 của sổ tay (viết từ code; không stage drill nào bao phủ).
- **Ảnh/PDF/capture giả:** các ảnh render PDF `*-synthetic.png` và danh sách capture đã che nằm trong `evidence/WP5-ASSESS-A/`. Mẫu email và PDF chính xác của pilot thuộc WP5-PILOT và chưa tồn tại.
- **Lỗi đã sửa, lỗi còn và backlog tùy chọn:**
  - Đã sửa: WP5-B-01 (Trung bình, ràng buộc Compose) và WP5-B-02 (Nhẹ, file env được giữ cùng backup ngoài thiết bị) bằng WP5-FIXB; WP5-FINAL-AUDIT xác nhận cả hai đã giải quyết.
  - Rủi ro đưa vào ghi chú phát hành ([12 Ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md)): R-WA1 đến R-WA3 và R-WA8, R-B5-1, R-B5-2, R-B5-4, và các mục liên quan pilot ở [WP5-PLAN](tasks/WP5-PLAN.md) mục F.
  - Backlog quản trị trước trạng thái mission `software_ready`: GOV-RECOVERY (`check_recovery.py` độc lập với trạng thái sống).
- **Đầu vào setup cần chủ cung cấp, không secret:** model NAS, phiên bản DSM và `uname -m`; đường dẫn dữ liệu và backup; UID và GID; tên máy chủ HTTPS và địa chỉ proxy; nhà cung cấp và chế độ SMTP cùng địa chỉ người gửi; địa chỉ người nhận ở bộ phận lương và địa chỉ của chính chủ sở hữu cho lần gửi đầu; danh sách ngày lễ công ty 2027; số dư mở đầu có bằng chứng, nếu có. Giá trị thật nằm trong bản riêng của chủ sở hữu, ngoài git.
- **Quyết định đang mở của chủ sở hữu (tất cả đang chờ; mỗi cái là khuyến nghị, không cái nào đã quyết):** bảng đầy đủ ở [WP5-PLAN](tasks/WP5-PLAN.md) mục D.

  | ID | Phương án khuyến nghị (owner decision pending) |
  |---|---|
  | D-1 (R-A3) | Giữ quy tắc: bản build cũ chạy với `JOB_RUNNER=off` cho tới khi đối soát |
  | D-2 (WP4-I-1) | Kỳ nháp không bao giờ nhận ngày nhập (hiện tại) |
  | D-3 (WP4-I-2) | Nhập "Off day (overtime used)" thành Off không ảnh hưởng sổ cái, nếu nhập lịch sử trước pilot; nếu không thì giữ bỏ qua |
  | D-4 (WP4-I-3) | Kỳ chưa kết thúc không được nhập (hiện tại) |
  | D-5 (WP4-I-4) | Cho phép hiệu chỉnh có lý do số dư mở đầu về net bằng 0, nếu có ghi một số dư |
  | D-6 (WP4-I-5) | Hạn mức 20 bản xem trước chưa commit mỗi người, sau pilot (trước đó nếu đưa người khác vào) |
  | D-7 (WP3 carry 1) | Chấp nhận lời nhắc ít nhất một lần sau sự cố ở SMTP thật |
  | D-8 (WP3 carry 2) | Xếp lỗi chứng chỉ TLS là lỗi cấu hình vĩnh viễn (tùy đánh giá) |
  | D-9 (E-11) | Pilot chỉ của chủ sở hữu, mật khẩu tạm đặt ngoài kênh; có route đổi mật khẩu trước khi thêm người khác |
  | D-10 | Một số dư mở đầu có bằng chứng hoặc 0; không nhập lịch sử cho pilot |
  | D-11 | Tài liệu được theo dõi chỉ giữ các chỗ giữ chỗ; giá trị thật ở bản riêng của chủ sở hữu |
  | D-12 | Kỳ đầu theo giai đoạn: ký tay, lần gửi thật đầu tới địa chỉ của chính chủ sở hữu, tắt tự động nộp, không thời điểm kích hoạt; bật tự động từ kỳ sau |
  | D-13 | NAS giữ trạng thái CHƯA ĐƯỢC KIỂM CHỨNG cho tới khi chủ sở hữu đánh dấu danh sách docs/11 |
  | D-14 | Tuyên bố bản phát hành đầu tiên khi chủ sở hữu cho phép pilot; sau đó sửa lỗi đi qua nhánh và pull request; agent không tạo tag |
  | D-15 (F-Q6) | Giữ nguyên việc đã bỏ số đếm của bản xem trước ngày lễ |
- **Thao tác production và phép rõ, thường không:** không. Không triển khai, không email thật, không dữ liệu thật. `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt và thời điểm kích hoạt trống. Phép của chủ sở hữu chưa được xin và chưa được cấp.
- **Usage/credits chỉ khi quan sát thật:** không quan sát được trong phiên này.
- **Một bước tiếp và prompt tương ứng:** coordinator ghi WP5-ACCEPT trên `014bd47` / `150420e7…`, cho commit các thay đổi packet chưa commit, rồi xin chủ sở hữu các câu trả lời D-1 đến D-15 và phép pilot cùng gói pilot ([WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md)); GOV-RECOVERY còn lại trước trạng thái mission `software_ready`.

## Nguồn gốc điều phối

- **Mission/task ID và bảng/checkpoint:** mission `timesheet-software-readiness`, gói WP5; các tác vụ WP5-PLAN, WP5-ASSESS-A, WP5-ASSESS-B, WP5-FIXB, WP5-FIXB-FREEZE, WP5-AC13, WP5-AC13-FREEZE và WP5-REL tại ảnh chụp (các tác vụ sau nằm trong biên bản nghiệm thu). Bảng: [ORCHESTRATION.json](ORCHESTRATION.json); checkpoint: [WORKFLOW_REVISION_CHECKPOINT.vi.md](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- **Định danh implementer/auditor độc lập; context riêng:** mỗi tác vụ chạy trong context subagent riêng. Hai auditor đánh giá không viết thay đổi nào. Audit cuối phải là một context mới chưa viết thay đổi WP5 nào, kể cả cái này.
- **Digest đã kiểm/review hiện tại; report/verdict:** [WP5_RECHECK](WP5_RECHECK.vi.md): PASS trên `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 file). Các review trước nằm trong biên bản nghiệm thu.
- **Task/dependency còn; một bước coordinator tiếp:** WP5-ACCEPT, rồi GOV-RECOVERY. Bước coordinator tiếp: ghi WP5-ACCEPT, rồi hỏi chủ sở hữu.
- **Tách sẵn sàng phần mềm và phép pilot của chủ đang chờ:** sẵn sàng phần mềm của WP5: đã chấp nhận (NAS CHƯA ĐƯỢC KIỂM CHỨNG). Phép pilot của chủ sở hữu: chưa xin và chưa cấp. Kết quả pilot: chưa có.

## Biên bản nghiệm thu (WP5-ACCEPT)

Do WP5-ACCREC chuẩn bị (chỉ ghi hồ sơ, không sửa mã nguồn). Các mục phía trên là ảnh chụp WP5-REL và bị biên bản này thay thế khi khác nhau (ví dụ digest, các câu "chưa qua cổng kiểm" và các phát hiện còn mở). Nguồn: các tác vụ trên bảng WP5-PLAN đến WP5-RECHECK (`decision`, `findings`, `notes`, `gate_notes`, `history`), `pending_owner_question`, `owner_decisions` và `runtime_observations`, các brief tác vụ cùng Kết quả của chúng, và các báo cáo [WP5_REVIEW_A](WP5_REVIEW_A.vi.md), [WP5_REVIEW_B](WP5_REVIEW_B.vi.md), [WP5_REVIEW_A2](WP5_REVIEW_A2.vi.md), [WP5_REVIEW_FINAL](WP5_REVIEW_FINAL.vi.md) và [WP5_RECHECK](WP5_RECHECK.vi.md). Không số liệu nào được chạy lại. Kết quả được báo cáo không phải bằng chứng độc lập; bằng chứng độc lập là các audit liệt kê dưới đây.

- **Nguồn được chấp nhận:** commit `014bd47a8d906c944d2781eba4f2b91c5a532419` (WP5-FIXD2-FREEZE, đã push; bằng `origin/main`), source digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` trên 779 file, không tính `handoff/` (WP5-REGATE2 PASS; WP5-RECHECK PASS trên cùng commit và digest; repository, dạng `git ls-tree` và bản export `git archive` sạch khớp nhau). Số liệu cuối:
  - WP5-REGATE2 trên `014bd47`: `npm ci` exit 0, lockfile không đổi, không dòng deprecation; lint exit 0; `npm run verify` exit 0 với 77 file, 1.759 test và smoke đạt; `npm audit --omit=dev` 0 lỗ hổng; `validate_package.py --preflight`, bộ kiểm điều phối và `check_recovery.py` exit 0/0/0;
  - WP5-REGATE (cổng đầy đủ) trên `9bcdd88`: 77 file, 1.759 test, smoke đạt; e2e 145 đạt và 5 bỏ qua; drill stage 1 đến 6 với `--wp3`, 208 `PASS` và 0 `FAIL` (33/31/57/35/27/23), image `sha256:bd17d061…` (110.002.055 byte), quét file bị cấm đạt; `docker compose config` cho dạng live, restored và rollback, exit 0 ba lần;
  - WP5-REGATE2 không lặp drill và e2e: phần chênh từ `9bcdd88` là một dòng trong mỗi file `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` của nó, và mọi file không phải tài liệu giống hệt từng byte, nên kết quả 208 và 145 được mang sang;
  - WP5-RECHECK, độc lập, trên bản export sạch của `014bd47`: `npm run verify` exit 0 (1.759 test, smoke đạt); AC-13 chạy riêng exit 0; probe máy chủ đã build 27 `PASS`, 0 `FAIL`;
  - Nhận dạng `dist/`: 230 file, 4.044.281 byte, giống hệt từng byte giữa `9bcdd88` và `014bd47` (WP5-REGATE2) và giữa `74d5bfe` và `014bd47` (WP5-RECHECK); WP5-FINAL-AUDIT thấy nó cũng bằng bản build `546cdda`;
  - NAS CHƯA ĐƯỢC KIỂM CHỨNG; SMTP thật chưa từng được chạy (`PRODUCTION_SENDING_ENABLED` không bao giờ được đặt).
- **AC-13** (kịch bản tích hợp hai tuần):
  - Lần chạy tích hợp: WP5-ASSESS-A lần 1 trên `546cdda`, một instance dạng pilot ở chế độ production với mail capture và năm người dùng tổng hợp: lần chạy probe ghi nhận là 12 cho 77 `PASS` và 0 `FAIL`, và probe lỗi lần ghi nhận là 3 cho 12 `PASS` và 0 `FAIL`. Lần 2 trên `74d5bfe` chạy lại probe máy chủ đã build (26 `PASS`, 0 `FAIL`, lần 2 là lần ghi nhận; lần 1 có lỗi ở probe).
  - Test đã commit: WP5-AC13 (`8e99d2c`), `tests/integration/ac13-two-week.test.ts` và `tests/integration/ac13-support.ts`, một test tất định, không đổi mã nguồn ứng dụng. Nó bao phủ 14 ngày, tổng được tính 8:30 và một lần ghi sổ cái, khởi động lại quanh lúc gửi mà không gửi mù, một hiệu chỉnh (revision 2, chỉ +30), một lần chi tiêu kép đồng thời bị từ chối, cô lập người dùng thứ hai (11 định danh bị hoán đổi) và đường quá hạn.
  - Các lần chạy lặp: WP5-AC13 ba lần, 1.705, 1.739 và 1.754 ms, đều exit 0; WP5-GATE ba lần, 4,08, 4,07 và 4,13 s; WP5-REGATE ba lần, 3,00, 2,91 và 2,97 s; WP5-ASSESS-A lần 2 ba lần cùng bốn múi giờ máy và hai đồng hồ treo tường dời; WP5-FINAL-AUDIT hai lần cùng `TZ=Asia/Tokyo`; WP5-REGATE2 và WP5-RECHECK mỗi bên một lần. Tất cả đạt.
  - Múi giờ thật: WP5-REGATE, với một wrapper đặt múi giờ trong môi trường tiến trình con của vitest và một test dò in ra múi giờ mà tiến trình thấy: Asia/Tokyo (offset -540) và America/New_York (offset 300), mỗi nơi 2 test đạt, exit 0, trên máy có múi giờ America/Los_Angeles. WP5-ASSESS-A lần 2 chứng minh lại bằng một preload (rủi ro R-A2-3: các lần chạy `TZ` trước đó của WP5-AC13 không hề đổi múi giờ, vì Git Bash bỏ `TZ`).
  - Đột biến (bản sao tạm, không bao giờ trong repository): đột biến 1 của WP5-AC13 (bỏ qua ngưỡng N, `> 0`) fail với `credit 2026-09-24: expected 30 to be +0`; đột biến 2 (ghi tín dụng hai lần) fail; WP5-ASSESS-A lần 2 lặp đột biến 1 (fail) và thêm đột biến 3 của riêng nó (đọc chữ ký không có bộ lọc quyền sở hữu), fail với `expected [403, 404] to include 200`. Mọi file bị đột biến đã được khôi phục.
- **Chuỗi cổng kiểm** (verifier, bản export sạch, Node 24.21.0, chỉ capture):
  - WP4-REGATE4 PASS trên `546cdda` (`26fcc969…`, 775 file): cơ sở đánh giá;
  - WP5-GATE PASS trên `74d5bfe` (`0a64a75f…`, 779 file): 77 file và 1.759 test, e2e 145 đạt và 5 bỏ qua, drill 208 `PASS`, image `sha256:0addd200…`, AC-13 ba lần;
  - WP5-REGATE PASS trên `9bcdd88` (`1b8ceae4…`, 779 file);
  - WP5-REGATE2 PASS trên `014bd47` (`150420e7…`, 779 file).
- **Chuỗi audit** (mỗi auditor là một context `timesheet-auditor` mới, tự báo `claude-opus-5-5`, không từng viết WP1–WP5):
  - WP5-ASSESS-A lần 1 trên `546cdda`: PASS, không phát hiện; rủi ro R-WA1 đến R-WA8;
  - WP5-ASSESS-A lần 2 trên `74d5bfe`: FIX REQUIRED, hai phát hiện Nhẹ về tài liệu (A2-01 sổ tay nói trạng thái hiển thị cờ gửi; A2-02 tự kiểm capture nêu một deep link trong thư đã capture mà không tồn tại); phần mềm đạt mọi kiểm tra khu vực A;
  - WP5-ASSESS-B trên `546cdda`: FIX REQUIRED (B-01 Trung bình: lệnh sổ tay không ràng buộc file env, thư mục dữ liệu hay image phát hành; B-02 Nhẹ: file env không được giữ cùng backup ngoài thiết bị);
  - WP5-FINAL-AUDIT trên `74d5bfe`: FIX REQUIRED (F-01 Nhẹ: cùng các khẳng định cờ trạng thái trong sổ tay và packet; F-02 Nhẹ: mục 8 của packet nêu một bước đã qua), với B-01 và B-02 đã giải quyết và khu vực B đạt trên digest mới (drill 208 `PASS`, một restore đã kiểm chứng độc lập, một bản phát hành tái lập được);
  - WP5-RECHECK trên `014bd47`: PASS, không phát hiện; F-01, F-02, A2-01 và A2-02 đã giải quyết; các sửa rủi ro nhỏ chính xác.
- **Người viết và bản sửa** (profile như ghi trên bảng; model tự báo):
  - WP5-FIXB, đóng băng `85838b5` (digest `ed604d0c…`, 775 file): ràng buộc Compose, tag image theo release và bản sao file env trong docs/11, cho B-01 và B-02;
  - WP5-AC13, đóng băng `8e99d2c` (digest `1e59ad31…`, 777 file): test AC-13 đã commit;
  - WP5-REL, đóng băng `74d5bfe` (digest `0a64a75f…`, 779 file): `docs/12_RELEASE_NOTES.md`, docs/11 mục 13 đến 16 và một dòng README;
  - WP5-PILOT: gói pilot, chỉ handoff (digest không đổi);
  - WP5-FIXD, đóng băng `9bcdd88` (digest `1b8ceae4…`): F-01, A2-01, A2-02 và F-02, cùng các sửa rủi ro nhỏ R-A2-1, R-A2-2, R-F1, R-F4, R-F5 và R-F6;
  - WP5-FIXD2, đóng băng `014bd47` (digest `150420e7…`): câu cờ trạng thái cuối cùng trong docs/11 mục 12; quét docs/05, 07, 11, 12, README và packet không thấy trúng nào khác;
  - WP5-PKTID: nhận dạng bản phát hành của packet được làm mới thành `014bd47` và `150420e7…`, chỉ handoff; thay đổi của nó là các file handoff chưa commit và chưa có commit (coordinator cho commit);
  - Các worker tự báo `claude-sonnet-5-5`.
- **Gói pilot:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md) và `.md` của nó. Nó chỉ có chỗ giữ chỗ và mẫu tổng hợp: nhận dạng bản phát hành, các kiểm tra URL, người gửi và người nhận cùng tự kiểm capture, mẫu email và PDF (8 thư đã capture, 4 PDF, 4 ảnh render), danh sách cài đặt, bằng chứng restore cùng mẫu NAS trống, thẻ rollback, danh sách NAS, bảng D-1 đến D-15, biên bản cho phép chưa ký và các giới hạn đã biết. Không ô nào được đánh dấu và mọi quyết định của chủ sở hữu đều ghi đang chờ. Giá trị thật nằm trong bản riêng của chủ sở hữu ngoài git (D-11).
- **Quyết định của chủ sở hữu D-1 đến D-15:** tất cả đang chờ; mỗi khuyến nghị là khuyến nghị, không phải quyết định (`owner_decisions` trên bảng không có câu trả lời). Chúng được liệt kê cùng khuyến nghị trong bảng phía trên ("Quyết định đang mở của chủ sở hữu"). D-1, D-7, D-8 và D-13 phải được trả lời trước khi kích hoạt. Một câu trả lời khác mặc định hiện tại của D-3, D-5, D-6 hoặc D-8 gây ra một vòng sửa (sửa, đóng băng, cổng kiểm, audit độc lập) trước khi kích hoạt, sau đó nhận dạng bản phát hành trong packet được làm mới.
- **Rủi ro mang tiếp** (không cái nào chặn nghiệm thu):
  - NAS CHƯA ĐƯỢC KIỂM CHỨNG (DSM, `sudo -i`, reverse proxy, bind mount thật, cảnh báo máy chủ, image arm64 gốc) và SMTP thật chưa từng được chạy (D-7, D-8);
  - từ WP5-ASSESS-A: R-WA1 (Nhẹ) lời văn thông báo kết quả sau khi phục hồi downtime; R-WA2 (Nhẹ) nghỉ một phần không hiện trên PDF; R-WA3 (Nhẹ) tài khoản chưa từng cấu hình, gồm quản trị viên bootstrap, nhận lời nhắc trước hạn sau khi kích hoạt; R-WA4 (Info) đổi chia sẻ cấp định danh mới; R-WA5 (Info) reset keep-alive phía probe; R-WA6 (Info) nhãn ngày lễ dài bị cắt bằng dấu ba chấm; R-WA7 (Info) đường runner sống được e2e và các suite bao phủ, không phải probe chạy bằng CLI; R-WA8 (Info) ngày không có bản ghi in "Worked" trên PDF tự động (quyết định của chủ sở hữu);
  - từ WP5-ASSESS-B: R-B5-1 ID image khác nhau cho mỗi lần build cùng nguồn, nên ID image trên NAS được ghi lúc build; R-B5-2 base image được ghim chậm một lần build lại Debian so với tag (quyết định làm mới trước bản build pilot); R-B5-3 cảnh báo `source-map-js` chỉ ở dev; R-B5-4 instance được restore báo backup `never` cho tới backup riêng đầu tiên; R-B5-5 `--prune` cùng ngày xóa backup trước nâng cấp đi kèm (R-RA2); R-B5-6 Git Bash viết lại đường dẫn container với người vận hành Windows; R-B5-7 `migrate` in `DATABASE_PATH` tuyệt đối;
  - từ WP5-ASSESS-A lần 2: R-A2-1 và R-A2-2 (đã sửa trong văn bản), R-A2-3 (các lần chạy TZ, đóng bởi WP5-REGATE), R-A2-4 một cảnh báo quá hạn có thể theo sau bản ghi quá hạn của nó tới một nhóm năm phút, R-A2-5 bổ sung test tùy chọn;
  - từ WP5-FINAL-AUDIT: R-F1 và R-F4 đến R-F6 (đã sửa trong văn bản), R-F2 bản sao restore trở thành instance sống thế nào sau rollback (ghi tài liệu trước khi dựa vào), R-F3 ID image theo từng build (R-B5-1), R-F7 ghim base image (R-B5-2);
  - từ WP5-RECHECK (đều Info, tùy chọn): R-RC-1 kiểm tra cờ `grep -c` chỉ khớp dòng chuẩn (`"true"` có ngoặc kép, hoặc cuối dòng CRLF trên Linux, in 0); R-RC-2 mục 13 bước 6 nói "chỉ sau khi bước 7 đạt" trong khi gạch đầu dòng kiểm tra link lời nhắc đầu của bước 7 chỉ chạy được sau bước 5; R-RC-3 mục 8 của packet chỉ nêu D-8, và khuyến nghị (a) của D-5 cũng khác khi có ghi số dư mở đầu; R-RC-4 mục 6 bước 3 vẫn nói "chế độ capture" cho instance được restore sau khi kích hoạt; R-RC-5 ghi chú root bao mục 13 đến 16 mà không bao các lệnh ở mục 4, 6 và 8; R-RC-6 mục 3 và 5 của packet dẫn WP5-REGATE2 cho `dist/` giống hệt, vốn so `9bcdd88`, còn WP5-RECHECK so trực tiếp `74d5bfe`;
  - các mục WP1–WP4 xếp loại liên quan pilot (PR) ở [WP5-PLAN](tasks/WP5-PLAN.md) mục F, được ghi trong sổ tay và ghi chú phát hành:
    - dòng nghỉ tương lai trên phiên đang mở và Clock out 422 khi chưa xác nhận;
    - WP3 R1 nhãn ngày lễ dài; R4 hash đã review gồm số dư OT (tải lại và review lại); R5 cho phép ký trước cuối kỳ; R8 tài khoản chưa từng cấu hình (lưu cài đặt nộp trước khi kích hoạt); R9 sự kiện seed hiện như tự động;
    - WP4 R-A2 `SQLITE_BUSY` khi nhiều bên cùng mở một database mới (chạy migrate một lần trước lần khởi động đầu); R-A8 CLI quay về database dev khi thiếu `DATABASE_PATH` (giữ cả hai đường dẫn tường minh); R-RA2; R-RA9 đích restore phải là một thư mục thật mới; R-B4-3 trên 64 sheet bị từ chối;
    - các ghi chú bàn giao WP4: trạng thái prune không được ghi, thời hạn lưu không hiện trên màn hình, thư giữ không thể bỏ từ màn hình;
    - mật khẩu tạm không có route đổi (D-9);
  - các mục chặn pilot, dưới dạng quyết định: D-1 (R-A3), D-7 và D-8 (mang từ WP3), và D-13 (NAS); mục quản trị GOV-RECOVERY (`check_recovery.py` độc lập với trạng thái mission sống) trước trạng thái `software_ready`.
- **Sự cố runtime** (2026-10-06, mỗi cái một dòng, không có định danh tiến trình):
  - WP5-PILOT: một worker đưa heredoc rỗng vào `python` qua stdin; một tác vụ nền lặp lỗi và ghi một file đầu ra rất lớn ngoài repository; coordinator đã dừng nó, và file để chủ sở hữu xóa (sự cố stdin thứ tư);
  - WP4-REGATE4: một probe dẫn qua `head` để lại một tiến trình con máy chủ Node 24 chạy, và một dạng xóa đệ quy lạc lối không có tác dụng; coordinator dừng agent, và danh sách tiến trình sau đó không còn tiến trình nào như vậy;
  - WP4-REGATE3 và trước đó: các agent đưa heredoc rỗng vào `python -`; coordinator dừng các tác vụ nền bị chặn, và prompt dispatch nay nêu quy tắc cấm stdin bằng chữ in hoa;
  - WP4-AUDIT-B: một probe heredoc mở một REPL Python tương tác lặp vô hạn và ghi khoảng 2,5 MiB/s ngoài repository; coordinator dừng nó và file để chủ sở hữu xóa;
  - WP4-GATE: một probe migrate đầu tiên chạy không có `DATABASE_PATH` và đã migrate database phát triển cục bộ của chủ sở hữu (ngoài repository, chỉ dữ liệu dev); các kiểm tra sau dùng đường dẫn trong thư mục tác vụ.
- **Hiệu chỉnh O-1 (từ WP5_REVIEW_FINAL):** WP5-B-01 là Trung bình. Ảnh chụp phía trên gọi các phát hiện khu vực B là "hai phát hiện nhẹ về tài liệu" và "(nhẹ, tài liệu)"; các chỗ đó đã được sửa. WP5-B-02 là Nhẹ.
- **Tách ba kết quả:**
  - sẵn sàng phần mềm của WP1–WP5: đã chấp nhận. WP5 đã được triển khai, qua cổng kiểm (WP5-REGATE2 PASS, cùng WP5-GATE và WP5-REGATE trên các freeze trước) và audit độc lập (WP5-RECHECK PASS trên `014bd47`, digest `150420e7…`), với đích NAS CHƯA ĐƯỢC KIỂM CHỨNG; coordinator ghi WP5-ACCEPT;
  - phép của chủ sở hữu: không xin ở đây, và chưa cấp. Gói pilot sẵn sàng cho chủ sở hữu xem xét. Không triển khai, không email thật, không dữ liệu thật, `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt, và không có thời điểm kích hoạt trên instance thật nào;
  - kết quả pilot: chưa có; chưa chạy pilot nào.

## Nghiệm thu lại sau vòng đổi giao diện (WP5-UX)

Mục này được thêm sau hồ sơ nghiệm thu cũ ở trên, hồ sơ cũ giữ nguyên làm lịch sử (định danh `014bd47` / `150420e7…` là bản WP5 được nghiệm thu đầu tiên). Nguồn: board [ORCHESTRATION.json](ORCHESTRATION.json) (các tác vụ `WP5-UX-*`, `owner_decisions`, `coordinator_decisions`), [checkpoint](WORKFLOW_REVISION_CHECKPOINT.vi.md) và các báo cáo nêu dưới đây. Kết quả tự báo cáo không phải bằng chứng độc lập; bằng chứng độc lập là các audit.

- **Yêu cầu và câu trả lời của chủ sở hữu:**
  - Ngày 2026-10-08, chủ sở hữu yêu cầu giao diện đẹp hơn, dễ dùng hơn, với trang Timesheet bố trí như workbook Excel mẫu (nguyên văn trong `owner_decisions`). Coordinator chạy nó như một vòng thay đổi WP5 trước khi kích hoạt pilot (không có gói mới).
  - E-1..E-7 (kế hoạch [WP5-UX-PLAN](tasks/WP5-UX-PLAN.md) mục E): trả lời "OK theo khuyến nghị", tất cả theo khuyến nghị (hàng kiểu Excel với chi tiết sau "Show details"; một sắc nền gạch chéo cho mọi ngày không làm việc; panel bên ở desktop và bottom sheet ở điện thoại; ngày kiểu Mỹ, h:mm, 24 giờ; điều hướng Timesheet, Overtime, History, Settings (+ Admin); hiện dòng chữ ký quản lý để trống; phạm vi shell/token, Timesheet, trình sửa ngày và Review).
  - WP5-UX-Q1 (2026-10-09): trả lời "a", sửa độ tương phản vòng focus và định dạng ngày hạn kiểu Mỹ trong một vòng nhỏ (FIX6).
  - WP5-UX-Q2 (2026-10-09): trả lời "a", một lượt quét khả năng truy cập, rồi một vòng sửa cho mọi mục WCAG 2.2 AA (A11Y-SWEEP, sau đó FIX7).
- **Các lát cắt (mỗi cái một dòng; sau mỗi cái có commit FREEZE):**
  - T01: app shell, design token, điều hướng (Settings và Sign out nằm trong More ở điện thoại) và bốn spec.
  - T02: các thành phần bảng kiểu Excel; lưới và danh sách cũ bị xóa; bộ định dạng hiển thị.
  - T03: PeriodBar, ClockPanel, `periodBarModel` và chế độ batch.
  - T04: trình sửa ngày dạng panel bên và bottom sheet, nghỉ phép theo giờ và phút, xác nhận giờ nghỉ một chạm, bộ chọn nhãn ngay trong ô.
  - T05: Review dưới dạng bảng chỉ đọc cùng danh sách kiểm.
  - T06: docs/04, docs/10 (các quyết định của chủ sở hữu ngày 2026-10-08) và docs/12, EN và VI.
- **Các vòng sửa (mỗi cái một dòng; sau mỗi cái có commit FREEZE):**
  - FIX1: "Times in <zone>" luôn hiện, kèm ghi chú khi hai múi giờ khác nhau (mâu thuẫn docs/04 do coordinator quyết định).
  - FIX2: dữ liệu nghỉ phép sai định dạng bị từ chối thay vì lưu thành một loại nghỉ khác (A-01).
  - FIX3: hàng ngày đầu tiên trên điện thoại nằm trên thanh tab, trình sửa dạng modal dưới 1200 px, khôi phục assertion về import-absence, chỉnh câu chữ docs/04, thứ tự tab trên điện thoại (B-01..B-04).
  - FIX4: ô "Open a day" hiện đủ ngày ở 360 và 320 px (B2-01).
  - FIX5: trình sửa hoãn chuyển chế độ khi một modal khác đang mở; docs/04; assertion có nghĩa; token khoảng cách (B3-01, B3-02, O-5, R-7).
  - FIX6: vòng focus mạnh hơn kèm kiểm tra tương phản tự động, và ngày hạn kiểu Mỹ trong ghi chú múi giờ (B4-01, B4-02).
  - FIX7: mười mục WCAG 2.2 AA là AX-01..AX-10 (chỉ client, 29 tệp, cộng dòng 48 của docs/04).
  - FIX8: thanh chuyển đổi gọn một hàng trên điện thoại, hàng ngày đầu tiên nằm trên thanh tab khi có chia sẻ nhận được (B6-01).
  - FIX9: các ngày cô lập của e2e được seed từ kỳ đang hiển thị (A7-01, B7-01; chỉ test).
  - FIX10: bộ e2e không phụ thuộc lịch sau một lượt quét đồng hồ giả lập (AB8-01..AB8-04; chỉ test).
- **Gate cuối và audit cuối (định danh được nghiệm thu):**
  - Commit phát hành `90b98efc395c3894a21a909b6d361eadc6fc2bd9` (WP5-UX-FIX10-FREEZE, đã push); source digest `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 tệp, không tính `handoff/`.
  - WP5-UX-REGATE8 PASS, NAS NOT VERIFIED ([tác vụ](tasks/WP5-UX-REGATE8.md)): e2e đầy đủ đồng hồ thật 210 passed / 26 skipped / 0 failed; quét đồng hồ giả lập 7 thời điểm, 0 failed; drill `--wp3` 208 PASS / 0 FAIL; 1.831 unit test. Image tham chiếu `sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327` (110.014.793 byte, `linux/amd64`), đã xóa sau gate.
  - WP5-UX-AUDIT-AB9 PASS, không có phát hiện, gộp vùng A và B ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.vi.md)): `dist/` giống từng byte giữa 255ba17, 3670a6c và 90b98ef; độ mạnh của test được giữ; lượt quét riêng ở thêm 8 thời điểm và 2 lượt một worker đều 210/0/26. Nó thay thế WP5-UX-AUDIT-A6 và các audit trước đó (A5, A4, A3, A2 và WP5-RECHECK). Các báo cáo trước của vòng này: `WP5_UX_REVIEW_A.md` đến `_A7.md`, `WP5_UX_REVIEW_B.md` đến `_B7.md` và `WP5_UX_REVIEW_AB8.md`.
  - Ranh giới sản phẩm: vòng này đổi giao diện client và các test (cùng bộ định dạng chỉ để hiển thị trong `src/domain/format.ts`). `dist/server` giống từng byte với 014bd47 (A7, AB9); không đổi server hay quy tắc nghiệp vụ.
- **Quyết định docs/10 (coordinator):** docs/10 giữ nguyên cho lần nghiệm thu lại này. Lý do: `docs/` nằm trong source digest, nên một mục cho Q1 và Q2 sẽ làm digest đổi sau gate và audit cuối; Q1 và Q2 vẫn được ghi nguyên văn trên board trong `owner_decisions` và được tóm tắt ở đây. Chuyển tiếp: mục docs/10 (+ vi) cho Q1 và Q2 được đưa vào vòng thay đổi mã nguồn kế tiếp, vòng đó vốn đã có gate và audit.
- **Backlog tùy chọn được mang theo (theo ID; không mục nào chặn nghiệm thu):** R-B7-1..R-B7-4 ([WP5_UX_REVIEW_B7](WP5_UX_REVIEW_B7.vi.md)); R-AB8-1..R-AB8-4 ([WP5_UX_REVIEW_AB8](WP5_UX_REVIEW_AB8.vi.md)); R-AB9-1..R-AB9-6 ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.vi.md)); các rủi ro B6 và A7 ([WP5_UX_REVIEW_B6](WP5_UX_REVIEW_B6.vi.md), [WP5_UX_REVIEW_A7](WP5_UX_REVIEW_A7.vi.md)). Các rủi ro cũ ở trên vẫn áp dụng.
- **Gói pilot:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md) và bản `.md` của nó đã được làm mới theo định danh trên (mục 0, 3, 5, 6 và 10); D-1..D-15 và biên bản cho phép chưa ký không đổi.
- **Tách ba kết quả:** phần mềm sẵn sàng của WP1–WP5 trên `90b98ef` / `57e2974c…`: được chấp nhận qua REGATE8 và AB9, NAS vẫn NOT VERIFIED; quyền của chủ sở hữu: chưa yêu cầu và chưa cấp; kết quả pilot: chưa có, chưa chạy pilot nào.

## Nghiệm thu lại sau vòng đổi giao diện 2 (WP5-UX2)

Mục này được thêm sau phần nghiệm thu lại WP5-UX ở trên, phần đó giữ nguyên làm lịch sử (định danh `90b98ef` / `57e2974c…` của nó đã bị thay thế). Nguồn: board [ORCHESTRATION.json](ORCHESTRATION.json) (các tác vụ `WP5-UX2-*`, `owner_decisions` và `coordinator_decisions` ngày 2026-10-14 và 2026-10-15) và các báo cáo nêu dưới đây. Kết quả được báo cáo không phải bằng chứng độc lập; bằng chứng độc lập là các audit.

- **Yêu cầu của chủ sở hữu ngày 2026-10-14 (tóm tắt tiếng Anh; nguyên văn nằm trên board) và các câu trả lời:**
  - Yêu cầu 1: tô sáng cả cột ngày có Day editor đang mở; kiểu chọn nhẹ và thanh thoát hơn trong bộ chọn Label; nút chuyển giao diện dark/light ở thanh điều hướng chính; hover rõ hơn trên các nút bật/tắt; nút Today tường minh để quay về ngày hoặc kỳ hiện tại; "Show details" thành công tắc trượt.
  - Yêu cầu 2: logo C&D thay chữ thương hiệu ở góc trên bên trái; trên điện thoại điều khiển check in/out chuyển lên thanh trên cùng và Today, Current period, Review nằm chung một hàng; cách gọi "Clock in/out" thành "Check in/out".
  - Yêu cầu 3: chữ thương hiệu cạnh logo thành wordmark hai dòng theo màu của ảnh và font được chỉ định, logo ở bên trái; bỏ dòng tên công ty khỏi timesheet trên màn hình (PDF vẫn giữ).
  - Yêu cầu 4: trên điện thoại "Review & sign off" rút gọn thành "Sign off" thay vì xuống hàng; thêm khoảng cách giữa thương hiệu và menu trên màn hình lớn; điều khiển giao diện trên desktop thành công tắc Dark/Light có icon; "Due" theo kiểu nhãn; chữ "to" trong khoảng kỳ thành mũi tên màu nhãn.
  - WP5-UX2-Q1 (2026-10-14): cả hai nút. Today mở kỳ chứa ngày hôm nay; Current period quay về kỳ mà trang mở ra (kỳ R-07, trong năm ngày của cửa sổ là kỳ vừa kết thúc). Quy tắc kỳ mở đầu R-07 không đổi.
  - WP5-UX2-Q2 (2026-10-14, "Q-1 a, Q-2 a"): công ty được dùng font cho logo/wordmark, nên wordmark được đưa vào dưới dạng đường viền vector (tệp font không bao giờ được commit); ở giao diện tối wordmark dùng sắc nhạt hơn.
- **Kế hoạch và các phụ lục:** WP5-UX2-PLAN ([tác vụ](tasks/WP5-UX2-PLAN.md); thiết kế chỉ phía client, mockup, chia lát); PLAN2 (nút Current period: đích, hiển thị, hành vi của editor, vừa khít trên điện thoại); PLAN3 (logo, đồng hồ ở thanh trên của điện thoại, hàng ba nút, danh mục đổi tên); PLAN4 (wordmark, độ dễ đọc theo giao diện, dữ kiện về font).
- **Các lát (mỗi lát một dòng; sau mỗi lát có một commit FREEZE):**
  - T01 `af6207c`: nút chuyển Dark mode ở thanh điều hướng chính.
  - T02 `d0d21e1`: hover, công tắc và lựa chọn trong bộ chọn nhãn rõ hơn.
  - T03 `70ecb12`: đánh dấu ngày đang mở trong Day editor.
  - T04 `54dda11`: các nút Today và Current period.
  - T05 `fa2e679`: logo C&D trên thanh trên cùng.
  - T06 `3f5a3b3`: wordmark hai dòng cạnh logo.
  - T07 `9864400`: công tắc giao diện Light/Dark có icon.
  - T08 `608572f`: cách gọi "Check in/out" (gồm ba văn bản thông báo của server).
  - T09 `f70a5c0`: check in/out trên thanh trên cùng của điện thoại.
  - T10 `d1a20a7`: tài liệu hóa vòng này (docs/04, docs/10, docs/12, EN và VI).
- **Các vòng sửa (mỗi vòng một dòng; sau mỗi vòng có một commit FREEZE):**
  - FIX1 `b1b725b`: ba phát hiện Low của WP5-UX2-AUDIT (Today sau nửa đêm của múi giờ báo cáo, hàng Review ở 320 px trong docs/04, vòng focus của Today không hoạt động) và R-UX2A-2 (một unit test chống cách gọi đồng hồ cũ).
  - FIX2 `a643794`: test không phụ thuộc lịch cho vòng focus của Today không hoạt động.
- **Gate và audit:**
  - WP5-UX2-GATE PASS tại `d1a20a7` (digest `20e7a7c8…`).
  - WP5-UX2-AUDIT, FIX REQUIRED ([WP5_UX2_REVIEW](WP5_UX2_REVIEW.vi.md)): ba phát hiện Low (01 Today không phản hồi sau nửa đêm của múi giờ báo cáo; 02 tài liệu thiếu hàng Review ở 320 px; 03 vòng focus của Today không hoạt động bị làm mờ còn 2,70:1) và các rủi ro tùy chọn R-UX2A-1..R-UX2A-5; được FIX1 đóng.
  - WP5-UX2-REGATE FAIL tại `b1b725b`: một test phụ thuộc lịch hỏng trong lượt quét đồng hồ giả lập (8 failed ở hai trong ba lần chạy đầy đủ); được FIX2 sửa. NAS NOT VERIFIED.
  - WP5-UX2-REGATE2 PASS, NAS NOT VERIFIED ([tác vụ](tasks/WP5-UX2-REGATE2.md)): e2e đầy đủ đồng hồ thật 448 passed / 42 skipped / 0 failed; chạy đồng hồ giả lập trong và ngoài cửa sổ năm ngày, 0 failed; drill `--wp3` 208 PASS / 0 FAIL; 1.882 unit test.
  - WP5-UX2-AUDIT2 PASS ([WP5_UX2_REVIEW2](WP5_UX2_REVIEW2.vi.md)), các rủi ro tùy chọn R-UX2A2-1..R-UX2A2-4. Nó thay thế WP5-UX-AUDIT-AB9.
- **Định danh được chấp nhận:**
  - Commit phát hành `a6437943403fc416240fd13a787a8c4748af3e84` (WP5-UX2-FIX2-FREEZE, đã push); source digest `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 tệp, không tính `handoff/`.
  - Image tham chiếu `sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a` (110.024.344 byte, `linux/amd64`, bản build drill của REGATE2), đã xóa sau gate.
  - Ranh giới sản phẩm: vòng này đổi giao diện client, cách diễn đạt và test. `dist/server` chỉ khác 90b98ef ở cách diễn đạt của ba thông báo lỗi trong `services/timesheetCommands.js` và một chú thích (hồ sơ GATE, REGATE và REGATE2); không đổi quy tắc nghiệp vụ, phép tính, schema, API hay PDF.
- **Mục docs/10:** các mục cho WP5-UX-Q1 và WP5-UX-Q2, chuyển tiếp từ vòng 1, đã được ghi vào docs/10 (EN và VI) trong vòng này (T10), cùng các quyết định của vòng 2.
- **Backlog tùy chọn được mang theo (theo ID; không mục nào chặn nghiệm thu):** R-UX2A-1..R-UX2A-5 và R-UX2A2-1..R-UX2A2-4 (ở trên); R-B7-1..R-B7-4, R-AB8-1..R-AB8-4, R-AB9-1..R-AB9-6, và các rủi ro B6 và A7 (xem phần ở trên). Các rủi ro cũ hơn vẫn áp dụng.
- **Câu hỏi tùy chọn còn mở cho chủ sở hữu WP5-UX2-Q3 (không chặn gì; mặc định (a) giữ nguyên):** trong năm ngày từ thứ Hai sau khi kỳ kết thúc đến thứ Sáu payroll, kỳ mà Today mở ra hiện nhãn "future"; phương án (b) sẽ hiện "in progress" ở đó (một thay đổi nhỏ về cách diễn đạt ở client cộng với docs/04; server không đổi).
- **Gói pilot:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md) và bản `.md` của nó đã được làm mới theo định danh trên (mục 0, 3, 5, 6 và 10); D-1..D-15 (tất cả còn chờ) và biên bản cho phép chưa ký không đổi.
- **Tách ba kết quả:** phần mềm sẵn sàng của WP1–WP5 trên `a643794` / `229df806…`: được chấp nhận qua REGATE2 và AUDIT2, NAS vẫn NOT VERIFIED; quyền của chủ sở hữu: chưa yêu cầu và chưa cấp; kết quả pilot: chưa có, chưa chạy pilot nào.

## Nghiệm thu lại sau vòng đổi giao diện 3 (WP5-UX3)

Mục này được thêm sau phần nghiệm thu lại WP5-UX2 ở trên, phần đó giữ nguyên làm lịch sử (định danh `a643794` / `229df806…` của nó đã bị thay thế). Nguồn: board [ORCHESTRATION.json](ORCHESTRATION.json) (các tác vụ `WP5-UX3-*`, `owner_decisions` và `coordinator_decisions` từ 2026-10-15 đến 2026-10-19, `runtime_observations`) và các báo cáo nêu dưới đây. Kết quả được báo cáo không phải bằng chứng độc lập; bằng chứng độc lập là các audit.

- **Yêu cầu của chủ sở hữu ngày 2026-10-15 (tóm tắt tiếng Anh; nguyên văn nằm trên board) và các câu trả lời:**
  - Yêu cầu: thôi ép kiểu công nghiệp và dùng kiểu hiện đại (văn bản quản trị trong AGENTS.md); tương phản hơn giữa trang, card, panel và sheet, với week sheet nổi lên; khối danh tính trên thanh trên cùng (avatar canh phải, tên hiển thị phía trên email nhỏ hơn) mở ra menu gồm Light/Dark, Profile, Settings và Sign out (Settings và Admin rời menu chính; Administration thành một tab của Settings); trên màn hình lớn thấy wordmark, Check in/out nằm ở hàng tiêu đề trang, không có tên người dùng dưới tiêu đề, các nhãn old/current/future phân biệt rõ (future màu hồng), một hàng xuống dòng được cho payroll date, due và múi giờ, "Open a day" cạnh bộ chọn ngày; các cột được chọn và cột editor nổi lên bằng bóng nhẹ, cột editor được đánh dấu bằng nền ô Day; trên màn hình hẹp "Current" và ẩn chữ "Open a day" khi hàng không đủ chỗ; trong Day editor có ghi chú múi giờ ngắn, header mạnh hơn, phiên giờ mới/sửa trong hộp thoại riêng, xác nhận xóa rõ ràng, điền sẵn giờ mặc định và giờ nghỉ gợi ý, vùng giờ nghỉ đơn giản hơn, Save cũng xác nhận, và WFH trên hàng Category. Danh sách mục U-01..U-27 nằm ở [WP5-UX3-PLAN](tasks/WP5-UX3-PLAN.md).
  - G-1..G-5 (2026-10-15): G-1 (b) duyệt mockup và hướng hiện đại với các chỉnh sửa (week sheet không bo góc; cột chọn bo 4px; các cột nổi liền nhau không đổ bóng đè nhau; cột của sheet không bao giờ bị ép đến mức nội dung chồng nhau, Day editor chuyển sang dạng nổi khi không đủ chỗ); G-2 (a) "Category" thay "Label" và "Status" thay "Check"; G-3 (a) tự động điền sẵn giờ tham chiếu và giờ nghỉ gợi ý cho ngày đã qua, với quy tắc được viết lại; G-4 (biến thể của chủ sở hữu) thông báo với ba lựa chọn khi nhấn Save mà chưa có giờ nghỉ và ô chưa được tick (xác nhận không nghỉ, tạm chưa xác nhận giờ nghỉ, hoặc hủy), rồi xác nhận lưu cuối cùng; G-5 (b) kỳ chứa hôm nay hiện "in progress" trong năm ngày của cửa sổ. Nó thay thế câu hỏi tùy chọn WP5-UX2-Q3. Các yêu cầu bổ sung cho điện thoại N-1 (chip giờ nghỉ với hộp thoại con) và N-2 (khoảng cách trong hộp thoại).
  - WP5-UX3-Q6 (2026-10-15): (b) ô ngày của giờ nghỉ chỉ hiện khi phiên qua nửa đêm địa phương (hoặc chưa đặt giờ kết thúc); và chip giờ nghỉ dùng giờ 24 giờ.
  - WP5-UX3-Q7 (2026-10-19): (a) văn bản AGENTS.md của chủ sở hữu (phần đầu AI Instruction, Operating Contract, Prime Directive) được đưa vào kho mã, với hai chỉnh sửa (dòng bản sao runbook theo quy ước `.vi.md` của kho này; bỏ các cụm từ không thuộc dự án).
- **Kế hoạch và mockup:** WP5-UX3-PLAN ([tác vụ](tasks/WP5-UX3-PLAN.md); các mục U-01..U-27, việc viết lại quy tắc ở mục C, các câu hỏi G-1..G-5) và PLAN2 ([tác vụ](tasks/WP5-UX3-PLAN2.md); thiết kế dòng giờ nghỉ và hộp thoại phiên); mockup là `handoff/delivery/design/WP5-UX3/mockup.html` cùng mười ảnh dựng tổng hợp trong cùng thư mục.
- **Thay đổi quản trị:** WP5-UX3-GOV (mục UI của AGENTS "Frontend and UI/UX standards"): freeze 79b9a53, WP5-UX3-GOV-AUDIT PASS ([GOV_UX3_REVIEW](GOV_UX3_REVIEW.vi.md)), được WP5-UX3-GOV-ACCEPT chấp nhận tại 3968e15. WP5-UX3-GOV2 (phần đầu AI Instruction của chủ sở hữu, Q7): freeze ceb86b6, WP5-UX3-GOV2-AUDIT PASS ([GOV_UX3_REVIEW2](GOV_UX3_REVIEW2.vi.md)).
- **Các lát (mỗi lát một dòng; sau mỗi lát có một commit FREEZE):**
  - T06 `5c8355d`: mô hình thuần của dòng giờ nghỉ và unit test (không có UI).
  - T01 `e2f3d74`: token kiểu hiện đại và khung ứng dụng.
  - T02 `aa64999`: khối danh tính, menu tài khoản, nội dung More trên điện thoại, điều hướng gọn hơn, quy tắc wordmark.
  - T03 `7cd8c59`: các trang con của Settings (Personal, Profile, Administration), route, nạp lười.
  - T04 `83c32d2`: phần đầu trang và thanh kỳ.
  - T05 `699b1b3`: dấu chọn trên sheet, tên hàng "Category" và "Status", hình dạng "No times".
  - T05B `5c0dad8`: quy tắc Day editor dạng nổi (cột sheet không bị ép).
  - T07 `f8117a4`: panel Day editor (header, chip, thẻ phiên với bảng giờ nghỉ), xác nhận xóa, WFH trên hàng Category.
  - T08 `1a33c57`: hộp thoại phiên (mới và sửa), dòng giờ nghỉ, "Confirm no breaks taken", điền sẵn, thông báo G-4, xác nhận lưu và bỏ.
  - T08B `f89573b`: quy tắc ngày giờ nghỉ Q6 (b), chip giờ nghỉ với hộp thoại con, khoảng cách trên điện thoại, hàm gợi ý chuyển vào mô hình.
  - T09 `4b5403d`: hộp thoại Check out dùng dòng giờ nghỉ mới; các chuỗi "label" còn lại thành "category".
  - T10 `cecfceb`: tài liệu của vòng (docs/04, docs/10, docs/12, EN và VI) và việc viết lại quy tắc.
- **Các vòng sửa (mỗi vòng một dòng; sau mỗi vòng có một commit FREEZE):**
  - FIX1 `9187f31`: các phát hiện của WP5-UX3-GATE (test cột nổi phụ thuộc lịch vào thứ Ba và một lỗi seed chập chờn, focus bàn phím bị cắt trong thẻ tuần từ 768 đến khoảng 880 px, ba mục axe).
  - FIX2 `7ce4e95`: các phát hiện của lượt quét chỉ đọc WP5-UX3-SWEEP ([tác vụ](tasks/WP5-UX3-SWEEP.md)).
  - FIX3 `a78ada5`: F-UX3A-01..06 và F-UX3B-1..2 của AUDIT-A và AUDIT-B.
  - FIX4 `8629441`: F-UX3A2-1..3 và F-UX3B2-1 của AUDIT-A2 và AUDIT-B2.
  - FIX5 `5c101c1`: test "Confirm breaks hôm nay" của REGATE3 phụ thuộc giờ trong ngày, được làm cho không phụ thuộc giờ.
  - FIX6 `8e55710`: cuộc đua hoán đổi bố cục trong một test hover của REGATE4, sau chẩn đoán WP5-UX3-DIAG1 ([tác vụ](tasks/WP5-UX3-DIAG1.md)).
- **Các gate (NAS luôn NOT VERIFIED):**
  - WP5-UX3-GATE FAIL tại `cecfceb` ([tác vụ](tasks/WP5-UX3-GATE.md)): một test cột nổi phụ thuộc lịch (các thứ Ba) và một lỗi seed chập chờn, focus bàn phím bị cắt trong thẻ tuần từ 768 đến khoảng 880 px, và ba mục axe mức serious; được FIX1 và FIX2 đóng.
  - WP5-UX3-REGATE PASS tại `7ce4e95` ([tác vụ](tasks/WP5-UX3-REGATE.md)), được ghi nhận kèm một sai lệch về timeout của một lần chạy đồng hồ giả lập (`coordinator_decisions` trên board ngày 2026-10-16).
  - WP5-UX3-REGATE2 PASS tại `ceb86b6` ([tác vụ](tasks/WP5-UX3-REGATE2.md)).
  - WP5-UX3-REGATE3 FAIL tại `8629441` ([tác vụ](tasks/WP5-UX3-REGATE3.md)): test "Confirm breaks" của FIX4 hỏng giữa nửa đêm địa phương và khoảng 03:00 trên project điện thoại; được FIX5 đóng.
  - WP5-UX3-REGATE4 FAIL tại `5c101c1` ([tác vụ](tasks/WP5-UX3-REGATE4.md)): mục gate 2 không đạt theo nghĩa chặt vì một cuộc đua trong test hover; test đã sửa, định danh và các bằng chứng mang sang vẫn đúng; được FIX6 đóng.
  - WP5-UX3-REGATE5 PASS tại `8e55710` ([tác vụ](tasks/WP5-UX3-REGATE5.md)): các bản build giống hệt từng byte với REGATE3 và REGATE4 (các mục của chúng được mang sang); e2e đầy đủ đồng hồ thật 651 passed / 67 skipped / 0 failed; chạy đầy đủ đồng hồ giả lập ở một ngày trong cửa sổ và ở ngày đổi giờ DST, 0 failed; drill `--wp3` 208 PASS / 0 FAIL (REGATE3); 2.141 unit test; axe: chỉ còn mục kích thước mục tiêu của menu tài khoản đã được biện minh.
- **Các audit:**
  - WP5-UX3-AUDIT-A ([WP5_UX3_REVIEW_A](WP5_UX3_REVIEW_A.vi.md)) và AUDIT-B ([WP5_UX3_REVIEW_B](WP5_UX3_REVIEW_B.vi.md)) tại `7ce4e95`: FIX REQUIRED; các phát hiện F-UX3A-01..06 (vùng A) và F-UX3B-1..2 (vùng B); được FIX3 đóng.
  - WP5-UX3-AUDIT-A2 ([WP5_UX3_REVIEW_A2](WP5_UX3_REVIEW_A2.vi.md)) và AUDIT-B2 ([WP5_UX3_REVIEW_B2](WP5_UX3_REVIEW_B2.vi.md)) tại `ceb86b6`: FIX REQUIRED; các phát hiện F-UX3A2-1..3 (một Medium, hai Low) và F-UX3B2-1 (Low, độ mạnh của test); được FIX4 đóng.
  - WP5-UX3-AUDIT-INT PASS ([WP5_UX3_REVIEW_INT](WP5_UX3_REVIEW_INT.vi.md)) tại `8e55710` / `507de97c…`, không có phát hiện, các rủi ro tùy chọn R-INT-1..R-INT-4. Nó thay thế WP5-UX2-AUDIT2.
- **Tạm dừng do giới hạn sử dụng:** nhiệm vụ tạm dừng ngày 2026-10-16 ở giới hạn sử dụng và tiếp tục ngày 2026-10-19 bằng việc đối chiếu HEAD với commit board cuối (a78ada5); board và checkpoint giữ hồ sơ.
- **Định danh được chấp nhận:**
  - Commit phát hành `8e557100d16b6b6eb86a48e00276835761aabfdf` (WP5-UX3-FIX6-FREEZE, đã push); source digest `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`, 833 tệp, không tính `handoff/`.
  - Image tham chiếu `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b` (110.042.848 byte, `linux/amd64`, bản build drill REGATE3 có byte giống hệt bản phát hành, máy trạm phát triển), đã xóa sau gate.
  - Ranh giới sản phẩm: vòng này đổi giao diện client và tài liệu. `dist/server` và `dist/domain` giống hệt từng byte với a643794; không đổi quy tắc nghiệp vụ, phép tính, schema, API, PDF hay email.
- **Backlog tùy chọn được mang theo (theo ID; không mục nào chặn nghiệm thu):** R-UX3B-1, R-UX3B-2, R-UX3B-5..R-UX3B-7 (WP5_UX3_REVIEW_B); phần còn lại của R-A2-1 và các rủi ro A2 R3, R5, R7 (WP5_UX3_REVIEW_A2); R-B2-2, R-B2-3, R-B2-5 (WP5_UX3_REVIEW_B2); R-INT-1..R-INT-4 (WP5_UX3_REVIEW_INT); các mục backlog quản trị R3-R5 và R8 của GOV_UX3_REVIEW2. Các rủi ro đã mang theo trước đó (R-UX2A-1..R-UX2A-5, R-UX2A2-1..R-UX2A2-4 và các mục cũ hơn đã liệt kê ở trên) vẫn áp dụng. WP5-UX2-Q3 được G-5 (b) thay thế.
- **Gói pilot:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md) và bản `.md` của nó đã được làm mới theo định danh trên (mục 0, 3, 5, 6 và 10); D-1..D-15 (tất cả còn chờ) và biên bản cho phép chưa ký không đổi.
- **Tách ba kết quả:** phần mềm sẵn sàng của WP1–WP5 trên `8e55710` / `507de97c…`: được chấp nhận qua REGATE5 và AUDIT-INT, NAS vẫn NOT VERIFIED; quyền của chủ sở hữu: chưa yêu cầu và chưa cấp; kết quả pilot: chưa có, chưa chạy pilot nào.
