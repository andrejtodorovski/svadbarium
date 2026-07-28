import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuService } from '../../core/services/menu.service';
import { MenuFileMeta } from '../../core/models/menu-file.model';
import { SiteNavComponent } from '../site-nav/site-nav.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { LoadErrorComponent } from '../../shared/load-error/load-error.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [SiteNavComponent, SiteFooterComponent, LoadErrorComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly menuService = inject(MenuService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly menus = signal<MenuFileMeta[]>([]);
  readonly loadFailed = signal(false);

  constructor() {
    this.loadMenus();
  }

  private loadMenus(): void {
    this.loadFailed.set(false);
    this.menuService.list().subscribe({
      next: (menus) => this.menus.set(menus),
      error: () => this.loadFailed.set(true),
    });
  }

  retry(): void {
    this.loadMenus();
  }

  fileUrl(id: number): string {
    return this.menuService.fileUrl(id);
  }

  trustedFileUrl(id: number): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl(id));
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }
}
