// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UsersResponse } from '../../shared/models/index';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`);
  }

  getAllUsers(delayMs = 0): Observable<UsersResponse> {
    const params = delayMs ? new HttpParams().set('delay', delayMs) : undefined;
    return this.http.get<UsersResponse>(this.base, { params });
  }

  createUser(payload: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }

  updateUser(id: string, payload: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
