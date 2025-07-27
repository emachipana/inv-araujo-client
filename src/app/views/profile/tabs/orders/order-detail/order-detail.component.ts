import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../../services/data.service';
import { Order } from '../../../../../shared/models/Order';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _dataService = inject(DataService);
  
  orderId: string = '';
  order: Order | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrderDetails();
    });
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.error = null;
    
    this._dataService.getOrderById(this.orderId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: OrderResponse) => {
          if (response.success) {
            this.order = response.data;
          } else {
            this.error = response.message || 'No se pudo cargar el pedido.';
          }
        },
        error: (error: any) => {
          console.error('Error loading order:', error);
          this.error = 'No se pudo cargar los detalles del pedido. Por favor, intente nuevamente.';
        }
      });
  }

  goBack(): void {
    this._router.navigate(['/perfil/pedidos']);
  }
}
