import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ProbationForm } from "@/components/forms/probation-form";
import type { ProbationPeriodWithRelations } from "@/types";

export function ProbationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProbationPeriod, setEditingProbationPeriod] = useState<ProbationPeriodWithRelations | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: probationPeriods = [], isLoading } = useQuery<ProbationPeriodWithRelations[]>({
    queryKey: ["/api/probation-periods"],
  });

  const deleteProbationPeriodMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/probation-periods/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/probation-periods"] });
      toast({
        title: "Período de prueba eliminado",
        description: "El período de prueba ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el período de prueba.",
        variant: "destructive",
      });
    },
  });

  const filteredProbationPeriods = probationPeriods.filter((probationPeriod) => {
    const matchesSearch = 
      probationPeriod.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      probationPeriod.employee.user.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      probationPeriod.employee.cargo.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || probationPeriod.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "activo": { label: "Activo", variant: "default" as const, icon: Clock },
      "completado": { label: "Completado", variant: "default" as const, icon: CheckCircle },
      "extendido": { label: "Extendido", variant: "secondary" as const, icon: AlertTriangle },
      "terminado": { label: "Terminado", variant: "destructive" as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: "secondary" as const, 
      icon: Clock 
    };
    
    const IconComponent = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingBadge = (endDate: string, status: string) => {
    if (status !== "activo") return null;
    
    const daysRemaining = getDaysRemaining(endDate);
    
    if (daysRemaining < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (daysRemaining <= 7) {
      return <Badge variant="destructive">{daysRemaining} días</Badge>;
    } else if (daysRemaining <= 30) {
      return <Badge variant="secondary">{daysRemaining} días</Badge>;
    } else {
      return <Badge variant="outline">{daysRemaining} días</Badge>;
    }
  };

  const handleEdit = (probationPeriod: ProbationPeriodWithRelations) => {
    setEditingProbationPeriod(probationPeriod);
    setDialogOpen(true);
  };

  const handleDelete = (probationPeriod: ProbationPeriodWithRelations) => {
    if (window.confirm(`¿Está seguro de eliminar el período de prueba de ${probationPeriod.employee.fullName}?`)) {
      deleteProbationPeriodMutation.mutate(probationPeriod.id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProbationPeriod(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Cargando períodos de prueba...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Períodos de Prueba</h1>
          <p className="text-muted-foreground">
            Gestiona los períodos de prueba de los empleados
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProbationPeriod(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Período
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProbationPeriod ? "Editar Período de Prueba" : "Nuevo Período de Prueba"}
              </DialogTitle>
            </DialogHeader>
            <ProbationForm 
              probationPeriod={editingProbationPeriod} 
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Períodos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{probationPeriods.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {probationPeriods.filter(pp => pp.status === "activo").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {probationPeriods.filter(pp => 
                pp.status === "activo" && getDaysRemaining(pp.endDate) <= 30
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {probationPeriods.filter(pp => pp.status === "completado").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado, cédula o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="extendido">Extendido</SelectItem>
            <SelectItem value="terminado">Terminado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Probation Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Períodos de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tiempo Restante</TableHead>
                <TableHead>Evaluación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProbationPeriods.map((probationPeriod) => (
                <TableRow key={probationPeriod.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{probationPeriod.employee.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {probationPeriod.employee.user.cedula}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{probationPeriod.employee.cargo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {probationPeriod.employee.cargo.departamento.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(probationPeriod.startDate).toLocaleDateString("es-VE")} - 
                        {new Date(probationPeriod.endDate).toLocaleDateString("es-VE")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(probationPeriod.endDate).getTime() - new Date(probationPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(probationPeriod.status)}</TableCell>
                  <TableCell>
                    {getDaysRemainingBadge(probationPeriod.endDate, probationPeriod.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {probationPeriod.evaluationNotes && (
                        <div className="text-sm">{probationPeriod.evaluationNotes.substring(0, 50)}...</div>
                      )}
                      {probationPeriod.supervisorRecommendation && (
                        <div className="text-xs text-muted-foreground">
                          Recomendación: {probationPeriod.supervisorRecommendation.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(probationPeriod)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(probationPeriod)}
                        disabled={deleteProbationPeriodMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredProbationPeriods.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No se encontraron períodos de prueba con los filtros aplicados." 
                : "No hay períodos de prueba registrados."
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}