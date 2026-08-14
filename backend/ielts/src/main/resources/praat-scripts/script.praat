form AnalyzeProsody
    sentence soundFile
    sentence textGridFile
    sentence outputFile
endform

writeInfoLine: "Praat script start running"

# Load Sound
Read from file: soundFile$
sound = selected("Sound")

# Tính Mean Intensity
selectObject: sound
To Intensity: 75, 0
meanIntensity = Get mean: 0, 0, "energy"
Remove

# Load TextGrid
Read from file: textGridFile$
textgrid = selected("TextGrid")

# Chọn tier số 1 (words)
selectObject: textgrid
totalDuration = Get total duration
numIntervals = Get number of intervals: 1  ; dùng trực tiếp tier số 1

wordCount = 0
pauseCount = 0
previousXmax = 0.0
totalPauseDuration = 0.0

for i from 1 to numIntervals
    text$ = Get label of interval: 1, i  ; tier số 1
    xmin = Get start time of interval: 1, i
    xmax = Get end time of interval: 1, i

    if text$ <> ""  ; nếu interval có chữ thì tính là một từ
        wordCount = wordCount + 1
    endif

    if i > 1
        pauseGap = xmin - previousXmax
        if pauseGap > 0.35
            pauseCount = pauseCount + 1
            totalPauseDuration = totalPauseDuration + pauseGap
        endif
    endif

    previousXmax = xmax
endfor

# Tính speech rate dùng thời gian nói thực (trừ pause)
activeSpeechDuration = totalDuration - totalPauseDuration
if activeSpeechDuration > 0
    speechRate = wordCount / activeSpeechDuration
else
    speechRate = 0
endif

# In kết quả ra Info window (debug)
writeInfoLine: "meanIntensity = ", meanIntensity
writeInfoLine: "pauseCount = ", pauseCount
writeInfoLine: "speechRate = ", speechRate
writeInfoLine: "totalDuration = ", totalDuration
writeInfoLine: "totalPauseDuration = ", totalPauseDuration
writeInfoLine: "wordCount = ", wordCount

# Ghi kết quả vào file output
writeFile: outputFile$, "meanIntensity=", string$(meanIntensity), newline$
appendFile: outputFile$, "pauseCount=", string$(pauseCount), newline$
appendFile: outputFile$, "speechRate=", string$(speechRate), newline$
appendFile: outputFile$, "totalDuration=", string$(totalDuration), newline$
appendFile: outputFile$, "totalPauseDuration=", string$(totalPauseDuration), newline$
appendFile: outputFile$, "wordCount=", string$(wordCount), newline$

writeInfoLine: "Praat script end"
