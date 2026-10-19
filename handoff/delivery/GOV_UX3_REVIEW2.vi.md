# Review độc lập

- Giai đoạn/ngày/reviewer và model/effort quan sát được: GOV (câu trả lời WP5-UX3-Q7 của chủ: văn bản AGENTS.md mới của chủ, kèm hai chỉnh sửa chủ yêu cầu, và bản dịch AGENTS.vi.md); từ 2026-10-19T19:00Z đến 19:20Z (UTC); task WP5-UX3-GOV2-AUDIT lần 1, reviewer agent `a425d954ed94e4526` (theo board); model tự báo `claude-opus-5-5`; profile yêu cầu effort xhigh, effort thực tế không quan sát được. Tác giả trực tiếp WP5-UX3-GOV2 (`af5bf8a7f6d5d5e58`) dùng `claude-sonnet-5-5`; văn bản gốc là của chính chủ. Model thực tế mạnh nhất trên board là `claude-opus-5-5` (90 opus, 318 sonnet, 1 haiku; `models.txt`), nên reviewer không yếu hơn tác giả nào.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (WP5-UX3-GOV2-FREEZE; commit cha `a78ada5edbf5339d4502df57e9f195d11c0b5d28`), trùng `git ls-remote origin refs/heads/main`. Source digest `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 file, không gồm handoff/), tính bằng `scripts/source-digest.mjs` và bằng dạng `git ls-tree`; trùng digest của WP5-UX3-GOV2-GATE. Không có commit chưa push. Thay đổi trong working tree chỉ nằm dưới handoff/ (bản ghi của coordinator, bằng chứng freeze và gate, brief này); `git status --short -- . ':!handoff'` rỗng. Khoảng quản trị `a78ada5..ceb86b6`.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS**.
- Phạm vi thật đã xem/chạy:
  1. Độ trung thành với chủ. Văn bản của chủ trước khi sửa được dựng lại bằng cách áp diff mà worker đã lưu (`owner-diff.txt`, index `2b33ed9..e8af2a2`) lên `a78ada5:AGENTS.md`. Hai bằng chứng độc lập: blob id là `e8af2a26a9c4fe4c7d7258ebbd1ded1969ab2a4b`, và khi thay blob này vào danh sách cây của a78ada5 thì được digest `54cb9a3dbfab3b07…d7d110` (833 file), đúng digest working tree mà bản ghi WP5-UX3-Q7 trên board và brief GOV2 nêu. Sau đó văn bản dựng lại được so từng dòng và từng từ với `ceb86b6:AGENTS.md`.
  2. Mọi cụm từ ứng viên được tìm bằng `git grep` trên ceb86b6, trên mọi path được theo dõi ngoài handoff/, cộng thêm `handoff/prompts` và `handoff/templates`.
  3. Tính nhất quán của đoạn tiêu đề mới, "Operating Contract" và "Prime Directive" với:
     - mục 1-13;
     - docs/08 (thẩm quyền và vai trò, giao task, gate và audit, phạm vi quản trị, commit);
     - CLAUDE.md và CLAUDE.vi.md;
     - `handoff/prompts/` (ORCHESTRATE, các prompt WPn);
     - tám profile `.claude/agents`;
     - skill commit-message;
     - docs/agents/domain.md.
  4. Bản dịch EN/VI, từng câu một, kèm script kiểm heading, cấp heading, code token, con số, gạch đầu dòng, block quote, ngắt dòng cứng và dấu in đậm. Script cũng kiểm hai file trùng từng byte với a78ada5 sau heading "Project instructions".
  5. Phạm vi, định dạng và validator, đều do reviewer tự chạy.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả trong `handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/`):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `git status --porcelain`; `node --version`; `node scripts/source-digest.mjs`; digest dạng `git ls-tree` (trước) | HEAD ceb86b6; chỉ path handoff/ thay đổi; v24.21.0; b35dddd5… (833 file) theo cả hai cách; exit 0 | `digest-before.txt` |
| `patch -p1 < owner-diff.txt` trên `a78ada5:AGENTS.md`; `git hash-object`; danh sách cây a78ada5 với blob của chủ, `sha256sum` | patch exit 0; blob e8af2a26…; digest 54cb9a3d… (833 file), khớp digest working tree đã ghi; bản thân a78ada5 cho d1d903cf…; blob không có trong object store (`cat-file` exit 128, đúng như mong đợi với một chỉnh sửa chưa commit) | `owner-text.txt`, `owner-diff.txt`, `owner_text.sh.txt` |
| `diff -u` và `git diff --no-index --word-diff` giữa văn bản của chủ và ceb86b6:AGENTS.md | đúng 4 hunk: dòng runbook; "architecture-aware, and shop-floor aware" thành "and architecture-aware"; bỏ "CI run, "; "CI evidence" thành "recorded evidence"; danh sách thành "a concept or dependency" (ngắt dòng lại); exit 1 (có khác biệt) | `owner-text.txt` |
| `git grep` trên ceb86b6 cho từng cụm từ ứng viên | liệt kê bên dưới ở phần độ trung thành; exit 0 | `candidates.txt`, `candidates.sh.txt` |
| `git diff --name-only a78ada5..ceb86b6 -- . ':!handoff'`; lệnh tương tự giới hạn ở các path quản trị của docs/08 | chỉ AGENTS.md, AGENTS.vi.md (cả hai danh sách); exit 0 | `checks.txt` |
| `git diff --check a78ada5..ceb86b6` | không có đầu ra; exit 0 | `checks.txt` |
| `<python> -I text_checks.py` (đọc blob bằng `git show`) | 35 kiểm tra, 0 lỗi: không BOM, không CR, đúng một LF cuối, 0 dòng có khoảng trắng cuối, UTF-8 hợp lệ (cả hai file); working tree trùng ceb86b6 cho cặp file; chỉ cấp heading đổi (`#` thành `##`) và mọi dòng sau đó trùng từng byte với a78ada5 (mỗi bên 37 dòng, EN và VI); dòng mở đầu VI không đổi; văn bản của chủ với đúng 5 thay thế bằng ceb86b6; 9 heading cùng cấp, cùng thứ tự; code token (`.vi.md`, `.<lang>.md`), con số (không có), 14 gạch đầu dòng, 2 dòng trích dẫn, 1 ngắt dòng cứng và 2 dấu in đậm đều bằng nhau; không file nào còn cụm nào trong 10 cụm đã bỏ; exit 0 | `checks.txt`, `text_checks.py.txt` |
| lần chạy đầu của cùng script | dừng khi in tiếng Việt qua console mã hóa cp1252 (lỗi trong script của chính reviewer); sửa bằng `sys.stdout.reconfigure` rồi chạy lại toàn bộ | `checks-run1-aborted.txt` |
| `<python> handoff/delivery/validate_package.py --preflight` | PASS, 114 cặp, 2258 link, 91 kịch bản; exit 0 | `checks.txt` |
| `<python> handoff/delivery/validate_orchestration.py` | PASS, profiles 9, tasks 419, active 2; exit 0 | `checks.txt` |
| `<python> handoff/delivery/check_recovery.py` | PASS, count 106, board không bị sửa; exit 0 | `checks.txt`, `check-recovery.txt` |
| `git grep` các quy tắc ưu tiên và ngôn ngữ trong CLAUDE.md, docs/08, prompt, profile, docs/agents; skill commit-message; độ dài dòng và `.editorconfig` | liệt kê ở phần nhất quán; exit 0 | `consistency.txt` |
| đếm model thực tế trên board | opus 90, sonnet 318, haiku 1; coordinator claude-opus-5-5; exit 0 | `models.txt` |
| digest sau (cùng lệnh như trước), `git status --porcelain`, `git ls-remote origin refs/heads/main` | HEAD ceb86b6; b35dddd5… (833 file) theo cả hai cách; status không đổi; remote ceb86b6; exit 0 | `digest-after.txt` |
| lần chạy cuối sau khi viết cặp review này, Results và bằng chứng: preflight, validate_orchestration, quét CR và khoảng trắng cuối dòng, digest | preflight PASS (115 cặp tính cả cặp này, 2259 link); orchestration PASS; không có CR trong file nào đã viết, khoảng trắng cuối chỉ ở các dòng ngữ cảnh diff của `owner-diff.txt` và `owner-text.txt`; HEAD ceb86b6, b35dddd5… (833 file); exit 0 | `final-checks.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **Không có lỗi được chứng minh.** Đã kiểm:
  - Độ trung thành với chủ (lời của chủ: "(a) và sửa cho khớp quy ước .vi.md (xóa các cụm từ ko liên quan như “shop-floor”, “step type”, “probe kind”, “manifest key”..."):
    - Tiêu đề thêm vào, đoạn quy định ưu tiên, mọi câu khác và các cấp heading vẫn đúng văn bản của chủ. Chỉ có năm thay thế nêu trên (bằng chứng trong `owner-text.txt` và mục 4 của `text_checks.py`).
    - Dòng runbook (AGENTS.md:13): nay theo quy ước của repository. `docs/11_OPERATIONS_RUNBOOK.md` và `docs/07_DEPLOYMENT_AND_OPERATIONS.md` đều có `.vi.md` đặt cạnh; `docs/runbooks/` không tồn tại; README.md:5 nêu cùng quy ước. Đúng.
    - Bỏ "shop-floor aware" (AGENTS.md:18): đúng cụm chủ đã nêu, và câu vẫn đúng ngữ pháp. Đúng.
    - "step type", "probe kind", "manifest key": chủ đã nêu tên; bỏ là đúng. "task mode": 0 kết quả trong repository, nên là cụm từ lạ thuộc phần "..." của chủ. Bỏ là đúng.
    - "template variable": chủ không nêu tên, và khái niệm này có trong dự án (docs/04 dòng 100 có tập biến email đóng và "Reject unknown variables"; cả `tests/domain/email-template.test.ts:45`). Nhưng chủ đã nêu rõ "manifest key", khái niệm cũng có ở đây: "manifest key allowlist" của backup (`tests/integration/backup.test.ts:593`, `scripts/container-drill.mjs:7`). Vậy chủ đánh giá các mục trong danh sách theo nguồn gốc (các điểm mở rộng của dự án nguồn), không theo việc từ đó có xuất hiện trong repository này hay không. Bỏ cả danh sách là cách hiểu trung thành, nên đây không phải lỗi; xem R1.
    - Bỏ CI (AGENTS.md:30 và 39): chấp nhận.
      - Repository không có CI: không có `.github/`, không có cấu hình CI. Gate là các lần chạy verifier cục bộ (docs/08 "Gates and independent audit").
      - Lần nhắc duy nhất trong dự án, DEVELOPMENT.md:54 ("never set in development, tests or CI"), là một lời phòng ngừa, không phải hệ thống CI.
      - "command, build, test, … validation" vẫn bao mọi kiểm tra.
      - "CI evidence" thành "recorded evidence". Việc này thêm chữ "recorded" vào văn bản của chủ (xóa tối thiểu sẽ để lại "evidence"). Cách viết này trung tính và khớp mục 5 cùng cách dùng bằng chứng trong docs/08 (R6).
    - Các cụm được giữ đều có dùng trong dự án, nên giữ là đúng:
      - "host check": các kiểm tra host của drill ở `scripts/container-drill.mjs:676` và `:1238`, và các bước host trong docs/11;
      - "deployment", "migration", "release": docs/07, migration DB, release notes docs/12;
      - "public APIs": các hợp đồng API của mục 1;
      - "README guidance": README.md và DEVELOPMENT.md;
      - "skill's output contract": `.agents/skills`;
      - "ADR": dòng "Domain docs";
      - "recoverability": `handoff/templates/CHECKPOINT.md`;
      - các từ chung.
    - "production accuracy" là cụm ranh giới duy nhất được giữ (R2).
  - Tính nhất quán (không tìm thấy mâu thuẫn):
    - "Communicate in the requester's language" (AGENTS.md:9) và mục 1 "Discuss progress (chat) in Vietnamese": khớp trong thực tế. Chủ, người yêu cầu duy nhất là người thật, viết tiếng Việt. Brief của coordinator viết tiếng Anh, và kết quả của subagent là tiếng Anh theo mục 1 và các profile (R3).
    - "Use English for … commit messages" khớp skill commit-message (`.agents/skills/commit-message/SKILL.md:186`: "Write in English unless the user requests another language"). 30 subject commit gần nhất đều tiếng Anh (`consistency.txt`).
    - Điều khoản ưu tiên (AGENTS.md:3-5):
      - CLAUDE.md và CLAUDE.vi.md chỉ import AGENTS.md và giữ phần riêng của Claude ở đó.
      - Mọi prompt WPn ghi "Follow AGENTS", và ORCHESTRATE hoạt động "under AGENTS.md and document 08".
      - Mục 3, 12 và 13 dẫn về docs/08 cho chọn model, commit và vai trò. Không quy tắc nào của docs/08 hay prompt mâu thuẫn với các gạch đầu dòng mới.
      - "Unless the owner explicitly overrides" khớp cách chia thẩm quyền ở docs/08:7.
    - "State a concise plan before large … changes" yêu cầu nêu kế hoạch, không phải chờ duyệt. "Ask only when a missing decision blocks correct or safe progress; otherwise make the safest minimal assumption and proceed" khớp docs/08:7: lựa chọn thường ngày được phép; ngoại lệ nghiệp vụ, gửi thật hay triển khai thật và bí mật vẫn thuộc chủ. Câu này cũng khớp bước 6 của ORCHESTRATE, "proceed automatically", và mục 8, "do not silently change business behavior".
    - "add a concept or dependency without an ADR" (AGENTS.md:43-44): `docs/adr/` chưa tồn tại, nhưng docs/agents/domain.md:11 nói thư mục này được tạo dần khi một quyết định được chốt, nên quy tắc cho biết lúc nào tạo ADR đầu tiên. Không phải mâu thuẫn (R4).
    - Không gạch đầu dòng mới nào đổi người được commit (mục 12, docs/08 "Commits and pushes"), người ghi trạng thái (docs/08:7 và 40), hay các quy tắc gate và audit.
  - Bản dịch:
    - AGENTS.vi.md:3-46 dịch trung thành mọi câu thêm vào, cùng thứ tự, cùng cấp heading, cùng code token và độ dài danh sách. Các danh sách có 9, 6, 4 và 8 mục ở cả hai ngôn ngữ.
    - Dòng 48-84 (mục 1-13, "Skill dành cho agent" và mục UI) trùng từng byte với a78ada5, trừ `#` thành `##`.
    - Thuật ngữ theo cách dùng VI hiện có: "chủ dự án" có trong docs/10 VI và reference/inputs/README.vi.md; "runbook" có trong docs/07 VI và docs/09 VI.
  - Định dạng: LF, không BOM, đúng một dòng mới cuối, không khoảng trắng cuối dòng ở cả hai file. Hai dòng dài hơn cách ngắt dòng của chủ: dòng EN 13 có 117 ký tự và dòng 44 có 104. `.editorconfig` không đặt giới hạn, và các mục 1-13 dài tới 443 ký tự, nên đây không phải lỗi.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R1 (thấp, ghi chú cho chủ): hai mục đã bỏ trong danh sách có tồn tại trong dự án:
    - "template variable": docs/04 dòng 100, `tests/domain/email-template.test.ts:45`, `tests/integration/submission-settings.test.ts:389`;
    - "manifest key": `tests/integration/backup.test.ts:593`, `scripts/container-drill.mjs:7`.

    Việc bỏ dựa trên lời của chủ, như giải thích ở phần độ trung thành. Tiền đề ghi trong brief GOV2 ("keeps only the items that exist in this project") sai với cả hai mục, và lệnh Grep của worker không tìm mục nào trong hai mục này. Tùy chọn: trong ghi chú tiến độ tiếng Việt, báo chủ rằng nếu chủ muốn quy tắc ADR bảo vệ biến template email hay manifest key của backup thì một thay đổi GOV sau có thể thêm lại. Chữ chung "concept" vốn đã có thể bao chúng.
  - R2 (thấp): giữ "production accuracy" (AGENTS.md:20; VI:21 "độ chính xác production").
    - Trong văn bản nguồn, cụm này có thể là từ ngữ shop-floor.
    - Ở đây cụm vẫn đọc đúng nghĩa là độ chính xác của kết quả từ "one production calculation engine" (mục 2).
    - Chủ không nêu tên cụm này, và "không đổi gì khác" nghiêng về giữ.
    - Tùy chọn: hỏi lại chủ.
  - R3 (thấp, câu chữ): AGENTS.md:9 "Communicate in the requester's language" và mục 1 / "Communicate in Vietnamese" của các prompt (`handoff/prompts/WP*_IMPLEMENT.md:5`, `ORCHESTRATE.md:31`) hiện khớp nhau. Tuy vậy, với người yêu cầu không viết tiếng Việt, file không nói thứ tự giữa gạch đầu dòng chung và mục 1. Tùy chọn: "…; item 1 sets the chat language for this project".
  - R4 (thấp, câu chữ): AGENTS.md:43-44 đòi ADR cho mọi "concept" hay dependency mới. Dự án này ghi quyết định ở docs/10 và `owner_decisions` trên board, và `docs/adr/` chưa tồn tại (cũng như GLOSSARY.md, đã có trong danh sách tồn đọng quản trị). Agent có thể hiểu "concept" quá rộng rồi dừng một slice thường ngày để viết ADR, hoặc trùng vai trò với docs/10. Tùy chọn: nói rõ khi nào cần ADR, hoặc trỏ tới docs/10.
  - R5 (thấp, câu chữ): AGENTS.md:25-26 "Explicit user requirements may revise repository conventions … update shared guidance" không nhắc chuỗi GOV của docs/08 hay path được giao. Câu này dùng "user" trong khi điều khoản ưu tiên dùng "owner". Subagent có thể hiểu đây là phép sửa path quản trị ngoài brief. docs/08:40 và :64 vẫn nói rõ, nên không có mâu thuẫn.
  - R6 (thông tin): "recorded evidence" (AGENTS.md:39) là câu chữ của worker, không phải của chủ. Câu "A reported result is not independent proof" của mục 5 vẫn chi phối các audit.
  - R7 (thông tin, bản ghi): Results của worker và quyết định trên board ghi "0 hits for CI", không chính xác. DEVELOPMENT.md:54 và DEVELOPMENT.vi.md:54 có nhắc CI, và vài skill cũng vậy. Brief GOV2 cũng ghi "`docs/adr/` exists here", điều này sai; worker đã ghi nhận thư mục không tồn tại. Cả hai sai sót không đổi kết luận.
  - R8 (thông tin, trau chuốt bản dịch):
    - AGENTS.vi.md:17 thiếu "matching" ("các bản dịch `.<lang>.md` tương ứng hiện có").
    - VI:31 dịch "validation" là "xác nhận"; "kiểm tra hợp lệ" sát hơn.
    - Nghĩa vẫn giữ trong cả hai chỗ.
  - R9 (vận hành): AGENTS.md được nạp sẵn vào phiên của reviewer này là văn bản chưa sửa của chủ (blob e8af2a2: `docs/runbooks/vi/`, "shop-floor aware", "CI run", danh sách năm mục), không phải ceb86b6. Các agent được giao trong phiên này nhận bản cũ đó. Các profile bảo đọc AGENTS.md từ đĩa. Brief nên ghi rằng văn bản trên đĩa ở ceb86b6 thay cho mọi bản được nạp sẵn, hoặc coordinator nên khởi động lại client, như R3 của GOV_UX3_REVIEW.
- Gate chưa chạy/bị chặn và lý do: không bỏ kiểm tra bắt buộc nào (mục 5 của brief). Theo brief, không chạy bộ e2e hay `npm run verify`, vì WP5-UX3-REGATE2 chạy song song trên cùng commit. WP5-UX3-GOV2-GATE đã ghi verify exit 0 trên cùng digest.
- Xử lý phát hiện trước: không có phát hiện trước cho thay đổi này. R6 của GOV_UX3_REVIEW (thiếu GLOSSARY.md và `docs/adr/`) vẫn còn, và nay Prime Directive cũng chạm tới nó (R4).
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: đây chỉ là review quản trị. Review không khẳng định sẵn sàng phần mềm, không cấp phép của chủ cho gửi thật hay triển khai, và không báo kết quả pilot. Regate WP5, các recheck và AUDIT-INT trên ceb86b6 là việc riêng.
- Một bước/prompt tiếp: coordinator ghi WP5-UX3-GOV2-AUDIT PASS (reviewed_commit ceb86b6, digest b35dddd5) và tiếp tục chuỗi WP5 trên ceb86b6. Coordinator báo R1 và R2 cho chủ trong ghi chú tiến độ tiếng Việt và thêm R3-R5 cùng R8 vào danh sách tồn đọng quản trị.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [GOV_UX3_REVIEW2.md](GOV_UX3_REVIEW2.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX3-GOV2-AUDIT lần 1; reviewer `a425d954ed94e4526` (theo board). Tác giả: WP5-UX3-GOV2 `af5bf8a7f6d5d5e58`, sửa trên văn bản của chính chủ. Committer WP5-UX3-GOV2-FREEZE `a7363d5f342103ff7` và verifier WP5-UX3-GOV2-GATE `af069fb5f257f61c1` không được tính là tác giả.
- Context mới; xác nhận reviewer không viết thay đổi: context mới, không fork từ người triển khai. Reviewer không viết thay đổi nào trong snapshot được kiểm hay trong task WP5-UX3 nào. Báo cáo của worker và verifier chỉ được coi là lời khẳng định, và các kiểm tra của họ đã được chạy lại.
- Digest trước/sau; bằng chứng gate snapshot đó: b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 file) trước và sau, HEAD ceb86b6 trước và sau. Bằng chứng gate: `handoff/delivery/evidence/WP5-UX3-GOV2-GATE/checks.txt` (PASS, freeze_commit ceb86b6).
- Path report mới giữ lịch sử review trước: `handoff/delivery/GOV_UX3_REVIEW2.md` và `.vi.md` (file mới); GOV_UX3_REVIEW và các review trước không bị đụng tới. Bằng chứng: `handoff/delivery/evidence/WP5-UX3-GOV2-AUDIT/`.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: snapshot được kiểm không cần sửa. R1 và R2 là ghi chú cho chủ. R3-R5 và R8 là chỉnh câu chữ tùy chọn cho danh sách tồn đọng quản trị. R6 và R7 là thông tin. R9 thuộc vận hành, xử lý qua brief hoặc khởi động lại client.
