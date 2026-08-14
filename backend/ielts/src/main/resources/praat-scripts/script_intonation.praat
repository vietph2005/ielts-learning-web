form Analyze Intensity and Emphasized Words
    sentence wav_file
    sentence textGridFile
    sentence output_file
endform

sound = Read from file: wav_file$
textGrid = Read from file: textGridFile$

selectObject: sound
intensity = To Intensity: 75, 0.0, "yes"

; Tier numbers (fixed numbers)
sentencesTier = 2
wordsTier = 1

selectObject: textGrid
numSentences = Get number of intervals: sentencesTier
writeInfoLine: "Num sentences: ", numSentences

threshold = 50.0
step = 0.01

for i to numSentences
     selectObject: textGrid
     label$ = Get label of interval: sentencesTier, i
     if label$ <> ""
         selectObject: textGrid
         start = Get start time of interval: sentencesTier, i
         selectObject: textGrid
         end   = Get end time of interval: sentencesTier, i

         selectObject: intensity

        ; Find activeStart
        activeStart = start
        found = 0
        t = start
        while t <= end and found = 0
            value = Get value at time: t, "linear"
            if value > threshold
                activeStart = t
                found = 1
            endif
            t = t + step
        endwhile

        ; Find activeEnd
        activeEnd = end
        found = 0
        t = end
        while t >= start and found = 0
            value = Get value at time: t, "linear"
            if value > threshold
                activeEnd = t
                found = 1
            endif
            t = t - step
        endwhile

        if activeEnd - activeStart > 0.05
            ; Calculate sentence mean intensity
            sumIntensity = 0
            numSamples = 0
            t = activeStart
            while t <= activeEnd
                value = Get value at time: t, "linear"
                sumIntensity = sumIntensity + value
                numSamples = numSamples + 1
                t = t + step
            endwhile
            meanIntensity = sumIntensity / numSamples

            ; Write sentence info
            appendFileLine: output_file$, "Sentence ", string$(i), " | Start: ", fixed$(start,3), "s | End: ", fixed$(end,3), "s | Mean Intensity: ", fixed$(meanIntensity,2), " dB"

            ; Process each word in "words" tier
            selectObject: textGrid
            numWords = Get number of intervals: wordsTier
            for j to numWords
            selectObject: textGrid
                word$ = Get label of interval: wordsTier, j
                wordStart = Get start time of interval: wordsTier, j
                wordEnd   = Get end time of interval: wordsTier, j

                if word$ <> "" and wordStart >= activeStart and wordEnd <= activeEnd
                    ; Calculate word mean intensity
                    sumWordIntensity = 0
                    numWordSamples = 0
                    t = wordStart
                    while t <= wordEnd
                        selectObject: intensity
                        value = Get value at time: t, "linear"
                        sumWordIntensity = sumWordIntensity + value
                        numWordSamples = numWordSamples + 1
                        t = t + step
                    endwhile

                    meanWordIntensity = sumWordIntensity / numWordSamples

                    ; Compare with sentence mean
                    if meanWordIntensity > meanIntensity
                        appendFileLine: output_file$, "    Emphasized word: '", word$, "' | ", fixed$(meanWordIntensity,2), " dB"
                    endif
                endif
            endfor
        else
            writeInfoLine: "No valid active speech in sentence ", i
        endif
    endif
endfor

removeObject: sound, textGrid, intensity
