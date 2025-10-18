import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  credit_units: number;
  semester: number;
  faculty: string;
  programme: string;
}

export default function ManageCourses() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    course_code: "",
    course_title: "",
    credit_units: 3,
    semester: 1,
    faculty: "",
    programme: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("course_code");

    if (!error && data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const openDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setForm({
        course_code: course.course_code,
        course_title: course.course_title,
        credit_units: course.credit_units,
        semester: course.semester,
        faculty: course.faculty,
        programme: course.programme,
      });
    } else {
      setEditingCourse(null);
      setForm({
        course_code: "",
        course_title: "",
        credit_units: 3,
        semester: 1,
        faculty: "",
        programme: "",
      });
    }
    setDialog(true);
  };

  const saveCourse = async () => {
    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(form)
        .eq("id", editingCourse.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update course",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Course updated successfully" });
        setDialog(false);
        fetchCourses();
      }
    } else {
      const { error } = await supabase.from("courses").insert([form]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Course created successfully" });
        setDialog(false);
        fetchCourses();
      }
    }
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchCourses();
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={userRole || "admin"}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole || "admin"}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Credit Units</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.course_code}</TableCell>
                    <TableCell>{course.course_title}</TableCell>
                    <TableCell>{course.credit_units}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.faculty}</TableCell>
                    <TableCell>{course.programme}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDialog(course)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course Code</Label>
              <Input
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                placeholder="e.g., CS101"
              />
            </div>
            <div>
              <Label>Course Title</Label>
              <Input
                value={form.course_title}
                onChange={(e) => setForm({ ...form, course_title: e.target.value })}
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
            <div>
              <Label>Credit Units</Label>
              <Input
                type="number"
                value={form.credit_units}
                onChange={(e) => setForm({ ...form, credit_units: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Semester</Label>
              <Input
                type="number"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Faculty</Label>
              <Input
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                placeholder="e.g., Science"
              />
            </div>
            <div>
              <Label>Programme</Label>
              <Input
                value={form.programme}
                onChange={(e) => setForm({ ...form, programme: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
            <Button onClick={saveCourse} className="w-full">
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
