// Angular imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Category {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // Function to retrieve a category based on ID
  getCategoryById(categoryId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/category/getProductById/${categoryId}`);
  }

  // Function to retrieve all categories
  getAllCategoriesNoPage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/category/getAllCategories`);
  }

  getAllCategories(pageNumber: number, pageSize: number): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/product/category/getAllCategories?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
}


  // Function to send a post request to add a new category
  addCategory(categoryData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/category/createCategory`, categoryData);
  }

  // Function to update a category based on ID
  updateCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/category/updateCategory/${categoryId}`, categoryData);
  }

  // Function to delete a category based on ID
  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/category/deleteCategory/${categoryId}`);
  }
}
