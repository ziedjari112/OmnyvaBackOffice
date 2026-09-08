import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { FranchiseService } from '../../core/services/franchise.service';
import { I18nService } from '../../core/services/i18n.service';
import { CreateUserDto, UpdateUserDto, UserDto } from '../../core/models/auth.model';
import { RoleDto } from '../../core/models/role.model';
import { FranchiseDto } from '../../core/models/franchise.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface FormState {
  name: string;
  email: string;
  password: string;
  phoneNumber: string | null;
}

const EMPTY_FORM: FormState = { name: '', email: '', password: '', phoneNumber: null };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './users.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Users {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly franchiseService = inject(FranchiseService);
  private readonly i18n = inject(I18nService);

  readonly users = signal<UserDto[]>([]);
  readonly roles = signal<RoleDto[]>([]);
  readonly franchises = signal<FranchiseDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingUser = signal<UserDto | null>(null);
  readonly form = signal<FormState>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly newRoleId = signal<number | null>(null);
  readonly newRoleFranchiseId = signal<number | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.roleService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.roles.set(result.items));
    this.franchiseService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.franchises.set(result.items));
  }

  load(): void {
    this.loading.set(true);
    this.userService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.users.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  roleName(roleId: number): string {
    return this.roles().find((r) => r.id === roleId)?.name ?? '';
  }

  franchiseName(franchiseId: number): string {
    return this.franchises().find((f) => f.id === franchiseId)?.name ?? '';
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.pageNumber.set(1);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(), 300);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(user: UserDto): void {
    this.editingUser.set(user);
    this.form.set({ name: user.name, email: user.email, password: '', phoneNumber: user.phoneNumber ?? null });
    this.newRoleId.set(null);
    this.newRoleFranchiseId.set(null);
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const state = this.form();
    const user = this.editingUser();

    if (user) {
      const dto: UpdateUserDto = { name: state.name, email: state.email, phoneNumber: state.phoneNumber };
      this.userService.update(user.id, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('common.error.generic');
        }
      });
    } else {
      const dto: CreateUserDto = { name: state.name, email: state.email, password: state.password, phoneNumber: state.phoneNumber };
      this.userService.create(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('common.error.generic');
        }
      });
    }
  }

  addRole(): void {
    const user = this.editingUser();
    const roleId = this.newRoleId();
    if (!user || !roleId) return;

    this.userService.assignRole(user.id, { roleId, franchiseId: this.newRoleFranchiseId() }).subscribe((updated) => {
      this.editingUser.set(updated);
      this.newRoleId.set(null);
      this.newRoleFranchiseId.set(null);
      this.load();
    });
  }

  removeRole(userRoleId: number): void {
    const user = this.editingUser();
    if (!user) return;

    this.userService.removeRole(user.id, userRoleId).subscribe(() => {
      this.editingUser.set({
        ...user,
        roleAssignments: user.roleAssignments.filter((ra) => ra.id !== userRoleId)
      });
      this.load();
    });
  }

  remove(user: UserDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${user.name})`)) return;
    this.userService.delete(user.id).subscribe(() => this.load());
  }
}
