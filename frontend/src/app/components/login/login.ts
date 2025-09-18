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
import  {CustomToastService} from '../../services/toastr';

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

      this.authService.login(email, password).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          this.toast.showToast('Success', 'Login Successful. Welcome back!', "success", 3000);
          this.router.navigate(['/customer/dashboard']);
        },
        error: (err) => {
          this.toast.showToast('Error', 'Login Failed. Please check your credentials and try again.', "error", 3000);
          console.error('Login failed', err);
        },
      });
    }
  }
}
