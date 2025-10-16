import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/student/StudentDashboard";
import Fees from "./pages/student/Fees";
import BioData from "./pages/student/BioData";
import CourseRegistration from "./pages/student/CourseRegistration";
import Results from "./pages/student/Results";
import OtherPayments from "./pages/student/OtherPayments";
import Timetable from "./pages/student/Timetable";
import Hostel from "./pages/student/Hostel";
import Documents from "./pages/student/Documents";
import ChangeProgramme from "./pages/student/ChangeProgramme";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import ManageResults from "./pages/admin/ManageResults";
import ManagePayments from "./pages/admin/ManagePayments";
import ManageStudents from "./pages/admin/ManageStudents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/fees" element={<Fees />} />
            <Route path="/student/biodata" element={<BioData />} />
            <Route path="/student/payments" element={<OtherPayments />} />
            <Route path="/student/courses" element={<CourseRegistration />} />
            <Route path="/student/timetable" element={<Timetable />} />
            <Route path="/student/results" element={<Results />} />
            <Route path="/student/hostel" element={<Hostel />} />
            <Route path="/student/change-programme" element={<ChangeProgramme />} />
            <Route path="/student/documents" element={<Documents />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/results" element={<ManageResults />} />
            <Route path="/admin/payments" element={<ManagePayments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
