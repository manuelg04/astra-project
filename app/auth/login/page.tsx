"use client";

import type React from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu contraseña para continuar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Dirección de correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="h-12 px-4 bg-gray-50 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              className="h-12 px-4 border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg"
            >
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
              className="flex items-center justify-center text-gray-600"
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