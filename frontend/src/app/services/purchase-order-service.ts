// Angular imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  // Function to retrieve all the orders placed by inventory
  getAllOrders() {
    return this.http.get(`${this.apiUrl}/order/purchaseorder/getAllOrders`);
  }

  // Function to create a new order of a product to restock the inventory
  createPurchaseOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/purchaseorder/neworder`, order);
  }

  // Update an existing order placed by the inventory
  updatePurchaseOrder(orderId: any, order: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/order/purchaseorder/editorder/${orderId}`,
      order
    );
  }

  // Delete an order placed by the inventory based on the ID
  deletePurchaseOrder(orderId: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/order/purchaseorder/deleteorder/${orderId}`);
  }
}
