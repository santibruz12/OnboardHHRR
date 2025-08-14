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
import { Plus, Eye, Edit, Users, Calendar, MapPin, DollarSign } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const jobOfferFormSchema = z.object({
  titulo: z.string().min(1, "Título requerido"),
  descripcion: z.string().min(1, "Descripción requerida"),
  cargoId: z.string().min(1, "Cargo requerido"),
  experienciaRequerida: z.string().optional(),
  educacionRequerida: z.string().optional(),
  habilidadesRequeridas: z.string().optional(),
  salarioMinimo: z.string().optional(),
  salarioMaximo: z.string().optional(),
  tipoContrato: z.enum(["indefinido", "determinado", "obra", "pasantia"]),
  modalidadTrabajo: z.string().optional(),
  ubicacion: z.string().optional(),
  fechaInicioPublicacion: z.string().optional(),
  fechaCierrePublicacion: z.string().optional(),
  vacantesDisponibles: z.string().min(1, "Vacantes requeridas"),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]),
  supervisorAsignado: z.string().optional(),
  notas: z.string().optional(),
});

const statusLabels = {
  borrador: "Borrador",
  publicada: "Publicada",
  pausada: "Pausada",
  cerrada: "Cerrada",
  cancelada: "Cancelada"
};

const priorityLabels = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente"
};

const contractTypeLabels = {
  indefinido: "Indefinido",
  determinado: "Tiempo Determinado",
  obra: "Por Obra",
  pasantia: "Pasantía"
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "borrador": return "bg-gray-100 text-gray-800";
    case "publicada": return "bg-green-100 text-green-800";
    case "pausada": return "bg-yellow-100 text-yellow-800";
    case "cerrada": return "bg-blue-100 text-blue-800";
    case "cancelada": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "baja": return "bg-gray-100 text-gray-800";
    case "media": return "bg-blue-100 text-blue-800";
    case "alta": return "bg-orange-100 text-orange-800";
    case "urgente": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function JobOffersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof jobOfferFormSchema>>({
    resolver: zodResolver(jobOfferFormSchema),
    defaultValues: {
      tipoContrato: "indefinido",
      prioridad: "media",
      vacantesDisponibles: "1"
    }
  });

  const { data: jobOffers = [], isLoading } = useQuery({
    queryKey: ["/api/job-offers"],
    queryFn: async () => {
      const response = await fetch("/api/job-offers");
      if (!response.ok) throw new Error("Error al cargar ofertas");
      return response.json();
    }
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ["/api/cargos"],
    queryFn: async () => {
      const response = await fetch("/api/cargos");
      if (!response.ok) throw new Error("Error al cargar cargos");
      return response.json();
    }
  });

  const { data: supervisors = [] } = useQuery({
    queryKey: ["/api/users", "supervisors"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Error al cargar supervisores");
      const employees = await response.json();
      return employees.filter((emp: any) => 
        emp.user.role === "supervisor" || emp.user.role === "admin_rrhh"
      );
    }
  });

  const createJobOfferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobOfferFormSchema>) => {
      const formattedData = {
        ...data,
        salarioMinimo: data.salarioMinimo ? parseInt(data.salarioMinimo) : null,
        salarioMaximo: data.salarioMaximo ? parseInt(data.salarioMaximo) : null,
        vacantesDisponibles: parseInt(data.vacantesDisponibles)
      };
      
      const response = await fetch("/api/job-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });
      if (!response.ok) throw new Error("Error al crear oferta");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-offers"] });
      setIsCreateDialogOpen(false);
      form.reset();
    }
  });

  const updateJobOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      const response = await fetch(`/api/job-offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al actualizar oferta");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-offers"] });
    }
  });

  const handleCreateJobOffer = (data: z.infer<typeof jobOfferFormSchema>) => {
    createJobOfferMutation.mutate(data);
  };

  const handlePublishOffer = (offerId: string) => {
    updateJobOfferMutation.mutate({
      id: offerId,
      data: { status: "publicada" }
    });
  };

  const handlePauseOffer = (offerId: string) => {
    updateJobOfferMutation.mutate({
      id: offerId,
      data: { status: "pausada" }
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
          <h1 className="text-3xl font-bold">Ofertas de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestionar ofertas de trabajo y proceso de reclutamiento
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oferta de Trabajo</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateJobOffer)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Oferta</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Analista de RRHH Senior" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cargo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargos.map((cargo: any) => (
                              <SelectItem key={cargo.id} value={cargo.id}>
                                {cargo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Puesto</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Describe las responsabilidades y funciones del puesto..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipoContrato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Contrato</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(contractTypeLabels).map(([key, label]) => (
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

                  <FormField
                    control={form.control}
                    name="prioridad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(priorityLabels).map(([key, label]) => (
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vacantesDisponibles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vacantes Disponibles</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salarioMinimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Mínimo (Bs.)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salarioMaximo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Máximo (Bs.)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modalidadTrabajo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidad de Trabajo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar modalidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="remoto">Remoto</SelectItem>
                            <SelectItem value="hibrido">Híbrido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Caracas, Venezuela" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="experienciaRequerida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experiencia Requerida</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Describe la experiencia necesaria..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="educacionRequerida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educación Requerida</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Describe la formación académica necesaria..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="habilidadesRequeridas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades Requeridas</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Lista las habilidades técnicas y blandas..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaInicioPublicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Inicio Publicación</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaCierrePublicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Cierre Publicación</FormLabel>
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
                  name="supervisorAsignado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Asignado (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar supervisor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supervisors.map((supervisor: any) => (
                            <SelectItem key={supervisor.user.id} value={supervisor.user.id}>
                              {supervisor.fullName} - {supervisor.user?.cedula || 'Sin cédula'}
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
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Comentarios internos sobre la oferta..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createJobOfferMutation.isPending}>
                    {createJobOfferMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Crear Oferta
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {jobOffers.map((offer: any) => (
          <Card key={offer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{offer.titulo}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {offer.cargo.name} • {offer.cargo.departamento.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(offer.prioridad)}>
                    {priorityLabels[offer.prioridad as keyof typeof priorityLabels]}
                  </Badge>
                  <Badge className={getStatusColor(offer.status)}>
                    {statusLabels[offer.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{offer.vacantesDisponibles} vacante{offer.vacantesDisponibles > 1 ? 's' : ''}</p>
                    <p className="text-muted-foreground">{offer.applicationsCount || 0} aplicaciones</p>
                  </div>
                </div>
                
                {(offer.salarioMinimo || offer.salarioMaximo) && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Salario</p>
                      <p className="text-muted-foreground">
                        {offer.salarioMinimo && offer.salarioMaximo 
                          ? `Bs. ${offer.salarioMinimo.toLocaleString()} - ${offer.salarioMaximo.toLocaleString()}`
                          : offer.salarioMinimo 
                            ? `Desde Bs. ${offer.salarioMinimo.toLocaleString()}`
                            : `Hasta Bs. ${offer.salarioMaximo.toLocaleString()}`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {offer.modalidadTrabajo && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{offer.modalidadTrabajo}</p>
                      {offer.ubicacion && <p className="text-muted-foreground">{offer.ubicacion}</p>}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Creada</p>
                    <p className="text-muted-foreground">
                      {format(new Date(offer.createdAt), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {offer.descripcion}
              </p>

              <div className="flex justify-end space-x-2">
                {offer.status === "borrador" && (
                  <Button 
                    size="sm"
                    onClick={() => handlePublishOffer(offer.id)}
                    disabled={updateJobOfferMutation.isPending}
                  >
                    Publicar
                  </Button>
                )}
                {offer.status === "publicada" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePauseOffer(offer.id)}
                    disabled={updateJobOfferMutation.isPending}
                  >
                    Pausar
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Aplicaciones
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobOffers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay ofertas de trabajo registradas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}