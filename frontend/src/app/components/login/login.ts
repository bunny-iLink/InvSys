// Angular imports
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

// Service imports
import { Auth } from '../../services/auth';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  // Login form declaration
  loginForm: FormGroup;

  // Flags
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

  // Calls login function from auth service to request token and user data. Stores data in local storage after success
  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.isLoading = true;

      this.authService
        .login(email, password)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response: any) => {
            const user = response;
            const role = user.role?.toLowerCase();

            if (user.Role === 'customer' && !user.IsVerified) {
              this.toast.showToast(
                'Error',
                'Please verify your email before logging in.',
                'error',
                3000
              );
              return; 
            }

            localStorage.setItem('user', JSON.stringify(user));

            this.toast.showToast(
              'Success',
              'Login Successful. Welcome back!',
              'success',
              3000
            );

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
