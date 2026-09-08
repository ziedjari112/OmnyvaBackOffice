import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { I18nService } from '../../core/services/i18n.service';
import { BusinessGender, BusinessType, EntrepriseDto, EntrepriseUpsertDto } from '../../core/models/entreprise.model';
import { UserDto } from '../../core/models/auth.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: EntrepriseUpsertDto = {
  name: '',
  description: null,
  address: null,
  city: null,
  phone: null,
  email: null,
  latitude: null,
  longitude: null,
  businessType: 'ServiceBased',
  gender: null,
  matriculeFiscal: '',
  registerCommerceNumber: null,
  legalForm: null,
  website: null,
  logoUrl: null
};

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './entreprises.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Entreprises {
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly i18n = inject(I18nService);

  readonly businessTypes: BusinessType[] = ['ServiceBased', 'Retail'];
  readonly genders: BusinessGender[] = ['Female', 'Male', 'Unisex'];

  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<EntrepriseUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Only relevant when creating: designates who gets the ResponsableEntreprise role for the new entreprise.
  readonly users = signal<UserDto[]>([]);
  readonly responsableUserId = signal<number | null>(null);
  private responsableRoleId: number | null = null;

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.userService.getPaged({ pageNumber: 1, pageSize: 500 }).subscribe((result) => this.users.set(result.items));
    this.roleService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => {
      this.responsableRoleId = result.items.find((r) => r.name === 'ResponsableEntreprise')?.id ?? null;
    });
  }

  load(): void {
    this.loading.set(true);
    this.entrepriseService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.entreprises.set(result.items);
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
    this.form.set({ ...EMPTY_FORM });
    this.responsableUserId.set(null);
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(entreprise: EntrepriseDto): void {
    this.editingId.set(entreprise.id);
    this.form.set({
      name: entreprise.name,
      description: entreprise.description,
      address: entreprise.address,
      city: entreprise.city,
      phone: entreprise.phone,
      email: entreprise.email,
      latitude: entreprise.latitude,
      longitude: entreprise.longitude,
      businessType: entreprise.businessType,
      gender: entreprise.gender,
      matriculeFiscal: entreprise.matriculeFiscal,
      registerCommerceNumber: entreprise.registerCommerceNumber,
      legalForm: entreprise.legalForm,
      website: entreprise.website,
      logoUrl: entreprise.logoUrl
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onBusinessTypeChange(value: BusinessType): void {
    this.form.update((f) => ({ ...f, businessType: value, gender: value === 'ServiceBased' ? (f.gender ?? 'Unisex') : null }));
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();

    if (id) {
      this.entrepriseService.update(id, this.form()).subscribe({
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
      return;
    }

    const responsableUserId = this.responsableUserId();

    this.entrepriseService.create(this.form()).subscribe({
      next: (created) => {
        if (responsableUserId && this.responsableRoleId) {
          this.userService.assignRole(responsableUserId, { roleId: this.responsableRoleId, entrepriseId: created.id }).subscribe();
        }
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

  remove(entreprise: EntrepriseDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${entreprise.name})`)) return;
    this.entrepriseService.delete(entreprise.id).subscribe(() => this.load());
  }
}
