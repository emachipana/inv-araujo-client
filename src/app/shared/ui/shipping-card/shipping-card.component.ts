import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ShippingOption } from '../../models/ShippingOption';
import { NgClass } from '@angular/common';
import { StatusBadgeComponent } from "../status-badge/status-badge.component";

@Component({
  selector: 'app-shipping-card',
  standalone: true,
  imports: [NgClass, StatusBadgeComponent],
  templateUrl: './shipping-card.component.html',
  styleUrl: './shipping-card.component.scss'
})
export class ShippingCardComponent {
  @Input() options: ShippingOption[] = [];
  @Output() selected = new EventEmitter<"RECOJO_ALMACEN" | "ENVIO_AGENCIA">();

  onSelect(option: "RECOJO_ALMACEN" | "ENVIO_AGENCIA") {
    this.selected.emit(option);
  }
}
