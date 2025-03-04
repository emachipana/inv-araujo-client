import { Component, inject } from '@angular/core';
import { InfoComponent } from './info/info.component';
import { MainComponent } from "./main/main.component";
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Menu } from 'primeng/menu';
import { DataService } from '../../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { MenuItemComponent } from "../buttons/menu-item/menu-item.component";
import { SpinnerComponent } from "../spinner/spinner.component";
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [InfoComponent, MainComponent, NgClass, MatIconModule, OverlayPanelModule, Menu, MenuItemComponent, SpinnerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  router = inject(Router);
  toast = inject(HotToastService);
  _dataService = inject(DataService);
  isLoading = false;
  isMenuOpen = false;

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  openMenu(): void {
    this.isMenuOpen = true;
    
    if(this._dataService.controller.categories) return;
    this.isLoading = true;

    this._dataService.loadCategories().subscribe({
      next: ((_response) => {
        this.isLoading = false
      }),
      error: ((error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      })
    });
  }
}
