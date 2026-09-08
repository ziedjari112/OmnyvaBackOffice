import { Component, inject, signal } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { PermissionDto } from '../../core/models/role.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './permissions.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Permissions {
  private readonly permissionService = inject(PermissionService);

  readonly permissions = signal<PermissionDto[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.permissionService.getAll().subscribe({
      next: (result) => {
        this.permissions.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get byModule(): { module: string; items: PermissionDto[] }[] {
    const groups = new Map<string, PermissionDto[]>();
    for (const p of this.permissions()) {
      if (!groups.has(p.module)) groups.set(p.module, []);
      groups.get(p.module)!.push(p);
    }
    return Array.from(groups.entries()).map(([module, items]) => ({ module, items }));
  }
}
