// Angular imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // Function to fetch user data as per userId
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUserById/${userId}`);
  }

  getAllUsersNoPage(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAllUsers`);
  }

  // Function to fetch all users
  getAllUsers(pageNumber: number, pageSize: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/getAllUsers?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  // Function to make a post request to add a user
  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, userData);
  }

  // Function to update an user based on his userId
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/editUser/${userId}`, userData);
  }

  // Function to delete a user based on his userId
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteUser/${userId}`);
  }
}
