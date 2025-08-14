import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertProbationPeriodSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ProbationPeriodWithRelations, EmployeeWithRelations } from "@/types";

const probationFormSchema = insertProbationPeriodSchema.extend({
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  employeeId: z.string().min(1, "Empleado requerido")
});

type ProbationFormData = z.infer<typeof probationFormSchema>;

interface ProbationFormProps {
  probationPeriod?: ProbationPeriodWithRelations | null;
  onSuccess?: () => void;
}

export function ProbationForm({ probationPeriod, onSuccess }: ProbationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get employees for selection
  const { data: employees = [] } = useQuery<EmployeeWithRelations[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<ProbationFormData>({
    resolver: zodResolver(probationFormSchema),
    defaultValues: {
      employeeId: probationPeriod?.employeeId || "",
      startDate: probationPeriod?.startDate || "",
      endDate: probationPeriod?.endDate || "",
      status: probationPeriod?.status || "activo",
      evaluationNotes: probationPeriod?.evaluationNotes || "",
      supervisorRecommendation: probationPeriod?.supervisorRecommendation || "",
      hrNotes: probationPeriod?.hrNotes || ""
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProbationFormData) => apiRequest("/api/probation-periods", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/probation-periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Período de prueba creado",
        description: "El período de prueba ha sido creado exitosamente.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error creating probation period:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo crear el período de prueba.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProbationFormData) => 
      apiRequest(`/api/probation-periods/${probationPeriod!.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/probation-periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Período de prueba actualizado",
        description: "El período de prueba ha sido actualizado exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error updating probation period:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo actualizar el período de prueba.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ProbationFormData) {
    console.log("Form submission values:", values);
    
    if (probationPeriod) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Employee Selection */}
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empleado *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex flex-col">
                        <span>{employee.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {employee.user.cedula} - {employee.cargo.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="activo">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Activo</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="completado">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Completado</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="extendido">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Extendido</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="terminado">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Terminado</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Evaluation Notes */}
        <FormField
          control={form.control}
          name="evaluationNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Evaluación</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas sobre el desempeño del empleado durante el período de prueba..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Supervisor Recommendation */}
        <FormField
          control={form.control}
          name="supervisorRecommendation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recomendación del Supervisor</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Recomendación del supervisor directo..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* HR Notes */}
        <FormField
          control={form.control}
          name="hrNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de RRHH</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observaciones del departamento de recursos humanos..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Procesando..." : probationPeriod ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}