// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, AuthState, User } from '../../shared/models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'nexus_token';
  private readonly USER_KEY = 'nexus_user';

  private authStateSubject = new BehaviorSubject<AuthState>(this.loadInitialState());
  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadInitialState(): AuthState {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      try {
        return { token, user: JSON.parse(userStr), isAuthenticated: true };
      } catch { /* fall through */ }
    }
    return { token: null, user: null, isAuthenticated: false };
  }

  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get token(): string | null {
    return this.authStateSubject.value.token;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.authStateSubject.next({ token: res.token, user: res.user, isAuthenticated: true });
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authStateSubject.next({ token: null, user: null, isAuthenticated: false });
    this.router.navigate(['/login']);
  }
}
