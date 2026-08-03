import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen, Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const redirectURL = searchParams.get("redirectURL"); // "/login"
    console.log(redirectURL)
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const validate = () => {
        let hasError = false;

        if (!password) {
            setPasswordError("Vui lòng nhập mật khẩu mới");
            hasError = true;
        } else {
            setPasswordError("");
        }

        if (password !== confirmPassword) {
            setConfirmError("Mật khẩu không khớp");
            hasError = true;
        } else {
            setConfirmError("");
        }

        return !hasError;
    };
    console.log(redirectURL)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const res = await fetch(`${API_URL}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: password,

                }),
            });

            if (!res.ok) {
                console.log("ko reset duoc")
            }

            const data = await res.json();
            const role = data.role?.toLowerCase();

            alert("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.");

            if (redirectURL) {
                navigate(redirectURL); // 👈 chuyển hướng chính xác đến nơi người dùng muốn
            } else if (role === "student" || !role) {
                navigate("/login");
            } else {
                navigate(`/login${role}`);
            }
        } catch (err: any) {
            alert(err.message || "Lỗi không xác định");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex items-center space-x-2 mb-8">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">LANGUAGES</span>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
                    <CardDescription className="text-center">
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Mật khẩu mới */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu mới</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-9 pr-10 ${passwordError ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`pl-9 pr-10 ${confirmError ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmError && <p className="text-red-500 text-sm">{confirmError}</p>}
                        </div>

                        {/* Submit */}
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Đặt lại mật khẩu
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
