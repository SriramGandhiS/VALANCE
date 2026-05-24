import { __decorate } from "tslib";
// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
let UserService = class UserService {
    constructor(http) {
        this.http = http;
        this.base = `${environment.apiUrl}/users`;
    }
    getMyProfile() {
        return this.http.get(`${this.base}/me`);
    }
    getAllUsers(delayMs = 0) {
        const params = delayMs ? new HttpParams().set('delay', delayMs) : undefined;
        return this.http.get(this.base, { params });
    }
    createUser(payload) {
        return this.http.post(this.base, payload);
    }
    updateUser(id, payload) {
        return this.http.put(`${this.base}/${id}`, payload);
    }
    deleteUser(id) {
        return this.http.delete(`${this.base}/${id}`);
    }
};
UserService = __decorate([
    Injectable({ providedIn: 'root' })
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map