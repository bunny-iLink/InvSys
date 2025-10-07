// Angular imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // This URL points to your Node.js API Gateway
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // Login function: Sends POST request with email and password and receives token and user data. Stores the data in local storage for reusing at different levels
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            userId: response.userId,
            firstName: response.firstName,
            lastName: response.lastName,
            isActive: response.isActive,
            isVerified: response.isVerified,
            email: response.email,
            role: response.role,
          })
        );
      })
    );
  }

  // Register function: Sends the firstName, Email and Password when a customer tries to register. After success, verification email will be sent to the entered email
  register(
    firstname: string,
    email: string,
    password: string
  ): Observable<any> {
    const body = { firstname, email, password };
    const resp = this.http.post(`${this.apiUrl}/register`, body);
    console.log('Register response:', resp);

    return resp;
  }

  // Verify Account function: Takes email and token from query, sends the request to backend for validation and receives the response
  verifyAccount(email: string | null, token: string | null): Observable<any> {
    const params = { email: email ?? '', token: token ?? '' };
    console.log('Verification params:', params);
    return this.http.get(`${this.apiUrl}/verify-email`, { params });
  }

  // Log Out function: Removes the token and user from local storage
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
