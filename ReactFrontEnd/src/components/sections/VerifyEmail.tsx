"use client"
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"

export default function VerifyEmail() {
  const { fetchUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("Đang xác thực email của bạn...")
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const token = searchParams.get("token")
  const navigate = useNavigate()
  

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/verify-email?token=${token}`, {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error("Xác thực thất bại")
        }

        await fetchUser()

        setMessage("Email của bạn đã được xác thực thành công! Bạn có thể bắt đầu sử dụng tài khoản.")
        setIsSuccess(true)
      } catch (err: any) {
        setMessage("Xác thực thất bại. Vui lòng kiểm tra lại liên kết hoặc yêu cầu gửi lại email xác thực.")
        setIsSuccess(false)
      }
    }

    if (token) {
      ;(async () => {
        await verify()
      })()
    } else {
      setMessage("Liên kết xác thực không hợp lệ. Vui lòng kiểm tra lại email của bạn.")
      setIsSuccess(false)
    }
  }, [token, fetchUser])

  const handleGoHome = () => {
    navigate("/")
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const getStatusIcon = () => {
    if (isSuccess === null) {
      return <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
    }
    if (isSuccess) {
      return <CheckCircle className="w-16 h-16 text-emerald-500" />
    }
    return <XCircle className="w-16 h-16 text-red-500" />
  }

  const getStatusTitle = () => {
    if (isSuccess === null) return "Đang xử lý..."
    if (isSuccess) return "Xác thực thành công!"
    return "Xác thực thất bại"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          {/* Status Title */}
          <h2
            className={`text-2xl font-bold text-center mb-4 ${
              isSuccess === true ? "text-emerald-600" : isSuccess === false ? "text-red-600" : "text-gray-700"
            }`}
          >
            {getStatusTitle()}
          </h2>

          {/* Status Message */}
          <p className="text-gray-600 text-center leading-relaxed mb-8">{message}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess && (
              <button
                onClick={handleGoHome}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Về trang chủ</span>
              </button>
            )}

            {isSuccess === false && (
              <>
                <button
                  onClick={handleGoHome}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Quay lại</span>
                </button>
              </>
            )}
          </div>

          {/* Loading State Additional Info */}
          {isSuccess === null && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-700 text-center">Vui lòng đợi trong giây lát...</p>
            </div>
          )}

          {/* Success State Additional Info */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-700 text-center">Tài khoản của bạn đã sẵn sàng sử dụng!</p>
            </div>
          )}

          {/* Error State Additional Info */}
          {isSuccess === false && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-700 text-center">Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>© 2024 Your Company. All rights reserved.</p>
      </div>
    </div>
  )
}
