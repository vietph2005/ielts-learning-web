import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";
const ManagerLogin  = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const getEmailErrorMessage = (value: string): string => {
        if (!value) return "Email is required";

        // Email regex chuẩn RFC 5322 simplified
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailRegex.test(value)) {
            return "Please enter a valid email address (e.g. you@example.com)";
        }

        return "";
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        const errorMsg = getEmailErrorMessage(value);
        setEmailError(errorMsg);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);

        if (!value) {
            setPasswordError("Password is required");
        } else {
            setPasswordError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate email
        const emailMsg = getEmailErrorMessage(email);
        setEmailError(emailMsg);

        // Validate password
        let passwordMsg = "";
        if (!password) {
            passwordMsg = "Password is required";
        }
        setPasswordError(passwordMsg);

        // If no errors, proceed login
        if (!emailMsg && !passwordMsg) {
            try {
                await login(email, password);
                navigate("/staff-page");
            } catch (error) {
                alert("Login failed");
                console.error(error);
            }
        }
    };

    const handleGoogleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL;
        window.location.href = `${API_URL}/oauth2/authorization/google?role=manager`;
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
                    <CardTitle className="text-2xl font-bold text-center">Manager Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`pl-9 ${emailError ? "border-red-500" : ""}`}
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-sm mt-1">{emailError}</p>
                            )}
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to={`/forgot-password?redirect=${encodeURIComponent(location.pathname)}`}
                                    className="text-sm text-emerald-600 hover:text-emerald-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`pl-9 ${passwordError ? "border-red-500" : ""}`}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                            )}
                        </div>

                        {/* Submit button */}
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Google login button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-2"
                            onClick={handleGoogleLogin}
                        >
                            <img src="/src/assets/google.png" alt="Google" className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </form>

                    {/* Sign up link */}

                </CardContent>
            </Card>
        </div>
    );
};
export default ManagerLogin;
