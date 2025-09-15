import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // This URL points to your Node.js API Gateway
  private apiUrl = 'http://localhost:3000/api/users'; 

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }

  register(firstname: string, email: string, password: string): Observable<any> {
    const body = { firstname, email, password };
    const resp = this.http.post(`${this.apiUrl}/register`, body);
    console.log("Register response:", resp);
    
    return resp;
  }

  verifyAccount(email: string | null, token: string | null): Observable<any> {
  const params = { email: email ?? '', token: token ?? '' };
  console.log("Verification params:", params);
  return this.http.get(`${this.apiUrl}/verify-email`, { params });
}

}