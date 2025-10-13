import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2 } from "lucide-react";

interface HostelAssignment {
  id: string;
  hostel_name: string;
  block: string | null;
  room_number: string;
  status: string;
}

export default function Hostel() {
  const { user, userRole } = useAuth();
  const [hostelInfo, setHostelInfo] = useState<HostelAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostelInfo();
  }, [user]);

  const fetchHostelInfo = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("hostel")
      .select("*")
      .eq("student_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setHostelInfo(data);
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
        <h1 className="text-3xl font-bold">Hostel Information</h1>

        {!hostelInfo ? (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No hostel assigned yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hostel Assignment</span>
                <Badge variant={hostelInfo.status === "assigned" ? "default" : "secondary"}>
                  {hostelInfo.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Hostel Name:</span>
                  <span className="font-semibold">{hostelInfo.hostel_name}</span>
                </div>
                {hostelInfo.block && (
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Block:</span>
                    <span className="font-semibold">{hostelInfo.block}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Room Number:</span>
                  <span className="font-semibold">{hostelInfo.room_number}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
