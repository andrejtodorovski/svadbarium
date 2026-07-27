import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MenuService } from '../../core/services/menu.service';
import { MenuFileMeta } from '../../core/models/menu-file.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly menuService = inject(MenuService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly menus = signal<MenuFileMeta[]>([]);

  constructor() {
    this.menuService.list().subscribe((menus) => this.menus.set(menus));
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
