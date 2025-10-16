import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PendingStudent {
  id: string;
  student_unique_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  proposed_course: string;
  registration_approved: boolean;
  passport_photo: string | null;
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

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        student_unique_id,
        full_name,
        email,
        phone_number,
        proposed_course,
        registration_approved,
        passport_photo,
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

  const rejectRegistration = async (studentId: string) => {
    // In a real app, you might want to delete or mark as rejected
    toast({
      title: "Info",
      description: "Rejection feature can be implemented based on requirements",
    });
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
        <h1 className="text-3xl font-bold">Approve Registrations</h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pending Student Registrations</CardTitle>
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
                {students.map((student) => (
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
                          onClick={() => rejectRegistration(student.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
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

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Student ID:</p>
                  <p>{selectedStudent.student_unique_id}</p>
                </div>
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{selectedStudent.full_name}</p>
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone:</p>
                  <p>{selectedStudent.phone_number}</p>
                </div>
                <div>
                  <p className="font-semibold">Proposed Course:</p>
                  <p>{selectedStudent.proposed_course}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Documents:</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedStudent.registration_documents?.[0]?.ssce_result && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedStudent.registration_documents[0].ssce_result} target="_blank" rel="noopener noreferrer">
                        SSCE Result
                      </a>
                    </Button>
                  )}
                  {selectedStudent.registration_documents?.[0]?.birth_certificate && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedStudent.registration_documents[0].birth_certificate} target="_blank" rel="noopener noreferrer">
                        Birth Certificate
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {selectedStudent.payments?.[0]?.payment_proof && (
                <div>
                  <p className="font-semibold mb-2">Payment Proof:</p>
                  <img 
                    src={selectedStudent.payments[0].payment_proof} 
                    alt="Payment proof" 
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
