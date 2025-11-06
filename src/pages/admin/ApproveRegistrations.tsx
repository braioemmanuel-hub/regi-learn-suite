import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Eye, Download } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PendingStudent {
  id: string;
  student_unique_id: string;
  full_name: string;
  surname: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string | null;
  marital_status: string;
  religion: string;
  address: string;
  home_address: string | null;
  country: string;
  state: string | null;
  state_of_origin: string;
  lga: string;
  hometown: string | null;
  proposed_course: string;
  registration_approved: boolean;
  passport_photo: string | null;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_email: string;
  next_of_kin_address: string;
  next_of_kin_relationship: string;
  registration_documents: Array<{
    ssce_result: string;
    birth_certificate: string;
    state_of_origin_cert: string;
  }>;
  payments: Array<{
    amount: number;
    payment_proof: string;
    status: string;
  }>;
}

export default function ApproveRegistrations() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [studentToReject, setStudentToReject] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        registration_documents(ssce_result, birth_certificate, state_of_origin_cert),
        payments(amount, payment_proof, status)
      `)
      .eq('registration_approved', false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStudents(data as any);
    }
    setLoading(false);
  };

  const approveRegistration = async (studentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("profiles")
      .update({
        registration_approved: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", studentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Registration approved successfully",
      });
      fetchPendingStudents();
    }
  };

  const handleRejectClick = (studentId: string) => {
    setStudentToReject(studentId);
    setRejectDialog(true);
  };

  const confirmRejectRegistration = async () => {
    if (!studentToReject) return;

    // Delete profile (cascade delete will handle auth.users and related data)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", studentToReject);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Registration rejected successfully",
      });
      fetchPendingStudents();
    }
    
    setRejectDialog(false);
    setStudentToReject(null);
  };

  const exportToCSV = () => {
    const headers = [
      "Student ID", "Full Name", "Email", "Phone", "Gender", "Date of Birth",
      "Proposed Course", "Payment Status", "Address", "State", "Country",
      "Next of Kin Name", "Next of Kin Phone"
    ];
    
    const rows = students.map(student => [
      student.student_unique_id || "N/A",
      student.full_name,
      student.email,
      student.phone_number,
      student.gender,
      student.date_of_birth,
      student.proposed_course,
      student.payments?.[0]?.status || "No Payment",
      student.address,
      student.state || "N/A",
      student.country,
      student.next_of_kin_name,
      student.next_of_kin_phone
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pending_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Registration data exported successfully",
    });
  };

  // Pagination calculations
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

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
          <h1 className="text-3xl font-bold">Approve Registrations</h1>
          <Button onClick={exportToCSV} variant="outline" disabled={students.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pending Student Registrations ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No pending registrations
                    </TableCell>
                  </TableRow>
                ) : (
                  currentStudents.map((student) => (
                    <TableRow key={student.id}>
                    <TableCell>{student.student_unique_id}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.proposed_course}</TableCell>
                    <TableCell>
                      <Badge variant={student.payments?.[0]?.status === "paid" ? "default" : "secondary"}>
                        {student.payments?.[0]?.status || "No Payment"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setViewDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveRegistration(student.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(student.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Registration Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student ID and Photo */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="text-xl font-bold text-primary">{selectedStudent.student_unique_id}</p>
                </div>
                {selectedStudent.passport_photo && (
                  <img
                    src={selectedStudent.passport_photo}
                    alt="Passport"
                    className="h-32 w-32 object-cover border-2 border-border rounded"
                  />
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Personal Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Surname</p>
                    <p className="font-medium">{selectedStudent.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{selectedStudent.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{selectedStudent.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(selectedStudent.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Place of Birth</p>
                    <p className="font-medium">{selectedStudent.place_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium capitalize">{selectedStudent.marital_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Religion</p>
                    <p className="font-medium">{selectedStudent.religion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedStudent.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudent.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedStudent.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Home Address</p>
                    <p className="font-medium">{selectedStudent.home_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{selectedStudent.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{selectedStudent.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State of Origin</p>
                    <p className="font-medium">{selectedStudent.state_of_origin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">L.G.A</p>
                    <p className="font-medium">{selectedStudent.lga}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hometown</p>
                    <p className="font-medium">{selectedStudent.hometown || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Next of Kin Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedStudent.next_of_kin_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{selectedStudent.next_of_kin_relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedStudent.next_of_kin_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudent.next_of_kin_email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedStudent.next_of_kin_address}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Academic Information</h3>
                <div>
                  <p className="text-sm text-muted-foreground">Proposed Course</p>
                  <p className="font-medium">{selectedStudent.proposed_course}</p>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedStudent.registration_documents?.[0]?.ssce_result && (
                    <Button variant="outline" asChild>
                      <a href={selectedStudent.registration_documents[0].ssce_result} target="_blank" rel="noopener noreferrer">
                        View SSCE Result
                      </a>
                    </Button>
                  )}
                  {selectedStudent.registration_documents?.[0]?.birth_certificate && (
                    <Button variant="outline" asChild>
                      <a href={selectedStudent.registration_documents[0].birth_certificate} target="_blank" rel="noopener noreferrer">
                        View Birth Certificate
                      </a>
                    </Button>
                  )}
                  {selectedStudent.registration_documents?.[0]?.state_of_origin_cert && (
                    <Button variant="outline" asChild>
                      <a href={selectedStudent.registration_documents[0].state_of_origin_cert} target="_blank" rel="noopener noreferrer">
                        View State of Origin Certificate
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {selectedStudent.payments?.[0] && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Payment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">₦{selectedStudent.payments[0].amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedStudent.payments[0].status === "paid" ? "default" : "secondary"}>
                        {selectedStudent.payments[0].status}
                      </Badge>
                    </div>
                    {selectedStudent.payments[0].payment_proof && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                        <img 
                          src={selectedStudent.payments[0].payment_proof} 
                          alt="Payment proof" 
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to reject this registration?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student's registration and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRejectRegistration}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
