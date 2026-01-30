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

  openModal(): void {
    this.editingUser.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  editUser(user: User): void {
    this.editingUser.set(user);
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
}
