import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  authService = inject(AuthService);
}
