import { __decorate } from "tslib";
// src/app/core/services/records.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
let RecordsService = class RecordsService {
    constructor(http) {
        this.http = http;
        this.base = `${environment.apiUrl}/records`;
    }
    getRecords(delayMs = 0) {
        const params = delayMs ? new HttpParams().set('delay', delayMs) : undefined;
        return this.http.get(this.base, { params });
    }
    getAdminSummary() {
        return this.http.get(`${this.base}/admin-summary`);
    }
};
RecordsService = __decorate([
    Injectable({ providedIn: 'root' })
], RecordsService);
export { RecordsService };
//# sourceMappingURL=records.service.js.map