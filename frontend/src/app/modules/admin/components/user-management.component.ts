// src/app/modules/admin/components/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/index';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  success = '';

  showForm = false;
  editingUser: User | null = null;
  userForm!: FormGroup;
  formLoading = false;

  apiDelay = 0;
  loadDuration = 0;
  loadStartTime = 0;

  roles = ['General User', 'Admin'] as const;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    this.initForm();
    this.loadUsers();
  }

  initForm(user?: User): void {
    this.userForm = this.fb.group({
      userId: [user?.userId ?? '', [Validators.required, Validators.minLength(3)]],
      name: [user?.name ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      role: [user?.role ?? 'General User', Validators.required],
      department: [user?.department ?? ''],
      active: [user?.active ?? true],
      password: ['', user ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }

  loadUsers(delayMs = 0): void {
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
        error: err => (this.error = err.error?.message || 'Failed to load users.'),
      });
  }

  openCreate(): void {
    this.editingUser = null;
    this.initForm();
    this.showForm = true;
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.initForm(user);
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
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
      error: err => (this.error = err.error?.message || 'Operation failed.'),
    });
  }

  toggleActive(user: User): void {
    this.userService.updateUser(user.id, { active: !user.active }).subscribe({
      next: updated => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx > -1) this.users[idx] = updated;
      },
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.success = 'User deleted successfully.';
      },
      error: err => (this.error = err.error?.message || 'Delete failed.'),
    });
  }

  reloadWithDelay(): void {
    this.loadUsers(this.apiDelay);
  }

  logout(): void {
    this.auth.logout();
  }
}
