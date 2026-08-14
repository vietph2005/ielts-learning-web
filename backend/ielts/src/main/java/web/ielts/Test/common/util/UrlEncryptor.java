package web.ielts.Test.common.util;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class UrlEncryptor {
    public static String encodeUrl(String url) {
        return Base64.getUrlEncoder().encodeToString(url.getBytes(StandardCharsets.UTF_8));
    }

    public static String decodeUrl(String encodedUrl) {
        byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedUrl);
        return new String(decodedBytes, StandardCharsets.UTF_8);
    }
}
