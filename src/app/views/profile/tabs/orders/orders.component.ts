import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginatorState } from 'primeng/paginator';
import { ProfileService } from '../../../../services/profile.service';
import { Order } from '../../../../shared/models/Order';
import { SharedModule } from '../../../../shared/shared.module';
import { AuthService } from '../../../../services/auth.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { OrderCardComponent } from '../../../../shared/ui/order-card/order-card.component';

type OrderStatus = 'ENTREGADO' | 'PENDIENTE';
type OrderLocation = 'ALMACEN' | 'AGENCIA';
type ShippingType = 'RECOJO_ALMACEN' | 'ENVIO_AGENCIA';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpinnerComponent,
    OrderCardComponent
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private _profileService = inject(ProfileService);
  private _router = inject(Router);
  private _authService = inject(AuthService);
  
  orders: Order[] = [];
  loading = true;
  first: number = 0;
  rows: number = 5;
  totalRecords: number = 0;

  getStatusSeverity(status: OrderStatus | string): 'success' | 'info' | 'warn' | 'danger' | 'contrast' | 'secondary' | undefined {
    switch (status) {
      case 'PENDIENTE':
        return 'warn';
      case 'EN_PROCESO':
        return 'info';
      case 'EN_CAMINO':
        return 'info';
      case 'ENTREGADO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: OrderStatus | string): string {
    if (status === 'ENTREGADO') return 'Entregado';
    if (status === 'PENDIENTE') return 'Pendiente';
    return status;
  }

  ngOnInit(): void {
    this.loading = true;
    // Obtener el ID del usuario actual
    const clientId = this._authService.currentUser$.value?.clientId;
    
    // Llamar explícitamente a getClient para asegurar que el cliente esté cargado
    this._authService.getClient(clientId || -1).subscribe({
      next: (client) => {
        if (client && client.id) {
          this.loadOrders(0, this.rows);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar el cliente:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 5;
    this.loadOrders(event.page || 0, event.rows || 5);
  }

  loadOrders(page: number, size: number): void {
    this.loading = true;
    this._profileService.loadOrders(page, size).subscribe({
      next: (response) => {
        this.orders = response.content || [];
        this.totalRecords = response.totalElements || 0;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  viewOrderDetails(orderId: number | undefined): void {
    if (!orderId) return;
    this._router.navigate(['/perfil/pedidos', orderId]);
  }
}
