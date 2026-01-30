import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icons/icons.component';

interface Role {
  id: string;
  name: string;
  level: string;
  color: string;
  permissions?: {
    module: string;
    actions: string[];
  }[];
}

interface ModulePermission {
  module: string;
  label: string;
  actions: { key: string; label: string }[];
  enabled: boolean;
  selectedActions: string[];
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  roles = signal<Role[]>([
    { id: '1', name: 'Super Administrador', level: 'super_admin', color: '#e53e3e' },
    { id: '2', name: 'Administrador de Red', level: 'admin_red', color: '#ed8936' },
    { id: '3', name: 'Admin. Universidad', level: 'admin_universidad', color: '#4299e1' },
    { id: '4', name: 'Editor', level: 'editor', color: '#38a169' },
    { id: '5', name: 'Visualizador', level: 'viewer', color: '#718096' }
  ]);

  showModal = signal(false);
  selectedRole = signal<Role | null>(null);

  modulePermissions: ModulePermission[] = [
    {
      module: 'usuarios',
      label: 'Usuarios',
      actions: [
        { key: 'view', label: 'Ver' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Editar' },
        { key: 'delete', label: 'Eliminar' }
      ],
      enabled: false,
      selectedActions: []
    },
    {
      module: 'universidades',
      label: 'Universidades',
      actions: [
        { key: 'view', label: 'Ver' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Editar' },
        { key: 'delete', label: 'Eliminar' },
        { key: 'publish', label: 'Publicar' }
      ],
      enabled: false,
      selectedActions: []
    },
    {
      module: 'membresia',
      label: 'Membresía',
      actions: [
        { key: 'view', label: 'Ver' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Editar' },
        { key: 'approve', label: 'Aprobar' }
      ],
      enabled: false,
      selectedActions: []
    },
    {
      module: 'gobernanza',
      label: 'Gobernanza',
      actions: [
        { key: 'view', label: 'Ver' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Editar' },
        { key: 'delete', label: 'Eliminar' }
      ],
      enabled: false,
      selectedActions: []
    }
  ];

  configureRole(role: Role): void {
    this.selectedRole.set(role);
    this.loadRolePermissions(role);
    this.showModal.set(true);
  }

  loadRolePermissions(role: Role): void {
    // Cargar permisos actuales del rol
    this.modulePermissions.forEach(mp => {
      mp.enabled = false;
      mp.selectedActions = [];
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRole.set(null);
  }

  toggleModule(module: ModulePermission): void {
    module.enabled = !module.enabled;
    if (!module.enabled) {
      module.selectedActions = [];
    }
  }

  toggleAction(module: ModulePermission, actionKey: string): void {
    const index = module.selectedActions.indexOf(actionKey);
    if (index >= 0) {
      module.selectedActions.splice(index, 1);
    } else {
      module.selectedActions.push(actionKey);
    }
  }

  isActionSelected(module: ModulePermission, actionKey: string): boolean {
    return module.selectedActions.includes(actionKey);
  }

  savePermissions(): void {
    const role = this.selectedRole();
    if (!role) return;

    console.log('Guardando permisos para', role.name);
    console.log('Permisos:', this.modulePermissions.filter(m => m.enabled));

    this.closeModal();
  }
}
