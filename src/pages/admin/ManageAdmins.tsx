import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Admin {
  id: string;
  email: string;
  full_name: string;
  permissions: string[];
}

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", url: "/admin" },
  { id: "registrations", label: "Approve Registrations", url: "/admin/registrations" },
  { id: "students", label: "Manage Students", url: "/admin/students" },
  { id: "results", label: "Update Results", url: "/admin/results" },
  { id: "payments", label: "Manage Payments", url: "/admin/payments" },
  { id: "courses", label: "Manage Courses", url: "/admin/courses" },
  { id: "documents", label: "Upload Documents", url: "/admin/documents" },
  { id: "timetable", label: "Timetable", url: "/admin/timetable" },
];

export default function ManageAdmins() {
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && userRole !== "super_admin") {
      navigate("/admin");
    }
  }, [userRole, authLoading, navigate]);

  useEffect(() => {
    if (userRole === "super_admin") {
      fetchAdmins();
    }
  }, [userRole]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Get all users with admin role
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) {
        setAdmins([]);
        return;
      }

      const adminIds = adminRoles.map(r => r.user_id);

      // Get profiles for these admins
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", adminIds);

      if (profilesError) throw profilesError;

      // Get permissions for each admin
      const { data: permissions, error: permError } = await supabase
        .from("admin_permissions")
        .select("admin_user_id, menu_item")
        .in("admin_user_id", adminIds);

      if (permError) throw permError;

      // Combine data
      const adminsWithPermissions = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        permissions: permissions
          ?.filter(p => p.admin_user_id === profile.id)
          .map(p => p.menu_item) || []
      })) || [];

      setAdmins(adminsWithPermissions);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one menu permission");
      return;
    }

    try {
      // Call the database function to create admin user
      const { data, error } = await supabase.rpc("create_admin_user", {
        _email: email,
        _password: password,
        _full_name: fullName,
        _permissions: selectedPermissions,
      });

      if (error) throw error;

      toast.success("Admin created successfully");
      setDialogOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin");
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      // Delete the user (will cascade to permissions and roles)
      const { error } = await supabase.rpc("delete_user", {
        user_id: adminId
      });

      if (error) throw error;

      toast.success("Admin deleted successfully");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSelectedPermissions([]);
  };

  const togglePermission = (menuId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="super_admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin account and assign menu permissions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Menu Permissions</Label>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        {MENU_ITEMS.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={item.id}
                              checked={selectedPermissions.includes(item.id)}
                              onCheckedChange={() => togglePermission(item.id)}
                            />
                            <Label
                              htmlFor={item.id}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {item.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Admin</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No admins found. Create your first admin to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.full_name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {MENU_ITEMS.find(m => m.id === perm)?.label || perm}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
