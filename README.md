<!-- PeaceD OPC - Nguyen Huu Dung -->
<h1 align="center">
  <img src="resources/build/icon.png" alt="PeaceD OPC" width="64" valign="middle" /> PeaceD OPC
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/author-Nguy%E1%BB%85n%20H%E1%BB%AFu%20D%C5%A9ng-blue?style=flat" alt="Author: Nguyễn Hữu Dũng" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Supported platforms: macOS, Windows, and Linux" />
</p>

<p align="center">
  <strong>PeaceD OPC - Agent Organization & Orchestration Platform.</strong><br/>
  Nền tảng quản trị và điều phối AI Coding Agents đa luồng — Phát triển & Hoàn thiện bởi <strong>Nguyễn Hữu Dũng</strong>.<br/>
  Vận hành song song các tác nhân AI (Codex, Claude Code, OpenCode, Antigravity,...) trong từng không gian làm việc (Worktree) độc lập, theo dõi và quản lý tập trung trên một giao diện thống nhất.
</p>

<p align="center">
  <img src="docs/assets/readme-hero.jpg" alt="PeaceD OPC desktop app running agents in parallel worktrees" width="960" />
</p>

---

## 🌟 Tổng Quan Dự Án (Project Overview)

**PeaceD OPC** là một môi trường phát triển tích hợp (IDE / Orchestration Platform) thế hệ mới, được thiết kế chuyên biệt để giải quyết bài toán làm việc với nhiều AI Coding Agent cùng lúc:
- **Tách biệt không gian thực thi**: Mỗi tác nhân AI làm việc trên một Git Worktree riêng biệt, không xung đột mã nguồn.
- **Tối ưu hóa tài nguyên & quan sát**: Giao diện tập trung hiển thị trạng thái, tiến độ và mức độ tiêu thụ token của từng Agent.
- **Tương tác linh hoạt**: Hỗ trợ đầy đủ Terminal đa luồng hiệu năng cao, điều khiển từ xa qua SSH, và ứng dụng đồng hành trên thiết bị di động (Mobile Companion).

---

## 🚀 Tính Năng Nổi Bật (Key Features)

<table>
<tr>
<td width="50%" valign="middle">

### 📱 Mobile Companion

Giám sát và định hướng các Agent trực tiếp từ điện thoại — nhận thông báo khi Agent hoàn thành tác vụ và gửi chỉ dẫn bổ sung mọi lúc, mọi nơi.

</td>
<td width="50%">
  <picture><source srcset="docs/assets/feature-wall/mobile-companion-app-showcase.gif" type="image/gif"><img src="docs/assets/feature-wall/mobile-companion-app-showcase.jpg" alt="PeaceD OPC desktop with mobile companion" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 🌿 Parallel Worktrees

Phân bổ cùng lúc một yêu cầu cho nhiều Agent trên các Git Worktree độc lập — so sánh kết quả và chọn phiên bản tối ưu nhất để merge vào nhánh chính.

</td>
<td width="50%">
  <picture><source srcset="docs/site/public/docs/tab-split.gif" type="image/gif"><img src="docs/site/public/docs/posters/tab-split.jpg" alt="Parallel worktree orchestration" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### ⚡ Terminal Splits

Hệ thống Terminal tối tân với khả năng tăng tốc phần cứng WebGL, chia màn hình không giới hạn, và lưu trữ lịch sử lệnh bền vững qua các lần khởi động.

</td>
<td width="50%">
  <picture><source srcset="resources/onboarding/feature-wall/tile-02.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-02.poster.jpg" alt="Terminal splits" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 🎨 Design Mode

Chọn bất kỳ phần tử giao diện nào trên cửa sổ Chromium tích hợp để trích xuất HTML, CSS và ảnh chụp màn hình tương ứng gửi thẳng vào prompt của Agent.

</td>
<td width="50%">
  <picture><source srcset="docs/site/public/docs/orca-design-mode.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-05.poster.jpg" alt="Embedded browser and Design Mode" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 🐙 Tích Hợp GitHub & Linear

Xem trực tiếp danh sách Pull Requests, Issues và bảng công việc ngay trong ứng dụng — khởi tạo Worktree từ một task và review mã nguồn mà không cần chuyển đổi ứng dụng.

</td>
<td width="50%">
  <picture><source srcset="resources/onboarding/feature-wall/tile-03.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-03.poster.jpg" alt="GitHub and Linear task workflows in PeaceD OPC" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 🌐 SSH Remote Worktrees

Thực thi các tác nhân AI trên máy chủ từ xa cấu hình mạnh với khả năng biên tập file, Git và Terminal toàn diện — tự động kết nối lại và chuyển tiếp cổng mạng (port forwarding).

</td>
<td width="50%">
  <picture><source srcset="resources/onboarding/feature-wall/tile-06.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-06.poster.jpg" alt="Remote worktrees over SSH" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### ✍️ Chú Thích Diff AI (Annotate AI Diffs)

Bình luận trực tiếp trên từng dòng code được Agent sinh ra — xem xét, chỉnh sửa và commit nhanh chóng ngay trên giao diện PeaceD OPC.

</td>
<td width="50%">
  <picture><source srcset="docs/site/public/docs/annotate-ai-diff.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-08.poster.jpg" alt="Annotate AI-generated diffs" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 📂 Kéo Thả File &amp; Ảnh

Trình soạn thảo trực quan hỗ trợ tính năng tự động lưu — cho phép kéo thả file hoặc hình ảnh trực tiếp vào khung nhập liệu của Agent.

</td>
<td width="50%">
  <picture><source srcset="resources/onboarding/feature-wall/tile-07.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-07.poster.jpg" alt="Drag files and images into an agent prompt" width="100%" /></picture>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 💻 PeaceD OPC CLI

Tự động hóa mọi luồng công việc thông qua giao diện dòng lệnh mạnh mẽ — hỗ trợ quản lý worktree, chụp snapshot và tương tác giao diện lập trình.

</td>
<td width="50%">
  <picture><source srcset="resources/onboarding/feature-wall/tile-09.gif" type="image/gif"><img src="resources/onboarding/feature-wall/tile-09.poster.jpg" alt="Script PeaceD OPC from the CLI" width="100%" /></picture>
</td>
</tr>
</table>

---

## 🤖 Danh Sách Agent Được Hỗ Trợ (Supported Agents)

PeaceD OPC hỗ trợ **mọi CLI Agent** hoạt động trên môi trường dòng lệnh:

<p>
  <kbd><img src="docs/assets/claude-logo.svg" alt="Claude Code logo" width="16" valign="middle" /> Claude Code</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=openai.com&sz=64" alt="Codex logo" width="16" valign="middle" /> Codex</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=x.ai&sz=64" alt="Grok logo" width="16" valign="middle" /> Grok</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=cursor.com&sz=64" alt="Cursor logo" width="16" valign="middle" /> Cursor</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=github.com&sz=64" alt="GitHub Copilot logo" width="16" valign="middle" /> GitHub Copilot</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=opencode.ai&sz=64" alt="OpenCode logo" width="16" valign="middle" /> OpenCode</kbd> &nbsp;
  <kbd><img src="resources/openclaude-logo.png" alt="OpenClaude logo" width="16" valign="middle" /> OpenClaude</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=antigravity.google&sz=64" alt="Antigravity logo" width="16" valign="middle" /> Antigravity</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=nousresearch.com&sz=64" alt="Hermes Agent logo" width="16" valign="middle" /> Hermes Agent</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=devin.ai&sz=64" alt="Devin logo" width="16" valign="middle" /> Devin</kbd> &nbsp;
  <kbd><img src="docs/assets/droid-logo.svg" alt="Droid logo" width="16" valign="middle" /> Droid</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=moonshot.cn&sz=64" alt="Kimi logo" width="16" valign="middle" /> Kimi</kbd> &nbsp;
  <kbd><img src="https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=64" alt="Qwen Code logo" width="16" valign="middle" /> Qwen Code</kbd> &nbsp;
  <kbd>+ Bất kỳ CLI Agent nào khác</kbd>
</p>

---

## 🛠️ Hướng Dẫn Cài Đặt & Phát Triển (Setup & Development)

### Yêu Cầu Hệ Thống (Prerequisites)
- **Node.js**: Phiên bản 20+ trở lên.
- **pnpm**: Trình quản lý gói chính (khuyến nghị `pnpm >= 9.x`).
- **Git**: Phiên bản 2.25 trở lên.

### Các Bước Khởi Chạy (Quick Start)

1. **Clone mã nguồn dự án:**
   ```bash
   git clone https://github.com/dungxoan31-creator/PeaceD_OPC.git
   cd PeaceD_OPC
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   pnpm install
   ```

3. **Chạy ứng dụng trong chế độ Development:**
   ```bash
   pnpm dev
   ```

4. **Đóng gói ứng dụng (Build Release):**
   ```bash
   # Build cho Windows
   pnpm build:win

   # Build cho macOS
   pnpm build:mac

   # Build cho Linux
   pnpm build:linux
   ```

---

## 👤 Thông Tin Tác Giả & Bản Quyền (Author & Licensing)

- **Tác giả & Nhà phát triển duy trì (Lead Developer & Maintainer)**: **Nguyễn Hữu Dũng**
- **GitHub**: [@dungxoan31-creator](https://github.com/dungxoan31-creator)
- **Dự án**: PeaceD OPC - Hệ thống điều phối AI Coding Agent.

### Giấy phép (License)
Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
Mọi quyền tùy biến, mở rộng và phát triển phiên bản **PeaceD OPC** thuộc về **Nguyễn Hữu Dũng**.
(Kế thừa và tuân thủ các điều khoản bản quyền gốc từ dự án nền tảng mã nguồn mở).
