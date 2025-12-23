'use client';

import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Academia Santafé</h3>
                <p className="text-xs text-gray-400">Ladrillera Santafé</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Plataforma de capacitación y desarrollo profesional para el equipo de Ladrillera Santafé.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cursos" className="text-sm hover:text-white transition-colors duration-200">
                  Explorar Cursos
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-sm hover:text-white transition-colors duration-200">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-white transition-colors duration-200">
                  Mi Aprendizaje
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/categorias/seguridad" className="text-sm hover:text-white transition-colors duration-200">
                  Seguridad Industrial
                </Link>
              </li>
              <li>
                <Link href="/categorias/produccion" className="text-sm hover:text-white transition-colors duration-200">
                  Producción
                </Link>
              </li>
              <li>
                <Link href="/categorias/calidad" className="text-sm hover:text-white transition-colors duration-200">
                  Calidad
                </Link>
              </li>
              <li>
                <Link href="/categorias/liderazgo" className="text-sm hover:text-white transition-colors duration-200">
                  Liderazgo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <span>contacto@ladrillera-santafe.com</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <span>+57 (123) 456-7890</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <span>Bogotá, Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Ladrillera Santafé. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
