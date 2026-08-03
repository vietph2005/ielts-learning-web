import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Giải mã một chuỗi Base64 URL-encoded (giống Java UrlEncryptor.encodeUrl)
 * và trả về chuỗi đã giải mã.
 */
export function urlDecrypt(encoded: string): string {
  // Replace URL-safe chars and pad if needed
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  try {
    return decodeURIComponent(
      Array.prototype.map.call(atob(base64), (c: string) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join("")
    );
  } catch (e) {
    return atob(base64);
  }
}

/**
 * Kiểm tra số lượng từ trong chuỗi input có vượt quá giới hạn không.
 * @param text Chuỗi cần kiểm tra
 * @param maxWords Số lượng từ tối đa cho phép
 * @returns { valid: boolean, wordCount: number, error?: string }
 */
export function validateWordLimit(text: string, maxWords: number) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > maxWords) {
    return {
      valid: false,
      wordCount,
      error: `You can enter up to ${maxWords} words only (current: ${wordCount} words)!`
    };
  }
  return { valid: true, wordCount };
}

/**
 * Kiểm tra số lượng ký tự trong chuỗi input có vượt quá giới hạn không.
 * @param text Chuỗi cần kiểm tra
 * @param maxChars Số ký tự tối đa cho phép
 * @returns { valid: boolean, charCount: number, error?: string }
 */
export function validateCharLimit(text: string, maxChars: number) {
  const charCount = text.length;
  if (charCount > maxChars) {
    return {
      valid: false,
      charCount,
      error: `You can enter up to ${maxChars} characters only (current: ${charCount} characters)!`
    };
  }
  return { valid: true, charCount };
}
