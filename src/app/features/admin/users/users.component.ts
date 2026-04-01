import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p class="text-gray-600 mt-2">Gestión de usuarios del sistema</p>
        </div>
        <button 
          (click)="openCreateForm()"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
          + Nuevo Usuario
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <input 
            type="text" 
            [ngModel]="searchTerm()" 
            (ngModelChange)="searchTerm.set($event)"
            placeholder="Buscar por nombre o email..."
            class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <div>
          <select 
            [ngModel]="roleFilter()" 
            (ngModelChange)="roleFilter.set($event)"
            class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            @if (isGerente()) {
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            }
            <option value="Venta">Venta</option>
          </select>
        </div>
        <div class="flex items-end">
          <button 
            (click)="clearFilters()" 
            class="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-primary-600 border-b-2 border-primary-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Nombre</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Rol</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ user.name || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      {{ user.roles && user.roles.length > 0 ? user.roles[0].name : 'Sin rol' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="user.estado ? 'px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full' : 'px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full'">
                      {{ user.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm flex gap-3 items-center">
                    <button (click)="editUser(user)" class="text-primary-600 hover:text-primary-800 font-medium">
                      Editar
                    </button>
                    @if (user.roles && user.roles.length > 0 && user.roles[0].name === 'Venta') {
                      <button (click)="deleteUser(user)" class="text-red-500 hover:text-red-700 font-medium">
                        Eliminar
                      </button>
                    }
                    @if (isGerente() && user.roles && user.roles.length > 0 && user.roles[0].name === 'ADMINISTRADOR') {
                      <button (click)="deleteUser(user)" class="text-red-500 hover:text-red-700 font-medium">
                        Eliminar
                      </button>
                    }
                  </td>
                </tr>
              }
              @if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    No se encontraron usuarios con los filtros seleccionados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create/Edit User Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeForm()">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">{{ editingUser() ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
              <button (click)="closeForm()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input 
                    type="password" 
                    formControlName="password"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  @if (editingUser()) {
                    <p class="text-sm text-gray-500 mt-1">Dejar en blanco para mantener la contraseña actual.</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select 
                    formControlName="roleId"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar rol...</option>
                    @if (isGerente()) {
                      <option value="2">Administrador</option>
                    }
                    <option value="3">Venta</option>
                  </select>
                </div>

                @if (editingUser()) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                      formControlName="estado"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                }
              </div>

              <div class="mt-6 flex gap-3">
                <button 
                  type="button"
                  (click)="closeForm()"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="userForm.invalid || saving()"
                  class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ saving() ? 'Guardando...' : (editingUser() ? 'Actualizar Usuario' : 'Crear Usuario') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingUser = signal<User | null>(null);

  // Filters
  searchTerm = signal('');
  roleFilter = signal('');

  clearFilters() {
    this.searchTerm.set('');
    this.roleFilter.set('');
  }

  isGerente(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.email === 'gerente@mail.com' || this.authService.hasRole('gerente') || this.authService.hasRole('GERENTE');
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const role = this.roleFilter();

    return this.users().filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesRole = role ?
        user.roles?.some(r => r.name === role) :
        true;

      return matchesSearch && matchesRole;
    });
  });

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Password is optional for edit
      roleId: ['', Validators.required],
      estado: [true]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading.set(false);
      }
    });
  }

  openCreateForm() {
    this.editingUser.set(null);
    this.userForm.reset({ estado: true });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  editUser(user: User) {
    this.editingUser.set(user);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      roleId: user.roles && user.roles.length > 0 ? user.roles[0].id : '',
      estado: user.estado
    });
    // Password optional for edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.saving.set(true);
    const formValue = this.userForm.value;

    const userData: any = {
      name: formValue.name,
      email: formValue.email,
      roleIds: [parseInt(formValue.roleId)]
    };

    // Only send password if provided
    if (formValue.password) {
      userData.password = formValue.password;
    }

    if (this.editingUser()) {
      // Update
      userData.estado = formValue.estado;

      this.userService.update(this.editingUser()!.id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert('Error al actualizar usuario');
          this.saving.set(false);
        }
      });
    } else {
      // Create
      userData.password = formValue.password; // Required for create

      this.userService.create(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating user:', err);
          alert('Error al crear usuario: ' + (err.error?.message || 'Error desconocido'));
          this.saving.set(false);
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.name || user.email}?`)) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Error al eliminar al usuario. Es posible que tenga registros asociados.');
        }
      });
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.userForm.reset();
    this.editingUser.set(null);
    this.saving.set(false);
  }
}
