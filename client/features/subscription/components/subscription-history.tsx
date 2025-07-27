"use client";




import { useSubscriptionHistory } from '../hooks/use-subscription-history';
import { Badge } from '@/shared/components/atoms/ui/badge';
import { SubscriptionInvoice } from '../subscription.service';

export function SubscriptionHistory() {
  const { data: history = [], isLoading } = useSubscriptionHistory();

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'expiré':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Expiré</Badge>;
      case 'annulé':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <section className="border rounded p-4 bg-white shadow-sm mb-6">
      <h2 className="font-bold text-lg mb-2">Historique des abonnements</h2>
      {isLoading ? (
        <div className="text-gray-500 text-sm">Chargement...</div>
      ) : history.length === 0 ? (
        <div className="text-gray-400 text-sm">Aucun abonnement trouvé.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-semibold">Plan</th>
                <th className="px-3 py-2 text-left font-semibold">Début</th>
                <th className="px-3 py-2 text-left font-semibold">Fin</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item: SubscriptionInvoice) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{item.plan}</td>
                  <td className="px-3 py-2">{formatDate(item.start)}</td>
                  <td className="px-3 py-2">{formatDate(item.end)}</td>
                  <td className="px-3 py-2">{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
