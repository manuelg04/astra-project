"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    const newErrors: { password?: string; confirm?: string } = {};
    if (password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    if (password !== confirmPassword)
      newErrors.confirm = "Las contraseñas no coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsLoading(true);
    try {
      const success = await registerUser(email, password);
      if (success) router.push("/auth/setup-profile");
      else
        setErrors({
          password: "Registro fallido. Por favor, inténtalo de nuevo.",
        });
    } catch {
      setErrors({ password: "Algo salió mal. Por favor, inténtalo de nuevo." });
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
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configura una contraseña para tu nueva cuenta
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
              placeholder="Crea una contraseña"
              required
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
            />
            {errors.confirm && (
              <p className="text-sm text-red-500">{errors.confirm}</p>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="h-12">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </>
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