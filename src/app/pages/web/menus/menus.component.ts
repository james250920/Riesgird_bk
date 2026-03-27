import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icons/icons.component';
import { WebAdminService, WebMenuItem } from '../../../services';

@Component({
  selector: 'app-web-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.scss'
})
export class MenusComponent {
  private webAdminService = inject(WebAdminService);

  menuItems = this.webAdminService.menuItems;
  showModal = signal(false);

  formData = {
    label: '',
    path: '',
    order: 1,
    isVisible: true
  };

  openModal(): void {
    this.resetForm();
    this.formData.order = this.menuItems().length + 1;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveMenuItem(): void {
    if (!this.formData.label || !this.formData.path) return;

    this.webAdminService.addMenuItem(this.formData);
    this.closeModal();
  }

  toggleVisibility(item: WebMenuItem): void {
    this.webAdminService.updateMenuItem(item.id, { isVisible: !item.isVisible });
  }

  deleteMenuItem(item: WebMenuItem): void {
    if (confirm(`¿Eliminar item de menu "${item.label}"?`)) {
      this.webAdminService.deleteMenuItem(item.id);
    }
  }

  private resetForm(): void {
    this.formData = {
      label: '',
      path: '',
      order: 1,
      isVisible: true
    };
  }
}
