import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Order } from '../../models/Order';
import { MatIcon } from "@angular/material/icon";
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, MatIcon],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent {
  @Input() order?: Order;
  _router = inject(Router); 

  handleClick(): void {
    this._router.navigate([`/perfil/pedidos/${this.order?.id}`]);
  }
}
