export class RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    sex?: string;
    photo?: string;
    role: 'employee' | 'admin';
    isVerified: boolean;
    registeredViaExternal: boolean;
}
