import { Component, Input } from '@angular/core';
import { OrderVariety } from '../../../../../../shared/models/OrderVariety';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-variety-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './variety-card.component.html',
  styleUrl: './variety-card.component.scss'
})
export class VarietyCardComponent {
  @Input({ required: true }) variety: OrderVariety = {
    id: 0,
    variety: {
      id: 0,
      name: "",
      price: 0,
      tuberName: "",
    },
    quantity: 0,
    price: 0,
    subTotal: 0,
  };
}
