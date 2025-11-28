import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/users';

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.API_URL);
    }

    getById(id: string): Observable<User> {
        return this.http.get<User>(`${this.API_URL}/${id}`);
    }

    create(user: Partial<User>): Observable<User> {
        return this.http.post<User>(this.API_URL, user);
    }

    update(id: string, user: Partial<User>): Observable<User> {
        return this.http.patch<User>(`${this.API_URL}/${id}`, user);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
