import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Result {
  id: string;
  grade: string;
  score: number;
  semester: number;
  session: string;
  courses: {
    course_code: string;
    course_title: string;
    credit_units: number;
  };
}

const Results = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState("2024/2025");
  const [semester, setSemester] = useState("1");

  useEffect(() => {
    fetchResults();
  }, [user, session, semester]);

  const fetchResults = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("results")
      .select(`
        *,
        courses:course_id (
          course_code,
          course_title,
          credit_units
        )
      `)
      .eq("student_id", user.id)
      .eq("session", session)
      .eq("semester", parseInt(semester))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching results:", error);
    } else {
      setResults(data as any || []);
    }
    setLoading(false);
  };

  const calculateGPA = () => {
    if (results.length === 0) return 0;
    
    const gradePoints: { [key: string]: number } = {
      A: 5,
      B: 4,
      C: 3,
      D: 2,
      E: 1,
      F: 0,
    };

    let totalPoints = 0;
    let totalUnits = 0;

    results.forEach((result) => {
      const points = gradePoints[result.grade] || 0;
      const units = result.courses.credit_units;
      totalPoints += points * units;
      totalUnits += units;
    });

    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Examination Results</h1>
          <p className="text-muted-foreground">View your academic performance</p>
        </div>

        <div className="flex gap-4 flex-wrap">
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
        </div>

        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Semester Results</span>
              <span className="text-sm font-normal">GPA: {calculateGPA()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No results available</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Credit Units</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.courses.course_code}</TableCell>
                        <TableCell>{result.courses.course_title}</TableCell>
                        <TableCell>{result.courses.credit_units}</TableCell>
                        <TableCell>{result.score}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${
                            result.grade === 'A' || result.grade === 'B' ? 'text-primary' : 
                            result.grade === 'F' ? 'text-destructive' : ''
                          }`}>
                            {result.grade}
                          </span>
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

export default Results;
