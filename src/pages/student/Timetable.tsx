import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimetableEntry {
  id: string;
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  courses: {
    course_code: string;
    course_title: string;
  };
}

export default function Timetable() {
  const { userRole } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("1");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    fetchTimetable();
  }, [selectedSemester]);

  const fetchTimetable = async () => {
    const { data, error } = await supabase
      .from("timetable")
      .select("*, courses(course_code, course_title)")
      .eq("semester", parseInt(selectedSemester))
      .order("day_of_week")
      .order("start_time");

    if (!error && data) {
      setTimetable(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout role={userRole || "student"}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole || "student"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Class Timetable</h1>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">First Semester</SelectItem>
              <SelectItem value="2">Second Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {daysOfWeek.map((day) => {
            const dayClasses = timetable.filter((entry) => entry.day_of_week === day);
            
            return (
              <Card key={day} className="shadow-card">
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dayClasses.length === 0 ? (
                    <p className="text-muted-foreground">No classes scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {dayClasses.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-semibold">{entry.courses.course_code} - {entry.courses.course_title}</p>
                            <p className="text-sm text-muted-foreground">Venue: {entry.venue}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{entry.start_time} - {entry.end_time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
