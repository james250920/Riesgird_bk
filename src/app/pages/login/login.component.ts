import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services';
import { IconComponent } from '../../shared/icons/icons.component';
import { finalize } from 'rxjs';

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

  loginForm = this.fb.nonNullable.group({
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
      const { email, password } = this.loginForm.getRawValue();

      this.authService
        .loginWithApi({ email, password })
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/dashboard']);
          },
          error: (error: unknown) => {
            this.errorMessage = this.authService.getApiErrorMessage(error);
          }
        });
    }
  }
}
