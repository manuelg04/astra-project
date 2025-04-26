// app/checkout/page.tsx
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton';

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Demo de pago con Paddle</h1>

      {/* Botón que abre el overlay */}
      <PaddleCheckoutButton />

      <p className="text-sm text-gray-600">
        Usa la tarjeta <strong>4242 4242 4242 4242 · 12/34 · CVC 100</strong>.
      </p>
    </main>
  );
}