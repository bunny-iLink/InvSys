import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
})
export class Unauthorized {
  constructor(private router: Router, private authService : Auth) { }
  role = ""

  ngOnInit(): void {
    this.role = this.authService.getUserRole()!;
  }

  goToDashboard(): void {
    this.router.navigate([`/${this.role}/dashboard`]);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}