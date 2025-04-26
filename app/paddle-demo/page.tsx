import PaddleCheckoutButton from '@/components/PaddleCheckoutButton';

export default function PaddleDemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Demo Paddle Checkout (Sandbox)</h1>

      {/* Botón reutilizable */}
      <PaddleCheckoutButton />

      <p className="text-sm text-gray-600">
        Usa la tarjeta de prueba <strong>4242 4242 4242 4242</strong> con
        cualquier fecha futura y CVC 100.
      </p>
    </main>
  );
}