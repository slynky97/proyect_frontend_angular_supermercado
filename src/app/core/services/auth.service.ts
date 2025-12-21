import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private readonly API_URL = 'http://localhost:3000';
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'current_user';

    currentUser = signal<User | null>(this.getUserFromStorage());
    isAuthenticated = signal<boolean>(!!this.getToken());

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
            .pipe(
                tap(response => {
                    // Transform user data to match our model
                    const user: User = {
                        ...response.user,
                        role: response.user.roles && response.user.roles.length > 0
                            ? response.user.roles[0]
                            : undefined
                    };

                    this.setToken(response.access_token);
                    this.setUser(user);
                    this.currentUser.set(user);
                    this.isAuthenticated.set(true);
                })
            );
    }

    validateToken(): Observable<boolean> {
        return this.http.get(`${this.API_URL}/auth/check-token`)
            .pipe(
                map(() => true),
                catchError(() => {
                    this.logout();
                    return of(false);
                })
            );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    private setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private getUserFromStorage(): User | null {
        try {
            const userStr = localStorage.getItem(this.USER_KEY);
            if (!userStr || userStr === 'undefined' || userStr === 'null') {
                return null;
            }
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user from storage:', error);
            localStorage.removeItem(this.USER_KEY);
            return null;
        }
    }

    hasRole(roleName: string): boolean {
        const user = this.currentUser();
        // Check if role object exists and matches
        if (user?.role?.name?.toLowerCase() === roleName.toLowerCase()) {
            return true;
        }
        // Check if roles array exists and contains the role
        if (user?.roles && Array.isArray(user.roles)) {
            return user.roles.some(r => r.name?.toLowerCase() === roleName.toLowerCase());
        }
        return false;
    }

    isAdmin(): boolean {
        return this.hasRole('administrador') || this.hasRole('admin') || this.hasRole('gerente');
    }

    isVendedor(): boolean {
        return this.hasRole('vendedor') || this.hasRole('venta');
    }
}
