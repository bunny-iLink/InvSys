import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-hamburger',
  imports: [CommonModule, Confirm],
  templateUrl: './hamburger.html',
  styleUrl: './hamburger.css',
})
export class Hamburger {
  confirmMessage: string = '';
  showConfirm: boolean = false;

  constructor(private router: Router) {}

  logout() {
    this.confirmMessage = 'Are you sure you want to logout?';
    this.showConfirm = true;
  }

  onConfirmLogout() {
    this.showConfirm = false;
    this.router.navigate(['/login']);
  }

  onCancelLogout() {
    this.showConfirm = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
