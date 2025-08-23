import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { Contract } from "@shared/schema";

interface ContractWithHistory extends Contract {
  numeroRenovacion: number;
  motivoRenovacion?: string;
  previousContract?: {
    id: string;
    endDate: string;
    type: string;
  };
}

interface ContractHistoryDialogProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contractTypeLabels = {
  indefinido: "Indefinido",
  determinado: "Determinado", 
  temporal: "Temporal",
  proyecto: "Por Proyecto"
};

const contractTypeColors = {
  indefinido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  determinado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  temporal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  proyecto: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
};

const statusLabels = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
  terminado: "Terminado"
};

const statusColors = {
  activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactivo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  suspendido: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  terminado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export function ContractHistoryDialog({ employeeId, employeeName, open, onOpenChange }: ContractHistoryDialogProps) {
  const { data: contracts = [], isLoading } = useQuery<ContractWithHistory[]>({
    queryKey: [`/api/employees/${employeeId}/contracts`],
    enabled: open && !!employeeId
  });

  const activeContract = contracts.find(contract => contract.status === 'activo');
  const contractHistory = contracts.filter(contract => contract.status !== 'activo');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="dialog-contract-history">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Contratos - {employeeName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Contrato Activo */}
            {activeContract && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Calendar className="h-5 w-5" />
                    Contrato Actual
                  </CardTitle>
                  <CardDescription>
                    Contrato vigente del empleado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Tipo:</span>
                      <div>
                        <Badge className={contractTypeColors[activeContract.tipoContrato as keyof typeof contractTypeColors]}>
                          {contractTypeLabels[activeContract.tipoContrato as keyof typeof contractTypeLabels]}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Inicio:</span>
                      <div>{new Date(activeContract.fechaInicio).toLocaleDateString("es-VE")}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Fin:</span>
                      <div>
                        {activeContract.fechaFin 
                          ? new Date(activeContract.fechaFin).toLocaleDateString("es-VE")
                          : "Indefinido"
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Salario:</span>
                      <div className="font-medium">{formatCurrency(activeContract.salario)}</div>
                    </div>
                    {activeContract.numeroRenovacion > 0 && (
                      <>
                        <div>
                          <span className="font-medium text-muted-foreground">Renovación #:</span>
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {activeContract.numeroRenovacion}
                          </div>
                        </div>
                        {activeContract.motivoRenovacion && (
                          <div className="col-span-3">
                            <span className="font-medium text-muted-foreground">Motivo de Renovación:</span>
                            <div>{activeContract.motivoRenovacion}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial de Contratos Anteriores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historial de Contratos ({contractHistory.length})
                </CardTitle>
                <CardDescription>
                  Contratos anteriores y renovaciones del empleado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contractHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay contratos anteriores registrados</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Salario</TableHead>
                        <TableHead>Renovación</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contractHistory.map((contract, index) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {new Date(contract.fechaInicio).toLocaleDateString("es-VE")}
                                {contract.fechaFin && (
                                  <>
                                    <ArrowRight className="h-3 w-3 inline mx-1" />
                                    {new Date(contract.fechaFin).toLocaleDateString("es-VE")}
                                  </>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.ceil((new Date(contract.fechaFin || Date.now()).getTime() - new Date(contract.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={contractTypeColors[contract.tipoContrato as keyof typeof contractTypeColors]}>
                              {contractTypeLabels[contract.tipoContrato as keyof typeof contractTypeLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                              {statusLabels[contract.status as keyof typeof statusLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(contract.salario)}
                          </TableCell>
                          <TableCell>
                            {contract.numeroRenovacion > 0 ? (
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                #{contract.numeroRenovacion}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Original</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-muted-foreground truncate">
                              {contract.motivoRenovacion || 
                               (contract.numeroRenovacion === 0 ? "Contrato inicial" : "-")}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas del Empleado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{contracts.length}</div>
                      <div className="text-sm text-muted-foreground">Total Contratos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.max(...contracts.map(c => c.numeroRenovacion || 0))}
                      </div>
                      <div className="text-sm text-muted-foreground">Renovaciones</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {contracts.length > 0 
                          ? Math.ceil((Date.now() - new Date(contracts[contracts.length - 1]?.fechaInicio || 0).getTime()) / (1000 * 60 * 60 * 24 * 30))
                          : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Meses en la Empresa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}