'use client';

import Link from 'next/link';
import { Clock, Users, Star } from 'lucide-react';

export function FeaturedCourses() {
  // Mock data - will be replaced with real data from Firebase
  const courses = [
    {
      id: '1',
      title: 'Seguridad en Alturas - Nivel Básico',
      instructor: 'Ing. Carlos Rodríguez',
      thumbnail: 'https://via.placeholder.com/400x250',
      category: 'Seguridad Industrial',
      duration: '4 horas',
      students: 128,
      rating: 4.8,
      level: 'Básico',
    },
    {
      id: '2',
      title: 'Gestión de Calidad ISO 9001',
      instructor: 'Dra. María Fernández',
      thumbnail: 'https://via.placeholder.com/400x250',
      category: 'Calidad',
      duration: '6 horas',
      students: 95,
      rating: 4.9,
      level: 'Intermedio',
    },
    {
      id: '3',
      title: 'Liderazgo y Trabajo en Equipo',
      instructor: 'Lic. Juan Pérez',
      thumbnail: 'https://via.placeholder.com/400x250',
      category: 'Liderazgo',
      duration: '3 horas',
      students: 210,
      rating: 4.7,
      level: 'Básico',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cursos Destacados
            </h2>
            <p className="text-xl text-gray-600">
              Los cursos más populares de nuestra plataforma
            </p>
          </div>
          <Link href="/cursos" className="btn-outline hidden md:inline-flex">
            Ver Todos los Cursos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              href={`/cursos/${course.id}`}
              className="card overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-300 text-sm">Imagen del curso</span>
                </div>
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {course.category}
                </div>
                <div className="absolute top-3 right-3 bg-secondary px-3 py-1 rounded-full text-xs font-medium text-white">
                  {course.level}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-600">
                  Por {course.instructor}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-secondary font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12 md:hidden">
          <Link href="/cursos" className="btn-primary">
            Ver Todos los Cursos
          </Link>
        </div>
      </div>
    </section>
  );
}
