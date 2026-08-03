# Hệ thống Error Handling

## Tổng quan

Hệ thống error handling được thiết kế để xử lý các lỗi một cách graceful và cung cấp trải nghiệm người dùng tốt hơn.

## Các thành phần

### 1. ErrorPage (`/error`)
- **Đường dẫn**: `/error`
- **Mục đích**: Hiển thị khi có lỗi xảy ra trong ứng dụng
- **Tính năng**:
  - Nút "Quay lại trang trước" (sử dụng `navigate(-1)`)
  - Nút "Tải lại trang" (reload page)
  - Nút "Về trang chủ" (navigate to `/`)
  - Liên kết đến trang hỗ trợ

### 2. NotFoundPage (`*`)
- **Đường dẫn**: Catch-all route cho tất cả URL không tồn tại
- **Mục đích**: Hiển thị khi người dùng truy cập URL không hợp lệ
- **Tính năng**:
  - Hiển thị mã lỗi 404
  - Nút "Quay lại trang trước"
  - Nút "Về trang chủ"
  - Nút "Trung tâm trợ giúp"
  - Hiển thị URL hiện tại

### 3. ErrorBoundary
- **Vị trí**: Wrap toàn bộ ứng dụng trong `App.tsx`
- **Mục đích**: Bắt các lỗi JavaScript và React
- **Tính năng**:
  - Tự động chuyển hướng đến `/error` khi có lỗi
  - Hiển thị loading spinner trong khi chuyển hướng
  - Log lỗi ra console để debug

### 4. useErrorHandler Hook
- **Vị trí**: `src/hooks/useErrorHandler.ts`
- **Mục đích**: Custom hook để xử lý lỗi trong components
- **Tính năng**:
  - `handleError(error, context)`: Xử lý lỗi và chuyển hướng
  - `handleAsyncError(asyncFunction, context)`: Wrap async functions với error handling

## Cách sử dụng

### Trong Components

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleAsyncError } = useErrorHandler();

  // Xử lý lỗi thông thường
  const handleSomeAction = () => {
    try {
      // Some code that might throw error
    } catch (error) {
      handleError(error as Error, 'MyComponent');
    }
  };

  // Xử lý async function
  const fetchData = async () => {
    const result = await handleAsyncError(
      async () => {
        const response = await fetch('/api/data');
        return response.json();
      },
      'fetchData'
    );
    
    if (result) {
      // Handle success
    }
  };

  return (
    // Component JSX
  );
};
```

### Manual Navigation

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleError = () => {
    navigate('/error');
  };

  const handleNotFound = () => {
    navigate('/404'); // Sẽ tự động chuyển đến NotFoundPage
  };
};
```

## Thiết kế UI

### ErrorPage
- Gradient background từ đỏ nhạt
- Icon lỗi với gradient đỏ
- 3 nút action với màu sắc khác nhau
- Responsive design
- Hover effects và animations

### NotFoundPage
- Gradient background từ xanh đến tím
- Icon search với gradient xanh-tím
- Số 404 lớn và nổi bật
- 3 nút action với màu sắc khác nhau
- Hiển thị URL hiện tại

## Cấu hình

### Routes trong App.tsx
```typescript
// Error Page
<Route path="/error" element={<ErrorPage />} />

// 404 Not Found (Catch-all)
<Route path="*" element={<NotFoundPage />} />
```

### ErrorBoundary Wrapper
```typescript
<ErrorBoundary>
  <AuthProvider>
    <Router>
      {/* All routes */}
    </Router>
  </AuthProvider>
</ErrorBoundary>
```

## Best Practices

1. **Luôn sử dụng ErrorBoundary** để bắt lỗi toàn cục
2. **Sử dụng useErrorHandler** cho các async operations
3. **Log lỗi** để debug và monitoring
4. **Cung cấp fallback UI** khi có lỗi
5. **Không để lỗi crash** toàn bộ ứng dụng

## Monitoring và Debug

- Tất cả lỗi được log ra console với context và timestamp
- ErrorBoundary tự động chuyển hướng sau 1 giây
- Có thể thêm error reporting service (Sentry, LogRocket, etc.)

## Tùy chỉnh

### Thay đổi thời gian chuyển hướng
```typescript
// Trong ErrorBoundary.tsx
setTimeout(() => {
  window.location.href = '/error';
}, 2000); // Thay đổi từ 1000ms thành 2000ms
```

### Thêm error reporting service
```typescript
// Trong useErrorHandler.ts
const handleError = (error: Error, context?: string) => {
  // Log to console
  console.error(`Error in ${context || 'application'}:`, error);
  
  // Send to error reporting service
  // Sentry.captureException(error);
  
  // Navigate to error page
  navigate('/error');
};
``` 