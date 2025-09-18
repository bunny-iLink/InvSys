export interface User {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    password: string | null;
    role: 'admin' | 'customer' | 'employee';
    isActive: boolean;
    isVerified: boolean;
}