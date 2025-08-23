import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginatorState } from 'primeng/paginator';
import { ProfileService } from '../../../../services/profile.service';
import { Order } from '../../../../shared/models/Order';
import { InvitroOrder } from '../../../../shared/models/InvitroOrder';
import { SharedModule } from '../../../../shared/shared.module';
import { AuthService } from '../../../../services/auth.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { OrderCardComponent } from '../../../../shared/ui/order-card/order-card.component';

type OrderStatus = 'ENTREGADO' | 'PENDIENTE' | 'CANCELADO' | 'PAGADO';
type OrderType = Order | InvitroOrder;

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
  vitroOrders: InvitroOrder[] = [];
  isLoading = true;
  
  // Pagination for regular orders
  firstOrders: number = 0;
  totalOrders: number = 0;
  
  // Pagination for vitro orders
  firstVitroOrders: number = 0;
  totalVitroOrders: number = 0;
  
  rows: number = 6;
  currentTab: 'orders' | 'invitro' = 'orders';

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
    this.isLoading = true;
    // Obtener el ID del usuario actual
    const clientId = this._authService.currentUser$.value?.clientId;
    
    // Llamar explícitamente a getClient para asegurar que el cliente esté cargado
    this._authService.getClient(clientId || -1).subscribe({
      next: (client) => {
        if (client && client.id) {
          this.loadOrders(0, this.rows);
          this.loadVitroOrders(0, this.rows);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar el cliente:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    if (this.currentTab === 'orders') {
      this.firstOrders = event.first || 0;
      this.loadOrders(event.page || 0, event.rows || this.rows);
    } else {
      this.firstVitroOrders = event.first || 0;
      this.loadVitroOrders(event.page || 0, event.rows || this.rows);
    }
  }

  loadOrders(page: number, size: number): void {
    this.isLoading = true;
    this._profileService.loadOrders(page, size).subscribe({
      next: (response) => {
        this.orders = response.content || [];
        this.totalOrders = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  loadVitroOrders(page: number, size: number): void {
    this.isLoading = true;
    this._profileService.loadVitroOrders(page, size).subscribe({
      next: (response) => {
        this.vitroOrders = response.content || [];
        this.totalVitroOrders = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading vitro orders:', error);
        this.isLoading = false;
      }
    });
  }

  onTabChange(): void {
    if (this.currentTab === 'orders') {
      this.firstOrders = 0;
      this.loadOrders(0, this.rows);
    } else {
      this.firstVitroOrders = 0;
      this.loadVitroOrders(0, this.rows);
    }
  }

  viewOrderDetails(orderId: number | undefined): void {
    if (!orderId) return;
    const route = this.currentTab === 'orders' 
      ? ['/perfil/pedidos', orderId]
      : ['/perfil/invitro', orderId];
    this._router.navigate(route);
  }
}
