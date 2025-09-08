import { Component, Input, Output } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { OrderVariety } from '../../../shared/models/OrderVariety';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-variety',
  standalone: true,
  imports: [NgClass, MatIconModule, CurrencyPipe],
  templateUrl: './variety.component.html',
  styleUrl: './variety.component.scss'
})
export class VarietyComponent {
  @Input({required: true}) variety: OrderVariety = {id: 0, quantity: 500, variety: {id: 0, name: '', price: 0}, price: 0};
  @Input() isSelected: boolean = false;
  @Output() onClick = new EventEmitter<OrderVariety>();

  onSelect() {
    this.onClick.emit(this.variety);
  }
}
