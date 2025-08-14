import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quantity',
  standalone: true,
  imports: [NgClass],
  templateUrl: './quantity.component.html',
  styleUrl: './quantity.component.scss'
})
export class QuantityComponent {
  @Input() size: "sm" | "md" | "xl" = "md";
  @Input({required: true}) num: number = 0;
  @Input({required: true}) maxQuantity: number = 0;
  @Input() minQuantity: number = 1;
  @Input() addBy: number = 1;
  @Output() onMinus = new EventEmitter<number>();
  @Output() onPlus = new EventEmitter<number>();

  handleMinus(): void {
    if(this.num <= this.minQuantity) return;
    this.num -= this.addBy;
    this.onMinus.emit(this.num);
  }

  handlePlus(): void {
    if(this.num >= this.maxQuantity && this.maxQuantity > 0) return;
    this.num += this.addBy;
    this.onPlus.emit(this.num);
  }
}
