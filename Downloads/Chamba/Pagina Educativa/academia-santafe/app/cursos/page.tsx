'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, Clock, Users, Search, Filter } from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import CalificacionLadrillos from '@/components/CalificacionLadrillos';

export default function CursosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const cursosData = await apiClient.listarCursos();
      // Filtrar solo cursos activos y ordenar por fecha descendente
      const cursosActivos = cursosData
        .filter((curso: any) => curso.activo === true)
        .sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      setCursos(cursosActivos);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      setCursos([]);
    } finally {
      setCargando(false);
    }
  };

  const categorias = ['Todas', ...Array.from(new Set(cursos.map(c => c.categoria)))];

  const cursosFiltrados = cursos.filter(curso => {
    const coincideBusqueda = curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            curso.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'Todas' || curso.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Cursos</h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Descubre nuestra oferta de capacitación diseñada para impulsar tu desarrollo profesional
          </p>
        </div>
      </section>

      {/* Filtros y Búsqueda */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            {/* Filtro por Categoría */}
            <div className="md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Cursos */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando cursos...</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {busqueda || categoriaFiltro !== 'Todas' ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
              </h3>
              <p className="text-gray-500">
                {busqueda || categoriaFiltro !== 'Todas' 
                  ? 'Intenta con otros términos de búsqueda o filtros' 
                  : 'Los cursos estarán disponibles próximamente'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Mostrando <span className="font-semibold text-primary-600">{cursosFiltrados.length}</span> curso{cursosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cursosFiltrados.map((curso) => (
                  <div key={curso.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
                    <div className="h-48 bg-primary-500 flex items-center justify-center relative overflow-hidden">
                      {curso.imagen ? (
                        <img src={curso.imagen} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <BookOpen className="h-20 w-20 text-white opacity-30 group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                          {curso.nivel}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {curso.categoria}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2 group-hover:text-primary-600 transition-colors">
                        {curso.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {curso.descripcion}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{curso.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{curso.duracion}</span>
                        </div>
                        {curso.calificacion_promedio > 0 && (
                          <div className="flex items-center gap-2">
                            <CalificacionLadrillos 
                              calificacion={Math.round(curso.calificacion_promedio)} 
                              soloLectura 
                              tamaño="sm"
                            />
                            <span className="text-xs">({curso.total_calificaciones})</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/curso/${curso.id}`}>
                        <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300">
                          Ver Detalles
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
