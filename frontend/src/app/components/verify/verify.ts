import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-verify',
  imports: [CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
})
export class Verify {
  email: string | null = null;
  token: string | null = null;
  isLoading: boolean = false;
  message: string | null = null;
  registerError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: Auth,
    private router: Router,
    private toast: CustomToastService
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  ngOnInit(): void {
    console.log('Email:', this.email);
    console.log('Token:', this.token);
    this.isLoading = true;

    this.authService
      .verifyAccount(this.email, this.token)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          console.log('Account verification successful', response);
          this.message = response.message;
          if (this.message?.includes('success')) {
            this.toast.showToast(
              'Success',
              'Account verified successfully. You can now log in.',
              'success',
              3000
            );
          } else if (this.message?.includes('info')) {
            this.toast.showToast(
              'Info',
              'Account already verified. Please log in.',
              'info',
              3000
            );
          } else {
            this.toast.showToast(
              'Error',
              'Account verification failed. Please try again.',
              'error',
              3000
            );
            this.registerError = true;
          }
        },
        error: (err) => {
          this.toast.showToast(
            'Error',
            'Something went wrong. Please try again.',
            'error',
            3000
          );
          this.registerError = true;
        },
      });
  }
}
