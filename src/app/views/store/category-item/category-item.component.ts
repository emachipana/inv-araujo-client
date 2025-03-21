import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'category-item',
  standalone: true,
  imports: [NgClass, MatIconModule],
  templateUrl: './category-item.component.html',
  styleUrl: './category-item.component.scss'
})
export class CategoryItemComponent {
  @Input({required: true}) id: number = 0;
  @Input({required: true}) name: string = "";
  @Input({required: true}) currentCategory: number = 0;
  @Input({required: true}) subCategories: number = 0;

  isActive(): boolean {
    if(this.currentCategory < 0 && this.name === "Todo") return true;

    return this.id === this.currentCategory;
  }
}
