import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/getProductById/${productId}`);
  }

  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/getAllProducts`);
  }

  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/createProduct`, productData);
  }

  updateProduct(productId: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/updateProduct/${productId}`, productData);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/deleteProduct/${productId}`);
  }
}
