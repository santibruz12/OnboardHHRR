import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  BarChart3, 
  Users, 
  FileText, 
  Clock, 
  DoorOpen,
  UserPlus,
  Briefcase,
  Shield,
  FileBarChart,
  Menu,
  X,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { isCollapsed, isMobile, isOpen, toggle, setMobile, setOpen } = useSidebar();
  const { user, employee, logout } = useAuth();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobile]);

  // Close mobile sidebar when location changes
  useEffect(() => {
    if (isMobile && isOpen) {
      setOpen(false);
    }
  }, [location, isMobile, isOpen, setOpen]);

  const menuItems = [
    {
      section: "Principal",
      items: [
        { 
          path: "/dashboard", 
          label: "Dashboard", 
          icon: BarChart3,
          active: location === "/dashboard"
        }
      ]
    },
    {
      section: "Gestión de Personal",
      items: [
        { 
          path: "/employees", 
          label: "Empleados", 
          icon: Users,
          active: location.startsWith("/employees")
        },
        { 
          path: "/contracts", 
          label: "Contratos", 
          icon: FileText,
          active: location.startsWith("/contracts")
        },
        { 
          path: "/probation", 
          label: "Períodos de Prueba", 
          icon: Clock,
          badge: "2",
          active: location.startsWith("/probation")
        },
        { 
          path: "/exits", 
          label: "Egresos", 
          icon: DoorOpen,
          active: location.startsWith("/exits")
        }
      ]
    },
    {
      section: "Reclutamiento",
      items: [
        { 
          path: "/candidates", 
          label: "Candidatos", 
          icon: UserPlus,
          active: location.startsWith("/candidates")
        },
        { 
          path: "/jobs", 
          label: "Ofertas de Trabajo", 
          icon: Briefcase,
          active: location.startsWith("/jobs")
        }
      ]
    },
    {
      section: "Administración",
      items: [
        { 
          path: "/roles", 
          label: "Roles y Permisos", 
          icon: Shield,
          active: location.startsWith("/roles")
        },
        { 
          path: "/reports", 
          label: "Reportes", 
          icon: FileBarChart,
          active: location.startsWith("/reports")
        }
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="p-2"
          >
            {isMobile ? (
              <Menu className="h-4 w-4" />
            ) : isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            {location === "/dashboard" && "Dashboard Principal"}
            {location === "/employees" && "Gestión de Empleados"}
            {location === "/contracts" && "Gestión de Contratos"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {employee?.fullName.split(' ').map((n: string) => n[0]).join('') || user?.cedula.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {employee?.fullName || user?.cedula}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "admin" && "Administrador"}
                {user?.role === "gerente_rrhh" && "Gerente RRHH"}
                {user?.role === "admin_rrhh" && "Admin RRHH"}
                {user?.role === "supervisor" && "Supervisor"}
                {user?.role === "empleado_captacion" && "Empleado Captación"}
                {user?.role === "empleado" && "Empleado"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-sidebar-background border-r border-sidebar-border transition-all duration-300 h-screen z-20",
            isMobile ? (
              isOpen ? "fixed inset-y-0 left-0 w-64 translate-x-0" : "fixed inset-y-0 left-0 w-64 -translate-x-full"
            ) : isCollapsed ? (
              "relative w-16"
            ) : (
              "relative w-64"
            )
          )}
        >
          {/* Sidebar Header */}
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div>
                  <h2 className="text-lg font-bold text-sidebar-foreground">OnBoard</h2>
                  <p className="text-xs text-muted-foreground">HHRR v1.0</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="px-4 pb-4">
            {menuItems.map((section) => (
              <div key={section.section} className="mb-6">
                {(!isCollapsed || isMobile) && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.section}
                  </div>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <div
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                            item.active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {(!isCollapsed || isMobile) && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 min-h-screen overflow-x-hidden">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
