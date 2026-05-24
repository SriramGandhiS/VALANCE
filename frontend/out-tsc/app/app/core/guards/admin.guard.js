import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let AdminGuard = class AdminGuard {
    constructor(auth, router) {
        this.auth = auth;
        this.router = router;
    }
    canActivate() {
        if (!this.auth.isAuthenticated)
            return this.router.createUrlTree(['/login']);
        return this.auth.isAdmin || this.router.createUrlTree(['/dashboard']);
    }
};
AdminGuard = __decorate([
    Injectable({ providedIn: 'root' })
], AdminGuard);
export { AdminGuard };
//# sourceMappingURL=admin.guard.js.map