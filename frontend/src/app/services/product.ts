// Angular imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // Fetch data of a product as per the productId
  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/getProductById/${productId}`);
  }

  // Fetch data of all the products
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/getAllProducts`);
  }

  // Add a product in the inventory
  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/createProduct`, productData);
  }

  // Update existing product in the inventory based on productId
  updateProduct(productId: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/updateProduct/${productId}`, productData);
  }

  // Delete an already existing product as per the productId
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/deleteProduct/${productId}`);
  }
}
