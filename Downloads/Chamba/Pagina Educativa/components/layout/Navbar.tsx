'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, User, LogOut, LayoutDashboard, Upload } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Academia Santafé
              </h1>
              <p className="text-xs text-gray-500">Ladrillera Santafé</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/cursos"
              className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              Cursos
            </Link>
            <Link
              href="/categorias"
              className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              Categorías
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Mi Aprendizaje</span>
                </Link>
                
                {(session.user.role === 'admin' || session.user.role === 'instructor') && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-secondary font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Administrar</span>
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors duration-200">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{session.user.name?.split(' ')[0]}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/perfil"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-primary">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <Link href="/cursos" className="block py-2 text-gray-700 hover:text-primary">
              Cursos
            </Link>
            <Link href="/categorias" className="block py-2 text-gray-700 hover:text-primary">
              Categorías
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-primary">
                  Mi Aprendizaje
                </Link>
                {(session.user.role === 'admin' || session.user.role === 'instructor') && (
                  <Link href="/admin" className="block py-2 text-secondary hover:text-secondary-600">
                    Administrar
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full text-left py-2 text-red-600"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="block py-2 text-primary font-semibold">
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
