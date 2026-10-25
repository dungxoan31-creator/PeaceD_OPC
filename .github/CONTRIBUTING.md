<!-- PeaceD OPC Contribution & Development Guide -->
# Quy Chuẩn Phát Triển & Đóng Góp — PeaceD OPC

Chào mừng bạn đến với quy chuẩn phát triển và hướng dẫn đóng góp kỹ thuật cho nền tảng **PeaceD OPC**, đề án nghiên cứu và phát triển bởi **Nguyễn Hữu Dũng** (MSV: 11235559).

---

## 📌 Nguyên Tắc Cốt Lõi (Core Principles)

- **Mục tiêu hệ thống**: PeaceD OPC hướng tới việc tối ưu hóa hiệu suất làm việc với đa tác nhân trí tuệ nhân tạo (AI Coding Agents) trên kiến trúc phân lập không gian làm việc song song (Git Worktrees).
- **Hỗ trợ đa nền tảng**: Toàn bộ mã nguồn phải tương thích và hoạt động ổn định trên cả ba hệ điều hành: **Windows**, **macOS**, và **Linux**.
- **Tính độc lập của môi trường thực thi**: Hệ thống hỗ trợ cả môi trường cục bộ (Local), máy chủ phân tán từ xa (Remote Server qua SSH) và ứng dụng điều khiển di động (Mobile). Các hàm xử lý đường dẫn, tiến trình và luồng dữ liệu phải đảm bảo tính trừu tượng hóa cao.
- **Tương thích mở với hệ sinh thái Agent**: Kiến trúc của PeaceD OPC giữ vai trò là một Agent Aggregator & Orchestrator trung lập, cho phép tích hợp mọi CLI Agent hiện hành.

---

## 🛠️ Thiết Lập Môi Trường Phát Triển Cục Bộ (Local Setup)

1. Cài đặt các gói phụ thuộc:
   ```bash
   pnpm install
   ```

2. Khởi chạy ứng dụng trong môi trường phát triển:
   ```bash
   pnpm dev
   ```

3. Kiểm tra chất lượng mã nguồn và bộ kiểm thử tự động:
   ```bash
   pnpm lint
   pnpm tc
   pnpm test
   ```

---

## 🌿 Quy Chuẩn Nhánh & Mã Nguồn (Branching & Coding Standards)

- **Đặt tên nhánh**: Sử dụng tiền tố rõ ràng phản ánh đúng nội dung thực hiện:
  - `feat/feature-name`: Thêm tính năng hoặc phân hệ mới.
  - `fix/bug-description`: Sửa lỗi kỹ thuật hoặc tối ưu hành vi.
  - `refactor/scope`: Tái cấu trúc mã nguồn mà không làm thay đổi hành vi logic.
  - `docs/topic`: Cập nhật tài liệu kỹ thuật hoặc báo cáo đề án.

- **Định dạng & Kiểu dữ liệu**:
  - Toàn bộ định nghĩa kiểu dữ liệu của dự án phải được viết trong các tệp `.ts` để đảm bảo trình biên dịch TypeScript kiểm soát lỗi chặt chẽ.
  - Tuân thủ hệ thống Design System và bảng mã màu thống nhất trong `src/renderer/src/assets/main.css`.

---

## 👤 Chủ Nhiệm Đề Án & Quản Trị Hệ Thống (Project Lead & Maintainer)

- **Sinh viên thực hiện**: **Nguyễn Hữu Dũng**
- **Mã sinh viên**: **11235559**
- **Chuyên ngành**: Hệ Thống Thông Tin Quản Lý (MIS)
- **Repository chính thức**: [https://github.com/dungxoan31-creator/PeaceD_OPC](https://github.com/dungxoan31-creator/PeaceD_OPC)
- Toàn bộ bản quyền kiến trúc và giải pháp thuộc về **Nguyễn Hữu Dũng**.
