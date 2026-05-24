// src/app/modules/auth/components/login.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;
  loginForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  apiDelay = 0;

  roles = ['General User', 'Admin'] as const;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  ngAfterViewInit(): void {
    if (this.bgVideo) {
      this.bgVideo.nativeElement.muted = true;
      this.bgVideo.nativeElement.play().catch(e => console.warn('Video autoplay blocked by browser:', e));
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { userId, password, role, delay } = this.loginForm.value;

    this.auth.login({ userId, password, role, delay: Number(delay) })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.error = err.error?.message || 'Login failed. Please try again.';
        },
      });
  }

  get f() { return this.loginForm.controls; }

  fillDemo(role: 'General User' | 'Admin'): void {
    this.loginForm.patchValue({
      userId: role === 'Admin' ? 'admin01' : 'user01',
      password: role === 'Admin' ? 'admin123' : 'user123',
      role,
    });
  }
}
