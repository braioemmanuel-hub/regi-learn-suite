import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  credit_units: number;
  semester: number;
  faculty: string;
  programme: string;
}

const CourseRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState("1");
  const [session, setSession] = useState("2024/2025");

  useEffect(() => {
    fetchCourses();
    fetchRegisteredCourses();
  }, [user, semester]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("semester", parseInt(semester))
      .order("course_code");

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchRegisteredCourses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", user.id)
      .eq("semester", parseInt(semester))
      .eq("session", session);

    if (data) {
      const courseIds = data.map((c) => c.course_id);
      setRegisteredCourses(courseIds);
      setSelectedCourses(courseIds);
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleRegister = async () => {
    if (!user) return;

    // Delete previous registrations for this semester/session
    await supabase
      .from("student_courses")
      .delete()
      .eq("student_id", user.id)
      .eq("semester", parseInt(semester))
      .eq("session", session);

    // Insert new registrations
    const registrations = selectedCourses.map((courseId) => ({
      student_id: user.id,
      course_id: courseId,
      semester: parseInt(semester),
      session,
    }));

    const { error } = await supabase.from("student_courses").insert(registrations);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to register courses",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Courses registered successfully",
      });
      fetchRegisteredCourses();
    }
  };

  const totalCredits = courses
    .filter((c) => selectedCourses.includes(c.id))
    .reduce((sum, c) => sum + c.credit_units, 0);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Registration</h1>
          <p className="text-muted-foreground">Select and register your courses for the semester</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Semester</SelectItem>
                <SelectItem value="2">Second Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger>
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2023/2024">2023/2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Available Courses</span>
              <span className="text-sm font-normal">Total Credits: {totalCredits}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No courses available</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Credit Units</TableHead>
                        <TableHead>Faculty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => handleCourseToggle(course.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{course.course_code}</TableCell>
                          <TableCell>{course.course_title}</TableCell>
                          <TableCell>{course.credit_units}</TableCell>
                          <TableCell>{course.faculty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleRegister} disabled={selectedCourses.length === 0}>
                    Register Courses
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CourseRegistration;
