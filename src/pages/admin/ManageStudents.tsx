import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Student {
  id: string;
  full_name: string;
  email: string;
  passport_photo: string | null;
  academic_details: Array<{
    programme: string;
    registration_number: string;
    payment_status: string;
  }>;
}

export default function ManageStudents() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        passport_photo,
        academic_details(programme, registration_number, payment_status)
      `)
      .order("full_name");

    if (!error && data) {
      setStudents(data as any);
    }
    setLoading(false);
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
        <h1 className="text-3xl font-bold">Manage Students</h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.passport_photo || ""} alt={student.full_name} />
                        <AvatarFallback>
                          {student.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {student.academic_details?.[0]?.programme || "N/A"}
                    </TableCell>
                    <TableCell>
                      {student.academic_details?.[0]?.registration_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
