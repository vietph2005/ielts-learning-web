import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const faqData = [
  {
    key: "account",
    label: "Tài khoản",
    faqs: [
      {
        q: "Làm thế nào để đăng ký tài khoản?",
        a: "<b>Bạn nhấn vào nút <span style='color:#059669;'>Đăng ký</span></b> ở góc phải trên cùng, điền đầy đủ thông tin và <i>xác nhận email</i> để hoàn tất đăng ký."
      },
      {
        q: "Tôi quên mật khẩu, phải làm sao?",
        a: "Nhấn vào <b>'Quên mật khẩu'</b> trên trang đăng nhập, nhập email và làm theo hướng dẫn để <span style='color:#2563eb;font-weight:bold;'>đặt lại mật khẩu</span>."
      },
      {
        q: "Tôi có thể thay đổi email đăng ký không?",
        a: "<i>Hiện tại bạn chưa thể tự thay đổi email.</i> <span style='color:#f59e42;font-weight:bold;'>Vui lòng liên hệ bộ phận hỗ trợ</span> để được trợ giúp."
      },
      {
        q: "Tài khoản bị khóa, tôi phải làm gì?",
        a: "Nếu tài khoản bị khóa do vi phạm, hãy <b>liên hệ với chúng tôi</b> qua trang <span style='color:#059669;'>Liên hệ</span> để được hỗ trợ."
      }
    ]
  },
  {
    key: "test",
    label: "Thi thử IELTS",
    faqs: [
      {
        q: "Làm sao để bắt đầu một bài thi thử?",
        a: "Bạn chọn mục <b>'Thi thử'</b> trên menu, chọn kỹ năng muốn luyện tập và nhấn <span style='color:#059669;font-weight:bold;'>Bắt đầu</span>."
      },
      {
        q: "Có thể làm lại bài thi không?",
        a: "Bạn có thể <b>làm lại các bài thi không giới hạn số lần</b> để luyện tập tốt nhất."
      },
      {
        q: "Kết quả thi thử có giống thi thật không?",
        a: "Kết quả <span style='color:#2563eb;font-weight:bold;'>mang tính tham khảo</span>, giúp bạn đánh giá trình độ và chuẩn bị cho kỳ thi thật."
      },
      {
        q: "Có thể xem lại đáp án và giải thích không?",
        a: "Sau khi hoàn thành bài thi, bạn có thể <b>xem lại đáp án đúng</b> và <i>giải thích chi tiết</i> cho từng câu hỏi."
      }
    ]
  },
  {
    key: "payment",
    label: "Thanh toán & Nâng cấp",
    faqs: [
      {
        q: "Các hình thức thanh toán hỗ trợ là gì?",
        a: "Chúng tôi hỗ trợ thanh toán qua <span style='color:#059669;font-weight:bold;'>Momo</span>, thẻ ngân hàng và các ví điện tử phổ biến."
      },
      {
        q: "Tôi thanh toán nhưng chưa được nâng cấp tài khoản?",
        a: "Nếu sau <b>5 phút</b> chưa được nâng cấp, hãy <span style='color:#f59e42;font-weight:bold;'>liên hệ hỗ trợ</span> và cung cấp thông tin giao dịch để được xử lý nhanh nhất."
      },
      {
        q: "Có hoàn tiền khi không hài lòng dịch vụ không?",
        a: "Chính sách hoàn tiền được áp dụng trong một số trường hợp đặc biệt, vui lòng xem chi tiết tại mục <b>Điều khoản dịch vụ</b>."
      }
    ]
  },
  {
    key: "skills",
    label: "Kỹ năng IELTS",
    faqs: [
      {
        q: "Trang web hỗ trợ luyện tập những kỹ năng nào?",
        a: "Bạn có thể luyện tập đầy đủ <span style='color:#059669;font-weight:bold;'>4 kỹ năng: Listening, Reading, Writing, Speaking</span> với các đề thi sát thực tế."
      },
      {
        q: "Có tài liệu hoặc mẹo luyện thi không?",
        a: "Chúng tôi cung cấp nhiều <b>mẹo, chiến lược</b> và tài liệu luyện thi ở mục <span style='color:#2563eb;'>Tips</span> cho từng kỹ năng."
      },
      {
        q: "Có thể luyện nói với AI không?",
        a: "Bạn có thể luyện <b>Speaking với AI</b>, nhận phản hồi tự động và <i>gợi ý cải thiện</i>."
      }
    ]
  }
];

const supportFaq = {
  key: "support",
  label: "Kỹ thuật & Hỗ trợ",
  faqs: [
    {
      q: "Tôi gặp lỗi kỹ thuật, làm sao để báo lỗi?",
      a: "Bạn có thể gửi phản hồi qua trang <span style='color:#059669;'>Liên hệ</span> hoặc <b>email hỗ trợ</b>, chúng tôi sẽ phản hồi sớm nhất có thể."
    },
    {
      q: "Trang web có hỗ trợ trên điện thoại không?",
      a: "Website <b>tối ưu cho cả máy tính và điện thoại</b>, bạn có thể luyện tập mọi lúc mọi nơi."
    },
    {
      q: "Tôi muốn góp ý hoặc đề xuất tính năng mới?",
      a: "Chúng tôi luôn lắng nghe ý kiến của bạn! Hãy gửi góp ý qua trang <span style='color:#059669;'>Liên hệ</span> hoặc <b>email</b>."
    }
  ]
};

export default function HelpCenter() {
  return (

      <div className="min-h-[70vh] py-10 px-2 sm:px-4 md:px-8 bg-gradient-to-br from-blue-50 to-white flex flex-col items-center">
        <Card className="w-full max-w-3xl mb-10 shadow-xl border-blue-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold text-blue-800 tracking-tight text-center mb-2" style={{fontFamily:'Segoe UI,Arial,sans-serif'}}>Trung tâm trợ giúp & Câu hỏi thường gặp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg italic text-center max-w-2xl mx-auto">Bạn có thắc mắc về việc sử dụng website luyện thi IELTS? Dưới đây là các chủ đề và câu hỏi thường gặp. Nếu bạn cần hỗ trợ thêm, hãy <span className='font-semibold text-blue-700'>liên hệ với chúng tôi!</span></p>
          </CardContent>
        </Card>
        <Tabs defaultValue="account" className="w-full max-w-3xl">
          <TabsList className="mb-8 flex-wrap justify-center gap-4 bg-blue-100/60 p-4 rounded-2xl shadow-lg min-h-[56px]" style={{fontFamily:'Segoe UI,Arial,sans-serif', fontSize:'1.15rem'}}>
            {faqData.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-base font-semibold px-6 py-3 rounded-xl transition-all data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-blue-200/80 hover:text-blue-900">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {faqData.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="animate-fade-in">
              <Accordion type="multiple" className="rounded-2xl border border-blue-100 bg-white/95 shadow divide-y divide-blue-50">
                {tab.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={"item-" + idx}>
                    <AccordionTrigger className="text-lg font-bold text-blue-800 px-4 py-3 hover:bg-blue-50 transition-all">
                      <span className="pr-2">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-800 text-base leading-relaxed px-6 pb-4" style={{fontFamily:'Segoe UI',fontSize:'1.05rem'}}>
                      <span dangerouslySetInnerHTML={{__html: faq.a}} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
        {/* Phần hỗ trợ kỹ thuật riêng */}
        <Card className="w-full max-w-3xl mt-12 shadow-xl border-blue-300 bg-white/95">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-700 tracking-tight mb-2" style={{fontFamily:'Segoe UI,Arial,sans-serif'}}>Kỹ thuật & Hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="rounded-2xl border border-blue-100 bg-white/95 shadow divide-y divide-blue-50">
              {supportFaq.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={"support-item-" + idx}>
                  <AccordionTrigger className="text-lg font-bold text-blue-800 px-4 py-3 hover:bg-blue-50 transition-all">
                    <span className="pr-2">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-800 text-base leading-relaxed px-6 pb-4" style={{fontFamily:'Segoe UI',fontSize:'1.05rem'}}>
                    <span dangerouslySetInnerHTML={{__html: faq.a}} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
  );
}
