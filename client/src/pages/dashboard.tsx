import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, 
  Clock, 
  UserPlus, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  UserCheck,
  Plus,
  BarChart3,
  DoorOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/forms/employee-form";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 5000, // Actualizar cada 5 segundos
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Empleados",
      value: stats?.totalEmployees || 0,
      change: "+12 este mes",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600"
    },
    {
      title: "En Período Prueba",
      value: stats?.probationEmployees || 0,
      change: "3 vencen pronto",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      changeColor: "text-amber-600"
    },
    {
      title: "Total Contratos",
      value: stats?.totalContracts || 0,
      change: "Gestión laboral",
      icon: FileText,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-blue-600"
    },
    {
      title: "Contratos Activos",
      value: stats?.activeContracts || 0,
      change: "En vigencia",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600"
    },
    {
      title: "Contratos por Vencer",
      value: stats?.expiringContracts || 0,
      change: "Próximos 30 días",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      changeColor: "text-red-600"
    }
  ];

  const quickActions = [
    {
      title: "Nuevo Empleado",
      description: "Registrar empleado",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      action: () => setIsEmployeeFormOpen(true)
    },
    {
      title: "Nuevo Contrato",
      description: "Crear contrato",
      icon: FileText,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      action: () => setLocation("/contracts")
    },
    {
      title: "Generar Reporte",
      description: "Reportes personalizados",
      icon: BarChart3,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      action: () => setLocation("/reports")
    },
    {
      title: "Solicitar Egreso",
      description: "Proceso de salida",
      icon: DoorOpen,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      action: () => setLocation("/egresos")
    }
  ];

  const alerts = [
    {
      type: "error",
      icon: AlertTriangle,
      title: "Período de Prueba Vencido",
      description: "Carlos Mendoza - Vencido hace 2 días",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      titleColor: "text-red-900",
      descColor: "text-red-700"
    },
    {
      type: "warning",
      icon: Clock,
      title: "Contrato por Vencer",
      description: "Ana García - Vence en 15 días",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500",
      titleColor: "text-amber-900",
      descColor: "text-amber-700"
    },
    {
      type: "info",
      icon: UserCheck,
      title: "Evaluación Pendiente",
      description: "Luis Rodríguez - Período de prueba",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      titleColor: "text-blue-900",
      descColor: "text-blue-700"
    }
  ];

  const recentActivities = [
    {
      icon: UserPlus,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Nuevo empleado registrado",
      description: "Pedro Martínez se unió al Departamento de Ventas",
      time: "Hace 2 horas"
    },
    {
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Contrato renovado",
      description: "María González - Contrato extendido por 1 año",
      time: "Hace 4 horas"
    },
    {
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Ascenso aprobado",
      description: "José López promovido a Supervisor de Operaciones",
      time: "Ayer"
    }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.changeColor}`}>
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={action.action}
                      className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                        <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Alertas Importantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}
                    >
                      <alert.icon className={`${alert.iconColor} h-4 w-4 mt-1`} />
                      <div>
                        <p className={`text-sm font-medium ${alert.titleColor}`}>{alert.title}</p>
                        <p className={`text-xs ${alert.descColor}`}>{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad Reciente</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/employees")}>
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 hover:bg-accent rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <EmployeeForm
        isOpen={isEmployeeFormOpen}
        onClose={() => setIsEmployeeFormOpen(false)}
      />
    </>
  );
}
