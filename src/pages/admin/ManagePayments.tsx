import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  status: string;
  student_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ManagePayments() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data as any);
    }
    setLoading(false);
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("payments")
      .update({ 
        status: newStatus,
        paid_date: newStatus === "paid" ? new Date().toISOString() : null
      })
      .eq("id", paymentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Payment ${newStatus === "paid" ? "approved" : "rejected"}`,
      });
      fetchPayments();
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
        <h1 className="text-3xl font-bold">Manage Payments</h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.profiles.full_name}</TableCell>
                    <TableCell>{payment.payment_type}</TableCell>
                    <TableCell>₦{Number(payment.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updatePaymentStatus(payment.id, "paid")}
                        >
                          Mark as Paid
                        </Button>
                      )}
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
