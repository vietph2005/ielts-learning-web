package web.ielts.Config;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailForgetPasswordConfig {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String token) {
        String subject = "Yêu cầu đặt lại mật khẩu";
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;

        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <style>" +
                "    body { margin: 0; padding: 0; background-color: #f4f7fb; }" +
                "    .container {" +
                "      max-width: 600px;" +
                "      margin: 20px auto;" +
                "      font-family: 'Helvetica Neue', Arial, sans-serif;" +
                "      background-color: #ffffff;" +
                "      border-radius: 12px;" +
                "      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);" +
                "      overflow: hidden;" +
                "    }" +
                "    .header {" +
                "      background-color: #2E7D32;" +
                "      padding: 30px;" +
                "      text-align: center;" +
                "      color: #ffffff;" +
                "    }" +
                "    .header h2 {" +
                "      margin: 0;" +
                "      font-size: 28px;" +
                "      font-weight: 700;" +
                "    }" +
                "    .content {" +
                "      padding: 30px;" +
                "      color: #333333;" +
                "      line-height: 1.6;" +
                "    }" +
                "    .content p {" +
                "      font-size: 16px;" +
                "      margin: 0 0 20px;" +
                "    }" +
                "    .button {" +
                "      display: inline-block;" +
                "      padding: 15px 30px;" +
                "      background-color: #2E7D32;" +
                "      color: #ffffff;" +
                "      text-decoration: none;" +
                "      border-radius: 50px;" +
                "      font-size: 18px;" +
                "      font-weight: 600;" +
                "      transition: transform 0.2s, box-shadow 0.2s;" +
                "    }" +
                "    .button:hover {" +
                "      transform: translateY(-2px);" +
                "      box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);" +
                "    }" +
                "    .footer {" +
                "      background-color: #f4f7fb;" +
                "      padding: 20px;" +
                "      text-align: center;" +
                "      font-size: 14px;" +
                "      color: #666666;" +
                "    }" +
                "    .footer a {" +
                "      color: #2E7D32;" +
                "      text-decoration: none;" +
                "    }" +
                "    @media only screen and (max-width: 600px) {" +
                "      .container { margin: 10px; }" +
                "      .header { padding: 20px; }" +
                "      .header h2 { font-size: 24px; }" +
                "      .content { padding: 20px; }" +
                "      .button { padding: 12px 24px; font-size: 16px; }" +
                "    }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h2>Khôi phục mật khẩu tài khoản</h2>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>" +
                "      <p>Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới:</p>" +
                "      <p style='text-align: center; margin: 30px 0;'>" +
                "        <a href='" + resetUrl + "' class='button' style='color: #ffffff !important;'>Đặt lại mật khẩu</a>" +
                "      </p>" +
                "      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      © 2025 <a href='https://www.languages.io.vn'>Language IELTS</a>. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // HTML content

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace(); // hoặc dùng logger nếu cần
        }
    }
}
