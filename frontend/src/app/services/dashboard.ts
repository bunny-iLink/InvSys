// Angular imports
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

  // Function to retrieve user counts as per their role
  getUserCounts(): Observable<any> {
    return this.http.get(`${this.userApiUrl}/userCounts`);
  }

  // Function to retrieve the number of products in the inventory
  getProductsCount(): Observable<any> {
    return this.http.get(`${this.productApiUrl}/dashboard/getProductsCount`);
  }

  // Funtion to retrieve the current month sales
  getCurrentMonthSalesOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getCurrentMonthSalesOrders`
    );
  }

  // Function to retrieve the current month purchases
  getCurrentMonthPurchaseOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getCurrentMonthPurchaseOrders`
    );
  }

  // Function to retrieve the number of products low in stock
  getLowProductsCount(): Observable<any> {
    return this.http.get(`${this.productApiUrl}/dashboard/getLowProductsCount`);
  }

  // Funtion to retrieve most recent sales order
  getRecentSalesOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getRecentOrders`
    );
  }

  // Function to retrieve the recent purchases made by a customer using their ID
  getRecentSalesOrdersUser(id: number): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/customer/getRecentOrdersUser/${id}`
    );
  }

  // Function to retrieve the recent purchases made by the inventory
  getRecentPurchaseOrders(): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/inventory/getRecentPurchaseOrders`
    );
  }

  // Function to retrieve the number or orders placed by a customer and their status
  getOrderCounts(userId: number): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl}/order/dashboard/customer/tilesData/${userId}`
    );
  }
}
