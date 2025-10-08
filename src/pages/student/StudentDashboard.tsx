import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, User, FileText, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  full_name: string;
  email: string;
  passport_photo: string | null;
  hometown: string | null;
  home_address: string | null;
  state: string | null;
}

interface AcademicDetails {
  registration_number: string;
  year_of_admission: number;
  faculty: string;
  programme: string;
  payment_status: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [academicDetails, setAcademicDetails] = useState<AcademicDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: academicData } = await supabase
      .from("academic_details")
      .select("*")
      .eq("student_id", user.id)
      .single();

    setProfile(profileData);
    setAcademicDetails(academicData);
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.full_name}</h1>
          <p className="text-muted-foreground">Student Dashboard</p>
        </div>

        {/* Student Profile Card */}
        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.passport_photo || ""} alt={profile?.full_name} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name && getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{profile?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{profile?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hometown</p>
                  <p className="text-lg">{profile?.hometown || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">State</p>
                  <p className="text-lg">{profile?.state || "Not provided"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Details Card */}
        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                <p className="text-lg font-semibold">{academicDetails?.registration_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                <p className="text-lg">{academicDetails?.faculty || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programme</p>
                <p className="text-lg">{academicDetails?.programme || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Year of Admission</p>
                <p className="text-lg">{academicDetails?.year_of_admission || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <p className={`text-lg font-semibold ${
                  academicDetails?.payment_status === "paid" ? "text-primary" : "text-destructive"
                }`}>
                  {academicDetails?.payment_status?.toUpperCase() || "PENDING"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="text-xl font-bold">
                    {academicDetails?.payment_status === "paid" ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration</p>
                  <p className="text-xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Academic Status</p>
                  <p className="text-xl font-bold">Good Standing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
