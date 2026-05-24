import { __decorate } from "tslib";
// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { throwError, catchError } from 'rxjs';
let AuthInterceptor = class AuthInterceptor {
    constructor(auth) {
        this.auth = auth;
    }
    intercept(req, next) {
        const token = this.auth.token;
        const authReq = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;
        return next.handle(authReq).pipe(catchError((err) => {
            if (err.status === 401)
                this.auth.logout();
            return throwError(() => err);
        }));
    }
};
AuthInterceptor = __decorate([
    Injectable()
], AuthInterceptor);
export { AuthInterceptor };
//# sourceMappingURL=auth.interceptor.js.map