'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, Plus, X, Upload, Save, Edit, FileSpreadsheet } from 'lucide-react';
import apiClient from '@/lib/api-client';
import ConstructorCurso, { BloqueContenido } from '@/components/ConstructorCurso';
import Link from 'next/link';

export default function AdminCursosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    duracion: '',
    nivel: 'Principiante',
    instructor: '',
    imagen: '',
    contenido: '',
    precio: '0',
    videoUrl: '',
    claveInscripcion: '',
    evaluaciones: [] as any[],
    duracionEstimada: 60,
    prerequisitos: '',
    certificadoTemplate: '',
    emailReporte: ''
  });
  const [bloques, setBloques] = useState<BloqueContenido[]>([]);

  const [mostrarModalEvaluacion, setMostrarModalEvaluacion] = useState(false);
  const [evaluacionTemporal, setEvaluacionTemporal] = useState({
    tipo: 'multiple',
    pregunta: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0,
    retroalimentacion: ''
  });
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [subiendoPDF, setSubiendoPDF] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [archivoCertificado, setArchivoCertificado] = useState<File | null>(null);
  const [subiendoCertificado, setSubiendoCertificado] = useState(false);

  // Cargar cursos desde Firestore
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const cursosData = await apiClient.listarCursos();
      // Ordenar por fecha de creación descendente
      const cursosOrdenados = cursosData.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setCursos(cursosOrdenados);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      setCursos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      const datosCurso = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        duracion: formData.duracion,
        nivel: formData.nivel,
        instructor: formData.instructor,
        imagen: formData.imagen,
        contenido: formData.contenido,
        precio: formData.precio,
        videoUrl: formData.videoUrl,
        claveInscripcion: formData.claveInscripcion,
        duracionEstimada: formData.duracionEstimada,
        prerequisitos: formData.prerequisitos,
        certificadoTemplate: formData.certificadoTemplate,
        emailReporte: formData.emailReporte,
        bloques: JSON.stringify(bloques),
        activo: true,
        ...(modoEdicion && { id: modoEdicion })
      };
      
      const cursoCreado = await apiClient.guardarCurso(datosCurso);
      
      console.log('Curso guardado:', cursoCreado);
      
      if (modoEdicion) {
        alert('Curso actualizado exitosamente');
      } else {
        alert('Curso creado exitosamente');
      }
      
      await cargarCursos();
      
      // Enviar notificación solo para cursos nuevos
      if (!modoEdicion) {
        try {
          const responseNotif = await fetch('/api/notificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tipo: 'nuevo_curso',
              titulo: '¡Nuevo curso disponible!',
              mensaje: `Se ha publicado el curso "${datosCurso.titulo}" en la categoría ${datosCurso.categoria}. ¡Inscríbete ahora!`,
              cursoId: cursoCreado.id
            })
          });
          const resultNotif = await responseNotif.json();
          console.log('📢 Notificación enviada:', resultNotif);
        } catch (error) {
          console.error('Error al enviar notificación:', error);
        }
      }
      
      // Reset form and edit mode
      setModoEdicion(null);
      setFormData({
        titulo: '',
        descripcion: '',
        categoria: '',
        duracion: '',
        nivel: 'Principiante',
        instructor: '',
        imagen: '',
        contenido: '',
        precio: '0',
        videoUrl: '',
        claveInscripcion: '',
        evaluaciones: [],
        duracionEstimada: 60,
        prerequisitos: '',
        certificadoTemplate: '',
        emailReporte: ''
      });
      setBloques([]);
      setMostrarFormulario(false);
      alert('Curso creado exitosamente con ' + bloques.length + ' bloques! Se ha notificado a todos los usuarios.');
    } catch (error: any) {
      console.error('Error completo:', error);
      alert('Error al crear el curso: ' + (error.message || JSON.stringify(error)));
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const eliminarCurso = async (id: string) => {
    const curso = cursos.find(c => c.id === id);
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el curso "${curso?.titulo}"?\n\n` +
      'Esta acción no se puede deshacer y se perderán todos los datos asociados.'
    );
    
    if (!confirmacion) return;
    
    try {
      await apiClient.eliminarCurso(id);
      await cargarCursos();
      alert('✅ Curso eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      alert('❌ Error al eliminar el curso');
    }
  };

  // Funciones para manejar evaluaciones
  const agregarEvaluacion = () => {
    if (!evaluacionTemporal.pregunta.trim()) {
      alert('Debes escribir una pregunta');
      return;
    }

    if (evaluacionTemporal.tipo === 'multiple') {
      const opcionesValidas = evaluacionTemporal.opciones.filter(op => op.trim());
      if (opcionesValidas.length < 2) {
        alert('Debes tener al menos 2 opciones');
        return;
      }
    }

    const nuevaEvaluacion = {
      id: Date.now().toString(),
      ...evaluacionTemporal,
      opciones: evaluacionTemporal.tipo === 'multiple' ? evaluacionTemporal.opciones : []
    };

    setFormData({
      ...formData,
      evaluaciones: [...formData.evaluaciones, nuevaEvaluacion]
    });

    setEvaluacionTemporal({
      tipo: 'multiple',
      pregunta: '',
      opciones: ['', '', '', ''],
      respuestaCorrecta: 0,
      retroalimentacion: ''
    });

    setMostrarModalEvaluacion(false);
  };

  const eliminarEvaluacion = (id: string) => {
    setFormData({
      ...formData,
      evaluaciones: formData.evaluaciones.filter(ev => ev.id !== id)
    });
  };

  const handleEvaluacionChange = (field: string, value: any) => {
    setEvaluacionTemporal({
      ...evaluacionTemporal,
      [field]: value
    });
  };

  const handleOpcionChange = (index: number, value: string) => {
    const nuevasOpciones = [...evaluacionTemporal.opciones];
    nuevasOpciones[index] = value;
    setEvaluacionTemporal({
      ...evaluacionTemporal,
      opciones: nuevasOpciones
    });
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB máximo
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setArchivoPDF(file);
    setSubiendoPDF(true);

    try {
      // Convertir a base64 para guardar en Supabase
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, certificadoTemplate: base64 });
        setSubiendoPDF(false);
      };
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setSubiendoPDF(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al cargar PDF:', error);
      alert('Error al cargar el archivo');
      setSubiendoPDF(false);
    }
  };

  const eliminarPDF = () => {
    setArchivoPDF(null);
    setFormData({ ...formData, certificadoTemplate: '' });
  };

  const handleImagenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Por favor selecciona una imagen válida (JPEG, JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setArchivoImagen(file);
    setSubiendoImagen(true);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, imagen: base64 });
        setSubiendoImagen(false);
      };
      reader.onerror = () => {
        alert('Error al leer la imagen');
        setSubiendoImagen(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al cargar imagen:', error);
      alert('Error al cargar la imagen');
      setSubiendoImagen(false);
    }
  };

  const eliminarImagen = () => {
    setArchivoImagen(null);
    setFormData({ ...formData, imagen: '' });
  };

  const handleCertificadoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Por favor selecciona un PDF o imagen válida (JPEG, JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setArchivoCertificado(file);
    setSubiendoCertificado(true);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, certificadoTemplate: base64 });
        setSubiendoCertificado(false);
      };
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setSubiendoCertificado(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      alert('Error al cargar el archivo');
      setSubiendoCertificado(false);
    }
  };

  const eliminarCertificado = () => {
    setArchivoCertificado(null);
    setFormData({ ...formData, certificadoTemplate: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Administración de Cursos</h1>
            <p className="text-gray-600">Crea y gestiona los cursos de Academia Santafé</p>
          </div>
        </div>

        {/* Botón Crear Curso */}
        <div className="mb-8">
          <button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              if (mostrarFormulario) setModoEdicion(null);
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {mostrarFormulario ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {mostrarFormulario ? 'Cancelar' : 'Crear Nuevo Curso'}
          </button>
        </div>

        {/* Formulario de Creación */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              {modoEdicion ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título del Curso *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ej: Seguridad Industrial Básica"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ej: Seguridad, Producción, Calidad"
                  />
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Nombre del instructor"
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración *
                  </label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ej: 4 horas, 2 semanas"
                  />
                </div>

                {/* Email para Reportes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Correo para Reportes Diarios
                  </label>
                  <input
                    type="email"
                    name="emailReporte"
                    value={formData.emailReporte}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="admin@empresa.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Los reportes diarios de este curso se enviarán a este correo
                  </p>
                </div>

                {/* Nivel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nivel
                  </label>
                  <select
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  >
                    <option>Principiante</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </div>

                {/* Clave Inscripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Clave de Inscripción *
                  </label>
                  <input
                    type="text"
                    name="claveInscripcion"
                    value={formData.claveInscripcion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Clave que el instructor proporcionará"
                  />
                </div>

                {/* Imagen del Curso */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Imagen del Curso (Portada)
                  </label>
                  <div className="space-y-3">
                    {!archivoImagen && !formData.imagen ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-all">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <label className="cursor-pointer">
                          <span className="text-primary-600 font-semibold hover:text-primary-700">
                            Click para subir imagen
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImagenUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Máximo 5MB • JPEG, JPG, PNG, GIF, WEBP
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Upload className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900">
                                {archivoImagen?.name || 'Imagen cargada'}
                              </p>
                              <p className="text-sm text-green-600">
                                {archivoImagen ? `${(archivoImagen.size / 1024).toFixed(2)} KB` : 'Imagen guardada'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={eliminarImagen}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Eliminar
                          </button>
                        </div>
                        {formData.imagen && (
                          <div className="mt-3">
                            <img 
                              src={formData.imagen} 
                              alt="Vista previa" 
                              className="max-h-48 rounded-lg mx-auto object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Describe el curso, objetivos, y qué aprenderán los estudiantes..."
                />
              </div>

              {/* Contenido del Curso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenido del Curso
                </label>
                <textarea
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Resumen breve de los temas que se cubrirán en el curso..."
                />
              </div>

              {/* Constructor de Curso */}
              <div className="border-t-2 border-gray-200 pt-6">
                <ConstructorCurso 
                  bloques={bloques}
                  onBloquesChange={setBloques}
                />
              </div>

              {/* Plantilla de Certificado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plantilla del Certificado (PDF o Imagen)
                </label>
                <div className="space-y-3">
                  {!archivoCertificado && !formData.certificadoTemplate ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-all">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <label className="cursor-pointer">
                        <span className="text-primary-600 font-semibold hover:text-primary-700">
                          Click para subir archivo
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleCertificadoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Máximo 5MB • PDF, JPEG, JPG, PNG, GIF, WEBP
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 text-white p-2 rounded-lg">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {archivoCertificado?.name || 'Plantilla cargada'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {archivoCertificado ? `${(archivoCertificado.size / 1024).toFixed(1)} KB` : 'Archivo guardado'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={eliminarCertificado}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {subiendoCertificado && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <p className="text-sm text-blue-700">Procesando archivo...</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  El sistema agregará automáticamente el nombre del estudiante, curso, fecha e instructor sobre tu plantilla.
                  <br/>
                  <strong>Tip:</strong> Diseña tu archivo (A4 horizontal) dejando espacio en el centro para el texto dinámico.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Save className="h-5 w-5" />
                  {modoEdicion ? 'Actualizar Curso' : 'Guardar Curso'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setModoEdicion(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Cursos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cursos Creados ({cursos.length})
          </h2>
          
          {cursos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay cursos creados aún</p>
              <p className="text-gray-400 mt-2">Crea tu primer curso usando el botón de arriba</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso) => (
                <div key={curso.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                  <div 
                    className="h-48 bg-primary-500 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.location.href = `/curso/${curso.id}?preview=true`}
                  >
                    {curso.imagen ? (
                      <img src={curso.imagen} alt={curso.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-white opacity-50" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {curso.categoria}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Cargar el curso para editar
                            try {
                              console.log('Curso a editar:', curso);
                              const bloquesData = curso.bloques && typeof curso.bloques === 'string' && curso.bloques.trim() !== '' 
                                ? JSON.parse(curso.bloques) 
                                : [];
                              
                              setFormData({
                                titulo: curso.titulo || '',
                                descripcion: curso.descripcion || '',
                                instructor: curso.instructor || '',
                                duracion: curso.duracion || '',
                                nivel: curso.nivel || 'Principiante',
                                categoria: curso.categoria || '',
                                imagen: curso.imagen || '',
                                videoUrl: curso.videoUrl || '',
                                contenido: curso.contenido || '',
                                precio: curso.precio?.toString() || '0',
                                claveInscripcion: curso.claveInscripcion || '',
                                evaluaciones: [],
                                duracionEstimada: curso.duracionEstimada || 60,
                                prerequisitos: curso.prerequisitos || '',
                                certificadoTemplate: curso.certificadoTemplate || '',
                                emailReporte: curso.emailReporte || ''
                              });
                              setBloques(bloquesData);
                              setModoEdicion(curso.id);
                              setMostrarFormulario(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } catch (error) {
                              console.error('Error al cargar curso:', error);
                              alert('Error al cargar el curso para editar: ' + error);
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Editar curso"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => eliminarCurso(curso.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Eliminar curso"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <h3 
                      className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer" 
                      onClick={() => window.location.href = `/curso/${curso.id}?preview=true`}
                    >
                      {curso.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{curso.descripcion}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <p><strong>Instructor:</strong> {curso.instructor}</p>
                      <p><strong>Duración:</strong> {curso.duracion}</p>
                      <p><strong>Nivel:</strong> {curso.nivel}</p>
                      {curso.emailReporte && (
                        <p className="text-xs text-green-600">
                          📧 {curso.emailReporte}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">Creado: {new Date(curso.createdAt || curso.fechacreacion).toLocaleDateString('es-CO')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/curso/${curso.id}?preview=true`}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
                      >
                        Ver Preview
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin/reportes?curso=${curso.id}`}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                        title="Ver reportes de este curso"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Reportes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
