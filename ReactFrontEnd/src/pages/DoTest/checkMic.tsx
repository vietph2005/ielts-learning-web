"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Mic, ArrowRight } from "lucide-react"
import {DoTestSpeakingHeader} from "@/components/layout/doTest/DoTestSpeakingHeader";

export default function VoiceRecorder() {
    const { testId } = useParams<{ testId: string }>()
    const [recording, setRecording] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const [timeLeft, setTimeLeft] = useState(20)
    const navigate = useNavigate()

    // Countdown Timer
    useEffect(() => {
        if (recording && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (recording && timeLeft === 0) {
            stopRecording()
        }
    }, [recording, timeLeft])


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                const url = URL.createObjectURL(audioBlob)
                setAudioUrl(url)
            }

            mediaRecorder.start()
            setRecording(true)
            setTimeLeft(20) // Reset timer
        } catch (error) {
            console.error("Error starting recording:", error)
        }
    }

    const stopRecording = () => {
        if (recording) {
            mediaRecorderRef.current?.stop();
            setRecording(false);
        }
    };

    const handleTestMicrophone = async () => {
        if (recording) {
            stopRecording();
        } else {
            await startRecording(); // 👈 tránh warning
        }
    };

    const handleSkip = () => {
        console.log("Skipped microphone test")
        // Navigate to next test step
        navigate(`/checkMic/${testId}`)
    }

    return (
        <div className="min-h-screen bg-white">
            <DoTestSpeakingHeader initialTime={0} />

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-gray-50 rounded-3xl p-12 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-12">TEST YOUR MICROPHONE</h1>

                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`w-20 h-20 rounded-full ${recording ? "bg-pink-400" : "bg-white shadow-lg hover:shadow-xl"} transition-shadow`}
                                onClick={handleTestMicrophone}
                            >
                                <Mic className={`w-8 h-8 ${recording ? "text-white" : "text-pink-400"}`} />
                            </Button>
                        </div>

                        <p className="text-gray-600 mb-8 text-lg">
                            {recording ? `Recording... ${timeLeft} seconds left` : "Press the button to start recording"}
                        </p>


                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={handleTestMicrophone}
                                className="bg-pink-400 hover:bg-pink-500 text-white px-8 py-3 rounded-lg font-medium"
                            >
                                {recording ? "Stop Recording" : "Test Microphone"}
                            </Button>

                            <Button
                                onClick={handleSkip}
                                variant="outline"
                                className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600 px-8 py-3 rounded-lg font-medium"
                            >
                                Skip
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {audioUrl && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-slate-700 mb-2">Preview:</h3>
                                <audio controls src={audioUrl} className="w-full rounded-lg"></audio>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
