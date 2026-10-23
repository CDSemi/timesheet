# Review thiết kế: định dạng manifest của Ingat, lấy `ingat.toml` làm ví dụ (INGAT-MANIFEST-DESIGN)

Bản dịch của [INGAT_MANIFEST_DESIGN_REVIEW.md](INGAT_MANIFEST_DESIGN_REVIEW.md); tiếng Anh là nguồn chuẩn.

- Task: nhánh phụ "Ingat deployability", INGAT-MANIFEST-DESIGN lần 1 (review thiết kế, không đổi mã nguồn);
  2026-10-22; timesheet-planner, effort high; model tự báo `claude-opus-5-5`.
- Đối tượng review: MANIFEST_SPEC của Ingat (định dạng), lấy `ingat.toml` của repository này (HEAD `7aafa21`, SHA-256
  `7bf274a8...`, không khác HEAD) làm ví dụ. Mã nguồn và tài liệu Ingat đọc từ bản checkout cục bộ
  `v0.1.0-16-g35be585` (sạch); các phép đo dùng image Ingat 0.1.0 đã ghim (`sha256:b5db73be...`), mà INGAT-TOML-AUDIT
  đã chứng minh các file Python được trích dẫn giống hệt bản checkout.
- Không lặp lại ở đây: `ingat.toml` có khớp mã của app này không (INGAT-TOML-AUDIT,
  [INGAT_TOML_REVIEW.md](INGAT_TOML_REVIEW.md)). Review này đánh giá chính định dạng.
- Cách đọc: dòng **Sự thật** có nguồn (`file:dòng` trong Ingat, với `SPEC` = `docs/app-developers/MANIFEST_SPEC.md`,
  `m.py` = `src/ingat/model/manifest.py`; một URL; hoặc một file bằng chứng trong
  [evidence/INGAT-MANIFEST-DESIGN/](evidence/INGAT-MANIFEST-DESIGN/commands.txt)). Dòng **Ý kiến** được ghi rõ. "Theo trí nhớ, chưa
  kiểm chứng" đánh dấu vài sự thật không được đối chiếu nguồn trong task này.

## H. Kết luận

1. **Ý kiến.** Định dạng này gần tối ưu cho đúng việc của nó (sao lưu, khôi phục, quay lui và diễn tập an toàn cho bất
   kỳ app Compose nào, không để giá trị của máy chủ trong repository), nhưng chưa phải dễ dùng nhất: phần lớn độ dài là
   cố ý, còn vấn đề thật là một cái bẫy kiểm tra, công cụ hỗ trợ yếu và vài chỗ lặp phần "đường ống".
2. **Sự thật.** Một app một container với một bind store và một route readiness qua được `ingat validate` đã ghim với
   26 dòng (30 dòng nếu có probe readiness); thêm sao lưu, khôi phục và một task cho người vận hành thì thành 72 dòng;
   manifest của app này dài 257 dòng vì nó khai báo 11 lệnh với hợp đồng an toàn khác nhau, 14 key môi trường và một
   cơ chế tạm dừng gửi mail (`validate-results.txt`, `counts.txt`).
3. **Sự thật và ý kiến.** TOML không phải nguyên nhân gây dài: cùng dữ liệu đó thành 280 dòng ở YAML dạng khối và 509
   dòng ở JSON (`counts.txt`); TOML là định dạng đúng ở đây, như với Cargo, pyproject và Fly, và một lập trình viên học
   năm cấu trúc mà manifest dùng trong một đến hai giờ (ý kiến).
4. **Ý kiến.** Dài có chủ đích và nên giữ: `effect`, `idempotent`, bảng `exit` và `stdout` cho từng task, các hold và
   key owner-gated được khai báo, và việc từ chối key lạ; những dòng này là hợp đồng an toàn mà người vận hành dựa vào
   khi khôi phục.
5. **Sự thật.** Cái bẫy: `[backup] strategy` mặc định là `"none"` (`m.py:213`), nên một app có dữ liệu mà quên
   `[backup]` vẫn validate xanh, lần cập nhật đổi dữ liệu đầu tiên bị từ chối lúc lập kế hoạch (`ops/deploy.py:232-234`),
   và `status` báo app "không giữ dữ liệu" (`ops/status.py:498-499`). Fly.io chọn mặc định ngược lại: snapshot volume
   hằng ngày bật sẵn trừ khi tắt (fly.io/docs/reference/configuration, `scheduled_snapshots`).
6. **Sự thật.** Không có mẫu khởi đầu, không có `init` cho manifest, không có JSON Schema, không có gợi ý trong editor
   và không có "ý bạn là" (Grep README, guide của Ingat và `cli/commands.py:409-443`; các phép thử ở mục E), trong khi
   Fly và Kamal tự sinh file của họ và schema của Fly cho gợi ý trong editor.
7. **Ý kiến.** Các sửa ở P1 không cần đổi schema; task defaults và vài liên kết suy ra được (P2) rút manifest này từ
   257 xuống 218 dòng (-15%) mà không che key an toàn nào, và chỉ rẻ trước khi schema đóng băng ở M2
   (`docs/design/ROADMAP.md:149`), sau đó phải thành schema 2.
8. **Ý kiến.** Điều một app không trả lời được: defaults có đáng không với app nhiều service (ví dụ PostgreSQL trong
   spec gợi ý có, cho `service`/`mode`, có thể cả bảng exit), lập trình viên bên thứ ba học bộ từ vựng nhanh đến đâu, và
   bao nhiêu app sẽ dùng data provider đã lên kế hoạch với manifest 46-70 dòng thay vào đó (ADR-0031:40).

## A. Dạng tối thiểu, có đo

**Sự thật.** Mỗi dạng được viết trong thư mục task cạnh một bản sao giống từng byte của `compose.example.yaml` và chạy
qua `validate` đã ghim đúng dạng của job CI (`commands.txt`, `validate-results.txt`, `counts.txt`).

| Dạng | Thêm | Dòng | Header | Leaf key | Đường dẫn key | `validate` |
|---|---|---:|---:|---:|---:|---|
| thử lần đầu (`min1`) | định danh, source, compose, param store, store, writer, activation | 24 | 6 | 13 | — | exit 1 (chính sách Compose) |
| tối thiểu (`minimal-validate-ingat.toml.txt`) | + param `env_file` và `port` | **26** | 6 | 15 | 13 | exit 0 |
| tối thiểu có readiness (`minimal-ingat.toml.txt`) | + probe http, chờ khi activation | **30** | 7 | 18 | 16 | exit 0 |
| vận hành được (`operable-ingat.toml.txt`) | + param image, app env (2 key bắt buộc), owner của store, `[backup]`, `[restore]`, task backup, restore, bootstrap-new-token | **72** | 14 | 48 | 32 | exit 0 |
| app này (`ingat.toml`) | mọi thứ | 257 | 34 | 205 | 88 | exit 0 (CI) |
| phác thảo `fly.toml` của Fly.io, cùng phạm vi cộng một migration | — | 15 | 4 | 7 | — | không chạy |
| phác thảo `config/deploy.yml` của Kamal, cùng phạm vi cộng một migration | — | 20 | — | 11 | — | không chạy |

(`min1` nằm trong thư mục task; kết quả của nó ở `validate-results.txt`. Phác thảo Fly và Kamal cùng nguồn ở
`comparables-min.txt`.)

- **Sự thật.** Lần thử đầu hỏng ở chính sách Compose, không phải ở manifest: `env_file[0] ... is outside the
  instance's ... rendered env file` và `127.0.0.1:3000 refused: only 127.0.0.1 and a port param value`. Lập trình viên
  phải học ba loại param (`store`, `env_file`, `port`) trước lần xanh đầu tiên.
- **Ý kiến, từ sự thật.** Trong 15 leaf key của dạng tối thiểu, 9 key có thể do một công cụ dựng khung suy ra từ file
  Compose và trường hợp một service: bốn leaf của params (validate vốn đã đọc `compose config --variables` và kiểm mọi
  bind source, env file và cổng publish: SPEC:203-205), `kind` và `param` của store, `writers` (service duy nhất gắn
  store), và `services` cùng `reopens_writes` của nhóm activation. Sáu key còn lại (`manifest`, `app`,
  `requires_ingat`, `source.kind`, `source.release`, `compose.files`) là lựa chọn.
- **Sự thật.** Xanh chưa có nghĩa là deploy được. Các dạng tối thiểu không có `[backup]` (cái bẫy ở H5), không có
  `owner` của store (các generation mới sẽ không thuộc user của image: INGAT-TOML-AUDIT `key-table.txt` dòng 35), và
  không có param image, nên `prepare` sẽ kéo giá trị mặc định của Compose `timesheet:local` (SPEC:51; lần theo mã,
  không chạy).
- **Sự thật và ý kiến.** Cùng phạm vi, Ingat cần khoảng gấp đôi số dòng của Fly hay Kamal. Lý do (ý kiến): Ingat định
  kiểu cho từng biến Compose thay vì tự làm chủ runtime, đặt tên vai trò và nhóm activation tường minh, giữ giá trị
  của máy chủ ngoài file (file của Kamal chứa địa chỉ server), và tự khai báo sao lưu, khôi phục (snapshot volume của
  Fly là tính năng nền tảng, Kamal không có khái niệm sao lưu). Với những gì Ingat cam kết, gấp đôi ở mức tối thiểu là
  hợp lý; khoảng cách đáng kể nằm ở dạng vận hành được, nơi cái bẫy và việc thiếu công cụ tốn hơn số dòng.

## B. Danh mục khái niệm

**Sự thật.** Đếm từ SPEC §2-§5 và `m.py:74-304` (tôi tự đếm): 20 bảng (cộng `[data.<name>]` đã lên kế hoạch), khoảng
129 key, 19 biến template (SPEC:131-143), và khoảng 18 tập giá trị đóng (ví dụ 10 loại param, `m.py:20`). App này dùng
22 tên cấp cao nhất và 88 đường dẫn key khác nhau (`counts.txt`), nên một app một container "đơn giản" chạm tới 19
trên 20 bảng.

| Nhóm | Key trong spec | Dùng ở đây | Từ vựng (ý kiến, trừ khi có nguồn) |
|---|---:|---:|---|
| Định danh (`manifest`, `app`, `requires_ingat`, `exclusive_environments`) | 4 | 3 | Rõ. |
| Build và image (`[source]`, `[compose]`) | 9 | 5 | Rõ; `build_files` và `build_env` "không dùng khi image app được build trong CI của app" (SPEC:50, 52) nhưng lại nằm trong bảng đầu tiên người đọc gặp. |
| Params | 8 key, 10 loại | 3 key, 4 loại | Tên loại tốt; liên kết store được viết hai lần (ở đây và trong `[stores]`). |
| Môi trường và secret | 11 | 9 | `forbidden`, `owner_gated`, `tool_managed`, `secret` dễ hiểu. |
| Store và vai trò | 13 | 7 | `online_backup` tốt; `local_only` được parse nhưng 0.1.0 không thực thi (INGAT_TOML_REVIEW O-H). |
| Schema | 5 | 4 | `expected` là một đường dẫn JSON, còn `expect` ở chỗ khác là một kỳ vọng. |
| Probe và smoke | 19 | 9 | Ba loại probe rõ; một smoke check là một probe http cộng một tên (SPEC:182). |
| Các bước vòng đời (`[[activate]]`, `[[install]]`, `[deploy]`) | 14 | 9 | Loại của một bước install được chọn theo key nào có mặt (SPEC:109). |
| Backup, restore, rollback, drill | 19 | 13 | `checks`/`record` ở đây là danh sách task, ở chỗ khác lại là thứ khác. |
| Hold và side effect | 7 | 7 | `holds` là từ tốt; `clear_hold` đụng với `clears_hold`. |
| Task | 20 | 15 | Bảng không định nghĩa các giá trị của `effect`; `operator` đọc như chỉ một người. |
| Template | 19 biến | 5 | Tập đóng, kiểm theo ngữ cảnh: một điểm mạnh. |

Các phát hiện về tên (**Sự thật**: chỗ cả hai tên tồn tại; **Ý kiến**: mức rủi ro):

1. `side_effects.clear_hold` là tên một task (SPEC:121); `tasks.<n>.clears_hold` là một boolean (SPEC:167). Khác một
   chữ cái, khác kiểu: cặp dễ nhầm nhất trong schema.
2. `record` vừa là một chế độ stdout ("lưu 0600", SPEC:158) vừa là danh sách task `[drill] record` ("ghi lại, cho
   phép có finding", SPEC:119).
3. `activate` là một mảng bảng (SPEC:107) và là một boolean trong `[restore]` và `[drill]` (SPEC:117, 119); `start` là
   danh sách service trong `[[install]]` và trong `[restore]`.
4. `expect` (kỳ vọng của probe và task, SPEC:165, 182), `expected` (đường dẫn schema, SPEC:103) và `expect_labels`
   (SPEC:53): ba nghĩa, một gốc từ.
5. Kiểu chữ: key dùng snake_case, tên task và probe dùng kebab-case, giá trị dùng kebab-case (`app-write`,
   `generation:data`), và có một key kebab-case: `pre-change` trong `[backup.naming]` (SPEC:116).
6. `effect`: bảng task chỉ ghi "Effect on instance data" (SPEC:161); khác biệt giữa `app-write` và `data`, thứ quyết
   định một task backup có phải idempotent hay không (SPEC:172), được định nghĩa ở chỗ khác.
7. `operator = false` nghĩa là "chỉ các operation được chạy nó", không chỉ một người (SPEC:168).

Những khái niệm bị đưa ra quá sớm với app đơn giản (**Sự thật**): SPEC:5 bảo người mới bắt đầu từ ví dụ gần nhất, và ví
dụ một container (§11, SPEC:701-961) là toàn bộ mẫu SQLite với hold, side effect, một bước tạm dừng khi cài và sáu task
outbound; chính ADR-0031:11 viết "một manifest một container tốn khoảng 255 dòng". Các ví dụ còn viết cả key ở giá
trị mặc định (`baseline = []`, `prechecks = []`, `postchecks = []`, `verify = []`, `start = []`, `post = []`,
`checks = []`, `record = []`: SPEC:803-826). **Ý kiến:** một app không trạng thái cần 12 tên cấp cao nhất (fx-web, 39
dòng) và một app có dữ liệu cần 14 (dạng vận hành được), nên chính tài liệu, chứ không phải schema, đưa phần lớn khái
niệm ra quá sớm.

## C. Lặp lại và kết hợp

INGAT-TOML-AUDIT đã chứng minh phần lặp là không tránh được trong schema 1. Đây là thiết kế đằng sau nó (cột 1 là
**Sự thật**, cột 2-5 là **Ý kiến**; số dòng tiết kiệm tính trên manifest của app này, `proposed-ingat.toml.txt`).

| Lựa chọn của schema 1 | Thiết kế gọn hơn | Tiết kiệm ở đây | Cái giá về tính tường minh hoặc an toàn | Kết luận |
|---|---|---:|---|---|
| Mọi task phải viết `service`, `mode`, `effect`, `timeout` (`m.py:250-269`), trong khi probe có mặc định (`stable` 0s, `interval` 2s, `timeout` 60s: SPEC:182) | `[task_defaults]` chỉ cho các key truyền tải: `service`, `mode`, `timeout`. Tương tự: kế thừa tường minh `key.workspace = true` của Cargo (doc.rust-lang.org/cargo/reference/workspaces.html); anchor YAML với khối `x-` của Compose và Kamal | 25 dòng (22 dòng `service`/`mode`, 7 dòng `timeout = "2m"`, trừ 4) | Thấp: giá trị mặc định viết trong file; `effect`, `idempotent`, `exit`, `stdout`, `image`, `observe` vẫn theo từng task. Timeout mặc định quá ngắn làm một task dữ liệu bị dừng thành `unknown` (SPEC:170), nên mặc định không bao giờ được cài sẵn trong công cụ | Đáng làm (P2-a) |
| Không có kế thừa giữa các task | `extends = "<task>"` | gần bằng defaults | Cao: một task xác nhận có thể âm thầm kế thừa `exit = { 2 = "ok" }` và `expect` của task xem trước | Không làm |
| `args` chỉ điền giá trị (INGAT_TOML_REVIEW O-J) | đối số tùy chọn hoặc biến số lượng | nhiều nhất một task | Hình dạng argv không còn cố định; trôi về phía ngôn ngữ biểu thức mà ADR-0009:19 đã bác | Giữ |
| Tiền tố argv `node dist/server/cli.js` lặp 11 lần (O-I) | tiền tố `cli` theo service; hoặc, làm được ngay hôm nay, một service Compose chỉ dùng cho task trong một profile với `entrypoint` là CLI (SPEC:99, 152; fx-pg làm vậy, SPEC:477-481) | 0 dòng, khoảng 330 ký tự | Thêm một khái niệm; argv trong file không còn là thứ thật sự chạy; cách làm hôm nay dời phần lặp sang Compose | Khẩu vị (P3-1) |
| `[[smoke]] live` lặp `[probes.edge-live]`; start+wait của `[[install]]` lặp `[[activate]]` | `[[smoke]] probe = "<probe http>"`; `[[install]] activate = true` | 2 + 1 | Không | Đáng làm (P2-d, P2-e) |
| `[[install]]` và `[[activate]]` là mảng bảng | một bảng `[lifecycle]` | 0 (header chỉ dời chỗ) | Ở TOML 1.0 bảng inline phải nằm trên một dòng (SPEC:33; `err-syntax`), nên các bước có thứ tự sẽ khó viết hơn | Giữ |
| Liên kết store viết hai lần: `[params] X = { kind = "store", store = "data" }` và `[stores.data] param = "X"`, và validator kiểm hai bên khớp nhau (`m.py:377, 396-398`) | viết một lần, ở phía param | 1 | Không: phép kiểm đã có | P2-b |
| `[app_env] param` nhắc lại param nào là `env_file` (`m.py:358`) | suy ra khi chỉ có đúng một param `env_file` | 1 | Không | P2-c |
| Các task mà công cụ vốn đã từ chối chạy tay phải "khai báo `operator = false`" (SPEC:168) | suy ra từ `image` và các mount | 3 | Không có khi chạy (`ops/lifecycle.py:191` vẫn từ chối, theo INGAT-TOML-AUDIT); người đọc mất một gợi ý tường minh | P2-f |

**Ý kiến.** Với một công cụ sao lưu và khôi phục, ranh giới giữa "đường ống" và "hợp đồng" là phép thử đúng: mặc định
an toàn cho việc task chạy trong container nào, chạy bằng cách nào và bao lâu; không an toàn cho việc task làm gì với dữ
liệu, có được chạy lại không, mã thoát nghĩa là gì và output đi đâu. Các đề xuất giữ đúng ranh giới đó.

## D. Cấu trúc và mô hình tư duy

- **Sự thật.** SPEC §2 đi theo thứ tự: định danh, source, Compose → params → secret và app env → store và vai trò →
  schema → activation, smoke, install, deploy → backup, restore, rollback, drill, hold, side effect; task (§4) và probe
  (§5) được định nghĩa sau các mục tham chiếu chúng, và mọi ví dụ đặt task ở cuối (SPEC:37-182, §8, §11).
- **Ý kiến.** Đó là thứ tự của lập trình viên (khai báo → chạy → vận hành), và file đọc từ trên xuống như một câu
  chuyện mà các "hàm" (task và probe) được định nghĩa ở cuối. Nó kém hơn với câu hỏi của người vận hành "điều gì xảy
  ra khi cài, deploy, sao lưu, khôi phục?": câu trả lời rải trên `[[install]]`, `[deploy]`, `[[activate]]`, `[[smoke]]`,
  `[backup]`, `[restore]`, các task và các probe.
- **Ý kiến.** Gom các mục vòng đời vào một bảng sẽ thêm một tầng lồng, không bớt dòng nào, và đụng với data provider
  đã lên kế hoạch, vốn tự sinh trọn các bảng `[backup]`, `[restore]` và `[drill]` (ADR-0031:18, 21). Cách sửa tốt hơn là
  một góc nhìn, không phải bố cục mới: một bảng trong spec, "operation → các key nó đọc, theo thứ tự", và một
  `validate --explain` in ra các bước đã phân giải của từng operation với defaults đã áp dụng (P2-h).

## E. Thông báo lỗi và công cụ

**Sự thật.** Năm bản hỏng của dạng vận hành được, chạy qua `validate` đã ghim (`validate-results.txt`):

| Phép thử | Thông báo | Đường dẫn key | Giá trị hợp lệ hoặc cách sửa | Ý kiến |
|---|---|---|---|---|
| thiếu `effect` | `tasks.backup.effect: is required` | có | không | Tốt; có thể thêm "one of: read, app-write, data". |
| viết sai `idempotant` | `tasks.backup.idempotant: unknown key` và `backup.steps: task 'backup' must be idempotent (scratch)` | có | không | Không có "ý bạn là `idempotent`"; dòng thứ hai là hệ quả và dùng từ nội bộ "scratch". |
| `effect = "write"`, `timeout = "60 min"` | `must be one of: read, app-write, data`; `'60 min' is not a duration such as 15s, 2m or 1h` | có | có | Mẫu mực. |
| probe, task, arg không tồn tại | `names an unknown probe 'redy'`; `names an unknown task 'bakup'`; `{arg.user} names an undeclared arg` | có | không | Sẽ tốt hơn với "đã biết: ready" hoặc "ý bạn là". |
| bảng inline hai dòng | `Invalid initial character for a key part (at line 34, column 40)` | không | không | Thông báo thô của parser TOML 1.0; không gợi ý rằng bảng inline phải nằm trên một dòng. |
| chính sách Compose (`min1`) | `sample: services.timesheet.env_file[0]: /app/timesheet.env is outside ...`; `sample--t1: ...` | đường dẫn Compose | không | Nói cái gì bị từ chối, không nói key manifest nào cần thêm; `sample` và `sample--t1` là tên model nội bộ. |

- **Sự thật, điểm mạnh.** Mọi lỗi được gom trong một lần chạy (`model/toml_read.py:133-138`), mỗi lỗi nêu đường dẫn key
  dạng chấm (`toml_read.py:32-37`), key lạ bị từ chối ở mọi cấp (SPEC:33), và lỗi enum, lỗi thời lượng đều chỉ dạng
  hợp lệ. Kamal cũng từ chối key lạ (kamal-deploy.org/docs/configuration/overview).
- **Sự thật, chỗ thiếu.** Lỗi ngữ nghĩa không có số dòng: `tomllib` trả về một dict thuần và chỉ cho vị trí với lỗi cú
  pháp (docs.python.org/3/library/tomllib.html). Phép thử với bản viết lại còn cho thấy các cặp lỗi hệ quả
  (`app_env.param: is required` rồi `app_env.param: must name an env_file param`).
- **Sự thật, công cụ.** Ingat không có công cụ dựng khung manifest (`ingat init` đăng ký một instance,
  `cli/commands.py:415`), không có JSON Schema (không có trong repository; catalog SchemaStore không có mục
  `ingat.toml`, schemastore.org/api/json/catalog.json), không có gợi ý trong editor và không có `--explain`. Đối chiếu:
  `fly launch` tạo `fly.toml` và tài liệu Fly chỉ tới extension Even Better TOML "để tự kiểm và gợi ý fly.toml"
  (fly.io/docs/reference/configuration); `kamal init` tạo `config/deploy.yml` (kamal-deploy.org/docs/installation);
  SchemaStore có schema cho `fly.toml`, `Cargo.toml`, `pyproject.toml` và `hugo.toml`, mà các editor dùng Taplo dựa vào
  để gợi ý và hiện tài liệu khi rê chuột (taplo.tamasfe.dev/configuration/developing-schemas.html).
- **Sự thật.** ADR-0031:30 đã bác một bộ sinh manifest ("khoảng 700 dòng lõi cho việc mà một script lint hoặc giao diện
  web làm được"). **Ý kiến:** một JSON Schema cộng một ví dụ khởi đầu 30 dòng cho phần lớn lợi ích của bộ sinh với một
  phần nhỏ chi phí.

## F. Lựa chọn định dạng

**TOML là gì (Sự thật).** TOML, "Tom's Obvious Minimal Language", của Tom Preston-Werner, "nhắm tới một định dạng file
cấu hình tối giản, dễ đọc nhờ ngữ nghĩa hiển nhiên" và "ánh xạ không mơ hồ sang một bảng băm" (toml.io/en). Phiên bản
1.0.0 công bố ngày 2021-01-11 (toml.io/en/v1.0.0) và 1.1.0 ngày 2025-12-18 (toml.io/en/v1.1.0; bản phát hành GitHub
2025-12-24). 1.1.0 cho phép xuống dòng và dấu phẩy cuối trong bảng inline (github.com/toml-lang/toml/releases).

**Dễ học đến đâu (Sự thật, rồi ý kiến).** Toàn bộ ngôn ngữ gói trong phần giới thiệu trên trang chủ toml.io: cặp
key/giá trị, bốn dạng chuỗi, số, boolean, ngày giờ, mảng, bảng, bảng inline và mảng bảng. PEP 518 chọn nó vì nó "con
người dùng được (khác JSON)", "đủ linh hoạt (khác configparser)" và "không quá phức tạp (khác YAML)"
(peps.python.org/pep-0518). *Ý kiến:* `ingat.toml` dùng năm cấu trúc (`key = value`, chuỗi thường và chuỗi literal,
danh sách, `[bảng]` và `[[mảng]]`, `{ bảng inline }` một dòng); ai đã thấy `Cargo.toml` hay `pyproject.toml` đọc được
ngay, người khác học trong một đến hai giờ. Phần khó của `ingat.toml` là bộ từ vựng của Ingat (mục B), không phải TOML.

**Phổ biến đến đâu (Sự thật).** Có bản cài đặt cho hơn 40 ngôn ngữ (toml.io/en); thư viện chuẩn Python có `tomllib` từ
3.11 (TOML 1.0.0; TOML 1.1.0 từ 3.15: docs.python.org/3/library/tomllib.html; PEP 680); mọi package Rust có
`Cargo.toml` (doc.rust-lang.org/cargo/reference/manifest.html); dự án Python khai báo metadata trong `pyproject.toml`
(PEP 518, PEP 621); black, mypy, pytest, tox, pylint và isort đọc cấu hình TOML, và các thư viện TOML có khoảng 2.000
reverse dependency trên PyPI lúc PEP 680 được viết (peps.python.org/pep-0680); Hugo đọc `hugo.toml` trước tiên
(gohugo.io/configuration/introduction), Netlify dùng `netlify.toml`
(docs.netlify.com/build/configure-builds/file-based-configuration), Fly.io dùng `fly.toml`, Cloud Native Buildpacks dùng
`project.toml` (buildpacks.io/docs/reference/config/project-descriptor). YAML phổ biến hơn trong công cụ container: chính
file Compose và các workflow GitHub của repository này là YAML. Không tìm thấy bảng xếp hạng có nguồn so TOML với YAML.

| Định dạng | Tốt ở đây | Gây khó ở đây | Nguồn |
|---|---|---|---|
| **TOML** (đã chọn, ADR-0009) | Comment; kiểu tường minh (chuỗi luôn có ngoặc, nên không có chuyện `off` ngầm thành false); chuỗi literal cho regex (`'^[0-9]{1,5}$'`); không phụ thuộc thụt lề; parser trong thư viện chuẩn, nên image ghim của Ingat không cần dependency; định dạng của Cargo, pyproject, Fly | Bảng inline một dòng ở TOML 1.0 (`err-syntax`); header `[[x]]` cho mỗi phần tử mảng; đường dẫn sâu dạng `[a.b.c]`; không có tham chiếu, anchor hay template; chuỗi dài cần `"""` với dấu gạch chéo ngược cuối dòng | toml.io; ADR-0009:15, 19; `validate-results.txt` |
| YAML | Comment; anchor và khối `x-` bỏ được phần lặp (Compose, Kamal); quen thuộc nhờ Compose | Định kiểu ngầm (lý do của ADR-0009); thụt lề có nghĩa; spec lớn (PEP 518: "86 trang") | docs.docker.com/reference/compose-file/fragments; kamal-deploy.org/docs/configuration/anchors; PEP 518 |
| JSON | Phổ quát; dễ có JSON Schema | Không có comment; regex cần gấp đôi dấu gạch chéo ngược; 509 dòng cho dữ liệu này | `counts.txt` |
| HCL (Nomad, Terraform) | Block có nhãn (`task "backup" { }`), biến và locals | Một ngôn ngữ biểu thức (ADR-0009:19 đã bác); parser xoay quanh Go | Theo trí nhớ, chưa kiểm chứng |
| KDL | Cú pháp node gọn, có comment | Hệ sinh thái nhỏ; không có parser trong thư viện chuẩn Python | Theo trí nhớ, chưa kiểm chứng |
| CUE | Schema, mặc định và ràng buộc nằm trong ngôn ngữ | Một ngôn ngữ mới với ngữ nghĩa hợp nhất phải học; một công cụ Go | Theo trí nhớ, chưa kiểm chứng |

**Sự thật.** Cùng manifest là 211 dòng nội dung ở TOML, 280 dòng ở YAML dạng khối và 509 ở JSON (bỏ comment,
`counts.txt`). **Ý kiến.** Độ dài đến từ số sự kiện mà schema cần (205 leaf key), không đến từ TOML; khoảng trống thật
duy nhất của định dạng là thiếu anchor, và task defaults trong schema lấp nó theo cách người dùng TOML đã quen từ
Cargo. Đổi định dạng sẽ tốn một lần chuyển đổi mà không được gì đo được. Bảng inline nhiều dòng của TOML 1.1 chỉ dùng
được khi image của Ingat chuyển sang Python hỗ trợ TOML 1.1 (3.15; Ingat ghim 3.13 theo ADR-0004).

## G. Đề xuất, theo ưu tiên

P1 = lợi rõ, rủi ro thấp, không đổi schema. P2 = đáng làm, cần Ingat quyết định; bổ sung được trong schema 1 nếu quyết
trước khi đóng băng ở M2 (ROADMAP.md:149), nếu không thì schema 2. P3 = khẩu vị hoặc không khuyến nghị. Mọi đề xuất là
**thay đổi phía Ingat** trừ khi ghi **làm được ngay hôm nay**.

| ID | Thay đổi | Schema | Tương thích | Ảnh hưởng tới manifest này | An toàn | Tương tự |
|---|---|---|---|---|---|---|
| P1-1 | `validate` từ chối (hoặc cảnh báo) store không có `[backup] strategy` tường minh; thông báo nêu việc bị từ chối lúc lập kế hoạch | không (quy tắc kiểm) | chỉ làm hỏng manifest có store mà không có `[backup]` (chưa biết cái nào) | 0 dòng | Tốt hơn: bịt cái bẫy ở H5 | Fly snapshot volume mặc định |
| P1-2 | Thông báo tốt hơn: "ý bạn là" cho key và tên, liệt kê probe/task đã biết, bỏ lỗi hệ quả, gợi ý cho bảng inline một dòng, thông báo chính sách Compose nêu key manifest cần thêm và giấu tên model nội bộ | không | không | 0 | Trung tính | Kamal từ chối key lạ; "did you mean" phổ biến ở CLI (theo trí nhớ, chưa kiểm chứng) |
| P1-3 | Công bố JSON Schema cho `ingat.toml` (sinh từ các dataclass) lên SchemaStore | không | không | 0 | Trung tính | `fly.toml`, `Cargo.toml`, `pyproject.toml`, `hugo.toml` trong SchemaStore |
| P1-4 | Tài liệu: ví dụ "bắt đầu ở đây" 30 dòng và ví dụ vận hành được 72 dòng trước §11; định nghĩa một dòng cho mỗi giá trị đóng (`effect`, `stdout`, `image`, `operator`); bảng "operation → các key được đọc"; bỏ key ở giá trị mặc định khỏi các ví dụ | không | không | 0 | Trung tính | output của `kamal init`; tài liệu Fly |
| P1-a | **Làm được ngay hôm nay:** dạng gọn của INGAT-TOML-AUDIT (bỏ sáu dòng mặc định, rút ngắn header) | không | model giống hệt (đã chứng minh ở đó) | -8 dòng | Không | — |
| P2-a | `[task_defaults]` chỉ với `service`, `mode`, `timeout` | bổ sung | manifest cũ không đổi; manifest dùng nó cần `requires_ingat` mới | -25 dòng | Thấp (xem C) | kế thừa workspace của Cargo; anchor YAML |
| P2-b | Liên kết store viết một lần, ở phía param | bổ sung (`param` của store thành tùy chọn khi suy ra được) | không đổi | -1 | Không | — |
| P2-c | `[app_env] param` tùy chọn khi chỉ có đúng một param `env_file` | bổ sung | không đổi | -1 | Không | — |
| P2-d | `[[smoke]] probe = "<probe http>"` | bổ sung | không đổi | -2 | Không | `[[http_service.checks]]` của Fly nằm dưới service của nó |
| P2-e | Bước `[[install]] activate = true` | bổ sung | không đổi | -1 | Không | — |
| P2-f | `operator = false` suy ra từ `image` hoặc các mount stage/bundle/generation | bổ sung (câu chữ trong spec) | không đổi | -3 | Không có khi chạy | — |
| P2-g | Đổi tên các cặp đụng nhau (`clear_hold`/`clears_hold`, `[drill] record`, key kebab `pre-change`) | đổi tên: cần cập nhật cả hai consumer và các fixture trước khi đóng băng, hoặc dùng alias | phá vỡ nếu không có alias | 0 | Ít nhầm hơn | — |
| P2-h | `validate --explain`: in các bước đã phân giải của từng operation và mọi task với defaults đã áp dụng | không | không | 0 | Review P2-a tốt hơn | `fly config show` in cấu hình đã phân giải (fly.io/docs/reference/configuration) |
| P3-1 | Tiền tố argv `cli` theo service (hoặc, **làm được ngay hôm nay**, một service profile có CLI làm entrypoint) | bổ sung | không đổi | 0 dòng, khoảng 330 ký tự | Argv không còn nguyên văn | `aliases` của Kamal; các service entrypoint của fx-pg |
| P3-2 | Một bảng `[lifecycle]` | schema 2 | phá vỡ | 0 | Trung tính | — (đụng ADR-0031) |
| P3-3 | Kế thừa task (`extends`) | bổ sung | không đổi | khoảng -25 | Tệ hơn: `effect`/`exit` bị ẩn | — (không khuyến nghị) |
| P3-4 | Định dạng khác (YAML, HCL, CUE, KDL) | schema 2 | phá vỡ | không đo được | Tệ hơn với định kiểu của YAML | — (không khuyến nghị) |
| P3-5 | Ngắt dòng bảng inline dài bằng TOML 1.1 | không | cần Python 3.15 trong Ingat và nâng `requires_ingat` | thẩm mỹ | Trung tính | toml.io v1.1.0 |
| P3-6 | Công cụ dựng khung `ingat manifest init` từ Compose | lệnh mới | không | 0 | Trung tính | `fly launch`, `kamal init`; ADR-0031:30 đã bác một bộ sinh 700 dòng |

**Manifest viết lại (phác thảo thiết kế, `proposed-ingat.toml.txt`).** P1-a cộng P2-a đến P2-f áp cho app này: **218
dòng** (hôm nay 257, dạng gọn 249), 172 dòng nội dung (211), 163 leaf key (205), 80 đường dẫn key (88). Nó là TOML hợp
lệ (bộ đếm đã parse được) nhưng **không** phải manifest schema 1 hợp lệ: `validate` đã ghim từ chối nó với exit 1
(`task_defaults: unknown key`, `smoke[0].probe: unknown key`, `install[1].activate: unknown key`, 34 dòng "is required"
cho các key task, smoke và liên kết đã lược, và việc nâng `requires_ingat`), đúng như dự kiến với một phác thảo. Những gì
không co lại: 14 key app-env, sáu task outbound (mỗi task một hợp đồng lệnh riêng), các bảng exit, hold và side effect,
các comment mang sự thật. **Ý kiến:** phần còn lại đó là bề mặt vận hành thật của app, vì vậy mức tiết kiệm tốt nhất
đạt được là khoảng 15%, không phải 50%.

**Những gì không làm.** Không file Ingat nào bị đổi; không đề xuất nào được chạy trên một Ingat đã sửa; phác thảo Fly và
Kamal không được deploy; bản nháp riêng của chủ dự án không được mở; các sự thật về HCL, KDL và CUE là theo trí nhớ.
Bằng chứng: [evidence/INGAT-MANIFEST-DESIGN/](evidence/INGAT-MANIFEST-DESIGN/commands.txt) (`commands.txt`, `validate-results.txt`,
`counts.txt`, `comparables-min.txt`, ba manifest đã đo, `proposed-ingat.toml.txt`, `count.py.txt`, `convert.py.txt`).

**Một việc tiếp theo.** Chủ dự án quyết định trong dự án Ingat có nhận P1-1 đến P1-4 ngay, và P2-a đến P2-h trước khi
schema đóng băng ở M2 hay không; repository này không đổi gì cho tới khi quyết định đó có trong một bản phát hành Ingat.
