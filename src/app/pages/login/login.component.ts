import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services';
import { IconComponent } from '../../shared/icons/icons.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Simular delay de autenticación
      setTimeout(() => {
        const { email, password } = this.loginForm.value;
        const success = this.authService.login(email!, password!);

        if (success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Credenciales inválidas. Intente nuevamente.';
        }
        this.isLoading = false;
      }, 1000);
    }
  }
}
