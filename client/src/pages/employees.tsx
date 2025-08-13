import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Users, Edit2, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmployeeForm } from "@/components/forms/employee-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EmployeeWithRelations } from "@shared/schema";

export default function Employees() {
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithRelations | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeWithRelations | null>(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery<EmployeeWithRelations[]>({
    queryKey: ["/api/employees"]
  });

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

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.user.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activo":
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case "inactivo":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "periodo_prueba":
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Período Prueba</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEditEmployee = (employee: EmployeeWithRelations) => {
    setEditingEmployee(employee);
  };

  const handleViewEmployee = (employee: EmployeeWithRelations) => {
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

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      admin: "Administrador",
      gerente_rrhh: "Gerente RRHH",
      admin_rrhh: "Admin RRHH",
      supervisor: "Supervisor",
      empleado_captacion: "Captación",
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cédula o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Total Empleados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {employees.filter(e => e.status === "activo").length}
              </p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {employees.filter(e => e.status === "periodo_prueba").length}
              </p>
              <p className="text-sm text-muted-foreground">En Período Prueba</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="grid gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{employee.fullName}</h3>
                        {getStatusBadge(employee.status)}
                        {getRoleBadge(employee.user.role)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        {employee.cargo.name} • {employee.cargo.departamento.name}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{employee.user.cedula}</span>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
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
        {filteredEmployees.length === 0 && !isLoading && (
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
                    {viewingEmployee.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{viewingEmployee.fullName}</h3>
                  <p className="text-muted-foreground">{viewingEmployee.user.cedula}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-sm">{viewingEmployee.phone || "No especificado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                  <p className="text-sm">{viewingEmployee.cargo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                  <p className="text-sm">{viewingEmployee.cargo.departamento.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gerencia</label>
                  <p className="text-sm">{viewingEmployee.cargo.departamento.gerencia.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div>{getStatusBadge(viewingEmployee.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <div>{getRoleBadge(viewingEmployee.user.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</label>
                  <p className="text-sm">{new Date(viewingEmployee.startDate).toLocaleDateString()}</p>
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
