import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  imports: [CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class Verify {
  email: string | null = null;
  token: string | null = null;
  isLoading: boolean = false;
  message: string | null = null;

  constructor(private route: ActivatedRoute, private authService: Auth, private router: Router) { 
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.token = this.route.snapshot.queryParamMap.get('token');
   }

  ngOnInit(): void {
    console.log('Email:', this.email);
    console.log('Token:', this.token);
    this.isLoading = true;

    this.authService.verifyAccount(this.email, this.token).pipe(
      finalize(() => this.isLoading = false )
    ).subscribe({
      next: (response: any) => {
        console.log('Account verification successful', response);
        this.message = response.message;
        // this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        console.error('Account verification failed', err);
      },
    });
  }

}
