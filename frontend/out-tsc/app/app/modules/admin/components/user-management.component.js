import { __decorate } from "tslib";
// src/app/modules/admin/components/user-management.component.ts
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { finalize } from 'rxjs';
let UserManagementComponent = class UserManagementComponent {
    constructor(fb, userService, auth) {
        this.fb = fb;
        this.userService = userService;
        this.auth = auth;
        this.users = [];
        this.currentUser = null;
        this.loading = false;
        this.error = '';
        this.success = '';
        this.showForm = false;
        this.editingUser = null;
        this.formLoading = false;
        this.apiDelay = 0;
        this.loadDuration = 0;
        this.loadStartTime = 0;
        this.roles = ['General User', 'Admin'];
    }
    ngOnInit() {
        this.currentUser = this.auth.currentUser;
        this.initForm();
        this.loadUsers();
    }
    initForm(user) {
        var _a, _b, _c, _d, _e, _f;
        this.userForm = this.fb.group({
            userId: [(_a = user === null || user === void 0 ? void 0 : user.userId) !== null && _a !== void 0 ? _a : '', [Validators.required, Validators.minLength(3)]],
            name: [(_b = user === null || user === void 0 ? void 0 : user.name) !== null && _b !== void 0 ? _b : '', Validators.required],
            email: [(_c = user === null || user === void 0 ? void 0 : user.email) !== null && _c !== void 0 ? _c : '', [Validators.required, Validators.email]],
            role: [(_d = user === null || user === void 0 ? void 0 : user.role) !== null && _d !== void 0 ? _d : 'General User', Validators.required],
            department: [(_e = user === null || user === void 0 ? void 0 : user.department) !== null && _e !== void 0 ? _e : ''],
            active: [(_f = user === null || user === void 0 ? void 0 : user.active) !== null && _f !== void 0 ? _f : true],
            password: ['', user ? [] : [Validators.required, Validators.minLength(6)]],
        });
    }
    loadUsers(delayMs = 0) {
        this.loading = true;
        this.error = '';
        this.loadStartTime = Date.now();
        this.userService.getAllUsers(delayMs)
            .pipe(finalize(() => {
            this.loading = false;
            this.loadDuration = Date.now() - this.loadStartTime;
        }))
            .subscribe({
            next: res => (this.users = res.users),
            error: err => { var _a; return (this.error = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to load users.'); },
        });
    }
    openCreate() {
        this.editingUser = null;
        this.initForm();
        this.showForm = true;
    }
    openEdit(user) {
        this.editingUser = user;
        this.initForm(user);
        this.showForm = true;
    }
    closeForm() {
        this.showForm = false;
        this.editingUser = null;
    }
    onSubmit() {
        if (this.userForm.invalid)
            return;
        this.formLoading = true;
        this.error = '';
        this.success = '';
        const val = this.userForm.value;
        const obs = this.editingUser
            ? this.userService.updateUser(this.editingUser.id, val)
            : this.userService.createUser(val);
        obs.pipe(finalize(() => (this.formLoading = false))).subscribe({
            next: () => {
                this.success = this.editingUser ? 'User updated successfully.' : 'User created successfully.';
                this.closeForm();
                this.loadUsers();
            },
            error: err => { var _a; return (this.error = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Operation failed.'); },
        });
    }
    toggleActive(user) {
        this.userService.updateUser(user.id, { active: !user.active }).subscribe({
            next: updated => {
                const idx = this.users.findIndex(u => u.id === updated.id);
                if (idx > -1)
                    this.users[idx] = updated;
            },
        });
    }
    deleteUser(user) {
        if (!confirm(`Delete user "${user.name}"? This cannot be undone.`))
            return;
        this.userService.deleteUser(user.id).subscribe({
            next: () => {
                this.users = this.users.filter(u => u.id !== user.id);
                this.success = 'User deleted successfully.';
            },
            error: err => { var _a; return (this.error = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Delete failed.'); },
        });
    }
    reloadWithDelay() {
        this.loadUsers(this.apiDelay);
    }
    logout() {
        this.auth.logout();
    }
};
UserManagementComponent = __decorate([
    Component({
        selector: 'app-user-management',
        templateUrl: './user-management.component.html',
        styleUrls: ['./user-management.component.scss'],
    })
], UserManagementComponent);
export { UserManagementComponent };
//# sourceMappingURL=user-management.component.js.map