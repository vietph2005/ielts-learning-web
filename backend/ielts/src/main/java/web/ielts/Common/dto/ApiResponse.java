package web.ielts.Common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int statusCode;
    private boolean success;
    private String message;
    private T data;
    private String errorCode; // null on success, error code string on failure (Điều 2.1)

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .statusCode(200)
                .success(true)
                .message("Thành công")
                .data(data)
                .errorCode(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .statusCode(200)
                .success(true)
                .message(message)
                .data(data)
                .errorCode(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(int statusCode, T data, String message) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .success(true)
                .message(message)
                .data(data)
                .errorCode(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int statusCode, String message) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .success(false)
                .message(message)
                .data(null)
                .errorCode("ERROR_" + statusCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int statusCode, String errorCode, String message) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .success(false)
                .message(message)
                .data(null)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int statusCode, String errorCode, String message, T errorDetails) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .success(false)
                .message(message)
                .data(errorDetails)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int statusCode, String message, T errorDetails) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .success(false)
                .message(message)
                .data(errorDetails)
                .errorCode("ERROR_" + statusCode)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
