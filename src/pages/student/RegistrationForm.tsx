import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  student_unique_id: string;
  surname: string;
  first_name: string;
  last_name: string;
  gender: string;
  marital_status: string;
  date_of_birth: string;
  place_of_birth: string | null;
  address: string;
  home_address: string | null;
  country: string;
  state: string | null;
  state_of_origin: string;
  lga: string;
  hometown: string | null;
  email: string;
  phone_number: string;
  religion: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_address: string;
  next_of_kin_relationship: string;
  next_of_kin_email: string;
  proposed_course: string;
  passport_photo: string;
  registration_approved: boolean;
}

export default function RegistrationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);

      // If approved, redirect to dashboard
      if (data.registration_approved) {
        toast({
          title: "Registration Approved!",
          description: "You can now access your student dashboard.",
        });
        navigate("/student");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Registration Data Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/register")}>Register Now</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <div className="mb-6 flex gap-4 print:hidden">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Form
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Alert Banner - Hidden when printing */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg print:hidden">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Registration Under Review
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Your registration has been submitted successfully. Please wait for admin approval (2-3 weeks).
            You can print this form for your records.
          </p>
        </div>

        {/* Printable Form */}
        <Card className="print:shadow-none print:border-2">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">GL</span>
              </div>
            </div>
            <CardTitle className="text-2xl">GreenLeaf University</CardTitle>
            <p className="text-sm text-muted-foreground">Student Registration Form</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Student ID and Photo */}
            <div className="flex justify-between items-start border-b pb-6">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="text-2xl font-bold text-primary">{profile.student_unique_id}</p>
              </div>
              {profile.passport_photo && (
                <img
                  src={profile.passport_photo}
                  alt="Passport"
                  className="h-32 w-32 object-cover border-2 border-border rounded"
                />
              )}
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Personal Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Surname</p>
                  <p className="font-medium">{profile.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium">{profile.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium">{profile.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{profile.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Place of Birth</p>
                  <p className="font-medium">{profile.place_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="font-medium capitalize">{profile.marital_status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Religion</p>
                  <p className="font-medium">{profile.religion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{profile.phone_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Home Address</p>
                  <p className="font-medium">{profile.home_address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{profile.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{profile.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State of Origin</p>
                  <p className="font-medium">{profile.state_of_origin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">L.G.A</p>
                  <p className="font-medium">{profile.lga}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hometown</p>
                  <p className="font-medium">{profile.hometown || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Next of Kin */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Next of Kin Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.next_of_kin_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{profile.next_of_kin_relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.next_of_kin_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.next_of_kin_email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{profile.next_of_kin_address}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Academic Information</h3>
              <div>
                <p className="text-sm text-muted-foreground">Proposed Course of Study</p>
                <p className="font-medium">{profile.proposed_course}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p>This is a computer-generated registration form</p>
              <p>Printed on: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}
