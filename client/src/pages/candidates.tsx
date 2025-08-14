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
import { Plus, Search, FileText, Mail, Phone, User, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
// import { CandidateForm } from "@/components/forms/candidate-form";
import type { CandidateWithRelations } from "@/types";

export function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateWithRelations | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery<CandidateWithRelations[]>({
    queryKey: ["/api/candidates"],
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/candidates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidato eliminado",
        description: "El candidato ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el candidato.",
        variant: "destructive",
      });
    },
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "en_evaluacion": { label: "En Evaluación", variant: "secondary" as const },
      "entrevista": { label: "Entrevista", variant: "default" as const },
      "aprobado": { label: "Aprobado", variant: "default" as const },
      "rechazado": { label: "Rechazado", variant: "destructive" as const },
      "contratado": { label: "Contratado", variant: "default" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEdit = (candidate: CandidateWithRelations) => {
    setEditingCandidate(candidate);
    setDialogOpen(true);
  };

  const handleDelete = (candidate: CandidateWithRelations) => {
    if (window.confirm(`¿Está seguro de eliminar al candidato ${candidate.fullName}?`)) {
      deleteCandidateMutation.mutate(candidate.id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCandidate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Cargando candidatos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidatos</h1>
          <p className="text-muted-foreground">
            Gestiona los candidatos y su proceso de selección
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCandidate(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Candidato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCandidate ? "Editar Candidato" : "Nuevo Candidato"}
              </DialogTitle>
            </DialogHeader>
            <div>Formulario de candidatos en desarrollo...</div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Evaluación</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c: CandidateWithRelations) => c.status === "en_evaluacion").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrevistas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c: CandidateWithRelations) => c.status === "entrevista").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c: CandidateWithRelations) => c.status === "aprobado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c: CandidateWithRelations) => c.status === "contratado").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cédula o email..."
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
            <SelectItem value="en_evaluacion">En Evaluación</SelectItem>
            <SelectItem value="entrevista">Entrevista</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
            <SelectItem value="contratado">Contratado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Candidatos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Envío</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate: CandidateWithRelations) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.fullName}</div>
                      <div className="text-sm text-muted-foreground">{candidate.cedula}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {candidate.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {candidate.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.cargo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {candidate.cargo.departamento.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                  <TableCell>
                    {new Date(candidate.createdAt).toLocaleDateString("es-VE")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(candidate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(candidate)}
                        disabled={deleteCandidateMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCandidates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No se encontraron candidatos con los filtros aplicados." 
                : "No hay candidatos registrados."
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}