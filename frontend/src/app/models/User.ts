// User Model: Represents an user. Structure as per the TbUSers table
export interface User {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    password: string | null;
    role: 'admin' | 'customer' | 'employee' | 'superadmin';
    isActive: boolean;
    isVerified: boolean;
}