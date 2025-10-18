import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  passport_photo: string | null;
  academic_details: Array<{
    id: string;
    programme: string;
    registration_number: string;
    payment_status: string;
    faculty: string;
    year_of_admission: number;
  }>;
}

export default function ManageStudents() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    registration_number: "",
    faculty: "",
    programme: "",
    year_of_admission: new Date().getFullYear(),
    payment_status: "pending"
  });

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
        academic_details(id, programme, registration_number, payment_status, faculty, year_of_admission)
      `)
      .order("full_name");

    if (!error && data) {
      setStudents(data as any);
    }
    setLoading(false);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    if (student.academic_details?.[0]) {
      setEditForm({
        registration_number: student.academic_details[0].registration_number,
        faculty: student.academic_details[0].faculty,
        programme: student.academic_details[0].programme,
        year_of_admission: student.academic_details[0].year_of_admission,
        payment_status: student.academic_details[0].payment_status,
      });
    }
    setEditDialog(true);
  };

  const saveAcademicDetails = async () => {
    if (!selectedStudent?.academic_details?.[0]?.id) return;

    const { error } = await supabase
      .from("academic_details")
      .update(editForm)
      .eq("id", selectedStudent.academic_details[0].id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update academic details",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Academic details updated successfully",
      });
      setEditDialog(false);
      fetchStudents();
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
                  <TableHead>Faculty</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Payment Status</TableHead>
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
                      {student.academic_details?.[0]?.faculty || "N/A"}
                    </TableCell>
                    <TableCell>
                      {student.academic_details?.[0]?.year_of_admission || "N/A"}
                    </TableCell>
                    <TableCell>
                      {student.academic_details?.[0]?.payment_status || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(student)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
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

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Registration Number</Label>
              <Input
                value={editForm.registration_number}
                onChange={(e) => setEditForm({ ...editForm, registration_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Faculty</Label>
              <Input
                value={editForm.faculty}
                onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })}
              />
            </div>
            <div>
              <Label>Programme</Label>
              <Input
                value={editForm.programme}
                onChange={(e) => setEditForm({ ...editForm, programme: e.target.value })}
              />
            </div>
            <div>
              <Label>Year of Admission</Label>
              <Input
                type="number"
                value={editForm.year_of_admission}
                onChange={(e) => setEditForm({ ...editForm, year_of_admission: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={editForm.payment_status} onValueChange={(value) => setEditForm({ ...editForm, payment_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveAcademicDetails} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
