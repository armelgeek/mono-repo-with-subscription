import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/shared/components/atoms/ui/button';
import { ArrowRight, Shield, Zap, Users, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Boiler - Système d&apos;administration moderne',
  description: 'Plateforme d&apos;administration ultra-simplifié pour gérer vos contenus, utilisateurs et paramètres avec des interfaces générées automatiquement.',
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Système d&apos;administration
            <span className="block text-primary">ultra-simplifié</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Boiler est une plateforme d&apos;administration moderne qui permet de gérer facilement vos contenus,
            utilisateurs et paramètres avec des interfaces CRUD générées automatiquement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3">
              <Link href="/register" className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-3">
              <Link href="/blog">
                En savoir plus
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Boiler ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour simplifier la gestion de vos projets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ultra-rapide</h3>
              <p className="text-gray-600">
                Interfaces générées automatiquement pour une productivité maximale
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurisé</h3>
              <p className="text-gray-600">
                Authentification robuste et contrôle d&apos;accès par rôles
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaboratif</h3>
              <p className="text-gray-600">
                Gestion d&apos;équipes et permissions granulaires pour tous vos projets
              </p>
            </div>
          </div>
        </div>
      </section>
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Bienvenue sur la plateforme</h1>
        <p className="mb-4">Découvrez nos offres d’abonnement adaptées à vos besoins.</p>
        <Link href="/subscription-plans" className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">
          Voir les abonnements
        </Link>
      </main>
      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Entreprises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-gray-600">Temps de fonctionnement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Support client</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à simplifier votre administration ?
          </h2>
          <p className="text-xl mb-8 text-primary-light">
            Rejoignez des milliers d&apos;utilisateurs qui font déjà confiance à Boiler
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="px-8 py-3">
              <Link href="/register" className="flex items-center gap-2">
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-1 text-primary-light">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-2">Noté 5/5 par nos utilisateurs</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
