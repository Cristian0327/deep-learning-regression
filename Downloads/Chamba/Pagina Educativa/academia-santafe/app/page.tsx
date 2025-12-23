'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Play, CheckCircle, GraduationCap, Clock, Users, ChevronUp, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import apiClient from '@/lib/api-client';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [stats, setStats] = useState({
    cursos: 0,
    estudiantes: 0,
    satisfaccion: 0
  });

  useEffect(() => {
    // Cargar cursos dinámicamente
    const cargarCursos = async () => {
      try {
        const cursosData = await apiClient.listarCursos();
        // Filtrar solo cursos activos y tomar los 3 más recientes
        const cursosActivos = cursosData
          .filter((curso: any) => curso.activo === true)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setCursos(cursosActivos);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        setCursos([]);
      }
    };
    
    // Cargar estadísticas
    const cargarEstadisticas = async () => {
      try {
        // 1. Contar cursos desde la API local
        const responseCursos = await fetch('http://localhost:3001/api/cursos');
        const cursos = await responseCursos.json();
        const cursosCount = cursos.length;

        // 2. Contar estudiantes únicos desde localStorage (por cédula)
        const cedulas = new Set();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('datosUsuario_')) {
            const datos = JSON.parse(localStorage.getItem(key) || '{}');
            if (datos.documento) {
              cedulas.add(datos.documento);
            }
          }
        }

        // 3. Calcular satisfacción promedio desde calificaciones en localStorage
        let totalCalificaciones = 0;
        let sumaCalificaciones = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('calificacion_')) {
            const calificacion = JSON.parse(localStorage.getItem(key) || '0');
            if (calificacion > 0) {
              sumaCalificaciones += calificacion;
              totalCalificaciones++;
            }
          }
        }
        const satisfaccionPromedio = totalCalificaciones > 0 
          ? Math.round((sumaCalificaciones / totalCalificaciones) * 20) 
          : 0;

        setStats({
          cursos: cursosCount,
          estudiantes: cedulas.size,
          satisfaccion: satisfaccionPromedio
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Si falla, mostrar 0s
        setStats({ cursos: 0, estudiantes: 0, satisfaccion: 0 });
      }
    };
    
    cargarCursos();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    // Splash screen timer - 2s total
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Delay mínimo antes de mostrar el contenido
      setTimeout(() => {
        setShowContent(true);
      }, 50);
    }, 1850);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showSplash) return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showSplash]);

  return (
    <>
      {/* Splash Screen con animación de logos separados */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white splash-screen">
          <div className="logo-container">
            <AnimatedLogo />
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gray-50 transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
      
      {/* Hero Section con animación de aparición */}
      <section className="relative bg-primary-600 text-white py-24 overflow-hidden">
        {/* Decorative circles - sutiles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-800 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Impulsa tu desarrollo profesional
              </h1>
              <p className="text-xl text-primary-50">
                Capacitación continua para el personal de Ladrillera Santafé. Aprende, crece y certifícate desde cualquier lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/cursos" 
                  className="group bg-secondary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-secondary-600 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/cursos" 
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center hover:scale-105 shadow-lg"
                >
                  Ver Cursos
                </Link>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-primary-50">Sin costo para colaboradores</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-primary-50">Certificación oficial</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block animate-slide-in">
              <div className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="bg-secondary-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg icon-container">
                  <GraduationCap className="h-10 w-10 text-white icon-animate" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Aprende a tu ritmo</h3>
                <p className="text-gray-600 text-lg">Accede desde cualquier dispositivo, en cualquier momento, 24/7</p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>Flexible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Profesional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-primary-600 mr-2" />
                <div className="text-5xl font-bold text-primary-600">
                  {stats.cursos}+
                </div>
              </div>
              <p className="text-gray-600 font-semibold">Cursos</p>
            </div>
            
            <div className="text-center border-x border-gray-200">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary-600 mr-2" />
                <div className="text-5xl font-bold text-primary-600">
                  {stats.estudiantes}+
                </div>
              </div>
              <p className="text-gray-600 font-semibold">Estudiantes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary-600 mr-2" />
                <div className="text-5xl font-bold text-primary-600">
                  {stats.satisfaccion}%
                </div>
              </div>
              <p className="text-gray-600 font-semibold">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-20 bg-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Academia Santafé?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plataforma diseñada para el crecimiento profesional de nuestros colaboradores
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-secondary-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 icon-container">
                <BookOpen className="h-8 w-8 icon-animate" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Contenido de Calidad</h3>
              <p className="text-white/90">
                Cursos diseñados por expertos de la industria, actualizados constantemente con las mejores prácticas.
              </p>
            </div>

            <div className="group bg-primary-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 icon-container">
                <Clock className="h-8 w-8 icon-animate" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Horarios Flexibles</h3>
              <p className="text-white/90">
                Aprende cuando quieras, desde donde quieras. Compatibiliza tu formación con tu trabajo diario.
              </p>
            </div>

            <div className="group bg-secondary-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 icon-container">
                <GraduationCap className="h-8 w-8 icon-animate" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Certificaciones</h3>
              <p className="text-white/90">
                Obtén certificados oficiales que validan tus nuevas habilidades y conocimientos adquiridos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cursos Destacados */}
      <section id="cursos" className="py-20 bg-gray-50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comienza tu aprendizaje hoy
            </h2>
            <p className="text-xl text-gray-600">
              Explora nuestros cursos y comienza a desarrollar nuevas habilidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cursos.length > 0 ? (
              cursos.map((curso, index) => (
                <Link
                  key={curso.id}
                  href={`/curso/${curso.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-48 bg-primary-500 flex items-center justify-center relative">
                    {curso.imagen ? (
                      <Image 
                        src={curso.imagen} 
                        alt={curso.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-white opacity-80" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
                        {curso.categoria || 'General'}
                      </span>
                      {curso.nivel && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                          {curso.nivel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{curso.titulo}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {curso.descripcion}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{curso.duracion || 'Variable'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{curso.instructor || 'Experto'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
                  <div className="h-48 bg-primary-500 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white opacity-80" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
                        Nuevo
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cursos Disponibles Próximamente</h3>
                    <p className="text-gray-600 mb-4">
                      Estamos preparando contenido de calidad para ti. Mantente atento a las próximas actualizaciones.
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Por definir</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Pronto</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
                  <div className="h-48 bg-secondary-500 flex items-center justify-center">
                    <GraduationCap className="h-16 w-16 text-white opacity-80" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        Próximamente
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Contenido en Desarrollo</h3>
                    <p className="text-gray-600 mb-4">
                      Nuestro equipo está trabajando en cursos especializados para mejorar tus competencias profesionales.
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>En preparación</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Todos los niveles</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 scroll-reveal">
                  <div className="h-48 bg-primary-500 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-80" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
                        Próximamente
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Más Cursos en Camino</h3>
                    <p className="text-gray-600 mb-4">
                      Continuamente agregamos nuevo contenido para mantenerte actualizado en tu área de especialización.
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Por anunciar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Interactivo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/cursos"
              className="inline-flex items-center gap-2 bg-secondary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-secondary-600 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Ver Todos los Cursos
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary-600 text-white animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para comenzar tu viaje de aprendizaje?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a Academia Santafé y comienza a desarrollar las habilidades que impulsarán tu carrera
          </p>
          <Link 
            href="/cursos"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            Comenzar Ahora Gratis
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Botón Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 bg-secondary-500 text-white p-4 rounded-full shadow-2xl hover:bg-secondary-600 transition-all duration-300 hover:scale-110 animate-fade-in"
          aria-label="Volver arriba"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <Footer />
      </div>
    </>
  );
}
