import { Component, OnInit } from '@angular/core';
import { Dashboard as DashboardService } from '../../services/dashboard';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule],
})
export class Dashboard implements OnInit {
  recentSalesOrders: any[] = [];
  recentUserOrders: any[] = [];
  user: any;
  recentPurchaseOrders: any[] = [];
  selectedOrder: any = null;
  orderCounts = { ordered: 0, confirmed: 0, dispatched: 0 };
  isCustomerModalOpen = false;
  userCardData = { customers: 0, admins: 0, superadmins: 0 };
  productsCount = 0;
  lowProductsCount = 0;
  currentMonthSalesOrders = 0;
  currentMonthSalesOrdersPending = 0;
  currentMonthPurchaseOrders = 0;
  currentMonthPurchaseOrdersPending = 0;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.getUserCounts();
    this.getOrderCounts();
    this.getProductsCount();
    this.getLowProductsCount();
    this.getRecentSalesOrders();
    this.getRecentPurchaseOrders();
    this.getCurrentMonthSalesOrders();
    this.getCurrentMonthPurchaseOrders();
    this.getRecentSalesOrdersUser();
  }

  navigateTo(path: string) {
    this.router.navigate([`${this.user.role}/${path}`]);
  }

  getUserCounts() {
    this.dashboardService.getUserCounts().subscribe((data) => {
      this.userCardData = data;
    });
  }

  getCurrentMonthSalesOrders() {
    this.dashboardService.getCurrentMonthSalesOrders().subscribe((data) => {
      console.log(data);

      this.currentMonthSalesOrders = data.totalOrders;
      this.currentMonthSalesOrdersPending = data.orderedCount;
    });
  }

  getCurrentMonthPurchaseOrders() {
    this.dashboardService.getCurrentMonthPurchaseOrders().subscribe((data) => {
      console.log(data);

      this.currentMonthPurchaseOrders = data.totalOrders;
      this.currentMonthPurchaseOrdersPending = data.orderedCount;
    });
  }

  getProductsCount() {
    this.dashboardService.getProductsCount().subscribe((data) => {
      this.productsCount = data.productsCount;
    });
  }

  getLowProductsCount() {
    this.dashboardService.getLowProductsCount().subscribe((data) => {
      this.lowProductsCount = data.lowProductsCount;
    });
  }

  getRecentSalesOrders() {
    this.dashboardService.getRecentSalesOrders().subscribe((data) => {
      this.recentSalesOrders = data;
    });
  }

  getRecentSalesOrdersUser() {
    this.dashboardService
      .getRecentSalesOrdersUser(this.user?.userId)
      .subscribe((data) => {
        this.recentUserOrders = data;
        console.log(this.recentUserOrders);
        
      });
  }

  getRecentPurchaseOrders() {
    this.dashboardService
      .getRecentPurchaseOrders()
      .subscribe((data) => (this.recentPurchaseOrders = data));
  }

  getOrderCounts() {
    if (this.user?.role === 'customer') {
      this.dashboardService
        .getOrderCounts(this.user?.userId)
        .subscribe((data) => {
          this.orderCounts = data;
        });
    }
  }

  viewOrder(orderId: string) {
    this.selectedOrder = this.recentSalesOrders.find(
      (order) => order.salesOrdersId === orderId
    );

    this.isCustomerModalOpen = true;
  }

  closeModal() {
    this.isCustomerModalOpen = false;
    this.selectedOrder = null;
  }
}
