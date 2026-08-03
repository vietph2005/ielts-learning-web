package web.ielts.Config;

import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.MessagingException;
import jakarta.mail.Transport;

import java.util.Properties;

public class GmailConfig {

    public static void main(String[] args) {
        final String username = "languages.center25@gmail.com"; // tài khoản Gmail
        final String appPassword = "ftmiukztsqbabbbt"; // App Password (16 ký tự)

        Properties prop = new Properties();
        prop.put("mail.smtp.auth", true);
        prop.put("mail.smtp.starttls.enable", "true");
        prop.put("mail.smtp.host", "smtp.gmail.com");
        prop.put("mail.smtp.port", "587");

        Session session = Session.getInstance(prop,
                new Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, appPassword);
                    }
                });

        try {
            Transport transport = session.getTransport("smtp");
            transport.connect();  // Thử kết nối SMTP
            System.out.println("✅ Kết nối SMTP thành công với Gmail");
            transport.close();
        } catch (MessagingException e) {
            System.out.println("❌ Kết nối SMTP thất bại:");
            e.printStackTrace();
        }
    }
}