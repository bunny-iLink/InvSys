import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hamburger',
  imports: [CommonModule],
  templateUrl: './hamburger.html',
  styleUrl: './hamburger.css'
})
export class Hamburger {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
