import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../../core/services/family.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { UploadService } from '../../core/services/upload.service';
import { I18nService } from '../../core/services/i18n.service';
import { FamilyDto, FamilyUpsertDto } from '../../core/models/family.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: FamilyUpsertDto = {
  name: '',
  entrepriseId: 0,
  imageUrl: null
};

@Component({
  selector: 'app-families',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './families.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Families {
  private readonly familyService = inject(FamilyService);
  private readonly entrepriseService = inject(EntrepriseService);
  protected readonly uploadService = inject(UploadService);
  private readonly i18n = inject(I18nService);

  readonly families = signal<FamilyDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly loading = signal(true);
  readonly uploadingImage = signal(false);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<FamilyUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
  }

  load(): void {
    this.loading.set(true);
    this.familyService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.families.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  entrepriseName(entrepriseId: number): string {
    return this.entreprises().find((e) => e.id === entrepriseId)?.name ?? '';
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
    this.form.set({ ...EMPTY_FORM, entrepriseId: this.entreprises()[0]?.id ?? 0 });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(family: FamilyDto): void {
    this.editingId.set(family.id);
    this.form.set({ name: family.name, entrepriseId: family.entrepriseId, imageUrl: family.imageUrl ?? null });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingImage.set(true);
    this.uploadService.uploadImage(file, 'families').subscribe({
      next: (url) => {
        this.form.update((f) => ({ ...f, imageUrl: url }));
        this.uploadingImage.set(false);
      },
      error: () => {
        this.uploadingImage.set(false);
        this.error.set('common.error.generic');
      }
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request = id ? this.familyService.update(id, this.form()) : this.familyService.create(this.form());

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

  remove(family: FamilyDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${family.name})`)) return;
    this.familyService.delete(family.id).subscribe(() => this.load());
  }
}
