import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText, Calendar, User, AlertCircle, Edit2, Trash2, Eye, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatDate, formatDateForInput } from "@/lib/date-utils";
import type { Contract, Employee } from "@shared/schema";

interface ContractWithEmployee extends Contract {
  employee?: {
    id: string;
    fullName: string;
    email: string;
    cargo?: { name: string };
  };
}

const contractTypeLabels = {
  indefinido: "Indefinido",
  determinado: "Determinado", 
  obra: "Por Obra",
  pasantia: "Pasantía"
};

const contractTypeColors = {
  indefinido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  determinado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  obra: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  pasantia: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
};

// Helper function to validate contract dates
const validateContractDates = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true; // If either date is missing, consider it valid for now
  return new Date(endDate) >= new Date(startDate);
};

// Helper function to calculate default end date (90 days after start date)
const getDefaultEndDate = (startDate: string): string => {
  if (!startDate) return "";
  const date = new Date(startDate);
  date.setDate(date.getDate() + 90);
  return formatDateForInput(date.toISOString());
};


function ContractForm({ contract, onClose }: { contract?: Contract; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeId: contract?.employeeId || "",
    type: contract?.type || "indefinido",
    startDate: contract?.startDate ? formatDateForInput(contract.startDate) : "",
    endDate: contract?.endDate ? formatDateForInput(contract.endDate) : "",
    isActive: contract?.isActive ?? true
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: !contract // Only load if creating new contract
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al crear contrato");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Contrato creado exitosamente" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error al crear contrato", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/contracts/${contract!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Error al actualizar contrato");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Contrato actualizado exitosamente" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error al actualizar contrato", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.startDate) {
      toast({ title: "Por favor completa todos los campos requeridos", variant: "destructive" });
      return;
    }

    // Validar fechas antes de enviar
    if (formData.endDate && !validateContractDates(formData.startDate, formData.endDate)) {
      toast({ title: "La fecha de fin no puede ser anterior a la fecha de inicio", variant: "destructive" });
      return;
    }

    const data = {
      ...formData,
      endDate: formData.endDate || null
    };

    if (contract) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStartDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, startDate: date }));
    // If the contract is new or type is determined/obra, auto-calculate end date
    if (!contract && (formData.type === "determinado" || formData.type === "obra")) {
      setFormData(prev => ({ ...prev, endDate: getDefaultEndDate(date) }));
    } else if (contract && (contract.type === "determinado" || contract.type === "obra")) {
      // If editing and it's a determined/obra contract, ensure end date is at least 90 days from new start date
      const newEndDate = getDefaultEndDate(date);
      if (!formData.endDate || new Date(formData.endDate) < new Date(newEndDate)) {
        setFormData(prev => ({ ...prev, endDate: newEndDate }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-contract">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employeeId">Empleado *</Label>
          {contract ? (
            <Input 
              value={contract.employeeId} 
              disabled 
              className="bg-muted"
              data-testid="input-employee-disabled"
            />
          ) : (
            <Select 
              value={formData.employeeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
              data-testid="select-employee"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Contrato *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, type: value as any }));
              // Auto-calculate end date if type changes to determined or obra
              if (value === "determinado" || value === "obra") {
                setFormData(prev => ({ ...prev, endDate: getDefaultEndDate(prev.startDate) }));
              } else {
                setFormData(prev => ({ ...prev, endDate: "" })); // Clear end date for other types
              }
            }}
            data-testid="select-contract-type"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indefinido">Indefinido</SelectItem>
              <SelectItem value="determinado">Determinado</SelectItem>
              <SelectItem value="obra">Por Obra</SelectItem>
              <SelectItem value="pasantia">Pasantía</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de Inicio *</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            data-testid="input-start-date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de Finalización</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, endDate: e.target.value }));
              // Ensure endDate is never before startDate
              if (e.target.value && !validateContractDates(formData.startDate, e.target.value)) {
                toast({ title: "La fecha de fin no puede ser anterior a la fecha de inicio", variant: "destructive" });
                setFormData(prev => ({ ...prev, endDate: "" })); // Reset to empty if invalid
              }
            }}
            data-testid="input-end-date"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4"
          data-testid="checkbox-is-active"
        />
        <Label htmlFor="isActive">Contrato activo</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-submit"
        >
          {createMutation.isPending || updateMutation.isPending ? "Guardando..." : contract ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

// Helper function to calculate remaining days
const calculateRemainingDays = (endDate: string | null): { days: number; status: "active" | "warning" | "expired" | "indefinite" } => {
  if (!endDate) return { days: 0, status: "indefinite" };
  
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { days: Math.abs(diffDays), status: "expired" };
  if (diffDays <= 10) return { days: diffDays, status: "warning" };
  return { days: diffDays, status: "active" };
};

type SortField = "employee" | "type" | "startDate" | "endDate" | "remainingDays" | "status";
type SortDirection = "asc" | "desc";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sortField, setSortField] = useState<SortField>("employee");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();

  const { data: contracts = [], isLoading } = useQuery<ContractWithEmployee[]>({
    queryKey: ["/api/contracts"]
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: expiringContracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/contracts/expiring-soon"]
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contracts/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Error al eliminar contrato");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Contrato eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar contrato", variant: "destructive" });
    }
  });

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Filter and sort contracts
  const filteredAndSortedContracts = contracts
    .filter(contract => {
      const matchesSearch = contract.employee?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contractTypeLabels[contract.type].toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = contractFilter === "all" || contract.type === contractFilter;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && contract.isActive) ||
                           (statusFilter === "inactive" && !contract.isActive);

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "employee":
          aValue = a.employee?.fullName || "Sin empleado";
          bValue = b.employee?.fullName || "Sin empleado";
          break;
        case "type":
          aValue = contractTypeLabels[a.type];
          bValue = contractTypeLabels[b.type];
          break;
        case "startDate":
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case "endDate":
          aValue = a.endDate ? new Date(a.endDate) : new Date("9999-12-31");
          bValue = b.endDate ? new Date(b.endDate) : new Date("9999-12-31");
          break;
        case "remainingDays":
          aValue = calculateRemainingDays(a.endDate).days;
          bValue = calculateRemainingDays(b.endDate).days;
          break;
        case "status":
          aValue = a.isActive ? "Activo" : "Inactivo";
          bValue = b.isActive ? "Activo" : "Inactivo";
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const formatContractDate = (date: string | null) => {
    if (!date) return "Sin fecha";
    return formatDate(date);
  };

  const isExpiringSoon = (contract: Contract) => {
    if (!contract.endDate || !contract.isActive) return false;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return endDate >= today && endDate <= thirtyDaysFromNow;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-contracts">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold tracking-tight text-[25px]" data-testid="title-contracts">Gestión de Contratos</h1>
          <p className="text-muted-foreground">
            Administra los contratos laborales de tu organización
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-contract">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contrato
        </Button>
      </div>
      {/* Alerts for expiring contracts */}
      {expiringContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertCircle className="w-5 h-5 mr-2" />
              Contratos por Vencer
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {expiringContracts.length} contrato(s) vencen en los próximos 30 días
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-contracts">{contracts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-active-contracts">
              {contracts.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-expiring-contracts">
              {expiringContracts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indefinidos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-indefinite-contracts">
              {contracts.filter((c) => c.type === "indefinido").length}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado o tipo de contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-contracts"
              />
            </div>

            <Select value={contractFilter} onValueChange={setContractFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-type">
                <SelectValue placeholder="Tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="indefinido">Indefinido</SelectItem>
                <SelectItem value="determinado">Determinado</SelectItem>
                <SelectItem value="obra">Por Obra</SelectItem>
                <SelectItem value="pasantia">Pasantía</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>
            {filteredAndSortedContracts.length} de {contracts.length} contrato(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("employee")}
                    >
                      Empleado
                      {getSortIcon("employee")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("type")}
                    >
                      Tipo
                      {getSortIcon("type")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("startDate")}
                    >
                      Fecha Inicio
                      {getSortIcon("startDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("endDate")}
                    >
                      Fecha Fin
                      {getSortIcon("endDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("remainingDays")}
                    >
                      Días Restantes
                      {getSortIcon("remainingDays")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("status")}
                    >
                      Estado
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedContracts.map((contract) => {
                  const remainingInfo = calculateRemainingDays(contract.endDate);
                  
                  return (
                    <TableRow key={contract.id} data-testid={`row-contract-${contract.id}`}>
                      <TableCell>
                        <div className="font-medium">{contract.employee?.fullName || "Sin empleado"}</div>
                        <div className="text-sm text-muted-foreground">{contract.employee?.email || ""}</div>
                        {contract.employee?.cargo?.name && (
                          <div className="text-xs text-muted-foreground">{contract.employee.cargo.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={contractTypeColors[contract.type]}>
                          {contractTypeLabels[contract.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatContractDate(contract.startDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formatContractDate(contract.endDate)}</span>
                          {isExpiringSoon(contract) && (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {remainingInfo.status === "indefinite" ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Indefinido
                          </Badge>
                        ) : remainingInfo.status === "expired" ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            Vencido hace {remainingInfo.days} día{remainingInfo.days !== 1 ? 's' : ''}
                          </Badge>
                        ) : remainingInfo.status === "warning" ? (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                            {remainingInfo.days} día{remainingInfo.days !== 1 ? 's' : ''} restante{remainingInfo.days !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {remainingInfo.days} día{remainingInfo.days !== 1 ? 's' : ''} restante{remainingInfo.days !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contract.isActive && remainingInfo.status !== "expired" ? "default" : "secondary"}>
                          {remainingInfo.status === "expired" ? "Vencido" : contract.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setShowEditDialog(true);
                            }}
                            data-testid={`button-edit-${contract.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(contract.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${contract.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredAndSortedContracts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-contracts">
                No se encontraron contratos que coincidan con los filtros
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Create Contract Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Contrato</DialogTitle>
            <DialogDescription>
              Complete la información del nuevo contrato laboral
            </DialogDescription>
          </DialogHeader>
          <ContractForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
      {/* Edit Contract Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription>
              Modifique la información del contrato
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <ContractForm 
              contract={selectedContract} 
              onClose={() => {
                setShowEditDialog(false);
                setSelectedContract(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}