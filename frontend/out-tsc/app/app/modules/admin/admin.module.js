import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserManagementComponent } from './components/user-management.component';
let AdminModule = class AdminModule {
};
AdminModule = __decorate([
    NgModule({
        declarations: [UserManagementComponent],
        imports: [
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            RouterModule.forChild([{ path: 'users', component: UserManagementComponent }]),
        ],
    })
], AdminModule);
export { AdminModule };
//# sourceMappingURL=admin.module.js.map