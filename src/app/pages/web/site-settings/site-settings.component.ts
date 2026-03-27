import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icons/icons.component';
import { WebAdminService } from '../../../services';

@Component({
  selector: 'app-web-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './site-settings.component.html',
  styleUrl: './site-settings.component.scss'
})
export class SiteSettingsComponent {
  private webAdminService = inject(WebAdminService);

  saveMessage = signal('');
  formData = { ...this.webAdminService.seoConfig() };

  save(): void {
    this.webAdminService.updateSeoConfig(this.formData);
    this.saveMessage.set('Configuracion web guardada correctamente.');
    setTimeout(() => this.saveMessage.set(''), 2500);
  }
}
