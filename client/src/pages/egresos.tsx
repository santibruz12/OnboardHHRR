import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Eye, Edit, Check, X, FileText } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const egresoFormSchema = z.object({
  employeeId: z.string().min(1, "Empleado requerido"),
  motivo: z.enum([
    "renuncia_voluntaria",
    "despido_causa_justificada", 
    "despido_sin_causa",
    "jubilacion",
    "vencimiento_contrato",
    "periodo_prueba_no_superado",
    "reestructuracion",
    "abandono_trabajo",
    "incapacidad_permanente",
    "fallecimiento"
  ]),
  fechaSolicitud: z.string().min(1, "Fecha de solicitud requerida"),
  fechaEfectiva: z.string().optional(),
  observaciones: z.string().optional(),
  documentosEntregados: z.string().optional(),
  activosEntregados: z.string().optional(),
});

const motivoLabels = {
  renuncia_voluntaria: "Renuncia Voluntaria",
  despido_causa_justificada: "Despido con Causa Justificada",
  despido_sin_causa: "Despido sin Causa",
  jubilacion: "Jubilación",
  vencimiento_contrato: "Vencimiento de Contrato",
  periodo_prueba_no_superado: "Período de Prueba No Superado",
  reestructuracion: "Reestructuración",
  abandono_trabajo: "Abandono de Trabajo",
  incapacidad_permanente: "Incapacidad Permanente",
  fallecimiento: "Fallecimiento"
};

const statusLabels = {
  solicitado: "Solicitado",
  en_revision: "En Revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  procesado: "Procesado",
  cancelado: "Cancelado"
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "solicitado": return "bg-yellow-100 text-yellow-800";
    case "en_revision": return "bg-blue-100 text-blue-800";
    case "aprobado": return "bg-green-100 text-green-800";
    case "rechazado": return "bg-red-100 text-red-800";
    case "procesado": return "bg-gray-100 text-gray-800";
    case "cancelado": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function EgresosPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEgreso, setSelectedEgreso] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof egresoFormSchema>>({
    resolver: zodResolver(egresoFormSchema),
    defaultValues: {
      motivo: "renuncia_voluntaria",
      fechaSolicitud: new Date().toISOString().split('T')[0]
    }
  });

  const { data: egresos = [], isLoading } = useQuery({
    queryKey: ["/api/egresos"],
    queryFn: async () => {
      const response = await fetch("/api/egresos");
      if (!response.ok) throw new Error("Error al cargar egresos");
      return response.json();
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Error al cargar empleados");
      return response.json();
    }
  });

  const createEgresoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof egresoFormSchema>) => {
      const response = await fetch("/api/egresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          status: "solicitado",
          solicitadoPor: user?.id
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear egreso");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/egresos"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error creating egreso:", error);
    }
  });

  const updateEgresoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      const response = await fetch(`/api/egresos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al actualizar egreso");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/egresos"] });
    }
  });

  const handleCreateEgreso = (data: z.infer<typeof egresoFormSchema>) => {
    createEgresoMutation.mutate(data);
  };

  const handleApproveEgreso = (egresoId: string) => {
    updateEgresoMutation.mutate({
      id: egresoId,
      data: {
        status: "aprobado",
        aprobadoPor: user?.id,
        fechaAprobacion: new Date().toISOString()
      }
    });
  };

  const handleRejectEgreso = (egresoId: string, motivo: string) => {
    updateEgresoMutation.mutate({
      id: egresoId,
      data: {
        status: "rechazado",
        motivoRechazo: motivo
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Egresos</h1>
          <p className="text-muted-foreground">
            Administrar las salidas de empleados del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Egreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Egreso</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateEgreso)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empleado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empleado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee: any) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.fullName} - {employee.user?.cedula || 'Sin cédula'}
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
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo del Egreso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(motivoLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaSolicitud"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Solicitud</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaEfectiva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Efectiva</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentosEntregados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documentos Entregados</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activosEntregados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activos Entregados</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createEgresoMutation.isPending}>
                    {createEgresoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Crear Egreso
                  </Button>
                </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {egresos.map((egreso: any) => (
          <Card key={egreso.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {egreso.employee.fullName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {egreso.employee.user.cedula} • {egreso.employee.cargo.name}
                  </p>
                </div>
                <Badge className={getStatusColor(egreso.status)}>
                  {statusLabels[egreso.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Motivo</p>
                  <p>{motivoLabels[egreso.motivo as keyof typeof motivoLabels]}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Fecha Solicitud</p>
                  <p>{format(new Date(egreso.fechaSolicitud), "dd 'de' MMM yyyy", { locale: es })}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Solicitado por</p>
                  <p>{egreso.solicitadoPorUser.cedula}</p>
                </div>
                {egreso.fechaEfectiva && (
                  <div>
                    <p className="font-medium text-muted-foreground">Fecha Efectiva</p>
                    <p>{format(new Date(egreso.fechaEfectiva), "dd 'de' MMM yyyy", { locale: es })}</p>
                  </div>
                )}
              </div>

              {egreso.observaciones && (
                <div className="mt-4">
                  <p className="font-medium text-muted-foreground text-sm">Observaciones</p>
                  <p className="text-sm">{egreso.observaciones}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                {egreso.status === "solicitado" && user?.role === "admin_rrhh" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRejectEgreso(egreso.id, "Rechazado por admin RRHH")}
                      disabled={updateEgresoMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApproveEgreso(egreso.id)}
                      disabled={updateEgresoMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {egresos.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay egresos registrados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}