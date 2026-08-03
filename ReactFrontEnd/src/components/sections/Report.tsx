import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, FileText } from "lucide-react"
import * as React from "react"
import { customFetch } from "@/components/sections/customFetch"
import { useAuth } from "@/contexts/AuthContext"
import { validateWordLimit, validateCharLimit } from "@/lib/utils"

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Report({ isOpen, onClose }: FeedbackModalProps) {
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [category, setCategory] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const MAX_WORDS = 100;
    const MAX_CHARS = 1000;
    const MAX_SUBJECT_WORDS = 10;
    const MAX_SUBJECT_CHARS = 100;

    const [errorSubject, setErrorSubject] = useState("");
    const [subjectWordCount, setSubjectWordCount] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await customFetch(`${API_URL}/api/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    username: user?.username,
                    subject,
                    message,
                    createdAt: new Date().toISOString()
                })
            })

            if (!response.ok) {
                throw new Error("Failed to submit feedback")
            }

            setIsSubmitted(true)

            setTimeout(() => {
                setIsSubmitted(false)
                onClose()
            }, 2000)
        } catch (error) {
            console.error("Error submitting feedback:", error)
            alert("An error occurred while sending feedback.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setIsSubmitted(false)
        onClose()
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);
        const wordResult = validateWordLimit(value, MAX_WORDS);
        const charResult = validateCharLimit(value, MAX_CHARS);
        setWordCount(wordResult.wordCount);
        if (!wordResult.valid) {
            setErrorMessage(wordResult.error || "");
        } else if (!charResult.valid) {
            setErrorMessage(charResult.error || "");
        } else {
            setErrorMessage("");
        }
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSubject(value);
        const wordResult = validateWordLimit(value, MAX_SUBJECT_WORDS);
        const charResult = validateCharLimit(value, MAX_SUBJECT_CHARS);
        setSubjectWordCount(wordResult.wordCount);
        if (!wordResult.valid) {
            setErrorSubject(wordResult.error || "");
        } else if (!charResult.valid) {
            setErrorSubject(charResult.error || "");
        } else {
            setErrorSubject("");
        }
    };

    if (isSubmitted) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Successfully sent!</h3>
                        <p className="text-muted-foreground">Your feedback has been sent to the manager.</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Send Feedback</DialogTitle>
                                <DialogDescription>Share your feedback, suggestions, or issues with us</DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Feedback Category</Label>
                        <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suggestion">Suggestion</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                                <SelectItem value="compliment">Compliment</SelectItem>
                                <SelectItem value="question">Question</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Subject
                        </Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={handleSubjectChange}
                            placeholder="A brief summary of your feedback"
                            required
                            className="transition-all focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex justify-between text-sm mt-1">
                            <span className={errorSubject ? "text-red-500" : "text-muted-foreground"}>
                                {errorSubject ? errorSubject : `Word count: ${subjectWordCount}/${MAX_SUBJECT_WORDS}, Char: ${subject.length}/${MAX_SUBJECT_CHARS}`}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={handleMessageChange}
                            placeholder="Describe your feedback, suggestion, or issue in detail..."
                            className="min-h-[120px] transition-all focus:ring-2 focus:ring-orange-500"
                            required
                        />
                        <div className="flex justify-between text-sm mt-1">
                            <span className={errorMessage ? "text-red-500" : "text-muted-foreground"}>
                                {errorMessage ? errorMessage : `Word count: ${wordCount}/${MAX_WORDS}, Char: ${message.length}/${MAX_CHARS}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !!errorMessage || !!errorSubject}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Send Feedback
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
