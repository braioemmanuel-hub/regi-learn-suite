import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  status: string;
  description: string | null;
  due_date: string | null;
  paid_date: string | null;
}

export default function OtherPayments() {
  const { user, userRole } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", user.id)
      .neq("payment_type", "school_fees")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout role={userRole || "student"}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole || "student"}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Other Payments</h1>

        {payments.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No other payments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{payment.payment_type}</span>
                    <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">₦{Number(payment.amount).toLocaleString()}</span>
                    </div>
                    {payment.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span>{payment.description}</span>
                      </div>
                    )}
                    {payment.due_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{new Date(payment.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {payment.paid_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid Date:</span>
                        <span>{new Date(payment.paid_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
