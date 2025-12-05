import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = signal('');
    password = signal('');
    loading = signal(false);
    error = signal('');

    onSubmit() {
        if (!this.email() || !this.password()) {
            this.error.set('Por favor complete todos los campos');
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.authService.login({
            email: this.email(),
            password: this.password()
        }).subscribe({
            next: (response) => {
                this.loading.set(false);

                // Redirect based on role
                if (this.authService.isAdmin()) {
                    this.router.navigate(['/admin']);
                } else if (this.authService.isVendedor()) {
                    this.router.navigate(['/sales-manager']);
                } else {
                    this.router.navigate(['/']);
                }
            },
            error: (err) => {
                console.error('Login error:', err);
                this.loading.set(false);
                this.error.set('Credenciales inválidas. Por favor intente nuevamente.');
            }
        });
    }
}
