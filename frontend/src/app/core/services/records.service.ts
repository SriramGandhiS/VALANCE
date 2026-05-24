// src/app/core/services/records.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordsResponse, AdminSummary } from '../../shared/models/index';

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private readonly base = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  getRecords(delayMs = 0): Observable<RecordsResponse> {
    const params = delayMs ? new HttpParams().set('delay', delayMs) : undefined;
    return this.http.get<RecordsResponse>(this.base, { params });
  }

  getAdminSummary(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.base}/admin-summary`);
  }
}
