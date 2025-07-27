import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <main className="max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Paiement réussi !</h1>
      <p className="mb-6">Votre abonnement a bien été pris en compte. Vous recevrez un email de confirmation.</p>
      <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">
        Retour à l’accueil
      </Link>
    </main>
  );
}
