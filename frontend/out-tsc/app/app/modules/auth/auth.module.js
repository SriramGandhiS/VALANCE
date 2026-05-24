import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './components/login.component';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    NgModule({
        declarations: [LoginComponent],
        imports: [
            CommonModule,
            ReactiveFormsModule,
            RouterModule.forChild([{ path: '', component: LoginComponent }]),
        ],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map