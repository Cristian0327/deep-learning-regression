'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, Folder, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export default function CategoriasPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const cursosData = await apiClient.listarCursos();
      const cursosActivos = cursosData.filter((c: any) => c.activo !== false);
      setCursos(cursosActivos || []);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Agrupar cursos por categoría
  const categorias = cursos.reduce((acc: any, curso) => {
    const cat = curso.categoria || 'Sin categoría';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(curso);
    return acc;
  }, {});

  const categoriasArray = Object.keys(categorias).map(nombre => ({
    nombre,
    cantidad: categorias[nombre].length,
    cursos: categorias[nombre]
  }));

  const colores = [
    'from-primary-500 to-primary-700',
    'from-secondary-500 to-secondary-700',
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Categorías de Cursos</h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Explora nuestras áreas de formación y encuentra el camino perfecto para tu desarrollo profesional
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando categorías...</p>
            </div>
          ) : categoriasArray.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No hay categorías disponibles
              </h3>
              <p className="text-gray-500">
                Las categorías aparecerán cuando se creen cursos
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {categoriasArray.length} {categoriasArray.length === 1 ? 'Categoría' : 'Categorías'} Disponibles
                </h2>
                <p className="text-gray-600">
                  {cursos.length} cursos en total
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoriasArray.map((categoria, index) => (
                  <Link 
                    key={categoria.nombre} 
                    href={`/cursos?categoria=${encodeURIComponent(categoria.nombre)}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                      {/* Header con gradiente */}
                      <div className={`h-32 bg-gradient-to-br ${colores[index % colores.length]} flex items-center justify-center relative overflow-hidden`}>
                        <Folder className="h-16 w-16 text-white opacity-30 group-hover:scale-110 transition-transform" />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                            {categoria.cantidad} {categoria.cantidad === 1 ? 'curso' : 'cursos'}
                          </span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                          {categoria.nombre}
                        </h3>
                        
                        {/* Lista de cursos en la categoría */}
                        <div className="space-y-2 mb-4">
                          {categoria.cursos.slice(0, 3).map((curso: any) => (
                            <div key={curso.id} className="flex items-start gap-2 text-sm text-gray-600">
                              <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-500" />
                              <span className="line-clamp-1">{curso.titulo}</span>
                            </div>
                          ))}
                          {categoria.cantidad > 3 && (
                            <p className="text-sm text-gray-500 italic">
                              + {categoria.cantidad - 3} más
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                          <span>Ver cursos</span>
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
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
