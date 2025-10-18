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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  semester: number;
  courses: {
    course_code: string;
    course_title: string;
  };
}

interface Course {
  id: string;
  course_code: string;
  course_title: string;
}

export default function ManageTimetable() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState({
    course_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    venue: "",
    semester: 1,
  });

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
  }, []);

  const fetchTimetable = async () => {
    const { data, error } = await supabase
      .from("timetable")
      .select("*, courses(course_code, course_title)")
      .order("day_of_week");

    if (!error && data) {
      setTimetable(data as any);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_code, course_title")
      .order("course_code");

    if (!error && data) {
      setCourses(data);
    }
  };

  const openDialog = (entry?: TimetableEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setForm({
        course_id: entry.courses ? (entry as any).course_id : "",
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        venue: entry.venue,
        semester: entry.semester,
      });
    } else {
      setEditingEntry(null);
      setForm({
        course_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        venue: "",
        semester: 1,
      });
    }
    setDialog(true);
  };

  const saveEntry = async () => {
    if (editingEntry) {
      const { error } = await supabase
        .from("timetable")
        .update(form)
        .eq("id", editingEntry.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update timetable entry",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Timetable updated successfully" });
        setDialog(false);
        fetchTimetable();
      }
    } else {
      const { error } = await supabase.from("timetable").insert([form]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create timetable entry",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Timetable entry created successfully" });
        setDialog(false);
        fetchTimetable();
      }
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("timetable").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete timetable entry",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Timetable entry deleted successfully" });
      fetchTimetable();
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
          <h1 className="text-3xl font-bold">Manage Timetable</h1>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Course Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>{entry.semester}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDialog(entry)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)}>
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
            <DialogTitle>{editingEntry ? "Edit Timetable Entry" : "Add New Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course</Label>
              <Select value={form.course_id} onValueChange={(value) => setForm({ ...form, course_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.course_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Day of Week</Label>
              <Select value={form.day_of_week} onValueChange={(value) => setForm({ ...form, day_of_week: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g., Room 101"
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
            <Button onClick={saveEntry} className="w-full">
              {editingEntry ? "Update Entry" : "Create Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
