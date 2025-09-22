import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Confirm } from '../confirm/confirm';
import { User } from '../../models/User';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-hamburger',
  imports: [CommonModule, Confirm],
  templateUrl: './hamburger.html',
  styleUrl: './hamburger.css',
})
export class Hamburger {
  confirmMessage: string = '';
  showConfirm: boolean = false;
  user: User | any = {};
  showProductsDropdown = false;
  showOrdersDropdown = false;
  isCollapsed = false;
  activeMenu: string = '';

  setActive(menu: string) {
    this.activeMenu = menu;
  }

  toggleProductsDropdown() {
    this.showProductsDropdown = !this.showProductsDropdown;
  }

  toggleOrdersDropdown() {
    this.showOrdersDropdown = !this.showOrdersDropdown;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(private router: Router, private auth: Auth) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }
  }

  logout() {
    this.confirmMessage = 'Are you sure you want to logout?';
    this.showConfirm = true;
  }

  onConfirmLogout() {
    this.showConfirm = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onCancelLogout() {
    this.showConfirm = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
