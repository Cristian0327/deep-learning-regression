// Tipos de datos para la plataforma

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  duration: number; // en minutos
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // en segundos
  order: number;
  resources?: Resource[];
  createdAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'video' | 'link';
  url: string;
  size?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  completedLessons: string[];
  lastAccessedLesson?: string;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  lastPosition: number; // último segundo visto
  notes?: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  timestamp: number; // segundo del video
  content: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  courseId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  completedAt: Date;
  verificationCode: string;
  certificateUrl: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  coursesCount: number;
}

export interface UploadProgress {
  file: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
