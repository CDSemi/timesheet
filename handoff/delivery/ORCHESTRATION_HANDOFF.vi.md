# Bàn giao quy trình điều phối

Theo [HANDOFF](../templates/HANDOFF.vi.md). Ngày: 2026-10-02 America/Los_Angeles.

- Scope: chỉ thiết kế quy trình theo yêu cầu chủ. Vai trò không gắn nhà cung cấp,
  main coordinator, profile subagent dự án, prompt đầu vào, bảng task, recovery bền vững.
- Baseline: HEAD 1a25275b7c87bcef1e9099d7adba8f2eb763d698 trước sửa; chưa commit.
  Giữ source ứng dụng, dependency, nghiệp vụ, handoff/review/evidence trước.
- Settings: không thấy model/effort client đang sửa. Cấu hình Claude dự án là yêu cầu,
  không chứng minh runtime/model/billing thật đã kích hoạt.
- Hồ sơ: [bảng](ORCHESTRATION.json), ORCHESTRATION.previous.json ban đầu hợp lệ,
  [brief đầu](tasks/WP1-F01-PLAN.vi.md), [đầu vào](../NEXT_ACTION.vi.md),
  [quy trình](../../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md), ORCHESTRATE/RESUME,
  mẫu TASK/CHECKPOINT/HANDOFF/REVIEW, validate_orchestration.py.
- Ứng dụng: WP1 FIX REQUIRED, F-01 chưa sửa; WP2 chưa bắt đầu. Chưa giao task cho agent.
  Planner xác nhận plan sửa có giới hạn; worker sửa, verifier gate, auditor độc lập recheck.
  Phải WP1 PASS trước WP2; sau đó nhiệm vụ được tiến tới sẵn sàng phần mềm WP5.
- Kiểm chứng: tài liệu, cấu hình, probe recovery, lint đạt; xem bảng.
  Không tuyên bố nghiệm thu ứng dụng. Không chạy lại test/build/smoke ứng dụng cho sửa
  workflow này; 91 kiểm tham chiếu dưới là preflight tài liệu, không chạy bộ tính production.
- Nhóm thay đổi: AGENTS/CLAUDE/README và docs 06/08/09/10 song ngữ; NEXT_ACTION,
  mọi prompt implement/review/fix/resume và mẫu; STATE, bảng bền vững; tám profile/settings;
  brief plan ban đầu; validator/evidence quy trình.
- Kiểm bắt buộc:

| Lệnh chạy được | Môi trường | Exit / kết quả thật | Bằng chứng |
|---|---|---|---|
| python handoff/delivery/validate_package.py --preflight | Python bundled, IANA database có sẵn | 0, PASS; 42 cặp song ngữ, 494 link nội bộ, 91 scenario tham chiếu | [documentation.txt](evidence/orchestration/documentation.txt) |
| python handoff/delivery/validate_orchestration.py | Python bundled | 0, PASS; 8 profile, 4 task pending, không agent hoạt động | [workflow.txt](evidence/orchestration/workflow.txt) |
| python handoff/delivery/evidence/orchestration/check-recovery.py | Python bundled, bảng giả trong RAM | 0, PASS; 22 kiểm; bảng thật không đổi, không dispatch Claude | [recovery.txt](evidence/orchestration/recovery.txt) |
| npm run lint | Node bundled 24.19.0, npm 11.19.1; bật trace/pending deprecation | 0; không cảnh báo/lỗi | [lint.txt](evidence/orchestration/lint.txt) |
| git diff --check | Checkout hiện tại | 0; không lỗi whitespace | [repository.txt](evidence/orchestration/repository.txt) |

Lệnh Python/ghi log chính xác ở [run-validation.ps1](evidence/orchestration/run-validation.ps1).
Log lint ghi path npm CLI đã dùng sau khi wrapper npm hệ thống lỗi.
Bằng chứng repo xác nhận không diff src/, tests/, dependency hoặc script ứng dụng.
Probe recovery từ chối tự audit, PASS cũ, gate fail, cycle, ghi state chung,
writer trùng và WP2 vượt WP1 chưa sửa; đây là kiểm metadata,
không chứng minh permission hoặc scheduling runtime Claude đã thực thi.

- Giới hạn runtime: không có executable/client Claude để dispatch trong môi trường này.
  Khi bắt đầu cần kiểm profile nạp, alias/effort hỗ trợ, đăng nhập, override.
  Không thấy quota/giờ reset; không cấu hình scheduler reset tự động.
- Production: không gửi/triển khai thật, secret, đổi billing hoặc thao tác git ghi.
- Việc còn: chạy nhiệm vụ cấu hình; hoàn tất F-01/gate/audit rồi giai đoạn sau.
  Chủ vẫn quyết kích hoạt pilot thật và theo dõi một kỳ thật.
- Một bước tiếp: mở Claude Code tại checkout này, restart nếu chưa nạp profile,
  dán prompt duy nhất ở NEXT_ACTION để coordinator kiểm/đối chiếu trước.
