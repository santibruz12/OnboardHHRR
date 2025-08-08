import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CascadingSelects } from "./cascading-selects";
import { employeeFormSchema, type EmployeeFormData } from "@/lib/validators";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeForm({ isOpen, onClose }: EmployeeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      contractType: "indefinido",
      role: "empleado",
      generateProbation: false
    }
  });

  const watchedValues = watch();

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Empleado creado",
        description: "El empleado ha sido registrado exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el empleado",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EmployeeFormData) => {
    createEmployeeMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground border-b pb-2">Información Personal</h3>
              
              <div>
                <Label htmlFor="cedula">Cédula de Identidad *</Label>
                <Input
                  id="cedula"
                  placeholder="V-12345678"
                  {...register("cedula")}
                  className={errors.cedula ? "border-destructive" : ""}
                />
                {errors.cedula && (
                  <p className="text-sm text-destructive mt-1">{errors.cedula.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Formato: V-12345678 o E-12345678</p>
              </div>

              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+58 412-1234567"
                  {...register("phone")}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                />
              </div>
            </div>

            {/* Organizational Structure */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground border-b pb-2">Estructura Organizacional</h3>
              
              <CascadingSelects
                onGerenciaChange={(value) => setValue("gerenciaId", value)}
                onDepartamentoChange={(value) => setValue("departamentoId", value)}
                onCargoChange={(value) => setValue("cargoId", value)}
                values={{
                  gerenciaId: watchedValues.gerenciaId,
                  departamentoId: watchedValues.departamentoId,
                  cargoId: watchedValues.cargoId
                }}
                errors={{
                  gerenciaId: errors.gerenciaId?.message,
                  departamentoId: errors.departamentoId?.message,
                  cargoId: errors.cargoId?.message
                }}
              />

              <div>
                <Label htmlFor="startDate">Fecha de Ingreso *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Rol del Sistema</Label>
                <Select
                  value={watchedValues.role}
                  onValueChange={(value: any) => setValue("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="empleado_captacion">Empleado Captación</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin_rrhh">Admin RRHH</SelectItem>
                    <SelectItem value="gerente_rrhh">Gerente RRHH</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-foreground mb-4">Información Contractual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contractType">Tipo de Contrato *</Label>
                <Select
                  value={watchedValues.contractType}
                  onValueChange={(value: any) => setValue("contractType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indefinido">Por Tiempo Indefinido</SelectItem>
                    <SelectItem value="determinado">Por Tiempo Determinado</SelectItem>
                    <SelectItem value="obra">Por Obra Determinada</SelectItem>
                    <SelectItem value="pasantia">Pasantía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contractStartDate">Fecha Inicio Contrato</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  {...register("contractStartDate")}
                />
              </div>

              <div>
                <Label htmlFor="contractEndDate">Fecha Fin Contrato</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  {...register("contractEndDate")}
                  disabled={watchedValues.contractType === "indefinido"}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                id="generateProbation"
                checked={watchedValues.generateProbation}
                onCheckedChange={(checked) => setValue("generateProbation", !!checked)}
              />
              <Label htmlFor="generateProbation">Generar período de prueba automáticamente</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployeeMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createEmployeeMutation.isPending ? "Registrando..." : "Registrar Empleado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
