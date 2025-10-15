import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Payment {
  id: string;
  payment_type: string;
  amount: number;
  status: string;
  description: string;
  due_date: string;
  paid_date: string | null;
}

const Fees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    description: "",
    payment_type: "school_fees"
  });

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", user.id)
      .eq("payment_type", "school_fees")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const handleSubmitPayment = async () => {
    if (!user || !newPayment.amount || !newPayment.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("payments")
      .insert({
        student_id: user.id,
        amount: parseFloat(newPayment.amount),
        description: newPayment.description,
        payment_type: newPayment.payment_type,
        status: "pending",
        due_date: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Payment request submitted successfully. Awaiting admin approval.",
      });
      setDialogOpen(false);
      setNewPayment({ amount: "", description: "", payment_type: "school_fees" });
      fetchPayments();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "destructive",
      processing: "secondary",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">School Fees</h1>
          <p className="text-muted-foreground">View and manage your school fees payments</p>
        </div>

        <Card className="shadow-[var(--card-shadow)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fee Payments</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Payment Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="e.g., School Fees - First Semester"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSubmitPayment} className="w-full">
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payment records found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.description}</TableCell>
                        <TableCell>₦{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : "Not paid"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
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

export default Fees;
