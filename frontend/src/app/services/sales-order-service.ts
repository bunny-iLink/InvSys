import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders() {
    return this.http.get(`${this.apiUrl}/order/salesorder/getAllOrders`);
  }

  createSalesOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/salesorder/neworder`, order);
  }

  updateSalesOrder(orderId: any, order: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/order/salesorder/editorder/${orderId}`,
      order
    );
  }

  deleteSalesOrder(orderId: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/order/salesorder/deleteorder/${orderId}`);
  }
}
