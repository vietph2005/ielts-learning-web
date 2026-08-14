# 🏛️ PROJECT CONSTITUTION & ENGINEERING GOVERNANCE

> **Tuyên ngôn:** Tài liệu này là kim chỉ nam bất biến cho toàn bộ thành viên trong dự án. Mọi Pull Request (PR), đoạn mã hoặc quyết định kỹ thuật vi phạm các điều khoản dưới đây đều **không được phép tích hợp vào hệ thống**.

---

## Điều 1: Ranh Giới Phân Tầng & Trách Nhiệm (Layer Isolation)
1. **Luồng dữ liệu một chiều:** Mã nguồn bắt buộc tuân theo luồng `Client -> Controller -> Service -> Repository -> Database`. Tuyệt đối không gọi ngược, không gọi nhảy cóc (Controller không được phép gọi trực tiếp Repository).
2. **Phân định rõ trách nhiệm (Single Responsibility):**
    - **Controller:** Chỉ tiếp nhận HTTP Request, kích hoạt validate đầu vào (`@Valid`), điều hướng sang Service và trả về định dạng chuẩn. Không chứa logic nghiệp vụ, không truy vấn database, không `try-catch` thủ công.
    - **Service:** Là nơi duy nhất chứa business logic, điều phối luồng dữ liệu, quản lý giao dịch (`@Transactional`) và ném Custom Exception khi vi phạm luật nghiệp vụ.
    - **Repository:** Chỉ đảm nhận truy vấn dữ liệu. Bắt buộc tối ưu câu lệnh (chống triệt để vấn đề N+1 Query).
3. **Cách ly DTO tuyệt đối (DTO Isolation):**
    - Không bao giờ truyền Entity trực tiếp ra ngoài Controller hoặc trả về cho Client.
    - Bắt buộc dùng `*RequestDTO` cho đầu vào và `*ResponseDTO` cho đầu ra.
    - Mọi chuyển đổi Entity $\leftrightarrow$ DTO phải qua công cụ Mapper chuyên biệt (MapStruct/Converter), không set thủ công rải rác.

---

## Điều 2: Hợp Đồng Giao Tiếp & Xử Lý Lỗi (API & Exception Handling)
1. **Chuẩn hóa phản hồi (Unified Envelope):** Tất cả endpoint API bắt buộc phải trả về một cấu trúc phản hồi thống nhất:
    - `statusCode`: Mã HTTP status chuẩn (200, 201, 400, 404, 500,...).
    - `success`: Boolean xác định trạng thái thành công/thất bại (`true` | `false`).
    - `message`: Thông báo ngắn gọn, rõ ràng.
    - `data`: Payload dữ liệu chính (hoặc `null` nếu có lỗi).
    - `errorCode`: Mã định danh lỗi domain (hoặc `null` nếu thành công).
    - `timestamp`: Thời gian phản hồi theo chuẩn ISO-8601 từ Server.
2. **Xử lý ngoại lệ tập trung (Global Exception Handling):**
    - Tuyệt đối không nuốt lỗi (silent catch).
    - Mọi exception phải được bắt tập trung tại tầng xử lý ngoại lệ toàn cục (`@RestControllerAdvice`).
    - Tuyệt đối không để lộ Stack Trace, cú pháp SQL hay chi tiết nội bộ của hạ tầng cho Client.

---

## Điều 3: Kỷ Luật Kiểm Thử & Kiểm Soát Chất Lượng (Testing & Quality Gates)
1. **Phân định phạm vi kiểm thử:**
    - **Unit Test (Bắt buộc cho mọi tính năng mới):** Áp dụng cho 100% Service layer và Utility classes. Sử dụng JUnit 5 & Mockito, mock toàn bộ database/external calls để đảm bảo tốc độ thực thi nhanh.
    - **Integration Test:** Áp dụng có chọn lọc cho các luồng API Controller trọng yếu (sử dụng `MockMvc`) và các Custom Queries phức tạp.
2. **Chỉ số Test Coverage tối thiểu 80%:**
    - Mã nguồn tầng nghiệp vụ (Service layer) bắt buộc đạt **Line/Branch Coverage $\ge$ 80%** (đo bằng Unit Test thông qua JaCoCo) trước khi merge.
3. **Quy tắc khi sửa đổi & Refactoring:**
    - Khi chỉnh sửa mã nguồn hoặc sửa lỗi (Bug Fixing), bắt buộc phải chạy lại toàn bộ test suite (`mvn clean test` / `gradle test`).
    - Mọi bài test thất bại (Broken Tests) phải được khắc phục hoàn toàn trước khi commit/merge.
4. **Coding Convention & Clean Code:**
    - Mã nguồn phải vượt qua toàn bộ công cụ Linter/Formatter tự động được quy định trong dự án trước khi tạo Pull Request.
    - Bảo toàn tính tương thích (Zero Breaking Changes): Không tự ý xóa field, đổi tên field hoặc thay đổi kiểu dữ liệu của các API đã công bố khi chưa có lộ trình rõ ràng.