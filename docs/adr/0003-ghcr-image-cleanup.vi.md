# ADR 0003: job dọn định kỳ các phiên bản image cũ trên GHCR

Bản tiếng Anh là bản chuẩn. Trạng thái: đề xuất (nhánh phụ "Ingat deployability", việc tiếp theo là dọn GHCR; script, test và
workflow đã viết và kiểm offline; workflow chưa chạy trên GitHub và chưa xoá gì).

## Bối cảnh

- `.github/workflows/image.yml` đăng `ghcr.io/cdsemi/timesheet:<SHA commit đầy đủ>` cho commit đầu mút của mỗi lần push lên
  `main` (ADR 0002), nên package thêm khoảng năm đến tám phiên bản mỗi ngày. ADR 0002 để ngỏ việc lưu giữ.
- Ingat kéo image theo tag commit ở bước `prepare`, ghim image đã kéo và giữ nó trên máy. Ingat chỉ kéo lại image cũ khi bản
  cục bộ đã mất (`prune --images` thủ công hoặc về sau, thay ổ đĩa hay engine), cho drill, restore bằng đúng image release
  của bundle, rollback về commit cũ, máy mới hoặc restore chéo máy. Dịch vụ đang chạy dùng image cục bộ và không cần
  registry (Ingat ADR-0007, ADR-0026, LIFECYCLE; đọc từ tài liệu của Ingat, chưa quan sát qua một lần chạy).
- Chưa có git tag nào và `git.release_declared` là false; agent không tạo tag hay release (docs/08).
- Yêu cầu của chủ dự án (2026-10-22): một job định kỳ xoá các phiên bản cũ, nhưng chỉ xoá bản không phải release; muốn xoá
  bản release thì xoá bằng tay. Quyết định của chủ dự án (2026-10-22): mọi git tag đều đánh dấu một release; giữ 20 phiên
  bản mới nhất và mọi phiên bản dưới 30 ngày, không giới hạn số lượng xoá mỗi lần; lịch chạy xoá thật ngay từ lần chạy đầu.

## Quyết định

- **Release là một commit có git tag**, tên bất kỳ. Mỗi lần chạy, job đọc danh sách tag (`git ls-remote --tags`; tag chú thích
  được quy về commit), nên tag tạo sau khi image được đăng vẫn bảo vệ image đó kể từ lúc ấy. Thêm nữa, phiên bản mang bất
  kỳ tag nào không phải SHA commit 40 ký tự hex thường (ví dụ `v1.0.0` hay `keep-nas` gắn tay trên GHCR) không bao giờ bị xoá.
- **Cũ** nghĩa là cũ theo cả hai thước đo: phiên bản chỉ bị xoá khi không nằm trong `keep-newest` = 20 bản mới nhất (theo
  thời điểm tạo) và đã quá `keep-days` = 30 ngày (đúng 30 ngày thì giữ). Ngưỡng sàn cố định, không input hay biến nào hạ được:
  `keep-newest >= 10` và `keep-days >= 7`. Phiên bản có ngày tạo muộn hơn một ngày so với hiện tại, package rỗng, và kế
  hoạch sẽ xoá mọi phiên bản đều làm lần chạy dừng với exit 1 trước khi xoá bất cứ gì. Xoá từ cũ nhất trở đi. **Không có
  giới hạn số lượng xoá mỗi lần**; các ngưỡng sàn, các quy tắc trên và kiểm tra "không xoá hết" là giới hạn.
- **Phiên bản không có tag không bao giờ bị xoá.** Khi attestation tắt thì không nên có phiên bản nào như vậy; nếu bật sau,
  các child manifest không tag thuộc về một index có tag và không được xoá riêng. Thay đổi đó cần quyết định riêng.
- **Phần chọn là hàm thuần và test được offline.** `scripts/ghcr-cleanup.ts` chứa các quy tắc dưới dạng hàm thuần
  (`selectVersions`, `taggedCommits`, `parseVersions`), một lần kiểm bất biến độc lập thứ hai sẽ ném lỗi nếu kết quả vi phạm
  quy tắc, và một lớp mạng mỏng dùng `fetch` của Node với `GITHUB_TOKEN`; không action bên thứ ba và không `gh`. Node 24 chạy
  thẳng file `.ts`. `tests/integration/ghcr-cleanup.test.ts` chạy các quy tắc trên lịch sử giả và trên fixture đã lưu trong
  `tests/integration/fixtures/ghcr-cleanup/`, và lớp mạng với một GitHub giả.
- **Workflow `.github/workflows/image-cleanup.yml`**: hằng ngày lúc 03:17 UTC và `workflow_dispatch`. Job `plan`
  (`packages: read`) luôn chạy và in mỗi phiên bản một dòng KEEP hoặc DELETE kèm lý do. Job `apply` (`packages: write`) chạy
  sau nó cho mọi lần chạy theo lịch, còn lần chạy tay chỉ khi input `apply` là true; chạy tay mặc định là chạy thử. `--apply`
  bị từ chối khi đi kèm chế độ offline `--versions-file`. Quyền workflow là `contents: read`; checkout không lưu credential;
  input chỉ đến script qua `env`; mọi action được ghim bằng SHA commit đầy đủ. Nhóm `image-cleanup` xếp hàng các lần dọn và
  cố ý không dùng chung với `image.yml`: GitHub giữ một lần chạy chờ cho mỗi nhóm và huỷ lần chờ cũ hơn, làm mất image của
  một lần push ở giữa. Lần đăng thêm một phiên bản thuộc nhóm mới nhất (không bao giờ xoá được), job chỉ xoá id đã liệt kê,
  và đọc lại từng id ngay trước khi xoá (phiên bản đổi digest hoặc tag thì bỏ qua).
- **Dừng an toàn khi có gì bất thường.** Danh sách trả khác 200, xoá trả khác 204, chuyển hướng, quá 30 giây, một mục phiên
  bản sai dạng, thiếu `metadata.container.tags`, dòng danh sách tag không đọc được, thiếu token, hơn 3.000 phiên bản hoặc một
  tuỳ chọn dưới ngưỡng sàn đều kết thúc lần chạy bằng dòng `::error::` và exit 1 trước khi xoá thêm. Danh sách tag rỗng của một
  kho chưa có tag là hợp lệ; `git ls-remote` lỗi thì bước dừng.
- **Không dùng personal access token và không có secret.** Job dùng `GITHUB_TOKEN` của lần chạy. Nếu GitHub từ chối bằng 403,
  lần chạy thất bại và không xoá gì; việc xoá vẫn làm tay cho đến khi chủ dự án quyết định khác (xem Hệ quả).

## Sự thật và việc cần kiểm

Đánh dấu V (đọc trong tài liệu công khai hoặc mô tả OpenAPI của GitHub) hoặc C (cần kiểm ở lần chạy thật đầu tiên).

- V: `GET /orgs/{org}/packages/container/{package}/versions` nhận `state`, `per_page` (tối đa 100) và `page`; không có tổng
  số, nên script phân trang đến khi gặp trang ngắn.
- V: `DELETE .../versions/{id}` trả 204; `POST .../versions/{id}/restore` trả 204. Phiên bản đã xoá khôi phục được trong 30
  ngày nếu tên package và phiên bản vẫn còn trống. Xoá phiên bản của package công khai có hơn 5.000 lượt tải bị từ chối.
- V: tài liệu nói `GITHUB_TOKEN` xoá hoặc khôi phục được phiên bản package khi có quyền admin trên package, và kho có workflow
  đăng package mặc định được cấp vai trò admin.
- V: `GITHUB_TOKEN` bị giới hạn 1.000 yêu cầu mỗi giờ cho mỗi kho; một lần chạy gọi tối đa 30 lần liệt kê và hai lần gọi cho mỗi
  phiên bản xoá, lần lượt từng cái.
- C: chưa thấy câu trả lời thật cho package riêng tư này, kể cả việc `metadata.container.tags` có mặt (parser dừng an toàn
  nếu không).
- C: token có được phép xoá hay không. Mục OpenAPI của các endpoint đánh dấu chúng không bật cho GitHub App, mâu thuẫn với
  tài liệu ở trên. Chủ dự án xem được vai trò trên package ở phần cài đặt package, mục "Manage Actions access" (kho
  `CDSemi/timesheet` cần vai trò Admin).
- Chưa làm: không gọi GitHub có xác thực, không xoá gì, không chạy workflow này và không kiểm trên máy đích.

## Hệ quả

- **Việc của chủ dự án:** commit có bản sao lưu cần khôi phục được quá 30 ngày phải có git tag trước khi image của nó đủ 30
  ngày (`git tag <tên> <sha>` rồi `git push origin <tên>`). Tag tạo sau khi phiên bản đã bị xoá không đưa nó trở lại được; khi ấy
  chỉ còn endpoint khôi phục trong 30 ngày ở trên.
- 20 bản mới nhất và 30 ngày bao phủ các commit thường được triển khai và rollback. Job không thấy máy đích đang chạy commit
  nào và không được phép thấy; không có bảo vệ "đang triển khai" tự động.
- Sau khi xoá, mọi việc phải kéo lại image cũ (drill, restore hay rollback mà image đã mất khỏi máy, máy mới, restore chéo
  máy) sẽ lỗi "manifest unknown". Dịch vụ đang chạy và bản triển khai ngay trước vẫn chạy từ image cục bộ. Chạy lại workflow
  của commit cũ build lại tag với digest khác, nên digest đã ghi vẫn không kéo được.
- Image đầu tiên được đăng ngày 2026-10-22, nên đến khoảng 2026-11-21 chưa có phiên bản nào quá 30 ngày: các lần chạy theo
  lịch đầu tiên không có gì để xoá. Từ đó mỗi lần chạy có thể xoá hết các phiên bản đủ điều kiện cùng lúc.
- Nếu lần xoá thật đầu tiên trả 403, lần chạy thất bại và không xoá gì. Chủ dự án kiểm vai trò "Manage Actions access" của
  package cho kho này; personal access token loại classic với `read:packages` và `delete:packages` lưu thành environment
  secret là phương án dự phòng duy nhất có tài liệu và không được chọn ở đây (credential sống lâu).
- Công khai package không hoàn tác được (ADR 0002); phiên bản của package công khai có hơn 5.000 lượt tải thì job này không
  xoá được và lần chạy sẽ thất bại.

## Phương án đã xét

- **`actions/delete-package-versions`:** bị loại. Quy tắc giữ của nó là `min-versions-to-keep`, một regex trên tên phiên bản
  (với container là digest, không phải tag), `delete-only-untagged-versions` và `delete-only-pre-release-versions`; nó không
  diễn đạt được "giữ mọi phiên bản có commit mang git tag" nếu không có script dựng regex, không có chạy thử và phần chọn
  không test offline được.
- **GitHub Release, tag GHCR `vX.Y.Z` thêm hoặc tag `keep-*` là dấu hiệu release duy nhất:** Release vốn là một git tag; tag
  GHCR cần workflow release hoặc token ghi chạy tay. Chúng được tôn trọng bằng quy tắc cấu trúc sẵn có (mọi tag không phải
  commit giữ phiên bản lại) nhưng không bắt buộc.
- **Chỉ tag khớp `v*`:** chủ dự án không chọn; mọi tag là cách hiểu an toàn.
- **Chỉ đếm N bản mới nhất, hoặc chỉ theo tuổi:** bị loại. Chỉ đếm là cửa sổ ba đến bốn ngày; chỉ theo tuổi có thể xoá sạch
  trong một tháng ít commit.
- **Giới hạn số lượng xoá mỗi lần, và biến kho giữ lịch ở chế độ chạy thử đến khi bật:** có trong kế hoạch và chủ dự án từ
  chối; các ngưỡng sàn và kiểm tra ở trên thay thế chúng.
- **Dùng chung nhóm concurrency với `image.yml`:** bị loại, xem Quyết định.
