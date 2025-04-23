"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  BookOpen,
  Building2,
  Upload,
  Check,
  ArrowRight,
  DollarSign,
  Tag,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { mutate } from "swr";
import { mutateBrandsTree } from "@/hooks/useBrandsTree";

const formatCOP = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const parseCOP = (formatted: string): number | null => {
  const cleaned = formatted.replace(/[.$]/g, "").trim();
  if (cleaned === "") return null;
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
};

/* ──────────────────────────────────────────────────────────── */
/*  Componente principal                                       */
/* ──────────────────────────────────────────────────────────── */
export default function GettingStartedPage() {
  const router = useRouter();
  const { toast } = useToast();

  /* ───────────── Estado del formulario ───────────── */
  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [pricingType, setPricingType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState<string>("");
  const [priceValue, setPriceValue] = useState<number | null>(null);

  const [contentType, setContentType] = useState<"courses" | "">("");
  const [submitting, setSubmitting] = useState(false);

  /* ───────────── Progreso ───────────── */
  const isPriceStepComplete =
    pricingType === "FREE" ||
    (pricingType === "PAID" && priceValue !== null && priceValue > 0);

  const step1Done = !!brandName && isPriceStepComplete;

  // 2 · Paso 2 se completa cuando eliges un tipo de contenido
  const step2Done = !!contentType;

  const stepsCompleted = (step1Done ? 1 : 0) + (step2Done ? 1 : 0);
  const totalSteps = 2;
  const progress = Math.round((stepsCompleted / totalSteps) * 100);

  /* ───────────── Manejadores ───────────── */
  function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  }

  function handlePriceChange(e: ChangeEvent<HTMLInputElement>) {
    const num = parseCOP(e.target.value);
    setPriceValue(num);
    setPrice(num !== null ? formatCOP(num) : "");
  }

  function handlePricingTypeChange(v: "FREE" | "PAID") {
    setPricingType(v);
    if (v === "FREE") {
      setPrice("");
      setPriceValue(null);
    }
  }

  /* ───────────── Submit ───────────── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!brandName || !contentType || !isPriceStepComplete) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", brandName);
      if (logo) fd.append("logo", logo);
      fd.append("pricingType", pricingType);
      if (pricingType === "PAID" && priceValue)
        fd.append("price", `${priceValue}`);
      fd.append("contentType", contentType);

      /** JWT desde cookie o localStorage */
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión otra vez.",
          variant: "destructive",
        });
        router.push("/auth");
        return;
      }

      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error inesperado");

      toast({
        title: "¡Éxito!",
        description: "Comunidad creada con éxito.",
        variant: "default",
      });
      mutateBrandsTree();
      router.push("/dashboard"); // o `/dashboard/${json.brand.id}`
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "No se pudo crear la comunidad",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ────────────────  UI ──────────────── */
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      {" "}
      {/* Changed max-w-2xl to max-w-4xl */}
      {/* Encabezado */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-gray-900 dark:text-gray-100">
          ¡Empecemos!
        </h1>
        <p className="text-lg text-muted-foreground">
          Sigue estos pasos para configurar tu espacio y empezar a crear.
        </p>
      </div>
      {/* Barra de progreso */}
      <div className="mb-10 px-4">
        <Progress
          value={progress}
          className="h-3 w-full [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-600"
        />
        <p className="mt-2 text-sm text-right font-medium text-muted-foreground">
          {progress}% completado ({stepsCompleted} de {totalSteps} pasos)
        </p>
      </div>
      {/* Formulario por pasos */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Paso 1: Personaliza tu comunidad */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  brandName && isPriceStepComplete
                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                }`}
              >
                {brandName && isPriceStepComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  1
                )}
              </div>
              <span>Personaliza tu Comunidad</span>
            </CardTitle>
            <CardDescription className="pt-1 pl-10">
              Dale un nombre, logo y define el acceso a tu espacio.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Nombre del Brand */}
            <div className="space-y-2">
              <Label
                htmlFor="brandName"
                className="text-base font-medium flex items-center gap-2"
              >
                <Building2 className="h-5 w-5 text-gray-500" /> Nombre de tu
                marca
              </Label>
              <Input
                id="brandName"
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="text-base"
                placeholder="Ej. Academia Gourmet"
              />
              <p className="text-sm text-muted-foreground pl-1">
                Este será el nombre visible para tus miembros.
              </p>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label
                htmlFor="logo"
                className="text-base font-medium flex items-center gap-2"
              >
                <Upload className="h-5 w-5 text-gray-500" /> Logo (Opcional)
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border">
                    <Building2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogo}
                  className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 dark:file:bg-blue-900/50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                />
              </div>
              <p className="text-sm text-muted-foreground pl-1">
                Recomendado: PNG o JPG cuadrado, máx 2MB.
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-500" /> Tipo de Acceso
              </Label>
              <RadioGroup
                value={pricingType}
                onValueChange={handlePricingTypeChange} // Use the specific handler
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="free"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    pricingType === "FREE"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <RadioGroupItem value="FREE" id="free" className="sr-only" />
                  <span className="font-semibold">Gratis</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acceso libre para todos.
                  </p>
                </Label>
                <Label
                  htmlFor="paid"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    pricingType === "PAID"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <RadioGroupItem value="PAID" id="paid" className="sr-only" />
                  <span className="font-semibold">De pago</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requiere un pago único.
                  </p>
                </Label>
              </RadioGroup>

              {/* Conditional Price Input */}
              {pricingType === "PAID" && (
                <div className="space-y-2 pt-2">
                  <Label
                    htmlFor="price"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <DollarSign className="h-5 w-5 text-gray-500" /> Precio
                    (COP)
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="text"
                      required={pricingType === "PAID"}
                      value={price}
                      onChange={handlePriceChange}
                      className="text-base pl-8"
                      placeholder="Ej: 100.000"
                      inputMode="numeric"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      COP
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-1">
                    Ingresa el valor en pesos colombianos. Ej: 100000 para
                    $100.000 COP.
                  </p>
                  {priceValue !== null && priceValue <= 0 && (
                    <p className="text-sm text-red-600 dark:text-red-500 pl-1">
                      El precio debe ser mayor a cero.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paso 2: Selecciona el tipo de contenido */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  contentType
                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                }`}
              >
                {contentType ? <Check className="h-5 w-5" /> : 2}
              </div>
              <span>Elige tu Contenido Principal</span>
            </CardTitle>
            <CardDescription className="pt-1 pl-10">
              ¿Qué tipo de contenido ofrecerás inicialmente?
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción Cursos */}
              <button
                type="button"
                onClick={() => setContentType("courses")}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                  ${
                    contentType === "courses"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:border-blue-700"
                      : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
              >
                {contentType === "courses" && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <BookOpen
                  className={`h-10 w-10 mb-2 ${
                    contentType === "courses"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
                  Cursos Online
                </span>
                <p className="text-sm text-muted-foreground">
                  Estructura lecciones y módulos.
                </p>
              </button>

              {/* Placeholder para más opciones */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-muted-foreground">
                <div className="h-10 w-10 mb-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <span className="font-semibold text-base">Próximamente...</span>
                <p className="text-sm">Más tipos de contenido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finalizar */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={progress !== 100 || submitting}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out group"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando espacio...
              </>
            ) : (
              <>
                Finalizar Configuración
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
