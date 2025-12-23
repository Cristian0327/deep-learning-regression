'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md backdrop-blur-lg bg-opacity-98">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 py-2">
          {/* Logo y Nombre - Alineado a la izquierda */}
          <Link href="/" className="flex items-center gap-3 md:gap-8 group flex-shrink-0 hover:opacity-90 transition-opacity">
            <div className="relative w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32">
              <Image 
                src="/logo.svg" 
                alt="Logo Academia Santafé" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-primary-600 leading-tight">Academia Santafé</h1>
            </div>
          </Link>

          {/* Espaciador para empujar todo a los lados */}
          <div className="flex-grow"></div>

          {/* Links de navegación - Agrupados a la derecha */}
          <div className="hidden md:flex items-center gap-8 flex-shrink-0">
            <Link href="/cursos" className="text-primary-600 hover:text-primary-700 font-bold text-base transition-all hover:scale-105">
              Cursos
            </Link>
            <Link href="/categorias" className="text-primary-600 hover:text-primary-700 font-bold text-base transition-all hover:scale-105">
              Categorías
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col space-y-2">
              <Link href="/cursos" className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Cursos
              </Link>
              <Link href="/categorias" className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Categorías
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
