import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Category {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getCategoryById(categoryId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/category/getProductById/${categoryId}`);
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/category/getAllCategories`);
  }

  addCategory(categoryData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/category/createCategory`, categoryData);
  }

  updateCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/category/updateCategory/${categoryId}`, categoryData);
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/category/deleteCategory/${categoryId}`);
  }
}
