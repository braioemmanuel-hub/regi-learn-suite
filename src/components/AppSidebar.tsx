import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  User,
  Receipt,
  FileText,
  Calendar,
  ClipboardList,
  Home,
  FileEdit,
  LogOut,
  Users,
  DollarSign,
  GraduationCap,
  Shield,
  UserCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  role: "admin" | "student" | "super_admin";
}

const studentItems = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Fees", url: "/student/fees", icon: CreditCard },
  { title: "Bio Data", url: "/student/biodata", icon: User },
  { title: "Other Payments", url: "/student/payments", icon: Receipt },
  { title: "Course Registration", url: "/student/courses", icon: FileText },
  { title: "Timetable", url: "/student/timetable", icon: Calendar },
  { title: "Results", url: "/student/results", icon: ClipboardList },
  { title: "Hostel", url: "/student/hostel", icon: Home },
  { title: "Change Programme", url: "/student/change-programme", icon: FileEdit },
  { title: "Documents", url: "/student/documents", icon: FileText },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, id: "dashboard" },
  { title: "Approve Registrations", url: "/admin/registrations", icon: Users, id: "registrations" },
  { title: "Manage Students", url: "/admin/students", icon: Users, id: "students" },
  { title: "Update Results", url: "/admin/results", icon: ClipboardList, id: "results" },
  { title: "Manage Payments", url: "/admin/payments", icon: DollarSign, id: "payments" },
  { title: "Manage Courses", url: "/admin/courses", icon: GraduationCap, id: "courses" },
  { title: "Upload Documents", url: "/admin/documents", icon: FileText, id: "documents" },
  { title: "Timetable", url: "/admin/timetable", icon: Calendar, id: "timetable" },
];

const superAdminItems = [
  ...adminItems,
  { title: "Manage Admins", url: "/admin/manage-admins", icon: Shield, id: "manage_admins" },
];

export function AppSidebar({ role }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [allowedMenuItems, setAllowedMenuItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(role === "admin");

  useEffect(() => {
    if (role === "admin" && user) {
      fetchAdminPermissions();
    } else {
      setLoading(false);
    }
  }, [role, user]);

  const fetchAdminPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("menu_item")
        .eq("admin_user_id", user!.id);

      if (error) throw error;
      
      setAllowedMenuItems(data?.map(p => p.menu_item) || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setAllowedMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (role === "student") return studentItems;
    if (role === "super_admin") return superAdminItems;
    
    // For regular admins, filter based on permissions
    return adminItems.filter(item => allowedMenuItems.includes(item.id));
  };

  const items = getFilteredItems();
  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-4">
        <div className="px-4">
          <h2 className={`font-bold text-sidebar-foreground ${isCollapsed ? "text-xs" : "text-lg"}`}>
            {isCollapsed ? "SMS" : "School Management"}
          </h2>
          {!isCollapsed && (
            <p className="text-xs text-sidebar-foreground/70 mt-1">
              {role === "admin" ? "Admin Portal" : "Student Portal"}
            </p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
            ) : (
              <SidebarMenu>
                {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
              
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/profile">
                      <UserCircle className="h-4 w-4" />
                      {!isCollapsed && <span>Profile</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span>Logout</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
