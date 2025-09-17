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
    private router: Router
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
      console.log('Email:', email, 'Password:', password);
      this.isLoading = true;

      this.authService.login(email, password).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          this.router.navigate(['/customer/dashboard']);
        },
        error: (err) => {
          this.loginError = 'Login failed. Please check your credentials and try again.';
          console.error('Login failed', err);
        },
      });
    }
  }
}
