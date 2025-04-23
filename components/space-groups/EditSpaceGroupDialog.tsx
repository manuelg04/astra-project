"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign, Palette, Smile, Globe, Loader2 } from "lucide-react";
import { getAuthToken } from "@/lib/auth";

interface Props {
  open: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    price: string;
    pricingType: "FREE" | "PAID";
    isPublic: boolean;
    color?: string | null;
    emoji?: string | null;
  } | null;
  onSaved: (g: Props["group"]) => void;
}

export default function EditSpaceGroupDialog({
  open,
  onClose,
  group,
  onSaved,
}: Props) {
  const [form, setForm] = useState(group);
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(group);
    setTab("general");
  }, [group]);

  if (!form) return null;

  const change = (k: keyof typeof form, v: any) =>
    setForm((p) => ({ ...p!, [k]: v }));
  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Sesión expirada.");

      const requestBody = {
        name: form?.name,
        price: form?.pricingType === "PAID" ? Number(form?.price) : 0,
        isPublic: form?.isPublic,
        color: form?.color,
        emoji: form?.emoji,
      };

      console.log("Enviando al backend:", requestBody);

      const res = await fetch(`/api/space-groups/${form?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error("No se pudo actualizar.");
      const updated = await res.json();
      console.log("Respuesta del backend:", updated);

      onSaved(updated);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={save} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          </DialogHeader>

          {/* Tabs header ------------------------------------------------ */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-transparent justify-start gap-6 px-1 pb-2 border-b">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="monetization" disabled>
                Monetización
              </TabsTrigger>
              <TabsTrigger value="links" disabled>
                Payment Links
              </TabsTrigger>
            </TabsList>

            {/* ───────── TAB: General ───────── */}
            <TabsContent value="general">
              <div className="space-y-5 pt-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => change("name", e.target.value)}
                    required
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <Label>Pricing</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={
                        form.pricingType === "FREE" ? "secondary" : "outline"
                      }
                      size="sm"
                      onClick={() => change("pricingType", "FREE")}
                    >
                      Free
                    </Button>
                    <Button
                      type="button"
                      variant={
                        form.pricingType === "PAID" ? "secondary" : "outline"
                      }
                      size="sm"
                      onClick={() => change("pricingType", "PAID")}
                    >
                      Paid
                    </Button>
                  </div>
                </div>

                {/* Price & Billing */}
                {form.pricingType === "PAID" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        Price (COP)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => change("price", e.target.value)}
                        required
                      />
                    </div>
                    {/* Billing frequency placeholder */}
                    <div className="space-y-2">
                      <Label>Billing</Label>
                      <Input
                        disabled
                        placeholder="One-time Payment"
                        className="opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* Color & Emoji */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Palette className="h-4 w-4 text-purple-600" />
                      Color
                    </Label>
                    <Input
                      type="color"
                      value={form.color ?? "#ffffff"}
                      onChange={(e) => change("color", e.target.value)}
                      className="h-10 p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Smile className="h-4 w-4 text-purple-600" />
                      Emoji
                    </Label>
                    <Input
                      value={form.emoji ?? ""}
                      onChange={(e) => change("emoji", e.target.value)}
                      maxLength={2}
                      className="text-center text-xl"
                      placeholder="😀"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={form.isPublic}
                    onCheckedChange={(v) => change("isPublic", v)}
                  />
                  <Label className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-purple-600" />
                    Público
                  </Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer ---------------------------------------------------- */}
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
