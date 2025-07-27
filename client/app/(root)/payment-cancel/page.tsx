import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <main className="max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Paiement annulé</h1>
      <p className="mb-6">Votre paiement a été annulé ou interrompu. Vous pouvez réessayer à tout moment.</p>
      <Link href="/subscription-plans" className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">
        Choisir un abonnement
      </Link>
    </main>
  );
}
