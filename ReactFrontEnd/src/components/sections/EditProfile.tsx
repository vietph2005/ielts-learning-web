import { API_URL } from "@/config/api";
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { customFetch } from "@/components/sections/customFetch"
import { useAuth } from "@/contexts/AuthContext"
import { User, Calendar, Phone, Users, Save, Loader2 } from "lucide-react"
import * as React from "react";
import { validateWordLimit } from "@/lib/utils";

interface EditProfileProps {
    isOpen: boolean
    onClose: () => void
}


interface ProfileDto {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phone: string;
}



export default function EditProfile({ isOpen, onClose }: EditProfileProps) {
    const { user } = useAuth()
    const [profile, setProfile] = useState<ProfileDto>({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "",
        phone: "",
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "",
        phone: ""
    });

    // Fetch data when dialog opens
    useEffect(() => {
        if (isOpen && user?.username) {
            fetch(`${API_URL}/api/user/${user.username}`)
                .then((res) => res.json())
                .then((data) => setProfile(data))
                .catch((err) => console.error(err))
        }
    }, [isOpen, user])

    const validateField = (field: string, value: string) => {
        let error = "";
        if (value && value.trim() !== "") {
            if (field === "phone") {
                // Simple phone validation: only digits, length 8-15
                const phoneRegex = /^\d{8,15}$/;
                if (!phoneRegex.test(value.trim())) {
                    error = "Phone must be 8-15 digits.";
                }
            } else if (field === "firstName" || field === "lastName") {
                if (value.length > 30) {
                    error = "Must not exceed 30 characters.";
                }
            } else if (field === "birthDate") {
                const today = new Date();
                const inputDate = new Date(value);
                // Chỉ validate nếu nhập đúng định dạng yyyy-mm-dd
                if (!isNaN(inputDate.getTime()) && inputDate > today) {
                    error = "Birth date cannot be in the future.";
                }
            }
        }
        setErrors((prev) => ({ ...prev, [field]: error }));
        return error;
    };

    const handleChange = (field: string, value: string) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    const validateAll = () => {
        let valid = true;
        Object.entries(profile).forEach(([field, value]) => {
            const error = validateField(field, value);
            if (error) valid = false;
        });
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAll()) return;
        setLoading(true)
        console.log("Vao put");
        try {
            await customFetch(`${API_URL}/api/user/${user?.username}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            })
            onClose()
        } catch (err) {
            console.error("Update failed", err)
            alert("Update failed")
        } finally {
            setLoading(false)
        }
    }

    const hasError = Object.values(errors).some((err) => err);
    // Không kiểm tra hasEmpty nữa

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                        <User className="w-6 h-6 text-primary" />
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-medium">
                                            First Name
                                        </Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Enter first name"
                                            value={profile.firstName || ""}
                                            onChange={(e) => handleChange("firstName", e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-medium">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Enter last name"
                                            value={profile.lastName || ""}
                                            onChange={(e) => handleChange("lastName", e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Additional Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">Additional Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id="birthDate"
                                            type="date"
                                            value={profile.birthDate || ""}
                                            onChange={(e) => handleChange("birthDate", e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.birthDate && <div className="text-red-500 text-xs mt-1">{errors.birthDate}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium">
                                            Gender
                                        </Label>
                                        <Select value={profile.gender || ""} onValueChange={(value) => handleChange("gender", value)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={profile.phone || ""}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="h-11"
                                    />
                                    {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                </div>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || hasError} className="flex-1 h-11 bg-primary hover:bg-primary/90">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
