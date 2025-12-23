'use client';

import { useState } from 'react';

interface CalificacionLadrillosProps {
  calificacion: number;
  onCalificar?: (valor: number) => void;
  soloLectura?: boolean;
  tamaño?: 'sm' | 'md' | 'lg';
}

export default function CalificacionLadrillos({ 
  calificacion, 
  onCalificar, 
  soloLectura = false,
  tamaño = 'md'
}: CalificacionLadrillosProps) {
  const [hover, setHover] = useState(0);

  const tamaños = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const espaciado = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div className={`flex items-center ${espaciado[tamaño]}`}>
      {[1, 2, 3, 4, 5].map((valor) => (
        <button
          key={valor}
          type="button"
          disabled={soloLectura}
          onClick={() => onCalificar && onCalificar(valor)}
          onMouseEnter={() => !soloLectura && setHover(valor)}
          onMouseLeave={() => !soloLectura && setHover(0)}
          className={`${tamaños[tamaño]} transition-all duration-200 ${
            soloLectura ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Fila superior de ladrillos pequeños */}
            <rect
              x="4"
              y="8"
              width="10"
              height="6"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            <rect
              x="18"
              y="8"
              width="10"
              height="6"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            
            {/* Fila media */}
            <rect
              x="4"
              y="16"
              width="6"
              height="6"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            <rect
              x="13"
              y="16"
              width="6"
              height="6"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            <rect
              x="22"
              y="16"
              width="6"
              height="6"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            
            {/* Fila inferior */}
            <rect
              x="4"
              y="24"
              width="10"
              height="4"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
            <rect
              x="18"
              y="24"
              width="10"
              height="4"
              rx="0.5"
              className={`transition-all duration-300 ${
                (hover || calificacion) >= valor
                  ? 'fill-orange-500'
                  : 'fill-gray-300'
              }`}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
