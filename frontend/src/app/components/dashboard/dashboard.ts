// Angular imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Service imports
import { Dashboard as DashboardService } from '../../services/dashboard';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, NgxEchartsModule],
})
export class Dashboard implements OnInit {
  // Variables to store data
  user: any;
  selectedOrder: any = null;
  recentUserOrders: any[] = [];
  recentSalesOrders: any[] = [];
  recentPurchaseOrders: any[] = [];
  orderCounts = { ordered: 0, confirmed: 0, dispatched: 0 };

  // Counter variables
  productsCount = 0;
  lowProductsCount = 0;
  currentMonthSalesOrders = 0;
  currentMonthPurchaseOrders = 0;
  currentMonthSalesOrdersPending = 0;
  currentMonthPurchaseOrdersPending = 0;
  userCardData = { customers: 0, admins: 0, superadmins: 0 };

  // Flags
  isSalesOrderModalOpen = false;

  // Chart Variables
  salesChartOptions: any;
  purchaseChartOptions: any;
  categoryChartOptions: any;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    // Fetch the dashboard data after component initializes
    this.loadCharts();
    this.getUserCounts();
    this.getOrderCounts();
    this.getProductsCount();
    this.getLowProductsCount();
    this.getRecentSalesOrders();
    this.getRecentPurchaseOrders();
    this.getRecentSalesOrdersUser();
    this.getCurrentMonthSalesOrders();
    this.getCurrentMonthPurchaseOrders();
  }

  // Use angular router to navigate to a path
  navigateTo(path: string) {
    this.router.navigate([`${this.user.role}/${path}`]);
  }

  // Retrives the count of the users as per role
  getUserCounts() {
    this.dashboardService.getUserCounts().subscribe((data) => {
      this.userCardData = data;
    });
  }

  // Retrieves the current month sales orders
  getCurrentMonthSalesOrders() {
    this.dashboardService.getCurrentMonthSalesOrders().subscribe((data) => {
      this.currentMonthSalesOrders = data.totalOrders;
      this.currentMonthSalesOrdersPending = data.orderedCount;
    });
  }

  // Retrieves current month purchases
  getCurrentMonthPurchaseOrders() {
    this.dashboardService.getCurrentMonthPurchaseOrders().subscribe((data) => {
      this.currentMonthPurchaseOrders = data.totalOrders;
      this.currentMonthPurchaseOrdersPending = data.orderedCount;
    });
  }

  // Retrieves the total products available in the inventory
  getProductsCount() {
    this.dashboardService.getProductsCount().subscribe((data) => {
      this.productsCount = data.productsCount;
    });
  }

  // Retrieves the count of the products low in stock
  getLowProductsCount() {
    this.dashboardService.getLowProductsCount().subscribe((data) => {
      this.lowProductsCount = data.lowProductsCount;
    });
  }

  // Retrieves the recent orders placed by customers (all)
  getRecentSalesOrders() {
    this.dashboardService.getRecentSalesOrders().subscribe((data) => {
      this.recentSalesOrders = data;
    });
  }

  // Retrieves the recent sales orders placed by a particular customer
  getRecentSalesOrdersUser() {
    this.dashboardService
      .getRecentSalesOrdersUser(this.user?.userId)
      .subscribe((data) => {
        this.recentUserOrders = data;
        console.log(this.recentUserOrders);
      });
  }

  // Retrieves recent purchases made by the inventory
  getRecentPurchaseOrders() {
    this.dashboardService.getRecentPurchaseOrders().subscribe((data) => {
      this.recentPurchaseOrders = data;
      console.log(this.recentPurchaseOrders);
    });
  }

  // Retrieves the number of orders placed by a customer and their status
  getOrderCounts() {
    if (this.user?.role === 'customer') {
      this.dashboardService
        .getOrderCounts(this.user?.userId)
        .subscribe((data) => {
          this.orderCounts = data;
        });
    }
  }

  // Function which opens a modal and displays an order
  viewOrder(orderId: string) {
    this.selectedOrder = this.recentSalesOrders.find(
      (order) => order.salesOrdersId === orderId
    );

    this.isSalesOrderModalOpen = true;
  }

  closeModal() {
    this.isSalesOrderModalOpen = false;
    this.selectedOrder = null;
  }

  loadMonthlySalesChart() {
    this.dashboardService.getMonthlySalesData().subscribe((data) => {
      const months = data.map((d: any) => Object.keys(d)[0]);
      const values = data.map((d: any) => Object.values(d)[0]);

      this.salesChartOptions = {
        title: { text: 'Monthly Sales (in Rs.)' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value' },
        series: [
          {
            data: values,
            type: 'line',
            smooth: false,
          },
        ],
      };
    });
  }

  loadMonthlyPurchasesChart() {
    this.dashboardService.getMonthlyPurchasesData().subscribe((data) => {
      const months = data.map((d: any) => Object.keys(d)[0]);
      const values = data.map((d: any) => Object.values(d)[0]);

      this.purchaseChartOptions = {
        title: { text: 'Monthly Purchases (in Rs.)' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value' },
        series: [
          {
            data: values,
            type: 'line',
            smooth: false,
          },
        ],
      };
    });
  }

  loadCategoryPercentages() {
    this.dashboardService.getCategoryPercentage().subscribe((data) => {
      // Transform API response to pie chart format
      const seriesData = data.map((item: any) => {
        const category = Object.keys(item)[0];
        const value = item[category];
        return { name: category, value: value };
      });

      // Set chart options
      this.categoryChartOptions = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: 'Product Categories',
            type: 'pie',
            radius: '60%',
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              formatter: '{b}: {d}%',
            },
          },
        ],
      };
    });
  }

  loadCharts() {
    this.loadMonthlySalesChart();
    this.loadCategoryPercentages();
    this.loadMonthlyPurchasesChart();
  }

  navigateToLowStock() {
    this.router.navigate(['admin/products'], {
      queryParams: { lowStock: true },
    });
  }

  onPurchaseOrderClick(orderId: number) {
    this.router.navigate(['admin/purchaseorders'], {
      queryParams: { orderId: orderId },
    });
  }

  onSalesOrderClick(orderId: number) {
    this.router.navigate(['admin/sales'], {
      queryParams: { orderId: orderId },
    });
  }
}
