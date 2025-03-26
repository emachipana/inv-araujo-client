import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quantity',
  standalone: true,
  imports: [],
  templateUrl: './quantity.component.html',
  styleUrl: './quantity.component.scss'
})
export class QuantityComponent {
  @Input({required: true}) num: number = 0;
  @Input({required: true}) maxQuantity: number = 0;
  @Output() onMinus = new EventEmitter<number>();
  @Output() onPlus = new EventEmitter<number>();

  handleMinus(): void {
    if(this.num <= 0) return;
    this.num--;
    this.onMinus.emit(this.num);
  }

  handlePlus(): void {
    if(this.num >= this.maxQuantity) return;
    this.num++;
    this.onPlus.emit(this.num);
  }
}
