'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    Configuration: 'Hay un problema con la configuración del servidor.',
    AccessDenied: 'No tienes acceso a este recurso.',
    Verification: 'El token de verificación ha expirado o ya se ha usado.',
    Default: 'Ha ocurrido un error durante la autenticación.',
  };

  const errorMessage = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.Default;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error de Autenticación
          </h1>
          
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <Link 
              href="/auth/signin"
              className="btn-primary w-full inline-flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al Inicio de Sesión
            </Link>

            <Link 
              href="/"
              className="btn-outline w-full inline-flex items-center justify-center"
            >
              <Home className="mr-2 h-5 w-5" />
              Ir a la Página Principal
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Si el problema persiste, contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
}
