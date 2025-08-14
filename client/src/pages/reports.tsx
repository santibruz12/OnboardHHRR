import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  FileSpreadsheet,
  Filter,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const reportTypes = [
  {
    id: "employees",
    name: "Nómina de Empleados",
    description: "Lista completa de empleados con filtros por departamento y estado",
    icon: Users,
    category: "Empleados"
  },
  {
    id: "movements",
    name: "Movimientos por Período",
    description: "Ingresos, ascensos, traslados y egresos en un período específico",
    icon: TrendingUp,
    category: "Movimientos"
  },
  {
    id: "departures",
    name: "Egresos Detallados",
    description: "Análisis de egresos con motivos y estadísticas de rotación",
    icon: FileText,
    category: "Egresos"
  },
  {
    id: "probation",
    name: "Períodos de Prueba",
    description: "Estados y resultados de períodos de prueba activos y completados",
    icon: Calendar,
    category: "Evaluaciones"
  },
  {
    id: "recruitment",
    name: "Proceso de Reclutamiento",
    description: "Candidatos, ofertas de trabajo y estadísticas de contratación",
    icon: Users,
    category: "Reclutamiento"
  },
  {
    id: "dashboard",
    name: "Indicadores de Gestión",
    description: "KPIs ejecutivos y métricas clave del sistema",
    icon: BarChart3,
    category: "Ejecutivo"
  },
  {
    id: "organizational",
    name: "Estructura Organizacional",
    description: "Organigrama completo con distribución por gerencias y departamentos",
    icon: PieChart,
    category: "Organización"
  },
  {
    id: "audit",
    name: "Auditoría de Cambios",
    description: "Trazabilidad completa de modificaciones en el sistema",
    icon: FileSpreadsheet,
    category: "Auditoría"
  }
];

const categories = Array.from(new Set(reportTypes.map(r => r.category)));

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departamentos"],
    queryFn: async () => {
      const response = await fetch("/api/departamentos");
      if (!response.ok) throw new Error("Error al cargar departamentos");
      return response.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      return response.json();
    }
  });

  const filteredReports = selectedCategory === "all" 
    ? reportTypes 
    : reportTypes.filter(report => report.category === selectedCategory);

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    // Simular generación de reporte
    setTimeout(() => {
      setIsGenerating(false);
      // Aquí se integraría con la API real para generar el reporte
      console.log("Generando reporte:", {
        type: selectedReport,
        dateFrom,
        dateTo,
        departmentFilter,
        statusFilter
      });
    }, 2000);
  };

  const canAccessReport = (reportId: string) => {
    if (!user) return false;
    
    // Admin y Gerente RRHH tienen acceso a todos los reportes
    if (user.role === "admin" || user.role === "gerente_rrhh") {
      return true;
    }
    
    // Admin RRHH puede acceder a la mayoría excepto auditoría
    if (user.role === "admin_rrhh") {
      return reportId !== "audit";
    }
    
    // Supervisores solo pueden ver reportes de su equipo
    if (user.role === "supervisor") {
      return ["employees", "probation", "movements"].includes(reportId);
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes del Sistema</h1>
          <p className="text-muted-foreground">
            Generar reportes y análisis de datos del sistema de RRHH
          </p>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  <p className="text-sm text-muted-foreground">Empleados Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeProbationPeriods}</p>
                  <p className="text-sm text-muted-foreground">En Período Prueba</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalContracts}</p>
                  <p className="text-sm text-muted-foreground">Contratos Vigentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.candidatesInEvaluation}</p>
                  <p className="text-sm text-muted-foreground">Candidatos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Selección de Reportes */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tipos de Reportes Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtro por Categoría */}
              <div className="mb-4">
                <Label>Filtrar por Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Reportes */}
              <div className="grid gap-3">
                {filteredReports.map((report) => {
                  const Icon = report.icon;
                  const hasAccess = canAccessReport(report.id);
                  
                  return (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport === report.id 
                          ? "border-primary bg-primary/5" 
                          : hasAccess 
                            ? "hover:bg-muted" 
                            : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => hasAccess && setSelectedReport(report.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 mt-1 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{report.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {report.category}
                            </Badge>
                            {!hasAccess && (
                              <Badge variant="secondary" className="text-xs">
                                Sin Acceso
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Configuración */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Configuración del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rango de Fechas */}
              <div className="space-y-2">
                <Label>Período</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Desde</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hasta</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtro por Departamento */}
              <div>
                <Label>Departamento</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Estado */}
              <div>
                <Label>Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="periodo_prueba">Período de Prueba</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información del Reporte Seleccionado */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reporte Seleccionado</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const report = reportTypes.find(r => r.id === selectedReport);
                  if (!report) return null;
                  
                  return (
                    <div className="space-y-2">
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <Badge className="text-xs">
                        {report.category}
                      </Badge>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}