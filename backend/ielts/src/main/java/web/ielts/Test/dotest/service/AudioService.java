package web.ielts.Test.dotest.service;

import ws.schild.jave.*;
import org.springframework.web.multipart.MultipartFile;
import ws.schild.jave.encode.AudioAttributes;
import ws.schild.jave.encode.EncodingAttributes;

import java.io.File;
import java.io.IOException;

public class AudioService {
    public static File convertWebmToMp3(MultipartFile webmFile) throws IOException, EncoderException {
        File inputFile = File.createTempFile("input_", ".webm");
        webmFile.transferTo(inputFile);

        File outputFile = File.createTempFile("output_", ".mp3");

        AudioAttributes audio = new AudioAttributes();
        audio.setCodec("libmp3lame");
        audio.setBitRate(128000);
        audio.setChannels(2);
        audio.setSamplingRate(44100);

        EncodingAttributes attrs = new EncodingAttributes();
        attrs.setOutputFormat("mp3");
        attrs.setAudioAttributes(audio);

        Encoder encoder = new Encoder();
        encoder.encode(new MultimediaObject(inputFile), outputFile, attrs);

        inputFile.delete();

        return outputFile;
    }
}
