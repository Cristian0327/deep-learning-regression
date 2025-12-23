import Link from 'next/link';
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                Academia <span className="text-primary-400">Santafé</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-md mb-4">
              Plataforma de capacitación y formación continua para el personal de Ladrillera Santafé.
              Aprende, crece y certifícate en un entorno profesional.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="h-5 w-5" />
              <span>Bogotá, Colombia</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-white transition-colors">
                  Todos los Cursos
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-gray-400 hover:text-white transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Mi Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>academia@ladrillera-santafe.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>+57 (1) 234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {currentYear} Ladrillera Santafé. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
