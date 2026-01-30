import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
  authService = inject(AuthService);
}
