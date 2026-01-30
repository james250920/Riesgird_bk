import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services';
import { User } from '../../../models';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  authService = inject(AuthService);

  showModal = signal(false);
  editingUser = signal<User | null>(null);

  formData = {
    fullName: '',
    email: '',
    role: 'viewer' as User['role'],
    isActive: true
  };

  openModal(): void {
    this.editingUser.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.formData = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
    this.showModal.set(true);
  }

  deleteUser(user: User): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.fullName}?`)) {
      this.authService.deleteUser(user.id);
    }
  }

  toggleUserStatus(user: User): void {
    this.authService.updateUser(user.id, { isActive: !user.isActive });
  }

  saveUser(): void {
    if (this.editingUser()) {
      // Actualizar usuario existente
      this.authService.updateUser(this.editingUser()!.id, this.formData);
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: crypto.randomUUID(),
        ...this.formData,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.authService.addUser(newUser);
    }
    this.closeModal();
  }

  resetForm(): void {
    this.formData = {
      fullName: '',
      email: '',
      role: 'viewer',
      isActive: true
    };
  }
}
