// src/app/modules/dashboard/components/dashboard.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { forkJoin, Subject, takeUntil, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RecordsService } from '../../../core/services/records.service';
import { UserService } from '../../../core/services/user.service';
import { User, Record, AdminSummary } from '../../../shared/models/index';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  logos = [
    { name: 'Procure', url: 'https://svgl.app/library/procure.svg', bg: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { name: 'Shopify', url: 'https://svgl.app/library/shopify.svg', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    { name: 'Blender', url: 'https://svgl.app/library/blender.svg', bg: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    { name: 'Figma', url: 'https://svgl.app/library/figma.svg', bg: 'linear-gradient(135deg, #a855f7, #c084fc)' },
    { name: 'Spotify', url: 'https://svgl.app/library/spotify.svg', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
    { name: 'Lottielab', url: 'https://svgl.app/library/lottielab.svg', bg: 'linear-gradient(135deg, #84cc16, #eab308)' },
    { name: 'Google Cloud', url: 'https://svgl.app/library/google-cloud.svg', bg: 'linear-gradient(135deg, #38bdf8, #7dd3fc)' },
    { name: 'Bing', url: 'https://svgl.app/library/bing.svg', bg: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ];

  currentUser: User | null = null;
  records: Record[] = [];
  adminSummary: AdminSummary | null = null;

  recordsState: LoadingState = 'idle';
  profileState: LoadingState = 'idle';
  summaryState: LoadingState = 'idle';

  recordsError = '';
  apiDelay = 0;

  sortColumn: keyof Record = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  statusFilter = 'All';
  searchTerm = '';

  statuses = ['All', 'Active', 'Pending', 'Closed'];
  loadStartTime = 0;
  loadDuration = 0;

  constructor(
    private auth: AuthService,
    private recordsService: RecordsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    if (this.bgVideo?.nativeElement) {
      this.bgVideo.nativeElement.play().catch(e => console.warn('Video play prevented', e));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin;
  }

  loadDashboard(delayMs = 0): void {
    this.loadStartTime = Date.now();
    this.recordsState = 'loading';
    this.profileState = 'loading';

    // Demonstrate async/parallel loading using forkJoin
    const requests: ReturnType<typeof forkJoin> = this.isAdmin
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
        next: (res: any) => {
          this.records = res.records?.records ?? [];
          this.currentUser = res.profile ?? this.currentUser;
          this.recordsState = 'loaded';
          this.profileState = 'loaded';
          if (res.summary) {
            this.adminSummary = res.summary;
            this.summaryState = 'loaded';
          }
        },
        error: (err) => {
          this.recordsState = 'error';
          this.profileState = 'error';
          this.recordsError = err.error?.message || 'Failed to load data.';
        },
      });
  }

  reloadWithDelay(): void {
    this.records = [];
    this.loadDashboard(this.apiDelay);
  }

  get filteredRecords(): Record[] {
    let result = this.records;
    if (this.statusFilter !== 'All') {
      result = result.filter(r => r.status === this.statusFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        r => r.title.toLowerCase().includes(term) || r.assignedTo.toLowerCase().includes(term)
      );
    }
    return result.sort((a, b) => {
      const av = (a as any)[this.sortColumn] ?? '';
      const bv = (b as any)[this.sortColumn] ?? '';
      return this.sortDirection === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }

  sortBy(col: keyof Record): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
