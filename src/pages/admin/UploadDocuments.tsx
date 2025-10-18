import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_unique_id: string;
}

export default function UploadDocuments() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    document_name: "",
    document_type: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, student_unique_id")
      .eq("registration_approved", true)
      .order("full_name");

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const uploadDocument = async () => {
    if (!form.file || !selectedStudent) return;

    setUploading(true);

    const fileExt = form.file.name.split(".").pop();
    const fileName = `${selectedStudent}/${Date.now()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("passports")
      .upload(fileName, form.file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("passports")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("documents").insert([
      {
        student_id: selectedStudent,
        document_name: form.document_name,
        document_type: form.document_type,
        document_url: publicUrl,
      },
    ]);

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to save document record",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setDialog(false);
      setForm({ document_name: "", document_type: "", file: null });
      setSelectedStudent("");
    }

    setUploading(false);
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
          <h1 className="text-3xl font-bold">Upload Documents</h1>
          <Button onClick={() => setDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Upload documents to student portals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the upload button to send documents like admission letters, clearance forms, or other important files to individual student portals.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_unique_id} - {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Name</Label>
              <Input
                value={form.document_name}
                onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                placeholder="e.g., Admission Letter"
              />
            </div>
            <div>
              <Label>Document Type</Label>
              <Select
                value={form.document_type}
                onValueChange={(value) => setForm({ ...form, document_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admission_letter">Admission Letter</SelectItem>
                  <SelectItem value="clearance">Clearance Form</SelectItem>
                  <SelectItem value="transcript">Transcript</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Upload File</Label>
              <Input
                type="file"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <Button onClick={uploadDocument} className="w-full" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
