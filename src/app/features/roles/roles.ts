import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';
import { I18nService } from '../../core/services/i18n.service';
import { RoleDto, RoleUpsertDto, PermissionDto } from '../../core/models/role.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface FormState {
  name: string;
  description: string | null;
  permissionCodes: Set<string>;
}

const EMPTY_FORM: FormState = { name: '', description: null, permissionCodes: new Set() };

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './roles.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Roles {
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly i18n = inject(I18nService);

  readonly roles = signal<RoleDto[]>([]);
  readonly permissions = signal<PermissionDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<FormState>({ ...EMPTY_FORM, permissionCodes: new Set() });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.permissionService.getAll().subscribe((result) => this.permissions.set(result));
  }

  get permissionsByModule(): { module: string; items: PermissionDto[] }[] {
    const groups = new Map<string, PermissionDto[]>();
    for (const p of this.permissions()) {
      if (!groups.has(p.module)) groups.set(p.module, []);
      groups.get(p.module)!.push(p);
    }
    return Array.from(groups.entries()).map(([module, items]) => ({ module, items }));
  }

  load(): void {
    this.loading.set(true);
    this.roleService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.roles.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
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
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM, permissionCodes: new Set() });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(role: RoleDto): void {
    this.editingId.set(role.id);
    this.form.set({
      name: role.name,
      description: role.description ?? null,
      permissionCodes: new Set(role.permissions)
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  isChecked(code: string): boolean {
    return this.form().permissionCodes.has(code);
  }

  togglePermission(code: string, checked: boolean): void {
    this.form.update((f) => {
      const next = new Set(f.permissionCodes);
      if (checked) next.add(code);
      else next.delete(code);
      return { ...f, permissionCodes: next };
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const state = this.form();
    const permissionIds = this.permissions()
      .filter((p) => state.permissionCodes.has(p.code))
      .map((p) => p.id);

    const dto: RoleUpsertDto = { name: state.name, description: state.description, permissionIds };

    const id = this.editingId();
    const request = id ? this.roleService.update(id, dto) : this.roleService.create(dto);

    request.subscribe({
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

  remove(role: RoleDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${role.name})`)) return;
    this.roleService.delete(role.id).subscribe(() => this.load());
  }
}
