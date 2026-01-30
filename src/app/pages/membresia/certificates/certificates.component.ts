import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/icons/icons.component';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent {
  certificates = [
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
  ];
}
