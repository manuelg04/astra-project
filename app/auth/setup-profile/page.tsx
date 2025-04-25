"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupUserProfile } from "@/lib/auth";

export default function SetupProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* Base64 util --------------------------------------------------- */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    setIsLoading(true);

    try {
      let avatarUrl: string | undefined = undefined;
      if (avatarFile) avatarUrl = await fileToBase64(avatarFile);

      const ok = await setupUserProfile(fullName, phone, avatarUrl ?? "");
      if (ok) router.push("/dashboard");
      else setErrors("Unable to save profile. Try again.");
    } catch {
      setErrors("Something went wrong. Try again.");
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
            <ImageIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Set up your profile
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your profile to continue (profile picture is optional)
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile picture (Optional)</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
              required
            />
          </div>

          {errors && <p className="text-sm text-red-500">{errors}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-4"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}