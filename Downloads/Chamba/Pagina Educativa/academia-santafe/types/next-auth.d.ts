import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'student' | 'instructor' | 'admin';
    };
  }

  interface User {
    id: string;
    role?: 'student' | 'instructor' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'student' | 'instructor' | 'admin';
  }
}
