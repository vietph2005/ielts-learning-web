Text writing preferences: "UTF-8"
form GetDuration
    sentence audioFile
endform

Read from file... 'audioFile$'
dur = Get total duration
writeInfoLine: fixed$(dur, 3)