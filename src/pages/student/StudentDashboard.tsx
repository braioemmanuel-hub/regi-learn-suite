import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, User, FileText, Award, Upload, BookOpen, Calendar, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  credit_units: number;
}

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  courses: {
    course_code: string;
    course_title: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string;
  due_date: string;
  paid_date: string | null;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [academicDetails, setAcademicDetails] = useState<AcademicDetails | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

    // Fetch registered courses
    const { data: coursesData } = await supabase
      .from("student_courses")
      .select("courses(id, course_code, course_title, credit_units)")
      .eq("student_id", user.id);

    // Fetch timetable
    const { data: timetableData } = await supabase
      .from("timetable")
      .select("id, day_of_week, start_time, end_time, venue, courses(course_code, course_title)")
      .order("day_of_week");

    // Fetch payments
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setProfile(profileData);
    setAcademicDetails(academicData);
    setCourses(coursesData?.map((item: any) => item.courses).filter(Boolean) || []);
    setTimetable(timetableData || []);
    setPayments(paymentsData || []);
    setLoading(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('passports')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('passports')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ passport_photo: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, passport_photo: publicUrl } : null);
      toast({
        title: "Success",
        description: "Passport photo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
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
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.passport_photo || ""} alt={profile?.full_name} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name && getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                    id="passport-upload"
                  />
                  <label htmlFor="passport-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      asChild
                    >
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
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

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timetable Entries</p>
                  <p className="text-2xl font-bold">{timetable.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
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

        {/* Registered Courses */}
        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Registered Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No courses registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Credit Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_title}</TableCell>
                        <TableCell>{course.credit_units}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timetable */}
        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timetable.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No timetable entries available</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Venue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetable.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.day_of_week}</TableCell>
                        <TableCell>
                          {entry.courses.course_code} - {entry.courses.course_title}
                        </TableCell>
                        <TableCell>
                          {entry.start_time} - {entry.end_time}
                        </TableCell>
                        <TableCell>{entry.venue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payment records found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.description}</TableCell>
                        <TableCell>₦{Number(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : payment.status === "pending" ? "destructive" : "secondary"}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
