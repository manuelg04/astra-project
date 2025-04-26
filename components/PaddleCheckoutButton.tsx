'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/* -----------------------------------------------------------------------
   Declara la interfaz para evitar errores de TypeScript
------------------------------------------------------------------------ */
declare global {
  interface Window {
    Paddle: {
      Environment: { set: (env: 'sandbox' | 'production') => void };
      Setup: (config: { vendor: number }) => void;
      Checkout: {
        open: (config: {
          items: { priceId: string; quantity?: number }[];
          settings?: Record<string, unknown>;
        }) => void;
      };
    };
  }
}

/* -----------------------------------------------------------------------
   Props opcionales si quisieras reutilizar el componente
------------------------------------------------------------------------ */
interface PaddleCheckoutButtonProps {
  label?: string;
}

export default function PaddleCheckoutButton({
  label = 'Comprar (COP 250 000)',
}: PaddleCheckoutButtonProps) {
  /* 1 · Configuración estática (sandbox) ------------------------------ */
  const vendorId = 30483;
  const priceId = 'pri_01jsszwj901awst3aawtq0b5g8';

  /* 2 · Estado para evitar re-setup múltiples veces ------------------- */
  const [isReady, setIsReady] = useState(false);

  /* 3 · Cuando la librería se carga, se inicializa -------------------- */
  const handleScriptLoad = () => {
    if (window.Paddle) {
      window.Paddle.Environment.set('sandbox'); // ← modo test
      window.Paddle.Setup({ vendor: vendorId });
      setIsReady(true);
    }
  };

  /* 4 · Abre el checkout al hacer clic ------------------------------- */
  const openCheckout = () => {
    if (!isReady || !window.Paddle) return;

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        theme: 'light',
        variant: 'one-page', // opción de una sola página
      },
    });
  };

  return (
    <>
      {/* 5 · Carga paddle.js una sola vez ------------------------------ */}
      <Script
        src="https://sandbox-vendors.paddle.com/paddle.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* 6 · Botón de compra ------------------------------------------- */}
      <button
        type="button"
        onClick={openCheckout}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {label}
      </button>
    </>
  );
}