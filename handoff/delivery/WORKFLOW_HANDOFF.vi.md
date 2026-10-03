# Bàn giao bản sửa quy trình v2 (package quản trị GOV)

Theo [HANDOFF](../templates/HANDOFF.vi.md). Bản gốc tiếng Anh: [WORKFLOW_HANDOFF.md](WORKFLOW_HANDOFF.md).

- Package/phạm vi, ngày và tác giả: GOV, bản sửa quy trình v2 theo yêu cầu của chủ dự án
  ngày 2026-10-02. Phạm vi gồm định tuyến model/effort linh hoạt, vai trò committer
  commit/push thẳng main đến bản release đầu tiên, record task chỉ tiếng Anh, phạm vi
  quản trị và cổng kiểm tra quyền riêng tư trước khi commit. Coordinator là phiên chính;
  người thực hiện và auditor được liệt kê bên dưới.
- Model/effort thật: coordinator claude-opus-5-5, effort không quan sát được. Người thực
  hiện chạy claude-sonnet-5-5, riêng WF-FIX2 chạy claude-opus-5-5 qua override nâng bậc.
  Auditor chạy claude-opus-5-5 với effort xhigh của profile. Mọi giá trị model đều do
  subagent tự báo.
- Commit (đều đã push lên origin/main):
  - ffbf8f0: thiết kế trước;
  - fd77a87: đóng băng 1;
  - c219d79: đóng băng 2;
  - 6578df8: đóng băng 3, là commit được audit.

  Source digest tại 6578df8 là
  2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3. Commit WF-ACCEPT chỉ
  thêm record.
- Trạng thái implement: xong. Trạng thái review độc lập: **đạt** (WF-AUDIT3, auditor
  mới, PASS cho `1a25275..6578df8`). Các vòng trước: [WORKFLOW_REVIEW](WORKFLOW_REVIEW.vi.md)
  cho FIX REQUIRED với 3 lỗi Medium và 7 lỗi Low.
  [WORKFLOW_RECHECK](WORKFLOW_RECHECK.vi.md) cho FIX REQUIRED, chỉ còn lỗi Low.
  [WORKFLOW_RECHECK2](WORKFLOW_RECHECK2.vi.md) cho PASS.
- Hành vi đã làm và file đã đổi:
  - **Profile:** chín profile, trong đó committer là mới. Mỗi profile cố định vai trò và
    effort; coordinator chọn model cho từng lần giao việc và ghi lý do. Expert và auditor
    chạy opus/xhigh, verifier chạy sonnet/medium, coordinator dùng model của phiên.
  - **Validator** (`validate_orchestration.py`):
    - task commit và package GOV;
    - lý do override, không cho effort `max`;
    - auditor không được yếu hơn tác giả mạnh nhất;
    - tác giả gồm mọi task không phải gate/audit/commit, kể cả các attempt trước;
    - commit của gate phải khớp commit của audit, và `addresses_audit` được kiểm tra.
  - **Probe khôi phục:** `check_recovery.py`, 81 probe.
  - **Kiểm tra trước commit** (`scripts/precommit-check.mjs`) chặn secret, kể cả giá trị
    không có ngoặc và giá trị có dấu cách; chặn media hoặc file chữ ký chưa đánh dấu, file
    riêng tư, path hồ sơ người dùng thật và email không phải giả lập. Địa chỉ ghi công
    được cho phép.
  - **Tài liệu và prompt:** AGENTS quy tắc 1 và 12, docs/08 và docs/10, ORCHESTRATE,
    RESUME, FIX_FINDINGS và các template, mỗi file kèm cặp .vi.md. NEXT_ACTION, STATE và
    board do coordinator cập nhật.
  - **Đã bỏ:** ORCHESTRATION.previous.json; git giờ là bản khôi phục.
- Migration/schema: không có. src/, tests/ và lock file không đổi trong
  `1a25275..6578df8` (gate và audit đã kiểm).
- Hợp đồng chuẩn đã đổi:
  - AGENTS quy tắc 1 (phạm vi yêu cầu bản dịch) và quy tắc 12 (quyền commit/push thường
    trực, chủ dự án đã xác nhận trực tiếp);
  - các phần định tuyến, commit, quản trị và record của docs/08.

  Không đổi quy tắc nghiệp vụ nào.
- Kiểm chứng (vòng cuối; bằng chứng nằm trong thư mục ghi ở từng dòng):

| Lệnh | Môi trường | Exit | Kết quả quan sát | Bằng chứng |
|---|---|---|---|---|
| `npm run digest` trước/sau | Node 24.21.0 | 0/0 | 2f50be64…af7b3 cả hai lần | [WF-GATE3](evidence/WF-GATE3/exits.txt) |
| `python handoff/delivery/validate_orchestration.py` | Python quy trình | 0 | PASS | [WF-GATE3](evidence/WF-GATE3/validate-orch.txt) |
| `python handoff/delivery/check_recovery.py` | Python quy trình | 0 | PASS, 81 probe | [WF-GATE3](evidence/WF-GATE3/check-recovery.txt) |
| `validate_package.py --preflight` | Python quy trình | 0 | PASS, 91 kịch bản | [WF-GATE3](evidence/WF-GATE3/preflight-workflow-python.txt) |
| `node scripts/precommit-check.mjs --self-test` cùng probe trên bản clone tạm | Node 24.21.0 | 0 | mọi dạng xấu bị chặn; câu văn thường, dòng ghi công và media giả lập được qua | [WF-GATE3](evidence/WF-GATE3/probes.txt) |
| `npm run verify` | Node 24.21.0 | 0 | 174 test, build và smoke đạt | [WF-GATE3](evidence/WF-GATE3/verify.txt) |
| Probe audit độc lập (31/31), lint, quét quyền riêng tư theo dải commit | Node 24.21.0, bản clone tạm | 0 | PASS | [WF-AUDIT3](evidence/WF-AUDIT3/10-identity-after.txt) |

- Chưa chạy hoặc bị chặn: Python hệ thống thiếu dữ liệu múi giờ IANA nên preflight chạy
  bằng Python quy trình. Auditor không mở lại các URL tài liệu của WF-CAPS vì không có
  công cụ web.
- Lỗi đã xử lý: WF-A-01 đến WF-A-10, WF-R-01 và WF-R-02. Hoãn theo quyết định: không viết
  lại các path hồ sơ người dùng đã có trong bằng chứng đã commit (docs/10; không viết lại
  lịch sử).
- Backlog tùy chọn (không bắt buộc sửa):
  - kiểm tra trước commit bỏ sót key `pass` đứng riêng và phần tử danh sách compose có
    ngoặc;
  - sáu literal mật khẩu test có ngoặc sẽ chặn commit nếu sửa vào đúng các dòng đó;
  - quy tắc PASS GOV bị cũ không cưỡng chế được nếu không dùng git.
- Đầu vào cần từ chủ dự án: không có. Cài đặt quyền không đổi; chủ dự án có thể tự duyệt
  trước các lệnh git hoặc thêm quy tắc chặn.
- Hành động production: không có. Không gửi thật, không triển khai, không đổi billing hay
  cài đặt toàn cục.
- Usage: không quan sát được.
- Một bước tiếp: WF-ACCEPT commit record và push, rồi WP1-F01-FIX theo
  [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md).

## Nguồn gốc điều phối

- Mission/task ID và board/checkpoint: timesheet-software-readiness; các task GOV từ
  WF-REVIEW … WF-AUDIT3 và WF-ACCEPT trong [ORCHESTRATION.json](ORCHESTRATION.json);
  [checkpoint](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- Người thực hiện và auditor (ngữ cảnh mới, tách biệt):
  - Tác giả: WF-REVIEW, WF-IMPL-TOOLING, WF-IMPL-DOCS (2 attempt), WF-FIX1 và WF-FIX2.
  - Auditor: WF-AUDIT, WF-AUDIT2 và WF-AUDIT3, ba phiên bản riêng biệt, không ai là tác
    giả.
  - Board ghi đủ mọi ID agent.
- Commit và digest đã audit: 6578df8 và 2f50be64…af7b3; quyết định PASS
  ([WORKFLOW_RECHECK2](WORKFLOW_RECHECK2.vi.md)).
- Còn lại:
  - WP1 đang FIX REQUIRED, F-01 chưa sửa. Chuỗi việc: WP1-F01-FIX → FREEZE → GATE →
    AUDIT → ACCEPT.
  - WP2 chỉ bắt đầu sau khi WP1 PASS.
- Sẵn sàng phần mềm: chưa đạt. Không có yêu cầu phép pilot nào đang chờ chủ dự án.
