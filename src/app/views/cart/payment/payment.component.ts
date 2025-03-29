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
import { ClientRequest } from '../../../shared/models/ClientRequest';
import { departments, provinces } from '../../../data/places';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { OrderRequest } from '../../../shared/models/OrderRequest';
import { map, Observable, of, switchMap } from 'rxjs';
import { Order } from '../../../shared/models/Order';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [NgxStripeModule, StripePaymentElementComponent, StripeElementsDirective, ButtonComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @Output() onPay = new EventEmitter<Order>();
  @Input({required: true}) formExt: FormGroup | null = null;
  @Input({required: true}) documentType: "DNI" | "RUC" = "DNI";
  @Input({required: true}) shipType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN" = "RECOJO_ALMACEN";
  @Input() createAccount: boolean = false;
  @Input() isClientLoggedIn: boolean = false;
  @Input() clientId?: number;
  @Input() currentTab?: string;
  @ViewChild(StripeElementsDirective, { static: false }) stripeElements!: StripeElementsDirective;

  private _cartService = inject(CartService);
  private _paymentService = inject(PaymentService);
  private _stripeService = inject(StripeService);
  private _authService = inject(AuthService);
  private _dataService = inject(DataService);
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
    this.isLoading = true;
    let clientId: number = this.clientId ?? -1;
    const depaVal: string = this.shipType === "RECOJO_ALMACEN" ? "3655" : this.formExt?.get("department")?.value;
    const cityVal: string = this.shipType === "RECOJO_ALMACEN" ? "3656" : this.formExt?.get("city")?.value;
  
    const department: string = departments.find((dep) => dep.id_ubigeo === depaVal)?.nombre_ubigeo ?? "";
    const city: string = provinces[String(depaVal)].find((prov) => prov.id_ubigeo === cityVal)?.nombre_ubigeo ?? "";
  
    let clientObs: Observable<number>;
  
    if (!this.isClientLoggedIn) {
      const clientBody: ClientRequest = {
        email: this.formExt?.get("email")?.value,
        department,
        city,
        document: this.formExt?.get("document")?.value,
        documentType: this.documentType,
        rsocial: this.formExt?.get("rsocial")?.value,
        phone: this.formExt?.get("phone")?.value,
        createdBy: "CLIENTE",
      };
  
      clientObs = this._authService.createClient(clientBody).pipe(
        switchMap((response) => {
          const newClientId = response.id ?? 0;
  
          if (this.createAccount) {
            return this._authService
              .registerNewClient(newClientId, this.formExt?.get("password")?.value)
              .pipe(map(() => newClientId));
          }
  
          return of(newClientId);
        })
      );
    } else {
      clientObs = of(clientId);
    }
  
    clientObs
      .pipe(
        switchMap((finalClientId) => {
          const orderRequest: OrderRequest = {
            city,
            department,
            clientId: finalClientId,
            shippingType: this.shipType,
          };
          return this._dataService.createOrder(orderRequest, this._cartService.items$.value);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.onPay.emit(response);
        },
        error: (error) => {
          this.isLoading = false;
          this.toast.error(error.error.message);
        }
      });
  }
}
