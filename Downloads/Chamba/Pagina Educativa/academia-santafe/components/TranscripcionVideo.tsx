'use client';

import { useState, useEffect, useRef } from 'react';
import { Subtitles, Search } from 'lucide-react';

interface TranscriptSegment {
  time: number;
  duration: number;
  text: string;
}

interface TranscripcionVideoProps {
  videoId: string;
  onSeek?: (time: number) => void;
}

export default function TranscripcionVideo({ videoId, onSeek }: TranscripcionVideoProps) {
  const [transcripcion, setTranscripcion] = useState<TranscriptSegment[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [segmentoActivo, setSegmentoActivo] = useState<number>(-1);

  useEffect(() => {
    cargarTranscripcion();
  }, [videoId]);

  const cargarTranscripcion = async () => {
    if (!videoId) return;

    setCargando(true);
    setError('');

    try {
      // Obtener subtítulos sin API key (usando youtube-transcript)
      const response = await fetch(`/api/youtube/transcripcion-sin-api?videoId=${videoId}`);
      
      if (!response.ok) {
        throw new Error('No se pudo cargar la transcripción');
      }

      const data = await response.json();
      setTranscripcion(data.segments || []);
    } catch (err) {
      console.error('Error al cargar transcripción:', err);
      setError('No se encontró transcripción para este video. El instructor puede habilitar subtítulos en YouTube.');
    } finally {
      setCargando(false);
    }
  };

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClickSegmento = (tiempo: number, index: number) => {
    setSegmentoActivo(index);
    if (onSeek) {
      onSeek(tiempo);
    }
  };

  const segmentosFiltrados = transcripcion.filter(seg =>
    seg.text.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Subtitles className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Transcripción</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transcripción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Subtitles className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Transcripción</h3>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Subtitles className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-bold text-gray-900">Transcripción Interactiva</h3>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en la transcripción..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {/* Lista de segmentos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {segmentosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {busqueda ? 'No se encontraron resultados' : 'No hay transcripción disponible'}
          </p>
        ) : (
          segmentosFiltrados.map((segmento, index) => (
            <button
              key={index}
              onClick={() => handleClickSegmento(segmento.time, index)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                segmentoActivo === index
                  ? 'bg-primary-100 border-2 border-primary-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-sm font-semibold text-primary-600 flex-shrink-0 mt-0.5">
                  {formatearTiempo(segmento.time)}
                </span>
                <p className="text-gray-700 flex-1">
                  {busqueda ? (
                    <span dangerouslySetInnerHTML={{
                      __html: segmento.text.replace(
                        new RegExp(busqueda, 'gi'),
                        match => `<mark class="bg-orange-200 text-orange-900">${match}</mark>`
                      )
                    }} />
                  ) : (
                    segmento.text
                  )}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {segmentosFiltrados.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Mostrando {segmentosFiltrados.length} segmento{segmentosFiltrados.length !== 1 ? 's' : ''}
            {busqueda && ` con "${busqueda}"`}
          </p>
        </div>
      )}
    </div>
  );
}
