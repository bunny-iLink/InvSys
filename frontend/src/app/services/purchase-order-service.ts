import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders() {
    return this.http.get(`${this.apiUrl}/order/purchaseorder/getAllOrders`);
  }

  createPurchaseOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/purchaseorder/neworder`, order);
  }

  updatePurchaseOrder(orderId: any, order: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/order/purchaseorder/editorder/${orderId}`,
      order
    );
  }

  deletePurchaseOrder(orderId: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/order/purchaseorder/deleteorder/${orderId}`);
  }
}
