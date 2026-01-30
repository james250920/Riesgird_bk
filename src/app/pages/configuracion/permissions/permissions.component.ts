import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  roles = [
    { id: '1', name: 'Super Administrador', level: 'super_admin', color: '#e53e3e' },
    { id: '2', name: 'Administrador de Red', level: 'admin_red', color: '#ed8936' },
    { id: '3', name: 'Admin. Universidad', level: 'admin_universidad', color: '#4299e1' },
    { id: '4', name: 'Editor', level: 'editor', color: '#38a169' },
    { id: '5', name: 'Visualizador', level: 'viewer', color: '#718096' }
  ];
}
