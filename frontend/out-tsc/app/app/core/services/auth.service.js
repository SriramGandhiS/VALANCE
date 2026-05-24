import { __decorate } from "tslib";
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
let AuthService = class AuthService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.TOKEN_KEY = 'nexus_token';
        this.USER_KEY = 'nexus_user';
        this.authStateSubject = new BehaviorSubject(this.loadInitialState());
        this.authState$ = this.authStateSubject.asObservable();
    }
    loadInitialState() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userStr = localStorage.getItem(this.USER_KEY);
        if (token && userStr) {
            try {
                return { token, user: JSON.parse(userStr), isAuthenticated: true };
            }
            catch ( /* fall through */_a) { /* fall through */ }
        }
        return { token: null, user: null, isAuthenticated: false };
    }
    get currentUser() {
        return this.authStateSubject.value.user;
    }
    get token() {
        return this.authStateSubject.value.token;
    }
    get isAuthenticated() {
        return this.authStateSubject.value.isAuthenticated;
    }
    get isAdmin() {
        var _a;
        return ((_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.role) === 'Admin';
    }
    login(payload) {
        return this.http.post(`${environment.apiUrl}/auth/login`, payload).pipe(tap(res => {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this.authStateSubject.next({ token: res.token, user: res.user, isAuthenticated: true });
        }), catchError(err => throwError(() => err)));
    }
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.authStateSubject.next({ token: null, user: null, isAuthenticated: false });
        this.router.navigate(['/login']);
    }
};
AuthService = __decorate([
    Injectable({ providedIn: 'root' })
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map