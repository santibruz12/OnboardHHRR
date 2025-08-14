import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Shield, User, Edit, Eye, UserCheck, UserX } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "gerente_rrhh", "admin_rrhh", "supervisor", "empleado_captacion", "empleado"]),
  isActive: z.boolean()
});

const roleLabels = {
  admin: "Administrador",
  gerente_rrhh: "Gerente RRHH",
  admin_rrhh: "Admin RRHH", 
  supervisor: "Supervisor",
  empleado_captacion: "Empleado Captación",
  empleado: "Empleado"
};

const roleDescriptions = {
  admin: "Acceso total al sistema, configuración y administración de usuarios",
  gerente_rrhh: "Gestión completa de RRHH, aprobación de roles críticos e informes ejecutivos",
  admin_rrhh: "Administración de empleados, contratos, períodos de prueba y reclutamiento",
  supervisor: "Gestión de equipo directo, egresos y evaluaciones de período de prueba",
  empleado_captacion: "Registro de candidatos y gestión inicial de reclutamiento",
  empleado: "Acceso básico según funciones específicas asignadas"
};

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  gerente_rrhh: "bg-red-100 text-red-800",
  admin_rrhh: "bg-blue-100 text-blue-800",
  supervisor: "bg-green-100 text-green-800",
  empleado_captacion: "bg-yellow-100 text-yellow-800",
  empleado: "bg-gray-100 text-gray-800"
};

const roleHierarchy = [
  "admin",
  "gerente_rrhh",
  "admin_rrhh", 
  "supervisor",
  "empleado_captacion",
  "empleado"
];

export default function RolesPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof updateUserRoleSchema>>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      role: "empleado",
      isActive: true
    }
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Error al cargar empleados");
      return response.json();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: z.infer<typeof updateUserRoleSchema> }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al actualizar usuario");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  });

  const handleEditUser = (employee: any) => {
    setSelectedUser(employee);
    form.reset({
      role: employee.user.role,
      isActive: employee.user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (data: z.infer<typeof updateUserRoleSchema>) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        userId: selectedUser.user.id,
        data
      });
    }
  };

  const canEditRole = (targetRole: string) => {
    if (!user) return false;
    
    // Solo admin puede editar todos los roles
    if (user.role === "admin") return true;
    
    // Gerente RRHH puede editar roles inferiores
    if (user.role === "gerente_rrhh") {
      const userHierarchyIndex = roleHierarchy.indexOf(user.role);
      const targetHierarchyIndex = roleHierarchy.indexOf(targetRole);
      return targetHierarchyIndex > userHierarchyIndex;
    }
    
    return false;
  };

  const getRolesByPermission = () => {
    if (!user) return [];
    
    if (user.role === "admin") {
      return roleHierarchy;
    }
    
    if (user.role === "gerente_rrhh") {
      const userIndex = roleHierarchy.indexOf(user.role);
      return roleHierarchy.slice(userIndex + 1);
    }
    
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Verificar permisos
  if (!canEditRole("empleado")) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Roles</h1>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para gestionar roles de usuario. Solo los administradores y gerentes de RRHH pueden acceder a esta sección.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const groupedEmployees = employees.reduce((acc: any, employee: any) => {
    const role = employee.user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(employee);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Roles</h1>
          <p className="text-muted-foreground">
            Administrar roles y permisos de usuarios del sistema
          </p>
        </div>
      </div>

      {/* Información de Jerarquía de Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Jerarquía de Roles del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {roleHierarchy.map((role, index) => (
              <div key={role} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[role as keyof typeof roleColors]}>
                      {roleLabels[role as keyof typeof roleLabels]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({groupedEmployees[role]?.length || 0} usuarios)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roleDescriptions[role as keyof typeof roleDescriptions]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios por Rol */}
      <div className="space-y-6">
        {roleHierarchy.map((role) => {
          const roleEmployees = groupedEmployees[role] || [];
          if (roleEmployees.length === 0) return null;

          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className={roleColors[role as keyof typeof roleColors]}>
                    {roleLabels[role as keyof typeof roleLabels]}
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({roleEmployees.length} usuario{roleEmployees.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {roleEmployees.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{employee.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.user.cedula} • {employee.cargo.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {employee.user.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                        {canEditRole(role) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(employee)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.user.cedula} • {selectedUser.cargo.name}
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getRolesByPermission().map((roleOption) => (
                              <SelectItem key={roleOption} value={roleOption}>
                                {roleLabels[roleOption as keyof typeof roleLabels]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Usuario Activo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Permite o deniega el acceso al sistema
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={updateUserMutation.isPending}>
                      {updateUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}