import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { NgxStripeModule, StripeService, StripeElementsDirective } from 'ngx-stripe';
import {
  injectStripe,
  StripePaymentElementComponent
} from 'ngx-stripe';
import { StripeElements, StripeElementsOptions } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../services/cart.service';
import { PaymentService } from '../../../services/payment.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { ButtonComponent } from "../../../shared/ui/buttons/button/button.component";
import { FormGroup } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { OrderRequest } from '../../../shared/models/OrderRequest';
import { Order } from '../../../shared/models/Order';
import { ReceiverInfoRequest } from '../../../shared/models/ReceiverInfoRequest';
import { PickupInfoRequest } from '../../../shared/models/PickupInfoRequest';
import { departments, provinces } from '../../../data/places';
import { AuthService } from '../../../services/auth.service';
import { InvoiceDetailRequest } from '../../../shared/models/InvoiceDetailRequest';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [NgxStripeModule, StripePaymentElementComponent, StripeElementsDirective, ButtonComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @Output() onPay = new EventEmitter<Order>();
  @Input({required: true}) invoiceDetailForm: FormGroup | null = null;
  @Input({required: true}) pickupForm: FormGroup | null = null;
  @Input({required: true}) agencyForm: FormGroup | null = null;
  @Input({required: true}) documentType: "DNI" | "RUC" = "DNI";
  @Input({required: true}) shipType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN" = "RECOJO_ALMACEN";
  @Input() updateInvoiceDetail: boolean = false;
  @Input() clientId?: number;
  @Input() invoiceDetailId?: number;
  @Input() currentTab?: string;
  @Input() clientAddress?: string;
  @Input() warehouseId: number | null = null;
  @Input() isValid: boolean = false;
  @ViewChild(StripeElementsDirective, { static: false }) stripeElements!: StripeElementsDirective;

  private _cartService = inject(CartService);
  private _paymentService = inject(PaymentService);
  private _stripeService = inject(StripeService);
  private _dataService = inject(DataService);
  private _authService = inject(AuthService);
  private toast = inject(HotToastService);

  isLoading: boolean = false;
  stripe = injectStripe(environment.stripe_public_key);
  elements!: StripeElements;

  stripeElementsOptions: StripeElementsOptions = {
    locale: 'es',
    clientSecret: "",
  };

  ngAfterViewInit(): void {
    this._stripeService.elements(this.stripeElementsOptions).subscribe((elements) => {
      if (elements) {
        this.elements = elements;
      } else {
        this.toast.error("No se pudo inicializar Stripe Elements.");
      }
    });
  }
  
  ngOnInit(): void {
    this._cartService.items$.subscribe((val) => {
      if(this.currentTab !== "checkout") return;

      const total: number = this._cartService.getTotal(val);

      if(total <= 0) return;
      
      this._paymentService.createIntent(total).subscribe({
        next: (response) => {
          const options: StripeElementsOptions = {
            locale: this.stripeElementsOptions.locale,
            clientSecret: response
          }
          
          this.stripeElementsOptions = options;
        },
        error: (error) => {
          console.error(error);
          this.toast.error(error.error.message);
        }
      });
    });
  }

  handlePay(): void {
    if (!this.clientId) {
      this.toast.error('No se pudo obtener el ID del cliente');
      return;
    }

    this.isLoading = true;

    // 1. Si hay que actualizar la factura, lo intentamos
    if (this.updateInvoiceDetail) {
      const invoiceRequest: InvoiceDetailRequest = {
        documentType: this.invoiceDetailForm?.get("documentType")?.value as "DNI" | "RUC",
        document: this.invoiceDetailForm?.get("document")?.value || "",
        rsocial: this.invoiceDetailForm?.get("rsocial")?.value || "",
        invoicePreference: this.invoiceDetailForm?.get("invoicePreference")?.value as "BOLETA" | "FACTURA",
        address: this.invoiceDetailForm?.get("address")?.value || "-"
      };

      // Usamos un temporizador para asegurar que createOrder se ejecute después
      const updateSubscription = this._authService.updateInvoiceDetail(
        invoiceRequest,
        this.clientId,
        this.invoiceDetailId || 0
      ).subscribe({
        next: () => {
          console.log('Detalle de factura actualizado correctamente');
          this.createOrder();
        },
        error: (error) => {
          console.error('Error al actualizar detalle de factura:', error);
          this.createOrder(); // Aseguramos que createOrder se ejecute
        }
      });
    } else {
      // Si no hay que actualizar la factura, creamos la orden directamente
      this.createOrder();
    }
  }

  private createOrder(): void {
    this.prepareOrderRequest().then(orderRequest => {
      this._dataService.createOrder(orderRequest, this._cartService.items$.value)
        .subscribe({
          next: (response) => {
            this.onPay.emit(response);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al crear la orden:', error);
            this.toast.error('Ocurrió un error al procesar el pago');
            this.isLoading = false;
          }
        });
    });
  }

  private prepareOrderRequest(): Promise<OrderRequest> {
    return new Promise((resolve) => {
      let receiverInfo: ReceiverInfoRequest | undefined;
      let pickupInfo: PickupInfoRequest | undefined;
      let department = "";
      let city = "";

      if (this.shipType === "ENVIO_AGENCIA") {
        receiverInfo = {
          fullName: this.agencyForm?.get('fullName')?.value,
          document: this.agencyForm?.get('dni')?.value,
          phone: this.agencyForm?.get('phone')?.value,
        };

        department = departments.find((dep) => dep.id_ubigeo === this.agencyForm?.get('department')?.value)?.nombre_ubigeo ?? "";
        city = provinces[String(this.agencyForm?.get('department')?.value)]
          .find((prov) => prov.id_ubigeo === this.agencyForm?.get('city')?.value)?.nombre_ubigeo ?? "";
      } else if (this.shipType === "RECOJO_ALMACEN") {
        pickupInfo = {
          date: this.pickupForm?.get('date')?.value,
          hour: this.pickupForm?.get('time')?.value,
        };
      }

      const orderRequest: OrderRequest = {
        clientId: this.clientId!,
        shippingType: this.shipType,
        warehouseId: this.warehouseId,
        city,
        department,
        receiverInfo,
        pickupInfo,
      };

      resolve(orderRequest);
    });
  }
}
