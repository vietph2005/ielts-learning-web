import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout"
import { StaffLayout } from "@/components/layout/Staff/StaffLayout"
import { AdminLayout } from "./components/layout/AdminLayout"
//Payment
import VnPayResultPage from "./pages/Payment/VNPayResultPage"
import PremiumPage from "@/pages/Payment/PremiumPage.tsx";

// Pages - Public
import { HomePage } from "@/pages/HomePage"
import Login from "@/components/sections/Login"
import RegisterPage from "@/components/sections/Register"
import VerifyEmail from "@/components/sections/VerifyEmail"
import Contact from "@/pages/Contact"
import HelpCenter from "@/pages/HelpCenter"
import NotFoundPage from "@/pages/NotFoundPage"

// Tips
import TipPage from "@/pages/TipPage"
import TipDetail from "@/pages/TipDetail"

// Test Pages
import ListTestPage from "@/pages/ListTestPage"
import ListeningTest from "@/pages/DoTest/ListeningTest"
import ReadingTest from "@/pages/DoTest/ReadingTest"
import WritingTest from "@/pages/DoTest/WritingTest"
import SpeakingTest from "@/pages/DoTest/SpeakingTest"

import FulllTest from "@/pages/DoTest/FullTest"
import FullTestResult from "@/pages/Result/FullTestResult";

//Vocab
import Vocabulary from "./pages/practice/Vocabulary"
import ForgetPassword from "@/components/sections/ForgetPassword";
import ResetPassword from "@/components/sections/ResetPassword";
import VocabularyGame from "@/pages/student/VocabularyGame.tsx";
import MatchingGamePage from '@/pages/student/MatchingGamePage';
import DashboardPage from "@/pages/student/DashboardPage.tsx";
//import DoTestPage from '@/pages/student/DoTestPage.tsx';

// Result
import WritingResult from "@/pages/Result/WritingResult"
import ListeningResult from "./pages/Result/ListeningResult"
import HistoryPage from "@/pages/HistoryPage"
import SpeakingResult from "@/pages/Result/SpeakingResult.tsx";
// Admin

//import LoginAdmin from "./components/sections/admin/LoginAdmin"
import AdminPage from "./pages/AdminPage"

// Staff
//import StaffLogin from "./components/sections/StaffLogin"
import { StaffPage } from "@/pages/StaffPage"
import AddTest from "@/pages/AddTest"
import AcceptTestPage from "@/pages/AcceptTestPage"
import RequestTestDetailPage from "@/pages/RequestTestDetailPage"
import VocabularyList from "./pages/student/VocabularyList"
import ReviewReport from "@/pages/ReviewReport.tsx";
import UserManagementPage from "./pages/UserManagementPage";
import ManageStudentsPage from "./pages/ManageStudentsPage";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import TeacherScoredList from "./pages/TeacherScoredList"
import ManagerTeacherScoreList from "@/pages/ManagerTeacherScore";
import TeacherScoringPage from "@/pages/TeacherScoring.tsx";
import TransactionHistory from "@/pages/ReviewTransactions.tsx";

// Protected Layouts
import SoftProtectedLayout from "@/components/sections/SoftProtectedLayout"
import ProtectedLayout from "@/components/sections/ProtectedLayout"
import ProtectedLayoutRole from "@/components/sections/ProtectedLayoutRole"
import ReadingResult from "@/pages/Result/ReadingResult.tsx";
import TransactionPage from "./pages/TransactionPage"
//import ManagerLogin from "@/components/sections/ManagerLogin";



// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
    return (

            <AuthProvider>
                <Router>
                    <ScrollToTop />
                    <Routes>

                        {/* ========== Public Routes (No login required) ========== */}
                        <Route path="/" element={
                            // <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><HomePage /></MainLayout>
                            //</SoftProtectedLayout>
                        } />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgetPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                        <Route path="/help" element={<MainLayout><HelpCenter /></MainLayout>} />

                        {/* ========== Soft Protected (Login optional, show more for students) ========== */}
                        <Route path="/student/listAllTips" element={
                            <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><TipPage /></MainLayout>
                            </SoftProtectedLayout>
                        } />
                        <Route path="/tips/:skill" element={
                            <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><TipPage /></MainLayout>
                            </SoftProtectedLayout>
                        } />
                        <Route path="/:skill/:id" element={
                            <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><TipDetail /></MainLayout>
                            </SoftProtectedLayout>
                        } />
                        <Route path="/test" element={
                            <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><ListTestPage /></MainLayout>
                            </SoftProtectedLayout>
                        } />
                        <Route path="/test/:skill" element={
                            <SoftProtectedLayout allowRoles={["student"]}>
                                <MainLayout><ListTestPage /></MainLayout>
                            </SoftProtectedLayout>
                        } />
                        <Route path="/student/vocabulary-game" element={<MainLayout><VocabularyGame /></MainLayout>} />
                        <Route path="/student/dashboard" element={<SoftProtectedLayout allowRoles={["student"]}><MainLayout><DashboardPage /></MainLayout></SoftProtectedLayout>} />
                        <Route path="/student/vocabulary-matching-game" element={<MainLayout><MatchingGamePage /></MainLayout>}/>


                        <Route path="/practice/vocabulary" element={<SoftProtectedLayout allowRoles={["student"]}><MainLayout><VocabularyList /></MainLayout></SoftProtectedLayout>} />

                        {/* ========== Student Test Routes (Login required) ========== */}
                        <Route path="/test/listening/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <ListeningTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/test/reading/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <ReadingTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/test/writing/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <WritingTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/test/speaking/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <SpeakingTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/checkMic/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <SpeakingTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/test/full/:testId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <FulllTest />
                            </ProtectedLayout>
                        } />
                        <Route path="/test/fulltest-result/:testId" element={<FullTestResult />} />
                        <Route path="/writing-result/:resultId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <MainLayout><WritingResult /></MainLayout>
                            </ProtectedLayout>
                        } />
                        <Route path="/listening-result/:resultId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <MainLayout><ListeningResult /></MainLayout>
                            </ProtectedLayout>
                        } />
                        <Route path="/reading-result/:resultId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <MainLayout><ReadingResult /></MainLayout>
                            </ProtectedLayout>
                        } />
                        <Route path="/speaking-result/:resultId" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <MainLayout><SpeakingResult /></MainLayout>
                            </ProtectedLayout>
                        } />
                        <Route path="/test-history" element={
                            <ProtectedLayout allowRoles={["student"]}>
                                <MainLayout><HistoryPage /></MainLayout>
                            </ProtectedLayout>
                        } />

                        <Route path="/premium" element={<MainLayout><PremiumPage /></MainLayout>} />
                        <Route path="/vnpay-result" element={<MainLayout><VnPayResultPage /></MainLayout>} />
                        {/* ========== Admin Routes ========== */}
                        {/* <Route path="/login-admin" element={<LoginAdmin />} /> */}
                        <Route path="/admin-page" element={
                            <ProtectedLayoutRole allowRoles={["admin"]}>
                                <AdminLayout><AdminPage /></AdminLayout>
                            </ProtectedLayoutRole>
                        } />

                        {/* ========== Staff Routes ========== */}
                        {/* <Route path="/staff-login" element={<StaffLogin />} />
                        <Route path="/manager-login" element={<ManagerLogin />} /> */}
                        <Route path="/staff-page" element={<ProtectedLayoutRole allowRoles={["teacher", "manager"]}><StaffLayout><StaffPage /></StaffLayout></ProtectedLayoutRole>} />
                        <Route path="/add-test" element={<ProtectedLayout allowRoles={["teacher"]}><StaffLayout><AddTest /></StaffLayout></ProtectedLayout>} />
                        <Route path="/accept-tests" element={<ProtectedLayout allowRoles={["manager"]}><StaffLayout><AcceptTestPage /></StaffLayout></ProtectedLayout>} />
                        <Route path="/request-test-detail" element={<ProtectedLayout allowRoles={["manager"]}><StaffLayout><RequestTestDetailPage /></StaffLayout></ProtectedLayout>} />
                        <Route path="/transactions" element={<ProtectedLayout allowRoles={["manager"]}><StaffLayout><TransactionPage /></StaffLayout></ProtectedLayout>} />
                        <Route path="/add-vocabulary" element={<ProtectedLayout allowRoles={["teacher"]}><StaffLayout><Vocabulary /></StaffLayout></ProtectedLayout>} />
                        <Route path="/handle-reports" element={<ProtectedLayout allowRoles={["manager"]}><StaffLayout><ReviewReport /></StaffLayout></ProtectedLayout>} />
                        <Route path="/user-management" element={<ProtectedLayoutRole allowRoles={["manager"]}><StaffLayout><UserManagementPage /></StaffLayout></ProtectedLayoutRole>} />
                        <Route path="/manage-students" element={<ProtectedLayoutRole allowRoles={["manager"]}><StaffLayout><ManageStudentsPage /></StaffLayout></ProtectedLayoutRole>} />
                        <Route path="/manage-teachers" element={<ProtectedLayoutRole allowRoles={["manager"]}><StaffLayout><ManageTeachersPage /></StaffLayout></ProtectedLayoutRole>} />
                        <Route path="/grade-writing" element={<ProtectedLayout allowRoles={["teacher"]}><StaffLayout><ManagerTeacherScoreList /></StaffLayout></ProtectedLayout>} />
                        <Route path="/teacher-scoring/:id" element={<ProtectedLayout allowRoles={["teacher"]}><StaffLayout><TeacherScoringPage /></StaffLayout></ProtectedLayout>} />
                        <Route path="/transactions-history" element={<ProtectedLayout allowRoles={["manager"]}><StaffLayout><TransactionHistory /></StaffLayout></ProtectedLayout>} />
                        <Route path="/teacher-scored-list" element={<ProtectedLayout allowRoles={["teacher"]}><StaffLayout><TeacherScoredList /></StaffLayout></ProtectedLayout>} />
                        <Route path="*" element={<NotFoundPage />} />

                    </Routes>
                </Router>
            </AuthProvider>

    )
}
