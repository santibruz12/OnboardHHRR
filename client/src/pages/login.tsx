import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const success = await login(data);
      if (success) {
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión exitosamente"
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Error de autenticación",
          description: "Cédula o contraseña incorrecta",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">OnBoard HHRR</h1>
            <p className="text-muted-foreground mt-2">
              Sistema de Gestión de Recursos Humanos
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="cedula">Cédula de Identidad</Label>
              <Input
                id="cedula"
                placeholder="V-12345678"
                {...register("cedula")}
                className={errors.cedula ? "border-destructive" : ""}
              />
              {errors.cedula && (
                <p className="text-sm text-destructive mt-1">{errors.cedula.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Formato: V-12345678 o E-12345678
              </p>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Olvidó su contraseña?{" "}
              <a href="#" className="text-primary hover:underline">
                Recuperar
              </a>
            </p>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials:</p>
            <p className="text-xs font-mono">Cédula: V-12345678</p>
            <p className="text-xs font-mono">Contraseña: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
