// Angular imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  // Function to fetch all the orders placed by customers
  getAllOrders(
    pageNumber: number,
    pageSize: number,
    orderId?: number
  ): Observable<any> {
    let url = `${this.apiUrl}/order/salesorder/getAllOrders?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    // Only append orderId if it exists
    if (orderId !== undefined) {
      url += `&orderId=${orderId}`;
    }
    return this.http.get(url);
  }

  // Function to create an order placed by a customer
  createSalesOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/salesorder/neworder`, order);
  }

  // Function to update the order placed by a customer
  updateSalesOrder(orderId: any, order: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/order/salesorder/editorder/${orderId}`,
      order
    );
  }

  // Function to delete an order placed by a customer
  deleteSalesOrder(orderId: any): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/order/salesorder/deleteorder/${orderId}`
    );
  }
}
