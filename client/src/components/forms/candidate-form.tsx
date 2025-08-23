import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { candidateFormSchema, type CandidateFormData } from "@/lib/validators";
import { apiRequest } from "@/lib/queryClient";
import { CascadingSelects } from "./cascading-selects";
import type { CandidateWithRelations } from "@/types";

interface CandidateFormProps {
  candidate?: CandidateWithRelations;
  onSuccess: () => void;
}

export function CandidateForm({ candidate, onSuccess }: CandidateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!candidate;

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      cedula: candidate?.cedula || "",
      fullName: candidate?.fullName || "",
      email: candidate?.email || "",
      phone: candidate?.phone || "",
      birthDate: candidate?.birthDate || "",
      gerenciaId: candidate?.cargo?.departamento?.gerencia?.id || "",
      departamentoId: candidate?.cargo?.departamento?.id || "",
      cargoId: candidate?.cargoId || "",
      cvUrl: candidate?.cvUrl || "",
      notes: candidate?.notes || "",
      status: candidate?.status || "en_evaluacion",
      evaluationNotes: candidate?.evaluationNotes || "",
    },
  });



  const createCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) =>
      apiRequest("/api/candidates", "POST", {
        cedula: data.cedula,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate || null,
        cargoId: data.cargoId,
        cvUrl: data.cvUrl || null,
        notes: data.notes || null,
        status: "en_evaluacion",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidato creado",
        description: "El candidato ha sido registrado exitosamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el candidato.",
        variant: "destructive",
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) =>
      apiRequest(`/api/candidates/${candidate!.id}`, "PUT", {
        cedula: data.cedula,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate || null,
        cargoId: data.cargoId,
        cvUrl: data.cvUrl || null,
        notes: data.notes || null,
        status: data.status,
        evaluationNotes: data.evaluationNotes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidato actualizado",
        description: "Los datos del candidato han sido actualizados exitosamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el candidato.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CandidateFormData) => {
    if (isEditing) {
      updateCandidateMutation.mutate(data);
    } else {
      createCandidateMutation.mutate(data);
    }
  };

  const isPending = createCandidateMutation.isPending || updateCandidateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="V-12345678 o E-12345678"
                        {...field}
                        data-testid="input-cedula"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre completo del candidato"
                        {...field}
                        data-testid="input-fullname"
                      />
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
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@empresa.com"
                        {...field}
                        data-testid="input-email"
                      />
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0424-1234567"
                        {...field}
                        data-testid="input-phone"
                      />
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
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-birthdate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Información del Cargo */}
          <Card>
            <CardHeader>
              <CardTitle>Cargo Aplicado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CascadingSelects
                values={{
                  gerenciaId: form.watch("gerenciaId"),
                  departamentoId: form.watch("departamentoId"),
                  cargoId: form.watch("cargoId"),
                }}
                errors={{
                  gerenciaId: form.formState.errors.gerenciaId?.message,
                  departamentoId: form.formState.errors.departamentoId?.message,
                  cargoId: form.formState.errors.cargoId?.message,
                }}
                onGerenciaChange={(value) => {
                  form.setValue("gerenciaId", value);
                  form.setValue("departamentoId", "");
                  form.setValue("cargoId", "");
                }}
                onDepartamentoChange={(value) => {
                  form.setValue("departamentoId", value);
                  form.setValue("cargoId", "");
                }}
                onCargoChange={(value) => form.setValue("cargoId", value)}
              />

              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del CV (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/..."
                        {...field}
                        data-testid="input-cv-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones sobre el candidato..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sección de Evaluación (solo para edición) */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Evaluación del Candidato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Candidato</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en_evaluacion">En Evaluación</SelectItem>
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
                name="evaluationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de Evaluación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas sobre la evaluación del candidato..."
                        className="min-h-[120px]"
                        {...field}
                        data-testid="textarea-evaluation-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isPending}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-submit"
          >
            {isPending
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Candidato"
              : "Crear Candidato"}
          </Button>
        </div>
      </form>
    </Form>
  );
}