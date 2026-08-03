import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, ArrowRight, User, UserCheck, UserCog, Shield } from "lucide-react";
import { useRef } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const getEmailErrorMessage = (value: string): string => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address (e.g. you@example.com)";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(getEmailErrorMessage(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value ? "" : "Password is required");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailMsg = getEmailErrorMessage(email);
    const passwordMsg = password ? "" : "Password is required";
    setEmailError(emailMsg);
    setPasswordError(passwordMsg);

    if (!emailMsg && !passwordMsg) {
      try {
        const response = await login(email, password, role);
        if (response.status === "success") {
          const redirectUrl = response.redirectUrl || "/";
          navigate(redirectUrl);
        } else {
          alert(response.message || "Login failed");
        }
      } catch (error) {
        alert("Login failed");
        console.error(error);
      }
    }
  };
  const API_URL = import.meta.env.VITE_API_URL;
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google?role=${role}`;
  };

  const roleList = [
    { value: "student", icon: User, label: "Student" },
    { value: "teacher", icon: UserCheck, label: "Teacher" },
    { value: "manager", icon: UserCog, label: "Manager" },
    { value: "admin", icon: Shield, label: "Admin" },
  ];
  const roleIndex = roleList.findIndex((r) => r.value === role);
  const tabRef = useRef(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">LANGUAGES</span>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selection - Animated */}
          <div className="relative mb-8">
            <div
              className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded-lg relative"
              ref={tabRef}
              style={{ minHeight: 64 }}
            >
              {/* Animated highlight */}
              <div
                className="absolute top-2 left-0 h-[calc(100%-16px)] w-1/4 z-0 rounded-md bg-emerald-600/90 shadow-lg transition-transform duration-400 ease-in-out"
                style={{
                  transform: `translateX(${roleIndex * 100}%) scale(0.98)`,
                  transition: "transform 0.35s cubic-bezier(.4,1.2,.4,1), background 0.3s",
                }}
              ></div>
              {roleList.map((item, _idx) => {
                const isActive = role === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setRole(item.value)}
                    className={`relative z-10 flex flex-col items-center p-3 rounded-md transition-all duration-300 font-medium
                      ${isActive
                        ? "text-white scale-105 drop-shadow-lg"
                        : "text-gray-600 hover:text-emerald-700 hover:scale-105"}
                    `}
                    style={{
                      transition: "color 0.3s, background 0.3s, box-shadow 0.3s, transform 0.3s",
                    }}
                  >
                    <item.icon className={`w-5 h-5 mb-1 transition-colors duration-300 ${isActive ? "text-white" : "text-emerald-600 group-hover:text-emerald-700"}`} />
                    <span className="text-xs font-semibold tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  className={`pl-9 transition-all duration-200 ${
                    emailError ? "border-red-500" : "focus:border-emerald-600"
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
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
                  className={`pl-9 transition-all duration-200 ${
                    passwordError ? "border-red-500" : "focus:border-emerald-600"
                  }`}
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 hover:bg-gray-50 transition-all duration-200"
              onClick={handleGoogleLogin}
            >
              <img
                src="/src/assets/google.png"
                alt="Google"
                className="mr-2 h-4 w-4"
              />
              Google
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account?</span>{" "}
            <Link
              to="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;