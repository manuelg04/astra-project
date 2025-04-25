"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await loginUser(email, password);
      if (success) router.push("/dashboard");
      else setError("Contraseña inválida. Por favor, inténtalo de nuevo.");
    } catch {
      setError("Algo salió mal. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tu contraseña para continuar
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Dirección de correo electrónico</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="h-12">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/auth")}
              className="flex items-center justify-center text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al correo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
