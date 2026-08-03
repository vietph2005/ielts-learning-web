import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
      <div className="min-h-[70vh] flex flex-col md:flex-row items-center justify-center gap-12 py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        {/* Thông tin liên hệ */}
        <Card className="w-full max-w-md shadow-lg border-emerald-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">Liên hệ với chúng tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <div>
                <span className="font-semibold">Địa chỉ:</span> <span className="text-gray-500">Vô gia cư</span>
              </div>
              <div>
                <span className="font-semibold">Email:</span> <span className="text-gray-500">languages.center25@gmail.com</span>
              </div>
              <div>
                <span className="font-semibold">Số điện thoại:</span> <span className="text-gray-500">0123456789</span>
              </div>
              <div>
                <span className="font-semibold">Thời gian làm việc:</span> <span className="text-gray-500">8:00 - 20:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Form liên hệ */}
        <Card className="w-full max-w-lg shadow-lg border-emerald-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">Gửi tin nhắn cho chúng tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Họ và tên</label>
                <Input placeholder="Nhập họ và tên của bạn" required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <Input type="email" placeholder="Nhập email của bạn" required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Số điện thoại</label>
                <Input type="tel" placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Nội dung</label>
                <Textarea rows={5} placeholder="Nhập nội dung liên hệ..." required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg py-2 rounded-md shadow-md">Gửi liên hệ</Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
