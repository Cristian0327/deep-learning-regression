'use client';

import { Users, BookOpen, Award, Clock } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      icon: Users,
      value: '850+',
      label: 'Estudiantes Activos',
      color: 'bg-primary',
    },
    {
      icon: BookOpen,
      value: '45+',
      label: 'Cursos Disponibles',
      color: 'bg-secondary',
    },
    {
      icon: Award,
      value: '320+',
      label: 'Certificados Emitidos',
      color: 'bg-primary',
    },
    {
      icon: Clock,
      value: '12,500+',
      label: 'Horas de Aprendizaje',
      color: 'bg-secondary',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${stat.color} rounded-lg flex items-center justify-center mx-auto`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
