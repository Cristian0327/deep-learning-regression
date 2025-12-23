'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <Shield className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600 mb-6">
            Esta sección es para uso exclusivo de administradores e instructores.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
