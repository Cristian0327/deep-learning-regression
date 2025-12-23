'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import type { ClientSafeProvider } from 'next-auth/react';

// Define los detalles específicos de cada proveedor (íconos, nombres, etc.)
const providerDetails: { [key: string]: { name: string; icon: JSX.Element; } } = {
  google: {
    name: 'Gmail',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  'azure-ad': {
    name: 'Outlook',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
        <path fill="#f35325" d="M1 1h10v10H1z"/>
        <path fill="#81bc06" d="M12 1h10v10H12z"/>
        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
        <path fill="#ffba08" d="M12 12h10v10H12z"/>
      </svg>
    ),
  },
};

interface SignInButtonsProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function SignInButtons({ providers }: SignInButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId);
    try {
      await signIn(providerId, { 
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error(`Error al iniciar sesión con ${providerId}:`, error);
      setIsLoading(null);
    }
  };

  if (!providers || Object.keys(providers).length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="font-medium">No hay métodos de inicio de sesión habilitados.</p>
        <p className="text-sm mt-2">Por favor, contacta a un administrador para que configure la aplicación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.values(providers).map((provider) => {
        if (provider.type === 'email') return null;
        const details = providerDetails[provider.id] || { name: provider.name, icon: null };
        return (
          <button
            key={provider.id}
            onClick={() => handleSignIn(provider.id)}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-200 rounded-lg bg-white hover:border-orange-500 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isLoading === provider.id ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                <span className="font-medium text-gray-700">Conectando...</span>
              </div>
            ) : (
              <>
                {details.icon}
                <span className="font-medium text-gray-700">Continuar con {details.name}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
