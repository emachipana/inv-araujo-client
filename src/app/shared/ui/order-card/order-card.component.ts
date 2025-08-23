import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Order } from '../../models/Order';
import { InvitroOrder } from '../../models/InvitroOrder';
import { MatIcon } from "@angular/material/icon";
import { Router } from '@angular/router';

type OrderType = InvitroOrder | Order;

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, MatIcon],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent {
  @Input() order?: OrderType;
  @Input({required: true}) type: "order" | "invitro" = "order";
  _router = inject(Router);

  get isInvitroOrder(): boolean {
    return 'initDate' in (this.order || {});
  }

  get isFinished(): boolean {
    if(!this.order && this.type === 'order') return false;
    const order: InvitroOrder = this.order as InvitroOrder;

    return order.status === "PENDIENTE" && order.isReady;
  }

  get orderDate(): Date | string | undefined {
    if (!this.order) return undefined;
    return this.isInvitroOrder 
      ? (this.order as InvitroOrder).initDate 
      : (this.order as Order).date;
  }

  get orderTotal(): number | undefined {
    if (!this.order) return undefined;
    return this.order.total;
  }

  handleClick(): void {
    const route = this.type === 'order' 
      ? `/perfil/pedidos/${this.order?.id}`
      : `/perfil/invitro/${this.order?.id}`;
    this._router.navigate([route]);
  }
}
