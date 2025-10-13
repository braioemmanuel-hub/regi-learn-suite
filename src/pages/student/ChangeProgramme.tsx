import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function ChangeProgramme() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [newProgramme, setNewProgramme] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProgramme || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Request Submitted",
        description: "Your programme change request has been submitted for review",
      });
      setNewProgramme("");
      setReason("");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <DashboardLayout role={userRole || "student"}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Change Programme</h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Programme Change Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="programme">New Programme</Label>
                <Select value={newProgramme} onValueChange={setNewProgramme}>
                  <SelectTrigger id="programme">
                    <SelectValue placeholder="Select new programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Business Administration">Business Administration</SelectItem>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for requesting this programme change..."
                  rows={6}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Important Information</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Programme change requests are subject to approval by the academic board</li>
              <li>Processing may take 2-4 weeks</li>
              <li>You must meet the admission requirements for the new programme</li>
              <li>Additional fees may apply</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
