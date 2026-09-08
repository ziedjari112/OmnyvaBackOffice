import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { I18nService } from '../../core/services/i18n.service';
import { MenuDto, MenuUpsertDto } from '../../core/models/menu.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface FlatMenu extends MenuDto {
  depth: number;
}

const EMPTY_FORM: MenuUpsertDto = {
  name: '',
  icon: null,
  route: null,
  displayOrder: 0,
  requiredPermissionCode: null,
  parentMenuId: null
};

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './menus.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Menus {
  private readonly menuService = inject(MenuService);
  private readonly i18n = inject(I18nService);

  readonly tree = signal<MenuDto[]>([]);
  readonly loading = signal(true);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<MenuUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  get flat(): FlatMenu[] {
    const result: FlatMenu[] = [];
    const walk = (menus: MenuDto[], depth: number) => {
      for (const menu of menus) {
        result.push({ ...menu, depth });
        walk(menu.children, depth + 1);
      }
    };
    walk(this.tree(), 0);
    return result;
  }

  load(): void {
    this.loading.set(true);
    this.menuService.getAll().subscribe({
      next: (result) => {
        this.tree.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(menu: MenuDto): void {
    this.editingId.set(menu.id);
    this.form.set({
      name: menu.name,
      icon: menu.icon,
      route: menu.route,
      displayOrder: menu.displayOrder,
      requiredPermissionCode: menu.requiredPermissionCode,
      parentMenuId: menu.parentMenuId
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request = id ? this.menuService.update(id, this.form()) : this.menuService.create(this.form());

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

  remove(menu: MenuDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${menu.name})`)) return;
    this.menuService.delete(menu.id).subscribe(() => this.load());
  }
}
