import { __decorate } from "tslib";
// src/app/modules/dashboard/components/dashboard.component.ts
import { Component } from '@angular/core';
import { forkJoin, Subject, takeUntil, finalize } from 'rxjs';
let DashboardComponent = class DashboardComponent {
    constructor(auth, recordsService, userService) {
        this.auth = auth;
        this.recordsService = recordsService;
        this.userService = userService;
        this.destroy$ = new Subject();
        this.currentUser = null;
        this.records = [];
        this.adminSummary = null;
        this.recordsState = 'idle';
        this.profileState = 'idle';
        this.summaryState = 'idle';
        this.recordsError = '';
        this.apiDelay = 0;
        this.sortColumn = 'createdAt';
        this.sortDirection = 'desc';
        this.statusFilter = 'All';
        this.searchTerm = '';
        this.statuses = ['All', 'Active', 'Pending', 'Closed'];
        this.loadStartTime = 0;
        this.loadDuration = 0;
    }
    ngOnInit() {
        this.currentUser = this.auth.currentUser;
        this.loadDashboard();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    get isAdmin() {
        return this.auth.isAdmin;
    }
    loadDashboard(delayMs = 0) {
        this.loadStartTime = Date.now();
        this.recordsState = 'loading';
        this.profileState = 'loading';
        // Demonstrate async/parallel loading using forkJoin
        const requests = this.isAdmin
            ? forkJoin({
                records: this.recordsService.getRecords(delayMs),
                profile: this.userService.getMyProfile(),
                summary: this.recordsService.getAdminSummary(),
            })
            : forkJoin({
                records: this.recordsService.getRecords(delayMs),
                profile: this.userService.getMyProfile(),
            });
        requests
            .pipe(takeUntil(this.destroy$), finalize(() => {
            this.loadDuration = Date.now() - this.loadStartTime;
        }))
            .subscribe({
            next: (res) => {
                var _a, _b, _c;
                this.records = (_b = (_a = res.records) === null || _a === void 0 ? void 0 : _a.records) !== null && _b !== void 0 ? _b : [];
                this.currentUser = (_c = res.profile) !== null && _c !== void 0 ? _c : this.currentUser;
                this.recordsState = 'loaded';
                this.profileState = 'loaded';
                if (res.summary) {
                    this.adminSummary = res.summary;
                    this.summaryState = 'loaded';
                }
            },
            error: (err) => {
                var _a;
                this.recordsState = 'error';
                this.profileState = 'error';
                this.recordsError = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to load data.';
            },
        });
    }
    reloadWithDelay() {
        this.records = [];
        this.loadDashboard(this.apiDelay);
    }
    get filteredRecords() {
        let result = this.records;
        if (this.statusFilter !== 'All') {
            result = result.filter(r => r.status === this.statusFilter);
        }
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(r => r.title.toLowerCase().includes(term) || r.assignedTo.toLowerCase().includes(term));
        }
        return result.sort((a, b) => {
            var _a, _b;
            const av = (_a = a[this.sortColumn]) !== null && _a !== void 0 ? _a : '';
            const bv = (_b = b[this.sortColumn]) !== null && _b !== void 0 ? _b : '';
            return this.sortDirection === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
    }
    sortBy(col) {
        if (this.sortColumn === col) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        else {
            this.sortColumn = col;
            this.sortDirection = 'asc';
        }
    }
    logout() {
        this.auth.logout();
    }
};
DashboardComponent = __decorate([
    Component({
        selector: 'app-dashboard',
        templateUrl: './dashboard.component.html',
        styleUrls: ['./dashboard.component.scss'],
    })
], DashboardComponent);
export { DashboardComponent };
//# sourceMappingURL=dashboard.component.js.map