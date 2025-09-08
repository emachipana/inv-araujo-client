import { Component, Input, inject } from '@angular/core';
import { OrderVariety } from '../../../shared/models/OrderVariety';
import { CurrencyPipe } from '@angular/common';
import { QuantityComponent } from "../../../shared/ui/quantity/quantity.component";
import { InvitroService } from '../../../services/invitro.service';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-order-variety',
  standalone: true,
  imports: [CurrencyPipe, QuantityComponent, MatIcon],
  templateUrl: './order-variety.component.html',
  styleUrl: './order-variety.component.scss'
})
export class OrderVarietyComponent {
  private _invitroService = inject(InvitroService);
  
  @Input({required: true}) variety: OrderVariety = {id: 0, quantity: 500, variety: {id: 0, name: '', price: 0}, price: 0};

  onChange(newQuantity: number): void {
    if (!this.variety?.variety?.id) return;
    
    const updatedVariety = { ...this.variety, quantity: newQuantity };
    
    const currentVarieties = this._invitroService.varietiesToOrder$.value || [];
    
    const updatedVarieties = currentVarieties.map((v: OrderVariety) => 
      v.variety.id === this.variety.variety.id ? updatedVariety : v
    );
    
    this._invitroService.varietiesToOrder$.next(updatedVarieties);
  }

  remove() {
    this._invitroService.varietiesToOrder$.next(
      this._invitroService.varietiesToOrder$.value.filter(v => v.variety.id !== this.variety.variety.id)
    );
  }
}
