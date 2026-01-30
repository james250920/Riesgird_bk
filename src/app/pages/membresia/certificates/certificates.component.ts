import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icons/icons.component';

interface Certificate {
  id: string;
  university: string;
  type: string;
  issueDate: Date;
  status: string;
}

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent {
  certificates = signal<Certificate[]>([
    {
      id: '1',
      university: 'Universidad Nacional Mayor de San Marcos',
      type: 'Membresía Activa',
      issueDate: new Date('2024-01-15'),
      status: 'vigente'
    },
    {
      id: '2',
      university: 'Universidad Nacional de Ingeniería',
      type: 'Membresía Activa',
      issueDate: new Date('2024-02-20'),
      status: 'vigente'
    }
  ]);

  showModal = signal(false);

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  viewCertificate(cert: Certificate): void {
    console.log('Ver certificado:', cert);
    // Aquí se implementaría la vista del certificado
  }

  downloadCertificate(cert: Certificate): void {
    console.log('Descargar certificado:', cert);
    // Aquí se implementaría la descarga del PDF
  }

  generateCertificate(): void {
    console.log('Generar nuevo certificado');
    this.openModal();
  }
}
