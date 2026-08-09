import { API_URL } from "@/config/api";
// IELTS Premium Page with VNPay Payment Integration
import {useEffect, useState} from "react"
import {
    Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Plan = {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    duration: string;
    popular: boolean;
    description: string[];
};



function formatPremiumRemainingTime(premiumExpiry: string | null): string {
    if (!premiumExpiry) return "Premium đã hết hạn";

    const expiryDateUtc = new Date(premiumExpiry);
    const expiryDateVN = new Date(expiryDateUtc.getTime() + 7 * 60 * 60 * 1000);

    const now = new Date();
    const diffMs = expiryDateVN.getTime() - now.getTime();

    if (diffMs <= 0) return "Premium đã hết hạn";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(diffMinutes / 1440);
    const hours = Math.floor((diffMinutes % 1440) / 60);
    const minutes = diffMinutes % 60;

    let result = "Còn lại ";
    if (days > 0) result += `${days} ngày `;
    if (hours > 0) result += `${hours} giờ `;
    if (days === 0 && hours === 0 && minutes > 0) result += `${minutes} phút`;

    return result.trim();
}


export default function PremiumPage() {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<Plan[]>([])
    const [premiumExpiry, setPremiumExpiry] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPlans = async () => {
            try {
                const response = await fetch(`${API_URL}/api/courses`)
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                const data = await response.json()
                const fetched = data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    price: c.price,
                    originalPrice: c.originalPrice,
                    description: c.description.split("|"),
                    duration: `${c.duration} tháng`,
                }))
                setPlans(fetched)
            } catch (error) {
                console.error("Lỗi tải gói học:", error)
            }
        }
        fetchPlans()
    }, [])

    useEffect(() => {
        fetch(`${API_URL}/api/user/me`, { // ✅ dùng ` thay vì '
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                const expiry = data.premiumExpiry || null;
                setPremiumExpiry(expiry);

                if (expiry) {
                    const utcDate = new Date(expiry);
                    const vietnamTime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
                    console.log("⏰ Giờ hết hạn Premium (giờ VN):", vietnamTime.toLocaleString());
                }
            })
            .catch((err) => {
                console.error("Lỗi khi lấy thông tin user:", err);
                setPremiumExpiry(null);
            });
    }, []);

    const handlePay = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/vn-pay/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: selectedPlan.price,
                    orderInfo: `Thanh toán gói ${selectedPlan.name}`,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const result = await response.json();
            const payUrl = result?.payUrl;

            if (payUrl) {
                // ✅ Lưu selectedPlan vào localStorage trước khi chuyển
                localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));

                window.location.href = payUrl;
            } else {
                alert("Did not receive payment URL from server.");
            }
        } catch (error) {
            console.error("Lỗi tạo thanh toán:", error);
            alert("Failed to create payment.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
            <header className="container mx-auto px-4 py-8 text-center">
                <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">
                    🚀 Ra mắt AI Chấm Bài IELTS
                </Badge>
                {/* Thêm badge hiển thị thời hạn Premium */}
                {premiumExpiry && (
                    <div className="mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            🌟 Premium: {formatPremiumRemainingTime(premiumExpiry)}
                        </Badge>
                    </div>
                )}
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4">
                    IELTS Premium AI
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    Nâng cao band điểm IELTS với công nghệ AI tiên tiến. Chấm bài Speaking & Writing chính xác như giám khảo thật, phản hồi tức thì 24/7.
                </p>
            </header>

            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Chọn Gói Học Phù Hợp</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative cursor-pointer 
                            ${selectedPlan?.id === plan.id ? "ring-2 ring-blue-500" : ""}`}
                            onClick={() => setSelectedPlan(plan)}>

                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-500">{plan.duration}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold text-orange-600">{plan.price.toLocaleString()}₫</span>
                                    <div className="text-sm text-gray-400 line-through">{plan.originalPrice.toLocaleString()}₫</div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <>
                                    {plan.description.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button
                        size="lg"
                        className="bg-pink-600 text-white"
                        onClick={handlePay}
                        disabled={!selectedPlan || loading}
                    >
                        {loading ? "Đang xử lý..." : "Thanh toán với VNPay"}
                    </Button>
                </div>
            </section>
        </div>
    )
}