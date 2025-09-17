export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string | null;
    role: 'admin' | 'customer' | 'employee';
    isActive: boolean;
    isVerified: boolean;
}