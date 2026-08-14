form Analyze Word Stress
    sentence wav_file
    sentence textGridFile
    sentence output_file
endform

# Read input files
sound = Read from file: wav_file$
textGrid = Read from file: textGridFile$

# Create intensity object
selectObject: sound
intensity = To Intensity: 100, 0, "yes"

# Tier numbers
wordsTier = 1
syllablesTier = 3

# Analysis parameters
minIntensity = 50

selectObject: textGrid
numWords = Get number of intervals: wordsTier

for word from 1 to numWords
    selectObject: textGrid
    wordLabel$ = Get label of interval: wordsTier, word

    if wordLabel$ != "" and wordLabel$ != "sp" and wordLabel$ != "sil"
        wordStart = Get start time of interval: wordsTier, word
        wordEnd = Get end time of interval: wordsTier, word

        # Get syllable count
        syllableInterval = Get interval at time: syllablesTier, wordStart
        syllableCount$ = Get label of interval: syllablesTier, syllableInterval
        syllableCount = number(syllableCount$)
        if syllableCount == undefined
            syllableCount = 1
        endif

        # Analyze syllables
        maxIntensity = 0
        stressedSyllable = 1
        syllableDuration = (wordEnd - wordStart)/syllableCount

        for s from 1 to syllableCount
            sStart = wordStart + (s-1)*syllableDuration
            sEnd = wordStart + s*syllableDuration

            selectObject: intensity
            sIntensity = Get maximum: sStart, sEnd, "Parabolic"

            if sIntensity > maxIntensity
                maxIntensity = sIntensity
                stressedSyllable = s
            endif
        endfor

        # Write result: chỉ wordLabel và stressedSyllable
        resultLine$ = wordLabel$ + ":" + string$(stressedSyllable)
        appendFileLine: output_file$, resultLine$
    endif
endfor

# Clean up
removeObject: sound, textGrid, intensity
