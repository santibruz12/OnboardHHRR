import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Mail, Phone, Users, Edit2, Eye, Trash2, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmployeeForm } from "@/components/forms/employee-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, calculateSeniority } from "@/lib/date-utils";
import type { EmpleadoConRelaciones } from "@shared/schema";

export default function Employees() {
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmpleadoConRelaciones | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmpleadoConRelaciones | null>(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateTypeFilter, setDateTypeFilter] = useState("ingreso"); // ingreso o fin
  const [periodFilter, setPeriodFilter] = useState("todos"); // este_mes, esta_semana
  const [yearFilter, setYearFilter] = useState("todos");
  const [monthFilter, setMonthFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery<EmpleadoConRelaciones[]>({
    queryKey: ["/api/employees"]
  });

  // Helper function para obtener número de semana
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Obtener años únicos de las fechas de ingreso
  const availableYears = useMemo(() => {
    const years = employees.map(emp => new Date(emp.fechaIngreso).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [employees]);

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado exitosamente.",
      });
      setDeleteEmployeeId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado.",
        variant: "destructive",
      });
    }
  });

  const sortedAndFilteredEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const nombreCompleto = (employee.nombres && employee.apellidos) ? `${employee.nombres} ${employee.apellidos}` : '';
      const searchMatch = nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.usuario.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.cargo?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === "todos" || (employee.estaActivo ? "activo" : "inactivo") === statusFilter;
      
      // Seleccionar fecha según el tipo de filtro
      const referenceDate = dateTypeFilter === "ingreso" 
        ? new Date(employee.fechaIngreso)
        : employee.fechaFin 
          ? new Date(employee.fechaFin)
          : new Date(employee.fechaIngreso); // Si no hay fecha de fin, usar fecha de ingreso
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentWeek = getWeekNumber(currentDate);
      const refWeek = getWeekNumber(referenceDate);
      
      // Filtro de período (este mes/esta semana)
      let periodMatch = true;
      if (periodFilter === "este_mes") {
        periodMatch = referenceDate.getFullYear() === currentYear && referenceDate.getMonth() + 1 === currentMonth;
      } else if (periodFilter === "esta_semana") {
        periodMatch = referenceDate.getFullYear() === currentYear && refWeek === currentWeek;
      }
      
      // Filtro de año
      const yearMatch = yearFilter === "todos" || referenceDate.getFullYear().toString() === yearFilter;
      
      // Filtro de mes
      const monthMatch = monthFilter === "todos" || (referenceDate.getMonth() + 1).toString() === monthFilter;
      
      return searchMatch && statusMatch && periodMatch && yearMatch && monthMatch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'fullName':
          aValue = ((a.nombres && a.apellidos) ? `${a.nombres} ${a.apellidos}` : '').toLowerCase();
          bValue = ((b.nombres && b.apellidos) ? `${b.nombres} ${b.apellidos}` : '').toLowerCase();
          break;
        case 'cargo':
          aValue = a.cargo?.nombre?.toLowerCase() || '';
          bValue = b.cargo?.nombre?.toLowerCase() || '';
          break;
        case 'startDate':
          aValue = new Date(a.fechaIngreso).getTime();
          bValue = new Date(b.fechaIngreso).getTime();
          break;
        default:
          aValue = ((a.nombres && a.apellidos) ? `${a.nombres} ${a.apellidos}` : '').toLowerCase();
          bValue = ((b.nombres && b.apellidos) ? `${b.nombres} ${b.apellidos}` : '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [employees, searchTerm, statusFilter, dateTypeFilter, periodFilter, yearFilter, monthFilter, sortBy, sortOrder]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (estaActivo: boolean) => {
    if (estaActivo) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
    } else {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
  };

  const handleEditEmployee = (employee: EmpleadoConRelaciones) => {
    setEditingEmployee(employee);
  };

  const handleViewEmployee = (employee: EmpleadoConRelaciones) => {
    setViewingEmployee(employee);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setDeleteEmployeeId(employeeId);
  };

  const confirmDeleteEmployee = () => {
    if (deleteEmployeeId) {
      deleteEmployeeMutation.mutate(deleteEmployeeId);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setDateTypeFilter("ingreso");
    setPeriodFilter("todos");
    setYearFilter("todos");
    setMonthFilter("todos");
    setSortBy("fullName");
    setSortOrder("asc");
  };

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      admin: "Administrador",
      rrhh: "Recursos Humanos",
      supervisor: "Supervisor",
      empleado: "Empleado"
    };

    return (
      <Badge variant="outline" className="text-xs">
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Empleados</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
        <div className="grid gap-4">
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
            <p className="text-muted-foreground">
              Gestiona la información de los empleados de la empresa
            </p>
          </div>
          <Button onClick={() => setIsEmployeeFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por CI, nombre o cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Estado..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los empleados</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="periodo_prueba">Período de Prueba</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40" data-testid="select-sort-by">
                      <SelectValue placeholder="Ordenar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullName">Nombre</SelectItem>
                      <SelectItem value="cargo">Cargo</SelectItem>
                      <SelectItem value="startDate">Fecha Ingreso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-32" data-testid="select-sort-order">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">↑ A-Z</SelectItem>
                      <SelectItem value="desc">↓ Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetFilters}
                    className="px-3"
                    title="Limpiar filtros"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1 flex-wrap">
                  {/* Filtro 1: Tipo de fecha */}
                  <Select value={dateTypeFilter} onValueChange={setDateTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo fecha..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Fecha Ingreso</SelectItem>
                      <SelectItem value="fin">Fecha Fin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Filtro 2: Período */}
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Período..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las fechas</SelectItem>
                      <SelectItem value="este_mes">Este mes</SelectItem>
                      <SelectItem value="esta_semana">Esta semana</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Filtro 3: Año */}
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Año..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los años</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Filtro 4: Mes */}
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Mes..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los meses</SelectItem>
                      <SelectItem value="1">Enero</SelectItem>
                      <SelectItem value="2">Febrero</SelectItem>
                      <SelectItem value="3">Marzo</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Mayo</SelectItem>
                      <SelectItem value="6">Junio</SelectItem>
                      <SelectItem value="7">Julio</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{sortedAndFilteredEmployees.length}</p>
              <p className="text-sm text-muted-foreground">Total Empleados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {sortedAndFilteredEmployees.filter(e => e.estaActivo).length}
              </p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {sortedAndFilteredEmployees.filter(e => !e.estaActivo).length}
              </p>
              <p className="text-sm text-muted-foreground">Inactivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="grid gap-4">
          {sortedAndFilteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(employee.nombres && employee.apellidos) ? (employee.nombres + ' ' + employee.apellidos).split(' ').map((n: string) => n[0]).join('') : 'XX'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{(employee.nombres && employee.apellidos) ? employee.nombres + ' ' + employee.apellidos : 'Sin nombre'}</h3>
                        {getStatusBadge(employee.estaActivo)}
                        {getRoleBadge(employee.usuario.rol)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        {employee.cargo.nombre} • {employee.cargo.departamento.nombre} • Ingreso: {formatDate(employee.fechaIngreso)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{employee.usuario.cedula}</span>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        {employee.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditEmployee(employee)}
                      data-testid={`button-edit-${employee.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewEmployee(employee)}
                      data-testid={`button-view-${employee.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteEmployee(employee.id)}
                      data-testid={`button-delete-${employee.id}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedAndFilteredEmployees.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron empleados</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer empleado"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsEmployeeFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Empleado
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <EmployeeForm
        isOpen={isEmployeeFormOpen}
        onClose={() => setIsEmployeeFormOpen(false)}
      />

      {/* Edit Employee Dialog */}
      <EmployeeForm
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee || undefined}
      />

      {/* View Employee Dialog */}
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {(viewingEmployee.nombres && viewingEmployee.apellidos) ? (viewingEmployee.nombres + ' ' + viewingEmployee.apellidos).split(' ').map(n => n[0]).join('') : 'XX'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{(viewingEmployee.nombres && viewingEmployee.apellidos) ? viewingEmployee.nombres + ' ' + viewingEmployee.apellidos : 'Sin nombre'}</h3>
                  <p className="text-muted-foreground">{viewingEmployee.usuario.cedula}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-sm">{viewingEmployee.telefono || "No especificado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                  <p className="text-sm">{viewingEmployee.cargo.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                  <p className="text-sm">{viewingEmployee.cargo.departamento.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gerencia</label>
                  <p className="text-sm">{viewingEmployee.cargo.departamento.gerencia.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div>{getStatusBadge(viewingEmployee.estaActivo)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <div>{getRoleBadge(viewingEmployee.usuario.rol)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</label>
                  <p className="text-sm">{formatDate(viewingEmployee.fechaIngreso)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Antigüedad</label>
                  <p className="text-sm">{calculateSeniority(viewingEmployee.fechaIngreso)}</p>
                </div>
              </div>

              {viewingEmployee.contract && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Contrato Activo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                      <p className="text-sm">{viewingEmployee.contract.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                      <p className="text-sm">{new Date(viewingEmployee.contract.startDate).toLocaleDateString()}</p>
                    </div>
                    {viewingEmployee.contract.endDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Fin</label>
                        <p className="text-sm">{new Date(viewingEmployee.contract.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteEmployeeMutation.isPending}
            >
              {deleteEmployeeMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
