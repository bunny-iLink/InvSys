import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private userApiUrl = 'http://localhost:3000/api/users';
  private productApiUrl = 'http://localhost:3000/api/products';
  private orderApiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getUserCounts(): Observable<any> {
    return this.http.get(`${this.userApiUrl}/userCounts`);
  }

  getProductsCount(): Observable<any> {
    return this.http.get(`${this.productApiUrl}/dashboard/getProductsCount`);
  }

  getCurrentMonthSalesOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getCurrentMonthSalesOrders`
    );
  }

  getCurrentMonthPurchaseOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getCurrentMonthPurchaseOrders`
    );
  }

  getLowProductsCount(): Observable<any> {
    return this.http.get(`${this.productApiUrl}/dashboard/getLowProductsCount`);
  }

  getRecentSalesOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/customer/getRecentOrders`
    );
  }

  getRecentPurchaseOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getRecentPurchaseOrders`
    );
  }

  getOrderCounts(userId: number): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/customer/tilesData/${userId}`
    );
  }
}
