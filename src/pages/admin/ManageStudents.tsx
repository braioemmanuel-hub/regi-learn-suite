import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  full_name: string;
  email: string;
  passport_photo: string | null;
  surname: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  address: string | null;
  state: string | null;
  country: string | null;
  lga: string | null;
  hometown: string | null;
  religion: string | null;
  marital_status: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_email: string | null;
  next_of_kin_relationship: string | null;
  next_of_kin_address: string | null;
  student_unique_id: string | null;
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
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    surname: "",
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    address: "",
    state: "",
    country: "",
    lga: "",
    hometown: "",
    religion: "",
    marital_status: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_email: "",
    next_of_kin_relationship: "",
    next_of_kin_address: ""
  });
  const [academicForm, setAcademicForm] = useState({
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
        *,
        academic_details(id, programme, registration_number, payment_status, faculty, year_of_admission)
      `)
      .order("full_name");

    if (!error && data) {
      setStudents(data as any);
    }
    setLoading(false);
  };

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student);
    setViewDialog(true);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setProfileForm({
      full_name: student.full_name || "",
      surname: student.surname || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      gender: student.gender || "",
      date_of_birth: student.date_of_birth || "",
      phone_number: student.phone_number || "",
      address: student.address || "",
      state: student.state || "",
      country: student.country || "",
      lga: student.lga || "",
      hometown: student.hometown || "",
      religion: student.religion || "",
      marital_status: student.marital_status || "",
      next_of_kin_name: student.next_of_kin_name || "",
      next_of_kin_phone: student.next_of_kin_phone || "",
      next_of_kin_email: student.next_of_kin_email || "",
      next_of_kin_relationship: student.next_of_kin_relationship || "",
      next_of_kin_address: student.next_of_kin_address || ""
    });
    if (student.academic_details?.[0]) {
      setAcademicForm({
        registration_number: student.academic_details[0].registration_number,
        faculty: student.academic_details[0].faculty,
        programme: student.academic_details[0].programme,
        year_of_admission: student.academic_details[0].year_of_admission,
        payment_status: student.academic_details[0].payment_status,
      });
    }
    setEditDialog(true);
  };

  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId);
    setDeleteDialog(true);
  };

  const saveStudentDetails = async () => {
    if (!selectedStudent?.id) return;

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileForm)
      .eq("id", selectedStudent.id);

    if (profileError) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    // Update academic details if exists
    if (selectedStudent.academic_details?.[0]?.id) {
      const { error: academicError } = await supabase
        .from("academic_details")
        .update(academicForm)
        .eq("id", selectedStudent.academic_details[0].id);

      if (academicError) {
        toast({
          title: "Error",
          description: "Failed to update academic details",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast({
      title: "Success",
      description: "Student details updated successfully",
    });
    
    setEditDialog(false);
    setSelectedStudent(null);
    await fetchStudents();
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", studentToDelete);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      await fetchStudents();
    }
    
    setDeleteDialog(false);
    setStudentToDelete(null);
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
                        <Button size="sm" variant="outline" onClick={() => openViewDialog(student)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(student)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(student.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStudent.passport_photo || ""} />
                  <AvatarFallback>
                    {selectedStudent.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-xl">{selectedStudent.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStudent.student_unique_id || "N/A"}</p>
                </div>
              </div>

              <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="next-of-kin">Next of Kin</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email</Label><p className="text-sm">{selectedStudent.email}</p></div>
                    <div><Label>Phone</Label><p className="text-sm">{selectedStudent.phone_number || "N/A"}</p></div>
                    <div><Label>Gender</Label><p className="text-sm">{selectedStudent.gender || "N/A"}</p></div>
                    <div><Label>Date of Birth</Label><p className="text-sm">{selectedStudent.date_of_birth || "N/A"}</p></div>
                    <div><Label>Religion</Label><p className="text-sm">{selectedStudent.religion || "N/A"}</p></div>
                    <div><Label>Marital Status</Label><p className="text-sm">{selectedStudent.marital_status || "N/A"}</p></div>
                    <div className="col-span-2"><Label>Address</Label><p className="text-sm">{selectedStudent.address || "N/A"}</p></div>
                    <div><Label>State</Label><p className="text-sm">{selectedStudent.state || "N/A"}</p></div>
                    <div><Label>Country</Label><p className="text-sm">{selectedStudent.country || "N/A"}</p></div>
                    <div><Label>LGA</Label><p className="text-sm">{selectedStudent.lga || "N/A"}</p></div>
                    <div><Label>Hometown</Label><p className="text-sm">{selectedStudent.hometown || "N/A"}</p></div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Registration Number</Label><p className="text-sm">{selectedStudent.academic_details?.[0]?.registration_number || "N/A"}</p></div>
                    <div><Label>Faculty</Label><p className="text-sm">{selectedStudent.academic_details?.[0]?.faculty || "N/A"}</p></div>
                    <div><Label>Programme</Label><p className="text-sm">{selectedStudent.academic_details?.[0]?.programme || "N/A"}</p></div>
                    <div><Label>Year of Admission</Label><p className="text-sm">{selectedStudent.academic_details?.[0]?.year_of_admission || "N/A"}</p></div>
                    <div><Label>Payment Status</Label><p className="text-sm">{selectedStudent.academic_details?.[0]?.payment_status || "N/A"}</p></div>
                  </div>
                </TabsContent>

                <TabsContent value="next-of-kin" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><p className="text-sm">{selectedStudent.next_of_kin_name || "N/A"}</p></div>
                    <div><Label>Phone</Label><p className="text-sm">{selectedStudent.next_of_kin_phone || "N/A"}</p></div>
                    <div><Label>Email</Label><p className="text-sm">{selectedStudent.next_of_kin_email || "N/A"}</p></div>
                    <div><Label>Relationship</Label><p className="text-sm">{selectedStudent.next_of_kin_relationship || "N/A"}</p></div>
                    <div className="col-span-2"><Label>Address</Label><p className="text-sm">{selectedStudent.next_of_kin_address || "N/A"}</p></div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic Info</TabsTrigger>
              <TabsTrigger value="next-of-kin">Next of Kin</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>Surname</Label>
                  <Input value={profileForm.surname} onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })} />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={profileForm.gender} onValueChange={(value) => setProfileForm({ ...profileForm, gender: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={profileForm.date_of_birth} onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={profileForm.phone_number} onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })} />
                </div>
                <div>
                  <Label>Religion</Label>
                  <Input value={profileForm.religion} onChange={(e) => setProfileForm({ ...profileForm, religion: e.target.value })} />
                </div>
                <div>
                  <Label>Marital Status</Label>
                  <Select value={profileForm.marital_status} onValueChange={(value) => setProfileForm({ ...profileForm, marital_status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Textarea value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} />
                </div>
                <div>
                  <Label>LGA</Label>
                  <Input value={profileForm.lga} onChange={(e) => setProfileForm({ ...profileForm, lga: e.target.value })} />
                </div>
                <div>
                  <Label>Hometown</Label>
                  <Input value={profileForm.hometown} onChange={(e) => setProfileForm({ ...profileForm, hometown: e.target.value })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Registration Number</Label>
                  <Input value={academicForm.registration_number} onChange={(e) => setAcademicForm({ ...academicForm, registration_number: e.target.value })} />
                </div>
                <div>
                  <Label>Faculty</Label>
                  <Input value={academicForm.faculty} onChange={(e) => setAcademicForm({ ...academicForm, faculty: e.target.value })} />
                </div>
                <div>
                  <Label>Programme</Label>
                  <Input value={academicForm.programme} onChange={(e) => setAcademicForm({ ...academicForm, programme: e.target.value })} />
                </div>
                <div>
                  <Label>Year of Admission</Label>
                  <Input type="number" value={academicForm.year_of_admission} onChange={(e) => setAcademicForm({ ...academicForm, year_of_admission: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <Select value={academicForm.payment_status} onValueChange={(value) => setAcademicForm({ ...academicForm, payment_status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="next-of-kin" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={profileForm.next_of_kin_name} onChange={(e) => setProfileForm({ ...profileForm, next_of_kin_name: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profileForm.next_of_kin_phone} onChange={(e) => setProfileForm({ ...profileForm, next_of_kin_phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profileForm.next_of_kin_email} onChange={(e) => setProfileForm({ ...profileForm, next_of_kin_email: e.target.value })} />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input value={profileForm.next_of_kin_relationship} onChange={(e) => setProfileForm({ ...profileForm, next_of_kin_relationship: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Textarea value={profileForm.next_of_kin_address} onChange={(e) => setProfileForm({ ...profileForm, next_of_kin_address: e.target.value })} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={saveStudentDetails} className="w-full mt-4">
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone and will permanently remove all student data including academic records, payments, and documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStudent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
