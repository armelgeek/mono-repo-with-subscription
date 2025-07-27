"use client";


import React, { useState } from 'react';
import { Button } from '@/shared/components/atoms/ui/button';
import { subscriptionService } from '../subscription.service';



export function PaymentMethodManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<{
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null>(null);

  // Fetch card info on mount

  React.useEffect(() => {
    setLoading(true);
    subscriptionService.getPaymentMethod()
      .then((res) => {
        function isCard(obj: unknown): obj is { brand: string; last4: string; expMonth: number; expYear: number } {
          return (
            typeof obj === 'object' && obj !== null &&
            typeof (obj as Record<string, unknown>).brand === 'string' &&
            typeof (obj as Record<string, unknown>).last4 === 'string' &&
            typeof (obj as Record<string, unknown>).expMonth === 'number' &&
            typeof (obj as Record<string, unknown>).expYear === 'number'
          );
        }
        if (res && isCard(res.data)) {
          setCard({
            brand: res.data.brand,
            last4: res.data.last4,
            expMonth: res.data.expMonth,
            expYear: res.data.expYear,
          });
        } else {
          setError(res?.message || 'Aucune carte trouvée');
        }
      })
      .catch(() => setError('Erreur lors du chargement de la carte'))
      .finally(() => setLoading(false));
  }, []);

  const handleChangeCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const returnUrl = window.location.href;
      const res = await subscriptionService.openBillingPortal({ returnUrl });
      function isUrlObj(obj: unknown): obj is { url: string } {
        return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>).url === 'string';
      }
      if (res && isUrlObj(res.data)) {
        window.location.href = res.data.url;
      } else {
        setError(res?.message || "Impossible d'ouvrir le portail Stripe");
      }
    } catch {
      setError("Erreur lors de la redirection vers Stripe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border rounded p-4 bg-white shadow-sm mb-6">
      <h2 className="font-bold text-lg mb-2">Moyen de paiement</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-semibold">Carte enregistrée :</div>
          {loading ? (
            <div className="text-gray-400">Chargement...</div>
          ) : card ? (
            <div>{card.brand} **** {card.last4} (exp. {card.expMonth}/{card.expYear})</div>
          ) : (
            <div className="text-gray-400">{error || 'Aucune carte trouvée'}</div>
          )}
        </div>
        <Button className="ml-auto" variant="outline" onClick={handleChangeCard} disabled={loading}>
          Changer de carte
        </Button>
      </div>
      {error && !loading && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </section>
  );
}
