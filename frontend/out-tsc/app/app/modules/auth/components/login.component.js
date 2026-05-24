import { __decorate } from "tslib";
// src/app/modules/auth/components/login.component.ts
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { finalize } from 'rxjs';
let LoginComponent = class LoginComponent {
    constructor(fb, auth, router) {
        this.fb = fb;
        this.auth = auth;
        this.router = router;
        this.loading = false;
        this.error = '';
        this.showPassword = false;
        this.apiDelay = 0;
        this.roles = ['General User', 'Admin'];
    }
    ngOnInit() {
        if (this.auth.isAuthenticated) {
            this.router.navigate(['/dashboard']);
            return;
        }
        this.loginForm = this.fb.group({
            userId: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['General User', Validators.required],
            delay: [0, [Validators.min(0), Validators.max(10000)]],
        });
    }
    onSubmit() {
        if (this.loginForm.invalid)
            return;
        this.loading = true;
        this.error = '';
        const { userId, password, role, delay } = this.loginForm.value;
        this.auth.login({ userId, password, role, delay: Number(delay) })
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: (err) => {
                var _a;
                this.error = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Login failed. Please try again.';
            },
        });
    }
    get f() { return this.loginForm.controls; }
    fillDemo(role) {
        this.loginForm.patchValue({
            userId: role === 'Admin' ? 'admin01' : 'user01',
            password: role === 'Admin' ? 'admin123' : 'user123',
            role,
        });
    }
};
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: './login.component.html',
        styleUrls: ['./login.component.scss'],
    })
], LoginComponent);
export { LoginComponent };
//# sourceMappingURL=login.component.js.map