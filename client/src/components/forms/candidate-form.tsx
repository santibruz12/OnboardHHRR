import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCandidateSchema } from "@shared/schema";
import { z } from "zod";
import type { CandidateWithRelations } from "@/types";
// import { CascadingSelects } from "./cascading-selects";

const candidateFormSchema = z.object({
  cedula: z.string()
    .min(1, "La cédula es requerida")
    .regex(/^[VEve]-\d{7,8}$/, "Formato de cédula inválido (V-12345678 o E-12345678)"),
  fullName: z.string().min(1, "El nombre completo es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  cargoId: z.string().min(1, "El cargo es requerido"),
  cvUrl: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["en_evaluacion", "entrevista", "aprobado", "rechazado", "contratado"]).default("en_evaluacion"),
  evaluatedBy: z.string().optional(),
  evaluationNotes: z.string().optional(),
  evaluationDate: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

interface CandidateFormProps {
  candidate?: CandidateWithRelations | null;
  onSuccess?: () => void;
}

export function CandidateForm({ candidate, onSuccess }: CandidateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      cedula: candidate?.cedula || "",
      fullName: candidate?.fullName || "",
      email: candidate?.email || "",
      phone: candidate?.phone || "",
      birthDate: candidate?.birthDate || "",
      cargoId: candidate?.cargoId || "",
      cvUrl: candidate?.cvUrl || "",
      notes: candidate?.notes || "",
      status: candidate?.status || "en_evaluacion",
      evaluatedBy: candidate?.evaluatedBy || "",
      evaluationNotes: candidate?.evaluationNotes || "",
      evaluationDate: candidate?.evaluationDate || "",
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) => apiRequest("/api/candidates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidato creado",
        description: "El candidato ha sido creado exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error creating candidate:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el candidato.",
        variant: "destructive",
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) => apiRequest(`/api/candidates/${candidate?.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidato actualizado",
        description: "El candidato ha sido actualizado exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error updating candidate:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el candidato.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CandidateFormData) => {
    if (candidate) {
      updateCandidateMutation.mutate(data);
    } else {
      createCandidateMutation.mutate(data);
    }
  };

  const isPending = createCandidateMutation.isPending || updateCandidateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Personal</h3>
            
            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula *</FormLabel>
                  <FormControl>
                    <Input placeholder="V-12345678" {...field} />
                  </FormControl>
                  <FormDescription>
                    Formato: V-12345678 o E-12345678
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input placeholder="+58 412-1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Información de Candidatura */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información de Candidatura</h3>
            
            <FormField
              control={form.control}
              name="cargoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <FormControl>
                    <Input placeholder="ID del cargo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Por ahora ingrese el ID del cargo. Se mejorará en la siguiente iteración.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en_evaluacion">En Evaluación</SelectItem>
                      <SelectItem value="entrevista">Entrevista</SelectItem>
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                      <SelectItem value="contratado">Contratado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del CV</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/cv.pdf" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enlace al currículum vitae del candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre el candidato..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evaluationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Evaluación</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas de la evaluación del candidato..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evaluationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Evaluación</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : candidate ? "Actualizar" : "Crear"} Candidato
          </Button>
        </div>
      </form>
    </Form>
  );
}