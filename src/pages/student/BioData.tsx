import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BioData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    hometown: "",
    home_address: "",
    state: "",
    place_of_birth: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_address: "",
    marital_status: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        hometown: data.hometown || "",
        home_address: data.home_address || "",
        state: data.state || "",
        place_of_birth: data.place_of_birth || "",
        next_of_kin_name: data.next_of_kin_name || "",
        next_of_kin_phone: data.next_of_kin_phone || "",
        next_of_kin_address: data.next_of_kin_address || "",
        marital_status: data.marital_status || "",
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bio Data</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-[var(--card-shadow)]">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hometown">Hometown</Label>
                  <Input
                    id="hometown"
                    name="hometown"
                    value={formData.hometown}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place_of_birth">Place of Birth</Label>
                  <Input
                    id="place_of_birth"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Input
                    id="marital_status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_address">Home Address</Label>
                <Input
                  id="home_address"
                  name="home_address"
                  value={formData.home_address}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--card-shadow)] mt-6">
            <CardHeader>
              <CardTitle>Next of Kin Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next_of_kin_name">Name</Label>
                  <Input
                    id="next_of_kin_name"
                    name="next_of_kin_name"
                    value={formData.next_of_kin_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_of_kin_phone">Phone</Label>
                  <Input
                    id="next_of_kin_phone"
                    name="next_of_kin_phone"
                    value={formData.next_of_kin_phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_address">Address</Label>
                <Input
                  id="next_of_kin_address"
                  name="next_of_kin_address"
                  value={formData.next_of_kin_address}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default BioData;
