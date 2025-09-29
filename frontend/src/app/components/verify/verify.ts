// Angular imports
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Service imports
import { Auth } from '../../services/auth';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-verify',
  imports: [CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
})
export class Verify {
  // Variables to hold email and token t o verify
  email: string | null = null;
  token: string | null = null;
  
  // Message from backend after verification request
  message: string | null = null;
  
  // Flags
  isLoading: boolean = false;
  registerError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: Auth,
    private router: Router,
    private toast: CustomToastService
  ) {
    // Get email and token from query
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  // Call the verify account service immediately after component initializes. Show toastr based on the reponse from backend
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
