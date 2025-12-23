// User roles
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  enrolledCourses: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Course interfaces
export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: number; // in seconds
  order: number;
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    image?: string;
  };
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: Module[];
  totalDuration: number; // in seconds
  totalLessons: number;
  materials: Material[];
  rating: number;
  totalReviews: number;
  enrolledCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: number;
}

// Progress tracking
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastPosition: number; // in seconds
  completedAt?: Date;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  lessonsProgress: LessonProgress[];
  overallProgress: number; // percentage 0-100
  completedAt?: Date;
  certificateUrl?: string;
}

// Reviews
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  helpful: number;
}

// Certificate
export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  completedAt: Date;
  certificateUrl: string;
  verificationCode: string;
}

// Stats
export interface UserStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalTimeSpent: number; // in seconds
  certificatesEarned: number;
  averageProgress: number; // percentage
}
