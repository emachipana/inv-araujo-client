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

  constructor(private router: Router) {}

  isActive(): boolean {
    // Special case for account tab (empty path)
    if (this.tabIdentifier === 'cuenta') {
      return !this.currentTab || this.currentTab === '';
    }
    return this.currentTab === this.tabIdentifier;
  }

  onTabChange(): void {
    if (this.routerLink) {
      this.router.navigate(Array.isArray(this.routerLink) ? this.routerLink : [this.routerLink]);
    }
  }
}
