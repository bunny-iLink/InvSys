import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginForm: FormGroup;
  loginError: string | null = null;
  loginSuccess: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private toast: CustomToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginError = null;
      this.loginSuccess = null;
      const { email, password } = this.loginForm.value;
      this.isLoading = true;

      this.authService
        .login(email, password)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response: any) => {
            console.log('Login response:', response);

            // The response itself is the user object
            const user = response;
            const role = user.Role?.toLowerCase() || 'customer';

            // Check if the customer is not verified
            if (user.Role === 'customer' && !user.IsVerified) {
              this.toast.showToast(
                'Error',
                'Please verify your email before logging in.',
                'error',
                3000
              );
              return; // stop further execution
            }

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(user));

            this.toast.showToast(
              'Success',
              'Login Successful. Welcome back!',
              'success',
              3000
            );

            // Navigate dynamically based on role
            this.router.navigate([`/${role}/dashboard`]);
          },
          error: (err) => {
            this.toast.showToast(
              'Error',
              'Login Failed. Please check your credentials and try again.',
              'error',
              3000
            );
            console.error('Login failed', err);
          },
        });
    }
  }
}
