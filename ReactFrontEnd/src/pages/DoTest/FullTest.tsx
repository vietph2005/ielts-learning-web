"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {Lightbulb, Monitor} from "lucide-react";
import type { Test } from "@/types/apiTypes";
import { useAuth } from "@/contexts/AuthContext";




export default function FullTest() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/verify/fullTest/${testId}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    console.log("hello");
                    return;
                }

                const data = await res.json();
                console.log("Fetched test data:", data);
                setTest(data);
                setIsOpen(true); // mở modal sau khi load xong
            } catch (err) {
                console.error("Failed to fetch test:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [testId]);

    const handleConfirmStart = async () => {
        if (!user?.username) {
            alert("You need to log in to take the test.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/verify/test-answer/create?testId=${testId}&username=${user.username}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể tạo lần làm bài mới");
            const data = await res.json();
            const testAnswerId = data.id || data._id || data.testAnswerId;
            if (!testAnswerId) throw new Error("Không nhận được testAnswerId");
            navigate(`/test/listening/${testId}?testAnswerId=${testAnswerId}&mode=fulltest`);
        } catch (err) {
            alert("Error starting test: " + err);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!test) {
        return <div>Không tìm thấy bài test.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {/* Dialog Modal */}
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        navigate(-1); // Quay lại trang trước khi đóng dialog (ấn X)
                    } else {
                        setIsOpen(open);
                    }
                }}
            >
                <DialogContent className="max-w-lg w-full mx-auto bg-white rounded-3xl p-8 shadow-2xl border-0">
                    <VisuallyHidden>
                        <DialogTitle>{test?.title ?? "Full Test"}</DialogTitle>
                    </VisuallyHidden>

                    <div className="text-center space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Monitor className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        {/* Info with lightbulb */}
                        <div className="flex items-start gap-3 text-left bg-blue-50 p-4 rounded-lg">
                            <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Simulation test mode is the best option to experience the real IELTS on computer.
                            </p>
                        </div>

                        {/* Test Information */}
                        <div className="text-left space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Test information</h2>
                            <ul className="space-y-3 text-gray-700 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>This test includes the Listening, Reading, Writing and Speaking sections.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>It takes about 3 hours to complete (same as the real IELTS test).</span>
                                </li>
                            </ul>
                        </div>

                        {/* Confirmation text */}
                        <p className="text-gray-600 text-sm pt-4">Please confirm if you would like to continue.</p>

                        {/* Confirm button */}
                        <Button
                            className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-full text-base font-medium"
                            onClick={handleConfirmStart}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
