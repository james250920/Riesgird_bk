import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AuthService,
  RoleService,
  UniversityApiItem,
  UniversityService,
  UsersService,
  UserApiItem
} from '../../../services';
import { User } from '../../../models';
import { Role } from '../../../models/roles.model';
import { IconComponent } from '../../../shared/icons/icons.component';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  authService = inject(AuthService);
  roleService = inject(RoleService);
  universityService = inject(UniversityService);
  usersService = inject(UsersService);

  showModal = signal(false);
  editingUser = signal<User | null>(null);
  users = signal<User[]>([]);
  userRoleIds = signal<Record<string, string>>({});
  roles = signal<Role[]>([]);
  universities = signal<UniversityApiItem[]>([]);
  isLoadingCatalogs = signal(false);
  isLoadingUsers = signal(false);
  isSaving = signal(false);
  saveError = signal('');
  operationNotice = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  formData = {
    email: '',
    passwordHash: '',
    fullName: '',
    photoUrl: '',
    phone: '',
    roleId: '',
    universityId: '',
    position: '',
    isActive: true
  };

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoadingUsers.set(true);

    this.usersService
      .getUsers()
      .pipe(finalize(() => this.isLoadingUsers.set(false)))
      .subscribe({
        next: (response) => {
          const usersFromApi = response.data ?? [];

          this.userRoleIds.set(
            usersFromApi.reduce<Record<string, string>>((acc, currentUser) => {
              acc[currentUser.id] = currentUser.roleId;
              return acc;
            }, {})
          );

          this.users.set(usersFromApi.map(user => this.mapApiUserToUser(user)));
        },
        error: () => {
          this.saveError.set('No se pudieron cargar los usuarios.');
        }
      });
  }

  private loadCatalogs(): void {
    this.isLoadingCatalogs.set(true);
    forkJoin({
      roles: this.roleService.getRoles(),
      universities: this.universityService.getUniversitiesApi()
    })
      .pipe(finalize(() => this.isLoadingCatalogs.set(false)))
      .subscribe({
        next: ({ roles, universities }) => {
          this.roles.set((roles.data ?? []).filter(role => role.isActive));
          this.universities.set((universities.data ?? []).filter(university => university.isActive));

          if (this.users().length) {
            this.users.update(users =>
              users.map(user => {
                const roleId = this.userRoleIds()[user.id];
                const roleName = this.roles().find(role => role.id === roleId)?.name ?? '';
                return {
                  ...user,
                  role: this.mapRoleNameToUserRole(roleName || user.role)
                };
              })
            );
          }
        },
        error: () => {
          this.saveError.set('No se pudieron cargar roles o universidades.');
        }
      });
  }

  openModal(): void {
    this.editingUser.set(null);
    this.resetForm();
    this.saveError.set('');
    if (!this.roles().length || !this.universities().length) {
      this.loadCatalogs();
    }
    this.showModal.set(true);
  }

  clearOperationNotice(): void {
    this.operationNotice.set(null);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  editUser(user: User): void {
    this.editingUser.set(user);

    const selectedRole = this.roles().find(role => this.mapRoleNameToUserRole(role.name) === user.role);

    this.formData = {
      email: user.email,
      passwordHash: '',
      fullName: user.fullName,
      photoUrl: user.photoUrl ?? '',
      phone: user.phone ?? '',
      roleId: selectedRole?.id ?? '',
      universityId: user.universityId ?? '',
      position: user.position ?? '',
      isActive: user.isActive
    };
    this.saveError.set('');
    this.showModal.set(true);
  }

  deleteUser(user: User): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.fullName}?`)) {
      this.users.update(users => users.filter(currentUser => currentUser.id !== user.id));
    }
  }

  toggleUserStatus(user: User): void {
    this.users.update(users =>
      users.map(currentUser =>
        currentUser.id === user.id
          ? { ...currentUser, isActive: !currentUser.isActive, updatedAt: new Date() }
          : currentUser
      )
    );
  }

  saveUser(): void {
    this.saveError.set('');

    const selectedRole = this.roles().find(role => role.id === this.formData.roleId);

    if (!selectedRole) {
      this.saveError.set('Debe seleccionar un rol.');
      return;
    }

    if (this.editingUser()) {
      // Actualizar usuario existente
      this.users.update(users =>
        users.map(currentUser =>
          currentUser.id === this.editingUser()!.id
            ? {
                ...currentUser,
                fullName: this.formData.fullName,
                email: this.formData.email,
                photoUrl: this.formData.photoUrl || undefined,
                phone: this.formData.phone || undefined,
                role: this.mapRoleNameToUserRole(selectedRole.name),
                universityId: this.formData.universityId || undefined,
                position: this.formData.position || undefined,
                isActive: this.formData.isActive,
                updatedAt: new Date()
              }
            : currentUser
        )
      );
      this.operationNotice.set({ type: 'success', message: 'Usuario actualizado correctamente.' });
      this.closeModal();
    } else {
      if (!this.formData.passwordHash) {
        this.saveError.set('Debe ingresar contraseña para crear el usuario.');
        return;
      }

      this.isSaving.set(true);

      this.usersService.createUser({
        email: this.formData.email,
        passwordHash: this.formData.passwordHash,
        fullName: this.formData.fullName,
        photoUrl: this.formData.photoUrl || undefined,
        phone: this.formData.phone || undefined,
        roleId: this.formData.roleId,
        universityId: this.formData.universityId || null,
        position: this.formData.position || undefined,
        isActive: this.formData.isActive,
        createdAt: new Date().toISOString()
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.operationNotice.set({
              type: 'success',
              message: response.message || 'Usuario registrado correctamente.'
            });
            this.loadUsers();
            this.closeModal();
            return;
          }

          const message = response.message || 'No se pudo crear el usuario.';
          this.saveError.set(message);
          this.operationNotice.set({ type: 'error', message });
        },
        error: (error: unknown) => {
          const message = (error as any)?.error?.message || (error as any)?.message || 'No se pudo crear el usuario.';
          this.saveError.set(message);
          this.operationNotice.set({ type: 'error', message });
        }
      });
    }
  }

  resetForm(): void {
    this.formData = {
      email: '',
      passwordHash: '',
      fullName: '',
      photoUrl: '',
      phone: '',
      roleId: '',
      universityId: '',
      position: '',
      isActive: true
    };

    const firstRole = this.roles().at(0);
    if (firstRole) {
      this.formData.roleId = firstRole.id;
    }
  }

  private mapRoleNameToUserRole(roleName: string): User['role'] {
    const normalizedName = roleName.toLowerCase();

    if (normalizedName.includes('super')) return 'super_admin';
    if (normalizedName.includes('red')) return 'admin_red';
    if (normalizedName.includes('universidad')) return 'admin_universidad';
    if (normalizedName.includes('editor')) return 'editor';

    return 'viewer';
  }

  private mapApiUserToUser(apiUser: UserApiItem): User {
    const roleName = this.roles().find(role => role.id === apiUser.roleId)?.name ?? '';

    return {
      id: apiUser.id,
      email: apiUser.email,
      fullName: apiUser.fullName,
      photoUrl: apiUser.photoUrl ?? undefined,
      phone: apiUser.phone ?? undefined,
      role: this.mapRoleNameToUserRole(roleName),
      permissions: [],
      universityId: apiUser.universityId ?? undefined,
      position: apiUser.position ?? undefined,
      isActive: apiUser.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
