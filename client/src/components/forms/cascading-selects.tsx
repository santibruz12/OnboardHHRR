import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Gerencia, Departamento, Cargo } from "@shared/schema";

interface CascadingSelectsProps {
  onGerenciaChange: (gerenciaId: string) => void;
  onDepartamentoChange: (departamentoId: string) => void;
  onCargoChange: (cargoId: string) => void;
  values: {
    gerenciaId?: string;
    departamentoId?: string;
    cargoId?: string;
  };
  errors?: {
    gerenciaId?: string;
    departamentoId?: string;
    cargoId?: string;
  };
}

export function CascadingSelects({ 
  onGerenciaChange, 
  onDepartamentoChange, 
  onCargoChange, 
  values,
  errors 
}: CascadingSelectsProps) {
  const [selectedGerencia, setSelectedGerencia] = useState(values.gerenciaId || "");
  const [selectedDepartamento, setSelectedDepartamento] = useState(values.departamentoId || "");

  // Fetch gerencias
  const { data: gerencias = [], isLoading: loadingGerencias } = useQuery<Gerencia[]>({
    queryKey: ["/api/gerencias"]
  });

  // Fetch departamentos when gerencia is selected
  const { data: departamentos = [], isLoading: loadingDepartamentos } = useQuery<Departamento[]>({
    queryKey: ["/api/departamentos", selectedGerencia],
    enabled: !!selectedGerencia
  });

  // Fetch cargos when departamento is selected
  const { data: cargos = [], isLoading: loadingCargos } = useQuery<Cargo[]>({
    queryKey: ["/api/cargos", selectedDepartamento],
    enabled: !!selectedDepartamento
  });

  // Reset dependent selects when parent changes
  useEffect(() => {
    if (selectedGerencia !== values.gerenciaId) {
      setSelectedDepartamento("");
      onDepartamentoChange("");
      onCargoChange("");
    }
  }, [selectedGerencia, values.gerenciaId, onDepartamentoChange, onCargoChange]);

  useEffect(() => {
    if (selectedDepartamento !== values.departamentoId) {
      onCargoChange("");
    }
  }, [selectedDepartamento, values.departamentoId, onCargoChange]);

  const handleGerenciaChange = (value: string) => {
    setSelectedGerencia(value);
    onGerenciaChange(value);
  };

  const handleDepartamentoChange = (value: string) => {
    setSelectedDepartamento(value);
    onDepartamentoChange(value);
  };

  return (
    <div className="space-y-4">
      {/* Gerencia Select */}
      <div>
        <Label htmlFor="gerencia">Gerencia *</Label>
        <Select
          value={selectedGerencia}
          onValueChange={handleGerenciaChange}
          disabled={loadingGerencias}
        >
          <SelectTrigger className={errors?.gerenciaId ? "border-destructive" : ""}>
            <SelectValue placeholder="Seleccionar Gerencia" />
          </SelectTrigger>
          <SelectContent>
            {gerencias.map((gerencia) => (
              <SelectItem key={gerencia.id} value={gerencia.id}>
                {gerencia.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.gerenciaId && (
          <p className="text-sm text-destructive mt-1">{errors.gerenciaId}</p>
        )}
      </div>

      {/* Departamento Select */}
      <div>
        <Label htmlFor="departamento">Departamento *</Label>
        <Select
          value={selectedDepartamento}
          onValueChange={handleDepartamentoChange}
          disabled={!selectedGerencia || loadingDepartamentos}
        >
          <SelectTrigger className={errors?.departamentoId ? "border-destructive" : ""}>
            <SelectValue placeholder="Seleccionar Departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((departamento) => (
              <SelectItem key={departamento.id} value={departamento.id}>
                {departamento.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.departamentoId && (
          <p className="text-sm text-destructive mt-1">{errors.departamentoId}</p>
        )}
      </div>

      {/* Cargo Select */}
      <div>
        <Label htmlFor="cargo">Cargo *</Label>
        <Select
          value={values.cargoId || ""}
          onValueChange={onCargoChange}
          disabled={!selectedDepartamento || loadingCargos}
        >
          <SelectTrigger className={errors?.cargoId ? "border-destructive" : ""}>
            <SelectValue placeholder="Seleccionar Cargo" />
          </SelectTrigger>
          <SelectContent>
            {cargos.map((cargo) => (
              <SelectItem key={cargo.id} value={cargo.id}>
                {cargo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.cargoId && (
          <p className="text-sm text-destructive mt-1">{errors.cargoId}</p>
        )}
      </div>
    </div>
  );
}
