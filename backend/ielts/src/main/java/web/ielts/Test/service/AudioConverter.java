package web.ielts.Test.service;

import ws.schild.jave.*;
import java.io.File;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import ws.schild.jave.encode.AudioAttributes;
import ws.schild.jave.encode.EncodingAttributes;

public class AudioConverter {

    public static File convertWebmToMp3(MultipartFile webmFile) throws IOException, EncoderException {
        // 1. Tạo file tạm từ MultipartFile
        File inputFile = File.createTempFile("input_", ".webm");
        webmFile.transferTo(inputFile);

        // 2. Tạo file output MP3
        File outputFile = File.createTempFile("output_", ".mp3");

        // 3. Cấu hình audio
        AudioAttributes audio = new AudioAttributes();
        audio.setCodec("libmp3lame");    // Sử dụng codec MP3 LAME
        audio.setBitRate(128000);       // 128 kbps
        audio.setChannels(2);           // Stereo
        audio.setSamplingRate(44100);   // 44.1 kHz

        // 4. Cấu hình encoding
        EncodingAttributes attrs = new EncodingAttributes();
        attrs.setOutputFormat("mp3");
        attrs.setAudioAttributes(audio);

        // 5. Thực hiện chuyển đổi
        Encoder encoder = new Encoder();
        encoder.encode(new MultimediaObject(inputFile), outputFile, attrs);

        // 6. Xóa file input tạm
        inputFile.delete();

        return outputFile;
    }
}