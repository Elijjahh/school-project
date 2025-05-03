// auth.d.ts
declare module '#auth-utils' {
  interface User {
    image: string | null;
    firstname: string;
    lastname: string;
    username: string;
    role: 'student' | 'teacher' | 'admin' | null;
    email: string;
    createdAt: Date | null;
    id: number;
    password?: string;
    bio?: string;
  }
}

export {};
