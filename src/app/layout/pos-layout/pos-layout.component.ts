import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-pos-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './pos-layout.component.html',
    styleUrl: './pos-layout.component.css'
})
export class PosLayoutComponent {
    authService = inject(AuthService);

    logout() {
        this.authService.logout();
    }
}
