// Angular imports
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom component import
import { Confirm } from '../confirm/confirm';

// Model imports
import { User } from '../../models/User';

// Service imports
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-hamburger',
  imports: [CommonModule, Confirm],
  templateUrl: './hamburger.html',
  styleUrl: './hamburger.css',
})
export class Hamburger {
  // Variables to store confirmation message and active button string
  activeMenu: string = '';
  confirmMessage: string = '';
  
  // Variable stores the current user
  user: User | any = {};
  
  // Flags
  isCollapsed = false;
  showOrdersDropdown = false;
  showConfirm: boolean = false;
  showProductsDropdown = false;

  // Sets the active button string
  setActive(menu: string) {
    this.activeMenu = menu;
  }

  // Toggles the products dropdown
  toggleProductsDropdown() {
    this.showProductsDropdown = !this.showProductsDropdown;
  }

  // Toggles the orders dropdown
  toggleOrdersDropdown() {
    this.showOrdersDropdown = !this.showOrdersDropdown;
  }

  // Toggles the sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(private router: Router, private auth: Auth) {}

  ngOnInit(): void {
    // Set the user after component initializes
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }
  }

  // Primary logout button. Asks for confirmation
  logout() {
    this.confirmMessage = 'Are you sure you want to logout?';
    this.showConfirm = true;
  }

  // Actual logout logic. Calls the logout service and redirects to login page
  onConfirmLogout() {
    this.showConfirm = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Collapses the confirmation box when clicked "No"
  onCancelLogout() {
    this.showConfirm = false;
  }

  // Function which navigates to passed routes
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
