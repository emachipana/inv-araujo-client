import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-item',
  standalone: true,
  imports: [MatIconModule, NgClass, RouterModule],
  templateUrl: './side-item.component.html',
  styleUrl: './side-item.component.scss'
})
export class SideItemComponent {
  @Input() icon: string = "";
  @Input() name: string = "";
  @Input() currentTab: string = '';
  @Input() tabIdentifier: string = '';
  @Input() routerLink: string | string[] = '';
  @Input() isNotification: boolean = false;
  @Input() notifications: number = 0;

  constructor(private router: Router) {}

  isActive(): boolean {
    if (this.tabIdentifier === 'cuenta') {
      return !this.currentTab || this.currentTab === '';
    }
    
    if (this.tabIdentifier === 'pedidos') {
      return this.currentTab === 'pedidos' || this.currentTab.startsWith('pedidos/') || this.currentTab.startsWith('invitro/');
    }
    return this.currentTab === this.tabIdentifier;
  }

  onTabChange(): void {
    if (this.routerLink) {
      this.router.navigate(Array.isArray(this.routerLink) ? this.routerLink : [this.routerLink]);
    }
  }
}
