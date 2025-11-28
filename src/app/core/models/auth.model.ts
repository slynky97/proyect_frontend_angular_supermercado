export interface User {
    id: string;
    email: string;
    name?: string;
    password?: string;
    estado?: boolean;
    roles?: any[];
    // Computed property for role
    role?: {
        id: number;
        name: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}
